/*
Exports:
  init(ns)
  manage_actions(ns)
  buy_augments(ns)
  update_ui(ns)
*/

/*
File to use for import when sleeve functionality IS unlocked
Functions and cost
  0 GB  init
  x GB  manage_actions
  x GB  buy_augments_sleeve
  x GB  get_number_of_sleeves
  x GB  update_ui
  4 GB  get_activity
*/

//imports
import * as common from "scripts/common.js"
//cost
import { get_augmentations_installed } from "scripts/common_cost.js"
//data
import * as data from "../data.js"
//config
import * as config from "./config.js"
//bladeburner
import * as i_bladeburner from "./bladeburner/bladeburner.js"



/*
 * Function that initialized, in this case it disables logging
 * 0 GB
 */
export function init(ns) {
    //disable logging
    ns.disableLog("sleeve.purchaseSleeveAug")
}



/**
 * Function that checks and returns the list of actions
 * Sleeves are to be divided over work (shock > karma > kills > bladeburner > faction > company > crime)
 */
function determine_actions(ns, number_of_sleeves) {
    //get player
    const player = ns.getPlayer()
    //get current actions  
    const current_actions = get_current_actions(ns, number_of_sleeves)
    //array of desired actions
    let desired_actions = new action_list(number_of_sleeves)
    //get factions
    let factions_to_work_for = get_factions_to_work_for(ns, player)
    //get companies
    let companies_to_work_for = get_companies_to_work_for(ns, player)
    //debug
    //common.log(ns,1,common.info,"factions_to_work_for: " + JSON.stringify(factions_to_work_for))
    //common.log(ns,1,common.info,"companies_to_work_for: " + JSON.stringify(companies_to_work_for))

    //check faction work
    for (const faction in factions_to_work_for) {
        //for each sleeve
        for (let index = 0; index < number_of_sleeves; index++) {
            //get current action
            const current_action = current_actions[index]
            //if sleeve is performing company work
            if (current_action.type == data.activities.faction) {
                //if working on the same faction
                if (current_action.value == faction) {
                    //assign this work to the same sleeve (keep working on this)
                    desired_actions.add_action(ns, index, current_action)
                    //stop searching
                    break
                }
            }
        }
    }

    //check company work
    for (const company in companies_to_work_for) {
        //for each sleeve
        for (let index = 0; index < number_of_sleeves; index++) {
            //get current action
            const current_action = current_actions[index]
            //if sleeve is performing company work
            if (current_action.type == data.activities.company) {
                //if working on the same faction
                if (current_action.value == company) {
                    //assign this work to the same sleeve (keep working on this)
                    desired_actions.add_action(ns, index, current_action)
                    //stop searching
                    break
                }
            }
        }
    }

    //for each sleeve
    for (let index = 0; index < number_of_sleeves; index++) {
        //get sleeve
        const sleeve = ns.sleeve.getSleeve(index)
        //check if we can do bladeburner work
        const bladeburner_action = i_bladeburner.determine_action(ns, index, desired_actions.bladeburner_contract_assigned, desired_actions.bladeburner_infiltrate_assigned)

        //if too much shock (round up for comparison)
        if (Math.max(sleeve.shock) > config.shock_maximum_desired) {
            //add action
            desired_actions.add_action(ns, index, { type: data.activities.recovery, value: " " })
        }
        //not reached target kills
        else if (player.numPeopleKilled < data.requirements.kills_for_factions) {
            //add action
            desired_actions.add_action(ns, index, { type: data.activities.crime, value: ns.enums.CrimeType.homicide })
        }
        //if we have not reached target karma
        else if (player.karma > data.requirements.karma_for_gang) {
            //add action
            desired_actions.add_action(ns, index, { type: data.activities.crime, value: ns.enums.CrimeType.mug })
        }
        //check bladeburner work
        else if (bladeburner_action.type != "DENIED") {
            //add action
            desired_actions.add_action(ns, index, bladeburner_action)
        }
        //check faction work
        else if (factions_to_work_for.length > 0) {
            //get faction
            const faction = factions_to_work_for[0]
            //add action
            const added_action = desired_actions.add_action(ns, index, { type: data.activities.faction, value: faction })
            //if added
            if (added_action) {
                //remove the faction from the lsit
                factions_to_work_for.shift()
            }
        }
        //check company work
        else if (companies_to_work_for.length > 0) {
            //get faction
            const company = companies_to_work_for[0]
            //add action
            const added_action = desired_actions.add_action(ns, index, { type: data.activities.company, value: company })
            //if added
            if (added_action) {
                //remove the faction from the lsit
                companies_to_work_for.shift()
            }
        }
        //default: set to crime
        else {
            //best crime 
            desired_actions.add_action(ns, index, { type: data.activities.crime, value: ns.enums.CrimeType.grandTheftAuto })
        }
    }

    //debug
    //common.log(ns,1,common.info, "desired_actions: " + JSON.stringify(desired_actions.list))
    //return the action list
    return desired_actions.list
}



/**
 * Function that executes the actions, if not already performing the action
 * number_of_sleeves is implicit due to desired_actions length
 */
function execute_actions(ns, desired_actions) {
    //derive the number of sleeves
    const number_of_sleeves = desired_actions.length
    //get current actions  
    const current_actions = get_current_actions(ns, number_of_sleeves)

    //for each sleeve
    for (let index = 0; index < number_of_sleeves; index++) {
        //get current action
        const current_action = current_actions[index]
        //get desired action
        const desired_action = desired_actions[index]
        //check if we need to do something
        let working_on_the_same_type = (current_action.type == desired_action.type)
        let working_on_the_same_value = (current_action.value == desired_action.value)
        //bladeburner is being difficult
        if (current_action.type == "BLADEBURNER" && working_on_the_same_value) {
            working_on_the_same_type = true

        }
        //infiltrate as well
        if (current_action.type == "INFILTRATE" && desired_action.type == "Infiltrate synthoids") {
            working_on_the_same_type = true
            working_on_the_same_value = true

        }
        //infiltrate as well
        if (current_action.type == "BLADEBURNER" && desired_action.type == "Recruitment") {
            working_on_the_same_type = true
            working_on_the_same_value = true
        }

        //if we are NOT doing the same work
        if (!working_on_the_same_type || !working_on_the_same_value) {
            //debug
            common.log(ns, 0, common.info, "Current: " + JSON.stringify(current_action) + ", desired: " + JSON.stringify(desired_action))
            //check what to do according to the index
            switch (desired_action.type) {

                //faction work
                case data.activities.faction:
                    //get faction
                    const faction = desired_action.value
                    //get work type
                    const work_type = determine_faction_work(ns.sleeve.getSleeve(index), get_faction_work_types(faction))
                    //try to prevent crashes
                    try {
                        //set to faction work
                        ns.sleeve.setToFactionWork(index, faction, work_type)
                        //if failed        
                    } catch (err) {
                        //log
                        common.log(ns, 1, common.error, "Failed to start sleeve " + index + " on faction work @ " + faction + ": " + err)
                        common.log(ns, 1, common.warning, "sleeve_actions_current: " + JSON.stringify(current_actions))
                        common.log(ns, 1, common.warning, "sleeve_actions_future: " + JSON.stringify(desired_actions))
                    }
                    //stop looking
                    break


                //company work
                case data.activities.company:
                    //get company
                    const company = desired_action.value
                    //try to prevent crashes
                    try {
                        //set to company work
                        ns.sleeve.setToCompanyWork(index, company)
                        //if failed        
                    } catch (err) {
                        //log
                        common.log(ns, 1, common.error, "Failed to start sleeve " + index + " on company work @ " + company + ": " + err)
                        common.log(ns, 1, common.warning, "sleeve_actions_current: " + JSON.stringify(current_actions))
                        common.log(ns, 1, common.warning, "sleeve_actions_future: " + JSON.stringify(desired_actions))
                    }
                    //stop looking
                    break

                //crime
                case "CRIME":
                case data.activities.crime:
                    //debug
                    common.log(ns, 0, common.info, index + "  has " + JSON.stringify(desired_action))
                    //get crime
                    const crime = desired_action.value
                    //assign to crime
                    if (!ns.sleeve.setToCommitCrime(index, crime)) {
                        //if failed, log!
                        common.log(ns, 1, common.error, "Failed to start sleeve " + index + " on crime: " + best_crime)
                    }
                    //stop looking
                    break

                //shock recovery
                case data.activities.recovery:  //properties: type
                    //start recovery
                    ns.sleeve.setToShockRecovery(index)
                    //stop looking
                    break

                //bladeburner
                case data.activities.bladeburner:  //properties: type, actionType, actionName, cyclesWorked, cyclesNeeded, nextCompletion, tasksCompleted
                case "Take on contracts":
                case "Infiltrate synthoids":
                case "Recruitment":
                case data.activities.infiltrate:  //properties: type, cyclesWorked, cyclesNeeded, nextCompletion
                    //case data.activities.support:  //support as member of bladeburner? properties: type
                    //common.log(ns,1,common.info, index + " desired_action: " + JSON.stringify(desired_action))
                    //do bladeburner stuff
                    i_bladeburner.execute_action(ns, index, desired_action)
                    //stop looking
                    break

                //not used

                //case data.activities.study: //studying
                //case data.activities.synchro: //properties: type
                //failsafe
                default:
                    //log warning
                    common.log(ns, 0, common.warning, "sleeve execute_actions - Uncaught condition: " + JSON.stringify(desired_action))
                    //stop looking
                    break
            }
        }
    }
}



/**
 * Function that collects and return the actions of the number of sleeves provided
 */
function get_current_actions(ns, number_of_sleeves) {
    //get all the current actions
    let current_actions = []
    //get all sleeve actions
    for (let index = 0; index < number_of_sleeves; index++) {
        //add activity of the specific sleeve to the list
        current_actions.push(get_activity(ns, index))
    }
    //return the list
    return current_actions
}



/**
 * Function that manages the actions of the sleeve
 *  Sleeve: 28 GB
 *      setToCommitCrime (4)
 *      setToFactionWork (4)
 *      setToCompanyWork (4)
 *      setToBladeburnerAction (4)
 *      getSleeve (4)
 *      setToShockRecovery (4)
 *      Inherited: 4 GB
 *          get_activity (4)   
 */
export function manage_actions(ns) {
    //get the number of sleeves available
    const number_of_sleeves = get_number_of_sleeves(ns)
    //get desired actions
    const desired_actions = determine_actions(ns, number_of_sleeves)
    //execute actions (both normal and bladeburner)
    execute_actions(ns, desired_actions)
}



/**
 * Function that manages the buying of augments
 * Cost: 8 GB 
 *  purchaseSleeveAug (4)
 *  getSleevePurchasableAugs (4)
 */
export function buy_augments(ns) {
    //if gang is busy with growing (and thus requiring money and blocking resets)
    if (ns.peek(common.port.block_reset_gang) == common.port_commands.block_reset) {
        //do not buy augments
        return
    }
    //for each sleeve
    for (let index = 0; index < get_number_of_sleeves(ns); index++) {
        //for each sleeve augment
        //TODO: possible to hardcode the augment list?
        //TODO: get rid of try / catch
        for (const augment of ns.sleeve.getSleevePurchasableAugs(index)) {
            try {
                //buy augment
                if (ns.sleeve.purchaseSleeveAug(index, augment.name)) {
                    common.log(ns, 1, common.success, "Bought augment '" + augment.name + "' for sleeve " + index)
                }
            } catch (error) {
                //stop
                break
            }
        }
    }
}



/**
 * Function that gives the values for UI to use
 */
export function update_ui(ns) {
    //create objects to return
    let headers = []
    let values = []
    //for each sleeve
    for (let index = 0; index < get_number_of_sleeves(ns); index++) {
        //get sleeve activity
        const activity = get_activity(ns, index)
        //add to header
        headers.push("Sleeve " + index + " (" + Math.ceil(ns.sleeve.getSleeve(index).shock) + "%)")
        //add specifics to data
        values.push(activity.type.charAt(0) + activity.type.slice(1).toLowerCase() + ": " + activity.value)
    }
    //return the data for UI
    return [headers, values]
}



/**
 * Function that reads number of sleeves from file
 * Cost: 0 GB
 */
function get_number_of_sleeves(ns) {
    //read data from file (single int)
    return JSON.parse(ns.read(common.file_num_sleeves))
}



/**
 * Function that will return information about activities of the specified sleeve
 * if index is not set, blank information is returned, otherwise sleeve information
 * Cost: 4 GB
 * Sleeve: 4 GB
 *  getTask (4)
 */
function get_activity(ns, index = -1) {
    //create a return value
    //type is work type, value is the specific name of the work
    let activity = { type: "", value: "" }
    //if player
    if (index == -1) {
        //not valid
        return activity
        //valid input
    } else {
        //get activity of sleeve
        let sleeve_activity = ns.sleeve.getTask(index)
        //if set
        if (sleeve_activity != null) {
            //depending on the type
            switch (sleeve_activity.type) {
                case data.activities.study: activity.value = sleeve_activity.classType; break
                case data.activities.company: activity.value = sleeve_activity.companyName; break
                case data.activities.crime: activity.value = sleeve_activity.crimeType; break
                case data.activities.faction: activity.value = sleeve_activity.factionName; break
                //bladeburner
                case data.activities.bladeburner:
                case data.activities.infiltrate:
                    activity.value = i_bladeburner.get_activity(ns, sleeve_activity)
                    break //only type property
                //case data.activities.support: activity.value = ""; break //only type property
                //sleeve only
                case data.activities.recovery: activity.value = ""; break //only type property
                case data.activities.synchro: activity.value = ""; break //only type property                
                default:
                    //log information
                    common.log(ns, 1, common.info, "get_activity - Uncaught condition: " + sleeve_activity.type)
                    //return immediately!
                    return activity
            }
            //set the type
            activity.type = sleeve_activity.type
        }
    }

    //return the value
    return activity
}



/**
 * Function that returns an array of available work types
 * Sadly, no easy way to directly link with using destroying the option to easily link
 */
function get_faction_work_types(faction) {
    //for each faction
    for (const faction_index in common.factions) {
        //get the faction data
        const faction_data = common.factions[faction_index]
        //if the names match
        if (faction_data.name == faction) {
            //if it has work_types
            if (Object.hasOwn(faction_data, "work_types")) {
                //return the work types
                return faction_data.work_types
            } else {
                //return empty list
                return []
            }
        }
    }
    //failsafe: return empty list
    return []
}



/**
 * Function that a boolean if enough rep is reached for a faction
 * Always returns true if faction is sector-12 (to ensure grinding for neurflux governor
 * @param {NS} ns
 */
function should_work_for_faction(ns, faction) {
    //if sector-12
    if (faction == common.factions.sector12.name) {
        //always work for neuroflux governor
        return true
    }

    //check if we need to work for faction
    if (ns.singularity.getAugmentationsFromFaction(faction).length > 0) {
        //keep track of the highest rep
        let rep_highest = -1
        //get owned augments
        let ownedAugs = get_augmentations_installed(ns)
        //for each augment of the faction
        for (let augment of ns.singularity.getAugmentationsFromFaction(faction)) {
            //if augment is not owned
            if (ownedAugs.indexOf(augment) == -1) {
                //update the highest rep if needed
                rep_highest = Math.max(rep_highest, ns.singularity.getAugmentationRepReq(augment))
            }
        }
        //return if there is enough rep (false) or if rep is still needed (true)
        return rep_highest >= ns.singularity.getFactionRep(faction)
    }
    return false
}



/**
 * Function that calculates the best faction work type
 * From: https://github.com/bitburner-official/bitburner-src/blob/dev/src/PersonObjects/formulas/reputation.ts
 * Cost: 0 GB
 */
function determine_faction_work(person, work_types) {
    //set max skill level
    const crime_skill_level_maximum = 975
    //save best rep
    let best_rep = -1
    //save best work type
    let best_work_type = work_types[0]

    //for each work_type
    for (let work_type of work_types) {
        //create variable to check later
        let rep = -1

        //check how to calculate
        switch (work_type) {
            case "field":
                rep = (0.9 *
                    (person.skills.strength +
                        person.skills.defense +
                        person.skills.dexterity +
                        person.skills.agility +
                        person.skills.charisma +
                        (person.skills.hacking + person.skills.intelligence))) / crime_skill_level_maximum / 5.5
                break

            case "hacking":
                rep = (person.skills.hacking + person.skills.intelligence / 3) / crime_skill_level_maximum
                break

            case "security":
                rep = (0.9 *
                    (person.skills.strength +
                        person.skills.defense +
                        person.skills.dexterity +
                        person.skills.agility +
                        (person.skills.hacking + person.skills.intelligence))) / crime_skill_level_maximum / 4.5
                break

            default:
                log(ns, 1, warning, "determine_faction_work - uncaught condition: " + work_type);
                break
        }
        //if the rep is better than what is saved
        if (rep > best_rep) {
            //save the work type
            best_work_type = work_type
        }
    }
    return best_work_type
}



/*
 * Function that returns the factions of which should be worked for
 */
function get_factions_to_work_for(ns, player) {
    //get a list of all factions to work for
    let factions_to_work_for = []
    //for each unlocked faction
    for (const faction of player.factions) {
        //if the faction has work types and if there are still augments available
        if ((get_faction_work_types(faction).length > 0) &&
            (should_work_for_faction(ns, faction))) {
            //add faction to the list
            factions_to_work_for.push(faction)
        }
    }
    //return the list
    return factions_to_work_for
}



/**
 * Function that returns the companies of which should be worked for
 */
function get_companies_to_work_for(ns, player) {
    //get a list of all companies to work for
    let companies_to_work_for = []
    //create list of companies and their factions
    for (const company in player.jobs) {
        //if company faction is not joined
        if (player.factions.indexOf(data.company_factions[company]) == -1) {
            //add company to the list
            companies_to_work_for.push(company)
        }
    }
    //return the list
    return companies_to_work_for
}



/**
 * Class that manages actions for all sleeves
 * Writes actions to specific sleeves, if they are not already assigned
 */
class action_list {
    /*
     * Function that creates the class and fill according to the length
     */
    constructor(number_of_sleeves) {
        //create list
        this.list = []
        //variable to check if bladeburner contract has been assigned
        this.bladeburner_contract_assigned = false
        //variable to check if bladeburner infiltrate has been assigned
        this.bladeburner_infiltrate_assigned = false
        //create filler object
        const filler_object = { type: "filler" }
        //fill the list
        for (let index = 0; index < number_of_sleeves; index++) {
            //add filler
            this.list.push(filler_object)
        }
    }



    /**
     * Function that adds an action to an index, if not already set
     */
    add_action(ns, index, action) {
        //get assigned action
        const assigned_action = this.list[index]
        //only 1 sleeve can take on contracts
        if (action.type == "Take on contracts") {
            //set flag to true
            this.bladeburner_contract_assigned = true
        }
        if (action.type == "Infiltrate synthoids") {
            //set flag to true
            this.bladeburner_infiltrate_assigned = true
        }

        //debug
        //common.log(ns,1,common.info,index + " assigned_action: " + JSON.stringify(assigned_action))
        //check if not already assigned
        if (assigned_action.type == "filler") {
            //assign action
            this.list[index] = action
            //incidate success
            return true
        }
        //indicate failure
        return false
    }

}

/*  sources: 
https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.gang.md
https://github.com/bitburner-official/bitburner-src/blob/dev/src/Gang/data/tasks.ts
https://github.com/bitburner-official/bitburner-src/blob/dev/src/Gang/Gang.ts
https://github.com/bitburner-official/bitburner-src/blob/dev/src/Gang/data/Constants.ts
*/




//common
import * as common from "../common.js"
//config
import * as config from "./config.js"
//data
import * as data from "./data.js"


//globals, to be moved inside the functions



//main function
export async function main(ns) {
    //init stuff
    await init(ns)
        
    //try to recruit new members
    await recruit_members(ns)

    //keep track of previous wanted level, to ensure the correct actions are set (not all/too many members to lower wanted)
    let previous_wanted_level = 0
    
    //infitine loop
    while (true) {
        //placed on this level, to ensure effects have occurred before assigning the next gang member
        //for every member
        for (const gang_member_name of ns.gang.getMemberNames()) {
            //try to recruit new members
            await recruit_members(ns)
            //checks for clash and sets flag
            const territory_clash = manage_territory_clash(ns)
            //manages member tasks, update wanted level
            previous_wanted_level = manage_member(ns, territory_clash, gang_member_name, previous_wanted_level)
            //wait for next update, so the effect of the task is taken into account (e.g. lowering wanted level)
            await ns.gang.nextUpdate()
            //update UI
            //updateUI(ns)
        }
    }
}



/**
 * Function to init parameters:
 * focus of the gang
 */
/** @param {NS} ns */
function init(ns) {
    //disable logging
    common.disable_logging(ns, config.log_disabled_topics)
    
    //if already in a gang
    if (ns.gang.inGang()) {
        //set clash to false
        ns.gang.setTerritoryWarfare(false)
    }

    //create a gang
    while (!createGang(ns)) {
        //wait a second
        await ns.sleep(1000 * 10)
    }

    //check if focus is set (correctly)
    if((config.focus != data.focus_area.hacking) && 
       (config.focus != data.focus_area.combat)) {
        //log failure
        common.log(ns, config.log_level, common.error, "Incorrect focus: " + config.focus)
        //stop the code
        ns.exit()
    }
    
    //log information
    common.log(ns, config.log_level, common.success, "Init complete")
}



/**
 * Function to create a gang
 */
/** @param {NS} ns */
function createGang(ns) {
    //if already in a gang
    if (ns.gang.inGang()) {
        //indicate success
        return true
    }
    //create a gang
    if (ns.gang.createGang(config.faction_gang)) {
        //log information
        common.log(ns, config.log_level, common.success, "Created gang " + config.faction_gang)
        //indicate success
        return true
    }
    //indicate failure
    return false
}



/**
 * Function that manages the tasks of the members, according the clash
 */
/** @param {NS} ns */
async function manage_member(ns, territory_clash, gang_member_name, previous_wanted_level) {
    //get information of own gang (updated)
    const gang_own = ns.gang.getGangInformation()
    //if name exisist (only changes when killed)
    if (ns.gang.getMemberNames().indexOf(gang_member_name) > -1) {
        //get information of the member 
        const gang_member = ns.gang.getMemberInformation(gang_member_name)
        //upgrade equipment
        manage_upgrades(ns, gang_member)
        //ascend to get better multipliers
        manage_ascension(ns, gang_member)
        //get the best action
        const gang_member_action = determine_member_action(ns, gang_own.wantedLevel, previous_wanted_level, territory_clash, gang_member)
        //set member to perform task
        perform_task(ns, gang_own, gang_member, gang_member_action)
        
    }
    //return wanted level
    return gang_own.wantedLevel
}



/** 
 * Function that determines the action for the specific gang member
 * @param {NS} ns */
function determine_member_action(ns, wanted_level, previous_wanted_level, territory_clash, gang_member, ) {
    //level of stat(s) to train
    let stat_to_train = 0
    //multiplier of stat(s) to traini
    let stat_multiplier_to_train = 0
    //default action
    let train_action = data.gang_task.money
    //upgrades that are in possession
    const upgrades_owned = [].concat(gang_member.upgrades, gang_member.augmentations)
    //get availaable upgrades
    const upgrades_available = get_upgrades(ns)
    
    //log information
    common.log(ns, config.log_level, common.info, "Upgrades_owned: " + upgrades_owned.length + ", upgrades_available: " + upgrades_available.length)

    //things to check for specific gang focus
    switch (config.focus) {
        //focus is combat
        case data.focus_area.combat: 
            //get the lowest level of the combat stats
            stat_to_train = Math.min(gang_member.str, gang_member.agi, gang_member.def, gang_member.dex)
            //get the lowest multiplier of the combat stats
            stat_multiplier_to_train = Math.min(gang_member.str_asc_mult, gang_member.agi_asc_mult, gang_member.def_asc_mult, gang_member.dex_asc_mult)
            //action set to train combat
            train_action = data.gang_task.train_combat
            //stop
            break

        case data.focus_area.hacking: 
            //get the hacking level
            stat_to_train = gang_member.hack
            //get the hacking multiplier
            stat_multiplier_to_train = gang_member.hack_asc_mult
            //set to training hacking
            train_action = data.gang_task.train_hacking
            //stop
            break
        
         //incorrect or undefined focus
        default:
            //log error
            common.log(ns, config.log_level, error, "Uncaught Gang focus: " + config.focus)
            //defaults to raise money / power?
            return data.gang_task.power
    }
    
    //if training level reached
    const training_level_reached = stat_to_train > config.desired_training_Level
    //if training multiplier reached
    const training_multiplier_reached = stat_multiplier_to_train < config.desired_multiplier
    //if enough members
    const gang_members_maxed = ns.gang.getMemberNames().length >= data.members_max
    //if wanted level rising
    const wanted_level_rising = wanted_level > previous_wanted_level
    //if all (desired) equipment unlocked
    const desired_upgrades_unlocked = upgrades_owned.length >= config.desired_equipment
    
    //if the desired level or mulitplier is too low
    if (!training_level_reached || !training_multiplier_reached) {
        //update UI
        common.over_write_port(ns, common.port.gang, "Training")
        //return the action
        return train_action
        
    //if not enough members unlocked
    } else if (!gang_members_maxed) {
        //update UI
        common.over_write_port(ns, common.port.gang, "Growing gang")
        //if members can be unlocked: gain reputation
        return data.gang_task.reputation
        
    //if the wanted level is rising
    } else if (wanted_level_rising) {
        //lower wanted level
        return data.gang_task.lowerWanted
        
    //if not all upgrades unlocked
    } else if (!desired_upgrades_unlocked) {
        //block resets
        common.over_write_port(ns, common.port.reset, "gang")
        //update UI
        common.over_write_port(ns, common.port.gang, "Get equipment: " + upgrades_owned.length + " / " + config.desired_equipment)
        //raise money to buy upgrades
        return data.gang_task.money
        
    //if clashing: gain territory  
    } else if (territory_clash == data.territory_clash.start ) {
        //if we are still blocking resets
        if (ns.peek(common.port.reset) == "gang") {
            //remove this message
            ns.readPort(common.port.reset)
        }
        //update UI
        common.over_write_port(ns, common.port.gang, "Territory Warfare: " + Math.round(ns.gang.getGangInformation().territory * 100) + "%")
        //perform gang war
        return data.gang_task.power
        
    //if all territory is owned: focus on getting money   
    } else if (territory_clash == data.territory_clash.complete) {
        //indicate status
        common.over_write_port(ns, common.port.gang, "Farming")
        //if we are still blocking resets
        if (ns.peek(common.port.reset) == "gang") {
            //remove this message
            ns.readPort(common.port.reset)
        }
        //raise money
        return data.gang_task.money
        
    //defaults to raise power
    } else {
        //raise power
        return data.gang_task.power
    }
}



/**
 * Function that checks and recruits members
 * @param {NS} ns
 */
async function recruit_members(ns) {
    //if a new member can be recruited
    if (ns.gang.canRecruitMember()) {
        //log information
        common.log(ns, config.log_level, common.info, "Recruiting Member")
        //get the names
        const names = ns.gang.getMemberNames()
        //for every possible member
        for (let index = 0; index < data.members_max; index++) {
            //create name
            const member_name_new = "gang_member-" + index
            //if the name does not exist
            if (names.indexOf(member_name_new) == -1) {
                //recruit a new member
                if (ns.gang.recruitMember(member_name_new)) {
                    //log information
                    common.log(ns, config.log_level, common.success, "Recruited member: '" + member_name_new + "'")
                //failed to recruit
                } else {
                    //log failure
                    common.log(ns, config.log_level, common.warning, "Failed to recruit member '" + member_name_new + "'")
                }
                return
            }
        }
        //log information
        common.log(ns, config.log_level, common.error, "Unhandled: All " + data.members_max + " members recruited?!?")
    }
    //cannot recruit member, do nothing
}



/**
 * Function that checks for other gangs and to determine if clash is needed
 * returns 1 if clash is started
 * return 2 if all territory is owned
 * @param {NS} ns
 */
function manage_territory_clash(ns) {
    //get information of own gang (updated)
    const gang_own = ns.gang.getGangInformation()
    //save information on other gangs (names)
    const other_gangs = ns.gang.getOtherGangInformation()
    //save list of other gangs which have no territory anymore (e.g. are eliminated)
    let eliminated_gangs = []
    //variable to save the best gang in
    let best_other_gang = { faction: "", power: 0 }
    //for each other gang
    for (const gang_name in other_gangs) {
        //if our own gang
        if (gang_name == gang_own.faction) { 
            //skip
            continue
        }
        //get the information
        const gang_info = other_gangs[gang_name]
        
        //if no territory (= eliminated)
        if (gang_info.territory == 0) {
            //add to the list
            eliminated_gangs.push(gang_name)
        //still territory left
        } else {
            //check if the power is higher
            if (gang_info.power > best_other_gang.power) {
                //save the information
                best_other_gang.faction = gang_name
                //save the power
                best_other_gang.power = gang_info.power
            }
        }
    }
        
    //flag for clash
    let territory_clash = data.territory_clash.stop
    //if all other gangs have no territory
    if (eliminated_gangs.length >= other_gangs.length || best_other_gang.faction == "") {
        //we've won, no further actions are needed
        territory_clash = data.territory_clash.complete
    //not all gangs are defeated
    } else {        
        //if we have more than the minimum chance
        if (ns.gang.getChanceToWinClash(best_other_gang.faction) > config.territory_clash_minimum_percentage) {
            //start clashing 
            territory_clash = data.territory_clash.start
            //log information
            common.log(ns, config.log_level, common.info, "Territory Warfare: " + Math.round(ns.gang.getGangInformation().territory * 100) + "%")
        }
    }
    //set warfare (TODO: does it matter if it is started whilst already performing warfare?)
    if (territory_clash == data.territory_clash.start) {
        //update gang stats
        ns.gang.setTerritoryWarfare(true)
    //no need to clash
    } else {
        //stop clashing
        ns.gang.setTerritoryWarfare(false)
    }
    //return the flag
    return territory_clash
}



/**
 * Function that starts a task for the given member
 * @param {NS} ns
 */
function perform_task(ns, gang_own, gang_member, task_focus) {
    //Set default task to hybrid task (Both combat and hacking)
    let task = task_focus //data.gang_task.unassigned

    //if wanted should be lowered
    if (task_focus == data.gang_task.lower_wanted) {
        //set to lowering wanted, determined by focus
        task = data.lower_wanted_action[config.focus]
    }
    /*
    //depending on the focus, set the task
    switch (task_focus) {
        //train hacking
        case data.gang_task.trainHacking: 
            //train hacking
            task = "Train Hacking"
            //stop searching
            break
        //train combat
        case data.gang_task.trainCombat: 
            //train combat
            task = "Train Combat"
            //stop 
            break
        //traing charisma
        case data.gang_task.trainCharisma: 
            //traing charisma
            task = "Train Charisma"
            //stop
            break
        //raise power
        case data.gang_task.power: 
            //raise power
            task = "Territory Warfare"
            //stop
            break
        //dependant on bitnode focus (either hacking or combat)
        case data.gang_task.lowerWanted:
            //determined by gang focus
            switch(config.focus) {
                case focus_area.hacking: 

                case focus_area.combat: 
            }
            //if hacking focus
            if (config.focus == data.focus_area.hacking) {
                //perform hacking task for wanted level
                task = "Ethical Hacking"
                //stop searching
                break
            //combat focus
            } else {
                //perform combat task for wanted level
                task = "Vigilante Justice"
                //stop searching
                break
            }
        //focus that needs to be calculated (depending on gang task focus)
        case data.gang_task.reputation:
        case data.gang_task.money:
            //get best task
            task = get_best_task(ns, gang_own, gang_member, task_focus)
            //stop
            break

        //failsafe
        default: 
            //log information
            common.log(ns, config.log_level, common.error, "performTask: unhandled condition '" + task_focus + "', defaulting to " + task)
            //stop
            break
    }
    */
    //If the member is not performing the task
    if (gang_member.task != task) {
        //set member to perform task
        ns.gang.setMemberTask(gang_member.name, task)
    }
}



/**
 * Function that gets the best task for the given type
 * https://github.com/bitburner-official/bitburner-src/blob/dev/src/Gang/gang_memberTask.ts
 * https://github.com/bitburner-official/bitburner-src/blob/dev/src/Gang/data/tasks.ts
 */
/** @param {NS} ns */
function get_best_task(ns, gang_own, gang_member, type) { //type is either "reputation" or "money"
    //get the tasks
    const tasks = get_tasks(ns)
    //variable to save task to
    let best = { name: "", value: 0 }
    //for every task
    for (const task of tasks) {
        //calculate the gains (according to the type)
        const gains = calculate_gains(ns, gang_own, gang_member, task, type)
        //if better gains        
        if (gains > best.value) {
            //save the information
            best.name = task.name
            best.value = gains
        }
    }
    //if there is a value set
    if (best.value > 0) {
        //return the best task
        return best.name
    
    //no value set
    } else {
        //if focus is combat
        if (config.focus == data.focus_area.combat) {
            //traing combat
            return data.gang_task.train_combat
        
            //if focus is hacking
        } else if (config.focus == data.focus_area.hacking) {
            //traing hacking
            return data.gang_task.train_hacking
        }
    }
}



/**
 * Function that returns the tasks available (seperated in combat and hacking)
 */
/** @param {NS} ns */
function get_tasks(ns) {
    //variable to store information to
    let task_list = { hacking: [], combat: [], }
    //for every task of the available tasks
    for (const task of ns.gang.getTaskNames()) {
        //get the stats of the task
        const stats = ns.gang.getTaskStats(task)
        
        //if only hacking
        if (stats.isHacking && !stats.isCombat) {
            //hack specific task
            task_list.hacking.push(stats)
            
        //if only combat
        } else if (!stats.isHacking && stats.isCombat) {
            //combat specific task
            task_list.combat.push(stats) 
            
        //if both hacking and combat (or neither?)
        } else if (stats.isHacking && stats.isCombat) {
            //push to hacking list
            task_list.hacking.push(stats)
            //push to combat list
            task_list.combat.push(stats)
            
        //neither combat nor hacking (should never happen)
        } else {
            //do nothing
        }
    }
    //return task list   
    return task_list[config.focus]
}



/**
 * Function that calculates the respect gain
 * TODO: is this usefull? Seems like it only checks for either rep or money? Which are their own specific tasks?
 * https://github.com/bitburner-official/bitburner-src/blob/dev/src/Gang/formulas/formulas.ts
 * TODO: fix currentNodeMults.GangSoftcap 
 * https://github.com/bitburner-official/bitburner-src/blob/dev/src/BitNode/BitNodeMultipliers.ts
 */
function calculate_gains(ns, gang, member, task, type) {
    //variable for saving type specific information
    let type_specific = {}
    //determine the multipliers
    switch (type) {
        //if reputation
        case data.gang_task.reputation: type_specific = { base: task.base_respect, stat_weight: 4, final: 11, }; break
        //if money
        case data.gang_task.money: type_specific = { base: task.base_money, stat_weight: 3.2, final: 5, }; break
        //failsafe
        default:
            return 0
    }
    //if base is 0, no need to calculate (does this hhappen???)
    if (type_specific.base === 0) {
        return 0
    }
    
    //calculate the weights of the stats
    let stat_weight =
        (task.hackWeight / 100) * member.hack +
        (task.strWeight / 100) * member.str +
        (task.defWeight / 100) * member.def +
        (task.dexWeight / 100) * member.dex +
        (task.agiWeight / 100) * member.agi +
        (task.chaWeight / 100) * member.cha
    //add the type specific multiplier and difficulty into account
    stat_weight -= typeSpecific.statWeight * task.difficulty
    //if below 0, return 0
    if (stat_weight <= 0) return 0

    //calculate the territory multiplier
    const territory_multiplier = Math.max(0.005, Math.pow(gang.territory * 100, task.territory[type]) / 100)
    //sanity check
    if (isNaN(territory_multiplier) || territoryMult <= 0) return 0
    //TODO: Properly fix
    const territory_penalty = gang.territory //(0.2 * gang.territory + 0.8) * currentNodeMults.GangSoftcap
    const respect_multiplier = gang.respect / (gang.respect + gang.wantedLevel) //calculateWantedPenalty(gang)

    //final calulcation
    return Math.pow(5 * typeSpecific.base * statWeight * territory_multiplier * respect_multiplier, territory_penalty)
}



/**
 * function that manages upgrades of the gang member
 * https://github.com/bitburner-official/bitburner-src/blob/dev/src/Gang/gang_memberUpgrade.ts
 * https://github.com/bitburner-official/bitburner-src/blob/dev/src/Gang/gang_memberUpgrades.ts
 * https://github.com/bitburner-official/bitburner-src/blob/dev/src/Gang/data/upgrades.ts
 * 
 * every augment will result into lower ascension points (95%)
 * need to use??
 *  getInstallResult(memberName) 	            Get the effect of an install on ascension multipliers without installing.
 */
function manage_upgrades(ns, gang_member) {
    //get all owned upgrades (augments and equipment)
    const owned_upgrades = gang_member.augmentations.concat(gang_member.upgrades)
    //for every available equipment
    for (const equipment_name of get_upgrades(ns)) {
        //if not owned
        if (owned_upgrades.indexOf(equipment_name) == -1) {
            //buy it
            ns.gang.purchaseEquipment(gang_member.name, equipment_name)
        }
    }
}



/**
 * function that manages augments and ascension of the gang member
 * https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.gang_memberascension.md
 * https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.gang_memberinfo.md
 */
/** @param {NS} ns */
function manage_ascension(ns, gang_member) {
    //Get the result of an ascension without ascending
    let results = ns.gang.getAscensionResult(gang_member.name)

    //https://www.reddit.com/r/Bitburner/comments/x6v08l/help_with_automating_gangs/
    const fNeeded = 2 //1.26
    let f = 0

    if (results != null) {
        //check focus
        if (config.focus == data.focus_area.hacking) {
            f = Math.min(results.hack)
        } else if (config.focus == data.focus_area.combat) {
            f = Math.min(results.str, results.def, results.dex)//ignore agility since it is very slow levelling?, results.agi)
        }
    }
    if (fNeeded < f) {
        if (ns.gang.ascendMember(gang_member.name)) {
            log(ns, config.log_level, success, "Ascended " + gang_member.name + "!")
        }
    }
}



/** @param {NS} ns */
function get_upgrades(ns) {
    //create list to store information into
    let upgrade_list = []
    //get all available upgrades
    const upgrades = ns.gang.getEquipmentNames()
    //for each upgrade
    for (const upgrade of upgrades) {
        //get stats of the equipment
        const stats = ns.gang.getEquipmentStats(upgrade)
    
        //combat focus
        if (config.focus == data.focus_area.combat) {
        //if any stat in combat is improved
            if ((stats.str > 1) || (stats.def > 1) || (stats.dex > 1) || (stats.agi > 1)) {
                //add to the wishlist
                upgrade_list.push(upgrade)
            }
        
            //hacking focus
        } else if (config.focus == data.focus_area.hacking) {
            //if hacking stat is improved
            if (stats.hack > 1) {
                //add to the wishlist
                upgrade_list.push(upgrade)
            }
        }
    }
    //return the list
    return upgrade_list
}

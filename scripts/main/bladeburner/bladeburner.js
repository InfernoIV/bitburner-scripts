//common
import * as common from "scripts/common.js"
//data
import * as data from "./data.js"
//config
import * as config from "./config.js"



/**
 * Function to do a check for bladeburner access 
 * used to check for bladeburner access, to determine actions
 * @param {NS} ns
 */
export function get_access(ns) {
    //try to or return the result of joining
    return ns.bladeburner.joinBladeburnerDivision()
}



/**
 * Function that manages the bladeburner stuff
 * Upgrades bladeburner skills
 * travels to city with lowest chaos and where population is not 0
 * assigns actions
 */
export function manage_action(ns) {
    //upgrade skills
    bladeburner_raise_skills(ns)
    //check if we need to travel elsewhere
    bladeburner_travel_to_best_city(ns)
    //get the advised action
    const best_action = determine_action(ns)
    //get the current activity
    const current_action = get_activity(ns)
    //check if the current action is already being performed
    if((current_action.type != best_action.type) ||
       (current_action.value != best_action.value)) {
        //start this action
        ns.bladeburner.startAction(best_action.type, best_action.value)
    }
}



/**
 * Function that returns if the player is performing a blackop
 * used to block resets
**/
export function is_performing_black_op(ns) {
    //get bladeburner activity
    const activity = get_activity(ns)
    //check the type
    if(activity.type == data.actions.type.blackOps) {
        //indicate busy
        return true
    }
    //not busy
    return false
}



/**
 * Function that returns a boolean that indicates if all black ops have been completed
 * used for checking bit node destruction
 */
export function has_completed_all_black_ops(ns) {
    //get the number of completed black ops
    const number_of_black_ops_completed = get_number_of_completed_black_ops(ns)
    //compare to all black ops
    const has_completed_all_black_ops = number_of_black_ops_completed >= data.bladeburner_actions.blackOps.length
    //return the value
    return has_completed_all_black_ops
}



/**
 * Function that returns the headers and values used to update the ui
 */
export function update_ui(ns) {
    //create new headers list
    const headers = []
    //create new values list
    const values = []

    //if blade burner is active
    if (get_bladeburner_access(ns)) {
        //stamina
        headers.push("Bladeburner stamina")
        const stamina = ns.bladeburner.getStamina()
        const stamina_percentage = Math.round(stamina[0] / stamina[1] * 100)
        values.push(number_formatter(stamina[0]) + "/" + number_formatter(stamina[1]) + " (" + stamina_percentage + "%)")
        //rank
        headers.push("Bladeburner rank")
        values.push(number_formatter(Math.floor(ns.bladeburner.getRank())) + "/" + number_formatter(400e3))

        //blackOps completed
        const black_ops_completed = get_number_of_completed_black_ops(ns)
        //add the text
        headers.push("Bladeburner BlackOps")
        //add the data
        values.push(black_ops_completed + "/"+ data.bladeburner_actions.blackOps.length) //was 21 (this should be dynamic
    }
    //return the headers and values
    return headers, values
}



/**
 * Function that determines the best city for bladeburner actions
 * Chaos should be lowest possible
 * Population should be more than 0 (otherwise we cannot do anything)
**/
function get_best_city(ns) {
    //go to lowest chaos city (lower chaos = higher success chances)
    //keep track of previous chaos
    let bladeburner_chaos_lowest = 999999
    //check the lowest chaos city
    for (const cityEntry in enum_cities) {
        //get city
        const city = enum_cities[cityEntry]
        //get chaos of current city
        const cityChaos = ns.bladeburner.getCityChaos(city)
        //we also need to check if there are any synthoids, otherwise all operations and contracts have a 0% success chance 
        //and actions will default to Field analysis, which will do nothing...
        //if lower than previous and there is synthoids in the city
        if (cityChaos < bladeburner_chaos_lowest && ns.bladeburner.getCityEstimatedPopulation(city) > 0) {
            //switch city
            ns.bladeburner.switchCity(city)
            //update lowest chaos
            bladeburner_chaos_lowest = cityChaos
        }
    }
}



/**
 * Function that raises the skill of bladeburner
 * Just raises all, no focus
**/
function raise_skills(ns) {
    //for each bladeburner skill
    for (const skill in data.bladeburner_skills) {
        //upgrade skill without checking details (money, level cap)
        ns.bladeburner.upgradeSkill(data.bladeburner_skills[skill])
    }
}



/**
 * Function that get the lowest action count of all operations and contracts
 * Enables determination when sleeves should do infiltrations to raise the counts\
**/
function get_lowest_action_count(ns) {
    //set variable to return, set to high so it can be lowered
    let lowest_action_count = 999
    //for each operation
    for (const activity in data.bladeburner_actions.operations) {
        //get operation information
        const operation = data.bladeburner_actions.operations[activity]
        //get action count
        const action_count = ns.bladeburner.getaction_countRemaining(data.bladeburner_actions.type.operations, operation)
        //check if lower
        if (action_count < lowest_action_count) {
            //set action count
            lowest_action_count = action_count
        }
    }
    //for each contract
    for (const activity in data.bladeburner_actions.contracts) {
        //get contract information
        const contract = data.bladeburner_actions.contracts[activity]
        //get action count
        const action_count = ns.bladeburner.getaction_countRemaining(data.bladeburner_actions.type.contracts, contract)
        //check if lower
        if (action_count < lowest_action_count) {
            //set action count
            lowest_action_count = action_count
        }
    }
    //return the action count
    return lowest_action_count
}



/**
 * Function that provides the number of completed black ops
 */
function get_number_of_completed_black_ops(ns) {
    //value to return
    let black_ops_completed = 0
    //for each blackop
    for (const black_op_entry in data.bladeburner_actions.blackOps) {
        //get blackop name
        const black_op = data.bladeburner_actions.blackOps[black_op_entry]
        //if completed
        if (ns.bladeburner.getActionCountRemaining(data.bladeburner_actions.type.blackOps, black_op.name) == 0) {
            //add to the counter
            black_ops_completed++
        } else {
            //not completed: stop
            break
        }
    }
    //return the amount (the index that has action count)
    return black_ops_completed
}



/**
 * Function that check the blade burner action
 * Cost: 1 GB
 *  getCurrentAction (1)
 */
function get_activity(ns) {
    //type is work type, value is the specific name of the work
    //if bladeburner work
    let player_activity = ns.bladeburner.getCurrentAction()
    //if not null: player is doing bladeburner work
    if (player_activity != null) {
        //return the activity
        return player_activity
    }
    //return an empty value
    return { type: "", value: "" }
}



/**
 * Cost: 28 GB
 *  upgradeSkill (4)
 *  getCityChaos (4)
 *  switchCity(4)
 *  getStamina (4)
 *  getRank (4)
 *  getaction_countRemaining (4)
 *  getActionEstimatedSuccessChance (4)
 */
function determine_action(ns) {
    //get stamina
    const bladeburner_stamina = ns.bladeburner.getStamina()
    //if current stamina is higher than half max stamina (no penalties)
    if (bladeburner_stamina[0] > (bladeburner_stamina[1] / 2)) {
        //blackops
        //get current rank
        const bladeburner_rank = ns.bladeburner.getRank()
        //for each black operation
        for (const activity in data.bladeburner_actions.blackOps) {
            //get black_op information
            const black_op = data.bladeburner_actions.blackOps[activity]
            //check if this is the black op that is to be done
            if (ns.bladeburner.getaction_countRemaining(data.bladeburner_actions.type.blackOps, black_op.name) > 0) {
                //get chance
                const chance = ns.bladeburner.getActionEstimatedSuccessChance(data.bladeburner_actions.type.blackOps, black_op.name)
                //check if we have enough rank and enough chance
                if ((bladeburner_rank > black_op.reqRank) &&
                    (chance[0] >= config.bladeburner_black_op_success_chance_minimum)) {
                    //return this information
                    return { type: data.bladeburner_actions.type.blackOps, name: black_op.name }
                }
                //stop looking!
                break
            }
        }
        //operations
        //for each operation
        for (const activity in data.bladeburner_actions.operations) {
            //get operation information
            const operation = data.bladeburner_actions.operations[activity]
            //get action count
            const action_count = ns.bladeburner.getaction_countRemaining(data.bladeburner_actions.type.operations, operation)
            //get chance
            const chance = ns.bladeburner.getActionEstimatedSuccessChance(data.bladeburner_actions.type.operations, operation)
            //if this action can be performed and we have enough chance
            if ((action_count >= 1) && (chance[0] >= config.bladeburner_success_chance_minimum)) {
                //return this information
                return { type: data.bladeburner_actions.type.operations, name: operation }
            }
        }
        //contracts
        //for each contract
        for (const activity in data.bladeburner_actions.contracts) {
            //get contract information
            const contract = data.bladeburner_actions.contracts[activity]
            //get action count
            const action_count = ns.bladeburner.getaction_countRemaining(data.bladeburner_actions.type.contracts, contract)
            //get chance
            const chance = ns.bladeburner.getActionEstimatedSuccessChance(data.bladeburner_actions.type.contracts, contract)
            //if this action can be performed and we have enough chance
            if ((action_count >= 1) && (chance[0] >= config.bladeburner_success_chance_minimum)) {
                //return this information
                return { type: data.bladeburner_actions.type.contracts, name: contract }
            }
        }
    }
    //general
    //if over threshold
    if (bladeburner_chaos_lowest > data.bladeburner_chaos_threshold) {
        //lower chaos
        return { type: data.bladeburner_actions.type.general, name: data.bladeburner_actions.general.diplomacy }
    }
    //if no operations or contracts available
    if (bladeburner_get_lowest_action_count(ns) == 0) {
        //generate operations and contracts
        return { type: data.bladeburner_actions.type.general, name: data.bladeburner_actions.general.inciteViolence }
    }
    //default: raise success chances
    return { type: data.bladeburner_actions.type.general, name: data.bladeburner_actions.general.fieldAnalysis }
}

//imports
//import  from "scripts/common.js"
import * as data from "./data.js"

/**
 * Function to do a check for bladeburner access 
 */
export function get_bladeburner_access(ns, challenge_flags) {
    //if unlocked (API and division) and not performing the challenge
    if(!has_completed_bit_node_level(ns, 6) || 
       !has_completed_bit_node_level(ns, 7) || 
       (challenge_flags.disable_bladeburner == true)) {
        //no access
        return false
        
    //unlocked and not disabled: check access
    } else {
        return ns.bladeburner.joinBladeburnerDivision()
    }
}



/**
 * Function that check the blade burner action
 * Cost: 1 GB
 *  getCurrentAction (1)
 */
function bladeburner_get_activity(ns) {
    //create a return value
    //type is work type, value is the specific name of the work
    let activity = { type: "", value: "" }
    //if bladeburner work
    let player_activity = ns.bladeburner.getCurrentAction()
    //if not null: player is doing bladeburner work
    if (player_activity != null) {
        //set type
        activity.type = data.activities.bladeburner
        //save action (to be looked up later)
        activity.value = player_activity.name
    }
    //return the value
    return activity
}



/**
 * Function that manages the bladeburner stuff
 * Upgrades bladeburner skills
 * travels to city with lowest chaos and where population is not 0
 * 
 * @param {NS} ns
 * Cost: 28 GB
 *  upgradeSkill (4)
 *  getCityChaos (4)
 *  switchCity(4)
 *  getStamina (4)
 *  getRank (4)
 *  getaction_countRemaining (4)
 *  getActionEstimatedSuccessChance (4)
 */
function bladeburner_determine_action(ns) {
    //go to lowest chaos city (lower chaos = higher success chances)
    //keep track of previous chaos
    let bladeburner_chaos_lowest = 999999
    
    //upgrade skills
    //for each bladeburner skill
    for (const skill in data.bladeburner_skills) {
        //upgrade skill without checking details (money, level cap)
        ns.bladeburner.upgradeSkill(data.bladeburner_skills[skill])
    }

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

    //keep track of action count
    let bladeburner_total_action_count = -1
    //get stamina
    const bladeburner_stamina = ns.bladeburner.getStamina()
    //if current stamina is higher than half max stamina (no penalties)
    if (bladeburner_stamina[0] > (bladeburner_stamina[1] / 2)) {
        //set to 0. then it will be checked
        bladeburner_total_action_count = 0
        //blackops
        //get current rank
        const bladeburner_rank = ns.bladeburner.getRank()
        //for each black operation
        for (const activity in data.bladeburner_actions.blackOps) {
            //get blackOp information
            const blackOp = data.bladeburner_actions.blackOps[activity]
            //check if this is the black op that is to be done
            if (ns.bladeburner.getaction_countRemaining(data.bladeburner_actions.type.blackOps, blackOp.name) > 0) {
                //get chance
                const chance = ns.bladeburner.getActionEstimatedSuccessChance(data.bladeburner_actions.type.blackOps, blackOp.name)
                //check if we have enough rank and enough chance
                if ((bladeburner_rank > blackOp.reqRank) &&
                    (chance[0] >= config.bladeburner_black_op_success_chance_minimum)) {
                    //return this information
                    return { type: data.bladeburner_actions.type.blackOps, name: blackOp.name }
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
            //add count to total actions available
            bladeburner_total_action_count += action_count
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
            //add count to total actions available
            bladeburner_total_action_count += action_count
        }
    }

    //general
    //if over threshold
    if (bladeburner_chaos_lowest > data.bladeburner_chaos_threshold) {
        //lower chaos
        return { type: data.bladeburner_actions.type.general, name: data.bladeburner_actions.general.diplomacy }
    }
    //if no operations or contracts available
    if (bladeburner_total_action_count == 0) {
        //generate operations and contracts
        return { type: data.bladeburner_actions.type.general, name: data.bladeburner_actions.general.inciteViolence }
    }
    //default: raise success chances
    return { type: data.bladeburner_actions.type.general, name: data.bladeburner_actions.general.fieldAnalysis }
}


function bladeburner_get_action_count(ns) {

}

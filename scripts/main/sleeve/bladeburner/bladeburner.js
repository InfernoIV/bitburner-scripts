//common
import * as common from "scripts/common.js"
//bladeburner config
import * as config from "../../bladeburner/config.js"
//bladeburner data
import * as data from "../../bladeburner/data.js"
//bladeburner functions
import * as bladeburner from "../../bladeburner/bladeburner.js"



/**
 * Function that determines the sleeve work for bladeburner
 * tries to assign bladeburner work from the lowest index, not checking stats
 * function should be executed before assigning normal work!
 * Cost: 8 GB
 *   ns.bladeburner.getActionEstimatedSuccessChance: 4 GB
 *   ns.bladeburner.getCityChaos: 4 GB
**/
export function manage_actions(ns, sleeve_actions) {
    //check if we have enough chance to recruit, default to sleeve 0
    if(ns.bladeburner.getActionEstimatedSuccessChance(data.bladeburner_actions.sleeve.recruitment, 0) >= config.bladeburner_success_chance_minimum_sleeve   {
        //set sleeve 0 to recruit
         sleeve_actions[0] = { type: data.bladeburner_actions.sleeve.recruitment }
    }
    
    //if action count is too low
    if (bladeburner.bladeburner_get_lowest_action_count(ns) <= config.bladeburner_minimum_number_of_actions) {
        //set index to 0
        let index = 0
        //if sleeve 0 is already doing work
        if (sleeve_actions[index].type == data.bladeburner_actions.sleeve.recruitment) {
            //set index to 1
            index = 1
        }
        //set sleeve to work on this
        sleeve_actions[index] = { type: data.bladeburner_actions.sleeve.infiltrate_synthoids }
    }

    //if city chaos is over threshold
    if (ns.bladeburner.getCityChaos(bladeburner.bladeburner_get_best_city(ns)) > config.bladeburner_chaos_threshold) {
        //set index to 0
        let index = 0
        //if sleeve 0 is already doing work
        if (sleeve_actions[index].type == data.bladeburner_actions.sleeve.recruitment || sleeve_actions[index].type == data.bladeburner_actions.sleeve.infiltrate_synthoids) {
            //up the index
            index = 1
            //check again
            //if sleeve 1 is already doing work
            if (sleeve_actions[index].type == data.bladeburner_actions.sleeve.recruitment || sleeve_actions[index].type == data.bladeburner_actions.sleeve.infiltrate_synthoids) {
                //up the index
                index = 2
            }
        }
        //set sleeve to work on lowering chaos
        sleeve_actions[index] = { type: data.bladeburner_actions.sleeve.diplomacy }
    }
    
    //return the value back
    return sleeve_actions
}



/**
 * Function that executes the bladeburner actions for the sleeves
 * This way, the bladeburner functions for sleeves are contained in in this script
 * Cost: 4 GB
 *   ns.sleeve.setToBladeburnerAction: 4 GB
**/
export function execute_action(ns, sleeve_index, sleeve_action) {
    //check if we want to handle it
    switch (sleeve_action.type) {
        //if the type is a blade burner action
        case data.bladeburner_actions.sleeve.recruitment:
        case data.bladeburner_actions.sleeve.infiltrate_synthoids: 
        case data.bladeburner_actions.sleeve.diplomacy: 
            //set to bladeburner action
            ns.sleeve.setToBladeburnerAction(index, sleeve_action.type)
            //only handle bladeburner stuff
            break
            
        default:
            //do not handle, is a normal action
            //log warning
            common.log(ns, 1, common.warning, "execute_action - uncaught condition: " + sleeve_index + " has action " + sleeve_action)
    }
}


/**
 * Function that checks the best work type for bladeburner for sleeve
 * Only perform 100% chance work, else we get shock
 * cannot lower chaos, requires to get city, which increases ram usage
 * @param {NS} ns
 * Cost: 0 GB
 */
    /*
function getBladeburnerActionForSleeve(ns, sleeveIndex) {
    //set min chance = 100%
    const bladeburner_success_chance_minimum = 1
    //describe other actions
    const common.sleeveBladeburnerActions = {
        fieldAnalysis: "Field Analysis",
        infiltratesynthoids: "Infiltrate synthoids",
    }

    //keep track of action count
    let bladeburner_total_action_count = 0

    //contracts
    //for each contract
    for (const operation in common.bladeburnerActions.contracts) {
        //get contract information
        const contract = common.bladeburnerActions.contracts[operation]
        //get action count
        const action_count = ns.bladeburner.getActionCountRemaining(common.bladeburnerActions.type.contracts, contract)
        //get chance
        const chance = ns.bladeburner.getActionEstimatedSuccessChance(common.bladeburnerActions.type.contracts, contract, sleeveIndex)
        //if this action can be performed and we have enough chance
        if ((action_count > 0) && (chance[0] >= bladeburner_success_chance_minimum)) {
            //return this information
            return { type: common.sleeveBladeburnerActions.takeonContracts, name: contract }
        }
        //add count to total actions available
        bladeburner_total_action_count += action_count
    }

    //if no operations or contracts available
    if (bladeburner_total_action_count == 0) {
        //set to create contracts
        return { type: common.bladeburnerActions.type.general, name: common.bladeburnerActions.general.inciteViolence }
    }

    //failsafe: just train
    return { type: common.bladeburnerActions.type.general, name: common.bladeburnerActions.general.training }
}
*/

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
 * function should be executed before assigning normal work!
 * options: recruit, diplomacy, Field analysis, hyperbolicregen, incite violence, training, infiltrateSynthoids, SupportMainSleeve and TakeOneContracts
 * Cost: 8 GB
 *   ns.bladeburner.getActionEstimatedSuccessChance: 4 GB
 *   ns.bladeburner.getCityChaos: 4 GB
 * @param {NS} ns
**/
export function determine_action(ns, index) {
    //check if we have enough chance to recruit
    if(ns.bladeburner.getActionEstimatedSuccessChance(data.actions.type.general, data.actions.sleeve.recruitment, index) >= config.bladeburner_success_chance_minimum_sleeve) {
        //set to recruit
         return { type: data.activities.bladeburner, value: data.actions.sleeve.recruitment } //bladeburner action
    }     
    //if city chaos is over threshold (negatively impacts success chance)
    else if (ns.bladeburner.getCityChaos(bladeburner.get_best_city(ns)) > config.bladeburner_chaos_threshold) {
        //lower chaos (todo: move sleeve???)
        return { type: data.activities.bladeburner, value: data.actions.sleeve.diplomacy } //bladeburner action
    }
    //if action count is too low
    else if (bladeburner.get_lowest_action_count(ns) <= config.bladeburner_minimum_number_of_actions) {
        //set to infiltrate to raise action count
        //or to incite violence??
        return { type: data.activities.infiltrate, value: data.actions.sleeve.infiltrate_synthoids } //specific type
    }
    //if we can raise chance for the player
    else if (ns.bladeburner.getActionEstimatedSuccessChance(data.actions.type.general, data.actions.sleeve.investigation, index) >= config.bladeburner_success_chance_minimum_sleeve) {
        //set to field analysis
         return { type: data.activities.bladeburner, value: data.actions.sleeve.field_analysis } //bladeburner action
    }
    //check for contracts and otherwise return DENIED
    else {
        //for each contract
        for (const activity in data.actions.contracts) {
            //get contract information
            const contract = data.actions.contracts[activity]
            //get action count
            const action_count = ns.bladeburner.getActionCountRemaining(data.actions.type.contracts, contract)
            //get chance
            const chance = ns.bladeburner.getActionEstimatedSuccessChance(data.actions.type.contracts, contract, index)
    
            //if this action can be performed and we have enough chance
            if ((action_count >= 1) && (chance[0] >= config.bladeburner_success_chance_minimum_sleeve)) {
                //return this information
                return { type: data.activities.bladeburner, name: contract } //type: data.actions.type.contracts
            }
        }
        
        //cannot do (or allowed to) any bladeburner work
        return { type: "DENIED", value: "DENIED" }    
    }
}



/**
 * Function that executes the bladeburner actions for the sleeves
 * This way, the bladeburner functions for sleeves are contained in in this script
 * Cost: 4 GB
 *   ns.sleeve.setToBladeburnerAction: 4 GB
**/
export function execute_action(ns, sleeve_index, sleeve_action) {
    //check if we want to handle it
    switch (sleeve_action.value) {

        //contracts
        case data.actions.contracts.retirement: 
        case data.actions.contracts.bountyHunter: 
        case data.actions.contracts.tracking: 
            //set to bladeburner operation
            ns.sleeve.setToBladeburnerAction(index, data.actions.sleeve.take_on_contracts, sleeve_action.value)
            
        //if the type is a blade burner action
        case data.actions.sleeve.recruitment:
        case data.actions.sleeve.infiltrate_synthoids: 
        case data.actions.sleeve.diplomacy: 
            //set to bladeburner action
            ns.sleeve.setToBladeburnerAction(index, sleeve_action.value)
            //only handle bladeburner stuff
            break
            
        default:
            //do not handle, is a normal action
            //log warning
            common.log(ns, 1, common.warning, "execute_action - uncaught condition: " + sleeve_index + " has action " + sleeve_action)
    }
}

/**
* Function that checks what value to return for the activity
*/
export function get_activity(ns, activity) {
    //depending on type
    switch (activity.type) {
            //bladeburner action
        case data.activities.bladeburner: 
            //derive the action
            return sleeve_activity.actionName
        
            //infiltration action
        case data.activities.infiltrate: 
            //has no value, create the value
            return data.actions.sleeve.infiltrate_synthoids
        
            //uncaught condition
        default: 
            return ""
    }
}

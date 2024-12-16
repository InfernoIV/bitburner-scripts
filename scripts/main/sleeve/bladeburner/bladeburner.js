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
 * try contracts & operations?
 * Cost: 8 GB
 *   ns.bladeburner.getActionEstimatedSuccessChance: 4 GB
 *   ns.bladeburner.getCityChaos: 4 GB
**/
export function determine_action(ns, index) {
    //check if we have enough chance to recruit
    if(ns.bladeburner.getActionEstimatedSuccessChance(data.bladeburner_actions.sleeve.recruitment, index) >= config.bladeburner_success_chance_minimum_sleeve   {
        //set to recruit
         return { type: data.activities.bladeburner, value: bladeburner.data.actions.sleeve.recruitment } //bladeburner action
    }        
    //if action count is too low
    else if (bladeburner.bladeburner_get_lowest_action_count(ns) <= config.bladeburner_minimum_number_of_actions) {
        //set to infiltrate to raise action count
        return { type: data.activities.infiltrate, value: bladeburner.data.actions.sleeve.infiltrate_synthoids } //specific type
    }
    //if city chaos is over threshold
    else if (ns.bladeburner.getCityChaos(bladeburner.bladeburner_get_best_city(ns)) > config.bladeburner_chaos_threshold) {
        //lower chaos (todo: move sleeve???)
        return { type: data.activities.bladeburner, value: bladeburner.data.actions.sleeve.diplomacy } //bladeburner action
    }
    //cannot do (or allowed to) any bladeburner work
    else {
        //not allowed
        return { type: "DENIED", value: " " }
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
        //if the type is a blade burner action
        case bladeburner.data.actions.sleeve.recruitment:
        case bladeburner.data.actions.sleeve.infiltrate_synthoids: 
        case bladeburner.data.actions.sleeve.diplomacy: 
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
            return bladeburner.data.actions.sleeve.infiltrate_synthoids
        
            //uncaught condition
        default: 
            return ""
    }
}

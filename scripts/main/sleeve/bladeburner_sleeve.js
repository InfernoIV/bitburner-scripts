//bladeburner config
import * as config from "../bladeburner/config.js"
//bladeburner data
import * as data from "../bladeburner/data.js"
//bladeburner functions
import * as bladeburner from "../bladeburner/bladeburner.js"



/**
 * Function that checks the best work type for bladeburner for sleeve, returns it in order of priority
 * returns empty list if no work is applicable
 * Only perform 100% chance work, else we get shock
 * cannot lower chaos, requires to get city, which increases ram usage -> just selected to lowest chaos city and check threshold
 * @param {NS} ns
 * Cost: 0 GB
 */
function bladeburner_get_actions_sleeve(ns, sleeveIndex) {
    //create a variable to store actions into that are wanted
    let action_list_wanted = []
    //create a variable to store actions into that are possible (enough chance)
    let action_list_possible = []
    
    //if available actions are getting too low 
    if (bladeburner_get_lowest_action_count(ns) <= config.bladeburner_minimum_number_of_actions) {
        //if enough chance
        
        //add to the list
        action_list_wanted.push({ type: data.bladeburner_actions.sleeve.infiltrate_synthoids, name: true })
    }
    
    //lower city chaos (if needed)
    if (ns.bladeburner.getCityChaos(bladeburner_get_best_city(ns)) > config.bladeburner_chaos_threshold) {
        //lower chaos
        action_list_wanted.push({ type: data.bladeburner_actions.sleeve.diplomacy, name: true })
    }
    
    //recruit members
    action_list_wanted.push({ type: data.bladeburner_actions.sleeve.recruitment, name: true })
    
    //for each action in the list (from most important to least important)
    for (const action in action_list_wanted) {
        //get chance
        const chance = ns.bladeburner.getActionEstimatedSuccessChance(action.type, sleeveIndex)
        //if enough chance
        if (chance >= config.bladeburner_success_chance_minimum_sleeve) {
            //add to the list of possible actions
            action_list_possible.push(action)
        }
    }
    
    //return the list of possible actions
    return action_list_possible
}


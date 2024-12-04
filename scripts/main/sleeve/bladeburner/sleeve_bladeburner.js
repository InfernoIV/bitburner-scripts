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
**/
export function bladeburner_manage_actions(ns, sleeve_actions) {
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
}



/**
 * Function that executes the bladeburner actions for the sleeves
 * This way, the bladeburner functions for sleeves are contained in in this script
**/
export function bladeburner_execute_actions(ns, sleeve_actions) {
    //for each sleeve
    for (let index = 0; index < sleeve_actions.length; index++) {
        //get the action
        const sleeve_action = sleeve_actions[index]
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
                //do not handle, is a normal actin
        }
    }
}

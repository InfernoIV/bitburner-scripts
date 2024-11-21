/*
File to use for import when sleeve functionality IS unlocked
Functions and cost
  0 GB  init
  x GB  manage_actions
  x GB  buy_augments_sleeve
  x GB  get_num_sleeves
  x GB  update_ui
  4 GB  get_activity
*/



//imports
import * as common from "scripts/common.js"



/*
 * Function that initialized, in this case it disables logging
 * 0 GB
 */
export function init(ns) {
  //disable logging
  ns.disableLog("sleeve.purchaseSleeveAug")
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
export function manage_actions(ns, bit_node_multipliers) {
  //get the number of sleeves available
  const sleeves_available = get_num_sleeves(ns)

  //get player
  const player = ns.getPlayer()
  //sleeve actions
  //shock value that is wanted (96%)
  const sleeve_shock_desired_maximum = 0.96
  //get all max shock value
  let sleeve_shock = []

  //for each sleeve
  for (let index = 0; index < sleeves_available; index++) {
      //get shock value
      const shock = ns.sleeve.getSleeve(index).shock
      //add the shock to the list
      sleeve_shock.push(shock)
  }

  //if there is a sleeve with too much shock
  if (Math.max(sleeve_shock) > sleeve_shock_desired_maximum) {
      //for each sleeve
      for (let index = 0; index < sleeves_available; index++) {
          //if not doing the correct work
          if (get_activity(ns, index).type != activities.recovery) {
              //perform recovery
              ns.sleeve.setToShockRecovery(index)
          }
      }

      //if we have not reached target karma
  } else if (player.karma > requirements.karma_for_gang) {
      //for each sleeve
      for (let index = 0; index < sleeves_available; index++) {
          //get best crime for karma
          let crime_best = ns.enums.CrimeType.mug//get_crime_best(ns, bit_node_multipliers, player, crime_focus.karma)
          //if not doing the correct work
          if (get_activity(ns, index).value != crime_best) {
              //perform crime for karma
              ns.sleeve.setToCommitCrime(index, crime_best)
          }
      }

      //not reached target kills
  } else if (player.numPeopleKilled < requirements.kills_for_factions) {
      //for each sleeve
      for (let index = 0; index < sleeves_available; index++) {
          //get best crime for kills
          let crime_best = ns.enums.CrimeType.homicide//get_crime_best(ns, bit_node_multipliers, player, crime_focus.kills)
          //if not performing the correct work
          if (get_activity(ns, index).value != crime_best) {
              //perform crime
              ns.sleeve.setToCommitCrime(index, crime_best)
          }
      }

      //sleeves are to be divided over work (faction > company > crime)
  } else {
      //get all the current actions
      let sleeve_actions_current = []
      //get all sleeve actions
      for (let index = 0; index < sleeves_available; index++) {
          //add activity of the specific sleeve to the list
          sleeve_actions_current.push(get_activity(ns, index))
      }

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
      
      //get a list of all companies to work for
      let companies_to_work_for = []
      //create list of companies and their factions
      for (const company in player.jobs) {
          //if company faction is not joined
          if (player.factions.indexOf(company_factions[company]) == -1) {
              //add company to the list
              companies_to_work_for.push(company)
          }
      }

      
      //keep track of sleeve actions to be done
      let sleeve_actions_future = []
      //define best crime for skills
      const crime_best = ns.enums.CrimeType.grandTheftAuto //TODO: get_crime_best(ns, bit_node_multipliers, ns.sleeve.getSleeve(index), crime_focus.skills)
      //for each sleeve
      for (let index = 0; index < sleeves_available; index++) {
          //set default action to crime
          sleeve_actions_future[index] = { type: activities.crime, value: crime_best }
      }

      //determine faction work
      for (const faction in factions_to_work_for) {
          //set flag to check if sleeve is already working for this specific faction
          let sleeve_assigned = false
          
          //check if any sleeve is already performing work for this faction
          for (const sleeve_action in sleeve_actions_current) {
              //if doing faction work and working for this faction
              if ((sleeve_action.type == activities.faction) && 
                  (sleeve_action.value == faction)) {
                  //save that the sleeve is working on this
                  sleeve_actions_future[index] = { type: activities.faction, value: faction }
                  //set flag that is sleeve already assigned
                  sleeve_assigned = true
                  //stop looking
                  break
              }
          }
          
          //if no sleeve assigned
          if (!sleeve_assigned) {
              //go over each sleeve
              for (let index = 0; index < sleeves_available; index++) {
                  //first sleeve that is set to crime, is set to this faction
                  if (sleeve_actions_future[index].type == activities.crime) {
                      //save information
                      sleeve_actions_future[index] = { type: activities.faction, value: faction }
                      //stop looking
                      break
                  }
              }
          }
      }

      
      //determine company work
       for (const company in companies_to_work_for) {
          //set flag to check if sleeve is already working for this specific company
          let sleeve_assigned = false
          //if company faction is not joined
          if (player.factions.indexOf(company_factions[company]) == -1) {
              //check if any sleeve is already performing work for this company
              for (const sleeve_action in sleeve_actions_current) {
                  //if doing faction work and working for this faction
                  if ((sleeve_action.type == activities.company) && 
                      (sleeve_action.value == company)) {
                      //save that the sleeve is working on this
                      sleeve_actions_future[index] = { type: activities.company, value: company }
                      //set flag that is sleeve already assigned
                      sleeve_assigned = true
                      //stop looking
                      break
                  }
              }
              
              //if no sleeve assigned
              if (!sleeve_assigned) {
                  //go over each sleeve
                  for (let index = 0; index < sleeves_available; index++) {
                      //first that is set to crime, is set to this faction
                      if (sleeve_actions_future[index].type == activities.crime) {
                          //save information
                          sleeve_actions_future[index] = { type: activities.company, value: company }
                          //stop looking
                          break 
                      }
                  }
              }
          }
      }

      
      //set all sleeve actions
      for (let index = 0; index < sleeves_available; index++) {
          //compare current vs wanted
          if ((sleeve_actions_current[index].type = sleeve_actions_future[index].type) &&
             (sleeve_actions_current[index].value = sleeve_actions_future[index].value)) {
              //doing correct work, no change needed
          } else {
              //change in work is needed
              switch (sleeve_actions_future.type) {

                      
                  //faction work
                  case activities.faction: 
                      //get faction
                      const faction = sleeve_actions_future.value
                      //get work type
                      const work_type = determine_faction_work(ns.sleeve.getSleeve(index), get_faction_work_types(faction))
                      //set to faction work
                      if (!ns.sleeve.setToFactionWork(index, faction, work_type)) {
                          //if failed, log!
                          log(ns,1,error,"Failed to start sleeve " + index + " on faction work @ " + faction + "(" + work_type + ")")
                      }
                      //stop looking
                      break

                      
                  //company work
                  case activities.company: 
                      //get company
                      const company = sleeve_actions_future.value
                      //set to company work
                      if(!ns.sleeve.setToCompanyWork(index, company)) {
                          //if failed, log!
                          log(ns,1,error,"Failed to start sleeve " + index + " on company work @ " + company)
                      }
                      //stop looking
                      break
                      
                  //crime
                  default:
                      //if not working on the desired crime
                      if (get_activity(ns, index).value != crime_best) {
                          //assign to crime
                          if(!ns.sleeve.setToCommitCrime(index, crime_best)) {
                              //if failed, log!
                              log(ns,1,error,"Failed to start sleeve " + index + " on crime: " + crime_best)
                          }
                      }
              }
          }
      }
      
      /*
      //factions
      //get available factions
      for (const faction of player.factions) {
          //get work types
          const work_types = get_faction_work_types(faction)
          //if the faction has work_types
          if (work_types.length > 0) {
              //if there are still augments available
              if (should_work_for_faction(ns, faction)) {
                  //set a flag to check
                  let already_working_for_faction = false
                  //check other sleeves
                  for (let index = 0; index < sleeves_available; index++) {
                      //get activity
                      const activity = get_activity(ns, index)
                      //if a sleeve is already working for this faction
                      if ((activity.type == activities.faction) &&
                          (activity.value == faction)) {
                          //assign this job to the sleeve
                          sleeve_actions_future[index] = activity
                          //set flag to indicate someone is already working on this
                          already_working_for_faction = true
                          //stop searching
                          break
                      }
                  }
                  //if flag is not set
                  if (!already_working_for_faction) {
                      //check each sleeve
                      for (let index = 0; index < sleeves_available; index++) {
                          //check if the sleeve is not assigned
                          if (!Object.hasOwn(sleeve_actions_future, index)) {
                              //get best faction work
                              const faction_work_best = determine_faction_work(ns.sleeve.getSleeve(index), work_types)
                              //try to start
                              try {
                                  //work for this faction
                                  if (ns.sleeve.setToFactionWork(index, faction, faction_work_best)) {
                                      //save information
                                      sleeve_actions_future[index] = { type: activities.faction, value: faction }
                                      //stop
                                      break
                                  }
                              } catch (error) {
                                  log(ns, 1, error, "setToFactionWork " + faction + ": " + error)
                              }
                          }
                      }
                  }
              }
          }
      }
      */

      /*
      //companies
      //create list of companies and their factions
      for (const company in player.jobs) {
          //get faction of the company
          let company_faction = enum_company_factions[company]
          //if not joined
          if (player.factions.indexOf(company_faction) == -1) {
              //check if other sleeves are working for the company
              //set a flag to check
              let company_already_working = false
              //check other sleeves
              for (let index = 0; index < sleeves_available; index++) {
                  //get activity
                  const activity = get_activity(ns, index)
                  //if a sleeve is already working for this company
                  if ((activity.type == activities.company) &&
                      (activity.value == company)) {
                      //assign this job to the sleeve
                      sleeve_actions_future[index] = activity
                      //set flag to indicate someone is already working on this
                      company_already_working = true
                      //stop searching
                      break
                  }
              }
              //if flag is not set
              if (!company_already_working) {
                  //check each sleeve
                  for (let index = 0; index < sleeves_available; index++) {
                      //check if the sleeve is not assigned
                      if (!Object.hasOwn(sleeve_actions_future, index)) {
                          try {
                              //work for company
                              ns.sleeve.setToCompanyWork(index, company)
                              //save information
                              sleeve_actions_future[index] = { type: activities.company, value: company }

                          } catch (error) {
                              log(ns, 1, error, "setToCompanyWork " + company + ": " + error)
                          }
                      }
                  }
              }
          }
      }

      //check each sleeve
      for (let index = 0; index < sleeves_available; index++) {
          //check if the sleeve is not assigned
          if (!Object.hasOwn(sleeve_actions_future, index)) {
              //get best crime for skills
              let crime_best = ns.enums.CrimeType.grandTheftAuto//get_crime_best(ns, bit_node_multipliers, ns.sleeve.getSleeve(index), crime_focus.skills)
              //if not working on the desired crime
              if (get_activity(ns, index).value != crime_best) {
                  //assign to crime
                  ns.sleeve.setToCommitCrime(index, crime_best)
              }
              //save information
              sleeve_actions_future[index] = { type: activities.crime, value: crime_best }
          }
      }
      */
    }
}



/**
 * Function that manages the buying of augments
 * Cost: 8 GB 
 *  purchaseSleeveAug (4)
 *  getSleevePurchasableAugs (4)
 */
export function buy_augments_sleeve(ns) {
    //if gang is busy with growing (and thus requiring money and blocking resets)
    if (ns.peek(common.enum_port.reset) == "gang") {
        //do not buy augments
        return
    }
  //for each sleeve
  for (let index = 0; index < get_num_sleeves(ns); index++) {
      //for each sleeve augment
      //TODO: possible to hardcode the augment list?
      //TODO: get rid of try / catch
      for (const augment of ns.sleeve.getSleevePurchasableAugs(index)) {
          try {
              //buy augment
              if(ns.sleeve.purchaseSleeveAug(index, augment.name)) {
                  log(ns, 1, success, "Bought augment '" + augment.name + "' for sleeve " + index)
              }
          } catch (error) {
              break
          }
      }
  }
}


/**
 * 
 */
export function update_ui(ns) {
  let headers = []
  let values = []
  //for each sleeve
  for (let index = 0; index < get_num_sleeves(ns); index++) {
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
function get_num_sleeves(ns) {
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
export function get_activity(ns, index = -1) {
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
                //bladeburner?
                case data.activities.bladeburner: activity.value = sleeve_activity.actionName; break
                case data.activities.infiltrate: activity.value = ""; break //only type property
                case data.activities.support: activity.value = ""; break //only type property
                //sleeve only
                case data.activities.recovery: activity.value = ""; break //only type property
                case data.activities.synchro: activity.value = ""; break //only type property                
                default:
                    //log information
                    log(ns, 1, info, "get_activity - Uncaught condition: " + sleeve_activity.type)
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

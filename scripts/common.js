/*
This file shows the commons used in other scripts: script names, ports, hostnames
THIS FILE SHOULD NOT HAVE EXTRA RAM IMPACT ON OTHER FILES, IT SHOULD ONLY HAVE THE BASE COST FOR RAM!!!
*/


//file constants
export const file_bit_node_multipliers = "bit_node_multipliers.json"
export const file_reset_info = "reset_info.json"
export const file_challenge_flags = "challenge.json"
export const file_bit_node_progression = "bit_node_progression.json"
export const file_num_sleeves = "sleeves.json"



//log constants
export const info = "INFO"
export const success = "SUCCESS"
export const warning = "WARNING"
export const error = "ERROR"
export const fail = "FAIL"



//communication port definitions
export const port = {
    //external scripts
    reset: 1,
    hack: 2,
    gang: 3,
    corporation: 4,
    stock: 5,
    backdoor: 6,
    stopHack: 7,
    stanek: 8,
}



//no port data definition
export const port_no_data = "NULL PORT DATA"



/**
 * enum of special servers
 * All servers will be backdoored, if possible
 */
export const servers = {
    home: "home",   //no effect
    worldDaemon: "w0r1d_d43m0n",    //bitnode destruction
    //fulcrumSecretTechnologies: "fulcrumassets",     //fulcrum faction
    zb_institute: "zb-institute",
    universal_energy: "univ-energy",
    titan_labs: "titan-labs",
}



/**
 * Enum containing scripts
 */
export const scripts = {
    //script
    boot: "scripts/boot.js",
    //main
    main: "scripts/main/main.js",
    //utility
    jump: "scripts/utility/jump_script.js",
    jump2: "scripts/utility/jump.js",
    destroyBitNode: "scripts/utility/destroy_bit_node.js",
    reset: "scripts/utility/reset.js",
    //backdoor
    backdoor: "scripts/backdoor/backdoor.js",
    //gang
    gang: "scripts/gang/gang.js",
    //corporation  
    corporation: "scripts/corporation/corporation.js",
    //stock
    stock: "scripts/stock/stock.js",
    //hack
    hack: "scripts/hack/hack.js",
    workerHack: "scripts/hack/workerHack.js",
    workerGrow: "scripts/hack/workerGrow.js",
    workerWeaken: "scripts/hack/workerWeaken.js",
    //stanek
    stanekCreate: "scripts/stanek/stanekCreate.js",
    stanekCharge: "scripts/stanek/stanekCharge.js",
    workerCharge: "scripts/stanek/workerCharge.js",
    //stanekBuy: "scripts/stanek/stanekBuy.js",
}



/**
 * Function that enables easy logging
 * Cost: 0
 */
export function log(ns, loglevel, type, message) {
  //get time
    const date = new Date()
    let hour = "" + date.getHours()
    let min = "" + date.getMinutes()
    //add leading 0's
    if (hour.length == 1) {
        hour = "0" + hour
    }
    if (min.length == 1) {
        min = "0" + min
    }
    
    //update message
    message = hour + ":" + min + " " + message
    //depending on loglevel
    switch (loglevel) {
        case 2: //alert
            ns.alert(message)
        case 1: //console log
            ns.tprint(type + " " + message)
        case 0: //log
            ns.print(type + " " + message)
        default:
            //do nothing?
            break
    }
}



/**
 * Function that formats numbers
 * Cost: 0
 */
export function number_formatter(number) {
    const fraction_digits = 3
    if (number == 0) {
        return 0
    }
    //round the number
    number = Math.round(number)

    const symbols = ["", "k", "m", "b", "t"]
    let largestIndex = 0
    for (let index = 0; index < symbols.length; index++) {
        if (Math.abs(number) >= Math.pow(1000, index)) {
            largestIndex = index
        } else {
            break
        }
    }
    let numberReturn = number
    if (largestIndex > 0) {
        numberReturn = Math.sign(number) * ((Math.abs(number) / Math.pow(1000, largestIndex)).toFixed(fraction_digits))
    }
    return numberReturn + symbols[largestIndex]
}



/**
 * Enum stating all cities
 */
export const cities = {
    aevum: "Aevum",
    chongqing: "Chongqing",
    ishima: "Ishima",
    newTokyo: "New Tokyo",
    sector12: "Sector-12",
    volhaven: "Volhaven",
}



// hacking commands
export const hackingCommands = {
    start: "Start",
    stop: "Stop",
}



/**
 * Function that overwrites the specified port with new data
 * Cost: 0
 */
export function over_write_port(ns, port, data) {
    //clear port
    ns.clearPort(port)
    //write data
    ns.writePort(port, data)
}



/**
 * Function that retrieves bitnode information from file
 */
export function get_bit_node_multipliers(ns) {
    //read data from file
    return JSON.parse(ns.read(file_bit_node_multipliers))
}



/**
 * Function that retrieves bitnode information from file
 */
export function get_reset_info(ns) {
    //read data from file
    return JSON.parse(ns.read(file_reset_info))
}



/**
 * Function that retrieves bitnode information from file
 */
export function get_challenge_flags(ns) {
    //read data from file
    return JSON.parse(ns.read(file_challenge_flags))
}



/**
 * Function that returns the next target bit node
 */
export function get_next_bit_node(ns) {
    //TODO: getResetInfo is broken, return 12
    return 12

    //get the current bit node information from file
    const reset_info = get_reset_info(ns)
    //get the map of owned source files (completed bitnodes) 
    let owned_source_files_after_destruction = reset_info.ownedSF

    //check if we already have completed the current node
    if (owned_source_files_after_destruction.has(reset_info.currentNode)) {
        //get the level of the node
        const bit_node_level = owned_source_files_after_destruction.get(reset_info.currentNode)

        //if bitnode 12
        if (reset_info.currentNode == 12) {
            //just add the counter
            owned_source_files_after_destruction.set(reset_info.currentNode, bit_node_level + 1)

            //if not maxxed
        } else if (bit_node_level < 3) {
            //add the level
            owned_source_files_after_destruction.set(reset_info.currentNode, bit_node_level + 1)
        }

        //otherwise add it to the map (this should be the overview AFTER the bitnode
    } else {
        //add the bitnode to the source file list at level 1 (first completion)
        owned_source_files_after_destruction.set(reset_info.currentNode, 1)
    }

    //get the planned progression from file
    const bit_node_progression = JSON.parse(ns.read(file_bit_node_progression))
    //for every step in the planned progression
    for (const step of get_bit_node_progression(ns)) {    //bit_node_progression = [ { bit_node: 1, level: 1 } ]
        //if we have completed the bit node (and thus it is present in the map)
        if (owned_source_files.has(step.bit_node)) {

            //if we have the required level
            if (owned_source_files.get(step.bit_node) == step.level) {
                //everything is in order, go to next
                continue

                //we do not have the required level
            } else {
                //set the target to this bit node
                return step.bit_node
                //stop searching
                break
            }

            //bitnode has not been tackled yet
        } else {
            //set the target to this bit node
            return step.bit_node
            //stop searching
            break
        }
    }
    //failsafe: default target bit node 12, since it is endless
    return 12
}



/**
 * Function that returns if the specific bit node has been completed on a specific level (otherwise level 1) 
 */
export function has_completed_bit_node_level(ns, bit_node, level = 1) {
    //TODO: getResetInfo is currently broken
    return true
    
    //get reset info
    const reset_info = get_reset_info(ns)
    //get the map of owned source files (completed bitnodes) 
    const owned_source_files = reset_info.ownedSF

    log(ns, 1, info, JSON.stringify(reset_info))

    //check if we already have completed the current node
    if (owned_source_files.has(reset_info.currentNode)) {
        //if we have the level required
        if (owned_source_files.get(reset_info.currentNode) >= level) {
            //indicate success
            return true
        }
        //otherwise if we are looking for the 1st level, and we are in the specific bitnode: the functionality can already be used
    } else if ((level == 1) &&
        (reset_info.currentNode == bit_node)) {
        //we are in the specific bitnode, functionality should be available
        return true
    }

    //either bit node is not present in map (not completed) or doesn't have the correct level
    return false
}



/**
 * Function that returns the installed augments
 * @param {NS} ns
 */
export function get_augmentations_installed(ns) {
    //owned augments
    const augments_owned = ns.getResetInfo().ownedAugs//get_reset_info(ns).ownedAugs
    //create return value
    let augments_list = []
    //for each augment
    for (let key of augments_owned) {
        //use only the name
        augments_list.push(key[0])
    }
    //return the list
    return augments_list
}



/**
 * Enum of all factions with their work types
 * Slum snakes (gang faction) and bladeburner cannot be worked for, hence they have no work_types
 * Work types: "field", "hacking", "security" 	
 */
export const factions = {
    //special factions (no faction work available)
    slum_snakes: { name: "Slum Snakes" },
    bladeburners: { name: "Bladeburners" },
    church_of_the_machine_god: { name: "Church of the Machine God" },
    shadows_of_anarchy: { name: "Shadows of Anarchy" },

    //important factions
    daedalus: { name: "Daedalus", work_types: ["field", "hacking"] },
    illuminati: { name: "Illuminati", work_types: ["field", "hacking"] },
    the_covenant: { name: "The Covenant", work_types: ["field", "hacking"] },

    //company factions
    e_corp: { name: "ECorp", work_types: ["field", "hacking", "security"] },
    mega_corp: { name: "MegaCorp", work_types: ["field", "hacking", "security"] },
    bachman_and_ssociates: { name: "Bachman & Associates", work_types: ["field", "hacking", "security"] },
    blade_industries: { name: "Blade Industries", work_types: ["field", "hacking", "security"] },
    nwo: { name: "NWO", work_types: ["field", "hacking", "security"] },
    clarke_incorporated: { name: "Clarke Incorporated", work_types: ["field", "hacking", "security"] },
    omni_tek_incorporated: { name: "OmniTek Incorporated", work_types: ["field", "hacking", "security"] },
    four_sigma: { name: "Four Sigma", work_types: ["field", "hacking", "security"] },
    kuai_gong_international: { name: "KuaiGong International", work_types: ["field", "hacking", "security"] },
    fulcrum_secret_technologies: { name: "Fulcrum Secret Technologies", work_types: ["hacking", "security"] },

    //hacking factions
    bit_runners: { name: "BitRunners", work_types: ["hacking"] },
    the_black_hand: { name: "The Black Hand", work_types: ["field", "hacking"] },
    nite_sec: { name: "NiteSec", work_types: ["hacking"] },
    cyber_sec: { name: "CyberSec", work_types: ["hacking"] },

    //location factions
    aevum: { name: "Aevum", work_types: ["field", "hacking", "security"] },
    chongqing: { name: "Chongqing", work_types: ["field", "hacking", "security"] },
    ishima: { name: "Ishima", work_types: ["field", "hacking", "security"] },
    newTokyo: { name: "New Tokyo", work_types: ["field", "hacking", "security"] },
    sector12: { name: "Sector-12", work_types: ["field", "hacking", "security"] },
    volhaven: { name: "Volhaven", work_types: ["field", "hacking", "security"] },

    //crime factions
    speakers_for_the_dead: { name: "Speakers for the Dead", work_types: ["field", "hacking", "security"] },
    the_dark_army: { name: "The Dark Army", work_types: ["field", "hacking"] },
    the_syndicate: { name: "The Syndicate", work_types: ["field", "hacking", "security"] },
    silhouette: { name: "Silhouette", work_types: ["field", "hacking"] },
    tetrads: { name: "Tetrads", work_types: ["field", "security"] },

    //other factions
    netburners: { name: "Netburners", work_types: ["hacking"] },
    tian_di_hui: { name: "Tian Di Hui", work_types: ["hacking", "security"] },
}



//enum for checking features
export const functionality = {
  //genesis: bit node 1: -
  gang: "gang", //bit node 2: namespace gang
  corporation: "corporation", //bit node 3: namespace corporation
  //singularity: bit node 4: namespace singularity
  intelligence: "intelligence", //bit node 5: function bitnodeMultipliers, namespace formula's
  bladeburner: "bladeburner", //bit node 6 & 7: namespace bladeburner
  stocks: "stocks", //bit node 8: namespace Tix (short and limit orders)
  hacknet: "hacknet", //bit node 9: namespace hacknet
  sleeve: "sleeve", //bit node 10: namespace sleeve, grafting
  //Company: bit node 11: -
  //Neuroflux: bit node 12: -
  stanek: "stanek", //bit node 13: namespace stanek
  ipvgo: "ipvgo", //bit node 14: namespace ipvgo
}



/**
  * Function that checks if functionality is available
  * either by being in the bitnode that enables it
  * or by having it unlocked by destroying the corresponding bit node
  * also checked if not disabled by challenge config or bit node multipliers
  * returns boolean indicating access to functionality
**/
export function get_availability_functionality(ns, functionality) {
  //stub
  return false
  /*
  //get challenge flags -> to transfer to bit node options???
  const challenge_flags = get_challenge_flags(ns)
  //get current bit node and level
  const reset_info = get_reset_info(ns)
  const source_files = 0
  const bit_node = -1
  const bit_node_level = -1
  //get bit node multipliers
  const bit_node_multipliers = 0
  
  switch (functionality) {
      
  case functionality.gang: //bit node 2: namespace gang
    if((bit_node == 2) || //if in bit node
      (source_files.has(2)) && //or has source file
      (challenge_flags == false) && //not disabled by challenge
      (bit_node_multipliers.x > y)) { //not disabled by bit node multipliers
      //we should have access
      return true
    }  
    //indicate failure
    return false
  
  case functionality.corporation: //bit node 3: namespace corporation
    if((bit_node == 3) || //if in bit node
      (source_files.has(3)) && //or has source file
      (challenge_flags == false) && //not disabled by challenge
      (bit_node_multipliers.x > y)) { //not disabled by bit node multipliers
      //we should have access
      return true
    }  
    //indicate failure
    return false
  
  case functionality.intelligence: //bit node 5: function bitnodeMultipliers, namespace formula's
    if((bit_node == 5) || //if in bit node
      (source_files.has(5)) && //or has source file
      (challenge_flags == false) && //not disabled by challenge
      (bit_node_multipliers.x > y)) { //not disabled by bit node multipliers
      //we should have access
      return true
    }  
    //indicate failure
    return false
  
  case functionality.bladeburner: //bit node 6 & 7: namespace bladeburner
    if((bit_node == 6) || //if in bit node
      (source_files.has(6)) && //or has source file
      (challenge_flags == false) && //not disabled by challenge
      (bit_node_multipliers.x > y)) { //not disabled by bit node multipliers
      //we should have access
      return true
    }  
    //indicate failure
    return false
  
  case functionality.stocks: //bit node 8: namespace Tix (short and limit orders)
    if((bit_node == 8) || //if in bit node
      (source_files.has(8)) && //or has source file
      (challenge_flags == false) && //not disabled by challenge
      (bit_node_multipliers.x > y)) { //not disabled by bit node multipliers
      //we should have access
      return true
    }  
    //indicate failure
    return false
  
  case functionality.hacknet: //bit node 9: namespace hacknet
    if((bit_node == 9) || //if in bit node
      (source_files.has(9)) && //or has source file
      (challenge_flags == false) && //not disabled by challenge
      (bit_node_multipliers.x > y)) { //not disabled by bit node multipliers
      //we should have access
      return true
    }  
    //indicate failure
    return false
  
  case functionality.sleeve: //bit node 10: namespace sleeve, grafting
    if((bit_node == 10) || //if in bit node
      (source_files.has(10)) && //or has source file
      (challenge_flags == false) && //not disabled by challenge
      (bit_node_multipliers.x > y)) { //not disabled by bit node multipliers
      //we should have access
      return true
    }  
    //indicate failure
    return false

  case functionality.stanek: //bit node 13: namespace stanek
    if((bit_node == 13) || //if in bit node
      (source_files.has(13)) && //or has source file
      (challenge_flags == false) && //not disabled by challenge
      (bit_node_multipliers.x > y)) { //not disabled by bit node multipliers
      //we should have access
      return true
    }  
    //indicate failure
    return false
  
  case functionality.ipvgo: //bit node 14: namespace ipvgo
    if((bit_node == 14) || //if in bit node
      (source_files.has(14)) && //or has source file
      (challenge_flags == false) && //not disabled by challenge
      (bit_node_multipliers.x > y)) { //not disabled by bit node multipliers
      //we should have access
      return true
    }  
    //indicate failure
    return false

  //uncaught condition
  default:
    //unknown = no access
    return false
  }
  */
  //failsafe
  return false
}



/**
 * 
 */
export function disable_logging(ns, log_topics) {
  //assuming array of log topics
  //stop logging of the stop logging...
  ns.disableLog("disableLog")
  //for each topic of the argument
  for (const log_topic of log_topics) {
    //disable logging
    ns.disableLog(log_topic)
  }
}

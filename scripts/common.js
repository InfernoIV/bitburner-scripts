/*
This file shows the commons used in other scripts
  script names, ports, hostnames
*/
/*
import { 
  enum_port, enum_servers, enum_scripts
  log, info, success, warning, error, fail,
} from "scripts/common.js"
*/
//file constants
export const file_bit_node_multipliers = "bit_node_multipliers.json"
export const file_reset_info = "reset_info.json"
export const file_challenge_flags = "challenge.json"
export const file_bit_node_progression = "bit_node_progression.json"

//log constants
export const info = "INFO"
export const success = "SUCCESS"
export const warning = "WARNING"
export const error = "ERROR"
export const fail = "FAIL"


//communication port definitions
export const enum_port = {
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
export const portNoData = "NULL PORT DATA"



/**
 * enum of special servers
 * All servers will be backdoored, if possible
 */
export const enum_servers = {
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
export const enum_scripts = {
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
 * Enum of all factions with their work types
 * Slum snakes (gang faction) and bladeburner cannot be worked for, hence they have no work_types
 * Work types: "field", "hacking", "security" 	
 */
export const enum_factions = {
    //special factions (no faction work available)
    slumSnakes: { name: "Slum Snakes" },
    bladeburners: { name: "Bladeburners" },
    churchOfTheMachineGod: { name: "Church of the Machine God" },
    shadowsOfAnarchy: { name: "Shadows of Anarchy" },

    //important factions
    daedalus: { name: "Daedalus", work_types: ["field", "hacking"] },
    illuminati: { name: "Illuminati", work_types: ["field", "hacking"] },
    theCovenant: { name: "The Covenant", work_types: ["field", "hacking"] },

    //company factions
    eCorp: { name: "ECorp", work_types: ["field", "hacking", "security"] },
    megaCorp: { name: "MegaCorp", work_types: ["field", "hacking", "security"] },
    bachmanAssociates: { name: "Bachman & Associates", work_types: ["field", "hacking", "security"] },
    bladeIndustries: { name: "Blade Industries", work_types: ["field", "hacking", "security"] },
    nWO: { name: "NWO", work_types: ["field", "hacking", "security"] },
    clarkeIncorporated: { name: "Clarke Incorporated", work_types: ["field", "hacking", "security"] },
    omniTekIncorporated: { name: "OmniTek Incorporated", work_types: ["field", "hacking", "security"] },
    fourSigma: { name: "Four Sigma", work_types: ["field", "hacking", "security"] },
    kuaiGongInternational: { name: "KuaiGong International", work_types: ["field", "hacking", "security"] },
    fulcrumSecretTechnologies: { name: "Fulcrum Secret Technologies", work_types: ["hacking", "security"] },

    //hacking factions
    bitRunners: { name: "BitRunners", work_types: ["hacking"] },
    theBlackHand: { name: "The Black Hand", work_types: ["field", "hacking"] },
    niteSec: { name: "NiteSec", work_types: ["hacking"] },
    cyberSec: { name: "CyberSec", work_types: ["hacking"] },

    //location factions
    aevum: { name: "Aevum", work_types: ["field", "hacking", "security"] },
    chongqing: { name: "Chongqing", work_types: ["field", "hacking", "security"] },
    ishima: { name: "Ishima", work_types: ["field", "hacking", "security"] },
    newTokyo: { name: "New Tokyo", work_types: ["field", "hacking", "security"] },
    sector12: { name: "Sector-12", work_types: ["field", "hacking", "security"] },
    volhaven: { name: "Volhaven", work_types: ["field", "hacking", "security"] },

    //crime factions
    speakersForTheDead: { name: "Speakers for the Dead", work_types: ["field", "hacking", "security"] },
    theDarkArmy: { name: "The Dark Army", work_types: ["field", "hacking"] },
    theSyndicate: { name: "The Syndicate", work_types: ["field", "hacking", "security"] },
    silhouette: { name: "Silhouette", work_types: ["field", "hacking"] },
    tetrads: { name: "Tetrads", work_types: ["field", "security"] },

    //other factions
    netburners: { name: "Netburners", work_types: ["hacking"] },
    tianDiHui: { name: "Tian Di Hui", work_types: ["hacking", "security"] },
}


/**
 * Enum stating all cities
 */
export const enum_cities = {
    aevum: "Aevum",
    chongqing: "Chongqing",
    ishima: "Ishima",
    newTokyo: "New Tokyo",
    sector12: "Sector-12",
    volhaven: "Volhaven",
}



// hacking commands
export const enum_hackingCommands = {
    start: "Start",
    stop: "Stop",
}



/**
 * Function that overwrites the specified port with new data
 * Cost: 0
 */
export function overwrite_port(ns, port, data) {
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
  return JSON.parse(ns.read(file_bit_node))
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

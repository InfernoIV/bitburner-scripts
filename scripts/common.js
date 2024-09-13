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
}



/**
 * Enum containing scripts
 */
export const enum_scripts = {
    boot: "scripts/boot.js",
    main: "scripts/main.js",
    jump: "scripts/jumpScript.js",
    destroyBitNode: "scripts/destroyBitNode.js",
    reset: "scripts/reset.js",
    backdoor: "scripts/backdoor.js",
    hack: "scripts/hack.js",
    gang: "scripts/gang.js",
    corporation: "scripts/corporation.js",
    stock: "scripts/stock.js",
    workerHack: "scripts/workerHack.js",
    workerGrow: "scripts/workerGrow.js",
    workerWeaken: "scripts/workerWeaken.js",
    stanekCreate: "scripts/stanekCreate.js",
    stanekCharge: "scripts/stanekCharge.js",
    workerCharge: "scripts/workerCharge.js",
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



//log constants
export const info = "INFO"
export const success = "SUCCESS"
export const warning = "WARNING"
export const error = "ERROR"
export const fail = "FAIL"

/*
This file shows the commons used in other scripts
  script names, ports, hostnames
*/
//import { enum_port, enum_servers, enum_scripts} from "scripts/common.js"
//backdoor.js, gang.js
const enum_port = {
  //external scripts
  reset: 1,
  hack: 2,
  gang: 3,
  corporation: 4,
  stock: 5,
  backdoor: 6,
}



//boot.js, destroyBitNode.js, reset.js
/**
 * enum of special servers
 * All servers will be backdoored, if possible
 */
const enum_servers = {
    home: "home",   //no effect
    worldDaemon: "w0r1d_d43m0n",    //bitnode destruction
    //fulcrumSecretTechnologies: "fulcrumassets",     //fulcrum faction
}



/**
 * Enum containing scripts
 */
const enum_scripts = {
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

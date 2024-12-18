//common
import * as common from "scripts/common.js"
//config
import * as config from "./config.js"
//data
import * as data from "./data.js"


/**
 * Seperate funtion that scans the network and will resolve coding contracts
 */
export function main(ns) {
  //stub
  init()
  //infinite loop
  while(true) {
    //check for coding contracts
    const contract = check_for_contracts(ns)
    //if a contract has been found
    if (contract != "NONE FOUND") {
      //resolve the contract
      resolve_contract(ns, contract)
    }
    //wait a bit
    await ns.sleep(config.sleep_time)
  }
}



/**
 *
 */
function init(ns) {
  //stub
  //disable logging?
}



/**
 * Function that scans servers and will either return a contract path, or "INVALID"
 */
function check_for_contracts(ns) {
  //set the default value for the contract
  let contract = "NONE FOUND"
  //stub
  return contract
}



/**
 * function that will check the contract type, and will launch the correct function to resolve it
 */
function resolve_contract(ns, contract) {
  //stub
}

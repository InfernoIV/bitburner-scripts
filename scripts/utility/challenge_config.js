//imports
import file_challenge_flags from "scripts/common.js

/**
 * Script that writes config to file (JSON)
 * To be read (parsed) by other scripts
 JSON.parse(ns.read("bitNode/" + ns.getreset_info().currentNode + ".json"))
 * @param {NS} ns
 */
export async function main(ns) {    
  //Challenge configuration
  const challenge = {
    limit_home_server: false, //limits the home server to 128GB and 1 core (challenge bitnode 1)
    disable_gang: false, //disables gang (challenge bitnode 2)
    disable_corporation: false, //disables corporation (challenge bitnode 3)
    //no challenges for bitnode 4 and 5
    disable_bladeburner: true, //disables bladeburner (challenge bitnode 6 and 7)
    disable_s4_market_data: false, //disables S4 market data (challenge bitnode 8)
    disable_hacknet_servers: false, //disables hacknet servers (challenge bitnode 9)
    disable_sleeves: false, //disables sleeves (challenge bitnode 10)
    //no challenges for bitnode 11 and 12
    disable_stanek: false, //disables stanek (challenge bitnode 13)
  }
  //write data to file
  ns.write(file_challenge_flags, JSON.stringify(challenge), "w")  
}

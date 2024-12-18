//data
import * as data from "./data.js"
//common
import * as common from "scripts/common.js"


/*
File to use when hacknet functionality IS unlocked
*/
/**
 * Function that manages buying and upgrading of servers
 * Also takes care of Faction Netburner enum_requirements
 * No updating of cache: it is all spent on money
 * Cost: 10 GB
 *  upgradeHomeCores (3)
 *  upgradeHomeRam (3)
 *  hacknet (4)
 */
export function manage_network(ns) {
    //try to upgrade home RAM first
    ns.singularity.upgradeHomeRam()
    //for each buyable server possible
    for (let index = ns.hacknet.numNodes(); index < ns.hacknet.maxNumNodes(); index++) {
        //buy server
        ns.hacknet.purchaseNode()
    }
    //for each owned server
    for (let server_index = 0; server_index < ns.hacknet.numNodes(); server_index++) {
        //upgrade ram
        ns.hacknet.upgradeRam(server_index)
        //get the stats of the network (which are important to check)      
        let hacknet_stats = { level: 0, cores: 0, }
        //for each owned node
        for (let node_index = 0; node_index < ns.hacknet.numNodes(); node_index++) {
            //get the stats
            let nodeStats = ns.hacknet.getNodeStats(node_index)
            //add the level
            hacknet_stats.level += nodeStats.level
            //add the cores
            hacknet_stats.cores += nodeStats.cores
        }
        //only conditionally level the cores
        if (hacknet_stats.cores < data.hacknet_faction_requirements.cores) {
            //upgrade cores
            ns.hacknet.upgradeCore(server_index)
        }
        //only conditionally level the levels
        if (hacknet_stats.level < data.hacknet_faction_requirements.levels) {
            //upgrade level
            ns.hacknet.upgradeLevel(server_index)
        }
    }
    //upgrade home cores
    ns.singularity.upgradeHomeCores()
}



/**
 * Function that manages spending of hashes
 * Cost: 
 * options for spending:
    * General:
        * Sell for Money (failsafe if coding contract script is not running)
        * Generate Coding Contract (failsafe to ensure hash spending)
        * Company Favor (not needed, sleeve will take care of this)
        * Improve studying (not needed, sleeve will take care of this)
        * Improve Gym Training (not needed, sleeve will take care of this)
        * Increase Maximum Money (not needed, resets on installation of augments)
        * Reduce Minimum Security (not needed, resets on installation of augments)
    * Corporation:
        * Sell for Corporation Funds (to determine when to spend)
        * Exchange for Corporation Research (to determine when to spend)
    * Bladeburner:
        * Exchange for Bladeburner Rank (to determine when to spend: only needed when rank is low but min chance is 100% )
        * Exchange for Bladeburner SP (to determine when to spend: we can always spend it?)
 */
function manage_hashes(ns) {
    //set default target to money
    let hash_spend_target = data.hash_upgrades.money
    //check if we can generate coding contracts
    if(false) {
        //replace the default
        hash_spend_target = data.hash_upgrades.codingContract
    }
    //check on what we would like to spend on
    let hash_spend_options = []
    //if corporation is unlocked
    if(false) {
        //if funds are needed
        if(true) {
            //add to the list
            hash_spend_options.push(data.hash_upgrades.corporationFunds)
        }
        //if research is needed
        if(true) {
            //add to the list
            hash_spend_options.push(data.hash_upgrades.corporationResearch)
        }
    }
    //if bladeburner is unlocked
    if(false) {
        //if we need rank
        if(true) {
            //add to the list
            hash_spend_options.push(data.hash_upgrades.bladeburnerRank)
        }
        //if we need skill points
        if(true) {
            //add to the list
            hash_spend_options.push(data.hash_upgrades.bladeburnerSkillPoints)
        }
    }
    //get the lowest to spend of the list
    //variable to store cost in (set to high)
    let hash_spend_cost = 999999
    //for each option
    for (const hash_spend_option in hash_spend_options) {
        //get cost
        const cost = ns.hashCost(hash_spend_option, 1)
        //if lower cost
        if(cost < hash_spend_cost) {
            //save option
            hash_spend_target = hash_spend_option
            //save cost
            hash_spend_cost = cost
        }
    }
    //spend the hashes
    ns.hacknet.spendHashes(hash_spend_target)
}

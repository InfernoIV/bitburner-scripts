//data
import * as data from "./data.js"
//common
import * as common from "scripts/common.js"



/**
 * Function that manages buying and upgrading of servers
 * hacknet servers are reset on installing of augments, home server is NOT reset 
 * Also takes care of Faction Netburner enum_requirements
 * Cost: 10 GB
     * upgradeHomeCores (3)
     * upgradeHomeRam (3)
     * hacknet (4)
 */
export function manage_network(ns) {
    //manage the hashes and return the highest cost
    const highest_hash_cost = manage_hashes(ns) 
    //expand the network (get more RAM)
    const number_of_nodes_owned = expand_network(ns)
    //unlock hacknet faction
    if(unlock_hacknet_faction(ns, number_of_nodes_owned)) {
        //if unlocked, upgrade in priority (level, cores, cache)
        upgrade_network(ns, number_of_nodes_owned, highest_hash_cost)
    }
}



/**
 * Function that expands the network (RAM)
 */
function expand_network(ns) {
    //try to upgrade home RAM first
    ns.singularity.upgradeHomeRam()
    //for each buyable server possible
    for (let index = ns.hacknet.numNodes(); index < ns.hacknet.maxNumNodes(); index++) {
        //buy server
        ns.hacknet.purchaseNode()
    }
    //get the number of nodes owned
    const number_of_nodes_owned = ns.hacknet.numNodes()
    //for each owned server
    for (let server_index = 0; server_index < number_of_nodes_owned; server_index++) {
        //upgrade ram
        ns.hacknet.upgradeRam(server_index)
    }
    //return the amount of nodes owned
    return number_of_nodes_owned
}



/**
* Function that will level stats to unlock the hacknet faction
*/
function unlock_hacknet_faction(ns, number_of_nodes_owned) {
    //get the stats of the network (which are important to check)      
    let hacknet_stats = { level: 0, cores: 0, }
    //for each owned server
    for (let server_index = 0; server_index < number_of_nodes_owned; server_index++) {  
        //for each owned node
        for (let node_index = 0; node_index < number_of_nodes_owned; node_index++) {
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
            if(ns.hacknet.upgradeCore(server_index)) {
                //if successfull: add the counter
                hacknet_stats.cores += 1
            }
        }
        //only conditionally level the levels
        if (hacknet_stats.level < data.hacknet_faction_requirements.levels) {
            //upgrade level
            if(ns.hacknet.upgradeLevel(server_index)) {
                //if successfull: add the counter
                hacknet_stats.level += 1
            }
        }
    }
    //get the comparison values
    const hacknet_cores_reached = hacknet_stats.cores >= data.hacknet_faction_requirements.cores
    const hacknet_levels_reached = hacknet_stats.level >= data.hacknet_faction_requirements.levels
    //return the status
    return (hacknet_cores_reached && hacknet_levels_reached)
}



/**
 * Function that upgrades the rest of the network (cores, level, hash)
 * Effects:
     * Cores: impacts certain functions: hack/weaken/grow, also improves hash rate
     * Levels: ???, also improves hash rate
     * Cache: Expands the hash cache limit
 */
function upgrade_network(ns, number_of_nodes_owned, highest_hash_cost) {
    //upgrade home cores
    ns.singularity.upgradeHomeCores()
    //for each owned server
    for (let server_index = 0; server_index < number_of_nodes_owned; server_index++) {
        //TODO: determine priority
        
        //upgrade cores
        ns.hacknet.upgradeCore(server_index)
        //upgrade levels
        ns.hacknet.upgradeLevel(server_index)
        
        //if not enough hash capacity for the most expensive cost we want
        if(ns.hacknet.hashCapacity() < highest_hash_cost) {
            //upgrade cache
            ns.hacknet.upgradeCache(server_index)
        }
    }
}



/**
 * Function that manages spending of hashes
 * Cost: 0 GB
    * Hacknet.hashCost() 0 GB
    * Hacknet.spendHashes() 0 GB
 * Options for spending:
    * General:
        * Sell for Money (failsafe if coding contract script is not running) Costs: 4
        * Generate Coding Contract (failsafe to ensure hash spending) Costs: 200, 400, ...
        * Company Favor (not needed, sleeve will take care of this) Costs: 200, 400, ...
        * Improve studying (not needed, sleeve will take care of this) Costs: 50, 100, ... 
        * Improve Gym Training (not needed, sleeve will take care of this) Costs: 50, 100, ... 
        * Increase Maximum Money (not needed, resets on installation of augments) Costs: 50, 100, ... 
        * Reduce Minimum Security (not needed, resets on installation of augments) Costs: 50, 100, ... 
    * Corporation:
        * Sell for Corporation Funds (to determine when to spend) Costs: 100, 200, ... 
        * Exchange for Corporation Research (to determine when to spend) Costs: 200, 400, ...
    * Bladeburner:
        * Exchange for Bladeburner Rank (to determine when to spend: only needed when rank is low but min chance is 100% ) Costs: 250, 500, ...
        * Exchange for Bladeburner SP (to determine when to spend: we can always spend it?) Costs: 250, 500, ...
* hashUpgrade properties:
   * cost: If the upgrade has a flat cost (never increases), it goes here. Otherwise, this property should be undefined. This property overrides the 'costPerLevel' property
   * costPerLevel: Base cost for this upgrade. Every time the upgrade is purchased, its cost increases by this same amount (so its 1x, 2x, 3x, 4x, etc.)
   * @param {NS} ns
 */
function manage_hashes(ns) {
    //set default target to money
    let hash_spend_target = data.hash_upgrades.money
    //check if we can generate coding contracts or 
    //if the cost of coding contracts is greater than the hash capacity and we are (nearly) on the hash limit
    if(false) {
        //replace the default
        hash_spend_target = data.hash_upgrades.codingContract
    }
    //check on what we would like to spend on
    let hash_spend_options = []
    //if corporation funds are needed
    if(ns.peek(common.port.hash_corporation_funds) == common.port_commands.needed) {
        //add to the list
        hash_spend_options.push(data.hash_upgrades.corporationFunds)
    }
    //if corporation research is need
    if(ns.peek(common.port.hash_corporation_research) == common.port_commands.needed) {
        //add research to the list
        hash_spend_options.push(data.hash_upgrades.corporationResearch)
    }
    //if we need bladeburner rank
    if(ns.peek(common.port.hash_bladeburner_rank) == common.port_commands.needed) {
        //add to the list
        hash_spend_options.push(data.hash_upgrades.bladeburnerRank)
    }
    //if we need bladeburner skill points
   if(ns.peek(common.port.hash_bladeburner_skill_points) == common.port_commands.needed) {
        //add to the list
        hash_spend_options.push(data.hash_upgrades.bladeburnerSkillPoints)
    }
    
    //get the lowest to spend of the list
    //variable to store cost in (set to high)
    let hash_spend_cost = -1
    //for each option
    for (const hash_spend_option in hash_spend_options) {
        //get cost
        const cost = ns.hacknet.hashCost(hash_spend_option, 1)
        //if lower cost or if not set yet
        if((cost < hash_spend_cost) || (hash_spend_cost == -1)) {
            //save option
            hash_spend_target = hash_spend_option
            //save cost
            hash_spend_cost = cost
        }
    }
    //spend the hashes (or fail when to expensive: then it will succeed in the future)
    if(ns.hacknet.spendHashes(hash_spend_target)) {
        //log information
        common.log(ns, 1, "Spend hashes on '" + hash_spend_target + "'")
    }
    //get hash data
    const num_hashes = Math.round(ns.hacknet.numHashes())
    const max_hashes = ns.hacknet.hashCapacity()
    //write data to port
    common.over_write_port(ns, common.port.hash_amount, num_hashes + "/" + max_hashes)
}

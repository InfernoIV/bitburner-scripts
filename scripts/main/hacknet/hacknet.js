//data
import * as data from "../data.js"
//common
import * as common from "../common.js"


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
export function manage_servers(ns) {
    //get challenge flags
    const challenge_flags = get_challenge_flags(ns)
    //if not limiting home for challenge
    if(!challenge_flags.limit_home_server) {
        //try to upgrade home RAM first
        ns.singularity.upgradeHomeRam()
    }

    //if not hacknet disabled for challenge
    if(!challenge_flags.disable_hacknet_servers) {
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
            if (hacknet_stats.cores < data.requirements.faction_netburners.cores) {
                //upgrade cores
                ns.hacknet.upgradeCore(server_index)
            }
    
            //only conditionally level the cores
            if (hacknet_stats.level < data.requirements.faction_netburners.levels) {
                //upgrade level
                ns.hacknet.upgradeLevel(server_index)
            }
        }
    }
    
    //if not limiting home for challenge
    if(!challenge_flags.limit_home_server) {
        //upgrade home cores
        ns.singularity.upgradeHomeCores()
    }

    //if not hacknet disabled for challenge
    if(!challenge_flags.disable_hacknet_servers) {
        //manage hashes
        //just spend hashes on money
        ns.hacknet.spendHashes(data.hash_upgrades.money)
    }
}

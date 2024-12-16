/*
File to be used by multiple scripts, but these have functions that costs ram
Conditional import is advised to minimize costs
*/
//common
import * as common from "scripts/common.js"



/**
 * Function that only returns servers (objects) 
 * That have RAM or money, and that have admin access (can run scripts)
 * Parameter determines if it returns ram (true) or money (false) server objects
 * Cost: 2,2 GB
 *  ns.getServer: 2 GB
 *  Inherited get_servers: 0,2 GB
 */
export function get_server_specific(ns, server_has_ram = false) {
    //create a list (of objects) to return
    let server_list = []
    //get all servers
    const servers_all = get_servers(ns)
    //for each server
    for (let index = 0; index < servers_all.length; index++) {
        //get server information
        let server = ns.getServer(servers_all[index])
        //if we have admin rights
        if (server.hasAdminRights) {
            //if we need to check ram and there is ram, or if we need to check money and there is money
            if (((server_has_ram) && (server.maxRam > 0)) || ((!server_has_ram) && (server.moneyMax > 0))) {
                //add the server object to the list
                server_list.push(server)
            }
        }
    }
    //return server list
    return server_list
}



/**
 * Function that will retrieve all server hostnames
 * Cost: 0,2 GB
 *   Inherited scan_server: 0,2 GB
 */
export function get_servers(ns) {
    //create list to save hostnames into
    let server_list = []
    //start scanning from home
    scan_server(ns, common.servers.home, server_list)
    //return the server list
    return server_list
}



/**
 * Function that will retrieve all servers, sub function of get_servers
 * Cost: 0,2 GB
 *  ns.scan: 0,2 GB
 */
function scan_server(ns, hostname, server_list) {
    //get the neighbours of the server
    const neighbours = ns.scan(hostname)
    //for each neighbour
    for (const neighbour of neighbours) {
        //if not in the list
        if (server_list.indexOf(neighbour) == -1) {
            //add to list
            server_list.push(neighbour)
            //start scanning
            scan_server(ns, neighbour, server_list)
        }
    }
}

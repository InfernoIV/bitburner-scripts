//import common functions
import * as common from "scripts/common.js"
//import config
import * as config from "./config.js"



/**
 * Function that manages the backdooring servers
 * waits for data from main.js to backdoor the received servers
 * Cost: 5,8 GB
 *   base script cost: 1,6 GB
 *   ns.peek: 0 GB
 *   Inherited init: 2 GB
 *   Inherited backdoor_server: 2,2 GB (overlaps 2 GB with init)
 *   ns.readPort: 0 GB
 *   ns.sleep: 0 GB
 * @param {NS} ns 
 */
export async function main(ns) {
    //initialize
    init(ns)
    
    //main loop
    while (true) {
        //get hostname (only remove data when finished)
        let server = ns.peek(common.port.backdoor)
        //if set
        if (server != common.port_no_data) {
            //backdoor the server
            await backdoor_server(ns, server)
            //remove the current hostname from the port (only when it has finished
            ns.readPort(common.port.backdoor)
        }
        //wait a bit
        await ns.sleep(100)
    }
    //script never ends
}



/**
 * Function that disables logging and connects to home
 * Cost: 2 GB
 *   ns.singularity.connect: 2 GB
 */
function init(ns) {
    //disable logging
    common.disable_logging(ns, config.disabled_logs)    
    //connect to home to ensure proper starting state 
    ns.singularity.connect(common.servers.home)
}



/**
 * Function that checks on port 
 * Cost: 4,2 gb
 *   ns.scan: 0,2 GB
 *   ns.singularity.connect: 2 GB
 *   ns.singularity.installBackdoor: 2 GB
**/
async function backdoor_server(ns, server) {
    //create a list to hold the route
    let route = []
    //create a variable to save current server, and set it to current hostname
    let step = server
    //while not found home
    while (step != common.servers.home) {
        //save the first scan result
        let nextStep = ns.scan(step)[0]
        //add current to the start of the list
        route.unshift(step)
        //update target for next scan
        step = nextStep
    }
    
    //for every jump of the route    
    for (let jump of route) {
        //connect to the step
        ns.singularity.connect(jump)
    }
    
    //try-catch to ensure script not crashing
    try {
        //install backdoor
        await ns.singularity.installBackdoor()
        //log information
        common.log(ns, config.log_level, common.success, "Backdoored server '" + server + "'")
        //catch error
    } catch (err) {
        //log error
        common.log(ns, config.log_level, common.error, "Failed to backdoored server '" + server + "': " + err)
    }
    //connect to home
    ns.singularity.connect(common.servers.home)
}

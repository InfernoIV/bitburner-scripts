//imports
import {  
    success, error, portNoData, //constants
    enum_port, enum_servers, //enums
    log, //functions
} from "scripts/common.js"



/** @param {NS} ns */
export async function main(ns) {
    //initialize
    init(ns)
    
    //connect to home
    ns.singularity.connect(enum_servers.home)

    //main loop
    while (true) {
        //get hostname
        let server = ns.peek(enum_port.backdoor)
        //if set
        if (server != portNoData) {
            //create a list to hold the route
            let route = []
            //create a variable to save current server, and set it to current hostname
            let step = server
            //while not found home
            while (step != enum_servers.home) {
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
                //log locally
                log(ns, 0, success, "Backdoored server '" + server + "'")
                //catch error
            } catch (err) {
                //log error
                log(ns, 0, error, "Failed to backdoored server '" + server + "': " + err)
            }
            //connect to home
            ns.singularity.connect(enum_servers.home)

            //remove the current hostname from the port
            ns.readPort(enum_port.backdoor)
        }
        //wait a bit
        await ns.sleep(100)
    }
    //script never ends
}



/**
 * Function that disables logging
 */
function init(ns) {
    //disable logging
    ns.disableLog("disableLog")
    ns.disableLog("scan")
    ns.disableLog("singularity.installBackdoor")
    ns.disableLog("sleep")
}

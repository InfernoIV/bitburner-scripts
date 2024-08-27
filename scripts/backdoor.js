//imports
import { enum_port, enum_servers } from "scripts/common.js"



/** @param {NS} ns */
export async function main(ns) {
    
    //connect to home
    ns.singularity.connect(serverHome)

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

                //catch error
            } catch (error) {
                //log error
                ns.tprint(error)
            }
            //connect to home
            ns.singularity.connect(enum_servers.home)

            //clear port
            ns.clearPort(enum_port.backdoor)
        }
        //wait a bit
        await ns.sleep(100)
    }
    //script never ends
}

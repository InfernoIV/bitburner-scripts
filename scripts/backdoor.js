/** @param {NS} ns */
export async function main(ns) {
    const serverHome = "home"
    const portNoData = "NULL PORT DATA"

    const enum_port = {
        //external scripts
        reset: 1,
        hack: 2,
        gang: 3,
        corporation: 4,
        stock: 5,
        backdoor: 6,
    }

    //log(ns,1,info,ns.args)
    //ns.disableLog("singularity.installBackdoor")
    ns.disableLog("sleep")
    ns.disableLog("scan")
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
            while (step != serverHome) {
                //save the first scan result
                var nextStep = ns.scan(step)[0]
                //add current to the start of the list
                route.unshift(step)
                //update target for next scan
                step = nextStep
                //wait a bit
                //await ns.sleep(1)
            }
            //for every jump of the route    
            for (let jump of route) {
                //connect to the step
                ns.singularity.connect(jump)
            }
            try {
                //install backdoor
                await ns.singularity.installBackdoor()
            } catch (error) { }
            //connect to home
            ns.singularity.connect(serverHome)

            //clear port
            ns.clearPort(enum_port.backdoor)
        }
        //wait a bit
        await ns.sleep(100)
    }
}

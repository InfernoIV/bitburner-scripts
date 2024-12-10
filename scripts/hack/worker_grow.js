/** @param {NS} ns 
 * 
 * arguments:
 * 0 - hostname (string)
 * 1 - Number of threads (1+)
 * 2 - delay in msec (0+)
 * 3 - affectsStock (true/false) 
 * 4 - singleInstance (true/false)
*/
export async function main(ns) {
    //ns.tprint(ns.args)
    let timeStart = Date.now()
    let targetHostname = " "
    if (ns.args[0] != undefined) {
        targetHostname = ns.args[0]
    } else {
        ns.tprint("ERROR " + "No hostname!")
        return
    }

    let delay = 0
    if (ns.args[1] != undefined) {
        delay = ns.args[1]
    }

    let threads = 1
    if (ns.args[2] != undefined) {
        threads = ns.args[2]
    }

    let hostname = ns.args[3]

    
    let logLevel = 0
    if (ns.args[4] != undefined) {
        logLevel = ns.args[4]
    }
    

    let moneyGrown = await ns.grow(targetHostname, { additionalMsec: delay })
    let timeEnd = Date.now()
    //not formatted for use in comparison in excel
    let message = hostname + " grew (" + threads + ") '" + targetHostname + "' for " + '\t' + moneyGrown + "\t" + timeStart + "\t" + timeEnd + "\t" + (timeEnd - timeStart) + "\t" + delay + "\t" + (timeEnd - timeStart - delay)
    if(logLevel >= 1) {
        ns.tprint("SUCCESS " + message)
    } else {
        ns.print("SUCCESS " + message)
    }
}
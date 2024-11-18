


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
    //set start time
    let timeStart = Date.now()
    //get target hostname from args
    let targetHostname = " "
    if (ns.args[0] != undefined) {
        targetHostname = ns.args[0]
    } else {
        ns.tprint("ERROR" + " No hostname!")
        return
    }
    //get the delay from args
    let delay = 0
    if (ns.args[1] != undefined) {
        delay = ns.args[1]
    }
    //get the threads from args
    let threads = 1
    if (ns.args[2] != undefined) {
        threads = ns.args[2]
    }
    //get own hostname from args
    let hostname = ns.args[3]
    //get log level from args
    
    let logLevel = 0
    if (ns.args[4] != undefined) {
        logLevel = ns.args[4]
    }
    

    //calculate amount of money hacked
    let moneyHacked = await ns.hack(targetHostname, { additionalMsec: delay })
    //get end time
    let timeEnd = Date.now()
    let message = ""
    //if any money is hacked (indicated success)
    if (moneyHacked > 0) {
        //log success
        message = "SUCCESS " + hostname + " hacked (" + threads + ") '" + targetHostname + "' for " + '\t' + moneyHacked + "\t" + timeStart + "\t" + timeEnd + "\t" + (timeEnd - timeStart) + "\t" + delay + "\t" + (timeEnd - timeStart - delay)
    } else {
        //log failure
        message = "WARNING " + hostname + " failed to hack (" + threads + ") '" + targetHostname + "' for " + '\t' + moneyHacked + "\t" + timeStart + "\t" + timeEnd + "\t" + (timeEnd - timeStart) + "\t" + delay + "\t" + (timeEnd - timeStart - delay)
    }

    if(logLevel >= 1) {
        ns.tprint(message)
    } else {
        ns.print(message)
    }
}



/** @param {NS} ns 
 * 
 * arguments:
 * 0 - hostname (string) (mandatory)
 * 1 - Number of threads (1+)
 * 2 - delay in msec (0+)
 * 3 - hostname (hostname of the executing machine, for logging) 
 * 4 - log level (to determine where to print)
*/
export async function main(ns) {
    //get the start time
    const timeStart = Date.now()
    //check if we have enough arguments
    if(ns.args.length < 1) {
        //no hostname available, script cannot work
        //log information
        ns.tprint("ERROR " + "No hostname!")
        //stop script
        ns.exit()
    }
    //get the host name from arguments
    const target_hostname = ns.args[0]
    //get the delay from arguments (if provided, otherwise 0)
    const delay = (ns.args[1] != undefined) ? ns.args[1] : 0
    
    //grow the money
    const moneyGrown = await ns.grow(target_hostname, { additionalMsec: delay })

    //get the end time
    const timeEnd = Date.now()
    //get the threads from arguments (if provided, otherwise 1)
    const threads = (ns.args[2] != undefined) ? ns.args[2] : 1
    //get the (own) hostname from arguments (if provided, otherwise "")
    const hostname = (ns.args[3] != undefined) ? ns.args[3] : ""
    //save log level
    const log_level = (ns.args[4] != undefined) ? ns.args[4] : 0
    //not formatted for use in comparison in excel
    const message = hostname + " grew (" + threads + ") '" + target_hostname + "' for " + "\t" + moneyGrown + "\t" + timeStart + "\t" + timeEnd + "\t" + (timeEnd - timeStart) + "\t" + delay + "\t" + (timeEnd - timeStart - delay)
    //log according to log level
    if(log_level >= 1) {
        ns.tprint("SUCCESS " + message)
    } else {
        ns.print("SUCCESS " + message)
    }
}

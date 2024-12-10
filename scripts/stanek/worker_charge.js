//imports
import * as common from "scripts/common.js"



/** @param {NS} ns */
export async function main(ns) {
    //if we have coordinates
    if(ns.args.length >= 2) {
        //get x coordinate
        const x = ns.args[0]
        //get y coordinate
        const y = ns.args[1]
        //charge the fragment
        await ns.stanek.chargeFragment(x, y)
    }
    //use ports to indicate status
    ns.writePort(common.port.stanek, "Done")
}

//common
import * as common from "scripts/common.js"

/** @param {NS} ns */
export async function main(ns) {
    let script = ""
    let kill_all = false
    let parameters = []
    //ns.tprint("args: " + JSON.stringify(ns.args))

    try {
        //1st arg is script
        script = ns.args[0]

        if (ns.args.length > 1) {
            //2nd arg is to kill all other scripts (optional)
            kill_all = ns.args[1]
        }
        //if kill all other scripts
        if (kill_all) {
            ns.killAll(common.servers.home, true)
        }

        if (ns.args.length > 2) {
            //3+ args is to pass on to target script
            for (let arg of ns.args.slice(2)) {
                //add the arguments
                parameters.push(arg)
            }
            const arg1 = ns.args[2]
            const arg2 = ns.args[3]
            //start script on on home
            ns.run(common.scripts.jump2, 1, script, arg1, arg2)
        } else {
            //start script on on home
            ns.run(common.scripts.jump2, 1, script)

        }
    } catch (err) {
        common.log(ns, 1, common.error, err)
    }
}

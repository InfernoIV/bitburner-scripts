import { 
  enum_scripts, enum_servers,
  log, info, success, warning, error, fail,
} from "scripts/common.js"


/** @param {NS} ns */
export async function main(ns) {
    let script = ""
    let killAll = false
    let parameters = []
    //ns.tprint("args: " + JSON.stringify(ns.args))

    try {
        //1st arg is script
        script = ns.args[0]

        if (ns.args.length > 1) {
            //2nd arg is to kill all other scripts (optional)
            killAll = ns.args[1]
        }
        //if kill all other scripts
        if (killAll) {
            ns.killall(enum_servers.home, true)
        }

        if (ns.args.length > 2) {
            //3+ args is to pass on to target script
            for (let arg of ns.args.slice(2)) {
                parameters.push(arg)
            }
            const arg1 = ns.args[2]
            const arg2 = ns.args[3]
            //start script on on home
            ns.run(enum_scripts.jump2, 1, script, arg1, arg2)
        } else {
            //start script on on home
            ns.run(enum_scripts.jump2, 1, script)

        }
    } catch (err) {
        log(ns, 1, error, err)
    }
}

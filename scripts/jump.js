/** @param {NS} ns */
export async function main(ns) {
    const serverHome = "home"
    let script = ""
    let killAll = false
    //let parameters = []

    ns.tprint("args: " + JSON.stringify(ns.args))
    await ns.sleep(100)
    try {
        //1st arg is script
        script = ns.args[0]

        if (ns.args.length > 2) {
            //3+ args is to pass on to target script
            /*for (let arg of ns.args.slice(2)) {
                parameters.push(arg)
            }*/
            const arg1 = ns.args[1]
            const arg2 = ns.args[2]
            //start script on on home
            ns.run(script, 1, arg1, arg2)
        } else {
            //start script on on home
            ns.run(script)
        }
    } catch (error) {
        ns.tprint("1. " + error)
    }
    /*while(true) {
        await ns.sleep(100)
    }*/
    ns.tprint("Exit: " + script)
}

//common
import * as common from "scripts/common.js"

/** @param {NS} ns */
export async function main(ns) {
    //get ram from home
    const ramHome = ns.getServerMaxRam(common.servers.home)
    //get ram of jump
    //let ram_jump = ns.getScriptRam(common.scripts.jump)
    //get ram of jump 2
    let ram_jump_2 = ns.getScriptRam(common.scripts.jump2)
    //get ram of main
    let ram_main = ns.getScriptRam(common.scripts.main)

    //ns.tprint("ram Home: " + ramHome)
    //ns.tprint("ram Jump: " + ram_jump)
    //ns.tprint("ram Jump2: " + ram_jump_2)
    //ns.tprint("ramMain: " + ram_main)
    ns.tprint("total ram: " + (ram_jump_2 + ram_main) + " < " + ramHome + " = " + ((ram_jump_2 + ram_main) < ramHome))
}

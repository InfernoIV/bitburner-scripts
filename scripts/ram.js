/** @param {NS} ns */
export async function main(ns) {
    let scriptsJump = "scripts/jump.js"
    let scriptMain = "scripts/main.js"

    const ramHome = ns.getServerMaxRam("home")
    let ramJump = ns.getScriptRam(scriptsJump) 
    let ramMain =  ns.getScriptRam(scriptMain)

    ns.tprint("ramHome: " + ramHome)
    ns.tprint("ramJump: " + ramJump)
    ns.tprint("ramMain: " + ramMain)
    ns.tprint("total ram: " + (ramJump + ramMain))
}

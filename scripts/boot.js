/** @param {NS} ns */
export async function main(ns) {
    //get reset info
    const resetInfo = ns.getResetInfo()
    //create filename
    const filenameResetInfo = "resetInfo.json"
    //write data to file
    ns.write(filenameResetInfo, JSON.stringify(resetInfo), "w")
    
    //get bitnode
    const bitNode = resetInfo.currentNode
    //start at level 1
    let level = 1
    //up the level
    if (resetInfo.ownedSF.has(bitNode)) {
        //add the levels of the SF
        level += resetInfo.ownedSF.get(bitNode)
        //if not in 12
        if (bitNode != 12) {
            //cap to 3
            level = Math.min(level, 3)
        }
    }
    const bitNodeMultiplier = ns.getBitNodeMultipliers(bitNode, level)
    //create filename
    const filenameBitNode = "bitNode/" + bitNode + ".json"
    //write data to file
    ns.write(filenameBitNode, JSON.stringify(bitNodeMultiplier), "w")

    const filenameAugmentsOwned = "augmentsOwned.json"
    //write data to file
    ns.write(filenameAugmentsOwned, JSON.stringify(ns.singularity.getOwnedAugmentations(false)), "w")

    //launch main script using jump server (only costs 1,6GB ram instead of this script ram)
    ns.run(enum_scripts.jump, 1,
        enum_scripts.stanekCreate, true) //which script to launch, kill other scripts
}



/**
 * enum of special servers
 * All servers will be backdoored, if possible
 */
const enum_servers = {
    home: "home",   //no effect
    worldDaemon: "w0r1d_d43m0n",    //bitnode destruction
    //fulcrumSecretTechnologies: "fulcrumassets",     //fulcrum faction
}



/**
 * Enum containing scripts
 */
const enum_scripts = {
    boot: "scripts/boot.js",
    main: "scripts/main.js",
    jump: "scripts/jumpScript.js",
    destroyBitNode: "scripts/destroyBitNode.js",
    reset: "scripts/reset.js",
    backdoor: "scripts/backdoor.js",
    hack: "scripts/hack.js",
    gang: "scripts/gang.js",
    corporation: "scripts/corporation.js",
    stock: "scripts/stock.js",
    workerHack: "scripts/workerHack.js",
    workerGrow: "scripts/workerGrow.js",
    workerWeaken: "scripts/workerWeaken.js",
    stanekCreate: "scripts/stanekCreate.js",
    stanekCharge: "scripts/stanekCharge.js",
    workerCharge: "scripts/workerCharge.js",
}

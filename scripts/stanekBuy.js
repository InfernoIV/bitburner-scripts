/** @param {NS} ns */
export async function main(ns) {
    //describe the CotMG faction
    const faction = "Church of the Machine God"
    //set flag to check
    let flagAllAugmentsBought = true
    //after charging, rep for CotMG increases: check if we can buy augments
    for (let augment of ns.singularity.getAugmentationsFromFaction(faction)) {
        //if not already owned (including installed!)
        if (ns.singularity.getOwnedAugmentations(true).indexOf(augment) == -1) {
            //try to buy augment
            if (!ns.singularity.purchaseAugmentation(faction, augment)) {
                //if fails, change flag
                flagAllAugmentsBought = false
            }
        }
    }
    //set target script to main
    let targetScript = enum_scripts.main
    /*//if failing to buy
    if(!flagAllAugmentsBought) {
        //charge instead
        targetScript = enum_scripts.stanekCharge
    }
    */
    //run jumpscript to boot main
    ns.run(enum_scripts.jump, 1, targetScript)
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
    stanekBuy: "scripts/stanekCharge.js",
    workerCharge: "scripts/workerCharge.js",
}

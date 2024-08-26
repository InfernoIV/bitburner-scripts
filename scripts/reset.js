/**
 * Enum containing scripts
 */
const enum_scripts = {
    main: "scripts/main.js",
    jump: "scripts/jumpScript.js",
    destroyBitNode: "scripts/destroyBitNode.js",
    reset: "scripts/reset.js",
    backdoor: "scripts/backdoor.js",
    hack: "scripts/hack.js",
    gang: "scripts/gang.js",
    corporation: "scripts/corporation.js",
    stock: "scripts/stock.js",
}

/** @param {NS} ns */
export async function main(ns) {
    const augmentsBougt = ns.singularity.getOwnedAugmentations(true).length - ns.singularity.getOwnedAugmentations(false).length
    //if at least 1 augment bought
    if (augmentsBougt > 0) {
        //install augments
        ns.singularity.installAugmentations(enum_scripts.main)
        //otherwise soft reset
    } else {
        ns.singularity.softReset(enum_scripts.main)
    }
}

//imports
import { enum_scripts} from "scripts/common.js"



/** @param {NS} ns */
export async function main(ns) {
    const augmentsBougt = ns.singularity.getOwnedAugmentations(true).length - ns.singularity.getOwnedAugmentations(false).length
    //if at least 1 augment bought
    if (augmentsBougt > 0) {
        //install augments
        ns.singularity.installAugmentations(enum_scripts.boot)
        //otherwise soft reset
    } else {
        ns.singularity.softReset(enum_scripts.boot)
    }
}

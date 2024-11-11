//imports
import { enum_scripts } from "scripts/common.js"


/** 
* Function that performs reset by installing augments or soft reset
* Saves 10 GB by placing the reset outside of main loop
* Costs: 15 GB
* Singularity.softReset() = 5 GB
* Singularity.installAugmentations() = 5 GB
* Singularity.getOwnedAugmentations() = 5 GB
* @param {NS} ns 
*/
export async function main(ns) {
    //get the augments bought and are ready for install
    const augments_ready_for_install = ns.singularity.getOwnedAugmentations(true).length - ns.singularity.getOwnedAugmentations(false).length
    //if at least 1 augment bought
    if (augments_ready_for_install > 0) {
        //install augments
        ns.singularity.installAugmentations(enum_scripts.boot)
        
        //no augments bought
    } else {
        //soft reset
        ns.singularity.softReset(enum_scripts.boot)
    }
}

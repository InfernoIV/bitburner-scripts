//common
import * as common from "scripts/common.js"

/** 
 * @param {NS} ns 
 * Script that destroys the bitnode, defaults to bitnode 12 and boots with the boot script
 * This is a seperate script to save 20 GB RAM
 */
export async function main(ns) {    
    //determine next bit node
    const next_bit_node = 12 //get_next_bit_node(ns)
    //destroy bitnode, go to targeted bitnode, run boot script
    ns.singularity.destroyW0r1dD43m0n(next_bit_node, common.scripts.boot)
}

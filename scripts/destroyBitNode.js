/** 
 * @param {NS} ns 
 * Script that destroys the bitnode, defaults to bitnode 12 and boots with the boot script
 * This is a seperate script to save 20 GB RAM
 */
export async function main(ns) {
    //destroy bitnode
    ns.singularity.destroyW0r1dD43m0n(12, "scripts/boot.js")
}

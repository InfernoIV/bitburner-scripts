//imports
import {    
    enum_scripts, //enums
    get_next_bit_node, //functions
} from "scripts/common.js"



/** 
 * @param {NS} ns 
 * Script that destroys the bitnode, defaults to bitnode 12 and boots with the boot script
 * This is a seperate script to save 20 GB RAM
 */
export async function main(ns) {    
    //determine next bit node
    const next_bit_node = get_next_bit_node(ns)
    //destroy bitnode, go to targeted bitnode, run boot script
    ns.singularity.destroyW0r1dD43m0n(next_bit_node, enum_scripts.boot)
}

/*
    ownedSF 		Map<number, number> 	
    A map of owned source files. Its keys are the SF numbers. Its values are the active SF levels. This map takes BitNode options into account.
    For example, let's say you have SF 1.3, but you overrode the active level of SF1 and set it to level 1. In this case, this map contains this entry: Key: 1 => Value: 1.
    If the active level of a source file is 0, that source file won't be included in the result.
*/

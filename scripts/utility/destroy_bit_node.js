//imports
import {    
    enum_scripts, //enums
    get_bit_node_progression, get_reset_info, //functions
} from "scripts/common.js"



/** 
 * @param {NS} ns 
 * Script that destroys the bitnode, defaults to bitnode 12 and boots with the boot script
 * This is a seperate script to save 20 GB RAM
 */
export async function main(ns) {    
    //get the current bit node information from file
    const reset_info = get_reset_info(ns)
    //get the map of owned source files (completed bitnodes) 
    let owned_source_files_after_destruction = reset_info.ownedSF
    
    //check if we already have completed the current node
    if (owned_source_files.has(reset_info.currentNode)) {
        //get the level of the node
        const bit_node_level = owned_source_files.get(reset_info.currentNode)
        
        //if bitnode 12
        if (reset_info.currentNode == 12) {
            //just add the counter
            owned_source_files.set(reset_info.currentNode, bit_node_level + 1)
        
        //if not maxxed
        } else if (bit_node_level < 3) {
            //add the level
            owned_source_files.set(reset_info.currentNode, bit_node_level + 1)
        }
        
    //otherwise add it to the map (this should be the overview AFTER the bitnode
    } else {
        //add the bitnode to the source file list at level 1 (first completion)
        owned_source_files.set(reset_info.currentNode, 1)
    }

    //default target bit node 12, since it is endless
    let next_bit_node = 12
    //for every step in the planned progression
    for (const step of get_bit_node_progression(ns)) {    //bit_node_progression = [ { bit_node: 1, level: 1 } ]
        //if we have completed the bit node (and thus it is present in the map)
        if (owned_source_files.has(step.bit_node)) {
            
            //if we have the required level
            if(owned_source_files.get(step.bit_node) == step.level) {
                //everything is in order, go to next
                continue
                
            //we do not have the required level
            } else {
                //set the target to this bit node
                next_bit_node = step.bit_node
                //stop searching
                break
            }
            
        //bitnode has not been tackled yet
        } else {
            //set the target to this bit node
            next_bit_node = step.bit_node
            //stop searching
            break
        }
    }
    
    //destroy bitnode, go to targeted bitnode, run boot script
    ns.singularity.destroyW0r1dD43m0n(next_bit_node, enum_scripts.boot)
}

/*
    ownedSF 		Map<number, number> 	
    A map of owned source files. Its keys are the SF numbers. Its values are the active SF levels. This map takes BitNode options into account.
    For example, let's say you have SF 1.3, but you overrode the active level of SF1 and set it to level 1. In this case, this map contains this entry: Key: 1 => Value: 1.
    If the active level of a source file is 0, that source file won't be included in the result.
*/

//imports
import { 
    enum_servers, enum_scripts,
    log, info, success, warning, error, fail,
} from "scripts/common.js"



/** @param {NS} ns */
export async function main(ns) {
    //get challenge config
    const challenge_flags = JSON.parse(ns.read("challenge.json"))
     //for each challenge
    for (const challenge in challenge_flags) {
        //if challenge is active
        if(challenge_flags[challenge]) {
            //log challenge information
            log(ns, 1, warning, "Challenge parameter: '" + challenge + "' is active (and thus limited / disabled)")
        }
    }
    
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

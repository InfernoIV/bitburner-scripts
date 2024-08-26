/**
 * Script that will accept all faction invites, and then soft resets and launches itself
 * Every faction invite will raise intelligence
 * And company faction invite will persist after reset, once unlocked
 * There are 10 company factions 
 */
export async function main(ns) {
    //describe this script
    const thisScript = "scripts/farmIntelligence.js"
    //for each faction invite
    for(let faction of ns.singularity.checkFactionInvitations()) {
        //accept invite
        ns.singularity.joinFaction(faction)
    }
    //soft reset and start this script again
    ns.singularity.softReset(thisScript)
}

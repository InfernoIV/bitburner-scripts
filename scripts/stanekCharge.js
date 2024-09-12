//imports
import { 
  enum_port, enum_servers, enum_scripts,
  log, info, success, warning, error, fail,
} from "scripts/common.js"



/** 
 * Function to be called to charge all fragments
 * @param {NS} ns 
 */
export async function main(ns) {
    //amount of times to charge, 
    //TODO: a better target?
    const numCharge = 10

    //CotMG faction
    const faction = "Church of the Machine God"

    //disable logs
    ns.disableLog("disableLog")
    ns.disableLog("sleep")
    ns.disableLog("killall")
    ns.disableLog("scp")
    ns.disableLog("stanek.activeFragments")
    ns.disableLog("scan")
    //ns.disableLog("exec")
    //ns.disableLog("run")
    ns.disableLog("getServerMaxRam")

    //if we can charge fragments (faction COTMG is joined)
    if (ns.getPlayer().factions.indexOf(faction) > -1) {

        //create a variable to save the hostname with the biggest RAM
        const serverHome = "home"
        //save biggest RAM
        let maxRam = ns.getServerMaxRam(serverHome) - ns.getScriptRam(enum_scripts.stanekCharge, serverHome)

        //kill all scripts
        ns.killall(serverHome, true)

        //copy the charge script to the target server
        //ns.scp(enum_scripts.workerCharge, biggestServer)
        //calculate RAM cost
        const scriptRam = ns.getScriptRam(enum_scripts.workerCharge, serverHome)
        //check how many threads we can run
        const threads = Math.floor(maxRam / scriptRam)

        ns.tprint("Charging " + ns.stanek.activeFragments().length + " fragments " + numCharge + "x")
        //charge multiple times
        for (let index = 0; index < numCharge; index++) {
            //charge the fragments
            await chargeFragments(ns, threads)
        }
        ns.tprint("Charging fragments complete!")


        //after charging, rep for CotMG increases: check if we can buy augments
        for (let augment of ns.singularity.getAugmentationsFromFaction(faction)) {
            //try to buy augment
            ns.singularity.purchaseAugmentation(faction, augment)
        }
    }

    //run jumpscript to boot main
    ns.run(enum_scripts.jump, 1, enum_scripts.main)
}



/**
 * Function that charges the installed fargments
 */
async function chargeFragments(ns, threads) {
    //define message to indicate fininsh
    const messageDone = "Done"
    //for each active fragment
    for (let fragmentIndex in ns.stanek.activeFragments()) {
        //get fragment
        let fragment = ns.stanek.activeFragments()[fragmentIndex]
        //check for booster fragments (cannot be charged)
        if (fragment.id < 100) {


            //charge the fragment
            ns.run(enum_scripts.workerCharge, threads,
                //arguments: root x, root y, amount of charges
                fragment.x, fragment.y)
            //port number
            const portStanek = 99
            //wait for the script to complete
            //while not getting the "Done" message
            while (ns.readPort(portStanek) != messageDone) {
                //wait a bit
                await ns.sleep(1)
            }

        }
    }
}

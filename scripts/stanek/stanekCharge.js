//imports
import { 
  enum_port, enum_servers, enum_scripts,
  log, info, success, warning, error, fail,
} from "scripts/common.js"

//config
import * as config from "config.js"
//data
import * as data from "data.js"



/** 
 * Function to be called to charge all fragments
 * @param {NS} ns 
 */
export async function main(ns) {
    //if we can charge fragments (faction COTMG is joined)
    if (ns.getPlayer().factions.indexOf(data.faction) > -1) {
        //kill all scripts
        ns.killall(enum_servers.home, true)  
      
        //save biggest RAM
        const maxRam = ns.getServerMaxRam(enum_servers.home) - ns.getScriptRam(enum_scripts.stanekCharge, enum_servers.home)
        //calculate RAM cost
        const scriptRam = ns.getScriptRam(enum_scripts.workerCharge, enum_servers.home)
        //check how many threads we can run
        const threads = Math.floor(maxRam / scriptRam)

        //log start charging
        log(ns, 1, info, "Charging " + ns.stanek.activeFragments().length + " fragments " + config.number_of_charges + "x")
        //charge multiple times
        for (let index = 0; index < config.number_of_charges; index++) {
            //charge the fragments
            await chargeFragments(ns, threads)
        }
        //log completion
        log(ns, 1, success, "Charging fragments complete!")

        //after charging, rep for CotMG increases: check if we can buy augments
        for (const augment of ns.singularity.getAugmentationsFromFaction(data.faction)) {
            //try to buy augment
            ns.singularity.purchaseAugmentation(data.faction, augment)
        }
    }

    //run jumpscript to boot main
    ns.run(enum_scripts.jump, 1, enum_scripts.main)
}



/**
 * Function that initializes
 */
function init(ns) {
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
}



/**
 * Function that charges the installed fargments
 */
async function chargeFragments(ns, threads) {
    //for each active fragment
    for (const fragmentIndex in ns.stanek.activeFragments()) {
        //get fragment
        const fragment = ns.stanek.activeFragments()[fragmentIndex]
        //check for booster fragments (cannot be charged)
        if (fragment.id < data.fragment_booster_id_start) {
            //charge the fragment
            ns.run(enum_scripts.workerCharge, threads,
                //arguments: root x, root y, amount of charges
                fragment.x, fragment.y)
            //wait for the script to complete
            //while not getting the "Done" message
            while (ns.readPort(enum_port.stanek) != config.message_done) {
                //wait a bit
                await ns.sleep(1)
            }
        }
    }
}

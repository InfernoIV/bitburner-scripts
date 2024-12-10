//common
import * as common from "./common.js"
//config
import * as config from "./config.js"
//data
import * as data from "./data.js"



/** 
 * Function to be called to charge all fragments
 * @param {NS} ns 
 */
export async function main(ns) {
    //if we can charge fragments (faction COTMG is joined)
    if (ns.getPlayer().factions.indexOf(data.faction) > -1) {
        //kill all scripts
        ns.killall(common.servers.home, true)  
      
        //save biggest RAM
        const max_ram = ns.getServerMaxRam(common.servers.home) - ns.getScriptRam(common.scripts.stanekCharge, common.servers.home)
        //calculate RAM cost
        const script_ram = ns.getScriptRam(common.scripts.workerCharge, common.servers.home)
        //check how many threads we can run
        const threads = Math.floor(max_ram / script_ram)

        //log start charging
        common.log(ns,config.log_level, common.info, "Charging " + ns.stanek.activeFragments().length + " fragments " + config.number_of_charges + "x")
        //charge multiple times
        for (let index = 0; index < config.number_of_charges; index++) {
            //charge the fragments
            await chargeFragments(ns, threads)
        }
        //log completion
        common.log(ns, config.log_level, common.success, "Charging fragments complete!")

        //after charging, rep for CotMG increases: check if we can buy augments
        for (const augment of ns.singularity.getAugmentationsFromFaction(data.faction)) {
            //try to buy augment
            ns.singularity.purchaseAugmentation(data.faction, augment)
        }
    }

    //run jumpscript to boot main
    ns.run(common.scripts.jump, 1, 
           common.scripts.main)
}



/**
 * Function that initializes
 */
function init(ns) {
    //disable logs
    common.disable_logs(ns, log_disabled_topics)
}



/**
 * Function that charges the installed fargments
 */
async function chargeFragments(ns, threads) {
    //for each active fragment
    for (const fragment_index in ns.stanek.activeFragments()) {
        //get fragment
        const fragment = ns.stanek.activeFragments()[fragment_index]
        //check for booster fragments (cannot be charged)
        if (fragment.id < data.fragment_booster_id_start) {
            //charge the fragment
            ns.run(common.scripts.worker_charge, threads,
                //arguments: root x, root y, amount of charges
                fragment.x, fragment.y)
            //wait for the script to complete
            //while not getting the "Done" message
            while (ns.readPort(common.port.stanek) != config.message_done) {
                //wait a bit
                await ns.sleep(1)
            }
        }
    }
}

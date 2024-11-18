//imports
import {
    info, success, warning, error, fail, portNoData, //constants 
    enum_scripts, enum_servers, enum_factions, enum_cities, enum_port, enum_hackingCommands, //enums
    log, number_formatter, //functions
} from "scripts/common.js"

//config
import * as config from "./config.js"
//data
import * as data from "./data.js"



/**
 * Function that handles everything
 * @param {NS} ns
 * 
 * Costs: 3,1 GB
 *  Base cost (1,6)
 *  killall (0,5) (inherited from init)
 *  getResetInfo (1)
 */
export async function main(ns) {    
    
    //get reset info
    const reset_info = ns.getResetInfo()
    //get bitnode information from file
    const bit_node_multipliers = JSON.parse(ns.read("bitNode/" + reset_info.currentNode + ".json"))
    //get challenge config
    const challenge_flags = JSON.parse(ns.read("challenge.json"))

    //keep track of launched scripts
    let launched_scripts = []

    //initialize
    init(ns) //1,5 GB
    //restart work (to ensure it is set to non-focussed in case of restarting the game)
    restart_player_actions(ns)
    
    //wait a bit for first iteration
    await ns.sleep(config.time_between_loops)
    
    //main loop
    while (true) {
        //main script: 3,1 GB  
        //init: 1,5 GB

        //factions & companies: 13 GB
        manage_factions(ns)  //10 GB
        manage_companies(ns) //3 GB

        //servers & scripts: 18,7 GB
        manage_servers(ns, challenge_flags)   //10 GB
        manage_hacking(ns)   //4,3 GB
        manage_scripts(ns, launched_scripts, bit_node_multipliers, challenge_flags)  //4,4 GB

        //player, sleeve & bladeburner: 71 GB
        manage_actions(ns, data.sleeves_available, bit_node_multipliers, challenge_flags)   //71 GB

        //update ui
        update_ui(ns, data.sleeves_available, bit_node_multipliers, challenge_flags) //0 GB

        //reset & destruction: 18 GB
        execute_bit_node_destruction(ns, challenge_flags)   //0 GB
        buy_augments(ns, data.sleeves_available, challenge_flags)  //18 GB
        install_augments(ns)    //0 GB
        

        //wait a bit
        await ns.sleep(config.time_between_loops)
    }
    //123,6 GB RAM used of 128 GB, 4,4 GB left
}



/**
 * Function that initializes some things
 * @param {NS} ns
 * 
 * Costs: 1,5 GB
 *  killAll (0,5)
 *  getreset_info (1)
 *  read (0)
 */
function init(ns) {

    //disable unwanted logs
    ns.disableLog("disableLog")
    ns.disableLog("sleep")
    ns.disableLog("singularity.purchaseProgram")
    ns.disableLog("scan")
    ns.disableLog("ftpcrack")
    ns.disableLog("brutessh")
    ns.disableLog("sqlinject")
    ns.disableLog("httpworm")
    ns.disableLog("relaysmtp")
    ns.disableLog("nuke")
    ns.disableLog("singularity.purchaseAugmentation")
    ns.disableLog("singularity.joinFaction")
    ns.disableLog("singularity.applyToCompany")
    ns.disableLog("singularity.upgradeHomeRam")
    ns.disableLog("singularity.upgradeHomeCores")
    ns.disableLog("singularity.purchaseTor")
    ns.disableLog("sleeve.purchaseSleeveAug")
    ns.disableLog("scp")
    ns.disableLog("exec")
    ns.disableLog("killall")
    ns.disableLog("singularity.commitCrime")
    ns.disableLog("bladeburner.upgradeSkill")
    ns.disableLog("bladeburner.startAction")
    ns.disableLog("singularity.travelToCity")
    ns.disableLog("bladeburner.joinBladeburnerDivision")

    //open console
    /*
    ns.tail()
    ns.resizeTail(1000, 500)
    */

    //clear reset port
    ns.clearPort(enum_port.reset)

    //for each server
    for (let server of get_servers(ns)) {
        //check if it is home
        const is_server_home = (server == enum_servers.home)
        //kill all scripts
        ns.killall(server, is_server_home)
    }

    //signal hackManager to stop
    over_write_port(ns, enum_port.stopHack, enum_hackingCommands.stop)

    //get the UI
    const doc = eval('document')
    //left side
    const hook0 = doc.getElementById('overview-extra-hook-0')
    //right side
    const hook1 = doc.getElementById('overview-extra-hook-1')

    //clear data on exit
    ns.atExit(() => {
        hook0.innerHTML = ''
        hook1.innerHTML = ''
        ns.closeTail()
    })
}



/**
 * Function that returns the installed augments
 */
function get_augmentations_installed(ns) {
    //owned augments
    const augments_owned = ns.getResetInfo().ownedAugs
    //create return value
    let augments_list = []
    //for each augment
    for (let key of augments_owned) {
        //use only the name
        augments_list.push(key[0])
    }
    //return the list
    return augments_list
}



/**
 * Function that gets the number of augments to be installed, using the UI
 */
function get_augments_to_be_installed() {
    //value to return
    let augments_ready_for_install = 0
    //get all svg
    const elements = eval("document").getElementsByTagName("svg")
    //for each SVG
    for (const element of elements) {
        //if it is the target
        if (element.ariaLabel == "Augmentations") {
            //get the parent, then the last child, then the value of the child
            const value = element.parentElement.lastElementChild.innerHTML
            //check if it is set
            if (value.length > 0) {
                //use this value
                augments_ready_for_install = value
            }
            //stop looking 
            break
        }
    }
    //return the value
    return augments_ready_for_install
}



/**
 * Function that checks if we can destroy the bitnode, always travels to BN 12 (because it is endless)
 * Cost: none
 * TODO: launch script for bitnode destruction
 */
function execute_bit_node_destruction(ns, challenge_flags) {
    //set a flag for desctruction
    let can_execute_destruction = false

    //if the red pill is installed
    if (get_augmentations_installed(ns).indexOf(data.augments.theRedPill) > -1) {
        //then we can check the world daemon backdoor (otherwise the server doesn't exist)
        if (ns.getServer(enum_servers.worldDaemon).backdoorInstalled) {
            //backdoor is installed, proceed with destruction
            can_execute_destruction = true
        }
    }

    //bladeburner is possible
    if (get_bladeburner_access(ns, challenge_flags)) {
        //if operation Daedalus has been completed, do we need to check rank as well?
        if (ns.bladeburner.getaction_countRemaining(data.bladeburner_actions.type.blackOps, data.bladeburner_actions.blackOps.operationDaedalus.name) == 0) {
            //proceed with destruction
            can_execute_destruction = true
        }
    }

    //if destruction is possible
    if (can_execute_destruction) {
        //always travel to bitNode 12
        const bit_node_next = 12
        //kill all other scripts on home
        ns.killall()
        //launch script to destroy bitnode
        ns.exec(enum_scripts.jump, enum_servers.home, 1,
            enum_scripts.destroyBitNode, true, //which script to launch, kill other scripts
            enum_scripts.boot, bit_node_next) //arguments
    }
}



/**
 * Function that checks if we should reset
 * Cost: none
 * TODO: attach script for external reset
 */
function install_augments(ns) {
    //get number of bought augments
    const augments_to_be_installed = get_augments_to_be_installed()
    //TODO: check for bonus time? (if applicable)
    //if enough augments bought for a reset
    if (augments_to_be_installed >= config.augments_minimum_for_reset) {
        //read the port if we need to wait
        const reason_to_wait = ns.peek(enum_port.reset)
        //check if there is no reason to wait
        if (reason_to_wait == portNoData) {
            //TODO: better way to go over the factions? Check each faction and start with the faction with the smallest difference between rep cost and rep have? 
            //for every joined faction
            for (const faction of ns.getPlayer().factions) {
                //buy as much neuro as possible
                while (ns.singularity.purchaseAugmentation(faction, data.augments.neuroFluxGovernor)) { /* Do nothing */ }
            }
            //kill all other scripts on home
            ns.killall()
            //start reset script
            ns.exec(enum_scripts.jump, enum_servers.home, 1,
                enum_scripts.reset, true) //which script to launch, kill other scripts
        }
    }
}



/**
 * Function that manages the buying of augments
 * Cost: 18 GB 
 *  getAugmentationsFromFaction (5)
 *  purchaseAugmentation (5) 
 *  purchaseSleeveAug (4)
 *  getSleevePurchasableAugs (4)
 */
function buy_augments(ns, data.sleeves_available, challenge_flags) {
    //if gang is busy with growing (and thus requiring money and blocking resets)
    if (ns.peek(enum_port.reset) == "gang") {
        //do not buy augments
        return
    }
    //get owned augments (to include bought?)
    let augments_installed = get_augmentations_installed(ns)
    //for every joined faction
    for (const faction of ns.getPlayer().factions) {
        //for each augment of the faction
        for (const augment of ns.singularity.getAugmentationsFromFaction(faction)) {
            //if not owned or is neuroflux
            if (augments_installed.indexOf(augment) == -1 || augment == data.augments.neuroFluxGovernor) {
                //try to buy
                if(ns.singularity.purchaseAugmentation(faction, augment)) {
                    log(ns,1,success,"Bought augment '" + augment + "' for player")
                }
            }
        }
    }

    //if sleeves are not disabled
    if(challenge_flags.disable_sleeves != true) {
        //for each sleeve
        for (let index = 0; index < data.sleeves_available; index++) {
            //for each sleeve augment
            //TODO: possible to hardcode the augment list?
            //TODO: get rid of try / catch
            for (const augment of ns.sleeve.getSleevePurchasableAugs(index)) {
                try {
                    //buy augment
                    if(ns.sleeve.purchaseSleeveAug(index, augment.name)) {
                        log(ns,1,success,"Bought augment '" + augment.name + "' for sleeve " + index)
                    }
                } catch (error) {
                    break
                }
            }
        }
    }
}



/**
 * Function that tries to join every faction possible, without checking
 * Cost: 10 GB
 *  joinFaction (3)
 *  travelToCity (2)
 *  getOwnedAugmentations (5)
 */
function manage_factions(ns) {
    //get the player
    const player = ns.getPlayer()
    //get the player factions
    const factions = player.factions
    //get the owned augments (not bought)
    const augments_installed = get_augmentations_installed(ns)
    //check for multual exlusive factions
    //TODO: are the city_group names (cities) the same as the faction names?
    const city_group_1 = [enum_cities.sector12, enum_cities.aevum]
    const augments_missing_of_city_group_1 = (augments_installed.indexOf("CashRoot") == -1) || (augments_installed.indexOf("PCMatrix") == -1)
   
    const city_group_2 = [enum_cities.chongqing, enum_cities.newTokyo, enum_cities.ishima]
    const augments_missing_of_city_group_2 = (augments_installed.indexOf("Neuregen") == -1) || (augments_installed.indexOf("NutriGen") == -1) || (augments_installed.indexOf("INFRARet") == -1)
    
    const city_group_3 = [enum_cities.volhaven]
    const augments_missing_of_city_group_3 = (augments_installed.indexOf("DermaForce") == -1)

    //create a location
    let city_to_travel_to = ""
    //check if we need to travel
    if (augments_missing_of_city_group_1) {
        //if sector 12 is not joined
        if (factions.indexOf(enum_factions.sector12.name) == -1) {
            //travel to sector 12
            city_to_travel_to = enum_cities.sector12
            //if aevum is not joined
        } else if (factions.indexOf(enum_factions.aevum.name) == -1) {
            //travel to aevum
            city_to_travel_to = enum_cities.aevum
        }

    } else if (augments_missing_of_city_group_2) {
        //if chongqing is not joined
        if (factions.indexOf(enum_factions.chongqing.name) == -1) {
            //travel to chongqing
            city_to_travel_to = enum_cities.chongqing
            //if New tokyo is not joined
        } else if (factions.indexOf(enum_factions.newTokyo.name) == -1) {
            //travel to aevum
            city_to_travel_to = enum_cities.newTokyo
            //if Ishima is not joined    
        } else if (factions.indexOf(enum_factions.ishima.name) == -1) {
            //travel to aevum
            city_to_travel_to = enum_cities.ishima
        }

    } else if (augments_missing_of_city_group_3) {
        //if Volhaven is not joined
        if (factions.indexOf(enum_factions.volhaven.name) == -1) {
            //travel to Volhaven
            city_to_travel_to = enum_cities.volhaven
        }
    } else {
        //default to sector-12, no travel should be needed
    }

    //get the stats
    const stats = {
        combat: Math.min(player.skills.strength, player.skills.defense, player.skills.dexterity, player.skills.agility),
        hacking: player.skills.hacking,
        karma: player.karma,
        kills: player.numPeopleKilled,
    }

    //if no target set: check other travel factions
    if (city_to_travel_to == "") {

        //if Tian Di Hui not joined
        if ((factions.indexOf(enum_factions.tianDiHui.name) == -1) && (stats.hacking >= 50)) {
            //travel to chongqing
            city_to_travel_to = enum_cities.chongqing //either Chongqing, New Tokyo, Ishima --> dark army only allows Chongqing

            //if Tetrads not joined
        } else if ((factions.indexOf(enum_factions.tetrads.name) == -1) && (stats.combat >= 75) && (stats.karma <= -18)) {
            //travel to chongqing
            city_to_travel_to = enum_cities.chongqing //either Chongqing, New Tokyo, Ishima --> dark army only allows Chongqing

            //if The Syndicate not joined
        } else if ((factions.indexOf(enum_factions.theSyndicate.name) == -1) && (stats.hacking >= 200) && (stats.combat >= 200) && (stats.karma <= -90)) {
            //travel to sector 12
            city_to_travel_to = enum_cities.sector12 //either Aevum, Sector-12 --> sector 12 is the default
        }

        //if The Dark Army not joined
    } else if ((factions.indexOf(enum_factions.theDarkArmy.name) == -1) && (stats.hacking >= 300) && (stats.combat >= 300) && (stats.karma <= -45) && (stats.kills >= 5)) {
        //travel to chongqing
        city_to_travel_to = enum_cities.chongqing //only Chongqing
    }

    //check if we need to travel
    if ((city_to_travel_to != "") && (player.city != city_to_travel_to)) {
        //travel to city
        ns.singularity.travelToCity(city_to_travel_to)
    }

    //for EVERY faction
    for (const faction_index in enum_factions) {
        //get faction name
        const faction = enum_factions[faction_index].name

        //if the faction is allowed (need to join group x and faction is not in group y or group z)
        if (((augments_missing_of_city_group_1) && (city_group_2.indexOf(faction) == -1) && (city_group_3.indexOf(faction) == -1)) ||
            ((augments_missing_of_city_group_2) && (city_group_1.indexOf(faction) == -1) && (city_group_3.indexOf(faction) == -1)) ||
            ((augments_missing_of_city_group_3) && (city_group_1.indexOf(faction) == -1) && (city_group_2.indexOf(faction) == -1)) ||
            //or if no MUX groups need joining
            (!augments_missing_of_city_group_1 && !augments_missing_of_city_group_2 && !augments_missing_of_city_group_3)) {
            //TRY to join
            try { ns.singularity.joinFaction(faction) } catch (error) { }
        }
    }
}



/**
 * Function that manages the joining of companies
 * Cost: 3 GB
 *  applyToCompany (3)
 */
function manage_companies(ns) {
    //for each company
    for (let company in data.company_factions) {
        //just try to join the company, default to "software"
        //also works for getting promotion
        ns.singularity.applyToCompany(company, "Software")
    }
}



/**
 * Function that manages buying and upgrading of servers
 * Also takes care of Faction Netburner enum_requirements
 * No updating of cache: it is all spent on money
 * Cost: 10 GB
 *  upgradeHomeCores (3)
 *  upgradeHomeRam (3)
 *  hacknet (4)
 */
function manage_servers(ns, challenge_flags) {
    //if not limiting home for challenge
    if(!challenge_flags.limit_home_server) {
        //try to upgrade home RAM first
        ns.singularity.upgradeHomeRam()
    }

    //if not hacknet disabled for challenge
    if(!challenge_flags.disable_hacknet_servers) {
        //for each buyable server possible
        for (let index = ns.hacknet.numNodes(); index < ns.hacknet.maxNumNodes(); index++) {
            //buy server
            ns.hacknet.purchaseNode()
        }
    
        //for each owned server
        for (let server_index = 0; server_index < ns.hacknet.numNodes(); server_index++) {
            //upgrade ram
            ns.hacknet.upgradeRam(server_index)
    
            //get the stats of the network (which are important to check)      
            let hacknet_stats = { level: 0, cores: 0, }
            //for each owned node
            for (let node_index = 0; node_index < ns.hacknet.numNodes(); node_index++) {
                //get the stats
                let nodeStats = ns.hacknet.getNodeStats(node_index)
                //add the level
                hacknet_stats.level += nodeStats.level
                //add the cores
                hacknet_stats.cores += nodeStats.cores
            }
    
            //only conditionally level the cores
            if (hacknet_stats.cores < data.requirements.faction_netburners.cores) {
                //upgrade cores
                ns.hacknet.upgradeCore(server_index)
            }
    
            //only conditionally level the cores
            if (hacknet_stats.level < data.requirements.faction_netburners.levels) {
                //upgrade level
                ns.hacknet.upgradeLevel(server_index)
            }
        }
    }
    
    //if not limiting home for challenge
    if(!challenge_flags.limit_home_server) {
        //upgrade home cores
        ns.singularity.upgradeHomeCores()
    }

    //if not hacknet disabled for challenge
    if(!challenge_flags.disable_hacknet_servers) {
        //manage hashes
        //just spend hashes on money
        ns.hacknet.spendHashes(data.hash_upgrades.money)
    }
}



/**
 * Function that manages the buying of hacking tools and hacking of servers
 * Cost: 4.3 GB
 * brutessh (0.05)
 * ftpcrack (0.05)
 * httpworm (0.05)
 * relaysmtp (0.05)
 * sqlinject (0.05)
 * nuke(0.05)
 * purchaseTor (2)
 * purchaseProgram (2)
 * 
 * TODO: manager backdoor external script
 */
function manage_hacking(ns) {
    //get player hacking stat
    let hacking = ns.getPlayer().skills.hacking

    //try to purchase TOR (returns true if we already have it)
    if (ns.singularity.purchaseTor()) {
        //buy the tools by only checking if it is usefull to do so
        if (hacking >= 50) {
            ns.singularity.purchaseProgram(data.hack_tools.bruteSSH)
        }
        if (hacking >= 100) {
            ns.singularity.purchaseProgram(data.hack_tools.fTPCrack)
        }
        if (hacking >= 300) {
            ns.singularity.purchaseProgram(data.hack_tools.relaySMTP)
        }
        if (hacking >= 400) {
            ns.singularity.purchaseProgram(data.hack_tools.hTTPWorm)
        }
        if (hacking >= 725) {
            ns.singularity.purchaseProgram(data.hack_tools.sQLInject)
        }
    }

    //get all servers
    for (let server of get_servers(ns)) {
        //if no admin rights (should resolve owned servers automatically)
        if (!ns.getServer(server).hasAdminRights) {
            //just try all tools (without checking if we have them...) and nuke
            try { ns.brutessh(server) } catch (error) { }
            try { ns.ftpcrack(server) } catch (error) { }
            try { ns.relaysmtp(server) } catch (error) { }
            try { ns.httpworm(server) } catch (error) { }
            try { ns.sqlinject(server) } catch (error) { }
            try { ns.nuke(server) } catch (error) { }
        }
        //if the server isn't hacknet, is not backdoored and we can backdoor
        if ((!server.startsWith("hacknet")) &&
            (ns.getServer(server).hasAdminRights) &&
            (!ns.getServer(server).backdoorInstalled) && 
            (ns.getPlayer().skills.hacking >= ns.getServer(server).requiredHackingSkill)) {
                //write hostname
                ns.writePort(enum_port.backdoor, server)
        }
    }
}







/**
 * Function that manages the launching of scripts
 * Cost: 4,4 GB
 *  getscript_ram (0,1)
 *  scan (0.2) (inherited from get_server_specific)
 *  scp (0.6)
 *  exec (1.3)
 *  getServer (2)
 *  ls (0.2)
 */
function manage_scripts(ns, launched_scripts, bit_node_multipliers, challenge_flags) {
    //get player
    const player = ns.getPlayer()
    //get money
    const money_available = ns.getServer(enum_servers.home).moneyAvailable
    //money that is needed for corporation
    const corporation_money_requirement = 150e9
    //check if makes sense to launch stock manager
    const stock_4s_api_cost = bit_node_multipliers.FourSigmaMarketDataApiCost * 25e9 //24.000.000.000 = 25b
    const stock_4s_market_data_cost = bit_node_multipliers.FourSigmaMarketDataCost * 1e9  //1.000.000.000 = 1b
    
    //list that keeps track if which scripts to launch
    let scripts_to_launch = []
    
    //check which scripts we need to launch

    //launch script
    scripts_to_launch.push(enum_scripts.backdoor)
    //hackmanager is always wanted?
    scripts_to_launch.push(enum_scripts.hack)

    //check if makes sense to launch gang manager
    if ((!challenge_flags.disable_gang) && //if not performing a challenge
        (bit_node_multipliers.GangSoftcap > 0) && //and if the bitnode allows
        (player.karma < data.requirements.karma_for_gang)) { //and if karma threshold is reached
        //add to list
        scripts_to_launch.push(enum_scripts.gang)
    }

    //check if makes sense to launch corporation manager
    if ((!challenge_flags.disable_corporation) && //if not perfoming a challenge
        (bit_node_multipliers.CorporationSoftcap >= 0.15) && //and if the bitnode allows
        (money_available > corporation_money_requirement)) { //and if money threshold is reached
        //add to list
        scripts_to_launch.push(enum_scripts.corporation)
    }

    //calculate money needed for stock manager
    //TODO: how to handle challenge_flags.disable_s4_market_data ?
    if (money_available > (stock_4s_api_cost + stock_4s_market_data_cost)) { //26b
        //add to list
        scripts_to_launch.push(enum_scripts.stock)
    }

    //if there are scripts to launch
    if (scripts_to_launch.length > 0) {
        //TODO: how to handle the scaling down of the hack manager?
        //use ports to indicate pause, then keep reading until message is changed

        //for each script to launch
        for (const script of scripts_to_launch) {
            //if not already launched
            if (launched_scripts.indexOf(script) == -1) {
                //signal hackManager to stop
                over_write_port(ns, enum_port.stopHack, enum_hackingCommands.stop)
                //get all servers that can run scripts
                const servers_that_can_execute = get_server_specific(ns, true)
                //get script ram 
                const script_ram = ns.getScriptRam(script)
                //for each server
                for (const server of servers_that_can_execute) {
                    //calculate available ram
                    const ram_available = server.maxRam - server.ramUsed
                    //if enough ram
                    if (ram_available >= script_ram) {
                        
                        //create the folder variable
                        let script_folder = "" 
                        //split into segments
                        const script_path = script.split("/")
                        //go over each index (except the last)
                        for (let index = 0; index < script_path.length-1; index++) {
                            //check if we need to add a '/'
                            if(script_folder != "") {
                                //add a slash
                                script_folder += "/"
                            }
                            let script_path_element = script_path[index]
                            //add the path element
                            script_folder += script_path_element                    
                        }           
                        //get the scripts from the folder
                        const scripts_in_folder = ns.ls(enum_servers.home, script_folder)

                        //copy the scripts from the folder
                        if (ns.scp(scripts_in_folder, enum_servers.home, server.hostname)) {
                            //execute the main script
                            if (ns.exec(script, server.hostname)) {
                                //log information
                                log(ns, 1, success, "Launched '" + script + "'")
                                //add script to list of launched scripts
                                launched_scripts.push(script)
                            }
                        }
                    }
                }
            }
        }
        //indicate to hack manager that it can resume
        over_write_port(ns, enum_port.stopHack, enum_hackingCommands.start)
    }
}



/**
 * Function that restarts player activity
 * Used to ensure player focus is false, to enable resets after resuming play (restarting of game)
 * Quick and dirty copy of the determine player actions
 */
function restart_player_actions(ns) {
    //get player
    const player = ns.getPlayer()
    //get player activity
    const player_activity = get_activity(ns)
    //set the default focus for actions (always false)
    const action_focus = false
    
    //save player desired action
    let player_action_desired = { type: data.activities.crime, value: ns.enums.CrimeType.grandTheftAuto }
    
    //if not enough hacking skill
    if (ns.getPlayer().skills.hacking < config.stat_minimum_hacking) {
        //raise hacking
        player_action_desired = { type: data.activities.crime, value: ns.enums.CrimeType.robStore }
        //if we have not reached target karma
    } else if (player.karma > data.requirements.karma_for_gang) {
        //get best crime for karma
        player_action_desired = { type: data.activities.crime, value: ns.enums.CrimeType.mug }
        
    }
    
    //check if we need to change
    if ((player_activity.type != player_action_desired.type) ||
       (player_activity.value != player_action_desired.value)) {
        //check if it works
        if (!ns.singularity.commitCrime(player_action_desired.value, action_focus)) {
            log(ns, 1, warning, "manage_actions failed 1. singularity.commitCrime(" + crime_best + ", " + action_focus + ")")
        }
    }        
}



/**
 * Function that determines the best action to take, according to a set priority
 * It also handles duplicate actions of sleeves (faction, company)
 * Player: either crime and/or bladeburner
 * Cost: 6 + 37 + 28 = 71 GB
 *  
 *  Player:6 GB
 *      getPlayer (0.5)
 *      commitCrime (5)
 *      Inherited: 0,5 GB
 *          get_activity (0,5)
 * 
 *  Bladeburner: 37 GB
 *      joinBladeburnerDivision(4)
 *      startAction (4)
 *      Inherited: 29 GB
 *          bladeburner_get_activity (1)
 *          bladeburner_determine_action (28)
 * 
 *  Sleeve: 28 GB
 *      setToCommitCrime (4)
 *      setToFactionWork (4)
 *      setToCompanyWork (4)
 *      setToBladeburnerAction (4)
 *      getSleeve (4)
 *      setToShockRecovery (4)
 *      Inherited: 4 GB
 *          get_activity (4)       
 */
function manage_actions(ns, data.sleeves_available, bit_node_multipliers, challenge_flags) {
    //first manage player
    manage_actions_player(ns, bit_node_multipliers, challenge_flags)

    //if sleeves are not disabled
    if(challenge_flags.disable_sleeves != true) {
        //then manange sleeves
        manage_actions_sleeves(ns, data.sleeves_available, bit_node_multipliers)
    }
}

function manage_actions_player(ns, bit_node_multipliers, challenge_flags) {
    //get player
    const player = ns.getPlayer()
    //get player activity
    const player_activity = get_activity(ns)
    //set the default focus for actions (always false)
    const action_focus = false
    //check if we joined bladeburner (default is false
    const bladeburner_joined = get_bladeburner_access(ns, challenge_flags) 

    //if not enough hacking skill
    if (ns.getPlayer().skills.hacking < config.stat_minimum_hacking) {
        //get best crime for hacking
        const crime_best = ns.enums.CrimeType.robStore//get_crime_best(ns, bit_node_multipliers, player, data.crime_focus.hacking)
        //if not performing the correct crime
        if (player_activity.value != crime_best) {
            //commit crime for karma
            if (!ns.singularity.commitCrime(crime_best, action_focus)) {
                log(ns, 1, warning, "manage_actions failed 1. singularity.commitCrime(" + crime_best + ", " + action_focus + ")")
            }
        }
        //if we have not reached target karma
    } else if (player.karma > data.requirements.karma_for_gang) {
        //get best crime for karma
        const crime_best = ns.enums.CrimeType.mug//get_crime_best(ns, bit_node_multipliers, player, data.crime_focus.karma)
        //if not performing the correct crime
        if (player_activity.value != crime_best) {
            //commit crime for karma
            if (!ns.singularity.commitCrime(crime_best, action_focus)) {
                log(ns, 1, warning, "manage_actions failed 2. singularity.commitCrime(" + crime_best + ", " + action_focus + ")")
            }
        }

    } else {
        //if bladeburner joined: work for bladeburner
        if (bladeburner_joined) {
            //check what ae are doing for bladeburner
            const bladeburner_action_current = bladeburner_get_activity(ns)
            //do bladeburner stuff
            const bladeburner_action_wanted = bladeburner_determine_action(ns, player)
            //log(ns, 1, info, "bladeburner_determine_action: " + JSON.stringify(bladeburner_action_wanted))
            //if not the same (type and value is not the same)
            if (bladeburner_action_current.value != bladeburner_action_wanted.name) {
                //start bladeburner action
                if (!ns.bladeburner.startAction(bladeburner_action_wanted.type, bladeburner_action_wanted.name)) {
                    log(ns, 1, warning, "manage_actions failed bladeburner.startAction(" + bladeburner_action_wanted.type + ", " + bladeburner_action_wanted.name + ")")
                }
            }
        }

        //check if we can do both bladeburner and normal work
        const can_perform_dual_actions = (get_augmentations_installed(ns).indexOf(data.augments.bladesSimulacrum) > -1)

        //if bladeburner is not joined or augment for dual work is installed
        if ((!bladeburner_joined) || (can_perform_dual_actions)) {
            //get best crime for combat skills
            const crime_best = ns.enums.CrimeType.grandTheftAuto//get_crime_best(ns, bit_node_multipliers, player, data.crime_focus.skills)
            //if not performing the correct crime
            if (player_activity.value != crime_best) {
                //commit crime for money/stats?
                if (ns.singularity.commitCrime(crime_best, action_focus)) {
                    log(ns, 1, warning, "manage_actions failed 3. singularity.commitCrime(" + crime_best + ", " + action_focus + ")")
                }
            }
        }
    }
}
    
function manage_actions_sleeves(ns, data.sleeves_available, bit_node_multipliers) {
    //get player
    const player = ns.getPlayer()
    //sleeve actions
    //shock value that is wanted (96%)
    const sleeve_shock_desired_maximum = 0.96
    //get all max shock value
    let sleeve_shock = []

    //for each sleeve
    for (let index = 0; index < data.sleeves_available; index++) {
        //get shock value
        const shock = ns.sleeve.getSleeve(index).shock
        //add the shock to the list
        sleeve_shock.push(shock)
    }

    //if there is a sleeve with too much shock
    if (Math.max(sleeve_shock) > sleeve_shock_desired_maximum) {
        //for each sleeve
        for (let index = 0; index < data.sleeves_available; index++) {
            //if not doing the correct work
            if (get_activity(ns, index).type != data.activities.recovery) {
                //perform recovery
                ns.sleeve.setToShockRecovery(index)
            }
        }

        //if we have not reached target karma
    } else if (player.karma > data.requirements.karma_for_gang) {
        //for each sleeve
        for (let index = 0; index < data.sleeves_available; index++) {
            //get best crime for karma
            let crime_best = ns.enums.CrimeType.mug//get_crime_best(ns, bit_node_multipliers, player, data.crime_focus.karma)
            //if not doing the correct work
            if (get_activity(ns, index).value != crime_best) {
                //perform crime for karma
                ns.sleeve.setToCommitCrime(index, crime_best)
            }
        }

        //not reached target kills
    } else if (player.numPeopleKilled < data.requirements.kills_for_factions) {
        //for each sleeve
        for (let index = 0; index < data.sleeves_available; index++) {
            //get best crime for kills
            let crime_best = ns.enums.CrimeType.homicide//get_crime_best(ns, bit_node_multipliers, player, data.crime_focus.kills)
            //if not performing the correct work
            if (get_activity(ns, index).value != crime_best) {
                //perform crime
                ns.sleeve.setToCommitCrime(index, crime_best)
            }
        }

        //sleeves are to be divided over work (faction > company > crime)
    } else {
        //get all the current actions
        let sleeve_actions_current = []
        //get all sleeve actions
        for (let index = 0; index < data.sleeves_available; index++) {
            //add activity of the specific sleeve to the list
            sleeve_actions_current.push(get_activity(ns, index))
        }

        //get a list of all factions to work for
        let factions_to_work_for = []
        //for each unlocked faction
        for (const faction of player.factions) {
            //if the faction has work types and if there are still augments available
            if ((get_faction_work_types(faction).length > 0) &&
               (should_work_for_faction(ns, faction))) {
                //add faction to the list
                factions_to_work_for.push(faction)
            }
        }
        
        //get a list of all companies to work for
        let companies_to_work_for = []
        //create list of companies and their factions
        for (const company in player.jobs) {
            //if company faction is not joined
            if (player.factions.indexOf(data.company_factions[company]) == -1) {
                //add company to the list
                companies_to_work_for.push(company)
            }
        }

        
        //keep track of sleeve actions to be done
        let sleeve_actions_future = []
        //define best crime for skills
        const crime_best = ns.enums.CrimeType.grandTheftAuto //TODO: get_crime_best(ns, bit_node_multipliers, ns.sleeve.getSleeve(index), data.crime_focus.skills)
        //for each sleeve
        for (let index = 0; index < data.sleeves_available; index++) {
            //set default action to crime
            sleeve_actions_future[index] = { type: data.activities.crime, value: crime_best }
        }

        //determine faction work
        for (const faction in factions_to_work_for) {
            //set flag to check if sleeve is already working for this specific faction
            let sleeve_assigned = false
            
            //check if any sleeve is already performing work for this faction
            for (const sleeve_action in sleeve_actions_current) {
                //if doing faction work and working for this faction
                if ((sleeve_action.type == data.activities.faction) && 
                    (sleeve_action.value == faction)) {
                    //save that the sleeve is working on this
                    sleeve_actions_future[index] = { type: data.activities.faction, value: faction }
                    //set flag that is sleeve already assigned
                    sleeve_assigned = true
                    //stop looking
                    break
                }
            }
            
            //if no sleeve assigned
            if (!sleeve_assigned) {
                //go over each sleeve
                for (let index = 0; index < data.sleeves_available; index++) {
                    //first sleeve that is set to crime, is set to this faction
                    if (sleeve_actions_future[index].type == data.activities.crime) {
                        //save information
                        sleeve_actions_future[index] = { type: data.activities.faction, value: faction }
                        //stop looking
                        break
                    }
                }
            }
        }

        
        //determine company work
         for (const company in companies_to_work_for) {
            //set flag to check if sleeve is already working for this specific company
            let sleeve_assigned = false
            //if company faction is not joined
            if (player.factions.indexOf(data.company_factions[company]) == -1) {
                //check if any sleeve is already performing work for this company
                for (const sleeve_action in sleeve_actions_current) {
                    //if doing faction work and working for this faction
                    if ((sleeve_action.type == data.activities.company) && 
                        (sleeve_action.value == company)) {
                        //save that the sleeve is working on this
                        sleeve_actions_future[index] = { type: data.activities.company, value: company }
                        //set flag that is sleeve already assigned
                        sleeve_assigned = true
                        //stop looking
                        break
                    }
                }
                
                //if no sleeve assigned
                if (!sleeve_assigned) {
                    //go over each sleeve
                    for (let index = 0; index < data.sleeves_available; index++) {
                        //first that is set to crime, is set to this faction
                        if (sleeve_actions_future[index].type == data.activities.crime) {
                            //save information
                            sleeve_actions_future[index] = { type: data.activities.company, value: company }
                            //stop looking
                            break 
                        }
                    }
                }
            }
        }

        
        //set all sleeve actions
        for (let index = 0; index < data.sleeves_available; index++) {
            //compare current vs wanted
            if ((sleeve_actions_current[index].type = sleeve_actions_future[index].type) &&
               (sleeve_actions_current[index].value = sleeve_actions_future[index].value)) {
                //doing correct work, no change needed
            } else {
                //change in work is needed
                switch (sleeve_actions_future.type) {

                        
                    //faction work
                    case data.activities.faction: 
                        //get faction
                        const faction = sleeve_actions_future.value
                        //get work type
                        const work_type = determine_faction_work(ns.sleeve.getSleeve(index), get_faction_work_types(faction))
                        //set to faction work
                        if (!ns.sleeve.setToFactionWork(index, faction, work_type)) {
                            //if failed, log!
                            log(ns,1,error,"Failed to start sleeve " + index + " on faction work @ " + faction + "(" + work_type + ")")
                        }
                        //stop looking
                        break

                        
                    //company work
                    case data.activities.company: 
                        //get company
                        const company = sleeve_actions_future.value
                        //set to company work
                        if(!ns.sleeve.setToCompanyWork(index, company)) {
                            //if failed, log!
                            log(ns,1,error,"Failed to start sleeve " + index + " on company work @ " + company)
                        }
                        //stop looking
                        break
                        
                    //crime
                    default:
                        //if not working on the desired crime
                        if (get_activity(ns, index).value != crime_best) {
                            //assign to crime
                            if(!ns.sleeve.setToCommitCrime(index, crime_best)) {
                                //if failed, log!
                                log(ns,1,error,"Failed to start sleeve " + index + " on crime: " + crime_best)
                            }
                        }
                }
            }
        }
        
        /*
        //factions
        //get available factions
        for (const faction of player.factions) {
            //get work types
            const work_types = get_faction_work_types(faction)
            //if the faction has work_types
            if (work_types.length > 0) {
                //if there are still augments available
                if (should_work_for_faction(ns, faction)) {
                    //set a flag to check
                    let already_working_for_faction = false
                    //check other sleeves
                    for (let index = 0; index < data.sleeves_available; index++) {
                        //get activity
                        const activity = get_activity(ns, index)
                        //if a sleeve is already working for this faction
                        if ((activity.type == data.activities.faction) &&
                            (activity.value == faction)) {
                            //assign this job to the sleeve
                            sleeve_actions_future[index] = activity
                            //set flag to indicate someone is already working on this
                            already_working_for_faction = true
                            //stop searching
                            break
                        }
                    }
                    //if flag is not set
                    if (!already_working_for_faction) {
                        //check each sleeve
                        for (let index = 0; index < data.sleeves_available; index++) {
                            //check if the sleeve is not assigned
                            if (!Object.hasOwn(sleeve_actions_future, index)) {
                                //get best faction work
                                const faction_work_best = determine_faction_work(ns.sleeve.getSleeve(index), work_types)
                                //try to start
                                try {
                                    //work for this faction
                                    if (ns.sleeve.setToFactionWork(index, faction, faction_work_best)) {
                                        //save information
                                        sleeve_actions_future[index] = { type: data.activities.faction, value: faction }
                                        //stop
                                        break
                                    }
                                } catch (error) {
                                    log(ns, 1, error, "setToFactionWork " + faction + ": " + error)
                                }
                            }
                        }
                    }
                }
            }
        }
        */

        /*
        //companies
        //create list of companies and their factions
        for (const company in player.jobs) {
            //get faction of the company
            let company_faction = enum_company_factions[company]
            //if not joined
            if (player.factions.indexOf(company_faction) == -1) {
                //check if other sleeves are working for the company
                //set a flag to check
                let company_already_working = false
                //check other sleeves
                for (let index = 0; index < data.sleeves_available; index++) {
                    //get activity
                    const activity = get_activity(ns, index)
                    //if a sleeve is already working for this company
                    if ((activity.type == data.activities.company) &&
                        (activity.value == company)) {
                        //assign this job to the sleeve
                        sleeve_actions_future[index] = activity
                        //set flag to indicate someone is already working on this
                        company_already_working = true
                        //stop searching
                        break
                    }
                }
                //if flag is not set
                if (!company_already_working) {
                    //check each sleeve
                    for (let index = 0; index < data.sleeves_available; index++) {
                        //check if the sleeve is not assigned
                        if (!Object.hasOwn(sleeve_actions_future, index)) {
                            try {
                                //work for company
                                ns.sleeve.setToCompanyWork(index, company)
                                //save information
                                sleeve_actions_future[index] = { type: data.activities.company, value: company }

                            } catch (error) {
                                log(ns, 1, error, "setToCompanyWork " + company + ": " + error)
                            }
                        }
                    }
                }
            }
        }

        //check each sleeve
        for (let index = 0; index < data.sleeves_available; index++) {
            //check if the sleeve is not assigned
            if (!Object.hasOwn(sleeve_actions_future, index)) {
                //get best crime for skills
                let crime_best = ns.enums.CrimeType.grandTheftAuto//get_crime_best(ns, bit_node_multipliers, ns.sleeve.getSleeve(index), data.crime_focus.skills)
                //if not working on the desired crime
                if (get_activity(ns, index).value != crime_best) {
                    //assign to crime
                    ns.sleeve.setToCommitCrime(index, crime_best)
                }
                //save information
                sleeve_actions_future[index] = { type: data.activities.crime, value: crime_best }
            }
        }
        */
    }
}



/**
 * Function that checks the best work type for bladeburner for sleeve
 * Only perform 100% chance work, else we get shock
 * cannot lower chaos, requires to get city, which increases ram usage
 * @param {NS} ns
 * Cost: 0 GB
 */
    /*
function getBladeburnerActionForSleeve(ns, sleeveIndex) {
    //set min chance = 100%
    const bladeburner_success_chance_minimum = 1
    //describe other actions
    const enum_sleeveBladeburnerActions = {
        fieldAnalysis: "Field Analysis",
        infiltratesynthoids: "Infiltrate synthoids",
    }

    //keep track of action count
    let bladeburner_total_action_count = 0

    //contracts
    //for each contract
    for (const operation in enum_bladeburnerActions.contracts) {
        //get contract information
        const contract = enum_bladeburnerActions.contracts[operation]
        //get action count
        const action_count = ns.bladeburner.getaction_countRemaining(enum_bladeburnerActions.type.contracts, contract)
        //get chance
        const chance = ns.bladeburner.getActionEstimatedSuccessChance(enum_bladeburnerActions.type.contracts, contract, sleeveIndex)
        //if this action can be performed and we have enough chance
        if ((action_count > 0) && (chance[0] >= bladeburner_success_chance_minimum)) {
            //return this information
            return { type: enum_sleeveBladeburnerActions.takeonContracts, name: contract }
        }
        //add count to total actions available
        bladeburner_total_action_count += action_count
    }

    //if no operations or contracts available
    if (bladeburner_total_action_count == 0) {
        //set to create contracts
        return { type: enum_bladeburnerActions.type.general, name: enum_bladeburnerActions.general.inciteViolence }
    }

    //failsafe: just train
    return { type: enum_bladeburnerActions.type.general, name: enum_bladeburnerActions.general.training }
}
*/



/**
 * Function that calculates the best crime for the given focus
 * https://github.com/bitburner-official/bitburner-src/blob/dev/src/Crime/Crime.ts
 * https://github.com/bitburner-official/bitburner-src/blob/dev/src/Constants.ts
 * @param {NS} ns
 */
function get_crime_best(ns, bit_node_multipliers, person, focus) {

    switch (focus) {
        default:
        case "karma": return ns.enums.CrimeType.mug
        case "kills": return ns.enums.CrimeType.homicide
        case "skills": return ns.enums.CrimeType.grandTheftAuto //TODO FIX? 
        case "hacking": return ns.enums.CrimeType.robStore
    }

    //log(ns,1,info,bit_node_multipliers + ", " + person + ", " + focus)
    //constants
    const crime_weight_intelligence = 0.025
    const crime_skill_level_maximum = 975
    const crime_chance_minimum = 0.75

    //keep track of values
    let best = {
        karma: { name: "Shoplift", value: 0 }, //lower is better
        kills: { name: "Shoplift", value: 0 },
        skills: { name: "Shoplift", value: 0 },
    }

    //for each crime
    for (let crime_index in data.crimes) {
        //get the data
        const crime_data = data.crimes[crime_index]


        //calculate the chance
        let chance = 0
        //for every skill weight
        for (let skill in crime_data.weight) {
            //add calculation for the skill
            chance += crime_data.weight[skill] * person.skills[skill]
        }
        chance += crime_weight_intelligence * person.skills.intelligence
        chance /= crime_skill_level_maximum
        chance /= crime_data.difficulty
        chance *= person.mults.crime_success
        chance *= bit_node_multipliers.CrimeSuccessRate
        chance *= calculate_intelligence_bonus(person.skills.intelligence, 1)
        //cap chance to 100%
        chance = Math.min(chance, 1)
        //chance = ns.get
        //log(ns,1,info,"crime_data: " + crime_data.type + ", chance:" + chance + ", actual chance:" + ns.singularity.getCrimeChance(crime_data.type))
        //chance = ns.singularity.getCrimeChance(crime_data.type)
        //log(ns,1,info," chance)
        //if (chance >= crime_chance_minimum) {
        //create multiplier to apply to each type
        const multiplier = chance / crime_data.time

        //calculate for each type      
        const karma = crime_data.karma * multiplier
        const kills = crime_data.kills * multiplier



        //calculate all exp
        let skills = 0
        //for each exp
        for (let skill in crime_data.exp) {
            //add the skill to the toal
            skills += crime_data.exp[skill]
        }
        //add multuplier
        skills *= multiplier

        //check if karma is lower
        if (karma > best.karma.value) {

            //save name
            best.karma.name = crime_data.type
            //save value
            best.karma.value = karma
        }
        //check if kills is higher
        if (kills > best.kills.value) {
            //save name
            best.kills.name = crime_data.type
            //save value
            best.kills.value = kills
        }
        //check if skills is higher
        if (skills > best.skills.value) {
            //save name
            best.skills.name = crime_data.type
            //save value
            best.skills.value = skills
        }
        //}
    }
    //return the corresponding focus index
    return best[focus].name
}



/**
 * Function that calculates the intelligence bonus
 * https://github.com/bitburner-official/bitburner-src/blob/dev/src/PersonObjects/formulas/intelligence.ts
 * Cost: 0
 */
function calculate_intelligence_bonus(intelligence, weight = 1) {
    return 1 + (weight * Math.pow(intelligence, 0.8)) / 600
}



/**
 * Function that returns an array of available work types
 * Sadly, no easy way to directly link with using destroying the option to easily link
 */
function get_faction_work_types(faction) {
    //for each faction
    for (const faction_index in enum_factions) {
        //get the faction data
        const data = enum_factions[faction_index]
        //if the names match
        if (data.name == faction) {
            //if it has work_types
            if (Object.hasOwn(data, "work_types")) {
                //return the work types
                return data.work_types
            } else {
                //return empty list
                return []
            }
        }
    }
    //failsafe: return empty list
    return []
}



/**
 * Function that manages the bladeburner stuff
 * @param {NS} ns
 * Cost: 28 GB
 *  upgradeSkill (4)
 *  getCityChaos (4)
 *  switchCity(4)
 *  getStamina (4)
 *  getRank (4)
 *  getaction_countRemaining (4)
 *  getActionEstimatedSuccessChance (4)
 */
function bladeburner_determine_action(ns) {
    //go to lowest chaos city (lower chaos = higher success chances)
    //keep track of previous chaos
    let bladeburner_chaos_lowest = 999999
    
    //upgrade skills
    //for each bladeburner skill
    for (const skill in data.bladeburner_skills) {
        //upgrade skill without checking details (money, level cap)
        ns.bladeburner.upgradeSkill(data.bladeburner_skills[skill])
    }

    //check the lowest chaos city
    for (const cityEntry in enum_cities) {
        //get city
        const city = enum_cities[cityEntry]
        //get chaos of current city
        const cityChaos = ns.bladeburner.getCityChaos(city)
        //we also need to check if there are any synthoids, otherwise all operations and contracts have a 0% success chance 
        //and actions will default to Field analysis, which will do nothing...
        //if lower than previous and there is synthoids in the city
        if (cityChaos < bladeburner_chaos_lowest && ns.bladeburner.getCityEstimatedPopulation(city) > 0) {
            //switch city
            ns.bladeburner.switchCity(city)
            //update lowest chaos
            bladeburner_chaos_lowest = cityChaos
        }
    }

    //keep track of action count
    let bladeburner_total_action_count = -1
    //get stamina
    const bladeburner_stamina = ns.bladeburner.getStamina()
    //if current stamina is higher than half max stamina (no penalties)
    if (bladeburner_stamina[0] > (bladeburner_stamina[1] / 2)) {
        //set to 0. then it will be checked
        bladeburner_total_action_count = 0
        //blackops
        //get current rank
        const bladeburner_rank = ns.bladeburner.getRank()
        //for each black operation
        for (const activity in data.bladeburner_actions.blackOps) {
            //get blackOp information
            const blackOp = data.bladeburner_actions.blackOps[activity]
            //check if this is the black op that is to be done
            if (ns.bladeburner.getaction_countRemaining(data.bladeburner_actions.type.blackOps, blackOp.name) > 0) {
                //get chance
                const chance = ns.bladeburner.getActionEstimatedSuccessChance(data.bladeburner_actions.type.blackOps, blackOp.name)
                //check if we have enough rank and enough chance
                if ((bladeburner_rank > blackOp.reqRank) &&
                    (chance[0] >= config.bladeburner_black_op_success_chance_minimum)) {
                    //return this information
                    return { type: data.bladeburner_actions.type.blackOps, name: blackOp.name }
                }
                //stop looking!
                break
            }
        }



        //operations
        //for each operation
        for (const activity in data.bladeburner_actions.operations) {
            //get operation information
            const operation = data.bladeburner_actions.operations[activity]
            //get action count
            const action_count = ns.bladeburner.getaction_countRemaining(data.bladeburner_actions.type.operations, operation)
            //get chance
            const chance = ns.bladeburner.getActionEstimatedSuccessChance(data.bladeburner_actions.type.operations, operation)
            //if this action can be performed and we have enough chance
            if ((action_count >= 1) && (chance[0] >= config.bladeburner_success_chance_minimum)) {
                //return this information
                return { type: data.bladeburner_actions.type.operations, name: operation }
            }
            //add count to total actions available
            bladeburner_total_action_count += action_count
        }

        //contracts
        //for each contract
        for (const activity in data.bladeburner_actions.contracts) {
            //get contract information
            const contract = data.bladeburner_actions.contracts[activity]
            //get action count
            const action_count = ns.bladeburner.getaction_countRemaining(data.bladeburner_actions.type.contracts, contract)
            //get chance
            const chance = ns.bladeburner.getActionEstimatedSuccessChance(data.bladeburner_actions.type.contracts, contract)
            //if this action can be performed and we have enough chance
            if ((action_count >= 1) && (chance[0] >= config.bladeburner_success_chance_minimum)) {
                //return this information
                return { type: data.bladeburner_actions.type.contracts, name: contract }
            }
            //add count to total actions available
            bladeburner_total_action_count += action_count
        }
    }

    //general
    //threshold on which chaos will effect actions (only done when chance for other actions is too low)
    const bladeburner_chaos_threshold = 50
    //if over threshold
    if (bladeburner_chaos_lowest > bladeburner_chaos_threshold) {
        //lower chaos
        return { type: data.bladeburner_actions.type.general, name: data.bladeburner_actions.general.diplomacy }
    }
    //if no operations or contracts available
    if (bladeburner_total_action_count == 0) {
        //generate operations and contracts
        return { type: data.bladeburner_actions.type.general, name: data.bladeburner_actions.general.inciteViolence }
    }
    //default: raise success chances
    return { type: data.bladeburner_actions.type.general, name: data.bladeburner_actions.general.fieldAnalysis }
}



/**
 * Function that calculates the best faction work type
 * From: https://github.com/bitburner-official/bitburner-src/blob/dev/src/PersonObjects/formulas/reputation.ts
 * Cost: 0 GB
 */
function determine_faction_work(person, work_types) {
    //set max skill level
    const crime_skill_level_maximum = 975
    //save best rep
    let best_rep = -1
    //save best work type
    let best_work_type = work_types[0]

    //for each work_type
    for (let work_type of work_types) {
        //create variable to check later
        let rep = -1

        //check how to calculate
        switch (work_type) {
            case "field":
                rep = (0.9 *
                    (person.skills.strength +
                        person.skills.defense +
                        person.skills.dexterity +
                        person.skills.agility +
                        person.skills.charisma +
                        (person.skills.hacking + person.skills.intelligence))) / crime_skill_level_maximum / 5.5
                break

            case "hacking":
                rep = (person.skills.hacking + person.skills.intelligence / 3) / crime_skill_level_maximum
                break

            case "security":
                rep = (0.9 *
                    (person.skills.strength +
                        person.skills.defense +
                        person.skills.dexterity +
                        person.skills.agility +
                        (person.skills.hacking + person.skills.intelligence))) / crime_skill_level_maximum / 4.5
                break

            default:
                log(ns, 1, warning, "determine_faction_work - uncaught condition: " + work_type);
                break
        }
        //if the rep is better than what is saved
        if (rep > best_rep) {
            //save the work type
            best_work_type = work_type
        }
    }
    return best_work_type
}



/**
 * Function that will return information about activities of the specified person
 * if index is not set, player information is returned, otherwise sleeve information
 * Cost: 4,5 GB
 * 
 * Player: 0,5 GB
 *  getCurrentWork(0.5) 
 * Sleeve: 4 GB
 *  getTask (4)
 */
function get_activity(ns, index = -1) {
    //create a return value
    //type is work type, value is the specific name of the work
    let activity = { type: "", value: "" }
    //if player
    if (index == -1) {
        //get current activity
        let player_activity = ns.singularity.getCurrentWork()
        //check if player is maybe performing work
        if (player_activity != null) {
            //depending on the type
            switch (player_activity.type) {
                case data.activities.study: activity.value = player_activity.classType; break
                case data.activities.company: activity.value = player_activity.companyName; break
                //case enum_activities.createProgram: activity.value = player_activity.programName; break
                case data.activities.crime: activity.value = player_activity.crimeType; break
                case data.activities.faction: activity.value = player_activity.factionName; break
                //case enum_activities.grafting: activity.value = player_activity.augmentation; break
                default:
                    //log information
                    log(ns, 1, info, "get_activity - Uncaught condition: " + player_activity.type)
                    //return immediately!
                    return activity
            }
            //set the type
            activity.type = player_activity.type

            //may be doing bladeburner work or doing nothing
        }

        //if sleeve
    } else {
        //get activity of sleeve
        let sleeve_activity = ns.sleeve.getTask(index)
        //if set
        if (sleeve_activity != null) {
            //depending on the type
            switch (sleeve_activity.type) {
                case data.activities.study: activity.value = sleeve_activity.classType; break
                case data.activities.company: activity.value = sleeve_activity.companyName; break
                case data.activities.crime: activity.value = sleeve_activity.crimeType; break
                case data.activities.faction: activity.value = sleeve_activity.factionName; break
                //bladeburner?
                case data.activities.bladeburner: activity.value = sleeve_activity.actionName; break
                case data.activities.infiltrate: activity.value = ""; break //only type property
                case data.activities.support: activity.value = ""; break //only type property
                //sleeve only
                case data.activities.recovery: activity.value = ""; break //only type property
                case data.activities.synchro: activity.value = ""; break //only type property                
                default:
                    //log information
                    log(ns, 1, info, "get_activity - Uncaught condition: " + sleeve_activity.type)
                    //return immediately!
                    return activity
            }
            //set the type
            activity.type = sleeve_activity.type
        }
    }

    //return the value
    return activity
}



/**
 * Function that check the blade burner action
 * Cost: 1 GB
 *  getCurrentAction (1)
 */
function bladeburner_get_activity(ns) {
    //create a return value
    //type is work type, value is the specific name of the work
    let activity = { type: "", value: "" }
    //if bladeburner work
    let player_activity = ns.bladeburner.getCurrentAction()
    //if not null: player is doing bladeburner work
    if (player_activity != null) {
        //set type
        activity.type = data.activities.bladeburner
        //save action (to be looked up later)
        activity.value = player_activity.name
    }
    //return the value
    return activity
}




/**
 * Function that only returns servers (objects) 
 * That have RAM or money, and that have admin access (can run scripts)
 * Parameter determines if it returns ram (true) or money (false) server objects
 * Cost: 2
 *  getServer (2)
 */
function get_server_specific(ns, server_has_ram = false) {
    //create a list (of objects) to return
    let server_list = []
    //get all servers
    const servers_all = get_servers(ns)
    //for each server
    for (let index = 0; index < servers_all.length; index++) {
        //get server information
        let server = ns.getServer(servers_all[index])
        //if we have admin rights
        if (server.hasAdminRights) {
            //if we need to check ram and there is ram, or if we need to check money and there is money
            if (((server_has_ram) && (server.maxRam > 0)) || ((!server_has_ram) && (server.moneyMax > 0))) {
                //add the server object to the list
                server_list.push(server)
            }
        }
    }
    //return server list
    return server_list
}



/**
 * Function that will retrieve all server hostnames
 * Cost: none
 */
function get_servers(ns) {
    //create list to save hostnames into
    let server_list = []
    //start scanning from home
    scan_server(ns, enum_servers.home, server_list)
    //return the server list
    return server_list
}



/**
 * Function that will retrieve all servers, sub function of get_servers
 * Cost: 
 *  scan (0,2)
 */
function scan_server(ns, hostname, server_list) {
    //get the neighbours of the server
    const neighbours = ns.scan(hostname)
    //for each neighbour
    for (const neighbour of neighbours) {
        //if not in the list
        if (server_list.indexOf(neighbour) == -1) {
            //add to list
            server_list.push(neighbour)
            //start scanning
            scan_server(ns, neighbour, server_list)
        }
    }
}



/**
 * Function that overwrites the specified port with new data
 * Cost: 0
 */
function over_write_port(ns, port, data) {
    //clear port
    ns.clearPort(port)
    //write data
    ns.writePort(port, data)
}



/**
 * Function that will display port data on UI
 * @param {NS} ns
 * Cost: 0 GB
 */
function update_ui(ns, data.sleeves_available, bit_node_multipliers, challenge_flags) {
    //get the UI
    const doc = eval('document')
    //left side
    const hook0 = doc.getElementById('overview-extra-hook-0')
    //right side
    const hook1 = doc.getElementById('overview-extra-hook-1')

    //create new headers list
    const headers = []
    //create new values list
    const values = []

    const player = ns.getPlayer()


    //entropy
    headers.push("Entropy")
    values.push(number_formatter(player.entropy))


    //karma
    headers.push("Karma")
    values.push(number_formatter(player.karma) + "/" + number_formatter(data.requirements.karma_for_gang))

    //kills
    headers.push("Kills")
    values.push(number_formatter(player.numPeopleKilled) + "/" + data.requirements.kills_for_factions)

    //hack tools
    const hacking = player.skills.hacking
    let hack_tools = 0
    if (hacking >= 50) {
        if (ns.singularity.purchaseProgram(data.hack_tools.bruteSSH)) {
            hack_tools++
        }
    }
    if (hacking >= 100) {
        if (ns.singularity.purchaseProgram(data.hack_tools.fTPCrack)) {
            hack_tools++
        }
    }
    if (hacking >= 300) {
        if (ns.singularity.purchaseProgram(data.hack_tools.relaySMTP)) {
            hack_tools++
        }
    }
    if (hacking >= 400) {
        if (ns.singularity.purchaseProgram(data.hack_tools.hTTPWorm)) {
            hack_tools++
        }
    }
    if (hacking >= 725) {
        if (ns.singularity.purchaseProgram(data.hack_tools.sQLInject)) {
            hack_tools++
        }
    }
    //add to header
    headers.push("Hack tools")
    //add specifics to data
    values.push(hack_tools + "/" + 5)

    //augments bought
    headers.push("Augments bought")

    //add global
    values.push(get_augmentations_installed(ns).length + "+" + get_augments_to_be_installed() + "/" + bit_node_multipliers["DaedalusAugsRequirement"])

    //if sleeves are enabled
    if(challenge_flags.disable_sleeves != true) {
        //sleeves
        //want to log augments of sleeves, but this costs 4 GB...
        for (let index = 0; index < data.sleeves_available; index++) {
            //get sleeve activity
            const activity = get_activity(ns, index)
            //add to header
            headers.push("Sleeve " + index + " (" + Math.ceil(ns.sleeve.getSleeve(index).shock) + "%)")
            //add specifics to data
            values.push(activity.type.charAt(0) + activity.type.slice(1).toLowerCase() + ": " + activity.value)
        }
    }

    //bladeburner
    
    
    if (get_bladeburner_access(ns, challenge_flags)) {
        //stamina
        headers.push("Bladeburner stamina")
        const stamina = ns.bladeburner.getStamina()
        const stamina_percentage = Math.round(stamina[0] / stamina[1] * 100)
        values.push(number_formatter(stamina[0]) + "/" + number_formatter(stamina[1]) + " (" + stamina_percentage + "%)")
        //rank
        headers.push("Bladeburner rank")
        values.push(number_formatter(Math.floor(ns.bladeburner.getRank())) + "/" + number_formatter(400e3))

        //blackOps completed
        let blackOpsCompleted = 0
        for (let blackOpEntry in data.bladeburner_actions.blackOps) {
            //get blackop name
            const blackOp = data.bladeburner_actions.blackOps[blackOpEntry]
            //if completed
            if (ns.bladeburner.getaction_countRemaining(data.bladeburner_actions.type.blackOps, blackOp.name) == 0) {
                //add to the counter
                blackOpsCompleted++
            } else {
                //not completed: stop
                break
            }
        }
        headers.push("Bladeburner BlackOps")
        values.push(blackOpsCompleted + "/"+ (data.bladeburner_actions.blackOps-1) ) //was 21 (this should be dynamic
    }


    //space for readable text
    headers.push("_______________________________")
    values.push("_______________________________")

    //external scripts
    for (const port in enum_port) {
        //check what is on the port
        const value = ns.peek(enum_port[port])
        //if a value is set
        if (value != portNoData) {
            //show the value + activity.type.slice(1).
            headers.push(port.charAt(0).toUpperCase() + port.slice(1))
            values.push(value)
        }
    }

    //send text to html element 
    hook0.innerText = headers.join("\n")
    hook1.innerText = values.join("\n")
}



/**
 * Function that a boolean if enough rep is reached for a faction
 * Always returns true if faction is sector-12 (to ensure grinding for neurflux governor
 * @param {NS} ns
 */
function should_work_for_faction(ns, faction) {
    //if sector-12
    if (faction == enum_factions.sector12.name) {
        //always work for neuroflux governor
        return true
    }
    
    //check if we need to work for faction
    if (ns.singularity.getAugmentationsFromFaction(faction).length > 0) {
        //keep track of the highest rep
        let rep_highest = -1
        //get owned augments
        let ownedAugs = get_augmentations_installed(ns)
        //for each augment of the faction
        for (let augment of ns.singularity.getAugmentationsFromFaction(faction)) {
            //if augment is not owned
            if (ownedAugs.indexOf(augment) == -1) {
                //update the highest rep if needed
                rep_highest = Math.max(rep_highest, ns.singularity.getAugmentationRepReq(augment))
            }
        }
        //return if there is enough rep (false) or if rep is still needed (true)
        return rep_highest >= ns.singularity.getFactionRep(faction)
    }
    return false
}



/**
 * Function to do a check for bladeburner access 
 */
function get_bladeburner_access(ns, challenge_flags) {
    //if performing the challenge
    if(challenge_flags.disable_bladeburner == true) {
        //no access
        return false
        
    } else {
        return ns.bladeburner.joinBladeburnerDivision()
    }
}


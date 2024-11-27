//imports
import {
    info, success, warning, error, fail, portNoData, //constants 
    enum_scripts, enum_servers, enum_factions, enum_cities, enum_port, enum_hackingCommands, //enums
    log, number_formatter, get_reset_info, get_bit_node_multipliers, get_challenge_flags, has_completed_bit_node_level, //functions
} from "scripts/common.js"

//common functions
import * as common from "../common.js"
//config
import * as config from "./config.js"
//data
import * as data from "./data.js"



//sleeve
import * as sleeve from "./sleeve/sleeve.js" //sleeve.manage_actions, sleeve.buy_augments, sleeve.init, sleeve.update_ui
//bladeburner
import * as bladeburner from "./bladeburner/bladeburner.js" //todo
//hacknet
import * as server from "./hacknet/hacknet.js"



/**
 * Function that handles everything
 * Mandatory: 
 *     Singularity (x GB)
 * Optional: 
 *     Hacknet (x GB)
 *     Sleeve (x GB)
 *     Bladeburner (x GB)
 * 
 * @param {NS} ns
 * 
 * Costs: 2,1 GB
 *  Base cost (1,6)
 *  killall (0,5) (inherited from init)
 */
export async function main(ns) {    
    //get reset info
    const reset_info = common.get_reset_info(ns) 
    //get bitnode information from file
    const bit_node_multipliers = common.get_bit_node_multipliers(ns)
    //get challenge config
    const challenge_flags = common.get_challenge_flags(ns)

    //keep track of launched scripts
    let launched_scripts = []

    //conditional imports, TODO: can be part of init or other function???
    /*
    //import hacknet
    let import_hacknet_file = "./hacknet/server.js"
    //check if we need to change
    if(common.has_completed_bit_node_level(ns, 9)) {
        //import hacknet
        import_hacknet_file = "./hacknet/hacknet.js"
    }
    //import the functions
    import * as server from import_hacknet_file //server.manage_servers

    
    //import sleeves
    let import_sleeve_file = "./sleeve/sleeve_dummy.js"
    //check if we need to change (either not unlocked or disabled)
    if((common.has_completed_bit_node_level(ns, 10)) &&
      challenge_flags.disable_sleeves != true) {
        //import sleeve
        import_sleeve_file = "./sleeve/sleeve.js"
    }
    //import the functions
    import * as sleeve from import_sleeve_file //sleeve.manage_actions, sleeve.buy_augments, sleeve.init, sleeve.update_ui

    
    //import bladeburner
    let import_bladeburner_file = "./bladeburner/bladeburner_dummy.js"
    //check if we need to change (either not unlocked or disabled)
    if((common.has_completed_bit_node_level(ns, 6)) &&
       (common.has_completed_bit_node_level(ns, 7)) &&
       (challenge_flags.disable_bladeburner != true)) {
        //import hacknet
        import_bladeburner_file = "./bladeburner/bladeburner.js"
    }
    //import the functions
    import * as bladeburner from import_bladeburner_file //todo
    */





    
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

        //hacking & scripts: 18,7 GB
        manage_hacking(ns)   //4,3 GB
        manage_scripts(ns, launched_scripts, bit_node_multipliers, challenge_flags)  //4,4 GB

        //player actions & bladeburner: 71 GB
        manage_actions(ns, bit_node_multipliers, challenge_flags)   //71 GB
        buy_augments(ns)  //10 GB
        
        //sleeve
        sleeve.manage_actions(ns, bit_node_multipliers) //
        sleeve.buy_augments(ns) //8 GB
        
        //servers: ? GB
        server.manage_servers(ns, challenge_flags)   // GB
        
        //update ui: 0 GB
        update_ui(ns, bit_node_multipliers, challenge_flags) //0 GB
        //reset & destruction: 0 GB
        execute_bit_node_destruction(ns, challenge_flags)   //0 GB (exernal script)
        install_augments(ns)    //0 GB (exernal script)

        //wait a bit
        await ns.sleep(config.time_between_loops)
    }
    //123,6 GB RAM used of 128 GB, 4,4 GB left
    //TODO: needs to be re-checked
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
    ns.disableLog("scan")
    ns.disableLog("ftpcrack")
    ns.disableLog("brutessh")
    ns.disableLog("sqlinject")
    ns.disableLog("httpworm")
    ns.disableLog("relaysmtp")
    ns.disableLog("nuke")
    ns.disableLog("scp")
    ns.disableLog("exec")
    ns.disableLog("killall")
    
    //singularity
    ns.disableLog("singularity.purchaseProgram")
    ns.disableLog("singularity.purchaseAugmentation")
    ns.disableLog("singularity.joinFaction")
    ns.disableLog("singularity.applyToCompany")
    ns.disableLog("singularity.purchaseTor")
    ns.disableLog("singularity.commitCrime")
    ns.disableLog("singularity.travelToCity")

    //hacknet
    ns.disableLog("singularity.upgradeHomeRam")
    ns.disableLog("singularity.upgradeHomeCores")
    
    //sleeve stuff
    sleeve.init(ns)

    //bladeburner stuff
    ns.disableLog("bladeburner.joinBladeburnerDivision")
    ns.disableLog("bladeburner.startAction")
    ns.disableLog("bladeburner.upgradeSkill")
    
    //open console
    /*
    ns.tail()
    ns.resizeTail(1000, 500)
    */

    //clear reset port
    ns.clearPort(common.enum_port.reset)

    //for each server
    for (let server of get_servers(ns)) {
        //check if it is home
        const is_server_home = (server == common.enum_servers.home)
        //kill all scripts
        ns.killall(server, is_server_home)
    }

    //signal hackManager to stop
    common.over_write_port(ns, common.enum_port.stopHack, common.enum_hackingCommands.stop)

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
    if (common.get_augmentations_installed(ns).indexOf(data.augments.theRedPill) > -1) {
        //then we can check the world daemon backdoor (otherwise the server doesn't exist)
        if (ns.getServer(enum_servers.worldDaemon).backdoorInstalled) {
            //backdoor is installed, proceed with destruction
            can_execute_destruction = true
        }
    }

    //bladeburner is possible
    if (get_bladeburner_access(ns, challenge_flags)) {
        //if operation Daedalus has been completed, do we need to check rank as well?
        if (ns.bladeburner.getActionCountRemaining(data.bladeburner_actions.type.blackOps, data.bladeburner_actions.blackOps.operationDaedalus.name) == 0) {
            //proceed with destruction
            can_execute_destruction = true
        }
    }

    //if destruction is possible
    if (can_execute_destruction) {
        //kill all other scripts on home
        ns.killall()
        //launch script to destroy bitnode
        ns.exec(enum_scripts.jump, enum_servers.home, 1,
            enum_scripts.destroyBitNode, true) //which script to launch, kill other scripts
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
 * Cost: 10 GB 
 *  getAugmentationsFromFaction (5)
 *  purchaseAugmentation (5) 
 */
function buy_augments(ns) {
    //if gang is busy with growing (and thus requiring money and blocking resets)
    if (ns.peek(common.enum_port.reset) == "gang") {
        //do not buy augments
        return
    }
    //get owned augments (to include bought?)
    let augments_installed = common.get_augmentations_installed(ns)
    //for every joined faction
    for (const faction of ns.getPlayer().factions) {
        //for each augment of the faction
        for (const augment of ns.singularity.getAugmentationsFromFaction(faction)) {
            //if not owned or is neuroflux
            if (augments_installed.indexOf(augment) == -1 || augment == data.augments.neuroFluxGovernor) {
                //try to buy
                if(ns.singularity.purchaseAugmentation(faction, augment)) {
                    //log information
                    common.log(ns,1,success,"Bought augment '" + augment + "' for player")
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
    const augments_installed = common.get_augmentations_installed(ns)
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
                common.over_write_port(ns, enum_port.stopHack, enum_hackingCommands.stop)
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
        common.over_write_port(ns, enum_port.stopHack, enum_hackingCommands.start)
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
            log(ns, 1, warning, "restart_player_actions failed 1. singularity.commitCrime(" + crime_best + ", " + action_focus + ")")
        }
    }        
}



/*
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
 */
function manage_actions(ns, bit_node_multipliers, challenge_flags) {
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
        const can_perform_dual_actions = (common.get_augmentations_installed(ns).indexOf(data.augments.bladesSimulacrum) > -1)

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
        const action_count = ns.bladeburner.getActionCountRemaining(enum_bladeburnerActions.type.contracts, contract)
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
            if (ns.bladeburner.getActionCountRemaining(data.bladeburner_actions.type.blackOps, blackOp.name) > 0) {
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
            const action_count = ns.bladeburner.getActionCountRemaining(data.bladeburner_actions.type.operations, operation)
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
            const action_count = ns.bladeburner.getActionCountRemaining(data.bladeburner_actions.type.contracts, contract)
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
 * Function that will return information about activities of the specified person
 * if index is not set, player information is returned, otherwise sleeve information
 * Cost: 0,5 GB
 *  getCurrentWork(0.5) 
 */
function get_activity(ns) {
    //create a return value
    //type is work type, value is the specific name of the work
    let activity = { type: "", value: "" }
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
 * Function that will display port data on UI
 * @param {NS} ns
 * Cost: 0 GB
 */
function update_ui(ns, bit_node_multipliers, challenge_flags) {
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
    //get the player
    const player = ns.getPlayer()
    
    //add entropy
    headers.push("Entropy")
    values.push(number_formatter(player.entropy))

    //add karma
    headers.push("Karma")
    values.push(number_formatter(player.karma) + "/" + number_formatter(data.requirements.karma_for_gang))

    //add kills
    headers.push("Kills")
    values.push(number_formatter(player.numPeopleKilled) + "/" + data.requirements.kills_for_factions)

    //add hack tools
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

    //add augments bought
    headers.push("Augments bought")
    //add global
    values.push(common.get_augmentations_installed(ns).length + "+" + get_augments_to_be_installed() + "/" + bit_node_multipliers["DaedalusAugsRequirement"])

    //sleeve, should not do anything if not unlocked
    //add sleeve values
    const sleeve_data = sleeve.update_ui(ns)
    //split in variables for readability
    const sleeve_headers = sleeve_data[0]
    const sleeve_values = sleeve_data[1]
    //for each header
    for (let index = 0; index < sleeve_headers.length; index++) {
        //add to header
        headers.push(sleeve_headers[index])
        //add specifics to data
        values.push(sleeve_values[index])
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
            if (ns.bladeburner.getActionCountRemaining(data.bladeburner_actions.type.blackOps, blackOp.name) == 0) {
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
 * Function to do a check for bladeburner access 
 */
function get_bladeburner_access(ns, challenge_flags) {
    //if unlocked (API and division) and not performing the challenge
    if(!has_completed_bit_node_level(ns, 6) || 
       !has_completed_bit_node_level(ns, 7) || 
       (challenge_flags.disable_bladeburner == true)) {
        //no access
        return false
        
    //unlocked and not disabled: check access
    } else {
        return ns.bladeburner.joinBladeburnerDivision()
    }
}



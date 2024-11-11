/**
 * TODO LIST:
 * manage_scripts: indicate and handle hack manager scaling up and scaling down, fill scripts
 * manageStanek: to test
 * reactive sleeves in actions and in purchase augments and update ui
 */
import { info, success, warning, error, fail } from "scripts/common.js"

//requirements to be fulfilled
const requirement = {
    karma_for_gang: -54000, //-54k
    kills_for_factions: 30,
    faction_netburners: { 
        levels: 100,
        ram: 8,
        cores: 4,
    },
}

//from https://github.com/bitburner-official/bitburner-src/blob/dev/src/Hacknet/data/HashUpgradesMetadata.tsx
const enum_hashUpgrades = {
    money: "Sell for Money",
    corporationFunds: "Sell for Corporation Funds",
    corporationResearch: "Exchange for Corporation Research",
    serverSecurityMin: "Reduce Minimum Security",
    serverMoneyMax: "Increase Maximum Money", // Use hashes to increase the maximum amount of money on a single server by 2%. This effect persists until you install Augmentations (since servers are reset at that time). Note that a server's maximum money is soft capped above <Money money={10e12}
    trainingStudying: "Improve Studying",
    trainingGym: "Improve Gym Training",
    bladeburnerRank: "Exchange for Bladeburner Rank",
    bladeburnerSkillPoints: "Exchange for Bladeburner SP",
    codingContract: "Generate Coding Contract",
    companyFavor: "Company Favor",
}

//minimum stat for hacking (todo: struct format?)
const stat_minimum_hacking = 25//50 //?

/**
 * Function that handles everything
 * @param {NS} ns
 * 
 * Costs: 3,1 GB
 *  Base cost (1,6)
 *  killall (0,5) (inherited from init)
 *  getreset_info (1)
 */
export async function main(ns) {    
    //set time to wait after each main loop
    const time_between_loops = 1 * 1000
    //minimum amount of augments before resetting
    const augments_minimum_for_reset = 4 //to be set to 40 for achievement
    //get reset info
    const reset_info = ns.getreset_info()
    //get bitnode information from file
    const bit_node_multipliers = JSON.parse(ns.read("bitNode/" + ns.getreset_info().currentNode + ".json"))
    //get challenge config
    const challenge_flags = JSON.parse(ns.read("challenge.json"))
    //number of sleeves available
    const sleeves_available = 8
    
    //stanek information
    let stanek_grid = { width: 0, height: 0 }
    //keep track of launched scripts
    let launched_scripts = []

    //initialize
    init(ns, bit_node_multipliers, stanek_grid, challenge_flags) //1,5 GB
    //restart work (to ensure it is set to non-focussed in case of restarting the game)
    restart_player_activity(ns)
    
    //wait a bit for first iteration
    await ns.sleep(time_between_loops)
    
    //main loop
    while (true) {
        //main script: 3,1 GB  
        //init: 1,5 GB

        //factions & companies: 13 GB
        manage_factions(ns)  //10 GB
        manage_companies(ns) //3 GB

        //servers & scripts: 18,5 GB
        manage_servers(ns)   //10 GB
        manage_hacking(ns)   //4,3 GB
        manage_scripts(ns, launched_scripts, bit_node_multipliers)  //4,2 GB

        //player, sleeve & bladeburner: 71 GB
        manage_actions(ns, sleeves_available, bit_node_multipliers)   //71 GB

        //update ui
        update_ui(ns, sleeves_available, bit_node_multipliers) //0 GB

        //reset & destruction: 18 GB
        execute_bit_node_destruction(ns)   //0 GB
        buy_augments(ns, sleeves_available)  //18 GB
        install_augments(ns, augments_minimum_for_reset)    //0 GB
        

        //wait a bit
        await ns.sleep(time_between_loops)
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
function init(ns, bit_node_multipliers, stanek_grid, challenge_flags) {

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

    //get reset info
    const reset_info = ns.getreset_info()

    //log information
    log_bit_node_information(ns, bit_node_multipliers, reset_info, stanek_grid)
    log_challenge_information(ns, challenge_flags)

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
    const augments_owned = ns.getreset_info().ownedAugs
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
function execute_bit_node_destruction(ns) {
    //set a flag for desctruction
    let can_execute_destruction = false

    //if the red pill is installed
    if (get_augmentations_installed(ns).indexOf(enum_augments.theRedPill) > -1) {
        //then we can check the world daemon backdoor (otherwise the server doesn't exist)
        if (ns.getServer(enum_servers.worldDaemon).backdoorInstalled) {
            //backdoor is installed, proceed with destruction
            can_execute_destruction = true
        }
    }

    //bladeburner is possible
    if (get_bladeburner_access(ns)) {
        //if operation Daedalus has been completed, do we need to check rank as well?
        if (ns.bladeburner.getaction_countRemaining(enum_bladeburnerActions.type.blackOps, enum_bladeburnerActions.blackOps.operationDaedalus.name) == 0) {
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
            enum_scripts.main, bit_node_next) //arguments (TODO: not boot to STANEK?)
    }
}



/**
 * Function that checks if we should reset
 * Cost: none
 * TODO: attach script for external reset
 */
function install_augments(ns, augments_minimum_for_reset) {
    //get number of bought augments
    const augments_to_be_installed = get_augments_to_be_installed()
    //TODO: check for bonus time? (if applicable)
    //if enough augments bought for a reset
    if (augments_to_be_installed >= augments_minimum_for_reset) {
        //read the port if we need to wait
        const reason_to_wait = ns.peek(enum_port.reset)
        //check if there is no reason to wait
        if (reason_to_wait == portNoData) {
            //TODO: better way to go over the factions? Check each faction and start with the faction with the smallest difference between rep cost and rep have? 
            //for every joined faction
            for (const faction of ns.getPlayer().factions) {
                //buy as much neuro as possible
                while (ns.singularity.purchaseAugmentation(faction, enum_augments.neuroFluxGovernor)) { /* Do nothing */ }
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
function buy_augments(ns, sleeves_available) {
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
            //if not owned
            if (augments_installed.indexOf(augment) == -1) {
                //try to buy
                if(ns.singularity.purchaseAugmentation(faction, augment)) {
                    log(ns,1,success,"Bought augment '" + augment + "' for player")
                }
            }
        }
    }
    
    //for each sleeve
    for (let index = 0; index < sleeves_available; index++) {
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
    for (let company in enum_company_factions) {
        //just try to join the company, default to "software"
        //also works for getting promotion
        ns.singularity.applyToCompany(company, "Software")
    }
}



/**
 * Function that manages buying and upgrading of servers
 * Also takes care of Faction Netburner requirements
 * No updating of cache: it is all spent on money
 * Cost: 10 GB
 *  upgradeHomeCores (3)
 *  upgradeHomeRam (3)
 *  hacknet (4)
 */
function manage_servers(ns) {
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
            if (hacknet_stats.cores < requirement.faction_netburners.cores) {
                //upgrade cores
                ns.hacknet.upgradeCore(server_index)
            }
    
            //only conditionally level the cores
            if (hacknet_stats.level < requirement.faction_netburners.levels) {
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
        ns.hacknet.spendHashes(enum_hashUpgrades.money)
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
            ns.singularity.purchaseProgram(enum_hack_tools.bruteSSH)
        }
        if (hacking >= 100) {
            ns.singularity.purchaseProgram(enum_hack_tools.fTPCrack)
        }
        if (hacking >= 300) {
            ns.singularity.purchaseProgram(enum_hack_tools.relaySMTP)
        }
        if (hacking >= 400) {
            ns.singularity.purchaseProgram(enum_hack_tools.hTTPWorm)
        }
        if (hacking >= 725) {
            ns.singularity.purchaseProgram(enum_hack_tools.sQLInject)
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
 * Cost: 4,2 GB
 *  getscript_ram (0,1)
 *  scan (0.2) (inherited from get_server_specific)
 *  scp (0.6)
 *  exec (1.3)
 *  getServer (2)
 */
function manage_scripts(ns, launched_scripts, bit_node_multipliers) {
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
        (player.karma < requirement.karma_for_gang)) { //and if karma threshold is reached
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
                const script_ram = ns.getscript_ram(script)
                //for each server
                for (const server of servers_that_can_execute) {
                    //calculate available ram
                    const ram_available = server.maxRam - server.ramUsed
                    //if enough ram
                    if (ram_available >= script_ram) {
                        //copy the script
                        if (ns.scp(script, enum_servers.home, server.hostname)) {
                            //execute the script
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
    //check if we joined bladeburner (default is false
    const bladeburner_joined = get_bladeburner_access(ns) 

    //if not enough hacking skill
    if (ns.getPlayer().skills.hacking < stat_minimum_hacking) {
        //get best crime for hacking
        const crime_best = ns.enums.CrimeType.robStore//get_crime_best(ns, bit_node_multipliers, player, enum_crimeFocus.hacking)
        //commit crime for karma
        if (!ns.singularity.commitCrime(crime_best, action_focus)) {
            log(ns, 1, warning, "manage_actions failed 1. singularity.commitCrime(" + crime_best + ", " + action_focus + ")")
        }
        
        //if we have not reached target karma
    } else if (player.karma > requirement.karma_for_gang) {
        //get best crime for karma
        const crime_best = ns.enums.CrimeType.mug//get_crime_best(ns, bit_node_multipliers, player, enum_crimeFocus.karma)
        //commit crime for karma
        if (!ns.singularity.commitCrime(crime_best, action_focus)) {
            log(ns, 1, warning, "manage_actions failed 2. singularity.commitCrime(" + crime_best + ", " + action_focus + ")")
        }
        
    } else {
        //if bladeburner joined: work for bladeburner
        if (bladeburner_joined) {
            //check what ae are doing for bladeburner
            const bladeburner_action_current = bladeburner_get_activity(ns)
            //do bladeburner stuff
            const bladeburner_action_wanted = bladeburner_determine_action(ns, player)
            //start bladeburner action
            if (!ns.bladeburner.startAction(bladeburner_action_wanted.type, bladeburner_action_wanted.name)) {
                log(ns, 1, warning, "manage_actions failed bladeburner.startAction(" + bladeburner_action_wanted.type + ", " + bladeburner_action_wanted.name + ")")
            }
        }

        //check if we can do both bladeburner and normal work
        const can_perform_dual_actions = (get_augmentations_installed(ns).indexOf(enum_augments.bladesSimulacrum) > -1)

        //if bladeburner is not joined or augment for dual work is installed
        if ((!bladeburner_joined) || (can_perform_dual_actions)) {
            //get best crime for combat skills
            const crime_best = ns.enums.CrimeType.grandTheftAuto//get_crime_best(ns, bit_node_multipliers, player, enum_crimeFocus.skills)
            //commit crime for money/stats?
            if (ns.singularity.commitCrime(crime_best, action_focus)) {
                log(ns, 1, warning, "manage_actions failed 3. singularity.commitCrime(" + crime_best + ", " + action_focus + ")")
            }
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
function manage_actions(ns, sleeves_available, bit_node_multipliers) {
    //first manage player
    manage_actions_player(ns, bit_node_multipliers)
    //then manange sleeves
    manage_actions_sleeves(ns, sleeves_available, bit_node_multipliers)
}

function manage_actions_player(ns, bit_node_multipliers) {
    //get player
    const player = ns.getPlayer()
    //get player activity
    const player_activity = get_activity(ns)
    //set the default focus for actions (always false)
    const action_focus = false
    //check if we joined bladeburner (default is false
    const bladeburner_joined = get_bladeburner_access(ns) 

    //if not enough hacking skill
    if (ns.getPlayer().skills.hacking < stat_minimum_hacking) {
        //get best crime for hacking
        const crime_best = ns.enums.CrimeType.robStore//get_crime_best(ns, bit_node_multipliers, player, enum_crimeFocus.hacking)
        //if not performing the correct crime
        if (player_activity.value != crime_best) {
            //commit crime for karma
            if (!ns.singularity.commitCrime(crime_best, action_focus)) {
                log(ns, 1, warning, "manage_actions failed 1. singularity.commitCrime(" + crime_best + ", " + action_focus + ")")
            }
        }
        //if we have not reached target karma
    } else if (player.karma > requirement.karma_for_gang) {
        //get best crime for karma
        const crime_best = ns.enums.CrimeType.mug//get_crime_best(ns, bit_node_multipliers, player, enum_crimeFocus.karma)
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
        const can_perform_dual_actions = (get_augmentations_installed(ns).indexOf(enum_augments.bladesSimulacrum) > -1)

        //if bladeburner is not joined or augment for dual work is installed
        if ((!bladeburner_joined) || (can_perform_dual_actions)) {
            //get best crime for combat skills
            const crime_best = ns.enums.CrimeType.grandTheftAuto//get_crime_best(ns, bit_node_multipliers, player, enum_crimeFocus.skills)
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
    
manage_actions_sleeves(ns, sleeves_available, bit_node_multipliers) {
    //sleeve actions
    //shock value that is wanted (96%)
    const sleeve_shock_desired_maximum = 0.96
    //get all max shock value
    let sleeve_shock = []

    //for each sleeve
    for (let index = 0; index < sleeves_available; index++) {
        //get shock value
        const shock = ns.sleeve.getSleeve(index).shock
        //add the shock to the list
        sleeve_shock.push(shock)
    }

    //if there is a sleeve with too much shock
    if (Math.max(sleeve_shock) > sleeve_shock_desired_maximum) {
        //for each sleeve
        for (let index = 0; index < sleeves_available; index++) {
            //if not doing the correct work
            if (get_activity(ns, index).type != enum_activities.recovery) {
                //perform recovery
                ns.sleeve.setToShockRecovery(index)
            }
        }

        //if we have not reached target karma
    } else if (player.karma > requirement.karma_for_gang) {
        //for each sleeve
        for (let index = 0; index < sleeves_available; index++) {
            //get best crime for karma
            let crime_best = ns.enums.CrimeType.mug//get_crime_best(ns, bit_node_multipliers, player, enum_crimeFocus.karma)
            //if not doing the correct work
            if (get_activity(ns, index).value != crime_best) {
                //perform crime for karma
                ns.sleeve.setToCommitCrime(index, crime_best)
            }
        }

        //not reached target kills
    } else if (player.numPeopleKilled < requirement.kills_for_factions) {
        //for each sleeve
        for (let index = 0; index < sleeves_available; index++) {
            //get best crime for kills
            let crime_best = ns.enums.CrimeType.homicide//get_crime_best(ns, bit_node_multipliers, player, enum_crimeFocus.kills)
            //if not performing the correct work
            if (get_activity(ns, index).value != crime_best) {
                //perform crime
                ns.sleeve.setToCommitCrime(index, crime_best)
            }
        }

        //sleeves to be divided over work
    } else {
        //keep track of sleeve actions
        let sleeve_actions = {}

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
                    for (let index = 0; index < sleeves_available; index++) {
                        //get activity
                        const activity = get_activity(ns, index)
                        //if a sleeve is already working for this faction
                        if ((activity.type == enum_activities.faction) &&
                            (activity.value == faction)) {
                            //assign this job to the sleeve
                            sleeve_actions[index] = activity
                            //set flag to indicate someone is already working on this
                            already_working_for_faction = true
                            //stop searching
                            break
                        }
                    }
                    //if flag is not set
                    if (!already_working_for_faction) {
                        //check each sleeve
                        for (let index = 0; index < sleeves_available; index++) {
                            //check if the sleeve is not assigned
                            if (!Object.hasOwn(sleeve_actions, index)) {
                                //get best faction work
                                const faction_work_best = determine_faction_work(ns.sleeve.getSleeve(index), work_types)
                                //try to start
                                try {
                                    //work for this faction
                                    if (ns.sleeve.setToFactionWork(index, faction, faction_work_best)) {
                                        //save information
                                        sleeve_actions[index] = { type: enum_activities.faction, value: faction }
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
                for (let index = 0; index < sleeves_available; index++) {
                    //get activity
                    const activity = get_activity(ns, index)
                    //if a sleeve is already working for this company
                    if ((activity.type == enum_activities.company) &&
                        (activity.value == company)) {
                        //assign this job to the sleeve
                        sleeve_actions[index] = activity
                        //set flag to indicate someone is already working on this
                        company_already_working = true
                        //stop searching
                        break
                    }
                }
                //if flag is not set
                if (!company_already_working) {
                    //check each sleeve
                    for (let index = 0; index < sleeves_available; index++) {
                        //check if the sleeve is not assigned
                        if (!Object.hasOwn(sleeve_actions, index)) {
                            try {
                                //work for company
                                ns.sleeve.setToCompanyWork(index, company)
                                //save information
                                sleeve_actions[index] = { type: enum_activities.company, value: company }

                            } catch (error) {
                                log(ns, 1, error, "setToCompanyWork " + company + ": " + error)
                            }
                        }
                    }
                }
            }
        }

        //check each sleeve
        for (let index = 0; index < sleeves_available; index++) {
            //check if the sleeve is not assigned
            if (!Object.hasOwn(sleeve_actions, index)) {
                //get best crime for skills
                let crime_best = ns.enums.CrimeType.grandTheftAuto//get_crime_best(ns, bit_node_multipliers, ns.sleeve.getSleeve(index), enum_crimeFocus.skills)
                //if not working on the desired crime
                if (get_activity(ns, index).value != crime_best) {
                    //assign to crime
                    ns.sleeve.setToCommitCrime(index, crime_best)
                }
                //save information
                sleeve_actions[index] = { type: enum_activities.crime, value: crime_best }
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
    for (let crime_index in enum_crimes) {
        //get the data
        const crime_data = enum_crimes[crime_index]


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
    //target min chance before attempting bladeburner
    const bladeburner_success_chance_minimum = 1
    const bladeburner_black_op_success_chance_minimum = 0.5
    
    //go to lowest chaos city (lower chaos = higher success chances)
    //keep track of previous chaos
    let bladeburner_chaos_lowest = 999999
    
    //upgrade skills
    //for each bladeburner skill
    for (const skill in enum_bladeburnerSkills) {
        //upgrade skill without checking details (money, level cap)
        ns.bladeburner.upgradeSkill(enum_bladeburnerSkills[skill])
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
        for (const activity in enum_bladeburnerActions.blackOps) {
            //get blackOp information
            const blackOp = enum_bladeburnerActions.blackOps[activity]
            //check if this is the black op that is to be done
            if (ns.bladeburner.getaction_countRemaining(enum_bladeburnerActions.type.blackOps, blackOp.name) > 0) {
                //get chance
                const chance = ns.bladeburner.getActionEstimatedSuccessChance(enum_bladeburnerActions.type.blackOps, blackOp.name)
                //check if we have enough rank and enough chance
                if ((bladeburner_rank > blackOp.reqRank) &&
                    (chance[0] >= bladeburner_black_op_success_chance_minimum)) {
                    //return this information
                    return { type: enum_bladeburnerActions.type.blackOps, name: blackOp.name }
                }
                //stop looking!
                break
            }
        }



        //operations
        //for each operation
        for (const activity in enum_bladeburnerActions.operations) {
            //get operation information
            const operation = enum_bladeburnerActions.operations[activity]
            //get action count
            const action_count = ns.bladeburner.getaction_countRemaining(enum_bladeburnerActions.type.operations, operation)
            //get chance
            const chance = ns.bladeburner.getActionEstimatedSuccessChance(enum_bladeburnerActions.type.operations, operation)
            //if this action can be performed and we have enough chance
            if ((action_count >= 1) && (chance[0] >= bladeburner_success_chance_minimum)) {
                //return this information
                return { type: enum_bladeburnerActions.type.operations, name: operation }
            }
            //add count to total actions available
            bladeburner_total_action_count += action_count
        }

        //contracts
        //for each contract
        for (const activity in enum_bladeburnerActions.contracts) {
            //get contract information
            const contract = enum_bladeburnerActions.contracts[activity]
            //get action count
            const action_count = ns.bladeburner.getaction_countRemaining(enum_bladeburnerActions.type.contracts, contract)
            //get chance
            const chance = ns.bladeburner.getActionEstimatedSuccessChance(enum_bladeburnerActions.type.contracts, contract)
            //if this action can be performed and we have enough chance
            if ((action_count >= 1) && (chance[0] >= bladeburner_success_chance_minimum)) {
                //return this information
                return { type: enum_bladeburnerActions.type.contracts, name: contract }
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
        return { type: enum_bladeburnerActions.type.general, name: enum_bladeburnerActions.general.diplomacy }
    }
    //if no operations or contracts available
    if (bladeburner_total_action_count == 0) {
        //generate operations and contracts
        return { type: enum_bladeburnerActions.type.general, name: enum_bladeburnerActions.general.inciteViolence }
    }
    //default: raise success chances
    return { type: enum_bladeburnerActions.type.general, name: enum_bladeburnerActions.general.fieldAnalysis }
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
                case enum_activities.study: activity.value = player_activity.classType; break
                case enum_activities.company: activity.value = player_activity.companyName; break
                //case enum_activities.createProgram: activity.value = player_activity.programName; break
                case enum_activities.crime: activity.value = player_activity.crimeType; break
                case enum_activities.faction: activity.value = player_activity.factionName; break
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
                case enum_activities.study: activity.value = sleeve_activity.classType; break
                case enum_activities.company: activity.value = sleeve_activity.companyName; break
                case enum_activities.crime: activity.value = sleeve_activity.crimeType; break
                case enum_activities.faction: activity.value = sleeve_activity.factionName; break
                //bladeburner?
                case enum_activities.bladeburner: activity.value = sleeve_activity.actionName; break
                case enum_activities.infiltrate: activity.value = ""; break //only type property
                case enum_activities.support: activity.value = ""; break //only type property
                //sleeve only
                case enum_activities.recovery: activity.value = ""; break //only type property
                case enum_activities.synchro: activity.value = ""; break //only type property                
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
        activity.type = enum_activities.bladeburner
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
function update_ui(ns, sleeves_available, bit_node_multipliers) {
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
    values.push(number_formatter(player.karma) + "/" + number_formatter(requirement.karma_for_gang))

    //kills
    headers.push("Kills")
    values.push(number_formatter(player.numPeopleKilled) + "/" + requirement.kills_for_factions)

    //hack tools
    const hacking = player.skills.hacking
    let hack_tools = 0
    if (hacking >= 50) {
        if (ns.singularity.purchaseProgram(enum_hack_tools.bruteSSH)) {
            hack_tools++
        }
    }
    if (hacking >= 100) {
        if (ns.singularity.purchaseProgram(enum_hack_tools.fTPCrack)) {
            hack_tools++
        }
    }
    if (hacking >= 300) {
        if (ns.singularity.purchaseProgram(enum_hack_tools.relaySMTP)) {
            hack_tools++
        }
    }
    if (hacking >= 400) {
        if (ns.singularity.purchaseProgram(enum_hack_tools.hTTPWorm)) {
            hack_tools++
        }
    }
    if (hacking >= 725) {
        if (ns.singularity.purchaseProgram(enum_hack_tools.sQLInject)) {
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



    //sleeves
    //want to log augments of sleeves, but this costs 4 GB...
    for (let index = 0; index < sleeves_available; index++) {
        //get sleeve activity
        const activity = get_activity(ns, index)
        //add to header
        headers.push("Sleeve " + index + "(" + ns.sleeve.getSleeve(index).shock + ")")
        //add specifics to data
        values.push(activity.type.charAt(0) + activity.type.slice(1).toLowerCase() + ": " + activity.value)
    }

    //bladeburner
    
    
    if (get_bladeburner_access(ns)) {
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
        for (let blackOpEntry in enum_bladeburnerActions.blackOps) {
            //get blackop name
            const blackOp = enum_bladeburnerActions.blackOps[blackOpEntry]
            //if completed
            if (ns.bladeburner.getaction_countRemaining(enum_bladeburnerActions.type.blackOps, blackOp.name) == 0) {
                //add to the counter
                blackOpsCompleted++
            } else {
                //not completed: stop
                break
            }
        }
        headers.push("Bladeburner BlackOps")
        values.push(blackOpsCompleted + "/"+ (enum_bladeburnerActions.blackOps-1) ) //was 21 (this should be dynamic
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
 * Function that enables easy logging
 * Cost: 0
 */
function log(ns, log_level, type, message) {
    //depending on log_level
    switch (log_level) {
        case 2: //alert
            ns.alert(message)
        case 1: //console log
            ns.tprint(type + " " + message)
        case 0: //log
            ns.print(type + " " + message)
        default:
            //do nothing?
            break
    }
}



/**
 * Function that formats numbers
 * Cost: 0
 */
function number_formatter(number) {
    const fraction_digits = 3
    if (number == 0) {
        return 0
    }
    //round the number
    number = Math.round(number)

    const symbols = ["", "k", "m", "b", "t"]
    let largestIndex = 0
    for (let index = 0; index < symbols.length; index++) {
        if (Math.abs(number) >= Math.pow(1000, index)) {
            largestIndex = index
        } else {
            break
        }
    }
    let numberReturn = number
    if (largestIndex > 0) {
        numberReturn = Math.sign(number) * ((Math.abs(number) / Math.pow(1000, largestIndex)).toFixed(fraction_digits))
    }
    return numberReturn + symbols[largestIndex]
}



/**
 * Function that a boolean if enough rep is reached for a faction
 * @param {NS} ns
 */
function should_work_for_faction(ns, faction) {
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
                rep_highest = Math.max(rep_highest, ns.singularity.getAugmentationRepReq(augment)) //enum_augmentsRep[augment])
            }
        }
        return rep_highest >= ns.singularity.getFactionRep(faction)
    }
    return false
}

/**
 * list of all augments and their rep requirement
 */
const enum_augmentsRep = {
    "": 0,
}



/**
 * enum of special servers
 * All servers will be backdoored, if possible
 */
const enum_servers = {
    home: "home",   //no effect
    worldDaemon: "w0r1d_d43m0n",    //bitnode destruction
    //fulcrumSecretTechnologies: "fulcrumassets",     //fulcrum faction
}



/**
 * Enum of all factions with their work types
 * Slum snakes (gang faction) and bladeburner cannot be worked for, hence they have no work_types
 * Work types: "field", "hacking", "security" 	
 */
const enum_factions = {
    //special factions (no faction work available)
    slumSnakes: { name: "Slum Snakes" },
    bladeburners: { name: "Bladeburners" },
    churchOfTheMachineGod: { name: "Church of the Machine God" },
    shadowsOfAnarchy: { name: "Shadows of Anarchy" },

    //important factions
    daedalus: { name: "Daedalus", work_types: ["field", "hacking"] },
    illuminati: { name: "Illuminati", work_types: ["field", "hacking"] },
    theCovenant: { name: "The Covenant", work_types: ["field", "hacking"] },

    //company factions
    eCorp: { name: "ECorp", work_types: ["field", "hacking", "security"] },
    megaCorp: { name: "MegaCorp", work_types: ["field", "hacking", "security"] },
    bachmanAssociates: { name: "Bachman & Associates", work_types: ["field", "hacking", "security"] },
    bladeIndustries: { name: "Blade Industries", work_types: ["field", "hacking", "security"] },
    nWO: { name: "NWO", work_types: ["field", "hacking", "security"] },
    clarkeIncorporated: { name: "Clarke Incorporated", work_types: ["field", "hacking", "security"] },
    omniTekIncorporated: { name: "OmniTek Incorporated", work_types: ["field", "hacking", "security"] },
    fourSigma: { name: "Four Sigma", work_types: ["field", "hacking", "security"] },
    kuaiGongInternational: { name: "KuaiGong International", work_types: ["field", "hacking", "security"] },
    fulcrumSecretTechnologies: { name: "Fulcrum Secret Technologies", work_types: ["hacking", "security"] },

    //hacking factions
    bitRunners: { name: "BitRunners", work_types: ["hacking"] },
    theBlackHand: { name: "The Black Hand", work_types: ["field", "hacking"] },
    niteSec: { name: "NiteSec", work_types: ["hacking"] },
    cyberSec: { name: "CyberSec", work_types: ["hacking"] },

    //location factions
    aevum: { name: "Aevum", work_types: ["field", "hacking", "security"] },
    chongqing: { name: "Chongqing", work_types: ["field", "hacking", "security"] },
    ishima: { name: "Ishima", work_types: ["field", "hacking", "security"] },
    newTokyo: { name: "New Tokyo", work_types: ["field", "hacking", "security"] },
    sector12: { name: "Sector-12", work_types: ["field", "hacking", "security"] },
    volhaven: { name: "Volhaven", work_types: ["field", "hacking", "security"] },

    //crime factions
    speakersForTheDead: { name: "Speakers for the Dead", work_types: ["field", "hacking", "security"] },
    theDarkArmy: { name: "The Dark Army", work_types: ["field", "hacking"] },
    theSyndicate: { name: "The Syndicate", work_types: ["field", "hacking", "security"] },
    silhouette: { name: "Silhouette", work_types: ["field", "hacking"] },
    tetrads: { name: "Tetrads", work_types: ["field", "security"] },

    //other factions
    netburners: { name: "Netburners", work_types: ["hacking"] },
    tianDiHui: { name: "Tian Di Hui", work_types: ["hacking", "security"] },
}



/**
 * Enum stating all cities
 */
const enum_cities = {
    aevum: "Aevum",
    chongqing: "Chongqing",
    ishima: "Ishima",
    newTokyo: "New Tokyo",
    sector12: "Sector-12",
    volhaven: "Volhaven",
}



/**
 * Enum stating special augments
 */
const enum_augments = {
    theRedPill: "The Red Pill", //enables bitnode destruction by hacking
    neuroFluxGovernor: "NeuroFlux Governor",
    bladesSimulacrum: "The Blade's Simulacrum", //"This augmentation allows you to perform Bladeburner actions and other actions (such as working, committing crimes, etc.) at the same time.",
    neuroreceptorManager: "Neuroreceptor Management Implant", //"This augmentation removes the penalty for not focusing on actions such as working in a job or working for a faction.",
}



/**
 * Enum describing the activities of the player and sleeve
 * getCurrentWork: https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.task.md
 * getCurrentAction: https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.bladeburnercuraction.md
 * getTask: https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.sleevetask.md
 */
const enum_activities = {
    //getCurrentWork (player)
    study: "CLASS", //properties: type, classType, location, cyclesWorked (player)
    company: "COMPANY", //properties: type, companyName, cyclesWorked (player)
    //createProgram: "CREATE_PROGRAM", //properties: type, programName, cyclesWorked
    crime: "CRIME", //properties: type, crimeType, cyclesWorked, cyclesNeeded (sleeve), tasksCompleted (sleeve)
    faction: "FACTION", //properties: type, factionName, factionwork_type, cyclesWorked (player)		
    grafting: "GRAFTING", //properties: type, augmentation, completion, cyclesWorked
    //bladeburner (player)
    //properties: type, name
    /*
    Property 	Modifiers 	Type 	Description
    name 		string 	Name of Action
    type 		string 	Type of Action
    */
    //getTask (sleeve)
    bladeburner: "BLADEBURNER", //properties: type, actionType, actionName, cyclesWorked, cyclesNeeded, nextCompletion, tasksCompleted
    infiltrate: "INFILTRATE", //properties: type, cyclesWorked, cyclesNeeded, nextCompletion
    recovery: "RECOVERY", //properties: type
    support: "SUPPORT", //properties: type
    synchro: "SYNCHRO", //properties: type
}



/**
 * Enum for possible crimes
 * Mug is used for karma (best karma / time)
 * homicide is used for kills (only needed for a short bit, Assassination is not used)
 * the rest doesn't matter
 */
const enum_crimes = {
    shoplift: {
        type: "Shoplift",
        time: 2e3,
        money: 15e3,
        difficulty: 1 / 20,
        karma: 0.1,
        kills: 0,
        weight: { dexterity: 1, agility: 1, },
        exp: { dexterity: 2, agility: 2, },
    },
    robStore: {
        type: "Rob Store",
        time: 60e3,
        money: 400e3,
        difficulty: 1 / 5,
        karma: 0.5,
        kills: 0,
        weight: { hacking: 0.5, dexterity: 2, agility: 1, },
        exp: { hacking: 30, dexterity: 45, agility: 45, intelligence: 7.5 * 0.05, },
    },
    mug: {
        type: "Mug",
        time: 4e3,
        money: 36e3,
        difficulty: 1 / 5,
        karma: 0.25,
        kills: 0,
        weight: { strength: 1.5, defense: 0.5, dexterity: 1.5, agility: 0.5, },
        exp: { strength: 3, defense: 3, dexterity: 3, agility: 3, },
    },
    larceny: {
        type: "Larceny",
        time: 90e3,
        money: 800e3,
        difficulty: 1 / 3,
        karma: 1.5,
        kills: 0,
        weight: { hacking: 0.5, dexterity: 1, agility: 1, },
        exp: { hacking: 45, dexterity: 60, agility: 60, },
    },
    dealDrugs: {
        type: "Deal Drugs",
        time: 10e3,
        money: 120e3,
        difficulty: 1,
        karma: 0.5,
        kills: 0,
        weight: { dexterity: 2, agility: 1, charisma: 3, },
        exp: { dexterity: 5, agility: 5, charisma: 10, },
    },
    bondForgery: {
        type: "Bond Forgery",
        time: 300e3,
        money: 4.5e6,
        difficulty: 1 / 2,
        karma: 0.1,
        kills: 0,
        weight: { hacking: 0.05, dexterity: 1.25, },
        exp: { hacking: 100, dexterity: 150, charisma: 15, intelligence: 60 * 0.05, },
    },
    traffickArms: {
        type: "Traffick Arms",
        time: 40e3,
        money: 600e3,
        difficulty: 2,
        karma: 1,
        kills: 0,
        weight: { strength: 1, defense: 1, dexterity: 1, agility: 1, charisma: 1, },
        exp: { strength: 20, defense: 20, dexterity: 20, agility: 20, charisma: 40, },
    },
    homicide: {
        type: "Homicide",
        time: 3e3,
        money: 45e3,
        difficulty: 1,
        karma: 3,
        kills: 1,
        weight: { strength: 2, defense: 2, dexterity: 0.5, agility: 0.5, },
        exp: { strength: 2, defense: 2, dexterity: 2, agility: 2, },
    },
    grandTheftAuto: {
        type: "Grand Theft Auto",
        time: 80e3,
        money: 1.6e6,
        difficulty: 8,
        karma: 5,
        kills: 0,
        weight: { hacking: 1, strength: 1, dexterity: 4, agility: 2, charisma: 2, },
        exp: { strength: 20, defense: 20, dexterity: 20, agility: 80, charisma: 40, intelligence: 16 * 0.05, },
    },
    kidnap: {
        type: "Kidnap",
        time: 120e3,
        money: 3.6e6,
        difficulty: 5,
        karma: 6,
        kills: 0,
        weight: { strength: 1, dexterity: 1, agility: 1, charisma: 1, },
        exp: { strength: 80, defense: 80, dexterity: 80, agility: 80, charisma: 80, intelligence: 26 * 0.05, },
    },
    assassination: {
        type: "Assassination",
        time: 300e3,
        money: 12e6,
        difficulty: 8,
        karma: 10,
        kills: 1,
        weight: { strength: 1, dexterity: 1, agility: 1, },
        exp: { strength: 300, defense: 300, dexterity: 300, agility: 300, intelligence: 65 * 0.05, },
    },
    heist: {
        type: "Heist",
        time: 600e3,
        money: 120e6,
        difficulty: 18,
        karma: 15,
        kills: 0,
        weight: { hacking: 1, strength: 1, defense: 1, dexterity: 1, agility: 1, charisma: 1, },
        exp: { hacking: 450, strength: 450, defense: 450, dexterity: 450, agility: 450, charisma: 450, intelligence: 130 * 0.05, },
    },
}



/**
 * Enum that provides the available focus for determining crimes
 */
const enum_crimeFocus = {
    karma: "karma",
    kills: "kills",
    skills: "skills",
    hacking: "hacking",
}



/**
 * enum that holds the bladeburner skills (in priority)
 */
const enum_bladeburnerSkills = {
    //reduces time
    overclock: "Overclock", //Each level of this skill decreases the time it takes to attempt a Contract, Operation, and BlackOp by 1% (Max Level: 90)
    //raises chance
    bladesIntuition: "Blade's Intuition", //Each level of this skill increases your success chance for all Contracts, Operations, and BlackOps by 3%
    cloak: "Cloak", //raises success chance in stealth-related Contracts, Operations, and BlackOps by 5.5%
    shortCircuit: "Short-Circuit", //raises success chance in Contracts, Operations, and BlackOps that involve retirement by 5.5%
    digitalObserver: "Digital Observer", //Each level of this skill increases your success chance in all Operations and BlackOps by 4%
    tracer: "Tracer", //Each level of this skill increases your success chance in all Contracts by 4%
    reaper: "Reaper",   //Each level of this skill increases your effective combat stats for Bladeburner actions by 2%
    evasiveSystem: "Evasive System", //Each level of this skill increases your effective dexterity and agility for Bladeburner actions by 4%
    datamancer: "Datamancer", //Each level of this skill increases your effectiveness in synthoid population analysis and investigation by 5%. This affects all actions that can potentially increase the accuracy of your synthoid population/community estimates.
    //other
    cybersEdge: "Cyber's Edge", //Each level of this skill increases your max stamina by 2%
    hyperdrive: "Hyperdrive", //Each level of this skill increases the experience earned from Contracts, Operations, and BlackOps by 10%
    handsOfMidas: "Hands of Midas", //Each level of this skill increases the amount of money you receive from Contracts by 10%"
}



/**
 * Enum for going through and checking (available) actions and their requirements (if applicable)
 */
const enum_bladeburnerActions = {
    type: {
        blackOps: "Black Operations",
        operations: "Operations",
        contracts: "Contracts",
        general: "General",
    },
    blackOps: {
        operationTyphoon: { name: "Operation Typhoon", reqRank: 2.5e3, },
        operationZero: { name: "Operation Zero", reqRank: 5e3, },
        operationX: { name: "Operation X", reqRank: 7.5e3, },
        operationTitan: { name: "Operation Titan", reqRank: 10e3, },
        operationAres: { name: "Operation Ares", reqRank: 12.5e3, },
        operationArchangel: { name: "Operation Archangel", reqRank: 15e3, },
        operationJuggernaut: { name: "Operation Juggernaut", reqRank: 20e3, },
        operationRedDragon: { name: "Operation Red Dragon", reqRank: 25e3, },
        operationK: { name: "Operation K", reqRank: 30e3, },
        operationDeckard: { name: "Operation Deckard", reqRank: 40e3, },
        operationTyrell: { name: "Operation Tyrell", reqRank: 50e3, },
        operationWallace: { name: "Operation Wallace", reqRank: 75e3, },
        operationShoulderOfOrion: { name: "Operation Shoulder of Orion", reqRank: 100e3, },
        operationHyron: { name: "Operation Hyron", reqRank: 125e3, },
        operationMorpheus: { name: "Operation Morpheus", reqRank: 150e3, },
        operationIonStorm: { name: "Operation Ion Storm", reqRank: 175e3, },
        operationAnnihilus: { name: "Operation Annihilus", reqRank: 200e3, },
        operationUltron: { name: "Operation Ultron", reqRank: 250e3, },
        operationCenturion: { name: "Operation Centurion", reqRank: 300e3, },
        operationVindictus: { name: "Operation Vindictus", reqRank: 350e3, },
        operationDaedalus: { name: "Operation Daedalus", reqRank: 400e3, },
    },
    operations: {
        assassination: "Assassination",
        stealthRetirement: "Stealth Retirement Operation",
        //raid: "Raid", //disabled: requires communities to be presents: needs extra RAM to check
        sting: "Sting Operation",
        undercover: "Undercover Operation",
        investigation: "Investigation",
    },
    contracts: {
        retirement: "Retirement",
        bountyHunter: "Bounty Hunter",
        tracking: "Tracking",
    },
    general: {
        training: "Training",
        fieldAnalysis: "Field Analysis",
        recruitment: "Recruitment",
        diplomacy: "Diplomacy",
        hyperbolicRegen: "Hyperbolic Regeneration Chamber",
        inciteViolence: "Incite Violence",
    },
}



/**
 * Enum that describes the bladeburner actions that sleeves can take
 */
const enum_sleeveBladeburnerActions = {
    fieldAnalysis: "Field Analysis",
    recruitment: "Recruitment",
    diplomacy: "Diplomacy",
    infiltratesynthoids: "Infiltrate synthoids",
    supportmainsleeve: "Support main sleeve",
    takeonContracts: "Take on Contracts",
}



/**
 * Enum that describes the companies we want to join, and the faction behind it
 * Only fulcrum has a different faction name
 */
const enum_company_factions = {
    //225 stat(s) required
    "Bachman & Associates": "Bachman and Associates",
    "KuaiGong International": "KuaiGong International",
    "Four Sigma": "Four Sigma",
    "Blade Industries": "Blade Industries",
    "OmniTek Incorporated": "OmniTek Incorporated",
    "Clarke Incorporated": "Clarke Incorporated",
    "Fulcrum Technologies": "Fulcrum Secret Technologies",
    //250 stat(s) required
    "NWO": "NWO",
    "ECorp": "ECorp",
    "MegaCorp": "MegaCorp",
}







/**
 * description of all hack tools
 */
const enum_hack_tools = {
    bruteSSH: "BruteSSH.exe",   //500e3
    fTPCrack: "FTPCrack.exe",   //1500e3
    relaySMTP: "relaySMTP.exe", //5e6
    hTTPWorm: "HTTPWorm.exe",   //30e6
    sQLInject: "SQLInject.exe", //250e6
}



/**
 * Enum describing the port numbers
 */
const enum_port = {
    //external scripts
    reset: 1,
    hack: 2,
    gang: 3,
    corporation: 4,
    stock: 5,
    backdoor: 6,
    stopHack: 7,
}
const portNoData = "NULL PORT DATA"
const enum_hackingCommands = {
    start: "Start",
    stop: "Stop",
}


/**
 * Enum containing scripts
 */
const enum_scripts = {
    boot: "scripts/boot.js",
    main: "scripts/main.js",
    jump: "scripts/jumpScript.js",
    destroyBitNode: "scripts/destroyBitNode.js",
    reset: "scripts/reset.js",
    backdoor: "scripts/backdoor.js",
    hack: "scripts/hack.js",
    gang: "scripts/gang.js",
    corporation: "scripts/corporation.js",
    stock: "scripts/stock.js",
    workerHack: "scripts/workerHack.js",
    workerGrow: "scripts/workerGrow.js",
    workerWeaken: "scripts/workerWeaken.js",
    stanekCreate: "scripts/stanekCreate.js",
    stanekCharge: "scripts/stanekCharge.js",
    workerCharge: "scripts/workerCharge.js",
}



/**
 * Function that will output bitnode multipliers in a formatted way
 */
function log_bit_node_information(ns, bit_node_multipliers, reset_info, stanek_grid) {
    //get the bitnode
    let bitnode = reset_info.currentNode
    //set level
    let sourceFile = 1
    //if we have source file
    if (reset_info.ownedSF.has(bitnode)) {
        //add the owned level to the source file
        sourceFile += reset_info.ownedSF.get(bitnode)
        //if bitnode is not 12 (which is unlimited)
        if (bitnode != 12) {
            //limit if needed
            sourceFile = Math.min(sourceFile, 3)
        }
    }
    //set log type
    let logType = info
    //get difficulty
    const difficulty = bit_node_multipliers["WorldDaemonDifficulty"]
    //get default hacking skill required for world deamon
    const worldDeamonHackingSkill = 3000
    //log bitnode information
    log(ns, 1, logType, "BitNode: " + bitnode + "." + sourceFile + ", World daemon difficulty: " + difficulty + ", hacking level required: " + (difficulty * worldDeamonHackingSkill))



    //stats
    const stats = {
        "Hack exp": bit_node_multipliers.HackExpGain,
        "Hack": bit_node_multipliers.HackingLevelMultiplier,
        "Strength": bit_node_multipliers.StrengthLevelMultiplier,
        "Defense": bit_node_multipliers.DefenseLevelMultiplier,
        "Dexterity": bit_node_multipliers.DexterityLevelMultiplier,
        "Agility": bit_node_multipliers.AgilityLevelMultiplier,
        "Charisma": bit_node_multipliers.CharismaLevelMultiplier,
    }
    logType = info
    for (const stat in stats) {
        if (stats[stat] < 1) {
            logType = warning
            break
        }
    }
    let message = "Stats: "
    for (const stat in stats) {
        const value = stats[stat]
        if (value < 1 || value > 1) {
            if (message != "Stats: ") {
                message += ", "
            }
            message += stat + ": " + value * 100 + "%"
        }
    }
    if (logType != info) {
        log(ns, 1, logType, message)
    }



    //augments
    const augments = {
        "Rep cost": bit_node_multipliers.AugmentationRepCost,
        "Money cost": bit_node_multipliers.AugmentationMoneyCost,
        "Deadalus augment requirement": bit_node_multipliers.DaedalusAugsRequirement,
    }
    logType = info
    if (augments["Rep cost"] > 1 || augments["Money cost"] > 1) {
        logType = warning
    }
    message = "Augments: "
    for (const key in augments) {
        const value = augments[key]
        if (value < 1 || value > 1) {
            if (message != "Augments: ") {
                message += ", "
            }
            if (key == "Deadalus augment requirement") {
                message += key + ": " + value
            } else {
                message += key + ": " + value * 100 + "%"
            }
        }
    }
    log(ns, 1, logType, message)



    //bladeburner
    const bladeburner = {
        "Rank gain": bit_node_multipliers.BladeburnerRank,
        "Skill cost": bit_node_multipliers.BladeburnerSkillCost
    }
    logType = info
    if (bladeburner["Rank gain"] < 1 || bladeburner["Skill cost"] > 1) {
        logType = warning
        if (bladeburner["Rank gain"] == 0) {
            logType = error
        }
    }
    message = "Bladeburner: "
    for (const key in bladeburner) {
        const value = bladeburner[key]
        if (value < 1 || value > 1) {
            if (message != "Bladeburner: ") {
                message += ", "
            }
            message += key + ": " + value * 100 + "%"
        }
    }
    if (logType != info) {
        log(ns, 1, logType, message)
    }



    //Stanek
    const stanek = {
        "Power multiplier": bit_node_multipliers.StaneksGiftPowerMultiplier,
        "Extra size": bit_node_multipliers.StaneksGiftExtraSize,
    }
    //set base size
    let stanekBaseSize = 9 + stanek["Extra size"]
    //update stanek information
    if (reset_info.ownedSF.has(13)) {
        //each level grants a additional size
        stanekBaseSize += reset_info.ownedSF.get(13)
    }
    //from return Math.max(2, Math.min(Math.floor(this.baseSize() / 2 + 1), StanekConstants.MaxSize));
    //calculate width
    stanek_grid.width = Math.max(2, Math.min(Math.floor(stanekBaseSize / 2 + 1), 25))
    //calculate height 
    stanek_grid.height = Math.max(3, Math.min(Math.floor(stanekBaseSize / 2 + 0.6), 25))
    //check log type
    logType = info
    if (stanek["Power multiplier"] < 1 || stanek["Extra size"] < 1) {
        logType = warning
        if (stanek_grid.width <= 0 || stanek_grid.height <= 0) {
            logType = error
        }
    }
    message = "Stanek's Gift: "
    for (const key in stanek) {
        const value = stanek[key]
        if (value < 1 || value > 1 || key == "Extra size") {
            if (message != "Stanek's Gift: ") {
                message += ", "
            }
            if (key == "Extra size") {
                message += key + ": " + value
            } else {
                message += key + ": " + value * 100 + "%"
            }
        }
    }
    message += ", total width: " + stanek_grid.width + ", total height: " + stanek_grid.height
    log(ns, 1, logType, message)



    //hacking
    const hack = {
        "Money": bit_node_multipliers.ScriptHackMoney,
        "Money gain": bit_node_multipliers.ScriptHackMoneyGain,
        "Growth rate": bit_node_multipliers.ServerGrowthRate,
        "Max money": bit_node_multipliers.ServerMaxMoney,
        "Server starting money": bit_node_multipliers.ServerStartingMoney,
        "Server starting security": bit_node_multipliers.ServerStartingSecurity,
        "Weaken rate": bit_node_multipliers.ServerWeakenRate,
        "Hacking speed": bit_node_multipliers.HackingSpeedMultiplier,
    }
    logType = info
    for (const key in hack) {
        if (hack[key] < 1) {
            logType = warning
            break
        } else if (key == "Server starting security" && hack[key] > 1) {
            logType = warning
            break
        }
    }
    message = "Hacking: "
    for (const key in hack) {
        const value = hack[key]
        if (value < 1 || value > 1) {
            if (value == 0) {
                logType = error
            }
            if (message != "Hacking: ") {
                message += ", "
            }
            message += key + ": " + value * 100 + "%"
        }
    }
    if (logType != info) {
        log(ns, 1, logType, message)
    }




    //gang
    const gang = {
        "Soft cap": bit_node_multipliers.GangSoftcap,
        "Unique augments": bit_node_multipliers.GangUniqueAugs,
    }
    logType = info
    for (const key in gang) {
        if (gang[key] < 1) {
            logType = warning
            break
        }
    }
    message = "Gang: "
    for (const key in gang) {
        const value = gang[key]
        if (value < 1 || value > 1) {
            if (value == 0) {
                logType = error
            }
            if (message != "Gang: ") {
                message += ", "
            }
            message += key + ": " + value * 100 + "%"
        }
    }
    if (logType != info) {
        log(ns, 1, logType, message)
    }


    //Corporation
    const corporation = {
        "Softcap": bit_node_multipliers.CorporationSoftcap,
        "Valuation": bit_node_multipliers.CorporationValuation,
        "Divisions": bit_node_multipliers.CorporationDivisions,
    }
    logType = info
    for (const key in corporation) {
        if (corporation[key] < 1) {
            logType = warning
            if (corporation["Softcap"] < 0.15) {
                logType = error
            }
        }
    }
    message = "Corporation: "
    for (const key in corporation) {
        const value = corporation[key]
        if (value < 1 || value > 1) {
            if (message != "Corporation: ") {
                message += ", "
            }
            message += key + ": " + value * 100 + "%"
        }
    }
    if (logType != info) {
        log(ns, 1, logType, message)
    }


    //Servers
    const server = {
        "Home RAM cost": bit_node_multipliers.HomeComputerRamCost,
        "Server cost": bit_node_multipliers.PurchasedServerCost,
        "Server soft cap": bit_node_multipliers.PurchasedServerSoftcap,
        "Server limit": bit_node_multipliers.PurchasedServerLimit,
        "Server max RAM": bit_node_multipliers.PurchasedServerMaxRam,
        "Hacknet money": bit_node_multipliers.HacknetNodeMoney,
    }
    logType = info
    for (const key in server) {
        if (server["Home RAM cost"] > 1 || server["Server soft cap"] > 1 || server["Server cost"] > 1) {
            logType = warning
        } else if (server[key] < 1) {
            logType = warning
        }
    }
    message = "Server: "
    for (const key in server) {
        const value = server[key]
        if (value < 1 || value > 1) {
            if (value == 0) {
                logType = error
            }
            if (message != "Server: ") {
                message += ", "
            }
            message += key + ": " + value * 100 + "%"
        }
    }
    if (logType != info) {
        log(ns, 1, logType, message)
    }



    //Faction
    const faction = {
        "Passive rep gain": bit_node_multipliers.FactionPassiveRepGain,
        "Work exp gain": bit_node_multipliers.FactionWorkExpGain,
        "Work rep gain": bit_node_multipliers.FactionWorkRepGain,
        "Rep to donate": bit_node_multipliers.RepToDonateToFaction,
    }

    logType = info
    for (const key in faction) {
        if (faction[key] < 1) {
            logType = warning
        }
    }
    message = "Faction: "
    for (const key in faction) {
        const value = faction[key]
        if (value < 1 || value > 1) {
            if (value == 0) {
                logType = error
            }
            if (message != "Faction: ") {
                message += ", "
            }
            message += key + ": " + value * 100 + "%"
        }
    }
    if (logType != info) {
        log(ns, 1, logType, message)
    }



    //company
    const company = {
        "Work exp gain": bit_node_multipliers.CompanyWorkExpGain,
        "Work money": bit_node_multipliers.CompanyWorkMoney,
        "Work rep gain": bit_node_multipliers.CompanyWorkRepGain,
    }
    logType = info
    for (const key in company) {
        if (company[key] < 1) {
            logType = warning
        }
    }
    message = "Company: "
    for (const key in company) {
        const value = company[key]
        if (value < 1 || value > 1) {
            if (value == 0) {
                logType = error
            }
            if (message != "Company: ") {
                message += ", "
            }
            message += key + ": " + value * 100 + "%"
        }
    }
    log(ns, 1, logType, message)


    //stock
    const stock = {
        "4S Data cost": bit_node_multipliers.FourSigmaMarketDataApiCost,
        "4S api cost": bit_node_multipliers.FourSigmaMarketDataCost,
    }
    logType = info
    for (const key in stock) {
        if (stock[key] > 1) {
            logType = warning
        }
    }
    message = "Stock: "
    for (const key in stock) {
        const value = stock[key]
        if (value < 1 || value > 1) {
            if (value == 0) {
                logType = error
            }
            if (message != "Stock: ") {
                message += ", "
            }
            message += key + ": " + value * 100 + "%"
        }
    }
    if (message != "Stock: ") {
        log(ns, 1, logType, message)
    }


    //Crime
    const crime = {
        "Exp gain": bit_node_multipliers.CrimeExpGain,
        "Money": bit_node_multipliers.CrimeMoney,
        "Success rate": bit_node_multipliers.CrimeSuccessRate,
    }
    logType = info
    for (const key in crime) {
        if (crime[key] < 1) {
            logType = warning
        }
    }
    message = "Crime: "
    for (const key in crime) {
        const value = crime[key]
        if (value < 1 || value > 1) {
            if (value == 0) {
                logType = error
            }
            if (message != "Crime: ") {
                message += ", "
            }
            message += key + ": " + value * 100 + "%"
        }
    }
    log(ns, 1, logType, message)


    //Go
    const go = {
        "Power": bit_node_multipliers.GoPower,
    }
    if (go["Power"] < 1) {
        log(ns, 1, warning, "Go: " + "Power: " + go["Power"])
    }

    log(ns, 1, info, "------------------------------------")
    message = "Owned Augments: "
    for (let augment of reset_info.ownedAugs.keys()) {
        if (message != "Owned Augments: ") {
            message += ", "
        }
        message += augment
    }
    log(ns, 1, info, message)

    /*  Ignored:
    ManualHackMoney
    ClassGymExpGain
    InfiltrationMoney
    InfiltrationRep
    CodingContractMoney 1
    */
}



/**
 * Function that will output challenge in a formatted way
 */
function log_challenge_information(ns, challenge_flags) {    
    //for each challenge
    for (challenge in challenge_flags) {
        //if challenge is active
        if(challenge_flags[challenge]) {
            //log challenge information
            log(ns, 1, warning, "Challenge parameter: '" + challenge + "' is active (and thus limited / disabled)")
        }
    }
}



/**
 * Function to do a check for bladeburner access 
 */
function get_bladeburner_access(ns) {
    //if performing the challenge
    if(challenge_flags.disable_bladeburner == true {
        //no access
        return false
        
    } else {
        return ns.bladeburner.joinBladeburnerDivision()
    }
}


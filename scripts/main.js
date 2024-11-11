/**
 * TODO LIST:
 * manageScripts: indicate and handle hack manager scaling up and scaling down, fill scripts
 * manageStanek: to test
 * reactive sleeves in actions and in purchase augments and update ui
 */
//log constants
const info = "INFO"
const success = "SUCCESS"
const warning = "WARNING"
const error = "ERROR"
const fail = "FAIL"


//target karma for gang
const gangKarma = -54000
//target kills for factions
const killsFactions = 30

const statMinHacking = 25//50 //?

//constants used for challenges, true = trying challenge, disabled feature 
//TODO: attach limit_home_server, disable_gang, disable_corporation
const challenge_flags = {
    limit_home_server: false, //limits the home server to 128GB and 1 core (challenge bitnode 1)
    disable_bladeburner: true, //disables bladeburner (challenge bitnode 6 and 7)
    disable_gang: false, //disables gang (challenge bitnode x)
    disable_corporation: false, //disables corporation (challenge bitnode x)
}

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
    

    
    //set time to wait after each main loop
    const sleepTime = 1 * 1000
    //minimum amount of augments before resetting
    const minAugs = 4
    //get reset info
    const resetInfo = ns.getResetInfo()
    //get bitnode information from file
    const bitNodeMultipliers = JSON.parse(ns.read("bitNode/" + ns.getResetInfo().currentNode + ".json"))
    //number of sleeves available
    const numSleeves = 8
    
    //stanek information
    let stanekInfo = { width: 0, height: 0 }
    //keep track of launched scripts
    let launchedScripts = []


    //initialize
    init(ns, bitNodeMultipliers, stanekInfo) //1,5 GB

    //restart work (to ensure it is set to non-focussed in case of restarting the game)
    restart_player_activity(ns)
    
    //wait a bit
    await ns.sleep(sleepTime)
    
    //main loop
    while (true) {
        //main script: 3,1 GB  
        //init: 1,5 GB

        //factions & companies: 13 GB
        manageFactions(ns)  //10 GB
        manageCompanies(ns) //3 GB

        //servers & scripts: 18,5 GB
        manageServers(ns)   //10 GB
        manageHacking(ns)   //4,3 GB
        manageScripts(ns, launchedScripts, bitNodeMultipliers)  //4,2 GB

        //player, sleeve & bladeburner: 71 GB
        manageActions(ns, numSleeves, bitNodeMultipliers)   //71 GB

        //update ui
        updateUI(ns, numSleeves, bitNodeMultipliers) //0 GB

        //reset & destruction: 18 GB
        manageDestruction(ns)   //0 GB
        manageReset(ns, minAugs)    //0 GB
        manageAugments(ns, numSleeves)  //18 GB

        //wait a bit
        await ns.sleep(sleepTime)
    }
    //123,6 GB RAM used of 128 GB, 4,4 GB left
}




/**
 * Function that tries to unlock exploits
 * https://github.com/bitburner-official/bitburner-src/blob/dev/src/NetscriptFunctions/Extra.ts
 * @param {NS} ns
 * 
 * Cost: 0?
 *  functions are undoucmented?
 */
function exploits(ns) {
    //for achievement
    ns.exploit()
    //TODO: check on how to bypass
    ns.bypass(true)
    //alterReality?
    ns.alterReality()
    //rainbow, needs to be decrypted by bcrypt?
    ns.rainbow("guess")
}



/**
 * Function that initializes some things
 * @param {NS} ns
 * 
 * Costs: 1,5 GB
 *  killAll (0,5)
 *  getResetInfo (1)
 *  read (0)
 */
function init(ns, bitNodeMultipliers, stanekInfo) {

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
    for (let server of getServers(ns)) {
        //check if it is home
        let isServerHome = (server == enum_servers.home)
        //kill all scripts
        ns.killall(server, isServerHome)
    }

    //get reset info
    const resetInfo = ns.getResetInfo()

    //log information
    logBitnodeInformation(ns, bitNodeMultipliers, resetInfo, stanekInfo)

    //signal hackManager to stop
    overWritePort(ns, enum_port.stopHack, enum_hackingCommands.stop)

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
function getInstalledAugmentations(ns) {
    //owned augments
    const ownedAugs = ns.getResetInfo().ownedAugs
    //create return value
    let array = []
    //for each augment
    for (let key of ownedAugs) {
        //use only the name
        array.push(key[0])
    }
    //return the list
    return array
}



/**
 * Function that gets the number of installed augments, using the UI
 */
function getNumberToBeInstalledAugments() {
    //value to return
    let installedAugs = 0

    //get all svg
    const elements = eval('document').getElementsByTagName("svg")
    //for each SVG
    for (let element of elements) {
        //if it is the target
        if (element.ariaLabel == "Augmentations") {
            //get the parent, then the last child, then the value of the child
            const value = element.parentElement.lastElementChild.innerHTML
            //check if it is set
            if (value.length > 0) {
                //use this value
                installedAugs = value
            }
            //stop looking 
            break
        }
    }
    //return the value
    return installedAugs
}



/**
 * Function that checks if we can destroy the bitnode, always travels to BN 12 (because it is endless)
 * Cost: none
 * TODO: launch script for bitnode destruction
 */
function manageDestruction(ns) {
    //set a flag for desctruction
    let flagDestruction = false

    //if the red pill is installed
    if (getInstalledAugmentations(ns).indexOf(enum_augments.theRedPill) > -1) {
        //then we can check the world daemon backdoor (otherwise the server doesn't exist)
        if (ns.getServer(enum_servers.worldDaemon).backdoorInstalled) {
            //backdoor is installed, proceed with destruction
            flagDestruction = true
        }
    }

    //bladeburner is possible
    if (get_bladeburner_access(ns)) {
        //if operation Daedalus has been completed, do we need to check rank as well?
        if (ns.bladeburner.getActionCountRemaining(enum_bladeburnerActions.type.blackOps, enum_bladeburnerActions.blackOps.operationDaedalus.name) == 0) {
            //proceed with destruction
            flagDestruction = true
        }
    }

    //if destruction is possible
    if (flagDestruction) {
        //always travel to bitNode 12
        const bitNodeTarget = 12
        //TODO: launch script that handles bitnode destruction
        //kill all other scripts on home
        ns.killall()
        //launch script to destroy bitnode
        ns.exec(enum_scripts.jump, enum_servers.home, 1,
            enum_scripts.destroyBitNode, true, //which script to launch, kill other scripts
            enum_scripts.main, bitNodeTarget) //arguments
    }
}



/**
 * Function that checks if we should reset
 * Cost: none
 * TODO: attach script for external reset
 */
function manageReset(ns, minAugs) {
    //get number of bought augments
    const augmentsBoughts = getNumberToBeInstalledAugments()

    //if enough augments bought for a reset
    if (augmentsBoughts >= minAugs) {
        //read the port if we need to wait
        const reasonWait = ns.peek(enum_port.reset)
        //check if it is set
        if (reasonWait == portNoData) {
            //for every joined faction
            for (let faction of ns.getPlayer().factions) {
                //buy as much neuro as possible
                while (ns.singularity.purchaseAugmentation(faction, enum_augments.neuroFluxGovernor)) { /* Do nothing */ }
            }
            //set installed to 0
            //augmentsBought = 0
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
function manageAugments(ns, numSleeves) {
    //if gang is busy with growing (and thus blocking resets)
    if (ns.peek(enum_port.reset) == "gang") {
        //do not buy augments
        return
    }
    //get owned augments (to include bought?)
    let augmentsOwned = getInstalledAugmentations(ns)
    //for every joined faction
    for (let faction of ns.getPlayer().factions) {
        //for each augment of the faction
        for (let augment of ns.singularity.getAugmentationsFromFaction(faction)) {
            //if not owned
            if (augmentsOwned.indexOf(augment) == -1) {
                //try to buy
                ns.singularity.purchaseAugmentation(faction, augment)
            }
        }
    }
    
    //for each sleeve
    for (let index = 0; index < numSleeves; index++) {
        //for each sleeve augment
        //TODO: possible to hardcode the augment list?
        for (let augment of ns.sleeve.getSleevePurchasableAugs(index)) {
            try {
                //buy augment
                ns.sleeve.purchaseSleeveAug(index, augment.name)
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
function manageFactions(ns) {
    //get the player
    let player = ns.getPlayer()
    //get the player factions
    let factions = player.factions

    //get the owned augments (not bought)
    let augmentsOwned = getInstalledAugmentations(ns)//ns.singularity.getOwnedAugmentations(false)

    //check for multual exlusive factions
    const cityGroup1 = [enum_cities.sector12, enum_cities.aevum]
    const joinGroup1 = (augmentsOwned.indexOf("CashRoot") == -1) || (augmentsOwned.indexOf("PCMatrix") == -1)
    const cityGroup2 = [enum_cities.chongqing, enum_cities.newTokyo, enum_cities.ishima]
    const joinGroup2 = (augmentsOwned.indexOf("Neuregen") == -1) || (augmentsOwned.indexOf("NutriGen") == -1) || (augmentsOwned.indexOf("INFRARet") == -1)
    const cityGroup3 = [enum_cities.volhaven]
    const joinGroup3 = (augmentsOwned.indexOf("DermaForce") == -1)

    //create a location
    let cityTarget = ""
    //check if we need to travel
    if (joinGroup1) {
        //if sector 12 is not joined
        if (factions.indexOf(enum_factions.sector12.name) == -1) {
            //travel to sector 12
            cityTarget = enum_cities.sector12
            //if aevum is not joined
        } else if (factions.indexOf(enum_factions.aevum.name) == -1) {
            //travel to aevum
            cityTarget = enum_cities.aevum
        }

    } else if (joinGroup2) {
        //if chongqing is not joined
        if (factions.indexOf(enum_factions.chongqing.name) == -1) {
            //travel to chongqing
            cityTarget = enum_cities.chongqing
            //if New tokyo is not joined
        } else if (factions.indexOf(enum_factions.newTokyo.name) == -1) {
            //travel to aevum
            cityTarget = enum_cities.newTokyo
            //if Ishima is not joined    
        } else if (factions.indexOf(enum_factions.ishima.name) == -1) {
            //travel to aevum
            cityTarget = enum_cities.ishima
        }

    } else if (joinGroup3) {
        //if Volhaven is not joined
        if (factions.indexOf(enum_factions.volhaven.name) == -1) {
            //travel to Volhaven
            cityTarget = enum_cities.volhaven
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
    if (cityTarget == "") {

        //if Tian Di Hui not joined
        if ((factions.indexOf(enum_factions.tianDiHui.name) == -1) && (stats.hacking >= 50)) {
            //travel to chongqing
            cityTarget = enum_cities.chongqing //either Chongqing, New Tokyo, Ishima --> dark army only allows Chongqing

            //if Tetrads not joined
        } else if ((factions.indexOf(enum_factions.tetrads.name) == -1) && (stats.combat >= 75) && (stats.karma <= -18)) {
            //travel to chongqing
            cityTarget = enum_cities.chongqing //either Chongqing, New Tokyo, Ishima --> dark army only allows Chongqing

            //if The Syndicate not joined
        } else if ((factions.indexOf(enum_factions.theSyndicate.name) == -1) && (stats.hacking >= 200) && (stats.combat >= 200) && (stats.karma <= -90)) {
            //travel to sector 12
            cityTarget = enum_cities.sector12 //either Aevum, Sector-12 --> sector 12 is the default
        }

        //if The Dark Army not joined
    } else if ((factions.indexOf(enum_factions.theDarkArmy.name) == -1) && (stats.hacking >= 300) && (stats.combat >= 300) && (stats.karma <= -45) && (stats.kills >= 5)) {
        //travel to chongqing
        cityTarget = enum_cities.chongqing //only Chongqing
    }

    //check if we need to travel
    if ((cityTarget != "") && (player.city != cityTarget)) {
        //travel to city
        ns.singularity.travelToCity(cityTarget)
    }

    //for EVERY faction
    for (let factionEntry in enum_factions) {
        //get faction name
        const faction = enum_factions[factionEntry].name

        //if the faction is allowed (need to join group x and faction is not in group y or group z)
        if (((joinGroup1) && (cityGroup2.indexOf(faction) == -1) && (cityGroup3.indexOf(faction) == -1)) ||
            ((joinGroup2) && (cityGroup1.indexOf(faction) == -1) && (cityGroup3.indexOf(faction) == -1)) ||
            ((joinGroup3) && (cityGroup1.indexOf(faction) == -1) && (cityGroup2.indexOf(faction) == -1)) ||
            //or if no MUX groups need joining
            (!joinGroup1 && !joinGroup2 && !joinGroup3)) {
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
function manageCompanies(ns) {
    //for each company
    for (let company in enum_companyFactions) {
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
function manageServers(ns) {
    //description of netburner requirements 
    const factionNetburnersRequirments = {
        levels: 100,
        ram: 8,
        cores: 4,
    }

    //try to upgrade home RAM first
    ns.singularity.upgradeHomeRam()

    //for each buyable server possible
    for (let index = ns.hacknet.numNodes(); index < ns.hacknet.maxNumNodes(); index++) {
        //buy server
        ns.hacknet.purchaseNode()
    }

    //for each owned server
    for (let index = 0; index < ns.hacknet.numNodes(); index++) {
        //upgrade ram
        ns.hacknet.upgradeRam(index)

        //get the stats of the network (which are important to check)      
        let netStats = { level: 0, cores: 0, }
        //for each owned node
        for (let index2 = 0; index2 < ns.hacknet.numNodes(); index2++) {
            //get the stats
            let nodeStats = ns.hacknet.getNodeStats(index2)
            //add the level
            netStats.level += nodeStats.level
            //add the cores
            netStats.cores += nodeStats.cores
        }

        //only conditionally level the cores
        if (netStats.cores < factionNetburnersRequirments.cores) {
            //upgrade cores
            ns.hacknet.upgradeCore(index)
        }

        //only conditionally level the cores
        if (netStats.level < factionNetburnersRequirments.levels) {
            //upgrade level
            ns.hacknet.upgradeLevel(index)
        }
    }

    //upgrade home cores
    ns.singularity.upgradeHomeCores()

    //manage hashes
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

    //just spend hashes on money
    ns.hacknet.spendHashes(enum_hashUpgrades.money)
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
function manageHacking(ns) {
    //get player hacking stat
    let hacking = ns.getPlayer().skills.hacking

    //try to purchase TOR (returns true if we already have it)
    if (ns.singularity.purchaseTor()) {
        //buy the tools by only checking if it is usefull to do so
        if (hacking >= 50) {
            ns.singularity.purchaseProgram(enum_hackTools.bruteSSH)
        }
        if (hacking >= 100) {
            ns.singularity.purchaseProgram(enum_hackTools.fTPCrack)
        }
        if (hacking >= 300) {
            ns.singularity.purchaseProgram(enum_hackTools.relaySMTP)
        }
        if (hacking >= 400) {
            ns.singularity.purchaseProgram(enum_hackTools.hTTPWorm)
        }
        if (hacking >= 725) {
            ns.singularity.purchaseProgram(enum_hackTools.sQLInject)
        }
    }

    //get all servers
    for (let server of getServers(ns)) {
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
 *  getScriptRam (0,1)
 *  scan (0.2) (inherited from getServerSpecific)
 *  scp (0.6)
 *  exec (1.3)
 *  getServer (2)
 */
function manageScripts(ns, launchedScripts, bitNodeMultipliers) {
    //money that is needed for corporation
    const corporationMoneyRequirement = 150e9

    const player = ns.getPlayer()
    //list that keeps track if which scripts to launch
    let scriptsToLaunch = []
    //get money
    let moneyOwned = ns.getServer(enum_servers.home).moneyAvailable

    //check which scripts we need to launch

    //launch script
    scriptsToLaunch.push(enum_scripts.backdoor)
    //hackmanager is always wanted?
    scriptsToLaunch.push(enum_scripts.hack)

    //check if makes sense to launch gang manager
    if ((bitNodeMultipliers.GangSoftcap > 0) &&
        (player.karma < gangKarma)) {
        //add to list
        scriptsToLaunch.push(enum_scripts.gang)
    }

    //check if makes sense to launch corporation manager
    if ((bitNodeMultipliers.CorporationSoftcap >= 0.15) &&
        (moneyOwned > corporationMoneyRequirement)) {
        //add to list
        scriptsToLaunch.push(enum_scripts.corporation)
    }

    //check if makes sense to launch stock manager
    const stockCost4SApiCost = bitNodeMultipliers.FourSigmaMarketDataApiCost * 25e9 //24.000.000.000 = 25b
    const stockCost4SMarketData = bitNodeMultipliers.FourSigmaMarketDataCost * 1e9  //1.000.000.000 = 1b
    //calculate money needed for stock manager
    if (moneyOwned > (stockCost4SApiCost + stockCost4SMarketData)) { //26b
        //add to list
        scriptsToLaunch.push(enum_scripts.stock)
    }

    //if there are scripts to launch
    if (scriptsToLaunch.length > 0) {
        //TODO: how to handle the scaling down of the hack manager?
        //use ports to indicate pause, then keep reading until message is changed

        //for each script to launch
        for (let script of scriptsToLaunch) {
            //if not already launched
            if (launchedScripts.indexOf(script) == -1) {
                //signal hackManager to stop
                overWritePort(ns, enum_port.stopHack, enum_hackingCommands.stop)
                //get all servers that can run scripts
                let serversExecute = getServerSpecific(ns, true)
                //get script ram 
                let scriptRam = ns.getScriptRam(script)
                //for each server
                for (let server of serversExecute) {
                    //calculate available ram
                    const ramAvailable = server.maxRam - server.ramUsed
                    //if enough ram
                    if (ramAvailable >= scriptRam) {
                        //copy the script
                        if (ns.scp(script, enum_servers.home, server.hostname)) {
                            //execute the script
                            if (ns.exec(script, server.hostname)) {
                                //log information
                                log(ns, 1, success, "Launched '" + script + "'")
                                //add script to list of launched scripts
                                launchedScripts.push(script)
                            }
                        }
                    }
                }
            }
        }
        //indicate to hack manager that it can resume
        overWritePort(ns, enum_port.stopHack, enum_hackingCommands.start)
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
    const playerActivity = getActivity(ns)
    //set the default focus for actions (always false)
    const actionFocus = false
    //check if we joined bladeburner (default is false
    const joinedBladeburner = get_bladeburner_access(ns) 

    //if not enough hacking skill
    if (ns.getPlayer().skills.hacking < statMinHacking) {
        //get best crime for hacking
        const bestCrime = ns.enums.CrimeType.robStore//getBestCrime(ns, bitNodeMultipliers, player, enum_crimeFocus.hacking)
        //commit crime for karma
        if (!ns.singularity.commitCrime(bestCrime, actionFocus)) {
            log(ns, 1, warning, "manageActions failed 1. singularity.commitCrime(" + bestCrime + ", " + actionFocus + ")")
        }
        
        //if we have not reached target karma
    } else if (player.karma > gangKarma) {
        //get best crime for karma
        const bestCrime = ns.enums.CrimeType.mug//getBestCrime(ns, bitNodeMultipliers, player, enum_crimeFocus.karma)
        //commit crime for karma
        if (!ns.singularity.commitCrime(bestCrime, actionFocus)) {
            log(ns, 1, warning, "manageActions failed 2. singularity.commitCrime(" + bestCrime + ", " + actionFocus + ")")
        }
        
    } else {
        //if bladeburner joined: work for bladeburner
        if (joinedBladeburner) {
            //check what ae are doing for bladeburner
            const bladeburnerActionCurrent = getActivityBladeburner(ns)
            //do bladeburner stuff
            const bladeburnerActionWanted = determineBladeburnerAction(ns, player)
            //start bladeburner action
            if (!ns.bladeburner.startAction(bladeburnerActionWanted.type, bladeburnerActionWanted.name)) {
                log(ns, 1, warning, "manageActions failed bladeburner.startAction(" + bladeburnerActionWanted.type + ", " + bladeburnerActionWanted.name + ")")
            }
        }

        //check if we can do both bladeburner and normal work
        const actionDual = (getInstalledAugmentations(ns).indexOf(enum_augments.bladesSimulacrum) > -1)

        //if bladeburner is not joined or augment for dual work is installed
        if ((!joinedBladeburner) || (actionDual)) {
            //get best crime for combat skills
            const bestCrime = ns.enums.CrimeType.grandTheftAuto//getBestCrime(ns, bitNodeMultipliers, player, enum_crimeFocus.skills)
            //commit crime for money/stats?
            if (ns.singularity.commitCrime(bestCrime, actionFocus)) {
                log(ns, 1, warning, "manageActions failed 3. singularity.commitCrime(" + bestCrime + ", " + actionFocus + ")")
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
 *          getActivity (0,5)
 * 
 *  Bladeburner: 37 GB
 *      joinBladeburnerDivision(4)
 *      startAction (4)
 *      Inherited: 29 GB
 *          getActivityBladeburner (1)
 *          determineBladeburnerAction (28)
 * 
 *  Sleeve: 28 GB
 *      setToCommitCrime (4)
 *      setToFactionWork (4)
 *      setToCompanyWork (4)
 *      setToBladeburnerAction (4)
 *      getSleeve (4)
 *      setToShockRecovery (4)
 *      Inherited: 4 GB
 *          getActivity (4)       
 */
function manageActions(ns, numSleeves, bitNodeMultipliers) {
    //get player
    const player = ns.getPlayer()
    //get player activity
    const playerActivity = getActivity(ns)
    //set the default focus for actions (always false)
    const actionFocus = false
    //check if we joined bladeburner (default is false
    const joinedBladeburner = get_bladeburner_access(ns) 

    //if not enough hacking skill
    if (ns.getPlayer().skills.hacking < statMinHacking) {
        //get best crime for hacking
        const bestCrime = ns.enums.CrimeType.robStore//getBestCrime(ns, bitNodeMultipliers, player, enum_crimeFocus.hacking)
        //if not performing the correct crime
        if (playerActivity.value != bestCrime) {
            //commit crime for karma
            if (!ns.singularity.commitCrime(bestCrime, actionFocus)) {
                log(ns, 1, warning, "manageActions failed 1. singularity.commitCrime(" + bestCrime + ", " + actionFocus + ")")
            }
        }
        //if we have not reached target karma
    } else if (player.karma > gangKarma) {
        //get best crime for karma
        const bestCrime = ns.enums.CrimeType.mug//getBestCrime(ns, bitNodeMultipliers, player, enum_crimeFocus.karma)
        //if not performing the correct crime
        if (playerActivity.value != bestCrime) {
            //commit crime for karma
            if (!ns.singularity.commitCrime(bestCrime, actionFocus)) {
                log(ns, 1, warning, "manageActions failed 2. singularity.commitCrime(" + bestCrime + ", " + actionFocus + ")")
            }
        }

    } else {
        //if bladeburner joined: work for bladeburner
        if (joinedBladeburner) {
            //check what ae are doing for bladeburner
            const bladeburnerActionCurrent = getActivityBladeburner(ns)
            //do bladeburner stuff
            const bladeburnerActionWanted = determineBladeburnerAction(ns, player)
            //log(ns, 1, info, "determineBladeburnerAction: " + JSON.stringify(bladeburnerActionWanted))
            //if not the same (type and value is not the same)
            if (bladeburnerActionCurrent.value != bladeburnerActionWanted.name) {
                //start bladeburner action
                if (!ns.bladeburner.startAction(bladeburnerActionWanted.type, bladeburnerActionWanted.name)) {
                    log(ns, 1, warning, "manageActions failed bladeburner.startAction(" + bladeburnerActionWanted.type + ", " + bladeburnerActionWanted.name + ")")
                }
            }
        }

        //check if we can do both bladeburner and normal work
        const actionDual = (getInstalledAugmentations(ns).indexOf(enum_augments.bladesSimulacrum) > -1)

        //if bladeburner is not joined or augment for dual work is installed
        if ((!joinedBladeburner) || (actionDual)) {
            //get best crime for combat skills
            const bestCrime = ns.enums.CrimeType.grandTheftAuto//getBestCrime(ns, bitNodeMultipliers, player, enum_crimeFocus.skills)
            //if not performing the correct crime
            if (playerActivity.value != bestCrime) {
                //commit crime for money/stats?
                if (ns.singularity.commitCrime(bestCrime, actionFocus)) {
                    log(ns, 1, warning, "manageActions failed 3. singularity.commitCrime(" + bestCrime + ", " + actionFocus + ")")
                }
            }
        }
    }

    //sleeve actions
    //shock value that is wanted (96%)
    const shockMax = 0.96
    //get all max shock value
    let sleeveShockValues = []

    //for each sleeve
    for (let index = 0; index < numSleeves; index++) {
        //get shock value
        const shock = ns.sleeve.getSleeve(index).shock
        //add the shock to the list
        sleeveShockValues.push(shock)
    }

    //if there is a sleeve with too much shock
    if (Math.max(sleeveShockValues) > shockMax) {
        //for each sleeve
        for (let index = 0; index < numSleeves; index++) {
            //if not doing the correct work
            if (getActivity(ns, index).type != enum_activities.recovery) {
                //perform recovery
                ns.sleeve.setToShockRecovery(index)
            }
        }

        //if we have not reached target karma
    } else if (player.karma > gangKarma) {
        //for each sleeve
        for (let index = 0; index < numSleeves; index++) {
            //get best crime for karma
            let bestCrime = ns.enums.CrimeType.mug//getBestCrime(ns, bitNodeMultipliers, player, enum_crimeFocus.karma)
            //if not doing the correct work
            if (getActivity(ns, index).value != bestCrime) {
                //perform crime for karma
                ns.sleeve.setToCommitCrime(index, bestCrime)
            }
        }

        //not reached target kills
    } else if (player.numPeopleKilled < killsFactions) {
        //for each sleeve
        for (let index = 0; index < numSleeves; index++) {
            //get best crime for kills
            let bestCrime = ns.enums.CrimeType.homicide//getBestCrime(ns, bitNodeMultipliers, player, enum_crimeFocus.kills)
            //if not performing the correct work
            if (getActivity(ns, index).value != bestCrime) {
                //perform crime
                ns.sleeve.setToCommitCrime(index, bestCrime)
            }
        }

        //sleeves to be divided over work
    } else {
        //keep track of sleeve actions
        let sleeveActions = {}

        //factions
        //get available factions
        for (const faction of player.factions) {
            //get work types
            const workTypes = getFactionWorkTypes(faction)
            //if the faction has worktypes
            if (workTypes.length > 0) {
                //log(ns,1,info,"Faction has " + ns.singularity.getAugmentationsFromFaction(faction).length + " augments")
                //if there are still augments available
                if (shouldWorkForFaction(ns, faction)) {
                    //set a flag to check
                    let flagAlreadyWorkingFaction = false
                    //check other sleeves
                    for (let index = 0; index < numSleeves; index++) {
                        //get activity
                        const activity = getActivity(ns, index)
                        //if a sleeve is already working for this faction
                        if ((activity.type == enum_activities.faction) &&
                            (activity.value == faction)) {
                            //assign this job to the sleeve
                            sleeveActions[index] = activity
                            //set flag to indicate someone is already working on this
                            flagAlreadyWorkingFaction = true
                            //stop searching
                            break
                        }
                    }
                    //if flag is not set
                    if (!flagAlreadyWorkingFaction) {
                        //check each sleeve
                        for (let index = 0; index < numSleeves; index++) {
                            //check if the sleeve is not assigned
                            if (!Object.hasOwn(sleeveActions, index)) {
                                //get best faction work
                                let bestFactionWork = determineBestFactionWork(ns.sleeve.getSleeve(index), workTypes)
                                try {
                                    //work for this faction
                                    if (ns.sleeve.setToFactionWork(index, faction, bestFactionWork)) {
                                        //save information
                                        sleeveActions[index] = { type: enum_activities.faction, value: faction }
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
            let companyFaction = enum_companyFactions[company]
            //if not joined
            if (player.factions.indexOf(companyFaction) == -1) {
                //check if other sleeves are working for the company
                //set a flag to check
                let flagAlreadyWorkingCompany = false
                //check other sleeves
                for (let index = 0; index < numSleeves; index++) {
                    //get activity
                    let activity = getActivity(ns, index)
                    //if a sleeve is already working for this company
                    if ((activity.type == enum_activities.company) &&
                        (activity.value == company)) {
                        //assign this job to the sleeve
                        sleeveActions[index] = activity
                        //set flag to indicate someone is already working on this
                        flagAlreadyWorkingCompany = true
                        //stop searching
                        break
                    }
                }
                //if flag is not set
                if (!flagAlreadyWorkingCompany) {
                    //check each sleeve
                    for (let index = 0; index < numSleeves; index++) {
                        //check if the sleeve is not assigned
                        if (!Object.hasOwn(sleeveActions, index)) {
                            try {
                                //work for company
                                ns.sleeve.setToCompanyWork(index, company)
                                //save information
                                sleeveActions[index] = { type: enum_activities.company, value: company }

                            } catch (error) {
                                log(ns, 1, error, "setToCompanyWork " + company + ": " + error)
                            }
                        }
                    }
                }
            }
        }

        //check each sleeve
        for (let index = 0; index < numSleeves; index++) {
            //check if the sleeve is not assigned
            if (!Object.hasOwn(sleeveActions, index)) {
                //get best crime for skills
                let bestCrime = ns.enums.CrimeType.grandTheftAuto//getBestCrime(ns, bitNodeMultipliers, ns.sleeve.getSleeve(index), enum_crimeFocus.skills)
                //if not working on the desired crime
                if (getActivity(ns, index).value != bestCrime) {
                    //assign to crime
                    ns.sleeve.setToCommitCrime(index, bestCrime)
                }
                //save information
                sleeveActions[index] = { type: enum_activities.crime, value: bestCrime }
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
function getBladeburnerActionForSleeve(ns, sleeveIndex) {
    //set min chance = 100%
    const chanceMin = 1


    const enum_sleeveBladeburnerActions = {
        fieldAnalysis: "Field Analysis",
        infiltratesynthoids: "Infiltrate synthoids",
    }

    //keep track of action count
    let totalActionCount = 0

    //contracts
    //for each contract
    for (const op in enum_bladeburnerActions.contracts) {
        //get contract information
        const contract = enum_bladeburnerActions.contracts[op]
        //get action count
        const actionCount = ns.bladeburner.getActionCountRemaining(enum_bladeburnerActions.type.contracts, contract)
        //get chance
        const chance = ns.bladeburner.getActionEstimatedSuccessChance(enum_bladeburnerActions.type.contracts, contract, sleeveIndex)
        //if this action can be performed and we have enough chance
        if ((actionCount > 0) && (chance[0] >= chanceMin)) {
            //return this information
            return { type: enum_sleeveBladeburnerActions.takeonContracts, name: contract }
        }
        //add count to total actions available
        totalActionCount += actionCount
    }

    //if no operations or contracts available
    if (totalActionCount == 0) {
        //set to create contracts
        return { type: enum_bladeburnerActions.type.general, name: enum_bladeburnerActions.general.inciteViolence }
    }

    //failsafe: just train
    return { type: enum_bladeburnerActions.type.general, name: enum_bladeburnerActions.general.training }
}



/**
 * Function that calculates the best crime for the given focus
 * https://github.com/bitburner-official/bitburner-src/blob/dev/src/Crime/Crime.ts
 * https://github.com/bitburner-official/bitburner-src/blob/dev/src/Constants.ts
 * @param {NS} ns
 */
function getBestCrime(ns, bitNodeMultipliers, person, focus) {

    switch (focus) {
        default:
        case "karma": return ns.enums.CrimeType.mug
        case "kills": return ns.enums.CrimeType.homicide
        case "skills": return ns.enums.CrimeType.grandTheftAuto //TODO FIX? 
        case "hacking": return ns.enums.CrimeType.robStore
    }

    //log(ns,1,info,bitNodeMultipliers + ", " + person + ", " + focus)
    //constants
    const intelligenceCrimeWeight = 0.025
    const maxSkillLevel = 975
    const minChance = 0.75

    //keep track of values
    let best = {
        karma: { name: "Shoplift", value: 0 }, //lower is better
        kills: { name: "Shoplift", value: 0 },
        skills: { name: "Shoplift", value: 0 },
    }

    //for each crime
    for (let crimeEntry in enum_crimes) {
        //get the data
        const crimeData = enum_crimes[crimeEntry]


        //calculate the chance
        let chance = 0
        //for every skill weight
        for (let skill in crimeData.weight) {
            //add calculation for the skill
            chance += crimeData.weight[skill] * person.skills[skill]
        }
        chance += intelligenceCrimeWeight * person.skills.intelligence
        chance /= maxSkillLevel
        chance /= crimeData.difficulty
        chance *= person.mults.crime_success
        chance *= bitNodeMultipliers.CrimeSuccessRate
        chance *= calculateIntelligenceBonus(person.skills.intelligence, 1)
        //cap chance to 100%
        chance = Math.min(chance, 1)
        //chance = ns.get
        //log(ns,1,info,"crimeData: " + crimeData.type + ", chance:" + chance + ", actual chance:" + ns.singularity.getCrimeChance(crimeData.type))
        //chance = ns.singularity.getCrimeChance(crimeData.type)
        //log(ns,1,info," chance)
        //if (chance >= minChance) {
        //create multiplier to apply to each type
        const multiplier = chance / crimeData.time

        //calculate for each type      
        const karma = crimeData.karma * multiplier
        const kills = crimeData.kills * multiplier



        //calculate all exp
        let skills = 0
        //for each exp
        for (let skill in crimeData.exp) {
            //add the skill to the toal
            skills += crimeData.exp[skill]
        }
        //add multuplier
        skills *= multiplier

        //check if karma is lower
        if (karma > best.karma.value) {

            //save name
            best.karma.name = crimeData.type
            //save value
            best.karma.value = karma
        }
        //check if kills is higher
        if (kills > best.kills.value) {
            //save name
            best.kills.name = crimeData.type
            //save value
            best.kills.value = kills
        }
        //check if skills is higher
        if (skills > best.skills.value) {
            //save name
            best.skills.name = crimeData.type
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
function calculateIntelligenceBonus(intelligence, weight = 1) {
    return 1 + (weight * Math.pow(intelligence, 0.8)) / 600
}



/**
 * Function that returns an array of available work types
 * Sadly, no easy way to directly link with using destroying the option to easily link
 */
function getFactionWorkTypes(faction) {
    //for each faction
    for (const factionEntry in enum_factions) {
        //get the faction data
        const data = enum_factions[factionEntry]
        //if the names match
        if (data.name == faction) {
            //if it has worktypes
            if (Object.hasOwn(data, "workTypes")) {
                //return the work types
                return data.workTypes
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
 *  getActionCountRemaining (4)
 *  getActionEstimatedSuccessChance (4)
 */
function determineBladeburnerAction(ns) {
    //target min chance before attempting bladeburner
    const chanceMin = 1
    const chanceMinBO = 0.5

    //upgrade skills
    //for each bladeburner skill
    for (const skill in enum_bladeburnerSkills) {
        //upgrade skill without checking details (money, level cap)
        ns.bladeburner.upgradeSkill(enum_bladeburnerSkills[skill])
    }

    //go to lowest chaos city (lower chaos = higher success chances)
    //keep track of previous chaos
    let lowestChaos = 999999
    //check the lowest chaos city
    for (const cityEntry in enum_cities) {
        //get city
        const city = enum_cities[cityEntry]
        //get chaos of current city
        const cityChaos = ns.bladeburner.getCityChaos(city)
        //we also need to check if there are any synthoids, otherwise all operations and contracts have a 0% success chance 
        //and actions will default to Field analysis, which will do nothing...
        //if lower than previous and there is synthoids in the city
        if (cityChaos < lowestChaos && ns.bladeburner.getCityEstimatedPopulation(city) > 0) {
            //switch city
            ns.bladeburner.switchCity(city)
            //update lowest chaos
            lowestChaos = cityChaos
        }
    }

    //keep track of action count
    let totalActionCount = -1
    //get stamina
    const stamina = ns.bladeburner.getStamina()
    //if current stamina is higher than half max stamina (no penalties)
    if (stamina[0] > (stamina[1] / 2)) {
        //set to 0. then it will be checked
        totalActionCount = 0
        //blackops
        //get current rank
        const rank = ns.bladeburner.getRank()
        //for each black operation
        for (const op in enum_bladeburnerActions.blackOps) {
            //get blackOp information
            const blackOp = enum_bladeburnerActions.blackOps[op]
            //check if this is the black op that is to be done
            if (ns.bladeburner.getActionCountRemaining(enum_bladeburnerActions.type.blackOps, blackOp.name) > 0) {
                //get chance
                const chance = ns.bladeburner.getActionEstimatedSuccessChance(enum_bladeburnerActions.type.blackOps, blackOp.name)
                //check if we have enough rank and enough chance
                if ((rank > blackOp.reqRank) &&
                    (chance[0] >= chanceMinBO)) {
                    //return this information
                    return { type: enum_bladeburnerActions.type.blackOps, name: blackOp.name }
                }
                //stop looking!
                break
            }
        }



        //operations
        //for each operation
        for (const op in enum_bladeburnerActions.operations) {
            //get operation information
            const operation = enum_bladeburnerActions.operations[op]
            //get action count
            const actionCount = ns.bladeburner.getActionCountRemaining(enum_bladeburnerActions.type.operations, operation)
            //get chance
            const chance = ns.bladeburner.getActionEstimatedSuccessChance(enum_bladeburnerActions.type.operations, operation)
            //if this action can be performed and we have enough chance
            if ((actionCount >= 1) && (chance[0] >= chanceMin)) {
                //return this information
                return { type: enum_bladeburnerActions.type.operations, name: operation }
            }
            //add count to total actions available
            totalActionCount += actionCount
        }

        //contracts
        //for each contract
        for (const op in enum_bladeburnerActions.contracts) {
            //get contract information
            const contract = enum_bladeburnerActions.contracts[op]
            //get action count
            const actionCount = ns.bladeburner.getActionCountRemaining(enum_bladeburnerActions.type.contracts, contract)
            //get chance
            const chance = ns.bladeburner.getActionEstimatedSuccessChance(enum_bladeburnerActions.type.contracts, contract)
            //if this action can be performed and we have enough chance
            if ((actionCount >= 1) && (chance[0] >= chanceMin)) {
                //return this information
                return { type: enum_bladeburnerActions.type.contracts, name: contract }
            }
            //add count to total actions available
            totalActionCount += actionCount
        }
    }

    //general
    //threshold on which chaos will effect actions (only done when chance for other actions is too low)
    const chaosthreshold = 50
    //if over threshold
    if (lowestChaos > chaosthreshold) {
        //lower chaos
        return { type: enum_bladeburnerActions.type.general, name: enum_bladeburnerActions.general.diplomacy }
    }
    //if no operations or contracts available
    if (totalActionCount == 0) {
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
function determineBestFactionWork(person, workTypes) {
    //set max skill level
    const maxSkillLevel = 975

    //save best rep
    let bestRep = -1
    //save best work type
    let bestWorkType = workTypes[0]

    //for each worktype
    for (let workType of workTypes) {
        //create variable to check later
        let rep = -1

        //check how to calculate
        switch (workType) {
            case "field":
                rep = (0.9 *
                    (person.skills.strength +
                        person.skills.defense +
                        person.skills.dexterity +
                        person.skills.agility +
                        person.skills.charisma +
                        (person.skills.hacking + person.skills.intelligence))) / maxSkillLevel / 5.5
                break

            case "hacking":
                rep = (person.skills.hacking + person.skills.intelligence / 3) / maxSkillLevel
                break

            case "security":
                rep = (0.9 *
                    (person.skills.strength +
                        person.skills.defense +
                        person.skills.dexterity +
                        person.skills.agility +
                        (person.skills.hacking + person.skills.intelligence))) / maxSkillLevel / 4.5
                break

            default:
                log(ns, 1, warning, "determineBestFactionWork - uncaught condition: " + workType);
                break
        }
        //if the rep is better than what is saved
        if (rep > bestRep) {
            //save the work type
            bestWorkType = workType
        }
    }
    return bestWorkType
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
function getActivity(ns, index = -1) {
    //create a return value
    //type is work type, value is the specific name of the work
    let activity = { type: "", value: "" }
    //if player
    if (index == -1) {
        //get current activity
        let activityPlayer = ns.singularity.getCurrentWork()
        //check if player is maybe performing work
        if (activityPlayer != null) {
            //depending on the type
            switch (activityPlayer.type) {
                case enum_activities.study: activity.value = activityPlayer.classType; break
                case enum_activities.company: activity.value = activityPlayer.companyName; break
                //case enum_activities.createProgram: activity.value = activityPlayer.programName; break
                case enum_activities.crime: activity.value = activityPlayer.crimeType; break
                case enum_activities.faction: activity.value = activityPlayer.factionName; break
                //case enum_activities.grafting: activity.value = activityPlayer.augmentation; break
                default:
                    //log information
                    log(ns, 1, info, "getActivity - Uncaught condition: " + activityPlayer.type)
                    //return immediately!
                    return activity
            }
            //set the type
            activity.type = activityPlayer.type

            //may be doing bladeburner work or doing nothing
        }

        //if sleeve
    } else {
        //get activity of sleeve
        let activitySleeve = ns.sleeve.getTask(index)
        //if set
        if (activitySleeve != null) {
            //depending on the type
            switch (activitySleeve.type) {
                case enum_activities.study: activity.value = activitySleeve.classType; break
                case enum_activities.company: activity.value = activitySleeve.companyName; break
                case enum_activities.crime: activity.value = activitySleeve.crimeType; break
                case enum_activities.faction: activity.value = activitySleeve.factionName; break
                //bladeburner?
                case enum_activities.bladeburner: activity.value = activitySleeve.actionName; break
                case enum_activities.infiltrate: activity.value = ""; break //only type property
                case enum_activities.support: activity.value = ""; break //only type property
                //sleeve only
                case enum_activities.recovery: activity.value = ""; break //only type property
                case enum_activities.synchro: activity.value = ""; break //only type property                
                default:
                    //log information
                    log(ns, 1, info, "getActivity - Uncaught condition: " + activitySleeve.type)
                    //return immediately!
                    return activity
            }
            //set the type
            activity.type = activitySleeve.type
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
function getActivityBladeburner(ns) {
    //create a return value
    //type is work type, value is the specific name of the work
    let activity = { type: "", value: "" }
    //if bladeburner work
    let activityPlayer = ns.bladeburner.getCurrentAction()
    //if not null: player is doing bladeburner work
    if (activityPlayer != null) {
        //set type
        activity.type = enum_activities.bladeburner
        //save action (to be looked up later)
        activity.value = activityPlayer.name
    }
    //return the value
    return activity
}



/**
 * Function that manages stanek
 * @param {NS} ns
 * Cost: 2,9 GB
 *  fragmentDefinitions (0)
 *  clearGift (0)
 *  chargeFragment (0,4)
 *  placeFragment (0,5)
 *  acceptGift (2)
 */
/*
function manageStanek(ns, stanekInfo) {

    //if the gift is accepted
    if (ns.stanek.acceptGift()) {
        //if grid has not been made
        if (!Object.hasOwn(stanekInfo, "grid")) {
            //create grid
            stanekInfo.grid = []
            //fill grid
            for (let height = 0; height < stanekInfo.height; height++) {
                let line = []
                for (let width = 0; width < stanekInfo.width; width++) {
                    line.push(false)
                }
                stanekInfo.grid.push(line)
            }
        }

        //get all fragment definitions
        for (let fragment of ns.stanek.fragmentDefinitions()) {
            var coordinates = getPlacableIndex(ns, stanekInfo.grid, fragment)
            if ((coordinates.x != -1) && (coordinates.y != -1)) {
                //place fragment
                ns.stanek.placeFragment(coordinates.x, coordinates.y, 0, fragment.id)
                insertFragment(stanekInfo.grid, fragment, coordinates.x, coordinates.y)
            }
            //log(ns,1,info,fragment + ":" + JSON.stringify(fragment))
        }
        //sizes from parameters
        //stanekInfo


        log(ns, 1, info, "Grid after: ")
        for (let row of stanekInfo.grid) {
            log(ns, 1, info, row)
        }

    }
}
*/



/**
 * Function that determines if the fragment can be placed
 * TODO: handle rotaions
 */
/*
function getPlacableIndex(ns, grid = [[]], fragment) {
    //get height and width of the fragment
    const fragmentHeight = fragment.shape.length
    const fragmentWidth = fragment.shape[0].length
    log(ns, 1, info, "Fragment: " + fragmentHeight + " x " + fragmentWidth)
    log(ns, 1, info, "Grid: ")
    for (let row of grid) {
        log(ns, 1, info, row)
    }

    //for each row
    for (let rowIndex in grid) {

        let row = grid[rowIndex]
        log(ns, 1, info, "grid.length: " + grid.length + ", row.length: " + row.length)
        //if fits vertically
        if ((parseInt(rowIndex) + fragmentHeight) < grid.length) {
            //for each index (left to right)
            for (let valueindex in row) {
                //if it fits sideways
                if ((parseInt(valueindex) + fragmentWidth) < row.length) {
                    //set flag to check
                    let flagFits = true
                    //for the height of the fragment
                    for (let height = 0; height < fragmentHeight; height++) {
                        //for the width of the fragment
                        for (let width = 0; width < fragmentWidth; width++) {
                            log(ns, 1, info, "value [" + parseInt(rowIndex) + height + "][" + parseInt(valueindex) + width + "]")
                            let valueGrid = grid[parseInt(rowIndex) + height][parseInt(valueindex) + width]
                            let valueFragment = fragment.shape[height][width]
                            //is this takes a slot
                            if (valueFragment == true) {
                                //and the slot is not opeb
                                if (valueGrid == true) {
                                    //set flag to false
                                    flagFits = false
                                    //stop looking                                
                                    break
                                }
                            }

                        }
                        //if doesn't fit horizontally
                        if (flagFits == false) {
                            //stop checking
                            break
                        }
                    }
                    //if all values were false (therefore it fits)
                    if (flagFits) {
                        //return the index
                        return { x: parseInt(valueindex), y: parseInt(rowIndex) }
                    }
                } else {
                    //stop looking
                    break
                }
            }
        } else {
            //stop looking
            break
        }
    }
    return { x: -1, y: -1 }
}
*/



/**
 * Function that inserts the fragment into the grid of Stanek
 */
/*
function insertFragment(grid, fragment, x, y) {
    const fragmentHeight = fragment.shape.length
    const fragmentWidth = fragment.shape[0].length
    for (let height = 0; height < fragmentHeight; height++) {
        for (let width = 0; width < fragmentWidth; width++) {
            if (fragment.shape[height][width] == true) {
                grid[y + height][x + width] = true
            }
        }
    }
}
*/



/**
 * Function that only returns servers (objects) 
 * That have RAM or money, and that have admin access (can run scripts)
 * Parameter determines if it returns ram (true) or money (false) server objects
 * Cost: 2
 *  getServer (2)
 */
function getServerSpecific(ns, ramServer = false) {
    //create a list (of objects) to return
    let serverList = []
    //get all servers
    const allServers = getServers(ns)
    //for each server
    for (let index = 0; index < allServers.length; index++) {
        //get server information
        let server = ns.getServer(allServers[index])
        //if we have admin rights
        if (server.hasAdminRights) {
            //if we need to check ram and there is ram, or if we need to check money and there is money
            if (((ramServer) && (server.maxRam > 0)) || ((!ramServer) && (server.moneyMax > 0))) {
                //add the server object to the list
                serverList.push(server)
            }
        }
    }
    //return server list
    return serverList
}



/**
 * Function that will retrieve all server hostnames
 * Cost: none
 */
function getServers(ns) {
    //create list to save hostnames into
    let serverList = []
    //start scanning from home
    scanServer(ns, enum_servers.home, serverList)
    //return the server list
    return serverList
}



/**
 * Function that will retrieve all servers, sub function of getServers
 * Cost: 
 *  scan (0,2)
 */
function scanServer(ns, hostname, serverList) {
    //get the neighbours of the server
    let neighbours = ns.scan(hostname)
    //for each neighbour
    for (let neighbour of neighbours) {
        //if not in the list
        if (serverList.indexOf(neighbour) == -1) {
            //add to list
            serverList.push(neighbour)
            //start scanning
            scanServer(ns, neighbour, serverList)
        }
    }
}



/**
 * Function that overwrites the specified port with new data
 * Cost: 0
 */
function overWritePort(ns, port, data) {
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
function updateUI(ns, numSleeves, bitNodeMultipliers) {
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
    values.push(numberFormatter(player.entropy))


    //karma
    headers.push("Karma")
    values.push(numberFormatter(player.karma) + "/" + numberFormatter(gangKarma))

    //kills
    headers.push("Kills")
    values.push(numberFormatter(player.numPeopleKilled) + "/" + killsFactions)

    //hack tools
    const hacking = player.skills.hacking
    let hackTools = 0
    if (hacking >= 50) {
        if (ns.singularity.purchaseProgram(enum_hackTools.bruteSSH)) {
            hackTools++
        }
    }
    if (hacking >= 100) {
        if (ns.singularity.purchaseProgram(enum_hackTools.fTPCrack)) {
            hackTools++
        }
    }
    if (hacking >= 300) {
        if (ns.singularity.purchaseProgram(enum_hackTools.relaySMTP)) {
            hackTools++
        }
    }
    if (hacking >= 400) {
        if (ns.singularity.purchaseProgram(enum_hackTools.hTTPWorm)) {
            hackTools++
        }
    }
    if (hacking >= 725) {
        if (ns.singularity.purchaseProgram(enum_hackTools.sQLInject)) {
            hackTools++
        }
    }
    //add to header
    headers.push("Hack tools")
    //add specifics to data
    values.push(hackTools + "/" + 5)

    //augments bought
    headers.push("Augments bought")

    //add global
    values.push(getInstalledAugmentations(ns).length + "+" + getNumberToBeInstalledAugments() + "/" + bitNodeMultipliers["DaedalusAugsRequirement"])



    //sleeves
    
    for (let index = 0; index < numSleeves; index++) {
        //get sleeve activity
        const activity = getActivity(ns, index)
        //add to header
        headers.push("Sleeve " + index)
        //add specifics to data
        values.push(activity.type.charAt(0) + activity.type.slice(1).toLowerCase() + ": " + activity.value)
    }

    //bladeburner
    
    
    if (get_bladeburner_access(ns)) {
        //stamina
        headers.push("Bladeburner stamina")
        const stamina = ns.bladeburner.getStamina()
        const percentage = Math.round(stamina[0] / stamina[1] * 100)
        values.push(numberFormatter(stamina[0]) + "/" + numberFormatter(stamina[1]) + " (" + percentage + "%)")
        //rank
        headers.push("Bladeburner rank")
        values.push(numberFormatter(Math.floor(ns.bladeburner.getRank())) + "/" + numberFormatter(400e3))

        //blackOps completed
        let blackOpsCompleted = 0
        for (let blackOpEntry in enum_bladeburnerActions.blackOps) {
            //get blackop name
            const blackOp = enum_bladeburnerActions.blackOps[blackOpEntry]
            //if completed
            if (ns.bladeburner.getActionCountRemaining(enum_bladeburnerActions.type.blackOps, blackOp.name) == 0) {
                //add to the counter
                blackOpsCompleted++
            } else {
                //not completed: stop
                break
            }
        }
        headers.push("Bladeburner BlackOps")
        values.push(blackOpsCompleted + "/21")
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
function log(ns, loglevel, type, message) {
    //depending on loglevel
    switch (loglevel) {
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
function numberFormatter(number) {
    let fractionDigits = 3
    if (number == 0) {
        return 0
    }
    //round the number
    number = Math.round(number)

    let symbols = ["", "k", "m", "b", "t"]
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
        numberReturn = Math.sign(number) * ((Math.abs(number) / Math.pow(1000, largestIndex)).toFixed(fractionDigits))
    }
    return numberReturn + symbols[largestIndex]
}



/**
 * Function that a boolean if enough rep is reached for a faction
 * @param {NS} ns
 */
function shouldWorkForFaction(ns, faction) {
    //check if we need to work for faction
    if (ns.singularity.getAugmentationsFromFaction(faction).length > 0) {
        //keep track of the highest rep
        let highestRep = -1
        //get owned augments
        let ownedAugs = getInstalledAugmentations(ns)
        //for each augment of the faction
        for (let augment of ns.singularity.getAugmentationsFromFaction(faction)) {
            //if augment is not owned
            if (ownedAugs.indexOf(augment) == -1) {
                //update the highest rep if needed
                highestRep = Math.max(highestRep, ns.singularity.getAugmentationRepReq(augment)) //enum_augmentsRep[augment])
            }
        }
        return highestRep >= ns.singularity.getFactionRep(faction)
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
 * Slum snakes (gang faction) and bladeburner cannot be worked for, hence they have no workTypes
 * Work types: "field", "hacking", "security" 	
 */
const enum_factions = {
    //special factions (no faction work available)
    slumSnakes: { name: "Slum Snakes" },
    bladeburners: { name: "Bladeburners" },
    churchOfTheMachineGod: { name: "Church of the Machine God" },
    shadowsOfAnarchy: { name: "Shadows of Anarchy" },

    //important factions
    daedalus: { name: "Daedalus", workTypes: ["field", "hacking"] },
    illuminati: { name: "Illuminati", workTypes: ["field", "hacking"] },
    theCovenant: { name: "The Covenant", workTypes: ["field", "hacking"] },

    //company factions
    eCorp: { name: "ECorp", workTypes: ["field", "hacking", "security"] },
    megaCorp: { name: "MegaCorp", workTypes: ["field", "hacking", "security"] },
    bachmanAssociates: { name: "Bachman & Associates", workTypes: ["field", "hacking", "security"] },
    bladeIndustries: { name: "Blade Industries", workTypes: ["field", "hacking", "security"] },
    nWO: { name: "NWO", workTypes: ["field", "hacking", "security"] },
    clarkeIncorporated: { name: "Clarke Incorporated", workTypes: ["field", "hacking", "security"] },
    omniTekIncorporated: { name: "OmniTek Incorporated", workTypes: ["field", "hacking", "security"] },
    fourSigma: { name: "Four Sigma", workTypes: ["field", "hacking", "security"] },
    kuaiGongInternational: { name: "KuaiGong International", workTypes: ["field", "hacking", "security"] },
    fulcrumSecretTechnologies: { name: "Fulcrum Secret Technologies", workTypes: ["hacking", "security"] },

    //hacking factions
    bitRunners: { name: "BitRunners", workTypes: ["hacking"] },
    theBlackHand: { name: "The Black Hand", workTypes: ["field", "hacking"] },
    niteSec: { name: "NiteSec", workTypes: ["hacking"] },
    cyberSec: { name: "CyberSec", workTypes: ["hacking"] },

    //location factions
    aevum: { name: "Aevum", workTypes: ["field", "hacking", "security"] },
    chongqing: { name: "Chongqing", workTypes: ["field", "hacking", "security"] },
    ishima: { name: "Ishima", workTypes: ["field", "hacking", "security"] },
    newTokyo: { name: "New Tokyo", workTypes: ["field", "hacking", "security"] },
    sector12: { name: "Sector-12", workTypes: ["field", "hacking", "security"] },
    volhaven: { name: "Volhaven", workTypes: ["field", "hacking", "security"] },

    //crime factions
    speakersForTheDead: { name: "Speakers for the Dead", workTypes: ["field", "hacking", "security"] },
    theDarkArmy: { name: "The Dark Army", workTypes: ["field", "hacking"] },
    theSyndicate: { name: "The Syndicate", workTypes: ["field", "hacking", "security"] },
    silhouette: { name: "Silhouette", workTypes: ["field", "hacking"] },
    tetrads: { name: "Tetrads", workTypes: ["field", "security"] },

    //other factions
    netburners: { name: "Netburners", workTypes: ["hacking"] },
    tianDiHui: { name: "Tian Di Hui", workTypes: ["hacking", "security"] },
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
    faction: "FACTION", //properties: type, factionName, factionWorkType, cyclesWorked (player)		
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
const enum_companyFactions = {
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
const enum_hackTools = {
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
function logBitnodeInformation(ns, bitNodeMultipliers, resetInfo, stanekInfo) {
    //get the bitnode
    let bitnode = resetInfo.currentNode
    //set level
    let sourceFile = 1
    //if we have source file
    if (resetInfo.ownedSF.has(bitnode)) {
        //add the owned level to the source file
        sourceFile += resetInfo.ownedSF.get(bitnode)
        //if bitnode is not 12 (which is unlimited)
        if (bitnode != 12) {
            //limit if needed
            sourceFile = Math.min(sourceFile, 3)
        }
    }
    //set log type
    let logType = info
    //get difficulty
    const difficulty = bitNodeMultipliers["WorldDaemonDifficulty"]
    //get default hacking skill required for world deamon
    const worldDeamonHackingSkill = 3000
    //log bitnode information
    log(ns, 1, logType, "BitNode: " + bitnode + "." + sourceFile + ", World daemon difficulty: " + difficulty + ", hacking level required: " + (difficulty * worldDeamonHackingSkill))



    //stats
    const stats = {
        "Hack exp": bitNodeMultipliers.HackExpGain,
        "Hack": bitNodeMultipliers.HackingLevelMultiplier,
        "Strength": bitNodeMultipliers.StrengthLevelMultiplier,
        "Defense": bitNodeMultipliers.DefenseLevelMultiplier,
        "Dexterity": bitNodeMultipliers.DexterityLevelMultiplier,
        "Agility": bitNodeMultipliers.AgilityLevelMultiplier,
        "Charisma": bitNodeMultipliers.CharismaLevelMultiplier,
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
        "Rep cost": bitNodeMultipliers.AugmentationRepCost,
        "Money cost": bitNodeMultipliers.AugmentationMoneyCost,
        "Deadalus augment requirement": bitNodeMultipliers.DaedalusAugsRequirement,
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
        "Rank gain": bitNodeMultipliers.BladeburnerRank,
        "Skill cost": bitNodeMultipliers.BladeburnerSkillCost
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
        "Power multiplier": bitNodeMultipliers.StaneksGiftPowerMultiplier,
        "Extra size": bitNodeMultipliers.StaneksGiftExtraSize,
    }
    //set base size
    let stanekBaseSize = 9 + stanek["Extra size"]
    //update stanek information
    if (resetInfo.ownedSF.has(13)) {
        //each level grants a additional size
        stanekBaseSize += resetInfo.ownedSF.get(13)
    }
    //from return Math.max(2, Math.min(Math.floor(this.baseSize() / 2 + 1), StanekConstants.MaxSize));
    //calculate width
    stanekInfo.width = Math.max(2, Math.min(Math.floor(stanekBaseSize / 2 + 1), 25))
    //calculate height 
    stanekInfo.height = Math.max(3, Math.min(Math.floor(stanekBaseSize / 2 + 0.6), 25))
    //check log type
    logType = info
    if (stanek["Power multiplier"] < 1 || stanek["Extra size"] < 1) {
        logType = warning
        if (stanekInfo.width <= 0 || stanekInfo.height <= 0) {
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
    message += ", total width: " + stanekInfo.width + ", total height: " + stanekInfo.height
    log(ns, 1, logType, message)



    //hacking
    const hack = {
        "Money": bitNodeMultipliers.ScriptHackMoney,
        "Money gain": bitNodeMultipliers.ScriptHackMoneyGain,
        "Growth rate": bitNodeMultipliers.ServerGrowthRate,
        "Max money": bitNodeMultipliers.ServerMaxMoney,
        "Server starting money": bitNodeMultipliers.ServerStartingMoney,
        "Server starting security": bitNodeMultipliers.ServerStartingSecurity,
        "Weaken rate": bitNodeMultipliers.ServerWeakenRate,
        "Hacking speed": bitNodeMultipliers.HackingSpeedMultiplier,
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
        "Soft cap": bitNodeMultipliers.GangSoftcap,
        "Unique augments": bitNodeMultipliers.GangUniqueAugs,
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
        "Softcap": bitNodeMultipliers.CorporationSoftcap,
        "Valuation": bitNodeMultipliers.CorporationValuation,
        "Divisions": bitNodeMultipliers.CorporationDivisions,
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
        "Home RAM cost": bitNodeMultipliers.HomeComputerRamCost,
        "Server cost": bitNodeMultipliers.PurchasedServerCost,
        "Server soft cap": bitNodeMultipliers.PurchasedServerSoftcap,
        "Server limit": bitNodeMultipliers.PurchasedServerLimit,
        "Server max RAM": bitNodeMultipliers.PurchasedServerMaxRam,
        "Hacknet money": bitNodeMultipliers.HacknetNodeMoney,
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
        "Passive rep gain": bitNodeMultipliers.FactionPassiveRepGain,
        "Work exp gain": bitNodeMultipliers.FactionWorkExpGain,
        "Work rep gain": bitNodeMultipliers.FactionWorkRepGain,
        "Rep to donate": bitNodeMultipliers.RepToDonateToFaction,
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
        "Work exp gain": bitNodeMultipliers.CompanyWorkExpGain,
        "Work money": bitNodeMultipliers.CompanyWorkMoney,
        "Work rep gain": bitNodeMultipliers.CompanyWorkRepGain,
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
        "4S Data cost": bitNodeMultipliers.FourSigmaMarketDataApiCost,
        "4S api cost": bitNodeMultipliers.FourSigmaMarketDataCost,
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
        "Exp gain": bitNodeMultipliers.CrimeExpGain,
        "Money": bitNodeMultipliers.CrimeMoney,
        "Success rate": bitNodeMultipliers.CrimeSuccessRate,
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
        "Power": bitNodeMultipliers.GoPower,
    }
    if (go["Power"] < 1) {
        log(ns, 1, warning, "Go: " + "Power: " + go["Power"])
    }

    log(ns, 1, info, "------------------------------------")
    message = "Owned Augments: "
    for (let augment of resetInfo.ownedAugs.keys()) {
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


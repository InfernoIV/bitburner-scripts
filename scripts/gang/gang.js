/*  sources: 
https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.gang.md
https://github.com/bitburner-official/bitburner-src/blob/dev/src/Gang/data/tasks.ts
https://github.com/bitburner-official/bitburner-src/blob/dev/src/Gang/Gang.ts
https://github.com/bitburner-official/bitburner-src/blob/dev/src/Gang/data/Constants.ts
*/

import { 
    info, success, warning, error, fail, //constants
    enum_port, enum_servers, enum_scripts, //enums
    log, overwritePort, //functions
} from "scripts/common.js"

//config
import * as config from "./config.js"
//data
import * as data from "./data.js"


//the focus of the gang, either hacking or combat, received from bitNode manager
var gangFocus
var bestPowerOfOtherGangs = 0
var previousWantedLevel = 0


//main function
export async function main(ns) {
    //init stuff
    init(ns)
    //create a gang
    while (!createGang(ns)) {
        //wait a second
        await ns.sleep(1000 * 10)
    }
    //try to recruit new members
    await recruitMembers(ns)
    //main loop
    while (true) {
        //for every member
        for (let gangMemberName of ns.gang.getMemberNames()) {
            //get information of own gang (updated)
            let gangOwn = ns.gang.getGangInformation()
            //try to recruit new members
            await recruitMembers(ns)
            //checks for clash and sets flag
            let territoryClash = manageTerritoryClash(ns, gangOwn)
            //manages member tasks
            manageMembers(ns, gangOwn, territoryClash, gangMemberName)
            //wait for next update, so the effect of the task is taken into account (e.g. lowering wanted level)
            await ns.gang.nextUpdate()
            //update UI
            //updateUI(ns)
        }
    }
}



/**
 * Function to init parameters:
 * focus of the gang
 */
/** @param {NS} ns */
function init(ns) {
    ns.disableLog("disableLog")
    ns.disableLog("gang.purchaseEquipment")
    ns.disableLog("gang.setMemberTask")
    ns.disableLog("gang.setTerritoryWarfare")
    //get argument for focus type of gang (hacking or combat)
    //if(ns.args.length < 1) {
    //log information
    //log(ns,1,warning,"Not enough arguments, defaulting to hacking focus")
    gangFocus = "combat"
    //} else {
    //    gangFocus = ns.args[0]
    //}
    //if in a gang

    if (ns.gang.inGang()) {
        //set clash to false
        ns.gang.setTerritoryWarfare(false)
    }
}



/**
 * Function to create a gang
 */
/** @param {NS} ns */
function createGang(ns) {
    //check if we are in a gang
    let flagInGang = ns.gang.inGang()
    //if not in a gang
    if (!flagInGang) {
        //defaulting to Slum Snakes 
        let gangFaction = config.faction_gang
        //create a gang
        if (ns.gang.createGang(gangFaction)) {
            //set flag
            flagInGang = true
            //set clash to false
            //log information
            log(ns, config.log_level, success, "Created gang " + gangFaction)
        }
    }
    return flagInGang
}



/**
 * Function that manages the tasks of the members, according the clash
 */
/** @param {NS} ns */
async function manageMembers(ns, gangOwn, territoryClash, gangMemberName) {
    //if name exisist (only changes when killed)
    if (ns.gang.getMemberNames().indexOf(gangMemberName) > -1) {
        //get information of the member 
        let gangMember = ns.gang.getMemberInformation(gangMemberName)
        //upgrade equipment
        manageUpgrades(ns, gangMember)
        //ascend to get better multipliers
        manageAscension(ns, gangMember)
        //set member to perform task
        performTask(ns, gangOwn, gangMember, determineMemberAction(ns, gangOwn.wantedLevel, territoryClash, gangMember))
        //save wanted level
        previousWantedLevel = gangOwn.wantedLevel
    }
}



/** @param {NS} ns */
function determineMemberAction(ns, wantedLevel, territoryClash, gangMember) {
    
    //variables to save information into
    let statTrain = 0
    let statMult = 0
    let trainAction = data.gang_task.money
    let upgradesHave = [].concat(gangMember.upgrades, gangMember.augmentations)
    let upgradesAvailable = getUpgrades(ns) //ns.gang.getEquipmentNames()
    log(ns, config.log_level, info, "upgradesHave: " + upgradesHave.length + ", upgradesAvailable: " + upgradesAvailable.length)
    //let augmentationAvailable = ns.gang.

    //things to check for specific gang focus
    if (gangFocus == "combat") {
        statTrain = Math.min(gangMember.str, gangMember.agi, gangMember.def, gangMember.dex)
        statMult = Math.min(gangMember.str_asc_mult, gangMember.agi_asc_mult, gangMember.def_asc_mult, gangMember.dex_asc_mult)
        trainAction = data.gang_task.trainCombat
    } else if (gangFocus == "hacking") {
        statTrain = gangMember.hack
        statMult = gangMember.hack_asc_mult
        trainAction = data.gang_task.trainHacking
    } else {
        log(ns, config.log_level, error, "Uncaught Gang focus: " + gangFocus)
        //defaults to raise money
        return data.gang_task.power
    }

    //if the desired level is too low
    if (statTrain < config.desired_training_Level) {
        overWritePort(ns, enum_port.gang, "Training")

        return trainAction
        //if not enough members unlocked
    } else if (statMult < config.desired_multiplier) {
        overWritePort(ns, enum_port.gang, "Training")

        return trainAction
        //if wanted level is too high
    } else if (ns.gang.getMemberNames().length < data.gang_members_max) {
        overWritePort(ns, enum_port.gang, "Growing gang")
        return data.gang_task.reputation    //if members can be unlocked: gain reputation
        //if the multiplier is too low
    } else if (wantedLevel > previousWantedLevel) {
        return data.gang_task.lowerWanted   //if wanted level is rising, lower wanted level    
        //if not all upgrades unlocked
    } else if (upgradesHave.length < config.desired_equipment) {
        //block resets
        overWritePort(ns, enum_port.reset, "gang")
        overWritePort(ns, enum_port.gang, "Get equipment: " + upgradesHave.length + " / " + config.desired_equipment)
        //upgradesAvailable.length) {
        //raise money to buy upgrades
        return data.gang_task.money
        //if clashing: gain territory  
    } else if (territoryClash == 1) {
        //clear reset
        if (ns.peek(enum_port.reset) == "gang") {
            ns.clearPort(enum_port.reset)
        }
        overWritePort(ns, enum_port.gang, "Territory Warfare: " + Math.round(ns.gang.getGangInformation().territory * 100) + "%")
        return data.gang_task.power
        //if all territory is owned: focus on getting money   
    } else if (territoryClash == 2) {
        //indicate status
        overWritePort(ns, enum_port.gang, "Farming")
        //clear reset
        if (ns.peek(enum_port.reset) == "gang") {
            ns.clearPort(enum_port.reset)
        }
        return data.gang_task.money
        //defaults to raise power
    } else {
        return data.gang_task.power
    }
}



/**
 * Function that checks and recruits members
 */
/** @param {NS} ns */
async function recruitMembers(ns) {
    //if a new member can be recruited
    if (ns.gang.canRecruitMember()) {
        log(ns, 0, info, "Recruiting Member")
        //update information
        //overWritePort(ns, enum_port.gang, "Growing gang")

        const names = ns.gang.getMemberNames()

        for (let index = 0; index < data.gang_members_max; index++) {
            //create name
            let memberNameNew = "gangMember-" + index //ns.gang.getMemberNames().length //nameList[randomNumber]
            //if the name does not exist
            if (names.indexOf(memberNameNew) == -1) {
                //recruit a new member
                if (ns.gang.recruitMember(memberNameNew)) {
                    //log information
                    log(ns, config.log_level, success, "Recruited member: '" + memberNameNew + "'")
                } else {
                    log(ns, config.log_level, warning, "Failed to recruit member '" + memberNameNew + "'")
                }
                return
            }
        }
        log(ns, config.log_level, error, "Unhandled: All " + data.gang_members_max + " members recruited?!?")
    }
}



/**
 * Function that checks for other gangs and to determine if clash is needed
 * returns 1 if clash is started
 * return 2 if all territory is owned
 */
/** @param {NS} ns */
function manageTerritoryClash(ns, gangOwn) {
    //let gangOwnPower = gangOwn.power

    //save information on other gangs (names)
    const otherGangs = ns.gang.getOtherGangInformation()
    //save list of other gangs which have no territory anymore (e.g. are eliminated)
    let eliminatedGangs = []
    //variable to save the best gang in
    let bestOtherGang = { faction: "", power: 0 }
    //for each other gang
    for (const gangName in otherGangs) {
        if (gangName == gangOwn.faction) { continue }
        //get the information
        const gangInfo = otherGangs[gangName]
        //log(ns, 1, info, gangName + ": " + gangInfo.power + " (" + gangOwnPower + ") " + ns.gang.getChanceToWinClash(gangName) + "%" )

        //if no territory (= eliminated)
        if (gangInfo.territory == 0) {
            //add to the list
            eliminatedGangs.push(gangName)
        } else {
            //check if the power is higher
            if (gangInfo.power > bestOtherGang.power) {
                //save the information
                bestOtherGang.faction = gangName
                //save the power
                bestOtherGang.power = gangInfo.power
            }
        }
    }
    
    bestPowerOfOtherGangs = bestOtherGang.power
    
    //flag for clash
    let territoryClash = 0
    //if all other gangs have no territory
    if (eliminatedGangs.length >= otherGangs.length || bestOtherGang.faction == "") {        //update information
        //we've won, no further actions are needed
        territoryClash = 2
        //clear blockage        
    } else {        //update information
        //if we have more than the minimum chance
        if (ns.gang.getChanceToWinClash(bestOtherGang.faction) > config.territory_clash_minimum_percentage) {
            //update information
            //overWritePort(ns, portGang, "Territory Warfare: " + Math.round(ns.gang.getGangInformation().territory * 100) + "%")
            //start clashing 
            territoryClash = 1
            log(ns, 0, info, "Territory Warfare: " + Math.round(ns.gang.getGangInformation().territory * 100) + "%")
        }
    }
    //set warfare (TODO: does it matter if it is started whilst already performing warfare?)
    if (territoryClash == 1) {
        //update gang stats
        ns.gang.setTerritoryWarfare(true)
    } else {
        //stop clashing
        ns.gang.setTerritoryWarfare(false)
    }

    //return the flag
    return territoryClash
}



/**
 * Function that starts a task for the given member
 */
/** @param {NS} ns */
function performTask(ns, gangOwn, gangMember, taskFocus) {
    //log(ns,0,info,"Task: " + taskFocus )
    //Set default task to hybrid task (Both combat and hacking)
    let task = data.gang_task.unassigned

    //depending on the focus, set the task
    switch (taskFocus) {
        case data.gang_task.trainHacking: task = "Train Hacking"; break
        case data.gang_task.trainCombat: task = "Train Combat"; break
        case data.gang_task.trainCharisma: task = "Train Charisma"; break
        case data.gang_task.power: task = "Territory Warfare"; break

        //dependant on bitnode focus (either hacking or combat)
        case data.gang_task.lowerWanted:
            if (gangFocus == "hacking") {
                task = "Ethical Hacking"; break
            } else {
                task = "Vigilante Justice"; break
            }

        //focus that needs to be calculated (depending on gang task focus)
        case data.gang_task.reputation:
        case data.gang_task.money:
            task = getBestTask(ns, gangOwn, gangMember, taskFocus); break
        //log(ns,1,info,"task: " + JSON.stringify(task)); break
        default: log(ns, config.log_level, error, "performTask: unhandled condition '" + taskFocus + "', defaulting to " + task); break
    }

    //If the member is not performing the task
    if (gangMember.task != task) {
        //set member to perform task
        ns.gang.setMemberTask(gangMember.name, task)
    }
}



/**
 * Function that gets the best task for the given type
 * https://github.com/bitburner-official/bitburner-src/blob/dev/src/Gang/GangMemberTask.ts
 * https://github.com/bitburner-official/bitburner-src/blob/dev/src/Gang/data/tasks.ts
 */
/** @param {NS} ns */
function getBestTask(ns, gangOwn, gangMember, type) { //type is either "reputation" or "money"
    //get the tasks
    const tasks = getTasks(ns)
    //variable to save task to
    let best = { name: "", value: 0 }
    //for every task
    for (const task of tasks) {
        //calculate the gains (according to the type)
        const gains = calculateGains(ns, gangOwn, gangMember, task, type)
        //if better gains        
        if (gains > best.value) {
            //save the information
            best.name = task.name
            best.value = gains
        }
    }
    //if there is a value set
    if (best.value > 0) {
        //return the best task
        return best.name
    } else {
        if (gangFocus == "combat") {
            return "Train Combat"
        } else if (gangFocus == "hacking") {
            return "Train Hacking"
        }
    }
}



/**
 * Function that returns the tasks available (seperated in combat and hacking)
 */
/** @param {NS} ns */
function getTasks(ns) {
    //variable to store information to
    let taskList = { hacking: [], combat: [], }
    //for every task of the available tasks
    for (const task of ns.gang.getTaskNames()) {
        //get the stats of the task
        const stats = ns.gang.getTaskStats(task)
        //check where to place the task
        if (stats.isHacking && !stats.isCombat) {
            taskList.hacking.push(stats) //if hack specific
        } else if (!stats.isHacking && stats.isCombat) {
            taskList.combat.push(stats)  //if combat specific
        } else {
            //push to both
            taskList.hacking.push(stats) //if hack specific
            taskList.combat.push(stats)  //if combat specific
        }
    }
    //return task list   
    return taskList[gangFocus]
}



/**
 * Function that calculates the respect gain
 * https://github.com/bitburner-official/bitburner-src/blob/dev/src/Gang/formulas/formulas.ts
 * TODO: fix currentNodeMults.GangSoftcap 
 * https://github.com/bitburner-official/bitburner-src/blob/dev/src/BitNode/BitNodeMultipliers.ts
 */
function calculateGains(ns, gang, member, task, type) {
    //variable for saving type specific information
    let typeSpecific = {}
    //determine the multipliers
    switch (type) {
        case data.gang_task.reputation: typeSpecific = { base: task.baseRespect, statWeight: 4, final: 11, }; break
        case data.gang_task.money: typeSpecific = { base: task.baseMoney, statWeight: 3.2, final: 5, }; break
        default:
            return 0
    }
    //if base is 0, no need to calculate
    if (typeSpecific.base === 0) return 0

    //calculate the weights of the stats
    let statWeight =
        (task.hackWeight / 100) * member.hack +
        (task.strWeight / 100) * member.str +
        (task.defWeight / 100) * member.def +
        (task.dexWeight / 100) * member.dex +
        (task.agiWeight / 100) * member.agi +
        (task.chaWeight / 100) * member.cha
    //add the type specific multiplier and difficulty into account
    statWeight -= typeSpecific.statWeight * task.difficulty
    //if below 0, return 0
    if (statWeight <= 0) return 0

    //calculate the territory multiplier
    const territoryMult = Math.max(0.005, Math.pow(gang.territory * 100, task.territory[type]) / 100)
    //sanity check
    if (isNaN(territoryMult) || territoryMult <= 0) return 0
    //TODO: Properly fix
    const territoryPenalty = gang.territory //(0.2 * gang.territory + 0.8) * currentNodeMults.GangSoftcap
    const respectMult = gang.respect / (gang.respect + gang.wantedLevel) //calculateWantedPenalty(gang)

    //final calulcation
    return Math.pow(5 * typeSpecific.base * statWeight * territoryMult * respectMult, territoryPenalty)
}



/**
 * function that manages upgrades of the gang member
 * https://github.com/bitburner-official/bitburner-src/blob/dev/src/Gang/GangMemberUpgrade.ts
 * https://github.com/bitburner-official/bitburner-src/blob/dev/src/Gang/GangMemberUpgrades.ts
 * https://github.com/bitburner-official/bitburner-src/blob/dev/src/Gang/data/upgrades.ts
 * 
 * every augment will result into lower ascension points (95%)
 * need to use??
 *  getInstallResult(memberName) 	            Get the effect of an install on ascension multipliers without installing.
 */
function manageUpgrades(ns, gangMember) {
    //get all owned upgrades (augments and equipment)
    const ownedUpgrades = gangMember.augmentations.concat(gangMember.upgrades)
    //for every available equipment
    for (const equipName of getUpgrades(ns)) { //ns.gang.getEquipmentNames()) {
        //if not owned
        if (ownedUpgrades.indexOf(equipName) == -1) {
            //buy it
            ns.gang.purchaseEquipment(gangMember.name, equipName)
        }
    }
}



/**
 * function that manages augments and ascension of the gang member
 * https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.gangmemberascension.md
 * https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.gangmemberinfo.md
 */
/** @param {NS} ns */
function manageAscension(ns, gangMember) {
    //Get the result of an ascension without ascending
    let results = ns.gang.getAscensionResult(gangMember.name)

    //https://www.reddit.com/r/Bitburner/comments/x6v08l/help_with_automating_gangs/
    const fNeeded = 2 //1.26
    let f = 0

    if (results != null) {
        //check focus
        if (gangFocus == "hacking") {
            f = Math.min(results.hack)
        } else if (gangFocus == "combat") {
            f = Math.min(results.str, results.def, results.dex)//ignore agility since it is very slow levelling?, results.agi)
        }
    }
    if (fNeeded < f) {
        if (ns.gang.ascendMember(gangMember.name)) {
            log(ns, config.log_level, success, "Ascended " + gangMember.name + "!")
        }
    }
}



/** @param {NS} ns */
function getUpgrades(ns) {
    let upgradeList = []
    const upgrades = ns.gang.getEquipmentNames()

    for (const upgrade of upgrades) {
        //get stats of the equipment
        const stats = ns.gang.getEquipmentStats(upgrade)

        if (gangFocus == "combat") {
            if ((stats.str > 1) || (stats.def > 1) || (stats.dex > 1) || (stats.agi > 1)) {
                upgradeList.push(upgrade)
            }
        } else if (gangFocus == "hacking") {
            if (stats.hack > 1) {
                upgradeList.push(upgrade)
            }
        } else {
            log(ns, config.log_level, error, "getUpgrades - No gang focus!")
            return []
        }
    }
    //return the list
    return upgradeList
}

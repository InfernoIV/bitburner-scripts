//imports
import { enum_port, enum_servers, enum_scripts} from "scripts/common.js"



//log constants
const info = "INFO"
const success = "SUCCESS"
const warning = "WARNING"
const error = "ERROR"
const fail = "FAIL"

const serverHome = "home"
const enum_hackingCommands = {
    start: "Start",
    stop: "Stop",
}

//global variables
var counter
const counterLimit = 10



/** @param {NS} ns */
export async function main(ns) {
    //counter = 0
    //init
    init(ns)
    //configurable delay
    const delayBetweenScripts = 50
    //define max amount of threads per instance
    const maxThreads = 100
    const logLevel = 0

    log(ns, 0, success, "Looking for servers to execute hacks")
    //wait until servers become available
    while (getExecuteServers(ns).length == 0) {
        await ns.sleep(1 * 1000)
    }
    log(ns, 0, success, "Found " + getExecuteServers(ns).length + " servers to execute hacks")
    //create target info
    let target = new targetInfo(ns, delayBetweenScripts, maxThreads, logLevel)
    //always start in stop mode, to limit ram usage
    let flagStop = false
    //main loop
    while (true) {

        if (flagStop == true) {
            if ((ns.peek(enum_port.stopHack) == enum_hackingCommands.start)) {
                //log information
                log(ns, 0, info, "Resuming HackManager")
                //reset flag
                flagStop = false
            } else {
                //do nothing
                await ns.sleep(100)
            }


        } else {
            if ((ns.peek(enum_port.stopHack) == enum_hackingCommands.stop)) {
                //log information
                log(ns, 0, info, "Pausing HackManager")
                let waitTime = ns.getWeakenTime(ns) + (2*delayBetweenScripts)
                await ns.sleep(waitTime)

                //set flag
                flagStop = true
            } else {
                let flagAwaitTarget = false
                //check for a new target: if new target, re-calculate the batch sizes
                while (!await target.determineTarget(ns)) {
                    //check if there is a need to log
                    if (flagAwaitTarget == false) {
                        //set flag
                        flagAwaitTarget = true
                        //log once
                        log(ns, 1, warning, "Waiting for target")
                    }
                    await ns.sleep(100)
                }
                //prep should only trigger once, or when hashes change the server
                //await target.prepTarget(ns)
                //execute a hack on target
                await target.executeHack(ns)
            }
        }
    }
}


/** @param {NS} ns */
function init(ns) {
    ns.disableLog("disableLog")
    ns.disableLog("getServerMaxRam")
    ns.disableLog("getServerUsedRam")
    ns.disableLog("sleep")
    ns.disableLog("getServerMoneyAvailable")
    ns.disableLog("exec")
    ns.disableLog("getServerSecurityLevel")
    ns.disableLog("getServerRequiredHackingLevel")
    ns.disableLog("getServerMinSecurityLevel")
    ns.disableLog("getServerMaxMoney")
    ns.disableLog("getHackingLevel")
    ns.disableLog("scan")
    ns.disableLog("getServerBaseSecurityLevel")
    ns.disableLog("scp")
    //clear UI data
    ns.clearPort(enum_port.hack)
    //ns.clearPort(portHackStatus)
    //ns.clearPort(portHackTarget)
}

class targetInfo {
    //create the class
    /** @param {NS} ns */
    constructor(ns, delayBetweenScripts, maxThreads, logLevel) {
        //set hostname to empty
        this.hostname = ""
        //save the delay to use for calculations
        this.delayBetweenScripts = delayBetweenScripts
        //save max threads
        this.maxThreads = maxThreads
        //set initial waitingtime
        this.waitTime = 0
        this.wait = 0
        //define scripts
        this.scriptWeaken = enum_scripts.workerWeaken //"scripts/external/weaken.js"
        this.scriptGrow = enum_scripts.workerGrow //"scripts/external/grow.js"
        this.scriptHack = enum_scripts.workerHack //"scripts/external/hack.js"
        //set costs
        this.cost = {
            weaken: ns.getScriptRam(this.scriptWeaken),
            grow: ns.getScriptRam(this.scriptGrow),
            hack: ns.getScriptRam(this.scriptHack),
        }
        //set loglevel
        this.logLevel = logLevel
    }

    //function to determine the hacking target
    /** @param {NS} ns */
    async determineTarget(ns) {
        //refresh servers
        this.servers = getServers(ns) //getExecuteServers(ns)
        //log(ns, 1, info, "servers: " + JSON.stringify(this.servers))
        //variable to save the target to
        let newTarget = ""
        //variable to temporarly store new target
        let bestScore = -1
        //log(ns,1,info,"this.servers: " + JSON.stringify(this.servers))
        //for every server
        for (let server of this.servers) {
            
            
            //set score to 0			
            let score = 0
            let maxMoney = ns.getServerMaxMoney(server)
            //if the server can be hacked and has money
            if (ns.hasRootAccess(server) && maxMoney > 0) {
                //log(ns,1,info,"server: " + server)
                //log(ns,1,info,(ns.getHackingLevel() / 2) + " > " + ns.getServerRequiredHackingLevel(server))
                //if required hacking level is smaller than half the player hacking level			
                if ((ns.getHackingLevel() / 2) > ns.getServerRequiredHackingLevel(server)) {
                    //calculate score according to max money and min security (?)		
                    score = maxMoney / ns.getServerMinSecurityLevel(server)
                    if (score > bestScore) {
                        newTarget = server
                        bestScore = score
                        //log(ns, 1, info, "newTarget: " + newTarget)
                    }
                }
            }
        }

        //if new target:
        if (this.hostname != newTarget) {
            //set current target to new target
            this.hostname = newTarget
            //calculate the batches (W, GW, HWGW)
            this.generateThreads(ns)
            //prep target: W, then GW 
            await this.prepTarget(ns) //should only happen once, if properly balanced
        }
        if (newTarget == "") {
            return false
        }
        return true
    }


    /** @param {NS} ns */
    generateThreads(ns) {
        //create information storage of the batches
        this.weaken = []
        this.grow = []
        this.hack = []

        this.minRam = {}

        let maxCores = 128/*ns.getServer(serverHome).cpuCores //128 
        
        for (let index = 0; index < ns.hacknet.numNodes(); index++) {
            let hackNetCores = ns.hacknet.getNodeStats(index).cores
            if (hackNetCores > maxCores) {
                maxCores = hackNetCores
            }
        }
        //add a core, just to be sure
        maxCores++*/



        //growthAnalyze(host, multiplier, cores)
        //growthAnalyzeSecurity(threads, hostname, cores)
        //weakenAnalyze(threads, cores)

        //for each core amount
        for (let cores = 1; cores <= maxCores; cores++) {
            this.weaken[cores] = []
            this.grow[cores] = []
            this.hack[cores] = []

            //maximum is defined main threads (limited due to hack %: 1 hack = 1%, 100 hack = 100%)
            for (let index = 1; index <= this.maxThreads; index++) {
                //get information for 1-100 main thread
                if (!this.calculateThreads(ns, index, cores)) {
                    //hacking signed that we exceeded the threshold
                    //this.moneyPerHack = index * ns.hackAnalyze(this.hostname) * ns.getServerMaxMoney(this.hostname)
                    //stop calculating
                    break
                }
            }
        }
    }


    /** @param {NS} ns */
    calculateThreads(ns, index, cores) {
        //growthAnalyze(host, multiplier, cores)
        //growthAnalyzeSecurity(threads, hostname, cores)
        //weakenAnalyze(threads, cores)

        //"calculate" W
        let threadsWeaken = { weaken: index }
        //add costs
        let costWeaken = (threadsWeaken.weaken * this.cost.weaken)
        //save to map
        this.weaken[cores].push({ cost: costWeaken, threads: threadsWeaken })
        //this.weaken.push({ cost: costWeaken, threads: threadsWeaken })


        //calculate GW	
        let threadsGrow = { grow: index }
        //calculate the security increase
        let securityIncrease = ns.growthAnalyzeSecurity(threadsGrow.grow, this.hostname, cores)
        //set threads to 1
        let threadsWeaken0 = 1
        //while the increase is not nullified
        while (ns.weakenAnalyze(threadsWeaken0, cores) < securityIncrease) {
            //add threads
            threadsWeaken0++
        }
        threadsGrow.weaken = threadsWeaken0
        //always set to 1 if smaller
        if (threadsGrow.weaken < 1) {
            threadsGrow.weaken = 1
        }
        //add costs
        let costGrow = (threadsGrow.grow * this.cost.grow) +
            (threadsGrow.weaken * this.cost.weaken)
        //save to map
        this.grow[cores].push({ cost: costGrow, threads: threadsGrow })
        //this.grow.push({ cost: costGrow, threads: threadsGrow })


        //calculate HWGW
        let threadsHack = { hack: index }
        //calculate growth
        let moneyMax = ns.getServerMaxMoney(this.hostname)
        let moneyHacked = ns.hackAnalyze(this.hostname) * threadsHack.hack * moneyMax
        //if hacking equal to or more than 100%
        if ((ns.hackAnalyze(this.hostname) * threadsHack.hack) >= 1) {
            //signal to stop
            return false
        }

        threadsHack.grow = Math.max(Math.ceil(ns.growthAnalyze(this.hostname, moneyMax / (moneyMax - moneyHacked), cores)), 1)
        //BAD: Math.ceil(ns.growthAnalyze(this.hostname, (moneyMax / (moneyMax - moneyHacked))))
        //GOOD: Math.ceil(ns.growthAnalyze(server, maxMoney / (maxMoney - maxMoney * tGreed)))


        //calculate the security increase of hack
        threadsHack.weaken1 = Math.max(Math.ceil(threadsHack.hack * 0.002 / 0.05), 1)
        //let securityIncreaseHack = ns.hackAnalyzeSecurity(threadsHack.hack, this.hostname)

        //calculate the security increase of grow
        threadsHack.weaken2 = Math.max(Math.ceil(threadsHack.grow * 0.004 / 0.05), 1)


        //let securityIncreaseGrow = ns.growthAnalyzeSecurity(threadsHack.grow, this.hostname)
        //add costs
        let costHack = (threadsHack.hack * this.cost.hack) +
            (threadsHack.weaken1 * this.cost.weaken) +
            (threadsHack.grow * this.cost.grow) +
            (threadsHack.weaken2 * this.cost.weaken)


        //save to list
        this.hack[cores].push({ cost: costHack, threads: threadsHack })
        //this.hack.push({ cost: costHack, threads: threadsHack })

        //if first time, save the minimum ram needed: this is the minimum set
        if (index == 1) {
            this.minRam[cores] = { weaken: costWeaken, grow: costGrow, hack: costHack }
            //this.minRam = { weaken: costWeaken, grow: costGrow, hack: costHack }
        }
        return true
    }


    getThreads(ns, cores, ram, type) {
        try {
            let types = this[type]

            //get the correct list
            let list = types[cores]//eval("this." + type + "[" + cores + "]")

            //for every index
            for (let index = 0; index < list.length; index++) {
                if (list[index].cost > ram) {
                    if (index == 0) {
                        return null
                    }
                    //exceeded ram, go back 1
                    return list[--index].threads
                }
            }
            //exceeded list, return last entry
            return list[list.length - 1].threads
        } catch (error) {
            log(ns, 1, warning, "getThreads: " + error)
            log(ns, 1, warning, "cores: " + cores + ", ram: " + ram + ", type: " + type)
            log(ns, 1, error, "this: " + JSON.stringify(this))
            return undefined ///{ grow: 0, weaken: 0, hack: 0, weaken1: 0, weaken2: 0 }
        }
    }




    //prepare the target
    async prepTarget(ns) {

        //get info
        let securityMin = ns.getServerMinSecurityLevel(this.hostname)
        let moneyMax = ns.getServerMaxMoney(this.hostname)

        //check if need to log
        if ((Math.round(ns.getServerSecurityLevel(this.hostname)) > Math.round(securityMin)) ||
            (ns.getServerMoneyAvailable(this.hostname) < moneyMax)) {
            log(ns, 1, info, "Started prep " + this.hostname + ": " +
                ns.getServerSecurityLevel(this.hostname) + " > " + securityMin + " (" + (ns.getServerSecurityLevel(this.hostname) > securityMin) + "), " +
                ns.getServerMoneyAvailable(this.hostname) + " < " + moneyMax + " (" + (ns.getServerMoneyAvailable(this.hostname) < moneyMax) + ")")
            //kill all running scripts
            this.killScripts(ns)
        } else {
            return
        }

        //while the security is not min
        while (ns.getServerSecurityLevel(this.hostname) > securityMin) {
            //log info to UI
            overWritePort(ns, enum_port.hack, "Weaken: " + this.hostname)
            //updateUI(ns, this.hostname, "Weaken: " + Math.floor(securityMin / ns.getServerSecurityLevel(this.hostname)) + "%")
            //weaken the server
            await this.executeBatch(ns, "weaken")
        }
        //kill all running scripts
        this.killScripts(ns)

        //while money is not max
        while (ns.getServerMoneyAvailable(this.hostname) < moneyMax) {
            //log info to UI
            overWritePort(ns, enum_port.hack, "Grow: " + this.hostname)
            //updateUI(ns, this.hostname, "Grow: " + Math.floor(ns.getServerMoneyAvailable(this.hostname) / moneyMax) + "%")
            //grow the money
            await this.executeBatch(ns, "grow")
        }
        //kill all running scripts
        this.killScripts(ns)
        log(ns, 1, info, "Prep done for " + this.hostname + ", starting hack")
    }


    getDelays(ns, type) {
        //get current timings
        let timeWeaken = ns.getWeakenTime(this.hostname)
        let timeGrow = ns.getGrowTime(this.hostname)
        let timeHack = ns.getHackTime(this.hostname)
        //check on what needs to be returned
        switch (type) {
            case "weaken":
                /*
                    |---Weaken---|
                */
                return {
                    weaken: this.delayBetweenScripts,	//cannot be 0, use delay between scripts
                }

            case "grow":
                /*
                       |--Grow--|.
                    |---Weaken---|
                */
                return {
                    grow: timeWeaken - timeGrow - this.delayBetweenScripts,
                    weaken: 0,
                }

            case "hack":
                /*
                         |-Hack-|.
                    |---Weaken---|
                         |--Grow--|.
                    ..|---Weaken---|
                */
                return {
                    hack: timeWeaken - timeHack - this.delayBetweenScripts,
                    weaken1: 0,
                    grow: timeWeaken - timeGrow + this.delayBetweenScripts,
                    weaken2: this.delayBetweenScripts * 2,
                }
            default:
                log(ns, 1, error, "getDelays - Unhandled type: " + type)
                //stop the script
                ns.exit()
        }
    }
    /** @param {NS} ns */
    async executeHack(ns) {
        let moneyPercentage = "" + numberFormatter(ns.getServerMoneyAvailable(this.hostname)) + "/" + numberFormatter(ns.getServerMaxMoney(this.hostname))
        let securityPercentage = "" + numberFormatter(Math.floor(ns.getServerBaseSecurityLevel(this.hostname))) + "/" + numberFormatter(Math.floor(ns.getServerSecurityLevel(this.hostname)))
        //update UI with the current server status
        overWritePort(ns, enum_port.hack, "Hack: " + this.hostname)
        //updateUI(ns, this.hostname, "Hack: " + moneyPercentage + ", " + securityPercentage)//Math.round(moneyPercentage) + "%, " + Math.round(securityPercentage) + "%")
        //execute the batch
        await this.executeBatch(ns, "hack")
    }

    async executeBatch(ns, type) {

        //variable to save server name to
        let serverExec = ""
        //save the ram of the execute server
        let serverRam = 0
        //for every available server
        for (let server of getExecuteServers(ns)) {
            let cores = ns.getServer(server).cpuCores

            try {
                //log(ns,1,info,"cores: " + cores + ", minRam:" + JSON.stringify(this.minRam))
                //get the minimum ram needed
                let minRam = 0
                while (!Object.hasOwn(this.minRam, cores)) {
                    cores -= 1
                }
                minRam = this.minRam[cores][type]
                ////eval("this.minRam[" + cores + "]." + type)
                //calculate the available ram
                serverRam = ns.getServerMaxRam(server) - ns.getServerUsedRam(server)
                if (serverRam > minRam) {
                    log(ns, 0, info, "Found server: " + server + " (" + cores + " core(s), " + serverRam + " GB RAM) to run " + minRam + " GB RAM")
                    //set the execute server
                    serverExec = server
                    //stop looking
                    break
                }
            } catch (error) {
                log(ns, 1, warning, "Error: " + error)
                log(ns, 1, info, "cores: " + cores + ", type: " + type + ", this.minRam: " + JSON.stringify(this.minRam))
                ns.exit()
            }

        }

        //if no server found or not enough room
        if (/*(serverRam < minRam) ||*/ (serverExec == "")) {
            //wait a bit
            await (ns.sleep(this.wait))
            //go back to start
            return
        }

        //determine script settings
        let delays = this.getDelays(ns, type) //dynamic to hack level, generated every time
        let threads = this.getThreads(ns, ns.getServer(serverExec).cpuCores, serverRam, type) //static to server, generated when a server is selected

        //log(ns, 0, info, serverExec + " has " + ns.getServer(serverExec).cpuCores + " cores")
        //log(ns, 1, info, "delays: " + JSON.stringify(delays))
        //log(ns, 1, info, "threads: " + JSON.stringify(threads))
        //ns.exit()
        //wait until we get a green light = sync up
        while (Date.now() < this.waitTime) {
            await ns.sleep(1)
        }

        if (threads === undefined) {
            log(ns, 1, info, "Server: " + serverExec + ": " + ns.getServer(serverExec).cpuCores + ", ram: " + serverRam + ", type: " + type)
            ns.exit()
        }


        //execute scripts
        //args: hostname, delay, loglevel
        switch (type) {
            case "weaken":
                //check if delay is incorrect
                if (delays.weaken < 0) {
                    break
                }
                if (!ns.exec(this.scriptWeaken, serverExec, threads.weaken, /* */this.hostname, delays.weaken, threads.weaken, serverExec, this.logLevel)) {
                    log(ns, 1, warning, serverExec + " failed to start " + "weaken (" + threads.weaken + ") -> " + JSON.stringify(ns.getServer(serverExec)))
                    counter++
                    //log(ns,1,info,"zb-institute: " + ))

                }
                break
            case "grow":
                //check if delay is incorrect
                if (delays.grow < 0 || delays.weaken < 0) {
                    break
                }

                if (!ns.exec(this.scriptGrow, serverExec, threads.grow, /*    */ this.hostname, delays.grow, threads.grow, serverExec, this.logLevel)) {
                    log(ns, 1, warning, serverExec + " failed to start " + "grow (" + threads.grow + ") -> " + JSON.stringify(ns.getServer(serverExec)))
                    counter++
                }
                if (!ns.exec(this.scriptWeaken, serverExec, threads.weaken, /* */this.hostname, delays.weaken, threads.weaken, serverExec, this.logLevel)) {
                    log(ns, 1, warning, serverExec + " failed to start " + "weaken (" + threads.weaken + ") -> " + JSON.stringify(ns.getServer(serverExec)))
                    counter++
                }
                break
            case "hack":
                //check if delay is incorrect
                if (delays.hack < 0 || delays.weaken1 < 0 || delays.grow < 0 || delays.weaken2 < 0) {
                    break
                }

                try {
                    if (!ns.exec(this.scriptHack, serverExec, threads.hack, /* */this.hostname, delays.hack, threads.hack, serverExec, this.logLevel)) {
                        log(ns, 1, warning, serverExec + " failed to start " + "hack (" + threads.hack + ") -> " + JSON.stringify(ns.getServer(serverExec)))
                        counter++
                    }
                    if (!ns.exec(this.scriptWeaken, serverExec, threads.weaken1, this.hostname, delays.weaken1, threads.weaken1, serverExec, this.logLevel)) {
                        log(ns, 1, warning, serverExec + " failed to start " + "weaken1 (" + threads.weaken1 + ") -> " + JSON.stringify(ns.getServer(serverExec)))
                        counter++
                    }
                    if (!ns.exec(this.scriptGrow, serverExec, threads.grow, /* */this.hostname, delays.grow, threads.grow, serverExec, this.logLevel)) {
                        log(ns, 1, warning, serverExec + " failed to start " + "grow (" + threads.grow + ") -> " + JSON.stringify(ns.getServer(serverExec)))
                        counter++
                    }
                    if (!ns.exec(this.scriptWeaken, serverExec, threads.weaken2, this.hostname, delays.weaken2, threads.weaken2, serverExec, this.logLevel)) {
                        log(ns, 1, warning, serverExec + " failed to start " + "weaken2 (" + threads.weaken2 + ") -> " + JSON.stringify(ns.getServer(serverExec)))
                        counter++
                    }

                    /*counter++
                    if (counter >= counterLimit) { //TEMP!
                        ns.exit()
                    }*/


                } catch (error) {
                    log(ns, 1, error, "'" + serverExec + "' cannot exec " + JSON.stringify(threads) + " (" + serverRam + ")")
                    ns.exit()
                }
                break
            default:
                log(ns, 1, error, "executeBatch - Unhandled type: " + type)
                //stop the script
                ns.exit()
        }
        //set wait time for next execute
        this.wait = ((Object.keys(threads).length + 0) * this.delayBetweenScripts)
        this.waitTime = Date.now() + this.wait
    }


    /** @param {NS} ns */
    killScripts(ns) {
        for (let server of this.servers) {
            ns.scriptKill(this.scriptWeaken, server)
            ns.scriptKill(this.scriptGrow, server)
            ns.scriptKill(this.scriptHack, server)
        }
    }
}

/** @param {NS} ns */
function updateUI(ns, header, value) {
    
    overWritePort(ns, portHackTarget, header)
    overWritePort(ns, portHackStatus, value)
}

/** @param {NS} ns */
function getServers(ns) {
    //create a list to save hostnames to
    let scanList = []
    //start scanning from home
    scanServer(ns, serverHome, scanList)
    //add purchased servers to the list
    return scanList.concat(ns.getPurchasedServers())
}

/** @param {NS} ns */
function scanServer(ns, hostname, scanList) {
    //add this hostname to the list				
    scanList.push(hostname)
    //scan at this hostname				
    let neighbours = ns.scan(hostname)
    //for every neighbour				
    for (let neighbour of neighbours) {
        //if not yet performed a scan on this hostname			
        if (scanList.indexOf(neighbour) == -1) {
            //scan from this neighbour		
            scanServer(ns, neighbour, scanList)
        }
    }
}

/** @param {NS} ns */
function getExecuteServers(ns) {
    let executeServers = []
    let allServers = getServers(ns)
    //TODO: WHY DO THEY FAIL?
    let blackList = ["zb-institute", "univ-energy", "titan-labs"]
    for (let server of allServers) {
        //if not on the blacklist
        //if (blackList.indexOf(server) != -1) {
        //if root access and RAM
        if ((ns.hasRootAccess(server)) &&
            (ns.getServerMaxRam(server) > 0)) {
            //if not yet in the executeServers list
            if (executeServers.indexOf(server) == -1) {
                //copy files to servers 
                ns.scp(enum_scripts.workerWeaken, server)
                ns.scp(enum_scripts.workerGrow, server)
                ns.scp(enum_scripts.workerHack, server)
                /*
                ns.scp("scripts/external/weaken.js", server)
                ns.scp("scripts/external/grow.js", server)
                ns.scp("scripts/external/hack.js", server)
                */
                //ns.scp("scripts/helpers.js", server)

                //push to list
                executeServers.push(server)
            }
        }
        //}
    }
    //log(ns,1,info,"executeServers: " + executeServers)
    return executeServers
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

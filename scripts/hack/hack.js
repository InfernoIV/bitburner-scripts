//config.
import * as config from "./config.js"
//common
import * as common from "scripts/common.js"
//common cost
import { get_servers, get_server_specific } from "scripts/common_cost.js"


/** @param {NS} ns */
export async function main(ns) {
    //init
    init(ns)
    //log start
    common.log(ns, config.log_level, common.success, "Looking for servers to execute hacks")
    //get servers
    let number_of_execute_servers = get_server_specific(ns, true).length 
    //wait until servers become available
    while (number_of_execute_servers == 0) {
        //wait a bit
        await ns.sleep(1 * 1000)
        //update
        number_of_execute_servers = get_server_specific(ns, true).length 
    }
    //log information
    common.log(ns, config.log_level, common.success, "Found " + number_of_execute_servers + " servers to execute hacks")
    //create target info object
    let target = new targetInfo(ns, config.delay_between_scripts)
    //always start in stop mode, to limit ram usage
    let flag_stop = false
    //main loop
    while (true) {
        //if stopped
        if (flag_stop == true) {
            //if we should start again
            if ((ns.peek(common.port.stopHack) == common.hacking_commands.start)) {
                //log information
                common.log(ns, config.log_level, common.info, "Resuming HackManager")
                //reset flag
                flag_stop = false
            //nothing has changed
            } else {
                //do nothing but wait a bit
                await ns.sleep(100)
            }

        //running normally
        } else {
            //if command for stpoping
            if ((ns.peek(common.port.stopHack) == common.hacking_commands.stop)) {
                //log information
                common.log(ns, config.log_level, common.info, "Pausing HackManager")
                //set wait time
                let waitTime = ns.getWeakenTime(ns) + (2 * config.delay_between_scripts)
                //wait to ensure everything is stpoped
                await ns.sleep(waitTime)
                //set flag
                flag_stop = true
            } else {
                //set flag to check
                let flag_await_target = false
                //check for a new target: if new target, re-calculate the batch sizes
                while (!await target.determineTarget(ns)) {
                    //check if there is a need to log
                    if (flag_await_target == false) {
                        //set flag
                        flag_await_target = true
                        //log once
                        common.log(ns, config.log_level, common.warning, "Waiting for target")
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
    //disable logging
    common.disable_logging(ns, config.log_disabled_topics)
    //clear UI data
    ns.clearPort(common.port.hack)
}

class targetInfo {
    //create the class
    
    /** @param {NS} ns */
    constructor(ns) {
        //set hostname to empty
        this.hostname = ""
        //set initial waitingtime
        this.waitTime = 0
        this.wait = 0
        //define scripts
        this.scriptWeaken = common.scripts.worker_weaken 
        this.scriptGrow = common.scripts.worker_grow 
        this.scriptHack = common.scripts.worker_hack
        //set costs
        this.cost = {
            weaken: ns.getScriptRam(this.scriptWeaken),
            grow: ns.getScriptRam(this.scriptGrow),
            hack: ns.getScriptRam(this.scriptHack),
        }
    }

    //function to determine the hacking target
    /** @param {NS} ns */
    async determineTarget(ns) {
        //refresh servers
        this.servers = get_servers(ns) //getExecuteServers(ns)
        //log(ns, 1, info, "servers: " + JSON.stringify(this.servers))
        this.copy_scripts(ns)
        
        //variable to save the target to
        let new_target = ""
        //variable to temporarly store new target
        let best_score = -1
        //log(ns,1,info,"this.servers: " + JSON.stringify(this.servers))
        //for every server
        for (let server of this.servers) {
            //set score to 0			
            let score = 0
            //get the max money possible
            const max_money = ns.getServerMaxMoney(server)
            //if the server can be hacked and has money
            if (ns.hasRootAccess(server) && max_money > 0) {
                //log(ns,1,info,"server: " + server)
                //log(ns,1,info,(ns.getHackingLevel() / 2) + " > " + ns.getServerRequiredHackingLevel(server))
                //if required hacking level is smaller than half the player hacking level			
                if ((ns.getHackingLevel() / 2) > ns.getServerRequiredHackingLevel(server)) {
                    //calculate score according to max money and min security (?)		
                    score = max_money / ns.getServerMinSecurityLevel(server)
                    //if this score is better than what we have
                    if (score > best_score) {
                        //save this server
                        new_target = server
                        //save the score
                        best_score = score
                        //log(ns, 1, info, "newTarget: " + newTarget)
                    }
                }
            }
        }

        //if new target:
        if (this.hostname != new_target) {
            //set current target to new target
            this.hostname = new_target
            //calculate the batches (W, GW, HWGW)
            this.generateThreads(ns)
            //prep target: W, then GW 
            await this.prepTarget(ns) //should only happen once, if properly balanced
        }
        if (new_target == "") {
            //no target found
            return false
        }
        //
        return true
    }


    /**
     * Scripts that copies all scripts to all hosts
     */
    copy_scripts(ns) {
        //for each server
        for (const server of this.servers) {
            //copy scripts
            ns.scp(this.scriptWeaken, server)
            ns.scp(this.scriptGrow, server)
            ns.scp(this.scriptHack, server)
        }
    }

    /** @param {NS} ns */
    generateThreads(ns) {
        //create information storage of the batches
        this.weaken = []
        this.grow = []
        this.hack = []

        this.ram_min = {}

        //maximum number of cores to calculate
        const max_cores = 128/*ns.getServer(enum_servers.home).cpuCores //128 
        
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
        for (let cores = 1; cores <= max_cores; cores++) {
            this.weaken[cores] = []
            this.grow[cores] = []
            this.hack[cores] = []

            //maximum is defined main threads (limited due to hack %: 1 hack = 1%, 100 hack = 100%)
            for (let index = 1; index <= config.max_threads; index++) {
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
        let weaken_threads = { weaken: index }
        //add costs
        const weaken_cost = (weaken_threads.weaken * this.cost.weaken)
        //save to map
        this.weaken[cores].push({ cost: weaken_cost, threads: weaken_threads })
        //this.weaken.push({ cost: weaken_cost, threads: weaken_threads })


        //calculate GW	
        let grow_threads = { grow: index }
        //calculate the security increase
        const grow_security_increase = ns.growthAnalyzeSecurity(grow_threads.grow, this.hostname, cores)
        //set threads to 1
        let weaken_threads_for_grow = 1
        //while the increase is not nullified
        while (ns.weakenAnalyze(weaken_threads_for_grow, cores) < grow_security_increase) {
            //add threads
            weaken_threads_for_grow++
        }
        grow_threads.weaken = weaken_threads_for_grow
        //always set to 1 if smaller
        if (grow_threads.weaken < 1) {
            grow_threads.weaken = 1
        }
        //add costs
        let grow_cost = (grow_threads.grow * this.cost.grow) +
            (grow_threads.weaken * this.cost.weaken)
        //save to map
        this.grow[cores].push({ cost: grow_cost, threads: grow_threads })
        //this.grow.push({ cost: grow_cost, threads: grow_threads })


        //calculate HWGW
        let hack_threads = { hack: index }
        //calculate growth
        let money_max = ns.getServerMaxMoney(this.hostname)
        let money_hacked = ns.hackAnalyze(this.hostname) * hack_threads.hack * money_max
        //if hacking equal to or more than 100%
        if ((ns.hackAnalyze(this.hostname) * hack_threads.hack) >= 1) {
            //signal to stop
            return false
        }

        hack_threads.grow = Math.max(Math.ceil(ns.growthAnalyze(this.hostname, money_max / (money_max - money_hacked), cores)), 1)
        //BAD: Math.ceil(ns.growthAnalyze(this.hostname, (money_max / (money_max - money_hacked))))
        //GOOD: Math.ceil(ns.growthAnalyze(server, maxMoney / (maxMoney - maxMoney * tGreed)))


        //calculate the security increase of hack
        hack_threads.weaken1 = Math.max(Math.ceil(hack_threads.hack * 0.002 / 0.05), 1)
        //let securityIncreaseHack = ns.hackAnalyzeSecurity(hack_threads.hack, this.hostname)

        //calculate the security increase of grow
        hack_threads.weaken2 = Math.max(Math.ceil(hack_threads.grow * 0.004 / 0.05), 1)


        //let securityIncreaseGrow = ns.growthAnalyzeSecurity(hack_threads.grow, this.hostname)
        //add costs
        let hack_cost = (hack_threads.hack * this.cost.hack) +
            (hack_threads.weaken1 * this.cost.weaken) +
            (hack_threads.grow * this.cost.grow) +
            (hack_threads.weaken2 * this.cost.weaken)


        //save to list
        this.hack[cores].push({ cost: hack_cost, threads: hack_threads })
        //this.hack.push({ cost: hack_cost, threads: hack_threads })

        //if first time, save the minimum ram needed: this is the minimum set
        if (index == 1) {
            this.ram_min[cores] = { weaken: weaken_cost, grow: grow_cost, hack: hack_cost }
            //this.ram_min = { weaken: weaken_cost, grow: grow_cost, hack: hack_cost }
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
                //if enough ram
                if (list[index].cost > ram) {
                    //if not enough ram
                    if (index == 0) {
                        //not possible
                        return null
                    }
                    //exceeded ram, go back 1
                    return list[--index].threads
                }
            }
            //exceeded list, return last entry
            return list[list.length - 1].threads
        //error occured
        } catch (error) {
            common.log(ns, config.log_level, common.warning, "getThreads: " + error)
            common.log(ns, config.log_level, common.warning, "cores: " + cores + ", ram: " + ram + ", type: " + type)
            common.log(ns, config.log_level, common.error, "this: " + JSON.stringify(this))
            return undefined ///{ grow: 0, weaken: 0, hack: 0, weaken1: 0, weaken2: 0 }
        }
    }



    //prepare the target
    async prepTarget(ns) {

        //get info
        const security_min = ns.getServerMinSecurityLevel(this.hostname)
        const money_max = ns.getServerMaxMoney(this.hostname)
        //check data
        const security_below_threshold = Math.round(ns.getServerSecurityLevel(this.hostname)) < Math.round(security_min)
        const money_at_max = ns.getServerMoneyAvailable(this.hostname) >= money_max
        //check if need to log
        if (!security_below_threshold || !money_at_max) {
            //log information
            common.log(ns, config.log_level, common.info, "Started prep " + this.hostname + ": " +
                ns.getServerSecurityLevel(this.hostname) + " > " + security_min + " (" + (ns.getServerSecurityLevel(this.hostname) > security_min) + "), " +
                ns.getServerMoneyAvailable(this.hostname) + " < " + money_max + " (" + (ns.getServerMoneyAvailable(this.hostname) < money_max) + ")")
            //kill all running scripts
            this.killScripts(ns)
        //everything ok
        } else {
            //no need for action
            return
        }

        //while the security is not min
        while (ns.getServerSecurityLevel(this.hostname) > security_min) {
            //log info to UI
            common.over_write_port(ns, common.port.hack, "Weaken: " + this.hostname)
            //updateUI(ns, this.hostname, "Weaken: " + Math.floor(security_min / ns.getServerSecurityLevel(this.hostname)) + "%")
            //weaken the server
            await this.executeBatch(ns, "weaken")
        }
        //kill all running scripts
        this.killScripts(ns)

        //while money is not max
        while (ns.getServerMoneyAvailable(this.hostname) < money_max) {
            //log info to UI
            common.over_write_port(ns, common.port.hack, "Grow: " + this.hostname)
            //updateUI(ns, this.hostname, "Grow: " + Math.floor(ns.getServerMoneyAvailable(this.hostname) / money_max) + "%")
            //grow the money
            await this.executeBatch(ns, "grow")
        }
        //kill all running scripts
        this.killScripts(ns)
        common.log(ns, config.log_level, common.info, "Prep done for " + this.hostname + ", starting hack")
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
                    weaken: config.delay_between_scripts,	//cannot be 0, use delay between scripts
                }

            case "grow":
                /*
                       |--Grow--|.
                    |---Weaken---|
                */
                return {
                    grow: timeWeaken - timeGrow - config.delay_between_scripts,
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
                    hack: timeWeaken - timeHack - config.delay_between_scripts,
                    weaken1: 0,
                    grow: timeWeaken - timeGrow + config.delay_between_scripts,
                    weaken2: config.delay_between_scripts * 2,
                }
            default:
                log(ns, config.log_level, error, "getDelays - Unhandled type: " + type)
                //stop the script
                ns.exit()
        }
    }


    
    /** @param {NS} ns */
    async executeHack(ns) {
        //formate messages
        const money_percentage = "" + number_formatter(ns.getServerMoneyAvailable(this.hostname)) + "/" + number_formatter(ns.getServerMaxMoney(this.hostname))
        const security_percentage = "" + number_formatter(Math.floor(ns.getServerBaseSecurityLevel(this.hostname))) + "/" + number_formatter(Math.floor(ns.getServerSecurityLevel(this.hostname)))
        //update UI with the current server status
        common.over_write_port(ns, common.port.hack, "Hack: " + this.hostname)
        //updateUI(ns, this.hostname, "Hack: " + moneyPercentage + ", " + securityPercentage)//Math.round(moneyPercentage) + "%, " + Math.round(securityPercentage) + "%")
        //execute the batch
        await this.executeBatch(ns, "hack")
    }


    
    async executeBatch(ns, type) {
        //variable to save server name to
        let server_to_execute_hack_on = ""
        //save the ram of the execute server
        let server_ram = 0
        //for every available server
        for (const server_data of get_server_specific(ns,true)) { //getExecuteServers(ns)) {
            //get server name
            const server = server_data.hostname
            //get the cores
            let cores = ns.getServer(server).cpuCores
            //safeguard
            try {
                //get the minimum ram needed
                let ram_min = 0
                //check the cores
                while (!Object.hasOwn(this.ram_min, cores)) {
                    cores -= 1
                }
                ram_min = this.ram_min[cores][type]
                //calculate the available ram
                server_ram = ns.getServerMaxRam(server) - ns.getServerUsedRam(server)
                //check if enough ram
                const enough_ram = server_ram > ram_min
                //if enough RAM
                if (enough_ram) {
                    //log information
                    common.log(ns, config.log_level, common.info, "Found server: " + server + " (" + cores + " core(s), " + server_ram + " GB RAM) to run " + ram_min + " GB RAM")
                    //set the execute server
                    server_to_execute_hack_on = server
                    //stop looking
                    break
                }
            //error occured
            } catch (error) {
                //log informations
                common.log(ns, config.log_level, common.warning, "Error: " + error)
                //log environment
                common.log(ns, config.log_level, common.info, "cores: " + cores + ", type: " + type + ", this.ram_min: " + JSON.stringify(this.ram_min))
                //stop script
                ns.exit()
            }

        }

        //if no server found or not enough room
        if (/*(server_ram < ram_min) ||*/ (server_to_execute_hack_on == "")) {
            //wait a bit
            await (ns.sleep(this.wait))
            //go back to start
            return
        }

        //determine script settings
        let delays = this.getDelays(ns, type) //dynamic to hack level, generated every time
        let threads = this.getThreads(ns, ns.getServer(server_to_execute_hack_on).cpuCores, server_ram, type) //static to server, generated when a server is selected

        //log(ns, 0, info, server_to_execute_hack_on + " has " + ns.getServer(server_to_execute_hack_on).cpuCores + " cores")
        //log(ns, 1, info, "delays: " + JSON.stringify(delays))
        //log(ns, 1, info, "threads: " + JSON.stringify(threads))
        //ns.exit()
        //wait until we get a green light = sync up
        while (Date.now() < this.waitTime) {
            await ns.sleep(1)
        }

        if (threads === undefined) {
            common.log(ns, 1, common.warning, "Server: " + server_to_execute_hack_on + ": " + ns.getServer(server_to_execute_hack_on).cpuCores + ", ram: " + server_ram + ", type: " + type)
            //exit script
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
                if (!ns.exec(this.scriptWeaken, server_to_execute_hack_on, threads.weaken, /* */this.hostname, delays.weaken, threads.weaken, server_to_execute_hack_on, config.log_level)) {
                    //log informatoin
                    common.log(ns, config.log_level, common.warning, server_to_execute_hack_on + " failed to start " + "weaken (" + threads.weaken + ") -> " + JSON.stringify(ns.getServer(server_to_execute_hack_on)))                   
                }
                break

            case "grow":
                //check if delay is incorrect
                if (delays.grow < 0 || delays.weaken < 0) {
                    break
                }

                if (!ns.exec(this.scriptGrow, server_to_execute_hack_on, threads.grow, /*    */ this.hostname, delays.grow, threads.grow, server_to_execute_hack_on, config.log_level)) {
                    common.log(ns, 1, common.warning, server_to_execute_hack_on + " failed to start " + "grow (" + threads.grow + ") -> " + JSON.stringify(ns.getServer(server_to_execute_hack_on)))
                    counter++
                }
                if (!ns.exec(this.scriptWeaken, server_to_execute_hack_on, threads.weaken, /* */this.hostname, delays.weaken, threads.weaken, server_to_execute_hack_on, config.log_level)) {
                    common.log(ns, 1, common.warning, server_to_execute_hack_on + " failed to start " + "weaken (" + threads.weaken + ") -> " + JSON.stringify(ns.getServer(server_to_execute_hack_on)))
                    counter++
                }
                break
                
            case "hack":
                //check if delay is incorrect
                if (delays.hack < 0 || delays.weaken1 < 0 || delays.grow < 0 || delays.weaken2 < 0) {
                    break
                }

                try {
                    if (!ns.exec(this.scriptHack, server_to_execute_hack_on, threads.hack, /* */this.hostname, delays.hack, threads.hack, server_to_execute_hack_on, config.log_level)) {
                        log(ns, 1, warning, server_to_execute_hack_on + " failed to start " + "hack (" + threads.hack + ") -> " + JSON.stringify(ns.getServer(server_to_execute_hack_on)))
                        counter++
                    }
                    if (!ns.exec(this.scriptWeaken, server_to_execute_hack_on, threads.weaken1, this.hostname, delays.weaken1, threads.weaken1, server_to_execute_hack_on, config.log_level)) {
                        log(ns, 1, warning, server_to_execute_hack_on + " failed to start " + "weaken1 (" + threads.weaken1 + ") -> " + JSON.stringify(ns.getServer(server_to_execute_hack_on)))
                        counter++
                    }
                    if (!ns.exec(this.scriptGrow, server_to_execute_hack_on, threads.grow, /* */this.hostname, delays.grow, threads.grow, server_to_execute_hack_on, config.log_level)) {
                        log(ns, 1, warning, server_to_execute_hack_on + " failed to start " + "grow (" + threads.grow + ") -> " + JSON.stringify(ns.getServer(server_to_execute_hack_on)))
                        counter++
                    }
                    if (!ns.exec(this.scriptWeaken, server_to_execute_hack_on, threads.weaken2, this.hostname, delays.weaken2, threads.weaken2, server_to_execute_hack_on, config.log_level)) {
                        log(ns, 1, warning, server_to_execute_hack_on + " failed to start " + "weaken2 (" + threads.weaken2 + ") -> " + JSON.stringify(ns.getServer(server_to_execute_hack_on)))
                        counter++
                    }

                    /*counter++
                    if (counter >= counterLimit) { //TEMP!
                        ns.exit()
                    }*/


                } catch (error) {
                    common.log(ns, config.log_level, common.error, "'" + server_to_execute_hack_on + "' cannot exec " + JSON.stringify(threads) + " (" + server_ram + ")")
                    ns.exit()
                }
                break
            default:
                common.log(ns,config.log_level, common.error, "executeBatch - Unhandled type: " + type)
                //stop the script
                ns.exit()
        }
        //set wait time for next execute
        this.wait = ((Object.keys(threads).length + 0) * config.delay_between_scripts)
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
    //write data to port
    common.over_write_port(ns, common.port.hack, header + ", " + value)
    //common.over_write_port(ns, common.port.hack, value)
    //TODO: properly fix
}

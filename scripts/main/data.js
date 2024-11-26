//requirements to be fulfilled
export const requirements = {
    karma_for_gang: -54000, //-54k
    kills_for_factions: 30,
    faction_netburners: { 
        levels: 100,
        ram: 8,
        cores: 4,
    },
}



//from https://github.com/bitburner-official/bitburner-src/blob/dev/src/Hacknet/data/HashUpgradesMetadata.tsx
export const hash_upgrades = {
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



/**
 * Enum stating special augments
 */
export const augments = {
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
export const activities = {
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
export const crimes = {
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
export const crime_focus = {
    karma: "karma",
    kills: "kills",
    skills: "skills",
    hacking: "hacking",
}



/**
 * Enum that describes the companies we want to join, and the faction behind it
 * Only fulcrum has a different faction name
 */
export const company_factions = {
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
export const hack_tools = {
    bruteSSH: "BruteSSH.exe",   //500e3
    fTPCrack: "FTPCrack.exe",   //1500e3
    relaySMTP: "relaySMTP.exe", //5e6
    hTTPWorm: "HTTPWorm.exe",   //30e6
    sQLInject: "SQLInject.exe", //250e6
}

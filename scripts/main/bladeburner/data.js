//threshold on which chaos will effect actions (only done when chance for other actions is too low)
export const bladeburner_chaos_threshold = 50

/**
 * enum that holds the bladeburner skills (in priority)
 */
export const bladeburner_skills = {
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
export const bladeburner_actions = {
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
    //available sleeve actions, split just for clarity
    //https://github.com/bitburner-official/bitburner-src/blob/dev/src/PersonObjects/Sleeve/Sleeve.ts#L479
    sleeve: {
        //general actions
        training: "Training",
        recruitment: "Recruitment",
        field_analysis: "Field Analysis",
        diplomacy: "Diplomacy",
        hyperbolic_regeneration_chamber: "Hyperbolic Regeneration Chamber",
        //sleeve unique actions
        infiltrate_synthoids: "Infiltrate synthoids", //add action count to operations and contracts
        support_main_sleeve: "Support main sleeve", //become part of team, like a team member
        take_on_contracts: "Take on contracts", //perform contract work
    },
}



/**
 * Enum that describes the bladeburner actions that sleeves can take
 */
export const sleeve_bladeburner_actions = {
    fieldAnalysis: "Field Analysis",
    recruitment: "Recruitment",
    diplomacy: "Diplomacy",
    infiltratesynthoids: "Infiltrate synthoids",
    supportmainsleeve: "Support main sleeve",
    takeonContracts: "Take on Contracts",
}

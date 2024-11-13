//imports
import { 
    enum_servers, enum_scripts,
    log, info, success, warning, error, fail,
} from "scripts/common.js"



/** @param {NS} ns */
export async function main(ns) {
    
    //get challenge config
    const challenge_flags = JSON.parse(ns.read("challenge.json"))
     //for each challenge
    for (const challenge in challenge_flags) {
        //if challenge is active
        if(challenge_flags[challenge]) {
            //log challenge information
            log(ns, 1, warning, "Challenge parameter: '" + challenge + "' is active (and thus limited / disabled)")
        }
    }
    
    
    
    //get reset info
    const resetInfo = ns.getResetInfo()
    //create filename
    const filenameResetInfo = "resetInfo.json"
    //write data to file
    ns.write(filenameResetInfo, JSON.stringify(resetInfo), "w")
    
    //get bitnode
    const bitNode = resetInfo.currentNode
    //start at level 1
    let level = 1
    //up the level
    if (resetInfo.ownedSF.has(bitNode)) {
        //add the levels of the SF
        level += resetInfo.ownedSF.get(bitNode)
        //if not in 12
        if (bitNode != 12) {
            //cap to 3
            level = Math.min(level, 3)
        }
    }
    const bitNodeMultiplier = ns.getBitNodeMultipliers(bitNode, level)
    //create filename
    const filenameBitNode = "bitNode/" + bitNode + ".json"
    //write data to file
    ns.write(filenameBitNode, JSON.stringify(bitNodeMultiplier), "w")

    const filenameAugmentsOwned = "augmentsOwned.json"
    //write data to file
    ns.write(filenameAugmentsOwned, JSON.stringify(ns.singularity.getOwnedAugmentations(false)), "w")

    log_bit_node_information(ns, bitNodeMultiplier)


    //if not disabled
    if (challenge_flags.disable_stanek != true) {
        //launch main script using jump server (only costs 1,6GB ram instead of this script ram)
        ns.run(enum_scripts.jump, 1,
            enum_scripts.stanekCreate, true) //which script to launch, kill other scripts
    } else {
        //launch directly to main
        //run jumpscript to boot main
        ns.run(enum_scripts.jump, 1, 
        enum_scripts.main, true)
    } 
}

/**
 * Function that logs information to console about the bitnode information
*/
function log_bit_node_information(ns, bit_node_multipliers) {
    //start logging
    log(ns, 1, info, "Bitnode multipliers: ")
    
    //for each multiplier
    for (const key in bit_node_multipliers) {
        //failsafe, if the multiplier doesn't exist in the list
        if(!Object.hasOwn(bit_node_lookup_data, key)) {
            //log error
            log(ns, 1, error, "Muliplier '" + key + "' doesn't exist in the bit_node_lookup_data!")
            //go to next
            continue
        }
        
        //get the value
        const value = bit_node_multipliers[key]
        //get the comparison data
        const lookup_data = bit_node_lookup_data[key]
        //set the default value
        let default_value = 1
        //if there is another default value
        if(Object.hasOwn(lookup_data, "default_value")) {
            default_value = lookup_data["default_value"]
        }
        
        //if value is not default value (use '<>' or '!=' ???)
        if (value != default_value) {
            //if the lookup data has a disabled value
            if(Object.hasOwn(lookup_data, "disabled_value")) {
                //if disabled / limited
                if (value == lookup_data["disabled_value"]) {
                    //log information
                    log(ns, 1, error, key + ": " + value + " (" + lookup_data["disabled_text"] + ")")
                    //go to next key in the loop
                    continue
                }
            }
            
            //either no disabled value (else clause) or value is not disabled value (not used the continue)
            
            //assume negative multiplier
            let log_type = warning
            //check if there is data on positive
            if(Object.hasOwn(lookup_data, "higher_is_better")) {
                //check if it is positive
                if(value > default_value && lookup_data["higher_is_better"]) {
                    //this is positive
                    log_type = success
                }
            }
            //log information
            log(ns, 1, log_type, key + ": " + value)
        }
    }
}

//Value that holds the comparison map, using https://github.com/bitburner-official/bitburner-src/blob/dev/src/BitNode/BitNodeMultipliers.ts
//keys are the keys from getBitNodeMultipliers
const bit_node_lookup_data = {
    //values that can disable / limit features
    CompanyWorkMoney: { higher_is_better: true, disabled_value: 0, disabled_text: "Company work cannot generate money!", }, /** Influences how much money the player earns when completing working their job. */
    CrimeMoney: { higher_is_better: true, disabled_value: 0, disabled_text: "Crime cannot generate money!", }, /** Influences the base money gained when the player commits a crime. */
    HacknetNodeMoney: { higher_is_better: true, disabled_value: 0, disabled_text: "Hacknet cannot generate money or generate hashes!", }, /** Influences the hash rate of Hacknet Servers */
    ManualHackMoney: { higher_is_better: true, disabled_value: 0, disabled_text: "Manual hack cannot generate money!", }, /** Influences how much money can be stolen from a server when the player performs a hack against it through the Terminal */
    ScriptHackMoneyGain: { higher_is_better: true, disabled_value: 0, disabled_text: "Script hack cannot generate money!", }, /** The amount of money actually gained when a script hacks a server. This is different than the above because you can reduce the amount of money but not gain that same amount. */
    CodingContractMoney: { higher_is_better: true, disabled_value: 0, disabled_text: "Coding contracts cannot generate money!", }, /** Influences the amount of money gained from completing Coding Contracts. */
    InfiltrationMoney: { higher_is_better: true, disabled_value: 0, disabled_text: "Infiltrations cannot generate money!" }, /** Influences how much money is gained when the player infiltrates a company. */
    CorporationValuation: { higher_is_better: true, disabled_value: 0, disabled_text: "Corporation valuation is disabled!" }, /** Influences the valuation of corporations created by the player. */
    CorporationSoftcap: { higher_is_better: true, disabled_value: 0, disabled_text: "Corporation is disabled!"}, /** Influences profits from corporation dividends and selling shares. */
    CorporationDivisions: { higher_is_better: true, disabled_value: 0, disabled_text: "Corporation divisions are disabled!" }, /** Influences the amount of divisions a corporation can have at the same time. */
    BladeburnerRank: { higher_is_better: true, disabled_value: 0, disabled_text: "Bladeburner will not rank up, unable to destroy the bitnode using bladeburner!" }, /** Influences how quickly the player can gain rank within Bladeburner. */
    GangSoftcap: { higher_is_better: true, disabled_value: 0, disabled_text: "Gang cannot generate money or respect!" }, /** Influences the respect gain and money gain of your gang. */
    
    FactionPassiveRepGain: { higher_is_better: true, disabled_value: 0, disabled_text: "Passive reputation gain is disabled!" }, /** Influences how much rep the player gains in each faction simply by being a member. */
    PurchasedServerLimit: { higher_is_better: true, disabled_value: 0, disabled_text: "Cannot buy (extra) servers / hacknet nodes!"  }, /** Influences the maximum number of purchased servers you can have */
    
    //??? (either instantly unlocked or locked forever?)
    RepToDonateToFaction: { higher_is_better: true, }, /** Influences the minimum favor the player must have with a faction before they can donate to gain rep. */
    //other values
    AgilityLevelMultiplier: { higher_is_better: true, }, /** Influences how quickly the player's agility level (not exp) scales */
    AugmentationMoneyCost: { }, /** Influences the base cost to purchase an augmentation. */
    AugmentationRepCost: { }, /** Influences the base rep the player must have with a faction to purchase an augmentation. */
    BladeburnerSkillCost: { }, /** Influences the cost of skill levels from Bladeburner. */
    CharismaLevelMultiplier: { higher_is_better: true, },/** Influences how quickly the player's charisma level (not exp) scales */
    ClassGymExpGain: { higher_is_better: true, }, /** Influences the experience gained for each ability when a player completes a class. */
    CompanyWorkExpGain: { higher_is_better: true, }, /** Influences the experience gained for each ability when the player completes working their job. */
    CompanyWorkRepGain: { higher_is_better: true, }, /** Influences how much rep the player gains when performing work for a company. */  
    CrimeExpGain: { higher_is_better: true, }, /** Influences the base experience gained for each ability when the player commits a crime. */
    CrimeSuccessRate: { higher_is_better: true, }, /** Influences the success chance of committing crimes */
    DaedalusAugsRequirement: { default: 30, }, /** Influences how many Augmentations you need in order to get invited to the Daedalus faction */
    DefenseLevelMultiplier: { higher_is_better: true, }, /** Influences how quickly the player's defense level (not exp) scales */
    DexterityLevelMultiplier: { higher_is_better: true, }, /** Influences how quickly the player's dexterity level (not exp) scales */
    FactionWorkExpGain: { higher_is_better: true, }, /** Influences the experience gained for each ability when the player completes work for a Faction. */
    FactionWorkRepGain: { higher_is_better: true, }, /** Influences how much rep the player gains when performing work for a faction or donating to it. */
    FourSigmaMarketDataApiCost: { }, /** Influences how much it costs to unlock the stock market's 4S Market Data API */
    FourSigmaMarketDataCost: { }, /** Influences how much it costs to unlock the stock market's 4S Market Data (NOT API) */
    GangUniqueAugs: { higher_is_better: true, }, /** Percentage of unique augs that the gang has. */
    GoPower: { higher_is_better: true, }, /** Percentage multiplier on the effect of the IPvGO rewards  */
    HackExpGain: { higher_is_better: true, }, /** Influences the experienced gained when hacking a server. */
    HackingLevelMultiplier: { higher_is_better: true, }, /** Influences how quickly the player's hacking level (not experience) scales */
    HackingSpeedMultiplier: { higher_is_better: true, }, /** Influences how quickly the player's hack(), grow() and weaken() calls run */
    HomeComputerRamCost: { }, /** Influences how much money it costs to upgrade your home computer's RAM */
    InfiltrationRep: {  higher_is_better: true, }, /** Influences how much rep the player can gain from factions when selling stolen documents and secrets */
    PurchasedServerCost: { }, /** Influence how much it costs to purchase a server */
    PurchasedServerSoftcap: { higher_is_better: false,  }, /** Influence how much it costs to purchase a server */
    PurchasedServerMaxRam: { higher_is_better: true, }, /** Influences the maximum allowed RAM for a purchased server */
    ScriptHackMoney: { higher_is_better: true, }, /** Influences how much money can be stolen from a server when a script performs a hack against it. */
    ServerGrowthRate: { higher_is_better: true, }, /** Influences the growth percentage per cycle against a server. */
    ServerMaxMoney: { higher_is_better: true, }, /** Influences the maximum money that a server can grow to. */
    ServerStartingMoney: { higher_is_better: true, }, /** Influences the initial money that a server starts with. */
    ServerStartingSecurity: { }, /** Influences the initial security level (hackDifficulty) of a server. */
    ServerWeakenRate: { higher_is_better: true, }, /** Influences the weaken amount per invocation against a server. */
    StrengthLevelMultiplier: { higher_is_better: true, }, /** Influences how quickly the player's strength level (not exp) scales */
    StaneksGiftPowerMultiplier: { higher_is_better: true, }, /** Influences the power of the gift. */
    StaneksGiftExtraSize: { higher_is_better: true, }, /** Influences the size of the gift. */
    WorldDaemonDifficulty: { }, /** Influences the hacking skill required to backdoor the world daemon. */    
}

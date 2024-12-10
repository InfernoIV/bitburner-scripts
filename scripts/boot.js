//common
import * as common from "./common.js"



/** @param {NS} ns */
export async function main(ns) {    
    //TODO: check if getRestInfo is still broken (ownedSF is empty)
    common.log(ns, 1, common.info, "ns.getResetInfo(): " + JSON.stringify(ns.getResetInfo()))
    
    //prepare information to be used later by other functions
    prepare_information(ns)
    
    //if stanek unlocked
    if (common.functionality_available(common.functionality.stanek)) {
        //launch main script using jump server (only costs 1,6GB ram instead of this script ram)
        ns.run(common.scripts.jump, 1,
            common.scripts.stanek_create, true) //which script to launch, kill other scripts
    } else {
        //launch directly to main
        //run jumpscript to boot main
        ns.run(common.scripts.jump, 1, 
        common.scripts.main, true)
    } 
}



/**
 * Function that retrieves information (reset info, bitnode multipliers) and saves it to file
 */
function prepare_information(ns) {  
    //get reset info
    const reset_info = ns.getResetInfo()
    //write data to file
    ns.write(file_reset_info, JSON.stringify(reset_info), "w")

    //get bitnode
    const bit_node = resetInfo.currentNode
    //start at level 1
    let level = 1
    //up the level
    if (resetInfo.ownedSF.has(bit_node)) {
        //add the levels of the SF
        level += resetInfo.ownedSF.get(bit_node)
        //if not in 12
        if (bit_node != 12) {
            //cap to 3
            level = Math.min(level, 3)
        }
    }
    //get the multipliers of this bitnode
    let bit_node_multipliers = dummy_bit_node_multipliers
    //check if we get bit node multipliers (needs bit node 
    if (has_completed_bit_node_level(ns, 5)) {
        //add the actual bitnode multipliers
        bit_node_multipliers = ns.getBitNodeMultipliers(bit_node, level)
    }
    //write data to file
    ns.write(file_bit_node_multipliers, JSON.stringify(bit_node_multipliers), "w")
    //log information
    log_bit_node_information(ns, bit_node_multipliers, reset_info)

    //set to 0 by default
    let num_sleeves = 0
    //check if we have unlocked sleeve
    if(common.functionality_available(common.functionality.sleeve)) {
        //get the actual number
        num_sleeves = ns.sleeve.getNumSleeves()
    }
    //write data to file
    ns.write(file_num_sleeves, JSON.stringify(num_sleeves), "w")
}



/**
 * Function that logs information to console about the bitnode information
*/
function log_bit_node_information(ns, bit_node_multipliers, reset_info) {   
    //get the bitnode
    let bit_node = reset_info.currentNode

    //log information on completed bitnodes
    common.log(ns, 1, common.info, "Completed following bit nodes: " + JSON.stringify(reset_info.ownedSF))
    //log next target bit node
    common.log(ns, 1, common.info, "Next bit node: " + get_next_bit_node(ns))
    
    //set level
    let source_file = 1
    //if we have source file
    if (reset_info.ownedSF.has(bit_node)) {
        //add the owned level to the source file
        source_file += reset_info.ownedSF.get(bit_node)
        //if bitnode is not 12 (which is unlimited)
        if (bit_node != 12) {
            //limit if needed
            source_file = Math.min(source_file, 3)
        }
    }
    //get difficulty
    const difficulty = bit_node_multipliers["WorldDaemonDifficulty"]
    //get default hacking skill required for world deamon
    const world_deamon_hacking_skill_required = 3000
    
    //log bitnode information
    common.log(ns, 1, common.info, "BitNode: " + bit_node + "." + source_file + ", World daemon difficulty: " + difficulty + ", hacking level required: " + (difficulty * world_deamon_hacking_skill_required))
        
    //for each multiplier
    for (const key in bit_node_multipliers) {
        //failsafe, if the multiplier doesn't exist in the list
        if(!Object.hasOwn(bit_node_lookup_data, key)) {
            //log error
            common.log(ns, 1, common.error, "Muliplier '" + key + "' doesn't exist in the bit_node_lookup_data!")
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
            //update the default value
            default_value = lookup_data["default_value"]
        }
        
        //if value is not default value (use '<>' or '!=' ???)
        if (value != default_value) {
            //if the lookup data has a disabled value
            if(Object.hasOwn(lookup_data, "disabled_value")) {
                //if disabled / limited
                if (value == lookup_data["disabled_value"]) {
                    //log information
                    common.log(ns, 1, error, key + ": " + value + " (" + lookup_data["disabled_text"] + ")")
                    //go to next key in the loop
                    continue
                }
            }
            
            //either no disabled value (else clause) or value is not disabled value (not used the continue)
            
            //assume negative multiplier
            let log_type = common.warning
            //check if there is data on positive
            if(Object.hasOwn(lookup_data, "higher_is_better")) {
                //check if it is positive
                if(value > default_value && lookup_data["higher_is_better"]) {
                    //this is positive
                    log_type = common.success
                }
            }
            //log information
            common.log(ns, 1, log_type, key + ": " + value)
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



/**
 * Dummy to return when no access to bit node multipliers
 */
const dummy_bit_node_multipliers = {
    AgilityLevelMultiplier: 1,
    AugmentationMoneyCost: 1,
    AugmentationRepCost: 1,
    BladeburnerRank: 1,
    BladeburnerSkillCost: 1,
    CharismaLevelMultiplier: 1, 
    ClassGymExpGain: 1, 
    CodingContractMoney: 1, 
    CompanyWorkExpGain: 1, 
    CompanyWorkMoney: 1, 
    CompanyWorkRepGain: 1, 
    CorporationDivisions: 1, 
    CorporationSoftcap: 1, 
    CorporationValuation: 1, 
    CrimeExpGain: 1, 
    CrimeMoney: 1, 
    CrimeSuccessRate: 1, 
    DaedalusAugsRequirement: 30, 
    DefenseLevelMultiplier: 1, 
    DexterityLevelMultiplier: 1, 
    FactionPassiveRepGain: 1, 
    FactionWorkExpGain: 1, 
    FactionWorkRepGain: 1, 
    FourSigmaMarketDataApiCost: 1, 
    FourSigmaMarketDataCost: 1, 
    GangSoftcap: 1, 
    GangUniqueAugs: 1, 
    GoPower: 1, 
    HackExpGain: 1, 
    HackingLevelMultiplier: 1, 
    HackingSpeedMultiplier: 1, 
    HacknetNodeMoney: 1, 
    HomeComputerRamCost: 1, 
    InfiltrationMoney: 1, 
    InfiltrationRep: 1, 
    ManualHackMoney: 1, 
    PurchasedServerCost: 1, 
    PurchasedServerLimit: 1,
    PurchasedServerMaxRam: 1,
    PurchasedServerSoftcap: 1, 
    RepToDonateToFaction: 1, 
    ScriptHackMoney: 1, 
    ScriptHackMoneyGain: 1, 
    ServerGrowthRate: 1, 
    ServerMaxMoney: 1, 
    ServerStartingMoney: 1,
    ServerStartingSecurity: 1, 
    ServerWeakenRate: 1, 
    StaneksGiftExtraSize: 0, 
    StaneksGiftPowerMultiplier: 1, 
    StrengthLevelMultiplier: 1, 
    WorldDaemonDifficulty: 1,
}

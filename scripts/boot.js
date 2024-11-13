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
function log_bit_node_information(bit_node_multipliers) {
    for (const multiplier of bit_node_multipliers) {
        //STUB
    }
}

//Value that holds the comparison map, using https://github.com/bitburner-official/bitburner-src/blob/dev/src/BitNode/BitNodeMultipliers.ts
//keys are the keys from getBitNodeMultipliers
const bit_node_information = {
    //Bitnode
    WorldDaemonDifficulty: { default: 1, higher_is_better: false, disabled_value: 0, disabled_text: "" }, /** Influences the hacking skill required to backdoor the world daemon. */
    DaedalusAugsRequirement: { default: 1, higher_is_better: false, disabled_value: 0, disabled_text: "" }, /** Influences how many Augmentations you need in order to get invited to the Daedalus faction */
    CodingContractMoney: { default: 1, higher_is_better: false, disabled_value: 0, disabled_text: "" }, /** Influences the amount of money gained from completing Coding Contracts. */
    ClassGymExpGain: { default: 1, higher_is_better: false, disabled_value: 0, disabled_text: "" }, /** Influences the experience gained for each ability when a player completes a class. */
    InfiltrationMoney: { default: 1, higher_is_better: false, disabled_value: 0, disabled_text: "" }, /** Influences how much money is gained when the player infiltrates a company. */
    InfiltrationRep: { default: 1, higher_is_better: false, disabled_value: 0, disabled_text: "" }, /** Influences how much rep the player can gain from factions when selling stolen documents and secrets */
    //Stats
    AgilityLevelMultiplier: { default: 1, higher_is_better: false, disabled_value: 0, disabled_text: "" }, /** Influences how quickly the player's agility level (not exp) scales */
    DefenseLevelMultiplier: { default: 1, higher_is_better: false, disabled_value: 0, disabled_text: "" }, /** Influences how quickly the player's defense level (not exp) scales */
    DexterityLevelMultiplier: { default: 1, higher_is_better: false, disabled_value: 0, disabled_text: "" }, /** Influences how quickly the player's dexterity level (not exp) scales */
    HackExpGain: { default: 1, higher_is_better: false, disabled_value: 0, disabled_text: "" }, /** Influences the experienced gained when hacking a server. */
    HackingLevelMultiplier: { default: 1, higher_is_better: false, disabled_value: 0, disabled_text: "" }, /** Influences how quickly the player's hacking level (not experience) scales */
    HackingSpeedMultiplier: { default: 1, higher_is_better: false, disabled_value: 0, disabled_text: "" }, /** Influences how quickly the player's hack(), grow() and weaken() calls run */
    StrengthLevelMultiplier: { default: 1, higher_is_better: false, disabled_value: 0, disabled_text: "" }, /** Influences how quickly the player's strength level (not exp) scales */
    //Company
    CompanyWorkExpGain: { default: 1, higher_is_better: false, disabled_value: 0, disabled_text: "" }, /** Influences the experience gained for each ability when the player completes working their job. */
    CompanyWorkMoney: { default: 1, higher_is_better: false, disabled_value: 0, disabled_text: "" }, /** Influences how much money the player earns when completing working their job. */
    CompanyWorkRepGain: { default: 1, higher_is_better: false, disabled_value: 0, disabled_text: "" }, /** Influences how much rep the player gains when performing work for a company. */
    //Faction
    FactionPassiveRepGain: { default: 1, higher_is_better: false, disabled_value: 0, disabled_text: "" }, /** Influences how much rep the player gains in each faction simply by being a member. */
    FactionWorkExpGain: { default: 1, higher_is_better: false, disabled_value: 0, disabled_text: "" }, /** Influences the experience gained for each ability when the player completes work for a Faction. */
    FactionWorkRepGain: { default: 1, higher_is_better: false, disabled_value: 0, disabled_text: "" }, /** Influences how much rep the player gains when performing work for a faction or donating to it. */
    RepToDonateToFaction: { default: 1, higher_is_better: false, disabled_value: 0, disabled_text: "" }, /** Influences the minimum favor the player must have with a faction before they can donate to gain rep. */
    //Augments
    AugmentationMoneyCost: { default: 1, higher_is_better: false, disabled_value: 0, disabled_text: "" }, /** Influences the base cost to purchase an augmentation. */
    AugmentationRepCost: { default: 1, higher_is_better: false, disabled_value: 0, disabled_text: "" }, /** Influences the base rep the player must have with a faction to purchase an augmentation. */
    //Hacking
    ManualHackMoney: { default: 1, higher_is_better: false, disabled_value: 0, disabled_text: "" }, /** Influences how much money can be stolen from a server when the player performs a hack against it through the Terminal */
    ScriptHackMoney: { default: 1, higher_is_better: false, disabled_value: 0, disabled_text: "" }, /** Influences how much money can be stolen from a server when a script performs a hack against it. */
    ScriptHackMoneyGain: { default: 1, higher_is_better: false, disabled_value: 0, disabled_text: "" }, /** The amount of money actually gained when a script hacks a server. This is different than the above because you can reduce the amount of money but not gain that same amount. */
    ServerGrowthRate: { default: 1, higher_is_better: false, disabled_value: 0, disabled_text: "" }, /** Influences the growth percentage per cycle against a server. */
    ServerMaxMoney: { default: 1, higher_is_better: false, disabled_value: 0, disabled_text: "" }, /** Influences the maximum money that a server can grow to. */
    ServerStartingMoney: { default: 1, higher_is_better: false, disabled_value: 0, disabled_text: "" }, /** Influences the initial money that a server starts with. */
    ServerStartingSecurity: { default: 1, higher_is_better: false, disabled_value: 0, disabled_text: "" }, /** Influences the initial security level (hackDifficulty) of a server. */
    ServerWeakenRate: { default: 1, higher_is_better: false, disabled_value: 0, disabled_text: "" }, /** Influences the weaken amount per invocation against a server. */
    //Servers
    HacknetNodeMoney: { default: 1, higher_is_better: false, disabled_value: 0, disabled_text: "" }, /** Influences the hash rate of Hacknet Servers */
    HomeComputerRamCost: { default: 1, higher_is_better: false, disabled_value: 0, disabled_text: "" }, /** Influences how much money it costs to upgrade your home computer's RAM */
    PurchasedServerCost: { default: 1, higher_is_better: false, disabled_value: 0, disabled_text: "" }, /** Influence how much it costs to purchase a server */
    PurchasedServerSoftcap: { default: 1, higher_is_better: false, disabled_value: 0, disabled_text: "" }, /** Influence how much it costs to purchase a server */
    PurchasedServerLimit: { default: 1, higher_is_better: false, disabled_value: 0, disabled_text: "" }, /** Influences the maximum number of purchased servers you can have */
    PurchasedServerMaxRam: { default: 1, higher_is_better: false, disabled_value: 0, disabled_text: "" }, /** Influences the maximum allowed RAM for a purchased server */
    //Crime
    CrimeExpGain: { default: 1, higher_is_better: false, disabled_value: 0, disabled_text: "" }, /** Influences the base experience gained for each ability when the player commits a crime. */
    CrimeMoney: { default: 1, higher_is_better: false, disabled_value: 0, disabled_text: "" }, /** Influences the base money gained when the player commits a crime. */
    CrimeSuccessRate: { default: 1, higher_is_better: false, disabled_value: 0, disabled_text: "" }, /** Influences the success chance of committing crimes */
    //Bladeburner
    BladeburnerRank: { default: 1, higher_is_better: false, disabled_value: 0, disabled_text: "" }, /** Influences how quickly the player can gain rank within Bladeburner. */
    BladeburnerSkillCost: { default: 1, higher_is_better: false, disabled_value: 0, disabled_text: "" }, /** Influences the cost of skill levels from Bladeburner. */
    //Gang
    GangSoftcap: { default: 1, higher_is_better: false, disabled_value: 0, disabled_text: "" }, /** Influences the respect gain and money gain of your gang. */
    GangUniqueAugs: { default: 1, higher_is_better: false, disabled_value: 0, disabled_text: "" }, /** Percentage of unique augs that the gang has. */
    //Corporation
    CorporationDivisions: { default: 1, higher_is_better: false, disabled_value: 0, disabled_text: "" }, /** Influences the amount of divisions a corporation can have at the same time. */
    CorporationSoftcap: { default: 1, higher_is_better: false, disabled_value: 0, disabled_text: "" }, /** Influences profits from corporation dividends and selling shares. */
    CorporationValuation: { default: 1, higher_is_better: false, disabled_value: 0, disabled_text: "" }, /** Influences the valuation of corporations created by the player. */
    //Stocks
    FourSigmaMarketDataApiCost: { default: 1, higher_is_better: false, disabled_value: 0, disabled_text: "" }, /** Influences how much it costs to unlock the stock market's 4S Market Data API */
    FourSigmaMarketDataCost: { default: 1, higher_is_better: false, disabled_value: 0, disabled_text: "" }, /** Influences how much it costs to unlock the stock market's 4S Market Data (NOT API) */
    //Go
    GoPower: { default: 1, higher_is_better: false, disabled_value: 0, disabled_text: "" }, /** Percentage multiplier on the effect of the IPvGO rewards  */
    //Stanek
    StaneksGiftPowerMultiplier: { default: 1, higher_is_better: false, disabled_value: 0, disabled_text: "" }, /** Influences the power of the gift. */
    StaneksGiftExtraSize: { default: 1, higher_is_better: false, disabled_value: 0, disabled_text: "" }, /** Influences the size of the gift. */
}

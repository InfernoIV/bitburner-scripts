# What is considered a reset?
## Types
 * Install augments
   * This converts the bought augments into installed augments 
 * Soft reset
   * No conversion, just a reset to start
 * Bit node destruction
   * Destroys the bit node, allows you to enter another bit node. Technically resets all progress of the bit node.   
## Information
 * https://github.com/bitburner-official/bitburner-src/blob/dev/src/Prestige.ts

# Factions and companies
## Information
 * https://github.com/bitburner-official/bitburner-src/blob/dev/src/Prestige.ts#L56
 * https://github.com/bitburner-official/bitburner-src/blob/dev/src/Prestige.ts#L94
 * https://github.com/bitburner-official/bitburner-src/blob/dev/src/Faction/Faction.ts#L77
 * https://github.com/bitburner-official/bitburner-src/blob/dev/src/Faction/FactionInfo.tsx#L53
 * https://github.com/bitburner-official/bitburner-src/blob/dev/src/Company/Company.ts#L77

## Persists
 * If unlocked company faction: ECorp, MegaCorp, Bachman And Associates, Blade Industries, NWO, Clarke Incorporated, OmniTek Incorporated, Four Sigma, KuaiGong International, Fulcrum Secret Technologies
 * If Stanek's gift was accepted: Church Of The Machine God
 * If infiltrated: Shadows Of Anarchy
 * If enough Bladeburner rank: Bladeburner
 * Favor of factions and companies
## Does no persist
 * All other factions
 * All company work progress
 * Rep from factions and companies is converted to favor

# Player (extended by bit node 5 (intelligence) and 10 (Grafting))
## Information
 * https://github.com/bitburner-official/bitburner-src/blob/dev/src/Prestige.ts#79
 * https://github.com/bitburner-official/bitburner-src/blob/dev/src/PersonObjects/Player/PlayerObjectGeneralMethods.ts#L74
 * https://github.com/bitburner-official/bitburner-src/blob/dev/src/Augmentation/AugmentationHelpers.ts#L66
 * https://github.com/bitburner-official/bitburner-src/blob/dev/src/Augmentation/Augmentations.ts#L322
## Persists
 * Augmentations
 * Intelligence stat
 * Karma stat
 * if specific augments are installed: hacking programs
   * CashRoot: BruteSSH 
   * Neurolink: ftpCrack and relaySmt
## Does no persist   
 * Money
 * Player actions
   * Grafting progress (should be finished before reset)
 * Stats (hacking, strength, defense, dexterity, agility, charisma)
 * Number of people killed
 * City and location in city

# Stock (Extended by bit node 8)
## Information
   * 
## Persists
   * Api's
## Does not persist
   * Stocks

# Hacknet (Extended by bit node 9)
## Information
 * https://github.com/bitburner-official/bitburner-src/blob/dev/src/Prestige.ts#70
 * https://github.com/bitburner-official/bitburner-src/blob/dev/src/Server/AllServers.ts#L192
 * https://github.com/bitburner-official/bitburner-src/blob/dev/src/PersonObjects/Player/PlayerObjectGeneralMethods.ts#L126
## Persists
 * Home server
## Does not persist
 * Bought servers
 * Network progress (rooted and backdoored server(s))
   
# Gang (Bit node 2)
## Information
 * https://github.com/bitburner-official/bitburner-src/blob/dev/src/Prestige.ts#L119
 * https://github.com/bitburner-official/bitburner-src/blob/dev/src/Gang/data/Constants.ts#L16
## Persists
 * Gang member(s)
   * But stats get a 5% penalty 
 * Territory
## Does not persist
 * None

# Corporation (Bit node 3)
## Information
* 
## Persists
* Divisions
* Products
## Does not persist
 * None

# Bladeburner (Bit node 6, 7)
## Information
 * https://github.com/bitburner-official/bitburner-src/blob/dev/src/Prestige.ts#L143
 * https://github.com/bitburner-official/bitburner-src/blob/dev/src/Bladeburner/Bladeburner.ts#L220
## Persists
 * Skills
 * Skill points
 * Black Op progress
## Does not persist
 * Bladeburner stats (derived from player stats)
## To be checked
 * Team members
   
# Sleeve (Bit node 10)
## Information
 * 
## Persists
 * Augments
## Does not persist
 * Stats
 * Sleeve actions
  
## Stanek (Bit node 13)
## Information
 * https://github.com/bitburner-official/bitburner-src/blob/dev/src/Prestige.ts#L114
 * https://github.com/bitburner-official/bitburner-src/blob/dev/src/CotMG/StaneksGift.ts#L232
## Persists
 * Placement of fragments
## Does not persist
 * Charges (and effects)


## GO (Bit node 14)
## Information
 * https://github.com/bitburner-official/bitburner-src/blob/dev/src/Prestige.ts#68
 * https://github.com/bitburner-official/bitburner-src/blob/dev/src/Go/Go.ts#L16
## Persists
 * ???
## Does not persist
 * ???

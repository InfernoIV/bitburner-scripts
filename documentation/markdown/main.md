[Index](./index.md) &gt; [main.js](./main.md)

# Code
[main.js](/scripts/main.js)

# Ram cost
Base cost 1.6 GB + references  GB =  GB

# Description
The purpose of this script is to manage the progression of the game and launch other scripts that can assist.

# Parameters
None

# Steps
* Init
* Main loop:
  1. manageFactions (Manages joining of factions)
  2. manageCompanies (Manages joining of factions)
  3. manageServers (manages 
  4. manageHacking (manages 
  5. manageScripts
  6. manageActions
  7. manageDestruction
  8. manageReset
  9. manageAugments

## Init
* Disable logs
* kill all other scripts (still needed?)
* get reset info
* log bitnode information
* stop hack manager
* set callback to clear UI data on exit

## manageFactions 
* Function that tries to join every faction possible, without checking
* Checks which city faction group is joined
* Sets target to travel to city (to join city faction)
* Checks stats of player and factions that requires stats: if faction can be joined: set target to travel to city (to join that faction)
* If there is need to travel: travel to city
* for every faction: try to join faction

## manageCompanies
* Function that manages the joining of companies
* for every company that has a faction, apply to company

## manageServers
* Function that manages buying and upgrading of servers
* Also takes care of Faction Netburner requirements
* Upgrade home RAM
* Purchase hacknet nodes
* Upgrade RAM of nodes
* Get stats of the hacknet
* If faction Netburner requirements not met: upgrade cores and/or upgrade level
* Upgrade Home Cores
* Spend hashes on money

## manageHacking
* Function that manages the buying of hacking tools and hacking of servers
* Get player hacking level
* Only try to buy tool when it is usefull (hacking: 50, 100, 300, 400, 725)
* for each server:
  * if no admin rights, just try every hacking tool and nuke
  * if backdoor is not installed, write the hostname to port backdoor, for [backdoor.js](./backdoor.md) to pick up
    
## manageScripts
* Function that manages the launching of scripts
* Gets the money owned
* Adds scripts to launch to queue: [backdoor.js](./backdoor.js), [hack.js](./hack.md)
* If karma for gang is reached: [gang.js](./gang.md)
* If enough money to start corporation: [corporation.js](./corporation.md)
* If enough money to buy stock API: [stock.js](./stock.md)
* If there are scripts in the queue:
  * Check if not already launched
  * Get all servers that can execute scripts
  * Calculate the scriptram
  * For each server:
    * If there is enough RAM:
      * copy script
      * Execute script
      * Add script to list of launched scripts
* Signal hack manager to continue

## manageActions
* Function that determines the best action to take, according to a set priority
* It also handles duplicate actions of sleeves (faction, company)
* Get player activity
* Get action focus
* If hacking is lower than minimum: perform crime (Rob Store) to raise crime
* If karma is higher than needed for gang: perform crime (Mug) to lower karma
* Otherwise:
  * If bladeburner is joined:
    * Work the best bladeburner action possible:
      * If energy > 50%: perform most impactful bladeburner action with 100% chance
      * Else: perform action (fieldAnalysis) to raise energy and chance
  * otherwise (or if augment "bladesSimulacrum" is installed): perform crime (Grand Theft Auto) for stats 
* Get highest shock values of all the sleeves
* If too high shock: shock recovery
* If karma is higher than needed for gang: perform crime (Mug) to lower karma
* If kills is lower than needed for factions: perform crime (homicide) to raise kills
* Otherwise:
  * Work for faction to be able to buy augments
  * Work for companies to unlock company faction
  * Perform crime (Grand Theft Auto) to raise stats


## manageDestruction
* Function that checks if we can destroy the bitnode, always travels to BN 12 (because it is endless)
* Checks if Augment The Red Pill is installed and server worldDaemon is backdoored
* Checks if bladeburner is joined and black ops operationDaedalus is completed
* Kills all other scripts (to ensure RAM)
* Uses [jump.js](./jump.md) to launch [destroyBitNode.js](./destroyBitNode.md)

## manageReset
* Function that checks if we should reset
* If minimal amount of augments has been bought
* And port resest is not blocked
* Tries to buy every augment still possible
* Kills all other scripts
* Uses [jump.js](./jump.md) to launch [reset.js](./reset.md)

## manageAugments
* Function that manages the buying of augments
* If port reset is blocked by "gang" ([gang.js](./gang.md)): this function does nothing
* for every joined faction: for every augment of that faction: if not owned: try to buy
* For each sleeve: for each augments available: try to buy augment

# Notes
* Resets when 4 augments have been bought -> what is the best amount?
* TODO: getResetInfo from file
* TODO: remove stanek information
* TODO: add check for owning of stock API
* TODO: remove action focus (either focussed when karma for gang, or not focussed)

# Shortcuts / ram savings
* Player only performs crime and/or bladeburner
* Sleeves do not perform bladeburner actions, but raise stats and money using crime (saving RAM)
* Buy augments without checking money, rep or pre-requisites
* manageCompanies: blindly apply to company with checking, also works for promotion. Defaulting to software
* manageServers: cache is all spent on money

# References
| Function | Ram | Description |
|  --- | --- | --- |
| [ns.]() | 0 GB |  |

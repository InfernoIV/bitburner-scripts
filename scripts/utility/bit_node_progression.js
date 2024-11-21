//imports
import file_bit_node_progression from "scripts/common.js"



/**
 * Script that writes bitnode progression config to file (JSON)
 * To be read (parsed) by other scripts
 * @param {NS} ns
 */
export async function main(ns) {    
  //bitnode progression configuration
  const bit_node_progression = [
    //complete first bitnode
    { bit_node: 1, level: 1 },

    //automate destruction
    { bit_node: 4, level: 3 },  //complete singularity for low RAM cost

    //unlock functionalities for easier destruction
    { bit_node: 10, level: 1 },   //unlock sleeves for parallel work
    { bit_node: 2, level: 1 },    //unlock gang for money making
    { bit_node: 9, level: 2 },    //add hacknet for starting RAM
    { bit_node: 7, level: 1 },    //unlock bladeburner API
    { bit_node: 6, level: 1 },    //access bladeburner in other bitnodes
    
    //unlock other handy features
    { bit_node: 5, level: 1 },    //unlock intelligence for ???
    { bit_node: 3, level: 1 },    //unlock corporation for money making
    { bit_node: 13, level: 1 },   //unlock stanek's gift
    { bit_node: 8, level: 1 },    //unlock easier stock access for money making
    { bit_node: 14, level: 1 },    //unlock IPvGO cheat api
    
    //finish the bitnodes
    { bit_node: 1, level: 3 },    //finish genesis to increase player multipliers
    { bit_node: 2, level: 3 },    //finish gang to increase crime success rate, crime money, and charisma multipliers
    { bit_node: 3, level: 3 },    //finish corporation to charisma and company salary multipliers
    //bitnode 4 is complete earlier
    { bit_node: 5, level: 3 },    //finish intelligence to hacking related multipliers
    { bit_node: 6, level: 3 },    //complete bladeburner to raise both the level and experience gain rate of all your combat stats
    { bit_node: 7, level: 3 },    //complete bladeburner to increase bladeburners multipliers
    { bit_node: 8, level: 3 },    //complete stock to short stocks and to use limit/stop orders
    { bit_node: 9, level: 3 },    //complete hacknet to unlock highly-upgraded Hacknet Server on bitnode start
    { bit_node: 10, level: 3 },   //complete sleeves to increase number of sleeves
    { bit_node: 11, level: 3 },   //complete company to increase company salary and reputation gain multipliers
    //bitnode 12 is endless
    { bit_node: 13, level: 3 },   //complete CotMG increases the size of Stanek's Gift
    { bit_node: 14, level: 1 },   //complete IPvGO
    
    //always end with Neurflux
    { bit_node: 12, level: 999 },  
  ]
  //write data to file
  ns.write(file_bit_node_progression, JSON.stringify(bit_node_progression), "w")  
}



/*
1 Genesis
  All player multipliers 16%
  All player multipliers 24%
  All player multipliers 28%

2 Gang
  Access to Gang api in other BitNodes, increases your crime success rate, crime money, and charisma multipliers 25%
  increases your crime success rate, crime money, and charisma multipliers 36%
  increases your crime success rate, crime money, and charisma multipliers 42%

3 Corporation
  Access to Corporation api in other BitNodes, increases your charisma and company salary multipliers by 8%
  increases your charisma and company salary multipliers by 12%
  increases your charisma and company salary multipliers by 14%

4 Singularity
  Access to Singularity api in other BitNodes, Singularity functions cost x16
  Singularity functions cost x4
  Singularity functions cost x1

5 Intelligence
  Grants the intelligence stat, unlock getBitNodeMultipliers(), start with Formulas.exe, increase hacking related multipliers by 8%
  increase hacking related multipliers by 12%
  increase hacking related multipliers by 14%

6  Bladeburners
  Access the Bladeburners Division in other BitNodes, raise both the level and experience gain rate of all your combat stats by: 8%
  raise both the level and experience gain rate of all your combat stats by: 12%
  raise both the level and experience gain rate of all your combat stats by: 14%

7 Bladeburners*
  Access to Bladeburners api in other BitNodes, increase bladeburners multipliers by 8%
  increase bladeburners multipliers by 12%
  increase bladeburners multipliers by 14%

8 Stocks
  Permanent access to WSE and TIX API, increases your hacking growth multipliers by: 12%
  Ability to short stocks in other BitNodes, increases your hacking growth multipliers by: 18%
  Ability to use limit/stop orders in other BitNodes, increases your hacking growth multipliers by: 21%

9 Hacknet
  Permanently unlocks the Hacknet Server in other BitNodes, increases hacknet production and reduces hacknet costs by 12%
  You start with 128GB of RAM on your home computer when entering a new BitNode, increases hacknet production and reduces hacknet costs by 18%
  Grants a highly-upgraded Hacknet Server when entering a new BitNode, increases hacknet production and reduces hacknet costs by 21%

10 Sleeve, Grafting
  Sleeve technology, and the Grafting API in other BitNodes. Each level of this Source-File also grants you a Duplicate Sleeve
  Each level of this Source-File also grants you a Duplicate Sleeve
  Each level of this Source-File also grants you a Duplicate Sleeve

11 Company
  company favor increases BOTH the player's salary and reputation gain rate at that company by 1% per favor (rather than just the reputation gain). This Source-File also increases the player's company salary and reputation gain multipliers by 32%, reduces the price increase for every aug bought by 4%
  increases the player's company salary and reputation gain multipliers by 48%, reduces the price increase for every aug bought by 6%
  increases the player's company salary and reputation gain multipliers by 56%, reduces the price increase for every aug bought by 7%

12 NeuroFlux
  Start with NeuroFlux per Source-File 12 level

13 CotMG
  ChurchOfTheMachineGod appears in other BitNodes. Each level of this Source-File increases the size of Stanek's Gift.
  Each level of this Source-File increases the size of Stanek's Gift.
  Each level of this Source-File increases the size of Stanek's Gift.
  
14 IPvGO
  100% increased stat multipliers from Node Power, increases the maximum favor you can gain for each faction from IPvGO to 80
  Permanently unlocks the go.cheat API, increases the maximum favor you can gain for each faction from IPvGO to 100
  25% additive increased success rate for the go.cheat API, increases the maximum favor you can gain for each faction from IPvGO to 120
*/

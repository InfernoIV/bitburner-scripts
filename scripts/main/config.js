//common
import * as common from "scripts/common.js"



//disabled log topics
export const log_disabled_topics = [
  //normal
  "sleep",
  "scan",
  "ftpcrack",
  "brutessh",
  "sqlinject",
  "httpworm",
  "relaysmtp",
  "nuke",
  "scp",
  "exec",
  "killall",
  //singularity
  "singularity.purchaseProgram",
  "singularity.purchaseAugmentation",
  "singularity.joinFaction",
  "singularity.applyToCompany",
  "singularity.purchaseTor",
  "singularity.commitCrime",
  "singularity.travelToCity",
  //hacknet
  "singularity.upgradeHomeRam",
  "singularity.upgradeHomeCores",
  //bladeburner
  "bladeburner.joinBladeburnerDivision",
  "bladeburner.startAction",
  "bladeburner.upgradeSkill",
]

//work area for company work
export const company_work_type = "Software"

//minimum stat for hacking (todo: struct format?)
export const stat_minimum_hacking = 25//50 //?

//set time to wait after each main loop
export const time_between_loops = 1 * 1000

//minimum amount of augments before resetting
export const augments_minimum_for_reset = 4 //to be set to 40 for achievement

//ports to read for ui information
//data: [ header, port number ]
//["", common.port.],
export const ports_to_read_ui = [
  //hack manager
  ["Hack", common.port.ui_hack],
  ["Hack status", common.port.communication_hack_manager],
  //backdoor
  ["Backdoor", common.port.communication_backdoor],
  //gang
  ["Gang", common.port.ui_gang],
  //corporation
  ["Corporation", common.port.ui_corporation],
  //bladeburner
  ["Bladeburner Stamina", common.port.ui_bladeburner_stamina],
  ["Bladeburner Rank", common.port.ui_bladeburner_rank],
  ["Bladeburner Black Ops", common.port.ui_bladeburner_black_ops],
  //hash
  ["Hash bladeburner skill point", common.port.hash_bladeburner_skill_points],
  ["Hash bladeburner rank", common.port.hash_bladeburner_rank],
  ["Hash Corporation funds", common.port.hash_corporation_funds],
  ["Hash Corporation research", common.port.hash_corporation_research],
  //resets
  ["Reset Gang", common.port.reset_gang],
  ["Reset Corporation", common.port.reset_corporation],  
]

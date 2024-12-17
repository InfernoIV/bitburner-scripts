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

//target min chance before attempting bladeburner
export const bladeburner_success_chance_minimum = 1
export const bladeburner_black_op_success_chance_minimum = 0.5

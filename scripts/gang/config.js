//data
import * as data from "./data.js"

//log level
export const log_level = -1

//desired train level (unlimited)
export const desired_training_Level = 200//50
//desired multiplier before stopping training (unlimited)
export const desired_multiplier = 10
//desired equipment before continuing (max 32: 24 combat and 8 hacking)
export const desired_equipment = 15//20 //24 takes too long...

//minimum percentage to start territory clashes 
export const territory_clash_minimum_percentage = 0.55 //55%

//focus of the gang
export const focus = data.focus_area.combat
//gang to join
export const faction_gang = data.factions.slum_snakes

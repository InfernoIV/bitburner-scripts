//common
import * as common from "./common.js"

//maximum number of gang members
export const members_max = 12

//tasks types to be used by functions
export const gang_task = { 
    unassigned: "unassigned",
    lower_wanted: "lowerWanted",
    train_hacking: "trainHacking",
    train_combat: "trainCombat",
    train_charisma: "trainCharisma",
    power: "power",
    //
    reputation: "respect",
    money: "money",
}

//available focus area of the gang
export const focus_area = {
  hacking: "hacking",
  combat: "combat",
}

//available factions that can be joined as a gang
export const factions = {
    //combaat focussed
    slum_snakes: common.factions.slum_snakes.name,
    tetrads: common.factions.tetrads.name,
    the_syndicate: common.factions.the_syndicate.name,
    the_dark_army: common.factions.the_dark_army.name,
    speakers_for_the_dead: common.factions.speakers_for_the_dead.name,
    //hacking focussed
    nite_sec: common.factions.nite_sec.name,
    the_black_hand: common.factions.the_black_hand.name,
}

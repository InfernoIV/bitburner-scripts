//common
import * as common from "./common.js"

//maximum number of gang members
export const members_max = 12

//tasks types to be used by functions
export const gang_task = { 
    //custom
    lower_wanted: "lower wanted", //{ focus_area.hacking: "Ethical Hacking", focus_area.combat: "Vigilante Justice", }, //"lowerWanted",
    
    //
    unassigned: "unassigned",
    train_hacking: "Train Hacking", //"trainHacking",
    train_combat: "Train Combat", //"trainCombat",
    train_charisma: "Train Charisma", //"trainCharisma",
    power: "Territory Warfare", //"power",
    //TODO
    reputation: "respect",
    money: "money",
}

//specific tasks for lowering wanted
export const lower_wanted_action = {
    hacking: "Ethical Hacking",
    combat: "Vigilante Justice",
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

//variable to use to check clash status
export const territory_clash_status = {
    stopped: 0,
    started: 1,
    completed: 2,
}

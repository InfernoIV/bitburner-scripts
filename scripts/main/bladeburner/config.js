import * as data from "./data.js"

//threshold on which chaos needs to be reduces (preventing it from impacting
export const bladeburner_chaos_threshold = data.bladeburner_chaos_value_for_penalty * 0,9 //90%

//success chance for blade burner actions for player
const bladeburner_success_chance_minimum_player = 1

//success chance for blade burner actions for sleeve
const bladeburner_success_chance_minimum_sleeve = 1
//minimum number of actions before generating more number of actions
const bladeburner_minimum_number_of_actions = 2

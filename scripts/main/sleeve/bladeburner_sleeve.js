//stub

/**
 * Function that checks the best work type for bladeburner for sleeve
 * Only perform 100% chance work, else we get shock
 * cannot lower chaos, requires to get city, which increases ram usage
 * @param {NS} ns
 * Cost: 0 GB
 */
    /*
function getBladeburnerActionForSleeve(ns, sleeveIndex) {
    //set min chance = 100%
    const bladeburner_success_chance_minimum = 1
    //describe other actions
    const enum_sleeveBladeburnerActions = {
        fieldAnalysis: "Field Analysis",
        infiltratesynthoids: "Infiltrate synthoids",
    }

    //keep track of action count
    let bladeburner_total_action_count = 0

    //contracts
    //for each contract
    for (const operation in enum_bladeburnerActions.contracts) {
        //get contract information
        const contract = enum_bladeburnerActions.contracts[operation]
        //get action count
        const action_count = ns.bladeburner.getaction_countRemaining(enum_bladeburnerActions.type.contracts, contract)
        //get chance
        const chance = ns.bladeburner.getActionEstimatedSuccessChance(enum_bladeburnerActions.type.contracts, contract, sleeveIndex)
        //if this action can be performed and we have enough chance
        if ((action_count > 0) && (chance[0] >= bladeburner_success_chance_minimum)) {
            //return this information
            return { type: enum_sleeveBladeburnerActions.takeonContracts, name: contract }
        }
        //add count to total actions available
        bladeburner_total_action_count += action_count
    }

    //if no operations or contracts available
    if (bladeburner_total_action_count == 0) {
        //set to create contracts
        return { type: enum_bladeburnerActions.type.general, name: enum_bladeburnerActions.general.inciteViolence }
    }

    //failsafe: just train
    return { type: enum_bladeburnerActions.type.general, name: enum_bladeburnerActions.general.training }
}
*/

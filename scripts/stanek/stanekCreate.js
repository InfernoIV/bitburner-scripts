//imports
import { 
  enum_port, enum_servers, enum_scripts,
  log, info, success, warning, error, fail,
} from "scripts/common.js"


/** 
 * Script that will manage the placement of Stanek fragments
 * @param {NS} ns 
*/
export async function main(ns) {
    //CotMG faction
    const faction = "Church of the Machine God"
    ns.stanek.acceptGift()
    ns.singularity.joinFaction(faction)
    
  
  /*
   //Stanek
    const stanek = {
        "Power multiplier": bit_node_multipliers.StaneksGiftPowerMultiplier,
        "Extra size": bit_node_multipliers.StaneksGiftExtraSize,
    }
    //set base size
    let stanekBaseSize = 9 + stanek["Extra size"]
    //update stanek information
    if (reset_info.ownedSF.has(13)) {
        //each level grants a additional size
        stanekBaseSize += reset_info.ownedSF.get(13)
    }
    //from return Math.max(2, Math.min(Math.floor(this.baseSize() / 2 + 1), StanekConstants.MaxSize));
    //calculate width
    stanek_grid.width = Math.max(2, Math.min(Math.floor(stanekBaseSize / 2 + 1), 25))
    //calculate height 
    stanek_grid.height = Math.max(3, Math.min(Math.floor(stanekBaseSize / 2 + 0.6), 25))
    //check log type
    logType = info
    if (stanek["Power multiplier"] < 1 || stanek["Extra size"] < 1) {
        logType = warning
        if (stanek_grid.width <= 0 || stanek_grid.height <= 0) {
            logType = error
        }
    }
    message = "Stanek's Gift: "
    for (const key in stanek) {
        const value = stanek[key]
        if (value < 1 || value > 1 || key == "Extra size") {
            if (message != "Stanek's Gift: ") {
                message += ", "
            }
            if (key == "Extra size") {
                message += key + ": " + value
            } else {
                message += key + ": " + value * 100 + "%"
            }
        }
    }
    message += ", total width: " + stanek_grid.width + ", total height: " + stanek_grid.height
    log(ns, 1, logType, message)
  */
      
  //if not joined
    /*
    if(ns.getPlayer().factions.indexOf(faction) == -1) {
        ns.singularity.travelToCity("Chongqing")
        ns.singularity.goToLocation(ns.enums.LocationName.ChongqingChurchOfTheMachineGod)
        
        //try to join stanek
        if(ns.singularity.joinFaction(faction)) {
            ns.tprint("SUCCESS" + " Joined " + faction + "!")
        }
    }*/
    
    //if we can place fragments (faction COTMG is joined)
    if (ns.getPlayer().factions.indexOf(faction) > -1) {
        ns.tprint("ActiveFragments: " + ns.stanek.activeFragments().length)
        //if not yet created a layout
        if (ns.stanek.activeFragments().length == 0 ) {
            ns.tprint("Current node: " + ns.getResetInfo().currentNode)
            //hardcoded for 5x6 using excel and https://github.com/bitburner-official/bitburner-src/blob/dev/src/CotMG/Fragment.ts
            //TODO: what is the rootX and rootY position? Top left position, even if it is 'false'?

            //create list to fill
            let fragmentList = []
            //placeFragment(rootX: number, rootY: number, rotation: number, fragmentId: number): boolean
            //fill depending on bitnode focus
            switch (ns.getResetInfo().currentNode) {
                //2x3
                case 8:     //Stocks
                    break

                //3x3 <-> 4x3
                case 2:     //Gang
                    break

                //4x4 <-> 5x5
                case 10:    //Sleeve, graft
                    break

                //5x4 <-> 6x5
                case 3:     //Corporation
                    break

                //5x5 <->6x6
                case 7:     //Bladeburners
                case 14:    //IPvGO
                    break

                //6x5 <-> 7x6
                case 1:     //Genesis
                case 4:     //Singularity
                case 5:     //Intelligence
                case 11:    //Sleeve, graft
                    break

                //6x6 <-> 7x7
                case 12:    //Neuroflux
                case 13:    //CotMG
                    ns.tprint("6x6 grid")
                    fragmentList.push([3, 3, 0, 12]) //Defense
                    fragmentList.push([3, 1, 0, 105]) //Booster 1 (Tilted W)
                    fragmentList.push([3, 0, 0, 30]) //Bladeburner
                    fragmentList.push([1, 2, 0, 100]) //Booster 2 (Shifted T)

                    fragmentList.push([0, 0, 1, 16]) //Agility
                    fragmentList.push([1, 0, 0, 10]) //Strength
                    fragmentList.push([0, 2, 1, 14]) //Dexterity
                    
                    
                    break

                //7x6 <-> 8x7
                case 6:     //Bladeburners
                case 9:     //Hacknet
                    break
            }

            //for each fragment
            for (let fragmentInfo of fragmentList) {
                const x = fragmentInfo[0]
                const y = fragmentInfo[1]
                const rotation = fragmentInfo[2]
                const id = fragmentInfo[3]
                //place fragment
                if(!ns.stanek.placeFragment(x, y, rotation, id)) {
                    ns.tprint("ERROR " + fragmentInfo)
                    ns.run(enum_scripts.jump, 1, enum_scripts.main)
                    return
                }
            }
        }
    }
    
    //run jumpscript to boot main
    ns.run(enum_scripts.jump, 1, enum_scripts.stanekCharge)
}


/**
 * Enum describing the fragment types
 * Only used ones are: bladeburner, stats, hacking speed, hacking chance and booster
 */
/*
const enum_fragmentType = {
    hackingChance: 2,
    hackingSpeed: 3,    //1x T
    hackingMoney: 4,    //1x I
    hackingGrow: 5,     //1x J
    hacking: 6,         //1x S, 1x Z, 
    strength: 7,        //1x T
    defense: 8,         //1x L
    dexterity: 9,       //1x L
    agility: 10,        //1x S
    charisma: 11,       //1x S
    hacknetMoney: 12,   //1x I
    hacknetCost: 13,    //1x O
    rep: 14,            //1x J
    workMoney: 15,      //1x J
    crime: 16,          //1x L
    bladeburner: 17,    //1x S
    booster: 18,
    */
    /*
        T               I                   O           L               J               S               Z
        [X, X, X],      [X, X, X, X],       [X, X],     [_, _, X,],     [X, _, _,],     [_, X, X,],     [X, X, _,],
        [_, X, _],                          [X, X],     [X, X, X,],     [X, X, X,],     [X, X, _,],     [_, X, X,],

    */

    /*
        [_, X, X],      [X, X, X, X],       [_, X, X, X],       [X, X, X, _],       [_, X, X],      [_, _, X],      [X, _, _],      [_, X, _],
        [X, X, _],      [X, _, _, _],       [X, X, _, _],       [_, _, X, X],       [_, X, _],      [_, X, X],      [X, X, X],      [X, X, X],
        [_, X, _],                                                                  [X, X, _],      [X, X, _],      [X, _, _],      [_, X, _],

    */
//}



/**
 * Enum describing the shapes
 */
/*
const enum_shape = {
    o: {
        0: [
            [true, true],
            [true, true],
        ],
    },
    i: {
        0: [[true, true, true, true]],
        1: [
            [true],
            [true],
            [true],
            [true]
        ],
    },
    l: {
        0: [
            [false, false, true],
            [true, true, true],
        ],
        1: [
            [true, false],
            [true, false],
            [true, true],
        ],
        2: [
            [true, true, true],
            [true, false, false],
        ],
        3: [
            [true, true],
            [false, true],
            [false, true],
        ],
    },
    j: {
        0: [
            [true, false, false],
            [true, true, true],
        ],
        1: [
            [true, true],
            [true, false],
            [true, false],
        ],
        2: [
            [true, true, true],
            [false, false, true],
        ],
        3: [
            [false, true],
            [false, true],
            [true, true],
        ],
    },
    s: {
        0: [
            [false, true, true],
            [true, true, false],
        ],
        1: [
            [true, false],
            [true, true],
            [false, true],
        ],
    },
    z: {
        0: [
            [true, true, false],
            [false, true, true],
        ],
        1: [
            [false, true],
            [true, true],
            [true, false],
        ],
    },
    t: {
        0: [
            [true, true, true],
            [false, true, false],
        ],
        1: [
            [false, true],
            [true, true],
            [false, true],
        ],
        2: [
            [false, true, false],
            [true, true, true],
        ],
        3: [
            [true, false],
            [true, true],
            [true, false],
        ],
    }
}


*/

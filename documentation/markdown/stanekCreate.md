[Index](./index.md) > [stanekCreate.js](./stanekCreate.md)

# Code
[stanekCreate.js](/scripts/stanekCreate.js)

# Ram cost
Base cost 1.6 GB + references  GB =  GB

# Description
Script that fills up the stanek board

# Parameters
None

# Steps
* Accept Stanek gift
* Join faction Church of the Machine God 
* Only create a layout when none is formed
* Select layout depending on layout -> should be on layout size
* place fragments according to layout
* Use [jump.js](./jump.md) to launch [stanekCharge.js](./stanekCharge.md)

# Notes
* Not using any calculations, using hardcoded grids and layouts
* File contains fragment types and shapes -> to move to this file

# Shortcuts / ram savings
* hardcoded grids

# References
| Function | Ram | Description |
|  --- | --- | --- |
| [ns.stanek.acceptGift](https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.stanek.acceptgift.md) | 2 GB | Accept Stanek's Gift by joining the Church of the Machine God |
| [ns.singularity.joinFaction](https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.singularity.joinfaction.md) | 3 GB | Join a faction |
| [ns.getPlayer](https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.ns.getplayer.md) | 0.5 GB | Get information about the player |
| [ns.stanek.activeFragments](https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.stanek.activefragments.md) | 5 GB | List of fragments in Stanek's Gift |
| [ns.tprint](https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.ns.tprint.md) | 0 GB | Prints one or more values or variables to the Terminal |
| [ns.getResetInfo](https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.ns.getresetinfo.md) | 1 GB | Get information about resets |
| [ns.stanek.placeFragment](https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.stanek.placefragment.md) | 5 GB | Place fragment on Stanek's Gift. |
| [ns.run](https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.ns.run.md) | 1 GB | Start another script on the current server |

# Shapes
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

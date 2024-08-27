# Information
This repo will host the code used in my game of Bitburner.

# Downloading code
If you manually run `nano git-pull.js` in the terminal and copy the contents of the script from github to the bitburner editor, you should be able to run it once and download the rest of the files. 
Early-game, many will be useless because they are only enabled by late-game features, but they shouldn't give you too many problems just being there.

# Usage
## Aliases
A few handy aliases:
`"alias boot=killall; boot.js"` = command `boot` kills all scripts and starts the boot sequence
`"alias update=scripts/git-pull.js"` = command `update` will get download / update the code from github


## Running the code
The code is build to run with at least 128 GB ram (which is the default starting RAM after bitNode x.y)
Using the alias 'boot' mentioned above, or the script 'boot.js' will launch the boot sequence.
The boot sequence is:
1. kill all scripts on all servers, except this one
2. launches the script `StanekCreate.js` which attempts to join the faction Church of the Machine God and fill the grid with the focus on Bladeburner and physical stats
3. launches the script `StanekCharge.js` which will charge each fragment to a certain level
4. launched the script `Main.js`, which will take care of the defined progression:
  * Sequential progress:
    1. Get player hacking to a defined level (hacking > x) :question:
    2. Reach enough karma to unlock gang (karma < y) :question:
    3. Player will work for bladeburner, while sleeves will work on:
      * Factions, if there are augments left for that faction (except NeuroFlux Governor)
      * Companies, if company faction is not unlocked
      * Best Crime, for stats (and money) (determined by the stats, and chance > x) :question:
  * Non-sequential progress:
    * Joins available gangs (and the multual exlusive gangs in a specific order)
    * installs augments if a certain amount of augments are bought
    * Launches sub-scripts if conditions are met:
      * `gang.js` if karma threshold is met (karma < x) :question:
      * `corporation.js` if money threshold is met (money > y) :question:
      * `stocks.js` if money threshold is met (money > z) :question:
      * `destruction.js` if world deamon can be destroyed (either hacking target reached or bladeburner missions finished)

# Scripts
## Main scripts
* `jumpScript.js` kills all other scripts, launches `jump.js`
* `jump.js` launches another script (minimizing ram cost)
* `boot.js` initiates the boot sequence :question:
* `stanekCreate.js` joins the CotMG faction and fills the grid (bitNode 13)
* `stanekCharge.js` charges each component on the grid (bitNode 13)
* `main.js` orchestrates the progression and launching of sub-scripts
  
## Sub scripts
* `gang.js` which creates and manages the gang (bitNode 2)
* `corporation.js` which creates and manages the coropration (bitNode 3)
* `stocks.js` which manages the stock portfolio (bitNode 8)
* `destruction.js` which destroys the bitnode and always goes to bitNode 12, since it is infinite

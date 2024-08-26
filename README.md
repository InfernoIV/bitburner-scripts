# Information
This repo will host the code used in my game of Bitburner.

# Downloading code
If you manually run `nano git-pull.js` in the terminal and copy the contents of the script from github to the bitburner editor, you should be able to run it once and download the rest of the files. 
Early-game, many will be useless because they are only enabled by late-game features, but they shouldn't give you too many problems just being there.

# Usage
## Aliases
A few handy aliases:
`"alias boot=killall; boot.js"` = command `boot` kills all scripts and starts the boot sequence
`"alias update=git-pull.js"` = command `update` will get download / update the code from github


## Running the code
The code is build to run with at least 128 GB ram (which is the default starting RAM after bitNode x.y)
Using the alias 'boot' mentioned above, or the script 'boot.js' will launch the boot sequence.
The boot sequence is:
1. kill all scripts on all servers, except this one
2. launches the script `StanekCreate.js` which attempts to join the faction Church of the Machine God and fill the grid with the focus on Bladeburner
3. launches the script `StanekCharge.js` which will charge each fragment to a certain level
4. launched the script `Main.js`, which will take care of the defined progression:
  * Sequential progress:
    1. Get player hacking to a defined level
    2. Reach enough karma to unlock gang
    3. Player will work for bladeburner, while sleeves will work on:
      * Factions, if there are augments left for that faction
      * Companies, if faction is not unlocked
      * Best Crime, for stats (and money)
  * Non-sequential progress:
    * Joins available gangs (and the multual exlusive gangs in a specific order)
    * installs augments if a certain amount of augments are bought
    * Launches sub-scripts if conditions are met:
      * `gang.js` if karma threshold is met
      * `corporation.js` if money threshold is met
      * `stocks.js` if money threshold is met
      * `destruction.js` if world deamon can be destroyed

# Scripts
## Main scripts
* `jumpScript.js` kills all other scripts, launches `jump.js`
* `jump.js` launches another script (minimizing ram cost)
* `boot.js` initiates the boot sequence
* `stanekCreate.js` joins the CotMG faction and fills the grid
* `stanekCharge.js` charges each component on the grid
* `main.js` orchestrates the progression and launching of sub-scripts
  
## Sub scripts
* `gang.js` which creates and manages the gang
* `corporation.js` which creates and manages the coropration
* `stocks.js` which manages the stock portfolio
* `destruction.js` which destroys the bitnode and always goes to bitNode 12, since it is infinite

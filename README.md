# Information
This repo will host the code used in my game of Bitburner
Information used from https://github.com/alainbryden/bitburner-scripts/blob/main/git-pull.js

# Downloading code
If you manually 'nano git-pull.js' from the terminal and copy the contents of that script, you should be able to run it once and download the rest of the files I use. 
Early-game, many will be useless because they are only enabled by late-game features, but they shouldn't give you too many problems just being there.

# Usage
## Aliases
A few handy aliases:
'"alias boot=killall; boot.js"' = 'boot' kills all scripts and starts the boot sequence
'"alias update=git-pull.js"' = 'update' will get all the code from github


## Running the code
The code is build to run with at least 128 GB ram (which is the default starting RAM after bitNode x.y)
Using the alias 'boot' mentioned above, or the script 'boot.js' will launch the boot sequence.
The boot sequence is:
1. kill all scripts on all servers, except this one
2. launches the script 'Stanek.js' which attempts to join the faction Church of the Machine God and fill the grid with the focus on Bladeburner
3. launches the script 'Stanek_charge.js' which will charge each fragment to a certain level
4. launched the main script, which will take care of the defined progression:
  * Sequential progress:
    1. Get player hacking to a defined level
    2. Reach enough karma to unlock gang
    3. Player will work for bladeburner, while sleeves will work on:
      * Faction, if there are augments left for that faction
      * Company, if faction is not unlocked
      * Crime, for money and stats
  * Non-sequential progress:
    * Joins available gangs (and the multual exlusive gangs in a specific order)
    * installs augments if a certain amount of augments are bought
    * Launches sub-scripts if conditions are met:
      * 'Gang.js' if karma threshold is met
      * 'Corporation.js' if money threshold is met
      * 'Stocks.js' if money threshold is met
      * 'Destruction.js' if world deamon can be destroyed

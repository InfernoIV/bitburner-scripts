[Index](./index.md) > [stanekCharge.js](./stanekCharge.md)

# Code
[stanekCharge.js](/scripts/stanekCharge.js)

# Ram cost
Base cost 1.6 GB + references 18.05 GB = 19.65 GB

# Description
Script that will charge all stanek fragments

# Parameters
None

# Steps
* Determine charges (currently 10) -> how to determine best?
* Disable logs
* If fragments can be charged
  * Get available ram
  * Kill all other scripts
  * calculate the number of threads for worker charge
  * charge each fragment according to the first step
    * For each fragment: Start worker charge, wait until message done, go to next fragment    
  * try to buy CotMG augments (TODO: this is also done by stanekBuy script?)
* Use [jump.js](./jump.md) to launch [main.js](./main.js)

# Notes
* buying of fragments now being done by both [stanekCharge.js](./stanekCharge.md) and [stanekBuy.js](./stanekBuy.md) ???
* How to determine the amount of charging?
* How does the chargin scale? Linear?

# Shortcuts / ram savings
* Save as much RAM as possible, to ensure the worker is more efficient
* TODO: optimize RAM savings: makes charging faster
  * ns.killall - can be done earlier?
  * ns.getPlayer - faction information (CotMG) can be saved earlied or provided using args (or this script should be skipped, since if CotMG is not joined: this script doesn't do anything?)
  * ns.singularity.getAugmentationsFromFaction - move to seperate/follow-up script?
  * ns.singularity.purchaseAugmentation - move to seperate/follow-up script?
  * ns.getScriptRam - can be provided as static or as arg?
  * ns.getServerMaxRam - can be provided as arg

# References
| Function | Ram | Description |
|  --- | --- | --- |
| [ns.disableLog](https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.ns.disablelog.md) | 0 GB | Disables logging for the given NS function |
| [ns.getPlayer](https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.ns.getplayer.md) | 0.5 GB | Get information about the player |
| [ns.getScriptRam](https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.ns.getscriptram.md) | 0.1 GB | Get the ram cost of a script |
| [ns.getServerMaxRam](https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.ns.getservermaxram.md) | 0.05 GB | Get the maximum amount of RAM on a server |
| [ns.killall](https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.ns.killall.md) | 0.5 GB | Terminate all scripts on a server |
| [ns.readPort](https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.ns.readport.md) | 0 GB | Read data from a port |
| [ns.run](https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.ns.run.md) | 1 GB | Start another script on the current server |
| [ns.singularity.getAugmentationsFromFaction](https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.singularity.getaugmentationsfromfaction.md) | 5 GB | Get a list of augmentation available from a faction |
| [ns.singularity.purchaseAugmentation](https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.singularity.purchaseaugmentation.md) | 5 GB | Purchase an augmentation |
| [ns.sleep](https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.ns.sleep.md) | 0 GB | Suspends the script for n milliseconds |
| [ns.stanek.activeFragments](https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.stanek.activefragments.md) | 5 GB | List of fragments in Stanek's Gift |
| [ns.tprint](https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.ns.tprint.md) | 0 GB | Prints one or more values or variables to the Terminal |

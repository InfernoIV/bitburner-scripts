[Index](./index.md) > [stanekBuy.js](./stanekBuy.md)

# Code
[stanekBuy.js](/scripts/stanekBuy.js)

# Ram cost
Base cost 1.6 GB + references 16 GB = 17.6 GB

# Description
Script that tries to buy augments from faction "Church of the Machine God"

# Parameters
None

# Steps
* Get augmentations from faction
* If augmentation is not owned: try to buy
* use [jump.js](./jump.md) to go to [main.js](./main.md)

# Notes
* Faction CotMG gets rep from charging, which is done before this script
* Favor increases the rep gained, so it will increase every loop
* TODO: charge until specific rep / favor / all augments unlocked?

# Shortcuts / ram savings
* This is run as a seperate script after charging, since as much RAM as possible should be allocated to charging

# References
| Function | Ram | Description |
|  --- | --- | --- |
| [ns.singularity.getAugmentationsFromFaction](https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.singularity.getaugmentationsfromfaction.md) | 5 GB | Get a list of augmentation available from a faction |
| [ns.singularity.getOwnedAugmentations](https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.singularity.getownedaugmentations.md) | 5 GB | Get a list of owned augmentation |
| [ns.singularity.purchaseAugmentation](https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.singularity.purchaseaugmentation.md) | 5 GB | Purchase an augmentation |
| [ns.run](https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.ns.run.md) | 1 GB | Start another script on the current server |

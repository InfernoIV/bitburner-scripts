[Index](./index.md) > [reset.js](./reset.md)

# Code
[reset.js](/scripts/reset.js)

# Ram cost
Base cost 1.6 GB + references 15 GB = 16.6 GB

# Description
Script that resets by installing augments or soft reset

# Parameters
None

# Steps
* Calculate the augments bought
* Either installs augments or soft resets: start [boot.js](/scripts/boot.js)

# Notes
-

# Shortcuts / ram savings
* By placing this in an external script, it saves 15 GB RAM

# References
| Function | Ram | Description |
|  --- | --- | --- |
| [ns.singularity.getOwnedAugmentations](https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.singularity.getownedaugmentations.md) | 5 GB | Get a list of owned augmentation |
| [ns.singularity.installAugmentations](https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.singularity.installaugmentations.md) | 5 GB | Install your purchased augmentations |
| [ns.singularity.softReset](https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.singularity.softreset.md) | 5 GB | Soft reset the game |

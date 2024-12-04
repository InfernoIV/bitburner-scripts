[Index](./index.md) > [farmIntelligence.js](./farmIntelligence.md)

# Code
[farmIntelligence.js](/scripts/farmIntelligence.js)

# Ram cost
Base cost 1.6 GB + references 11 GB = 12.6 GB

# Description
Script that will farm intelligence, to be run after all company factions are joined for maximum effect

# Parameters
None

# Steps
* Join every faction available
* Soft reset

# Notes
* Requires manual execution
* It looks like that it isn't doing anything, but that is due to resetting at a high frequency
* Every faction that is joined after reset gives intelligence EXP

# Shortcuts / ram savings
None

# References
| Function | Ram | Description |
|  --- | --- | --- |
| [ns.singularity.checkFactionInvitations](https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.singularity.checkfactioninvitations.md) | 3 GB | List all current faction invitations |
| [ns.singularity.joinFaction](https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.singularity.joinfaction.md) | 3 GB | Join a faction |
| [ns.singularity.softReset](https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.singularity.softreset.md) | 5 GB | Soft reset the game |

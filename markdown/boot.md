[Index](./index.md) > [boot.md](./boot.md)

# Code
[boot.js](/scripts/boot.js)

# Ram cost
Base cost 1.6 GB + references 6 GB = 7.6 GB

# Description
Script that handles the startup sequence, saving other scripts on RAM

# Parameters
None

# Steps
* Retrieves resetInfoand saves it to file (to save other script 1 GB RAM)
* Retrieves bitNodeMultipliers and saves it to file (to save other script 4 GB RAM)
* Starts next script, using [jump.js](./jump.md) script: [stanekCreate.js](./stanekCreate.md)

# References
| Function | Ram | Description |
|  --- | --- | --- |
| [ns.getBitNodeMultipliers](https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.ns.getbitnodemultipliers.md) | 4 GB | Get the current BitNode multipliers |
| [ns.getResetInfo](https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.ns.getresetinfo.md) | 1 GB | Get information about resets |
| [ns.run](https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.ns.run.md) | 1 GB | Start another script on the current server |
| [ns.write](https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.ns.write.md) | 0 GB | Write data to a file |

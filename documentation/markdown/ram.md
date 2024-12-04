[Index](./index.md) > [ram.js](./ram.md)

# Code
[ram.js](/scripts/ram.js)

# Ram cost
Base cost 1.6 GB + references  GB =  GB

# Description
Script that print the RAM of different scripts

# Parameters
None

# Steps
* Get RAM of the Home server
* Get RAM of [jumpScript.s](./jumpScript.md)
* Get RAM of [main.js](./main.md)
* Print the RAM information

# References
| Function | Ram | Description |
|  --- | --- | --- |
| [ns.getScriptRam](https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.ns.getscriptram.md) | 0.1 GB | Get the ram cost of a script |
| [ns.getServerMaxRam](https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.ns.getservermaxram.md) | 0.05 GB | Get the maximum amount of RAM on a server |
| [ns.tprint](https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.ns.tprint.md) | 0 GB | Prints one or more values or variables to the Terminal |

[Index](./index.md) > [jumpScript.js](./jumpScript.md)

# Code
[jumpScript.js](/scripts/jumpScript.js)

# Ram cost
Base cost 1.6 GB + references 1.5 GB = 3.1 GB

# Description
Script that can kill all other scripts on home, and then launches other script

# Parameters
|  Number | Name | Description | Optional |
|  --- | --- | --- | --- |
| 0 | script | Name of the script to launch | Mandatory |
| 1 | killAll | Boolean to kill all other scripts on Home server | Optional |
| 2 | arg1 | Argument 1 to pass to script | Optional |
| 3 | arg2 | Argument 2 to pass to script | Optional |

# Steps
* Read arguments
* Optional: kill all scripts on Home server
* Launches [jump.js](./jump.md) to launch the script defined by parameter 0

# References
| Function | Ram | Description |
|  --- | --- | --- |
| [ns.args](https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.ns.args.md) | 0 GB | Arguments passed into the script |
| [ns.killall](https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.ns.killall.md) | 0.5 GB | Terminate all scripts on a server |
| [ns.run](https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.ns.run.md) | 1 GB | Start another script on the current server |
| [ns.tprint](https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.ns.tprint.md) | 0 GB | Prints one or more values or variables to the Terminal |

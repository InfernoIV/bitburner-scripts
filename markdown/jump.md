[Index](./index.md) > [jump.js](./jump.md)

# Code
[jump.js](/scripts/jump.js)

# Ram cost
Base cost 1.6 GB + references 1 GB = 2.6 GB

# Description
Script that launches script on **home server** with parameters.
TODO: why 2 args? Which script uses this?

# Parameters
|  Number | Name | Description | Optional |
|  --- | --- | --- | --- |
| 0 | script | name of the script to launch | Mandatory |
| 1 | arg1 | parameter 1 for the launch script | Optional |
| 2 | arg2 | parameter 2 for the launch script | Optional |

# Steps
Collect arguments and save to variable
Run script with arguments

# References
| Function | Ram | Description |
|  --- | --- | --- |
| [ns.sleep](https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.ns.sleep.md) | 0 GB | Suspends the script for n milliseconds |
| [ns.args](https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.ns.args.md) | 0 GB | Arguments passed into the script | 
| [ns.run](https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.ns.run.md) | 1 GB | Start another script on the current server |  
| [ns.tprint](https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.ns.tprint.md) | 0 GB | Prints one or more values or variables to the Terminal | 

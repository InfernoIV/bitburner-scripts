[Index](./index.md) > [workerHack.js](./workerHack.md)

# Code
[workerHack.js](/scripts/workerHack.js)

# Ram cost
Base cost 1.6 GB + references 0.1 GB = 1.7 GB

# Description
Worker script that executes hack on target server 

# Parameters
|  Number | Name | Description | Optional |
|  --- | --- | --- | --- |
| 0 | targetHostname  | Hostname of the target to grow | Mandatory |
| 1 | delay   | Delay in msec | Optional |
| 2 | threads   | Number of threads | Optional |
| 3 | hostname   | Hostname of the target to grow | Optional |
| 4 | logLevel  | level to log | Optional |

# Steps
* Gather parameters
* hack target

# Notes
* threads is unsed?
* hostname is unused?

# Shortcuts / ram savings
-

# References
| Function | Ram | Description |
|  --- | --- | --- |
| [ns.hack](https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.ns.hack.md) | 0.1 GB | Steal a server's money |
| [ns.tprint](https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.ns.tprint.md) | 0 GB | Prints one or more values or variables to the Terminal |

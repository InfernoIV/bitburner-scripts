[Index](./index.md) > [workerWeaken.js](./workerWeaken.md)

# Code
[workerWeaken.js](/scripts/workerWeaken.js)

# Ram cost
Base cost 1.6 GB + references 0.15 GB = 1.75 GB

# Description
Worker script that executes weaken on target server 

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
* weaken target

# Notes
* threads is unsed?
* hostname is unused?

# Shortcuts / ram savings
-

# References
| Function | Ram | Description |
|  --- | --- | --- |
| [ns.weaken](https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.ns.weaken.md) | 0.15 GB | Reduce a server's security level |
| [ns.tprint](https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.ns.tprint.md) | 0 GB | Prints one or more values or variables to the Terminal |

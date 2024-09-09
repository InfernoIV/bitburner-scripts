[Index](./index.md) > [workerGrow.js](./workerGrow.md)

# Code
[workerGrow.js](/scripts/workerGrow.js)

# Ram cost
Base cost 1.6 GB + references 0.15 GB = 1.75 GB

# Description
Worker script that executes grow on target server 

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
* grow target

# Notes
* threads is unsed?
* hostname is unused?

# Shortcuts / ram savings
-

# References
| Function | Ram | Description |
|  --- | --- | --- |
| [ns.grow](https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.ns.grow.md) | 0.15 GB | Spoof money in a server's bank account, increasing the amount available |
| [ns.tprint](https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.ns.tprint.md) | 0 GB | Prints one or more values or variables to the Terminal |

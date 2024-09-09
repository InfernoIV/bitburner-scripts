[Index](./index.md) > [](./workerCharge.md)

# Code
[workerCharge.js](/scripts/workerCharge.js)

# Ram cost
Base cost 1.6 GB + references 0.4 GB = 2 GB

# Description
Worker script that charges a fragment according to the x and y provided by args 

# Parameters
|  Number | Name | Description | Optional |
|  --- | --- | --- | --- |
| 0 | x | x coordinate of fragment | Mandatory |
| 0 | y | y coordinate of fragment | Mandatory |

# Steps
* Gather x and y coordinate of fragment from parameters
* Charge fragment
* signal completion on portStanek

# Notes
-

# Shortcuts / ram savings
-

# References
| Function | Ram | Description |
|  --- | --- | --- |
| [ns.args](https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.ns.args.md) | 0 GB | Arguments passed into the script |
| [ns.stanek.chargeFragment](https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.stanek.chargefragment.md) | 0.4 GB | Charge a fragment, increasing its power. |
| [ns.writePort](https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.ns.writeport.md) | 0 GB | Write data to a port |

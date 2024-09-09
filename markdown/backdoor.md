[Index](./index.md) > [backdoor.js](./backdoor.md)

# Code
[backdoor.js](/scripts/backdoor.js)

# Ram cost
Base cost 1.6 GB + references 4.2 GB = 5.8 GB

# Description
Script that runs endlessly, wait for port communication to backdoor servers

# Parameters
None, uses port "enum_port.backdoor" from [common.js](./common.md)

# Steps
* Connects to Home server
* Endless loop:
* Checks if there is data on the port, and only continues if there is data
* Connect to target server
* Install backdoor
* Connects back to Home server
* Read port (to remove the hostname)

# References
| Function | Ram | Description |
|  --- | --- | --- |
| [ns.readPort](https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.ns.readport.md) | 0 GB | Read data from a port. |
| [ns.peek](https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.ns.peek.md) | 0 GB | Get a copy of the data from a port without popping it |
| [ns.scan](https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.ns.scan.md) | 0.2 GB | Get the list of servers connected to a server |
| [ns.sleep](https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.ns.sleep.md) | 0 GB | Suspends the script for n milliseconds. |
| [ns.singularity.connect](https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.singularity.connect.md) | 2 GB | Connect to a server |
| [ns.singularity.installBackdoor](https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.singularity.installbackdoor.md) | 2 GB | Run the backdoor command in the terminal |

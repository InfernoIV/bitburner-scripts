[Index](./index.md) > [git-pull](./git-pull.md)

# Ram cost
Base cost 1.6 GB + references 1.2 GB = 2.8 GB

# Description
Script that connects to github, donwloads and overwrites local files

# Parameters
None

# Steps
1. Saves the set flags to variable
2. Creates URL to github
3. For each file: downloads file and overwrites local file
4. Launches [cleanup.js](./cleanup.md) to remove temp files

# References
| Function | Ram | Description |
|  --- | --- | --- |
| [ns.flags](https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.ns.flags.md) | 0 GB | Parse command line flags |
| [ns.getScriptName](https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.ns.getscriptname.md) | 0 GB | Returns the current script name |
| [ns.ls](https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.ns.ls.md) |  0.2 GB | List files on a server |
| [ns.print](https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.ns.print.md) | 0 GB | Prints one or more values or variables to the script’s logs. |
| [ns.run](https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.ns.run.md) | 1 GB | Start another script on the current server |
| [ns.tprint](https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.ns.tprint.md) | 0 GB | Prints one or more values or variables to the Terminal |
| [ns.wget](https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.ns.wget.md) | 0 GB | Download a file from the internet |

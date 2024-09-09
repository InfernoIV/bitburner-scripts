# Description
Script that handles the startup sequence

# Steps
Retrieves [resetInfo](https://github.com/InfernoIV/bitburner-src/blob/dev/markdown/bitburner.ns.getresetinfo.md) and saves it to file (saves 1 GB RAM)

Retrieves [getBitNodeMultipliers](https://github.com/InfernoIV/bitburner-src/blob/dev/markdown/bitburner.ns.getbitnodemultipliers.md) and saves it to file (saves 4 GB RAM)

Starts next script, using [jump.js](./jump.md) script: [stanekCreate.js](./stanekCreate.md)

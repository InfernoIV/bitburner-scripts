[Index](./index.md)

# Scripts
## Progression scripts
|  Package | Description |
|  --- | --- |
|  [main.js](./main.md) |  Script that manages main progression |
|  [backdoor.js](./backdoor.md) |  Script that installs backdoors |
|  [destroyBitNode.js](./destroyBitNode.md) |  Script that destroys the bitnode |
|  [reset.js](./reset.md) |  Script that installs augment and (soft) resets |
|  [stanekBuy.js](./stanekBuy.md) |  Script that tries to buy stanek augments (only rep is needed) |
|  [stanekCharge.js](./stanekCharge.md) |  Script that charges the Stanek fragments |
|  [stanekCreate.js](./stanekCreate.md) |  Script that creates the Stanek layout |
|  [hack.js](./hack.md) |  Script that hacks servers |
|  [boot.js](./boot.md) |  Script that initiates boot sequence |

## Secondary scripts
|  Package | Description |
|  --- | --- |
|  [gang.js](./gang.md) |  Script that manages gang |
|  [corporation.js](./corporation.md) |  Script that manages gang |
stock.js

## Worker scripts
|  Package | Parent | Description | Parameters |
|  --- | --- | --- | --- |
|  [workerCharge.js](./workerCharge.md) | stanekCharge.js | Charges stanek fragments on main server | None |
|  [workerGrow.js](./workerGrow.md) | hack.js | Executes function 'grow()' on external server  | TBD |
|  [workerHack.js](./workerHack.md) | hack.js | Executes function 'hack()' on external server  | TBD |
|  [workerWeaken.js](./workerWeaken.md) | hack.js | Executes function 'weaken()' on external server  | TBD |

## Utilities
|  Package | Description |
|  --- | --- |
|  [jump.js](./jump.md) |  Script that is used to jump to other script |
|  [jumpScript.js](./jumpScript.md) |  Script that executes other script |
|  [common.js](./common.md) |  Library that hold common definitions |
|  [farmIntelligence.js](./farmIntelligence.md) |  Script to run after all company factions are joined, farms intelligence |
|  [ram.js](./ram.md) |  Script that display ram of main script ([main.js](./main.md)) |

## Script management
|  Package | Description |
|  --- | --- |
|  [git-pull.js](./git-pull.md) |  Script that downloads the scripts from github |
|  [cleanup.js](./cleanup.md) |  Script that cleans up after git-pull |

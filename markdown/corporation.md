[Index](./index.md) > [corporation.js](./corporation.md)

# Code
[corporation.js](/scripts/corporation.js)

# Ram cost
Base cost 1.6 GB + references  GB =  GB

# Description
Script that manages the corporation. 
Starts with Agriculture then finished with Tobacco.
TODO: not finished / still broken
TODO: when to go for investments, and how much? Impacted by bitnode multipliers: just get the investments blindly, in a specific point in time?
Keep blocking resets until investment 4 is done? To ensure timings

# Parameters
None

# Steps
* Initialize
  * Clear port: portCorporation
* Create corporation
* Setup Agriculture
  * Start
    1. Expand to Argiculture
    2. Unlock smartSupply
    3. Expand to every city
    4. Buy warehouse for every city
    5. Hire employees: 1,1,1
    6. Set Smart supply and sell options for each city
    7. Buy advert
    8. Upgrade warehouse of each city to 2
    9. Buy upgrades: focuswire 2, neural Accelerators 2, SpeechProcessorImplants 2, nuoptimalNootropicInjectorImplants 2, smartFactories
    10. Hire employees: 2,2,2
    11. Buy materials: 125, 0, 75, 27000
    12. Get Investment 1 (goal: $176e9) //142b is fast stable, originally 210e9 (210b)
  * Improve
    1. Hire employees: 1,1,1,1,5
    2. Buy upgrades: smartFactories 10, smartStorage 10
    3. Upgrade warehouse of each city to 9
    4. Buy Materials: 2675, 96, 2445, 119400
    5. Hire employees: 3, 2, 2, 2
    6. Get Investment 2: $5e12 //5t
  * Finalize
    1. Upgrade warehouse of each city: 18
    2. But materials: 6500, 630, 3750, 84000
* Setup Tobacco
  * startTobacco
    1. Expand industry to Tobacco
    2. Expand cities
    3. Unlock warehouses
    4. Set smartSupply
    5. Hire employees: 8, 9, 5, 8
    6. Hire employees: 1, 1, 1, 1, 5
    7. Buy upgrade: dreamSense 10)
  * createProductTobacco
    1. Create product
    2. Upgrade: Dream Sense 20
    3. Upgrade: Focus Wires 20
    4. Upgrade: NeuralAccelerators 20
    5. Upgrade: Speech Processor Implants 20
    6. Upgrade: Nuoptimal Nootropic Injector Implants 20
    7. Upgrade: ProjectInsight 10
  * createProductTobacco2
    1. Create product
    2. Upgrade: Dream Sense 30
  * getInvestment3
    1. Upgrade: Wilson Analytics 10
    2. Get investment 3: $800e12
  * getInvestment4
    1. Get investment 4: $1e15
  * Go public
    1. Go public
    2. Issue dividends
* Manage Tobacco (loop)
   1. Try to buy upgrade Wilson Analytics
   2. Buy the cheapest: advert or main office upgrade
   3. Try to upgrade other offices as well
   4. Buy upgrades
   5. Keep soft stats up
   6. buy materials???

# Notes
* Valuation is determined by: ***TODO***

# Shortcuts / ram savings
* Only go for Argiculture and Tobacco, rest doesn't matter
* Accept investment offer without checking??

# References
| Function | Ram | Description |
|  --- | --- | --- |
| [ns.clearPort](https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.ns.clearport.md) | 0 GB | Clear data from a port |
| [ns.corporation.acceptInvestmentOffer](https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.corporation.acceptinvestmentoffer.md) | 20 GB | Accept the investment offer. The value of offer is based on current corporation valuation |
| [ns.corporation.buyMaterial](https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.warehouseapi.buymaterial.md) | 20 GB | Set material buy data |
| [ns.corporation.buyTea](https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.officeapi.buytea.md) | 20 GB | Buy tea for your employees |
| [ns.corporation.createCorporation](https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.corporation.createcorporation.md) | 20 GB | Create a Corporation |
| [ns.corporation.expandCity](https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.corporation.expandcity.md) | 20 GB | Expand to a new city |
| [ns.corporation.expandIndustry](https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.corporation.expandindustry.md) | 20 GB | Expand to a new industry |
| [ns.corporation.getCorporation](https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.corporation.getcorporation.md) | 10 GB | Get corporation data |
| [ns.corporation.getDivision](https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.corporation.getdivision.md) | 10 GB | Get division data |
| [ns.corporation.getHireAdVertCost](https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.officeapi.gethireadvertcost.md) | 10 GB | Get the cost to hire AdVert |
| [ns.corporation.getInvestmentOffer](https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.corporation.getinvestmentoffer.md) | 10 GB | Get an offer for investment based on current corporation valuation |
| [ns.corporation.getMaterial](https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.warehouseapi.getmaterial.md) | 10 GB | Get material data |
| [ns.corporation.getOffice](https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.officeapi.getoffice.md) | 10 GB | Get data about an office |
| [ns.corporation.getOfficeSizeUpgradeCost](https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.officeapi.getofficesizeupgradecost.md) | 10 GB | Get the cost to upgrade an office |
| [ns.corporation.getResearchCost](https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.officeapi.getresearchcost.md) | 10 GB | Get the cost to unlock a research |
| [ns.corporation.getUpgradeLevel](https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.corporation.getupgradelevel.md) | 10 GB | Get the level of a levelable upgrade |
| [ns.corporation.getWarehouse](https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.warehouseapi.getwarehouse.md) | 10 GB | Get warehouse data |
| [ns.corporation.hasCorporation](https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.corporation.hascorporation.md) | 0 GB | Returns whether the player has a corporation. Does not require API access |
| [ns.corporation.hasResearched](https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.officeapi.hasresearched.md) | 10 GB | Check if you unlocked a research |
| [ns.corporation.hasUnlock](https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.corporation.hasunlock.md) | 10 GB | Check if you have a warehouse in city |
| [ns.corporation.hasWarehouse](https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.warehouseapi.haswarehouse.md) | 10 GB | Check if you have a one-time unlockable upgrade |
| [ns.corporation.hireAdVert](https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.officeapi.hireadvert.md) |  20 GB | Hire AdVert |
| [ns.corporation.hireEmployee](https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.officeapi.hireemployee.md) | 20 GB | Hire an employee |
| [ns.corporation.levelUpgrade](https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.corporation.levelupgrade.md) | 20 GB | Level up an upgrade |
| [ns.corporation.makeProduct](https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.warehouseapi.makeproduct.md) | 20 GB | Create a new product |
| [ns.corporation.nextUpdate](https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.corporation.nextupdate.md) | 1 GB | Sleep until the next Corporation update happens |
| [ns.corporation.purchaseUnlock](https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.corporation.purchaseunlock.md) | 20 GB | Unlock an upgrade |
| [ns.corporation.purchaseWarehouse](https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.warehouseapi.purchasewarehouse.md) | 20 GB | Purchase warehouse for a new city |
| [ns.corporation.research](https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.officeapi.research.md) | 20 GB | Purchase a research |
| [ns.corporation.sellMaterial](https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.warehouseapi.sellmaterial.md) | 20 GB | Set material sell data |
| [ns.corporation.sellProduct](https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.warehouseapi.sellproduct.md) | 20 GB | Set product sell data |
| [ns.corporation.setAutoJobAssignment](https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.officeapi.setautojobassignment.md) | 20 GB | Set the job assignment for a job |
| [ns.corporation.setProductMarketTA2](https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.warehouseapi.setproductmarketta2.md) | 20 GB | Set Market-TA2 for a product |
| [ns.corporation.setSmartSupply](https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.warehouseapi.setsmartsupply.md) | 20 GB | Set smart supply |
| [ns.corporation.throwParty](https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.officeapi.throwparty.md) | 20 GB | Throw a party for your employees |
| [ns.corporation.upgradeOfficeSize](https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.officeapi.upgradeofficesize.md) | 20 GB | Upgrade office size |
| [ns.corporation.upgradeWarehouse](https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.warehouseapi.upgradewarehouse.md) | 20 GB | Upgrade warehouse |

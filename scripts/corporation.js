import { log, success, warning, error, info, numberFormatter } from "scripts/log.js"
import { overWritePort, portCorporation, portBlockReset } from "scripts/port.js"
/*
  Script that creates and manages the corporation (Agriculture -> Tobacco)          
*/


/*
import { corporationMoneyRequirement } from "scripts/corporation.js"
*/



//money needed to create corporation
export const corporationMoneyRequirement = 150e9
const researchLeftOverPercentage = 1.1 //10%
const logLevel = 0

/*
Main function
*/
/** @param {NS} ns */
export async function main(ns) {
    //config, but should not be adjusted
    //amount of dividends to be paid to to the player
    const corporationGreed = 0.01 //1%
    //percentage to keep when unlocking researches
    const researchLeftOver = 0.5 //50%
    //define product investments
    const investmentDesign = 1e9 //1b
    const investmentMarketing = 1e9 //1b

    //investments required
    const investment1 = 176e9 //142b is fast stable, originally 210e9 (210b)
    /*
        total money required = 55b + 29b + 29b + 64b (materials not taken into account) = 177b
        upgrade office to 9 of each city (54.674b)
        Hire 6 employees (0)
        Upgrade smart factories to 10 (28.362b)
        Upgrade smart storage to 10 (28.362b)
        upgrade warehouse 7x of each city (63.609b)
        buyMaterials (can go into -money)
    */
    const investment2 = 5e12//5t
    /*
    */
    const investment3 = 800e12//800t
    const investment4 = 1e15//high q?

    //initialize
    init(ns)

    //if no corporation
    if (!ns.corporation.hasCorporation()) {
        //while corporation is not created
        while (!ns.corporation.createCorporation("InfernoIV", true)) {
            //wait a bit
            await ns.sleep(1000)
        }
    }

    //get corporation
    let corp = ns.corporation.getCorporation()

    //if tobacco has not been created yet, then agriculture is not or may not be finished...
    if (corp.divisions.length < 2) {
        //setup agriculture
        await setupAgriculture(ns, investment1, investment2)
    }

    //if the company is not public, then tobacco has not been finished
    if (!corp.public) {
        //setup tobacco
        await setupTobacco(ns, corporationGreed, investmentDesign, investmentMarketing, investment3, investment4)
    }

    //set UI to maintain
    updateUI(ns, success, "Tobacco - Maintain")

    //main loop
    while (true) {
        //maintain tobacco
        await manageTobacco(ns, researchLeftOver, investmentDesign, investmentMarketing)
    }
}



/*
function that sets 1 time things on boot
*/
function init(ns) {
    //disable logs
    //ns.disableLog("disableLog")
    //set counter to amount of products owned
    //productCounter = 0// + ns.corporation.getDivision().products.length

    //clear data
    ns.clearPort(portCorporation)

    //log(ns,1,info,"investment: " + JSON.stringify(ns.corporation.getInvestmentOffer()))
}



/*
function that sets up agriculture
*/
async function setupAgriculture(ns, investment1, investment2) {
    //check where we are with investments
    let investment = ns.corporation.getInvestmentOffer()

    //if investment 1 has not been done
    if (investment.round == 1) {
        //start setup: reach investment 1
        await startAgriculture(ns, investment1)
        //update investment
        investment = ns.corporation.getInvestmentOffer()
    }

    //if investment 2 has not been done
    if (investment.round == 2) {
        //improve setup: reach investment 2
        await improveAgriculture(ns, investment2)
    }

    //finalize setup.
    await finalizeAgriculture(ns)
}



/*
Funtion that takes care of setting up agriculture
*/
async function startAgriculture(ns, targetInvestment) {
    //log information
    updateUI(ns, info, "Agriculture 1.1: expand industry")

    //try to expand to agriculture
    while (ns.corporation.getCorporation().divisions.length < 1) {
        //expand to agriculture
        ns.corporation.expandIndustry(divisionMaterial, divisionMaterial)
        //wait a bit
        await waitUntillNextUpdate(ns, divisionMaterial)
    }

    //log information
    updateUI(ns, info, "Agriculture 1.2: unlock smartSupply")

    //unlock smartSupply
    while (!await buyUnlock(ns, divisionMaterial, unlock.smartSupply)) { }

    //log information
    updateUI(ns, info, "Agriculture 1.3: expand cities")

    //expand to every city
    while (!await expandCities(ns, divisionMaterial)) { }

    //log information
    updateUI(ns, info, "Agriculture 1.4: buy warehouses")

    //check on warehouse exansions
    let ownedWarehouses = 0
    while (ownedWarehouses != citiesAll.length) {
        //reset the value
        ownedWarehouses = 0
        //for each city (should fail once due to starting city)
        for (let city of citiesAll) {
            //buy warehouse
            ns.corporation.purchaseWarehouse(divisionMaterial, city)
            //if a warehouse is owned
            if (ns.corporation.hasWarehouse(divisionMaterial, city)) {
                //add the owned warehouse
                ownedWarehouses++
            }
        }
        //wait a bit
        await waitUntillNextUpdate(ns, divisionMaterial)
    }

    //log information
    updateUI(ns, info, "Agriculture 1.5: hire employees")

    //for each city
    for (let city of citiesAll) {
        //hire employees
        while (!await setEmployees(ns, divisionMaterial, city, 1, 1, 1)) { }
    }

    //log information
    updateUI(ns, info, "Agriculture 1.6: set up supplies")

    //for each city
    for (let city of citiesAll) {
        //set smart supply on
        ns.corporation.setSmartSupply(divisionMaterial, city, true)
        //set produced materials to be sold (MAX/MP)
        ns.corporation.sellMaterial(divisionMaterial, city, material.plants, maxProduction, marketPrice)
        ns.corporation.sellMaterial(divisionMaterial, city, material.food, maxProduction, marketPrice)
    }

    //log information
    updateUI(ns, info, "Agriculture 1.7: post advert")

    //if no adverts have been bought
    while (ns.corporation.getDivision(divisionMaterial).numAdVerts == 0) {
        //buy advert
        ns.corporation.hireAdVert(divisionMaterial)
        //wait a bit
        await waitUntillNextUpdate(ns, divisionMaterial)
    }

    //log information
    updateUI(ns, info, "Agriculture 1.8: upgrade warehouse")

    //for each city
    for (let city of citiesAll) {
        //upgrade warehouse to level 2
        while (! await upgradeWarehouse(ns, divisionMaterial, city, 2)) { }
    }

    //log information
    updateUI(ns, info, "Agriculture 1.9: buy upgrades")

    //buy upgrades
    while (!await buyUpgrade(ns, divisionMaterial, upgrade.focusWires, 2)) { }
    while (!await buyUpgrade(ns, divisionMaterial, upgrade.neuralAccelerators, 2)) { }
    while (!await buyUpgrade(ns, divisionMaterial, upgrade.speechProcessorImplants, 2)) { }
    while (!await buyUpgrade(ns, divisionMaterial, upgrade.nuoptimalNootropicInjectorImplants, 2)) { }
    while (!await buyUpgrade(ns, divisionMaterial, upgrade.smartFactories, 2)) { }

    //log information
    updateUI(ns, info, "Agriculture 1.10: hire more employees")

    //for each city
    for (let city of citiesAll) {
        //hire employees
        while (!await setEmployees(ns, divisionMaterial, city, 2, 2, 2)) { }
    }

    //log information
    updateUI(ns, info, "Agriculture 1.11: buy materials")

    //buy materials
    while (!await buyMaterials(ns, divisionMaterial, 125, 0, 75, 27000)) { }

    //log information
    updateUI(ns, info, "Agriculture 1.12: investment $" + numberFormatter(targetInvestment))

    //wait for investment
    await waitForInvestment(ns, divisionMaterial, targetInvestment)

    //log information
    updateUI(ns, success, "Agriculture 1: complete")
}



/*
Function that improves agriculture
*/
async function improveAgriculture(ns, targetInvestment) {
    //log information
    updateUI(ns, info, "Agriculture 2.1: hire employees")

    //for each city
    for (let city of citiesAll) {
        //hire employees
        while (! await setEmployees(ns, divisionMaterial, city, 1, 1, 1, 1, 5)) { }
    }

    //log information
    updateUI(ns, info, "Agriculture 2.2: buy upgrades")

    //buy upgrades
    while (! await buyUpgrade(ns, divisionMaterial, upgrade.smartFactories, 10)) { }
    while (! await buyUpgrade(ns, divisionMaterial, upgrade.smartStorage, 10)) { }

    //log information
    updateUI(ns, info, "Agriculture 2.3: upgrade warehouse")

    //for each city
    for (let city of citiesAll) {
        //upgrade warehouse to level 9
        while (! await upgradeWarehouse(ns, divisionMaterial, city, 9)) { }
    }

    //log information
    updateUI(ns, info, "Agriculture 2.4: buy materials")

    //buy materials
    while (!await buyMaterials(ns, divisionMaterial, 2675, 96, 2445, 119400)) { }

    //log information
    updateUI(ns, info, "Agriculture 2.5: hire employees")

    //for each city
    for (let city of citiesAll) {
        //hire employees
        while (! await setEmployees(ns, divisionMaterial, city, 3, 2, 2, 2)) { }
    }
    //log information
    updateUI(ns, info, "Agriculture 2.6: investment $" + numberFormatter(targetInvestment))

    //wait for investment
    await waitForInvestment(ns, divisionMaterial, targetInvestment)

    //log information
    updateUI(ns, success, "Agriculture 2: complete")
}



/*
Function that finalized agriculture
*/
async function finalizeAgriculture(ns) {
    //log information
    updateUI(ns, info, "Agriculture 3.1: upgrade warehouse")

    //for each city
    for (let city of citiesAll) {
        //upgrade warehouse to level 18
        while (! await upgradeWarehouse(ns, divisionMaterial, city, 18)) { }
    }

    //log information
    updateUI(ns, info, "Agriculture 3.2: buy material")

    //buy materials
    while (!await buyMaterials(ns, divisionMaterial, 6500, 630, 3750, 84000)) { }

    //log success
    updateUI(ns, success, "Agriculture 3: completed")
}



/*
function that sets up tobacco
*/
async function setupTobacco(ns, corporationGreed, investmentDesign, investmentMarketing, investment3, investment4) {
    //check where we are with investments
    let investment = ns.corporation.getInvestmentOffer()

    //check if prep for product has not been done
    if (ns.corporation.getUpgradeLevel(upgrade.dreamSense) < 10) {
        //start setup
        await startTobacco(ns)
    }

    //if a product has not been created
    if (ns.corporation.getDivision(divisionProduct).products.length < 1) {
        //create product 1
        await createProductTobacco(ns, divisionProduct, investmentDesign, investmentMarketing)
    }

    if (ns.corporation.getDivision(divisionProduct).products.length < 2) {
        //create product 2
        await createProductTobacco2(ns, divisionProduct, investmentDesign, investmentMarketing)
    }

    //if investment 3 is not yet done
    if (investment.round == 3) {
        //wait for investment
        await getInvestment3(ns, investment3)
    }

    //if investment 4 is not yet done
    if (investment.round == 4) {
        //improve setup: reach investment 4
        await getInvestment4(ns, investment4)
    }

    //finalize setup: go public
    await goPublic(ns, corporationGreed)
}



/*
Start setup of tobacco
*/
async function startTobacco(ns) {
    //log information
    updateUI(ns, info, "Tobacco 1.1: expand industry")

    //try to expand to agriculture
    while (ns.corporation.getCorporation().divisions.length < 2) {
        //expand to tobacco
        ns.corporation.expandIndustry(divisionProduct, divisionProduct)
        //wait a bit
        await waitUntillNextUpdate(ns, divisionProduct)
    }

    //log information
    updateUI(ns, info, "Tobacco 1.2: expand cities")
    //expand to every city
    while (!await expandCities(ns, divisionProduct)) { }

    //log information
    updateUI(ns, info, "Tobacco 1.3: unlock warehouses")
    //buy all warehouses
    //check on warehouse exansions
    let ownedWarehouses = 0
    while (ownedWarehouses != citiesAll.length) {
        //reset the value
        ownedWarehouses = 0
        //for each city (should fail once due to starting city)
        for (let city of citiesAll) {
            //buy warehouse
            ns.corporation.purchaseWarehouse(divisionProduct, city)
            //if a warehouse is owned
            if (ns.corporation.hasWarehouse(divisionProduct, city)) {
                //add the owned warehouse
                ownedWarehouses++
            }
        }
        //wait a bit
        await waitUntillNextUpdate(ns, divisionProduct)
    }

    //log information
    updateUI(ns, info, "Tobacco 1.4: set smartSupply")
    //for each city
    for (let city of citiesAll) {
        //set smart supply on
        ns.corporation.setSmartSupply(divisionProduct, city, true)
    }

    //log information
    updateUI(ns, info, "Tobacco 1.5: hire employees")
    //expand Aevum to 30
    while (! await setEmployees(ns, divisionProduct, cityMain, 8, 9, 5, 8)) { }

    //log information
    updateUI(ns, info, "Tobacco 1.6: hire employees")
    //expand other cities to 9
    for (let city of citySupport) {
        //set employees
        while (! await setEmployees(ns, divisionProduct, city, 1, 1, 1, 1, 5)) { }
    }

    //log information
    updateUI(ns, info, "Tobacco 1.5: upgrade D.S.")
    //buy small upgrade, to check progress
    buyUpgrade(ns, divisionProduct, upgrade.dreamSense, 10)

    //log information
    updateUI(ns, success, "Tobacco 1: completed")
}



/*
Function that creates the first product
*/
async function createProductTobacco(ns) {
    //log information
    updateUI(ns, info, "Tobacco 2.1: create product")

    await createProduct(ns, divisionProduct, investmentDesign, investmentMarketing)

    //log information
    updateUI(ns, info, "Tobacco 2.2: upgrade D.S.")
    //upgrade dreamSense (to 10-30?)
    buyUpgrade(ns, divisionProduct, upgrade.dreamSense, 20)
    //upgrade to 20
    //log information
    updateUI(ns, info, "Tobacco 2.3: upgrade F.W.")
    buyUpgrade(ns, divisionProduct, upgrade.focusWires, 20)
    //log information
    updateUI(ns, info, "Tobacco 2.4: upgrade N.A.")
    buyUpgrade(ns, divisionProduct, upgrade.neuralAccelerators, 20)
    //log information
    updateUI(ns, info, "Tobacco 2.5: upgrade S.P.I.")
    buyUpgrade(ns, divisionProduct, upgrade.speechProcessorImplants, 20)
    //log information
    updateUI(ns, info, "Tobacco 2.6: upgrade N.N.I.I.")
    buyUpgrade(ns, divisionProduct, upgrade.nuoptimalNootropicInjectorImplants, 20)
    //upgrade to 10
    //log information
    updateUI(ns, info, "Tobacco 2.7: upgrade P.I.")
    buyUpgrade(ns, divisionProduct, upgrade.projectInsight, 10)

    //log information
    updateUI(ns, success, "Tobacco 2: complete")
}



/*
Fuction that creates the and product
*/
async function createProductTobacco2(ns, investmentDesign, investmentMarketing) {
    //log information
    updateUI(ns, info, "Tobacco 3.1: create product")

    await createProduct(ns, divisionProduct, investmentDesign, investmentMarketing)

    //log information
    updateUI(ns, info, "Tobacco 3.2: upgrade D.S.")
    //upgrade dreamSense (to 10-30?)
    buyUpgrade(ns, divisionProduct, upgrade.dreamSense, 30)

    //log information
    updateUI(ns, success, "Tobacco 3: complete")
}



/*
Function that raises stats while waiting for the investment
*/
async function getInvestment3(ns, targetInvestment) {
    //log information
    updateUI(ns, info, "Tobacco 4.1: upgrade W.A.")

    //get wilson analytics to 10
    while (!await buyUpgrade(ns, divisionProduct, upgrade.wilsonAnalytics, 10)) { }

    //log information
    updateUI(ns, info, "Tobacco 4.2: investment $" + numberFormatter(targetInvestment))

    //wait for investment
    await waitForInvestment(ns, divisionProduct, targetInvestment, true)

    //log information
    updateUI(ns, success, "Tobacco 4: complete")
}



/*
improve setup of Tobacco
*/
async function getInvestment4(ns, targetInvestment) {
    //log information
    updateUI(ns, info, "Tobacco 5.1: investment : $" + numberFormatter(targetInvestment))

    //wait for investment
    await waitForInvestment(ns, divisionProduct, targetInvestment, true)

    //log information
    updateUI(ns, success, "Tobacco 5: complete")
}



/*
finalize setup
*/
async function goPublic(ns, corporationGreed) {
    //log information
    updateUI(ns, info, "Tobacco 6.1: go public")

    //go public
    ns.corporation.goPublic(0)

    //log information
    updateUI(ns, info, "Tobacco 6.2: Issue dividends")
    //set dividends
    ns.corporation.issueDividends(corporationGreed)

    //log success
    updateUI(ns, success, "Tobacco 6: complete")
}



/*
Function that maintains tobacco 
always be making products (if you're controlling the price. If you're using MAX/MP develop to 3 products until Market-TA.II, then always be making products)
Buy Wilson Analytics whenever it's reasonably within reach (x% of money?)
Upgrade size at Aevum, +15 at a time (up to 250-300) OR buy and AdVert.inc, whichever is cheaper
Upgrade size on other cities, keeping Aevum at least 60 ahead: any closer and you're wasting money that you ought to save for the above
level up other upgrades if they are cheap to buy
*/
async function manageTobacco(ns, researchLeftOver, investmentDesign, investmentMarketing) {
    //size to grow the main office
    const growSize = 15
    //max size of the main office
    const maxSize = 300

    //if marketTA2 is unlocked or if less than 3 products are created
    if ((ns.corporation.hasResearched(divisionProduct, research.marketTa2)) || (ns.corporation.getDivision(divisionProduct).products.length < 3)) {
        //create product
        await createProduct(ns, divisionProduct, investmentDesign, investmentMarketing)
    }

    //try to buy Wilson Analytics
    await buyUpgrade(ns, divisionProduct, upgrade.wilsonAnalytics, (ns.corporation.getUpgradeLevel(upgrade.wilsonAnalytics) + 1))

    //check which is more expensive: upgrading Aevum size, or buying an advert
    let advertCost = ns.corporation.getHireAdVertCost(divisionProduct)
    let growCost = ns.corporation.getOfficeSizeUpgradeCost(divisionProduct, cityMain, growSize)
    if ((advertCost < growCost) || (ns.corporation.getOffice(divisionProduct, cityMain).size >= maxSize)) {
        //buy advert
        ns.corporation.hireAdVert(divisionProduct)

        //otherwise hiring people is cheaper (or not hit the max)
    } else {
        //try to grow the office
        manageTobaccoMainOffice(ns, growSize)
    }
    //try to upgrade other offices as well
    manageTobaccoSupportOffices(ns)

    //level up upgrades that are cheap
    manageUpgrades(ns)

    //keep soft stats up
    for (let city of citiesAll) {
        //keep everyone happy
        manageOfficeSoftStats(ns, divisionProduct, city)
        //also for material (?)
        //manageOfficeSoftStats(ns, divisionMaterial, city)
    }

    //await for next update
    await waitUntillNextUpdate(ns, divisionProduct)
}



/*
Function that manages the main office, tries to grow with 15 at a time, up to 250-300
*/
function manageTobaccoMainOffice(ns, growSize) {
    //try to buy without looking
    ns.corporation.upgradeOfficeSize(divisionProduct, cityMain, growSize)
}



/*
Function that grow the support offices
*/
function manageTobaccoSupportOffices(ns) {
    //set constant to determine the max size
    const lessThanMain = 60
    //get the main office size
    let mainOfficeSize = ns.corporation.getOffice(divisionProduct, cityMain).size
    //for each other city
    for (let city of citySupport) {
        //check to grow
        //TODO
    }
}



/*
Function that buys upgrades, when they are cheap (?)
*/
function manageUpgrades(ns) {
    //level up upgrades that are cheap
    //TODO
}



/*
Function that creates a product
*/
async function createProduct(ns, division, investmentDesign, investmentMarketing) {
    //create a name
    let productName = divisionProduct + ns.corporation.getDivision().product.length
    //start product development in Aevum
    ns.corporation.makeProduct(divisionProduct, cityMain, productName, investmentDesign, investmentMarketing)

    //await product development
    //while the product is not in the division product list
    while (ns.corporation.getDivision(divisionProduct).products.indexOf(productName) == -1) {
        //wait a bit
        await waitUntillNextUpdate(ns, division)
    }
    //set selling of the product
    productSellForBestPrice(ns, divisionProduct, cityMain, productName)
}



/*
Function that manages the researches
*/
function unlockResearch(ns) {
    //get the available 
    const researchAvailable = ns.corporation.getDivision(divisionProduct).researchPoints
    const researchLeftOver = researchAvailable * researchLeftOverPercentage

    //set the priority of unlocks
    let researchPriority = [
        //focus on marketTA first
        research.lab,  //5e3, core
        research.marketTa1, //20e3, enables ta2
        research.marketTa2, //50e3, sets the best price automatically
        //then focus on saving money: auto party and auto brew
        research.autoParty, //15e3, auto manages morale
        research.autoBrew,  //12e3, auto manages energy
        //then focus on drugs for employee efficiency
        research.autoDrug, //unlocks drugs
        research.cPH4Inject, //25e3, all stats +10% (except experience)
        research.goJuice, //25e3, energy +10
        //then drones for general efficiency
        research.drones, //5e3, unlocks drones
        research.dronesAssembly, //25e3, production +20%
        research.dronesTransport, //30e3, storage +50%
        //then the rest
        research.overclock,     //15e3, intelligence +25%, efficiency +25%
        research.selfCorrectAssemblers, //25e3, production +10%
        research.stimu, //30e3, morale +10
    ]


    //first do lab, then autoPart and autoBrew

    //for every research we want to use
    for (let researchName of researchPriority) {
        //if not researched yet
        if (!ns.corporation.hasResearched(divisionProduct, researchName)) {
            //if we have enough left over
            if ((researchAvailable - ns.corporation.getResearchCost(divisionProduct, researchName)) > researchLeftOver) {
                //research
                ns.corporation.research(divisionProduct, researchName)

                //if marketTa2, adjust prices of all products
                if (researchName == research.marketTa2) {
                    //for each product
                    for (let product of ns.corporation.getDivision(divisionProduct).products) {
                        //set to use marketTA2
                        ns.corporation.setProductMarketTA2(divisionProduct, product, true)
                    }
                }
            }
            //only (try to) unlock 1 at a time
            return
        }
    }
}



/*
function that sets eployee jobs
checks if enough employees, if not: expands if possible
*/
async function setEmployees(ns, division, city, operations, engineer, business, managment = 0, randD = 0, intern = 0) {
    //description of jobs
    const employeeJob = {
        operations: "Operations",
        engineer: "Engineer",
        business: "Business",
        management: "Management",
        randD: "Research & Development",
        intern: "Intern",
        unassigned: "Unassigned",
    }

    //get total amount of jobs
    let totalJobs = operations + engineer + business + managment + randD + intern
    //get the office
    let office = ns.corporation.getOffice(division, city)
    //set a flag to check later
    let diff = totalJobs - office.size
    //check if we can have the amount of employees
    if (diff > 0) {
        //we need to expand
        ns.corporation.upgradeOfficeSize(division, city, diff)
        //update the office (is this needed?)
        office = ns.corporation.getOffice(division, city)
        //update flag
        diff = totalJobs - office.size
        //check if failed
        if (diff > 0) {
            //wait a bit
            await waitUntillNextUpdate(ns, division)
            //indicate failure
            return false
        }
    }

    //check how much we need to hire
    let numberOfHires = totalJobs - office.numEmployees
    //if we need to hire
    if (numberOfHires > 0) {
        //hire the amount of people
        for (let i = 0; i < numberOfHires; i++) {
            //hire to unassigned, to be assigned later
            ns.corporation.hireEmployee(division, city, employeeJob.unassigned)
        }
        //update the office (is this needed?)
        office = ns.corporation.getOffice(division, city)
        //update people to be hired
        numberOfHires = totalJobs - ns.corporation.getOffice(division, city).numEmployees
        //double check if hiring failed
        if (numberOfHires > 0) {
            //wait a bit
            await waitUntillNextUpdate(ns, division)
            //indicate failure
            return false
        }
    }
    //set all to 0
    ns.corporation.setAutoJobAssignment(division, city, employeeJob.operations, 0)
    ns.corporation.setAutoJobAssignment(division, city, employeeJob.engineer, 0)
    ns.corporation.setAutoJobAssignment(division, city, employeeJob.business, 0)
    ns.corporation.setAutoJobAssignment(division, city, employeeJob.management, 0)
    ns.corporation.setAutoJobAssignment(division, city, employeeJob.randD, 0)
    ns.corporation.setAutoJobAssignment(division, city, employeeJob.intern, 0)

    //set operations
    ns.corporation.setAutoJobAssignment(division, city, employeeJob.operations, operations)
    //set engineer
    ns.corporation.setAutoJobAssignment(division, city, employeeJob.engineer, engineer)
    //set business
    ns.corporation.setAutoJobAssignment(division, city, employeeJob.business, business)
    //set management
    ns.corporation.setAutoJobAssignment(division, city, employeeJob.management, managment)
    //set R&D
    ns.corporation.setAutoJobAssignment(division, city, employeeJob.randD, randD)
    //set intern
    ns.corporation.setAutoJobAssignment(division, city, employeeJob.intern, intern)

    //indicate success
    return true
}



/*
Function to buy upgrades, taking current level into account
*/
async function buyUpgrade(ns, division, upgrade, targetlevel) {
    //check the difference between want and have
    let difference = targetlevel - ns.corporation.getUpgradeLevel(upgrade)
    //for the amount of levels
    for (let i = 0; i < difference; i++) {
        //upgrade
        ns.corporation.levelUpgrade(upgrade)
    }
    //update difference
    difference = targetlevel - ns.corporation.getUpgradeLevel(upgrade)
    //if we did not reach the target
    if (difference > 0) {
        //await next update
        await waitUntillNextUpdate(ns, division)
        //indicate failure
        return false
    }
    //indicate success
    return true
}


/*
Function that buys the unlock, not checking money or already unlocked
Assuming param unlocks was [], now ""
*/
async function buyUnlock(ns, division, unlock) {
    //if not unlocked
    if (!ns.corporation.hasUnlock(unlock)) {
        //buy the unlock
        ns.corporation.purchaseUnlock(unlock)
        //if failed
        if (!ns.corporation.hasUnlock(unlock)) {
            //wait a bit
            await waitUntillNextUpdate(ns, division)
            //indicate failure
            return false
        }
    }
    //indicate success
    return true
}



/*
function that checks if morale, happiness and energy is maxxed, if not: arranges that it is
Buying coffee costs 500k per employeee, and gives +3 energy and halves the difference between max and current
Party: 500k per employee to get at least 5%
*/
function manageOfficeSoftStats(ns, division, city) {

    //get office data
    let office = ns.corporation.getOffice(division, city)
    //describe the number to check for energy
    const thresholdEnergy = office.maxEnergy - 5 //6 is the threshold, we want to act earlier quick and dirty, to be fixed later?
    //describe the number to check for energy
    const thresholdMorale = office.maxMorale - 5 //6 is the threshold, we want to act earlier quick and dirty, to be fixed later?

    //if research of auto brew has not been completed
    if (!ns.corporation.hasResearched(division, research.autoBrew)) {
        //if energy is below the threshold
        if (office.avgEnergy < thresholdEnergy) {
            //TODO: how to determine cost per employee?
            let costPerEmployee = 500000
            //define costs
            let costs = costPerEmployee * office.size

            //buy tea
            if (ns.corporation.buyTea(division, city)) {
                //log information
                log(ns, 0, info, division + ", " + city + ": Bought tea for " + office.size + " employees ($" + numberFormatter(costs) + ")")
            }
        }
    }

    //if research of auto part has not been completed
    if (!ns.corporation.hasResearched(division, research.autoParty)) {
        //if morale is not maxxed
        if (office.avgMorale < thresholdMorale) {
            //TODO: how to determine cost per employee?
            let costPerEmployee = 500000
            //define costs
            let costs = costPerEmployee * office.size
            //throw a party
            if (ns.corporation.throwParty(division, city, (costPerEmployee * office.size))) {
                //log information
                log(ns, 0, info, division + ", " + city + ": threw party for " + office.size + " employees ($" + numberFormatter(costs) + ")")
            }
        }
    }
}



/** 
 * @param {NS} ns 
 * Function that buys materials
 * It is per second, and each update is 10 seconds: therefore dividing by 10!
 */
async function buyMaterials(ns, division, hardware, robots, aICores, realEstate) {
    //block resets
    overWritePort(ns, portBlockReset, "Corporation: Buy materials")

    //money we need to keep
    const reserveMoney = 1e9 //1b
    //input number must be divided by this
    const divider = 10
    //get cities
    let cities = ns.corporation.getDivision(division).cities

    //check if we need to buy at all 
    //set flag for checking
    let flagCheck = true
    //reset
    for (let city of cities) {
        //update the differences between have and need
        let diffHardware = hardware - ns.corporation.getMaterial(division, city, material.hardware).stored
        let diffRobots = robots - ns.corporation.getMaterial(division, city, material.robots).stored
        let diffAICores = aICores - ns.corporation.getMaterial(division, city, material.aiCores).stored
        let diffRealEstate = realEstate - ns.corporation.getMaterial(division, city, material.realEstate).stored

        //indicate result (if false once, will always be false)
        flagCheck = flagCheck && (Math.max(diffHardware, diffRobots, diffAICores, diffRealEstate) < 1)
    }
    //if all is already okay
    if (flagCheck) {
        //clear the port
        ns.clearPort(portBlockReset)
        //we're done, stop
        return true
    }

    //await next update
    await waitUntillNextUpdate(ns, division)

    //check if can afford it
    let currentFunds = ns.corporation.getCorporation().funds
    //buy
    for (let city of cities) {
        //get information of 
        let materialHardWare = ns.corporation.getMaterial(division, city, material.hardware)
        let materialRobots = ns.corporation.getMaterial(division, city, material.robots)
        let materialAICores = ns.corporation.getMaterial(division, city, material.aiCores)
        let materialRealEstate = ns.corporation.getMaterial(division, city, material.realEstate)

        //calculate the differences between have and need
        let diffHardware = hardware - materialHardWare.stored
        let diffRobots = robots - materialRobots.stored
        let diffAICores = aICores - materialAICores.stored
        let diffRealEstate = realEstate - materialRealEstate.stored

        //predict the money left over
        currentFunds -= ((diffHardware * materialHardWare.marketPrice) + (diffRobots * materialRobots.marketPrice) + (diffAICores * materialAICores.marketPrice) + (diffRealEstate * materialRealEstate.marketPrice))
        //if we are lower than what we want to keep
        if (currentFunds < reserveMoney) {
            //stop
            break
        }

        //if we need to buy hardware
        if (diffHardware > 0) {
            //set to buy the correct amount for 1 update
            ns.corporation.buyMaterial(division, city, material.hardware, (diffHardware / divider))
        }
        //if we need to buy robots
        if (diffRobots > 0) {
            //set to buy the correct amount for 1 update
            ns.corporation.buyMaterial(division, city, material.robots, (diffRobots / divider))
        }
        //if we need to buy AICores
        if (diffAICores > 0) {
            //set to buy the correct amount for 1 update
            ns.corporation.buyMaterial(division, city, material.aiCores, (diffAICores / divider))
        }
        //if we need to buy Real Estate
        if (diffRealEstate > 0) {
            //set to buy the correct amount for 1 update
            ns.corporation.buyMaterial(division, city, material.realEstate, (diffRealEstate / divider))
        }
    }

    //await next update
    await waitUntillNextUpdate(ns, division)

    //set flag for checking
    let flagSuccess = true
    //reset
    for (let city of cities) {
        //clear buying stats for all
        ns.corporation.buyMaterial(division, city, material.hardware, 0)
        ns.corporation.buyMaterial(division, city, material.robots, 0)
        ns.corporation.buyMaterial(division, city, material.aiCores, 0)
        ns.corporation.buyMaterial(division, city, material.realEstate, 0)

        //check stats
        //update warehouse
        //let warehouse = ns.corporation.getWarehouse(division, city)
        //update the differences between have and need
        let diffHardware = hardware - ns.corporation.getMaterial(division, city, material.hardware).stored
        let diffRobots = robots - ns.corporation.getMaterial(division, city, material.robots).stored
        let diffAICores = aICores - ns.corporation.getMaterial(division, city, material.aiCores).stored
        let diffRealEstate = realEstate - ns.corporation.getMaterial(division, city, material.realEstate).stored

        //indicate result (if false once, will always be false)
        flagSuccess = flagSuccess && (Math.max(diffHardware, diffRobots, diffAICores, diffRealEstate) < 1)
    }
    //clear the port
    ns.clearPort(portBlockReset)
    //return status
    return flagSuccess
}



/*
Function the determines the best price for the product
*/
async function productSellForBestPrice(ns, division, city, product) {
    //if market TA 2 is available
    if (ns.corporation.hasResearched(divisionProduct, research.marketTa2)) {
        //set market price
        ns.corporation.setProductMarketTA2(division, product, true)

    } else {
        //quick and dirty
        //set price
        ns.corporation.sellProduct(division, city, product, maxProduction, marketPrice, true)

        /*
        //more detailed: 
 
        //set initial price
        let price = 1
        //get procuct info
        let productInfo = ns.corporation.getProduct(division, city, product)
        
        //get raw estimate
        //step by 100
        while(productInfo.productionAmount == productInfo.actualSellAmount) {
            //increase the price
            price += 100
            //set price
            sellProduct(division, city, product, maxProduction, price, true)
            //await next cycle for effects
            await waitUntillNextUpdate(ns, division)
            //update the information
            productInfo = ns.corporation.getProduct(division, city, product)
        }
 
        //fine-tune the price
        //step by 10
        while(productInfo.productionAmount > productInfo.actualSellAmount) {
            //decrease the price
            price -= 10
            //set price
            sellProduct(division, city, product, maxProduction, price, true)
            //await next cycle for effects
            await waitUntillNextUpdate(ns, division)
            //update the information
            productInfo = ns.corporation.getProduct(division, city, product)
        }
 
        //finer-tune the price
        //step increase by 1
        while(productInfo.productionAmount == productInfo.actualSellAmount) {
            //increase the price by 1
            price += 1
            //set price
            sellProduct(division, city, product, maxProduction, price, true)
            //await next cycle for effects
            await waitUntillNextUpdate(ns, division)
            //update the information
            productInfo = ns.corporation.getProduct(division, city, product)
        }
        //final adjustment
        price -= 1
        //set price
        sellProduct(division, city, product, maxProduction, price, true)
        */
    }
}



/*
function that upgrades the warehouse to specific level
*/
async function upgradeWarehouse(ns, division, city, targetLevel) {
    //get current level
    let currentLevel = ns.corporation.getWarehouse(division, city).level
    //check the difference between want and have
    let difference = targetLevel - currentLevel

    //if we need to buy
    while (difference > 0) {
        //buy
        ns.corporation.upgradeWarehouse(division, city, difference)
        //update current level
        currentLevel = ns.corporation.getWarehouse(division, city).level
        //update difference
        difference = targetLevel - currentLevel
        //wait a bit
        await waitUntillNextUpdate(ns, division)
        /*
    //check if failed
    if (difference > 0) {
        //wait a bit
        await waitUntillNextUpdate(ns, division)
        //indicate failure
        return false
    }
    */
    }
    //indicate success
    return true
}



/*
Function that expands to every city and indicate success
*/
async function expandCities(ns, division) {
    //get cities
    let cities = ns.corporation.getDivision(division).cities
    //check if need to expand
    if (cities.length != citiesAll.length) {
        //for each city (should fail once due to starting city)
        for (let city of citiesAll) {
            //if not expanded to
            if (cities.indexOf(city) == -1) {
                //expand to city
                ns.corporation.expandCity(division, city)
            }
        }
        //check if failed
        if (ns.corporation.getDivision(division).cities.length != citiesAll.length) {
            //wait a bit
            await waitUntillNextUpdate(ns, division)
            //indicate failure
            return false
        }
    }
    //indicate success
    return true
}



/*
Function that waits on investment, and accepts it
*/
async function waitForInvestment(ns, division, targetInvestment, buyAdvert = false) {
    //get investment
    let investment = ns.corporation.getInvestmentOffer()
    //while not getting the correct offer (in total!)
    while ((investment.funds + ns.corporation.getCorporation().funds) < targetInvestment) {
        //update UI
        updateUI(ns, info, "Investment " + investment.round + ": " + numberFormatter(investment.funds) + " / " + numberFormatter(targetInvestment))
        //if also buying adverts
        if (buyAdvert) {
            //buy advert, if possible
            ns.corporation.hireAdVert(divisionProduct)
        }
        //await next update
        await waitUntillNextUpdate(ns, division)
        //update investment
        investment = ns.corporation.getInvestmentOffer()
    }
    log(ns, 1, success, "Accepted investment " + investment.round + " of $" + numberFormatter(Math.round(investment.funds)))
    //accept investment
    ns.corporation.acceptInvestmentOffer()
    //await for next update
    await waitUntillNextUpdate(ns, division)
}



/*
Function that interacts the status with the UI
*/
function updateUI(ns, type, message) {
    //log information
    log(ns, logLevel, type, message)
    //update port
    overWritePort(ns, portCorporation, message)
}


/** @param {NS} ns */
async function waitUntillNextUpdate(ns, division) {
    //raise soft stats for each city
    for (let city of ns.corporation.getDivision(division).cities) {
        //make sure all soft stats are maxxed
        manageOfficeSoftStats(ns, division, city)
    }
    //if tabacco has been created
    if(ns.corporation.getCorporation().divisions.indexOf(divisionProduct) > -1) {
        //check research
        unlockResearch(ns)
    }
    //await next update
    await ns.corporation.nextUpdate()
}



/*
//upgrade smart factories to 10
let upgradeName = upgrade.smartFactories
let upgradelevel = ns.corporation.getUpgradeLevel(upgradeName)
let cost = ns.corporation.getUpgradeLevelCost(upgradeName)
let totalCost = cost
while(upgradelevel < 10) {
    cost = ns.corporation.getUpgradeLevelCost(upgradeName)
    totalCost += cost
    log(ns,1,info,"Cost for " + (upgradelevel+1) + "'" + upgradeName + "' = $" + cost + " ($" + numberFormatter(cost) + ")")
    ns.corporation.levelUpgrade(upgradeName)
    upgradelevel = ns.corporation.getUpgradeLevel(upgradeName)
}
log(ns,1,info,"Total cost for '" + upgradeName + "' = $" + totalCost + " ($" + numberFormatter(totalCost) + ")")

//upgrade smart storage to 10
upgradeName = upgrade.smartStorage
upgradelevel = ns.corporation.getUpgradeLevel(upgradeName)
cost = ns.corporation.getUpgradeLevelCost(upgradeName)
totalCost = cost

while(upgradelevel < 10) {
    cost = ns.corporation.getUpgradeLevelCost(upgradeName)
    totalCost += cost
    log(ns,1,info,"Cost for " + (upgradelevel+1) + "'" + upgradeName + "' = $" + cost + " ($" + numberFormatter(cost) + ")")
    ns.corporation.levelUpgrade(upgradeName)
    upgradelevel = ns.corporation.getUpgradeLevel(upgradeName)
}
log(ns,1,info,"Total cost for '" + upgradeName + "' = $" + totalCost + " ($" + numberFormatter(totalCost) + ")")

*/


/*
import { upgrade, unlock, material, research, citiesAll, cityMain, citySupport, maxProduction, marketPrice, divisionMaterial, divisionProduct, } from "scripts/corporation/corporationConst.js"
*/


const upgrade = {
    smartFactories: "Smart Factories",
    smartStorage: "Smart Storage",
    dreamSense: "DreamSense",
    wilsonAnalytics: "Wilson Analytics",
    nuoptimalNootropicInjectorImplants: "Nuoptimal Nootropic Injector Implants",
    speechProcessorImplants: "Speech Processor Implants",
    neuralAccelerators: "Neural Accelerators",
    focusWires: "FocusWires",
    aBCSalesBots: "ABC SalesBots",
    projectInsight: "Project Insight",
}
const unlock = {
    export: "Export",
    smartSupply: "Smart Supply",
    marketResearchDemand: "Market Research - Demand",
    marketDataCompetition: "Market Data - Competition",
    veChain: "VeChain",
    shadyAccounting: "Shady Accounting",
    governmentPartnership: "Government Partnership",
    //warehouseAPI: "Warehouse API",
    //officeAPI: "Office API",
}
const material = {
    water: "Water",
    ore: "Ore",
    minerals: "Minerals",
    food: "Food",
    plants: "Plants",
    metal: "Metal",
    hardware: "Hardware",
    chemicals: "Chemicals",
    drugs: "Drugs",
    robots: "Robots",
    aiCores: "AI Cores",
    realEstate: "Real Estate",
}
const research = {
    lab: "Hi-Tech R&D Laboratory",
    autoBrew: "AutoBrew",
    autoParty: "AutoPartyManager",
    autoDrug: "Automatic Drug Administration",
    cPH4Inject: "CPH4 Injections",
    drones: "Drones",
    dronesAssembly: "Drones - Assembly",
    dronesTransport: "Drones - Transport",
    goJuice: "Go-Juice",
    recruitHR: "HRBuddy-Recruitment",
    trainingHR: "HRBuddy-Training",
    marketTa1: "Market-TA.I",
    marketTa2: "Market-TA.II",
    overclock: "Overclock",
    selfCorrectAssemblers: "Self-Correcting Assemblers",
    stimu: "Sti.mu",
}

const citiesAll = ["Aevum", "Chongqing", "Sector-12", "New Tokyo", "Ishima", "Volhaven"]
const cityMain = "Aevum"
const citySupport = ["Chongqing", "Sector-12", "New Tokyo", "Ishima", "Volhaven"]
const maxProduction = "MAX"
const marketPrice = "MP"
const divisionMaterial = "Agriculture"
const divisionProduct = "Tobacco"

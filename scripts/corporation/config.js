//loglevel
export const log_level = 0 //logLevel

//research to be left over after researching something
export const research_left_over_percentage = 1.1 //10% //researchLeftOverPercentage
//percentage to keep when unlocking researches
export const research_left_over = 0.5 //50% //researchLeftOver

//amount of dividends to be paid to to the player
export const corporation_greed = 0.01 //1% //corporationGreed

//define product investments
export const investment_design = 1e9 //1b //investmentDesign
export const investment_marketing = 1e9 //1b //investmentMarketing

//investments required
/*
total money required = 55b + 29b + 29b + 64b (materials not taken into account) = 177b
upgrade office to 9 of each city (54.674b)
Hire 6 employees (0)
Upgrade smart factories to 10 (28.362b)
Upgrade smart storage to 10 (28.362b)
upgrade warehouse 7x of each city (63.609b)
buyMaterials (can go into -money)
*/
export const investment_1 = 176e9 //142b is fast stable, originally 210e9 (210b) //investment1
export const investment_2 = 5e12//5t //investment2
export const investment_3 = 800e12//800t //investment3
export const investment_4 = 1e15//high q? //investment4

//describe the number to check for energy
export const threshold_energy = office.maxEnergy - 5 //6 is the threshold, we want to act earlier quick and dirty, to be fixed later? //thresholdEnergy
//describe the number to check for energy
export const threshold_morale = office.maxMorale - 5 //6 is the threshold, we want to act earlier quick and dirty, to be fixed later? //thresholdMorale

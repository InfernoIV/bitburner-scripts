//from https://github.com/bitburner-official/bitburner-src/blob/dev/src/Hacknet/data/HashUpgradesMetadata.tsx
export const hash_upgrades = {
    money: "Sell for Money",
    corporationFunds: "Sell for Corporation Funds",
    corporationResearch: "Exchange for Corporation Research",
    serverSecurityMin: "Reduce Minimum Security",
    serverMoneyMax: "Increase Maximum Money", // Use hashes to increase the maximum amount of money on a single server by 2%. This effect persists until you install Augmentations (since servers are reset at that time). Note that a server's maximum money is soft capped above <Money money={10e12}
    trainingStudying: "Improve Studying",
    trainingGym: "Improve Gym Training",
    bladeburnerRank: "Exchange for Bladeburner Rank",
    bladeburnerSkillPoints: "Exchange for Bladeburner SP",
    codingContract: "Generate Coding Contract",
    companyFavor: "Company Favor",
}

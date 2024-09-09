[Index](./index.md) > [gang.js](./gang.md)

# Code
[gang.js](/scripts/gang.js)

# Ram cost
Base cost 1.6 GB + references 33 GB = 34.6 GB

# Description
Script that manages the creation and rise of the gang

# Parameters
None

# Steps
* Initialize
* Create gang
* Recruit member
* Main loop:
  * For every gang member:
    * Try to recruit new members
    * Check for clash
    * Manage member tasks

# Notes
Priority of gang:
1. Train gang member(s)
2. Grow gang
3. Get equipment
4. Territory warfare
5. Farming money

# Shortcuts / ram savings
* Grow gang until all members are present, then for all equipment
* Only ascend members when they get 2x multiplier of current
* Fight only when power is bigger than the strongest gang and chance > 55%

# References
| Function | Ram | Description |
|  --- | --- | --- |
| [ns.clearPort](https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.ns.clearport.md) | 0 GB | Clear data from a port |
| [ns.disableLog](https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.ns.disablelog.md) | 0 GB | Disables logging for the given NS function |
| [ns.gang.ascendMember](https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.gang.ascendmember.md) | 4 GB | Ascend a gang member |
| [ns.gang.canRecruitMember](https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.gang.canrecruitmember.md) | 1 GB | Check if you can recruit a new gang member |
| [ns.gang.createGang](https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.gang.creategang.md) | 1 GB | Create a gang |
| [ns.gang.getAscensionResult](https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.gang.getascensionresult.md) | 2 GB | Get the result of an ascension without ascending |
| [ns.gang.getChanceToWinClash](https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.gang.getchancetowinclash.md) | 4 GB | Get chance to win clash with other gang |
| [ns.gang.getEquipmentNames](https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.gang.getequipmentnames.md) | 0 GB | List equipment names |
| [ns.gang.getEquipmentStats](https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.gang.getequipmentstats.md) | 2 GB | Get stats of an equipment |
| [ns.gang.getGangInformation](https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.gang.getganginformation.md) | 2 GB | Get information about your gang |
| [ns.gang.getMemberInformation](https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.gang.getmemberinformation.md) | 2 GB | Get information about a specific gang member |
| [ns.gang.getMemberNames](https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.gang.getmembernames.md) | 1 GB | List all gang members |
| [ns.gang.getOtherGangInformation](https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.gang.getotherganginformation.md) | 2 GB | Get information about the other gangs |
| [ns.gang.getTaskNames](https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.gang.gettasknames.md) | 0 GB | List member task names |
| [ns.gang.inGang](https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.gang.ingang.md) | 1 GB | Check if you're in a gang |
| [ns.gang.nextUpdate](https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.gang.nextupdate.md) | 1 GB | Sleeps until the next Gang update has happened |
| [ns.gang.purchaseEquipment](https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.gang.purchaseequipment.md) | 4 GB | Purchase an equipment for a gang member |
| [ns.gang.recruitMember](https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.gang.recruitmember.md) | 2 GB | Recruit a new gang member |
| [ns.gang.setMemberTask](https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.gang.setmembertask.md) | 2 GB | Set gang member to task |
| [ns.gang.setTerritoryWarfare](https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.gang.setterritorywarfare.md) | 2 GB | Enable/Disable territory clashes |
| [ns.peek](https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.ns.peek.md) | 0 GB | Get a copy of the data from a port without popping it |
| [ns.sleep](https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.ns.sleep.md) | 0 GB | Suspends the script for n milliseconds |
| [ns.writePort](https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.ns.writeport.md) | 0 GB | Write data to a port |

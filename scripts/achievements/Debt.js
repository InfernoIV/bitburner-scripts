/**
 * Function that get's the player in debt
 * Used all actions (player and sleeves (if unlocked) to keep on training
 * Exits when debt is reached
 */
export async function main(ns) {  
  //set target of debt
  const target_debt = -1000000000 //1,000,000,000 or 1,000,000,000,000??
  //highest cost is 320 (UniversityClassType.algorithms or UniversityClassType.leadership)
  //set target city
  const target_city = "Sector-12"
  //set target university
  const target_university = "Rothman University" 
  //set target class
  const target_class = "Algorithms"
  
  //print message
  ns.tprint("Starting script to reach target debt: "+ target_debt + " for achievement 'Massive debt'")
  
  //check if we need to travel
  if (ns.getPlayer().city != target_city) {
      //travel to city
      ns.singularity.travelToCity(target_city)
  }

  //set player action
  ns.singularity.universityCourse(target_university, target_class, true)
  
  //set each sleeve action
  for (let sleeve_index = 0; sleeve_index < x, sleeve_index++) {
    //set to action
    setToUniversityCourse(sleeve_index, target_university, target_class)
  }

  //any other ways to spend money (while in negative)???
  
  //wait until target is reached
  while(true) {
    //if threshold has been reached
    if(ns.getServer("home").moneyAvailable <= target_debt) {
      //print message
      ns.tprint("Target debt reached, achievement should be unlocked!")
      //exit script
      return
    }
    //wait a bit
    ns.sleep(100)
}

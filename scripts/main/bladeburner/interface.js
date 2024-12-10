//import common for checking  if functionality is unlocked
import * as common from "./common.js"

//import the the needed namespaces
import bladeburner_dummy from "./bladeburner_dummy.js"
import bladeburner from "./bladeburner.js"

//check which one to export (depending on availability)
const exported_namespace = common.functionality_available(common.functionality.bladeburner) ? bladeburner : bladeburner_dummy
//export the specific value
export default exported_namespace

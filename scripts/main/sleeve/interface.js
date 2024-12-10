//import common for checking  if functionality is unlocked
import * as common from "./common.js"

//import the the needed namespaces
import sleeve_dummy from "./sleeve_dummy.js"
import sleeve from "./sleeve.js"

//check which one to export (depending on availability)
const exported_namespace = common.functionality_available(common.functionality.sleeve) ? sleeve : sleeve_dummy
//export the specific value
export default exported_namespace

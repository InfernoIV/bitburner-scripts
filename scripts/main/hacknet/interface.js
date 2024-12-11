//import common for checking  if functionality is unlocked
import * as common from "scripts/common.js"

//import the the needed namespaces
import servers from "./servers.js"
import hacknet from "./hacknet.js"

//check which one to export (depending on availability)
const exported_namespace = common.functionality_available(common.functionality.hacknet) ? hacknet : servers
//export the specific value
export default exported_namespace

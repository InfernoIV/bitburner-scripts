/** 
 * @param {NS} ns 
 * script that destroys the bitnode (saving RAM)
 */
export async function main(ns) {
    /*
    try {
        ns.tprint("Args: " + JSON.stringify(ns.args))
        
        //get arguments
        let args = ns.args

        
        //destroy bitnode, with boot script
        ns.singularity.destroyW0r1dD43m0n(12, args[0])
    } catch (error) {
        */
        //destroy bitnode, without boot script
        ns.singularity.destroyW0r1dD43m0n(12, "scripts/boot.js")
    //}
}

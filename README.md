# Information
This repo will host the code used in my game of Bitburner.

# Downloading code
If you manually run `nano git-pull.js` in the terminal and copy the contents of the script from github to the bitburner editor, you should be able to run it once and download the rest of the files. 
Early-game, many will be useless because they are only enabled by late-game features, but they shouldn't give you too many problems just being there.

# Usage
## Aliases
A few handy aliases:
`alias "boot=home; cls; killall; scripts/boot.js"` = command `boot` kills all scripts and starts the boot sequence
`alias "update=home; cls; killall; git-pull.js"` = command `update` will get download / update the code from github

# TODO
* Make [cleanup.js](/markdown/cleanup.md) start the boot sequence
* Split scripts which have their own timings:
  * Gang: Gang.nextUpdate()
  * Corporation
* Fix sleeve duplicate work:

sleeve.setToCompanyWork: Sleeve 6 cannot work for company KuaiGong International because Sleeve 5 is already working for them.

Stack:
scripts/main.js:L996@manageActions
scripts/main.js:L80@main setToCompanyWork KuaiGong International: RUNTIME ERROR
scripts/main.js@home (PID - 1)

sleeve.setToCompanyWork: Sleeve 6 cannot work for company KuaiGong International because Sleeve 5 is already working for them.

Stack:
scripts/main.js:L996@manageActions
scripts/main.js:L80@main
scripts/main.js: RUNTIME ERROR
scripts/main.js@home (PID - 1)

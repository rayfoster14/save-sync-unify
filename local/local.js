
require('dotenv').config()
global.c = require('../common/common.js');

c.startup();


let main = async function(){
    let config = await c.db.getConfig();
    let online = await c.devices.getOnlineDevices(config, 'local');
    console.log(online)
}

main();
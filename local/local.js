
require('dotenv').config();
let fs = require('fs');
let ui = require('./ui.js');
global.c = require('../common/common.js');
c.startup();
let instance = fs.readFileSync('instance').toString();


let editDiscovery = async function(devices){
    if(await ui.bool('Edit Config?')){
        let option = await ui.select(devices.map(function(x){return {message:x.name, value:x.device} }), 'Discover which device?');
        console.log(option);
    }
}


let main = async function(){
    let config = await c.db.getConfig();
    let devices = await c.devices.getOnlineDevices(config, 'local');
    let preferences = await c.db.getPreferences(instance);

    for(let i = 0; i < devices.length; i++){

        let deviceId = devices[i].device;
        let entries = preferences.map(function(x){return x.device});
        if(entries.indexOf(deviceId) === -1){
            await c.db.writePreference(instance, {device:deviceId, discover:true})
        }else{
            for(let e = 0; e < preferences.length; e++){
                let pref = preferences[e];
                if(deviceId === pref.device){
                    devices[i].discover = pref.discover === 1 && devices[i].online ? true : false;
                }
                
            }
        }

        console.log(`  [${devices[i].discover?'X':' '}] ${devices[i].online?' ONLINE':'OFFLINE'} ::: ${devices[i].name}`)
    }

    await editDiscovery(devices);


}

main();
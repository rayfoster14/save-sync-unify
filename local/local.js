let run = function(){

require('dotenv').config();
let fs = require('fs');
global.c = require('../common/common.js');
let ui = require('./ui.js');

let preferences, devices;


c.startup();
let instance = fs.readFileSync('instance').toString();


//Edits the discovery configuration
let editDiscovery = async function(devices){
    let exit = false;
    if(await ui.bool('Edit Config?')){
        let deviceId = await ui.select(devices.map(function(x){return {text:x.name, value:x.device} }), 'Discover which device?');
        let discoveryVal = await ui.bool('Discover this device?');
        await c.db.writePreference(instance, {device:deviceId, discover:discoveryVal})
        preferences = await c.db.getPreferences(instance);
    }else{
        exit = true;
    }
    return exit;
}

//Logs Online Devices and creates new Discovery DB entries if not found
let listConfiguration = async function(devices,preferences){
    for(let i = 0; i < devices.length; i++){
        let deviceId = devices[i].device;
        let entries = preferences.map(function(x){return x.device});

        //WRITE New Devices to Discovery
        if(entries.indexOf(deviceId) === -1){
            await c.db.writePreference(instance, {device:deviceId, discover:true});
            devices[i].discover = true;
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
}


let main = async function(){

    let config = await c.db.getConfig();
    devices = await c.devices.getOnlineDevices(config, 'local');
    preferences = await c.db.getPreferences(instance);

    do{
        await listConfiguration(devices,preferences);
        exitEdit = await editDiscovery(devices);
    }while(!exitEdit)

    let online = c.functions.getMasterList(devices);
    let files = await c.devices.prepareFiles(online);
    console.log(files)

}

main();

}
module.exports=run
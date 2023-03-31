let plugins = require('../plugins/exec.js').plugins();
let fs = require('fs');

//This get's the online devices and prepares them for continuing...
let getOnlineDevices = async function(config, mode){
    for(let i = 0; i < config.length; i++){
        //Checks if device is alive or not, and sets online flag
        let device = config[i];
        device.online = false;
        if(mode === "server" && device.type !== "ftp") continue;
        device.online = await c[device.type].onlineCheck(device);

        //Add base functions, and replace with plugin function if found
        device.functions = c[device.type];
        if(plugins[device.device]){
            let pluginFunctions = Object.keys(plugins[device.device]);
            device.pluginFunctionList = pluginFunctions;
            for(let e = 0; e < pluginFunctions.length; e++){
                device.functions[pluginFunctions[e]] = plugins[device.device][pluginFunctions[e]]
            }
        }

        //Parsing some of the JSON fields;
        device.paths = JSON.parse(device.paths);
        device.extensionSearch = JSON.parse(device.extensionSearch);
        device.platformList = Object.keys(device.paths);
    }
    return config
}

//Preps folders and copy files from device to temp
let prepareFiles = async function(devices){
    c.functions.dirRemove('./TEMP/');
    c.functions.dirCreate('./TEMP');
    
    for(let i = 0; i < devices.length; i++){
        let device = devices[i];

        //Set up folders
        c.functions.dirCreate('./TEMP/'+device.device);
        for(let e = 0; e < device.platformList.length; e++){
            let k = device.platformList[e];
            c.functions.dirCreate(`./TEMP/${device.device}/${k}`);
            c.functions.dirCreate(`${process.env.REPO_PATH}/${k}`)
        }

        device = await device.functions.copyToTemp(device);
    }
    return devices
}


module.exports={
    getOnlineDevices,
    prepareFiles
}
let plugins = require('../plugins/exec.js').plugins();
let fs = require('fs');

//This get's the online devices and prepares them for continuing...
let getOnlineDevices = async function(config, mode){
    for(let i = 0; i < config.length; i++){
        //Checks if device is alive or not, and sets online flag
        let device = config[i];
        device.online = false;

        //Add base functions, and replace with plugin function if found
        device.functions = c[device.type];
        if(plugins[device.device])  device.pluginFunctions = plugins[device.device];

        if(mode === "server" && device.type !== "ftp") continue;
        device.online = await c[device.type].onlineCheck(device);

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

        device.fileList = {};
        for(let i = 0; i < device.platformList.length; i++){
            let k = device.platformList[i];
            if(device.pluginFunctions && device.pluginFunctions.copyToTemp && device.pluginFunctions.copyToTemp[k]){
                device = await device.pluginFunctions.copyToTemp[k](device, k);
            }else if(typeof(device.functions.copyToTemp === 'function')){
                device = await device.functions.copyToTemp(device, k);
            }
        }
    }
    return devices
}

let syncTheSave = async function(source, pushList, online){
    await c.db.updateRepoCopiedFrom(source.id);

    // Copy latest save to temp directories
    for(let i = 0; i < pushList.length; i++){
        let destination = pushList[i];

        let destinationPath
        if(destination.device === 'repo'){
            destinationPath = (source.sessionPath, `${process.env.REPO_PATH}${destination.path}`)
        }else{
            destinationPath = (source.sessionPath, destination.sessionPath + 'NEW')
        }
        fs.copyFileSync(source.sessionPath, destinationPath);
        destination.newSave = destinationPath;

        await c.db.updateRepoCopiedTo(destination.id);

        if(destination.device === 'repo') continue;

        let device,res;
        for(let e = 0; e < online.length; e++){
            if(online[e].device === destination.device) device = online[e]
        }
        if(device.pluginFunctions && device.pluginFunctions.copyFromTemp && device.pluginFunctions.copFromTemp[destination.platform]){
            res = await device.pluginFunctions.copyFromTemp[k](device, destination);
        }else{
            res = await device.functions.copyFromTemp(device, destination);
        }
        console.log(res)

    }
 
}


module.exports={
    getOnlineDevices,
    prepareFiles,
    syncTheSave
}
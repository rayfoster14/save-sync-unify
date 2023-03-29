let run = function(){

require('dotenv').config();
let fs = require('fs');
global.c = require('../common/common.js');
let ui = require('./ui.js');

let preferences, devices, repo;


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

let addNewSave = async function(online,repo){

    //Get platform list
    let platform = "";
    do{
        let platformList = await c.functions.getOnlinePlatformList(online, true);
        platform = await ui.select(platformList, 'Which platform?', undefined, true)

        //Get Game Name
        let game = "";
        let newGameBool = undefined;
        if(platform !== "" && platform){
            do{
                game = "";
                newGameBool = await ui.bool('Is this a new Game?');
                let filteredGameList = c.functions.getFilteredGameList(repo,platform);
                game = newGameBool ?  await ui.text('New Game Name: ') :  await ui.select(filteredGameList, 'Which Game?', undefined, true);

                //Get Device List that has the selected platform
                let device = "";
                if(game !== "" && game){
                    do{
                        device = ""
                        let onlinePlatformDevices = c.functions.getFilteredOnlinePlatformDevices(online,platform)
                        device = await ui.select(onlinePlatformDevices, 'Which device?', undefined, true);

                        //Get a filelist for the device and platform
                        let filePath = ""
                        if(device !== "" && device){
                            do{
                                fileList = c.functions.getFilteredOnlinePlatformDeviceFileList(online, device, platform)
                                filePath = await ui.select(fileList, 'Which file?', undefined, true);

                                //Confirmation to continue
                                let continueBool;
                                if(filePath !== "" && filePath){
                                        console.log(`We are going to add ${game} (${platform}) to the repo?${"\n"}Device: ${device}${"\n"}File: ${filePath} `);
                                        continueBool = await ui.bool('Continue? ')
                                        if(continueBool){
                                            let createRes = await c.functions.addOrUpdateRepo(  {
                                                platform,
                                                game,
                                                newGameBool,
                                                device, 
                                                path:filePath
                                            }, repo );

                                            console.log(createRes ? 'Added Successfully':'Something went wrong')
                                          
                                            platform = undefined;
                                            game = undefined,
                                            device = undefined,
                                            filePath  = undefined;
                                        }
                                }
                        }while(filePath)
                        }
                    }while(device)
                }        
            }while(game)
        }
    }while(platform)
}

let main = async function(){

    let config = await c.db.getConfig();
    devices = await c.devices.getOnlineDevices(config, 'local');
    preferences = await c.db.getPreferences(instance);

    do{
        await listConfiguration(devices,preferences);
        exitEdit = await editDiscovery(devices);
    }while(!exitEdit)

    online = c.functions.getMasterList(devices);
    online = await c.devices.prepareFiles(online);
    repo = await c.functions.getRepo();

    let options =
    [
        "Sync",
        "Add new Save",
        "Quit"
    ]
    let quit;
    do{
        let choice = await ui.select(options, 'How to continue? ', 'index');
        await [
            undefined,
            addNewSave.bind(undefined, online,repo),
            function(){console.log('quitting');quit=true}
        ][choice]();
    }while(!quit)

}

main();

}
module.exports=run
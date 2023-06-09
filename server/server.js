
let run = function(){
    require('dotenv').config();

    if(!process.env.SERVER_PORT){
        console.log('SET SERVER_PORT IN ENV')
        return;
    }
    const express = require('express')
    const app = express();
    const port = process.env.SERVER_PORT;
    const path = require('path');
    const fs = require('fs');

    global.c = require('../common/common.js');
    app.use(express.urlencoded({
        extended: true
    }));
    app.use(express.json());
    app.use(express.static(path.join(__dirname, 'web')));
    app.use(express.static(__dirname, { dotfiles: 'allow' } ));

    c.startup();
    let instance = fs.readFileSync('instance').toString();


    let devices, preferences, repo
    let deviceFunctions={}

    let apiPrefix = "/api";


    let storeFunctions = function(devices){
        for(let i = 0; i < devices.length; i++){
            deviceFunctions[devices[i].device] = {};
            deviceFunctions[devices[i].device] =  devices[i].functions
        }
        return devices;
    }
    let repackFunctions = function(devices){
        for(let i = 0; i < devices.length; i++){
            devices[i].functions = deviceFunctions[devices[i].device];
        }
        return devices;
    }
    app.get('/alive', function(req,res){
        res.send({ok:'okk'});
        res.end()
    })
    app.get(apiPrefix+'/getOnlineList', async function(request,response){
        config = await c.db.getConfig();
        devices = await c.devices.getOnlineDevices(config, 'server');
        response.send(devices);
        response.end();
    })
    app.get(apiPrefix+'/getPreferences', async function(request,response){
        preferences = await c.db.getPreferences(instance);
        response.send(preferences);
        response.end();
    })
    app.post(apiPrefix+'/writePreferences', async function(request, response){
        let writeResponse = await c.db.writePreference(instance, request.body);
        response.send(JSON.stringify({writeResponse}));
        response.end()
    });
    app.get(apiPrefix+'/copyToTemp', async function(request, response){
            config = await c.db.getConfig();
            devices = await c.devices.getOnlineDevices(config, 'server');
            preferences = await c.db.getPreferences(instance);
            for(let i = 0; i < devices.length; i++){
                let deviceId = devices[i].device;
                for(let e = 0; e < preferences.length; e++){
                    let pref = preferences[e];
                    if(deviceId === pref.device){
                        devices[i].discover = pref.discover === 1 && devices[i].online ? true : false;
                    }
                }
            }
            online = c.functions.getMasterList(devices);
            online = await c.devices.prepareFiles(online);
            online = storeFunctions(online); //Required to parse function in API call
            console.log('Finished Copying from temp')
            response.send(JSON.stringify(online));
            response.end()
    });

    app.post(apiPrefix+'/getOnlinePlatformList', async function(request, response){
        if(request.body) {
            let online = repackFunctions(request.body.online)
            let platformList = await c.functions.getOnlinePlatformList(online, true);
            response.send(JSON.stringify(platformList));
            response.end()
        }
    });
    app.post(apiPrefix+'/getFilteredGameList', async function(request, response){
        if(request.body) {
            repo = await c.functions.getRepo();
            let filteredGameList = c.functions.getFilteredGameList(repo,request.body.platform);
            response.send(JSON.stringify(filteredGameList));
            response.end()
        }
    });
    app.post(apiPrefix+'/getFilteredOnlinePlatformDevices', async function(request, response){
        if(request.body) {
            let onlinePlatformDevices = c.functions.getFilteredOnlinePlatformDevices(request.body.online,request.body.platform)
            console.log(onlinePlatformDevices, request.body)
            response.send(JSON.stringify(onlinePlatformDevices));
            response.end()
        }
    });
    app.post(apiPrefix+'/getFilteredOnlinePlatformDeviceFileList', async function(request, response){
        if(request.body) {
            let fileList = c.functions.getFilteredOnlinePlatformDeviceFileList(request.body.online, request.body.device, request.body.platform)
            response.send(JSON.stringify(fileList));
            response.end()
        }
    });
    app.post(apiPrefix+'/addOrUpdateRepo', async function(request, response){
        if(request.body) {
            let createRes = await c.functions.addOrUpdateRepo( request.body, repo );
            response.send(createRes);
            response.end()
        }
    });

    app.post(apiPrefix+'/getRepoStatInfo', async function(request,response){
        if(request.body){
            let repo = await c.functions.getRepo();
            let repoEntry = repo[request.body.platform][request.body.game]
            let repoData = await  c.functions.getSaveStats(repoEntry)
            response.send(JSON.stringify(repoData));
            response.end()
        }
    });
    app.post(apiPrefix+'/syncTheSave', async function(request, response){
        if(request.body){
            let res = await c.devices.syncTheSave(request.body.latest,request.body.pushList, online);
            res = {
                successful: true
            }
            response.send(JSON.stringify(res));
            response.end();
        }
    })
    app.post(apiPrefix+'/nd', async function(request, response){
        if(request.body){
            let time = c.functions.niceDate(request.body.d, request.body.time)
            response.send(time);
            response.end();
        }
    })
    app.post(apiPrefix+'/gitPush',  async function(request,response){
        let res =  await c.git.push(process.env.REPO_PATH+request.body.path);
        response.send(res);
        response.end()
    });   
  
    //Mapping Table / delete
    app.get(apiPrefix+'/getFullMapping', async function(request,response){
        let mapping = await c.db.getFullMapping();
        for(let i = 0; i < mapping.length; i++){
            mapping[i].exists = fs.existsSync(`./TEMP/${mapping[i].deviceID}/${mapping[i].platformID}/${mapping[i].path}`);
        }
        response.send(JSON.stringify(mapping));
        response.end();
    });
    app.post(apiPrefix+'/deleteMappingEntry', async function(request, response){
        console.log(request.body.id)
        let res = await c.db.deleteMappingEntry(request.body.id);
        response.send(JSON.stringify({result: res}));
    });


    /**CONFIG PAGE**/
    app.get('/configData/getDevices',  async function(request,response){
        let config =  await c.db.getConfig();
        response.send(config);
        response.end()
    });
    app.get('/configData/getSchema',  async function(request,response){
        let schema =  await c.db.getSchema();
        response.send(schema);
        response.end()
    });
    app.post('/configData/writeDevice', async function(request, response){
        console.log(request.body)

        let writeResponse;
        if(request.body&&request.body.device) 
            writeResponse = await c.db.writeConfig(request.body);
        response.send(JSON.stringify({writeResponse}));
        response.end()
    })


    app.listen(port, () => {
    console.log(`Listening for port: ${port}`)
    })

}

module.exports = run;
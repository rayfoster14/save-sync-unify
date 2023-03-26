let isReachable = require('is-reachable');
let ftp = require('basic-ftp')

module.exports={
        newConnection: function () {
            return new Promise(function (resolve, reject) {
                var client = new ftp.Client();
                client.ftp.verbose=true;
                resolve(client)
            });
        },
        onlineCheck : async function(device){
            let address = `ftp://${device.ftpAddress}:${device.ftpPort}`;
            return await isReachable(address);
        },
        getDirList: async function (client, config, dir) {
            return new Promise(async function (resolve, reject) {
                try {
                    await client.access(config)
                    await client.cd(dir);
                    var list = await client.list();
                    client.close();
                    resolve(list)
                } catch (err) {
                    client.close();
                    resolve(false)
                }

            })
        },
        downloadFiles: async function (client, config, files, ftpDir, localDir, modBool, closeBool) {
            
            // Requires a root dir (ftpDir) and requires
            // an array of files path strings (or dir to
            // files from root dir (files).

            return new Promise(async function (resolve, reject) {
                try {
                    await client.access(config);
                    for (var u = 0; u < files.length; u++) {

                        let thisSaveDir = ftpDir;
                        let file = files[u];

                        //If file has more DIRs in path... let's add them to the ftp path
                        if(file.split('/').length > 1){
                            let dirList = file.split('/')
                            file = dirList.pop();
                            for(let x = 0; x < dirList.length; x++){
                                if(dirList[x] !== '') thisSaveDir += `/${dirList[x]}`
                            }
                        }

                        await client.cd(thisSaveDir)

                        await client.downloadTo(localDir + '/' + file, file);
                        if(!modBool){
                            var lastMod =await client.lastMod(file);
                            fs.utimesSync(localDir + '/' + file, lastMod, lastMod)
                        }
                    }
                    client.close()
                    resolve(true)
                } catch (err) {
                    client.close()
                    resolve(false)
                }
            });
        },
        downloadOneFile: async function (client, config, file, ftpDir, localDir, modBool, closeBool) {
       
            return new Promise(async function (resolve, reject) {
                try {
                    await client.access(config);

                    let thisSaveDir = ftpDir;

                    //If file has more DIRs in path... let's add them to the ftp path
                    if(file.split('/').length > 1){
                        let dirList = file.split('/')
                        file = dirList.pop();
                        for(let x = 0; x < dirList.length; x++){
                            if(dirList[x] !== '') thisSaveDir += `/${dirList[x]}`
                        }
                    }

                    await client.cd(thisSaveDir)

                    await client.downloadTo(localDir + '/' + file, file);
                    if(!modBool){
                        var lastMod =await client.lastMod(file);
                        fs.utimesSync(localDir + '/' + file, lastMod, lastMod)
                    }
                    
                    client.close()
                    resolve(true)
                } catch (err) {
                    client.close()
                    resolve(false)
                }
            });
        },
        
        uploadFile: async function(client, config, ftpFile, ftpDir, localFile){
            return new Promise(async function(resolve,reject){
                try{
                    await client.access(config);
                    await client.cd(ftpDir);
                    await client.uploadFrom(localFile, ftpFile);
                    client.close();
                    resolve(true);
                }catch(err){
                    client.close();
                    resolve(false)
                }
            })
        }
    
}
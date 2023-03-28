let isReachable = require('is-reachable');
let ftp = require('basic-ftp');
let globby = require('glob');
let fs = require('fs');


let  newConnection = function () {
    return new Promise(function (resolve, reject) {
        var client = new ftp.Client();
        client.ftp.verbose=false//true;
        resolve(client)
    });
};


let copyToTemp = async function(device){
    device.fileList = {};

    let client = await newConnection();

    for(let i = 0; i < device.platformList.length; i++){
        let k = device.platformList[i];
        let searchPath = `${device.paths[k]}`;
        let searchExts = device.extensionSearch[k];
        let downloadDir = `./TEMP/${device.device}/${k}/DownloadDir`;
        device.fileList[k] = [];

        await client.access({
            host: device.ftpAddress,
            user: device.ftpUser,
            password: device.ftpPW,
            port: device.ftpPort
        });
        await client.cd(searchPath);
        await client.downloadToDir(downloadDir);

        let found = [];
        for(let v = 0; v < searchExts.length; v++){
            let list = await globby(`${downloadDir}/**/*.${searchExts[v]}`);
            found = found.concat(list);
        }

        //Copy files to temp
        for(let v = 0; v < found.length; v++){
            let path = './'+found[v].replace(/\\/g, '/');
            let rootPath = path.replace(downloadDir+'/', '');
            
            let extArr = rootPath.split('.');
            let ext = extArr[extArr.length-1];

            let tempPath = `./TEMP/${device.device}/${k}/${rootPath}`;
            fs.cpSync(path, tempPath);
            device.fileList[k].push({
                temp: tempPath,
                rootPath
            });
        }
        fs.rmSync(downloadDir, {recursive:true});
    }
    await client.close();
}

module.exports={
    copyToTemp,
       
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
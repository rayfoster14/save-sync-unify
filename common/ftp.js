let isReachable = require('is-reachable');
let ftp = require('basic-ftp');
let globby = require('glob');
let fs = require('fs');

let  newConnection = function () {
    return new Promise(function (resolve, reject) {
        let client = new ftp.Client();
        client.ftp.verbose=false//true;
        resolve(client)
    });
};

//Checks URL and returns if it's alive or not
let onlineCheck = async function(device){

    let address = `${device.ftpAddress}:${device.ftpPort}`;
    return await isReachable(address, {timeout:60000});
};


let copyToTemp = async function(device, k){
    //Define Paths for transfer
    let searchPath = `${device.paths[k]}`;
    let searchExts = device.extensionSearch[k];
    let downloadDir = `./TEMP/${device.device}/${k}/DownloadDir`;
    device.fileList[k] = [];

    //Create FTP Client
    let client = await newConnection();
    await client.access({
        host: device.ftpAddress,
        user: device.ftpUser,
        password: device.ftpPW,
        port: device.ftpPort
    });

    //Navigate to FTP directory
    await client.cd(searchPath);

    //Download contents of directory to temp download directory
    await client.downloadToDir(downloadDir);

    //Search the download folder with files that match file extension
    let found = [];
    for(let v = 0; v < searchExts.length; v++){
        let list = await globby(`${downloadDir}/**/*.${searchExts[v]}`);
        found = found.concat(list);
    }

    //Copy matching files out of download folder and into root temp directory
    for(let v = 0; v < found.length; v++){
        let path = './'+found[v].replace(/\\/g, '/');
        let rootPath = path.replace(downloadDir+'/', '');
        
        let tempPath = `./TEMP/${device.device}/${k}/${rootPath}`;
        fs.cpSync(path, tempPath);
        device.fileList[k].push({
            temp: tempPath,
            rootPath
        });
    }

    //Delete download directory
    fs.rmSync(downloadDir, {recursive:true});
    
    await client.close();
    return device
}

let copyFromTemp = async function(device, destination){
 
    //Local File
    let copyFromPath = destination.newSave;

    //FTP File to be overwritten
    let deviceDir = device.paths[destination.platform]
    let deviceFile = destination.path

    //FTP Client Create
    let client = await newConnection();
    await client.access({
        host: device.ftpAddress,
        user: device.ftpUser,
        password: device.ftpPW,
        port: device.ftpPort
    });

    //Navigate to ftp directory
    await client.cd(deviceDir);

    //Copy file from temp directory to ftp directory
    let result = await client.uploadFrom(copyFromPath, deviceFile);
    
    client.close()

    //If result.code === 226 (successful) return true
    return result.code === 226 ? true : false

}

module.exports={
    copyToTemp,
    copyFromTemp,
    onlineCheck,
    newConnection
}


let fs = require('fs');
let globby = require('glob');

let getDriveLetter = function (dir) {
    for (var i = 0; i < 26; i++) {
        var letter = String.fromCharCode(i + 65)
        if (fs.existsSync(`${letter}:/${dir}`)) return letter
    }
};
let getDriveDir = function(mountDir, dir){
    if(fs.existsSync(mountDir)){
        //This is assuming the path will be /media/USER/DEVICE/...
        if(fs.existsSync(mountDir) && fs.existsSync(`${mountDir}/${process.env.USER}`)){
            let mountedDevices = fs.readdirSync(`${mountDir}/${process.env.USER}`);
            for(let i = 0; i < mountedDevices.length; i++){
                if(fs.existsSync(`${mountDir}/${process.env.USER}/${mountedDevices[i]}/${dir}`)) return `${mountDir}}/${process.env.USER}/${mountedDevices[i]}/${dir}`;
            }
        }
    }
};

let copyToTemp = async function(device, k){    

    let searchPath = `${device.basePath}/${device.paths[k]}`;
    let searchExts = device.extensionSearch[k];
    device.fileList[k] = [];

    //Searches through FS for files with the correct extension
    let found = [];
    for(let v = 0; v < searchExts.length; v++){
        let list = await globby(`${searchPath}/**/*.${searchExts[v]}`);
        found = found.concat(list);
    }

    //Copy files to temp
    for(let v = 0; v < found.length; v++){
        let path = found[v].replace(/\\/g, '/');
        let rootPath = path.replace(searchPath+'/', '');
        
        let tempPath = `./TEMP/${device.device}/${k}/${rootPath}`;
        fs.cpSync(path, tempPath);

        device.fileList[k].push({
            temp: tempPath,
            rootPath
        });
    }
        
    return device;
}

let copyFromTemp = function(device, destination){

    let copyToPath = `${device.basePath}/${device.paths[destination.platform]}/${destination.path}`;
    let copyFromPath = destination.newSave;
    fs.copyFileSync(copyFromPath, copyToPath)
    
    return fs.existsSync(copyToPath);

}


module.exports={
    onlineCheck: async function(device){
        if(process.platform === "win32"){
            //Windows Version
            var letter = getDriveLetter(device.localExistCheck);
            if (letter) {
                device.basePath = letter+':';
                return true
            } else {
                return false
            }
        }
        else if(process.platform === "linux"){
            //Linux Version
            let sourceDir = getDriveDir("/media", device.localExistCheck);
            if(sourceDir){
                device.basePath = sourceDir;
                return true;
            }else{
                return false;
            }
        } else if (process.platform === 'darwin'){
            //Mac version...
            return false;
        }else{
            //What else are we running this on??
            return false;
        }
    },
    copyToTemp,
    copyFromTemp
}
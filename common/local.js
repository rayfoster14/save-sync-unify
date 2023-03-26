let fs = require('fs');

let getDriveLetter = function (dir) {
    for (var i = 0; i < 26; i++) {
        var letter = String.fromCharCode(i + 65)
        if (fs.existsSync(`${letter}:/${dir}`)) return letter
    }
};
let getDriveDir = function(mountDir, dir){
    if(fs.existsSync(mountDir)){
        let mountedDevices = fs.readdirSync(mountDir);
        for(let i = 0; i < mountedDevices.length; i++){
            if(fs.existsSync(`${mountDir}/${mountedDevices[i]}/${dir}`)) return `${mountDir}/${mountedDevices[i]}`;
        }
    }
};


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
            let sourceDir = getDriveDir("/mnt", device.localExistCheck);
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
    }
}
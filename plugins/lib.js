/** ADD EXTERNAL PLUGINS IN HERE */

module.exports={
    checkpoint3ds: require(process.cwd()+'/plugins/checkpoint3ds.js')
}

/**** PLUGIN FUNCTIONS ****/
/*

Plugins will need to define each below function and the respective platform.
These functions are called from ./common/devices.js

** lib.js 
module.exports={
    deviceName: require('./jsFile.js')
}

** jsFile.js
module.exports={
    copyToTemp: {
        gb : async function(device, platform){}...
    },
    copyFromTemp : {
        gb: async function(device, destination){}...
    }
}

-----------------------------------------------------------------------------------------

copyToTemp(device, platform): Promise

What function does: 

    This function will copy all filtered save files into the ./TEMP directory - following the path ./TEMP/DEVICE/PLATFORM/...
    All files by default will be nested as they are downloaded. So /FTP/saves/someGame/save/1.raw will be add to TEMP directory as as ./TEMP/saves/someGame/save/1.sav


What function will return:

    [device] object from argument. device.fileList must be added as an object with each platform having it's own array of files.
    device.fileList = {
        gb:[
            'Pokemon Silver.sav',
            './Patches/Pokemon Silver Patched.sav'
        ]
    }

What is provided in function arguments: 

    [device] *an object with info about the current device the script is selecting.
    - type: 'local|ftp'
    - paths : {platform: '/path'}
    - extenstionSearch: {platform : ['ext']}
    - localExistsCheck: 'some Path to something unique about the path'
    - basePath: 'Windows drive letter or Linux mount point'
    - ftpUser, ftpPW, ftpAddress, ftpPort
    - online: this will only be true if we've got this far

    [platform] *string of what the current platform is ie 'gb'


-------------------------------------------------------------------------------------------

copyFromTemp(device, destination)

What function does:

    Simply copies files new save file to destination save file. Backups.etc have already been taken care of, save file to copy has been added to TEMP directory as [file.savNEW].

What function will return:

    true / false if the copy was successful. Note FTP uploadFrom function result will return {code:226} is successful.

What is provided in function arguments:

    [device]* same as device variable above

    [destination]* object of current repo entry we are working with
    - device: 'deviceKey'
    - game: 'Name of the Game in nice format'
    - path: 'path from root device dir to destination file'
    - platform: 'platformKey'
    - sessionPath: 'path from working directory to original destination device TEMP file'
    - newSave: 'path from working directory to new save file in TEMP to be copied to device'
    


*/

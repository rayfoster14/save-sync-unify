let fs = require('fs');
let path = require('path');

//This will only return ONLINE devices that are DISCOVERABLE
let getMasterList = function(deviceList){
    let cleanList = [];
    for(let i = 0; i < deviceList.length; i++){
        let x = deviceList[i];
        if(x.online && x.discover) cleanList.push(x);
    }
    return cleanList
}

let getRepo = async function(){
    let initlist = await c.db.getRepo();
    let repoList = {};
    for(let i = 0; i < initlist.length; i++){
        let entry = initlist[i];
        repoList[entry.platform] ??= {};
        repoList[entry.platform][entry.game] ??= [];
        repoList[entry.platform][entry.game].push({
            device:entry.device,
            path:entry.path,
            lastDate: entry.lastDate
        });
    }
    return repoList;
}

//If dir doesn't exist, create it
let dirCreate = function(dir){
    dir = path.join(process.cwd(), dir);
    if(!fs.existsSync(dir))fs.mkdirSync(dir);
}

let dirRemove = function(dir){
    dir = path.join(process.cwd(), dir);
    if(fs.existsSync)fs.rmSync(dir, {recursive:true});

}

let getOnlinePlatformList = async function(online, choiceArray){
    let names = await c.db.getPlatformNames()
    
    platforms = {};
    for(let i = 0; i < online.length; i++){
        let device = online[i];
        for(let v = 0; v < device.platformList.length; v++){
            let k = device.platformList[v];
            let name = k;
            for(let s = 0; s < names.length; s++){
                if(k === names[s].short) name = names[s].name
            }
            platforms[k] ??= name
        }
    }
    if(choiceArray){
        let keys = Object.keys(platforms);
        let values = Object.values(platforms);
        return keys.map(function(x,i){
            return {value:x, text:values[i]}
        })
    
    }
    return platforms;
}

let getFilteredGameList = function(repo, platform){
    return Object.keys(repo[platform]);
}

let getFilteredOnlinePlatformDevices = function(online, platform){
    return online.filter(function(x){
        if(x.platformList.indexOf(platform) !== -1) return x
    }).map(function(x){
        return {value:x.device, text:x.name}
    });
}

let getFilteredOnlinePlatformDeviceFileList = function(online, device, platform){
    let deviceObj = {};
    for(let i = 0; i < online.length; i++){
        if(online[i].device === device) deviceObj = online[i];
    }
    return deviceObj.fileList[platform].map(function(x){return x.rootPath});
}

let makeDate = function(date){
    let d = date ?? new Date();
    let zeros = function(str){
        str+="";
        return str.length === 1 ? '0'+str:str
    }
    return `${d.getFullYear()}-${zeros(d.getMonth()+1)}-${zeros(d.getDate())} ${zeros(d.getHours())}:${zeros(d.getMinutes())}:${zeros(d.getSeconds())}`
}

let addOrUpdateRepo = async function(writeData, repo){
    let {platform,game,newGameBool,device,path} =  writeData;

    console.log('Adding save entry to repo...')
    let result = await c.db.newRepoRecord({
        device,
        game,
        path,
        platform,
        lastCopiedFrom: newGameBool ? makeDate() : '',
        lastCopiedTo: ''
    });

    if(newGameBool && result){
        //Make a repo entry too
        console.log('New Game... creating a repo file...')
        fs.copyFileSync(`./TEMP/${device}/${platform}/${path}`, `${process.env.REPO_PATH}/${platform}/${game}`)
        let repoResult = await c.db.newRepoRecord({
            device : 'repo',
            game,
            path : `/${platform}/${game}`,
            platform,
            lastCopiedFrom: '',
            lastCopiedTo:   makeDate()
        })
        return repoResult;
    }
    return result;
}

module.exports={
    getMasterList,
    getRepo,
    dirCreate,
    dirRemove,
    getOnlinePlatformList,
    getFilteredGameList,
    getFilteredOnlinePlatformDevices,
    getFilteredOnlinePlatformDeviceFileList,
    addOrUpdateRepo
}

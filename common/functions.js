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

//If dir doesn't exist, create it
let dirCreate = function(dir){
    dir = path.join(process.cwd(), dir);
    if(!fs.existsSync(dir))fs.mkdirSync(dir);
}

let dirRemove = function(dir){
    dir = path.join(process.cwd(), dir);
    if(fs.existsSync)fs.rmSync(dir, {recursive:true});

}

module.exports={
    getMasterList,
    dirCreate,
    dirRemove
}

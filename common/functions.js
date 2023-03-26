

//This will only return ONLINE devices that are DISCOVERABLE
let getMasterList = function(deviceList){
    let cleanList = [];
    for(let i = 0; i < deviceList.length; i++){
        let x = deviceList[i];
        if(x.online && x.discover) cleanList.push(x);
    }
    return cleanList
}

module.exports={
    getMasterList
}

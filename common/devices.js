
let getOnlineDevices = async function(config, mode){
    for(let i = 0; i < config.length; i++){
        let device = config[i];
        device.online = false;
        if(mode === "server" && device.type !== "ftp") continue;
        device.online = await c[device.type].onlineCheck(device);
    }
    return config
}

let copyToRepo = async function(devices){

}

module.exports={
    getOnlineDevices,
    copyToRepo
}
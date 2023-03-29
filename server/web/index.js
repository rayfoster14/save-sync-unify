let apiPrefix = "/api";
let htmlArea;
let onlineObj;

let post = async function(url,obj){
    await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(obj)
    })
}

writePrefChange = async function(e){
    let device = e.getAttribute('device');
    let discover = e.checked;
    await post(apiPrefix+'/writePreferences', {
        device,discover
    });
}

let copyToTemp = async function(){
    document.getElementById('copyToTempButton').innerHTML="";
  
    let loading = document.getElementById('loading');
    loading.classList.remove('hidden');

    onlineObj = await (await fetch(apiPrefix+'/copyToTemp')).json();

    loading.classList.add('hidden');

    renderFirstStep()

    
}

let renderMenu = async function(){

    let interface = `
    <div id="menu">
        <button id="addGame"" onClick="addNewGame()">Add New Game</button>
    </div>

    <div id="addNewGame" class="hidden">
        Select Device
        <select id="addGame_device"></select>
        <br>
        Select Platform
        <select class="hidden" id="addGame_platform"></select>
        <br>
        Select File
        <select class="hidden" id="addGame_file"></select>
        <br>
        Existing Game or New Game
        <button class="hidden" id="addGame_existing">Existing</button>
        <button class="hidden" id="addGame_NewGame">New Game</button>
        <br>
        <select class="hidden" id="newGame_existingList"></select>
        <input class="hidden" id="newGame_newGameName" />
    </div>
    `
    htmlArea.innerHTML = interface;
}

let renderFirstStep = async function(){

    let deviceList = await async function(){
        return data = await (await fetch(apiPrefix+'/getOnlineList')).json();
    }();

    let devicePreferences = await async function(){
        return data = await (await fetch(apiPrefix+'/getPreferences')).json();
    }();


   
    let html ="";
    for(let i = 0; i < deviceList.length; i++){
        let device = deviceList[i];
        html +=`<br><input type="checkbox" onClick="writePrefChange(this)" device="${device.device}" id="${device.device}_pref" ${!device.online ? "disabled='true'" : '' } /> ${device.name} : ${device.online?'ONLINE':'UNAVAILABLE'}`
    }
    htmlArea = document.getElementById('content');
    htmlArea.innerHTML = html;

    htmlArea.innerHTML += "<br><div id='copyToTempButton'><button onClick='copyToTemp()'>Copy To Temp</button></div>"
    htmlArea.innerHTML += "<div id='loading' class='hidden'>LOADING... </div>";


    /** Check Marks Set up  */
    for(let i = 0; i < deviceList.length; i++){
        if(deviceList[i].online){
            let device = deviceList[i];
            let deviceId = device.device;
            let checkElem = document.getElementById(`${device.device}_pref`);
            let prefs = devicePreferences.map(function(e){  return e.device; })
            
            //Create entry if not found
            if(prefs.indexOf(deviceId) === -1){
                console.log('new device on this instance');
                await post(apiPrefix+'/writePreferences', {
                    device:deviceId,
                    discover:true
                });
                checkElem.checked = true;
            }else{
                let flag = devicePreferences[prefs.indexOf(deviceId)].discover;
                console.log(flag);
                checkElem.checked = flag === 1 ? true : false;
            }
        }
    }

}

renderFirstStep();
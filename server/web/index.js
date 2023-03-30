let apiPrefix = "/api";
let htmlArea;
let onlineObj;

let post = async function(url,obj, jsonRes){
    let post = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(obj)
    })
    if(jsonRes) return await post.json();
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
    console.log(onlineObj)

    loading.classList.add('hidden');
    renderMenu()
}

let createDropdownSelects = function(arr){
    let select = "";
    arr.forEach(function(x,i){
        if(i===0) select+=`<option value=""></option>`
        select+=`<option value="${x.value ?? x}">${x.text?? x}</option>`
    });
    return select
}

let deviceNewGameElem, platformNewGameElem, fileNewGameElem,existingRepoElem,newGameTextBtn,newGameSelectBtn, createNew, newGameNameElem,newGameSubmitBtn
let addNewGame = async function(){
    let newGameAreaElem = document.getElementById('addNewGame');
    let platformList = await post(apiPrefix+'/getOnlinePlatformList', {online:onlineObj}, true);
    let select = createDropdownSelects(platformList);
    newGameAreaElem.classList.remove('hidden');
    platformNewGameElem.innerHTML = select;
}

let newGameSetPlatform = async function(){
    let platform = platformNewGameElem.value;
    if(platform !== ""){
        let deviceList = await post(apiPrefix+'/getFilteredOnlinePlatformDevices', {online:onlineObj, platform}, true)
        let select = createDropdownSelects(deviceList);
        deviceNewGameElem.classList.remove('hidden');
        deviceNewGameElem.innerHTML = select;
    }

}
let newGameSetDevice = async function(){
    let device = deviceNewGameElem.value;
    let platform = platformNewGameElem.value;
    if(device !== ""){
        let fileList = await post(apiPrefix+'/getFilteredOnlinePlatformDeviceFileList', {online:onlineObj, platform, device}, true)
        let select = createDropdownSelects(fileList);
        fileNewGameElem.classList.remove('hidden');
        fileNewGameElem.innerHTML = select;
    }
}
let newGameSetFile = async function(){
    let file = deviceNewGameElem.value;
    let platform = platformNewGameElem.value;
    if(file!==""){
        let gameList = await post(apiPrefix+'/getFilteredGameList', {platform}, true);
        let select = createDropdownSelects(gameList);
        existingRepoElem.innerHTML = select;
        newGameTextBtn.classList.remove('hidden');
        newGameSelectBtn.classList.remove('hidden');
    }
}

let showNewGameNameField = function(e){
    createNew = e.id==='addGame_NewGame';
    let selectedElem = createNew ? newGameNameElem : existingRepoElem;
    let unSelectedElem =  !createNew ? newGameNameElem : existingRepoElem;
    selectedElem.classList.remove('hidden');
    unSelectedElem.classList.add('hidden');
}

let showSubmit = function(e){
    if(e.value !== "" && e.value){
        newGameSubmitBtn.classList.remove('hidden');
    }
}

let newGameSubmit = async function(){
    let postingData = {
        platform: platformNewGameElem.value,
        game: createNew ? newGameNameElem.value : existingRepoElem.value,
        newGameBool: createNew,
        device: deviceNewGameElem.value,
        path:fileNewGameElem.value
    }
    console.log(postingData)
    let res = await(post(apiPrefix+'/addOrUpdateRepo', postingData, true));
    if(res){
        let addToGameHidden = [deviceNewGameElem, fileNewGameElem,existingRepoElem,newGameTextBtn,newGameSelectBtn, newGameNameElem,newGameSubmitBtn];
        for(let i = 0; i < addToGameHidden.length; i++){
            addToGameHidden[i].classList.add('hidden');
            if(addToGameHidden[i].value) addToGameHidden[i].value = "";
        }
        document.getElementById('addNewGame').classList.add('hidden');
        document.getElementById('menu').classList.add('hidden');
        document.getElementById('successScreen').classList.remove('hidden');
        document.getElementById('successMessage').innerHTML = "Added to Repo"
    }
}

let returnToMenu = function(){
    document.getElementById('successScreen').classList.add('hidden');
    document.getElementById('menu').classList.remove('hidden');
}


 

let renderMenu = async function(){

    let interface = `
    <div id="menu">
        <button id="addGame"" onClick="addNewGame()">Add New Game</button>
    </div>

    <div id="addNewGame" class="hidden">
        Select Platform
        <select onChange="newGameSetPlatform()" id="addGame_platform"></select>
        <br>
        Select Device
        <select onChange="newGameSetDevice()" class="hidden" id="addGame_device"></select>
        <br>
        Select File
        <select onChange="newGameSetFile()" class="hidden" id="addGame_file"></select>
        <br>
        Existing Game or New Game
        <button class="hidden" onClick="showNewGameNameField(this)" id="addGame_existing">Existing</button>
        <button class="hidden" onClick="showNewGameNameField(this)" id="addGame_NewGame">New Game</button>
        <br>
        <select class="hidden" onChange="showSubmit(this)" id="newGame_existingList"></select>
        <input class="hidden" onChange="showSubmit(this)"  id="newGame_newGameName" />
        <br>
        <button class="hidden" id="newGame_submit" onClick="newGameSubmit()">SUBMIT</button>
    </div>
    <div id="successScreen"class="hidden">
        <h2 id="successMessage"></h2>
        <button id="return" onClick="returnToMenu()">Return To Menu</button>
    </div>
    `
    htmlArea.innerHTML = interface;
    deviceNewGameElem = document.getElementById('addGame_device');
    platformNewGameElem = document.getElementById('addGame_platform');
    fileNewGameElem = document.getElementById('addGame_file');
    existingRepoElem = document.getElementById('newGame_existingList');
    newGameNameElem = document.getElementById('newGame_newGameName');
    newGameTextBtn = document.getElementById('addGame_existing');
    newGameSelectBtn = document.getElementById('addGame_NewGame');
    newGameSubmitBtn = document.getElementById('newGame_submit');

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
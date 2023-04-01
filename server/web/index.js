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

let deviceNewGameElem, platformNewGameElem, fileNewGameElem,existingRepoElem,newGameTextBtn,newGameSelectBtn, createNew, newGameNameElem,newGameSubmitBtn, syncGamePlatformElem, syncGameExistingElem, syncGameStartElem, syncGameInfoElem, syncGameDeviceElem,syncGameSyncInfoElem

let latestRepo, pushToList, available

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

let syncGame = async function(){
    let syncArea = document.getElementById('syncGame')
    console.log(syncArea)
    syncArea.classList.remove('hidden');
    let platformList = await post(apiPrefix+'/getOnlinePlatformList', {online:onlineObj}, true)
    let select = createDropdownSelects(platformList);
    syncGamePlatformElem.classList.remove('hidden');
    syncGamePlatformElem.innerHTML = select;

}
let syncGameSetPlatform = async function(){
    let platform = syncGamePlatformElem.value;
    if(platform !== ""){
        let gameList = await post(apiPrefix+'/getFilteredGameList', {platform}, true)
        let select = createDropdownSelects(gameList);
        syncGameExistingElem.classList.remove('hidden');
        syncGameExistingElem.innerHTML = select;
    }
}
let syncGameSetGame  = async function(){
    let game = syncGameExistingElem.value;
    let platform = syncGamePlatformElem.value;
    if(game !== ""){
        let repoData = await post(apiPrefix+'/getRepoStatInfo',{platform,game}, true);
        console.log(repoData)
        
        let nd = async function(d,time){
            return await post(apiPrefix+'/nd',{d,time});
        }
        let infoStr = "";
        available = [];
        for(let i = 0; i < repoData.length; i++){
            infoStr += "<br>"+('----')
            let entry = repoData[i];
            infoStr += "<br>"+(`Device: ${entry.deviceName}`)
            if(entry.lastCopiedTo!==""&&entry.lastCopiedTo)infoStr += "<br>"+(`Last Time Copied to: ${await nd(entry.lastCopiedTo, true)} `)
            if(entry.lastCopiedFrom!==""&&entry.lastCopiedFrom)infoStr += "<br>"+(`Last Time Copied from: ${await nd(entry.lastCopiedFrom, true)}`)
            if(entry.present){
                available.push(entry)
                infoStr += "<br>"+('Status: AVAILABLE')
                infoStr += "<br>"+(`Modified Time: ${await nd(entry.modifiedTime,true)}`)
                infoStr += "<br>"+(`Checksum: ${entry.crc32}`)
            }else{
                infoStr += "<br>"+('Status: UNAVAILABLE')
            }
            infoStr += "<br>"+('');
        }
        let availableDevices = available.map(function(x){
            return {value:x.device, text:x.deviceName}
        });
        let select = createDropdownSelects(availableDevices);
        syncGameDeviceElem.classList.remove('hidden');
        syncGameDeviceElem.innerHTML = select;
        syncGameInfoElem.classList.remove('hidden');
        syncGameInfoElem.innerHTML = infoStr;
    }
}
let syncGameSetDevice = async function(){
    let device = syncGameDeviceElem.value;
    if(device!==""){
        latestRepo;
        pushToList = [];
        for(let i = 0; i < available.length; i++){
            if(available[i].device === device){
                latestRepo = available[i]
            }else{
                pushToList.push(available[i]);
            }
        }
        let htmlStr = `Copying the save from ${latestRepo.deviceName} to:`

        for(let u = 0; u < pushToList.length; u++){
            htmlStr+=('\n'+`${pushToList[u].deviceName}`)
        }
        syncGameSyncInfoElem.innerHTML = htmlStr;
        syncGameSyncInfoElem.classList.remove('hidden');
        syncGameStartElem.classList.remove('hidden');
    }
}
let syncGameStart = async function(){
    let res = await post(apiPrefix+'/syncTheSave', {
        latest: latestRepo,
        pushList: pushToList
    }, true);
    console.log(res)
}

let renderMenu = async function(){

    let interface = `
    <div id="menu">
        <button id="addGame"" onClick="addNewGame()">Add New Game</button>
        <button id="syncGameBtn" onClick="syncGame()">Sync a Game</button>
        
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

    <div id="syncGame" class="hidden">
        Select Platform
        <select onChange="syncGameSetPlatform()" id="syncGame_platform"></select>
        <br>
        Select Game
        <select class="hidden" onChange="syncGameSetGame()" id="syncGame_existingList"></select>
        <br>
        <div id="syncGame_info" class="hidden"></div>
        Select Latest Device
        <select class="hidden" onChange="syncGameSetDevice()" id="syncGame_device"></select>
        <br>
        <div id="syncGame_syncInfo" class="hidden"></div>
        <button id="syncGame_start" onClick="syncGameStart()" class="hidden">Sync</button>

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
    syncGameExistingElem = document.getElementById('syncGame_existingList');
    syncGamePlatformElem = document.getElementById('syncGame_platform');
    syncGameDeviceElem = document.getElementById('syncGame_device');
    syncGameInfoElem = document.getElementById('syncGame_info');
    syncGameStartElem = document.getElementById('syncGame_start');
    syncGameSyncInfoElem = document.getElementById('syncGame_syncInfo');

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
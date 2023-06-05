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
    document.getElementById('startButtonDiv').classList.add('hidden');

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

let deviceNewGameElem, platformNewGameElem, fileNewGameElem,existingRepoElem,newGameTextBtn,newGameSelectBtn, createNew, newGameNameElem,newGameSubmitBtn, syncGamePlatformElem, syncGameExistingElem, syncGameStartElem, syncGameInfoElem, syncGameDeviceElem,syncGameSyncInfoElem, mainMenu, newGameNameArea ,existingRepoArea

let addPlatformArea, addDeviceArea, addFileArea, addNameArea,  syncGameGameArea,
syncGameDeviceArea

let latestRepo, pushToList, available;


let resetElements = function(){
    let addToGameHidden = [deviceNewGameElem, fileNewGameElem,existingRepoElem,newGameTextBtn,newGameSelectBtn, newGameNameElem,newGameSubmitBtn, syncGameExistingElem, syncGameStartElem, syncGameInfoElem, syncGameDeviceElem,syncGameSyncInfoElem, addDeviceArea, addFileArea, addNameArea,  newGameNameArea ,existingRepoArea,  syncGameGameArea, syncGameDeviceArea ];
    for(let i = 0; i < addToGameHidden.length; i++){
        addToGameHidden[i].classList.add('hidden');
        if(addToGameHidden[i].value) addToGameHidden[i].value = "";
    }
    document.getElementById('pushRepo').classList.remove('is-success');
}

let addNewGame = async function(){
    let newGameAreaElem = document.getElementById('addNewGame');
    mainMenu.classList.add('hidden');
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
        addDeviceArea.classList.remove('hidden')
        deviceNewGameElem.innerHTML = select;
    }

}
let newGameSetDevice = async function(){
    let device = deviceNewGameElem.value;
    let platform = platformNewGameElem.value;
    if(device !== ""){
        let fileList = await post(apiPrefix+'/getFilteredOnlinePlatformDeviceFileList', {online:onlineObj, platform, device}, true)
        let select = createDropdownSelects(fileList);
        addFileArea.classList.remove('hidden')
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

    let selectedElemArea = createNew ? newGameNameArea : existingRepoArea;
    let unSelectedElemArea =  !createNew ? newGameNameArea : existingRepoArea;
    selectedElemArea.classList.remove('hidden');
    unSelectedElemArea.classList.add('hidden');

    addNameArea.classList.remove('hidden');
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
       resetElements();
        document.getElementById('addNewGame').classList.add('hidden');
        document.getElementById('menu').classList.add('hidden');
        document.getElementById('successScreen').classList.remove('hidden');
        document.getElementById('successMessage').innerHTML = "Added to Repo"
    }
}



let returnToMenu = function(){
    document.getElementById('successScreen').classList.add('hidden');
    document.getElementById('menu').classList.remove('hidden');

    resetElements();
    document.getElementById('addNewGame').classList.add('hidden');
    document.getElementById('syncGame').classList.add('hidden')
}

let syncGame = async function(){
    let syncArea = document.getElementById('syncGame');
    mainMenu.classList.add('hidden');
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
        syncGameGameArea.classList.remove('hidden');
        syncGameExistingElem.innerHTML = select;
    }
}
let syncGameSetGame  = async function(){
    let game = syncGameExistingElem.value;
    let platform = syncGamePlatformElem.value;
    if(game !== ""){
        let repoData = await post(apiPrefix+'/getRepoStatInfo',{platform,game}, true);
        console.log(repoData)
        let zeros = function(str){
            str+="";
            return str.length === 1 ? '0'+str:str
        }
        let nd = function(date,incTime){
            if(!date) return '';
            if(typeof(date)==="string") date = new Date(date);
            let d = date;
            return`${zeros(d.getDate())}/${zeros(d.getMonth()+1)}/${d.getFullYear()} ${incTime?`${zeros(d.getHours())}:${zeros(d.getMinutes())}:${zeros(d.getSeconds())}`:""}`
        }
        let infoStr = "";
        available = [];
        for(let i = 0; i < repoData.length; i++){
            let entry = repoData[i];

            infoStr+=`<div class="nes-container deviceListing with-title ${entry.present?'':'unavailableDevice'}" style="margin-bottom:20px;">
            <h3 class="title">${entry.deviceName}</h3>
            <div class="nes-table-responsive">
            <table class="nes-table is-bordered is-centered">
            <tbody>
                <tr>
                    <td>Last Copied to</td>
                    <td>${nd(entry.lastCopiedTo, true)}</td>
                </tr>
                <tr>
                    <td>Last Copied from</td>
                    <td>${nd(entry.lastCopiedFrom, true)}</td>
                </tr>
                <tr>
                    <td>Last Modified</td>
                    <td>${nd(entry.modifiedTime, true)}</td>
                </tr>
            </tbody>
            </table>
            </div>
            `
            if(entry.present){
                available.push(entry)
                 infoStr+=`
                <br>
                <div class="nes-container is-centered is-dark with-title">
                    <p class="title">Checksum</p>
                    <p>${entry.crc32}</p>
                </div>
            `
            }
            console.log(entry)
            infoStr += "</div>"
        }
        let availableDevices = available.map(function(x){
            return {value:x.device, text:x.deviceName}
        });
        let select = createDropdownSelects(availableDevices);
        syncGameDeviceElem.classList.remove('hidden');
        syncGameDeviceElem.innerHTML = select;
        syncGameDeviceArea.classList.remove('hidden')
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
        let htmlStr = ` 
        <div class="nes-container is-centered is-dark with-title">
        <p class="title">Copying Save from</p>
        <p>${latestRepo.deviceName}</p>
        </div><br>
        <div class="nes-container is-centered is-dark with-title">
        <p class="title">Copying Save to</p><p>
        `

        for(let u = 0; u < pushToList.length; u++){
            htmlStr+=`${pushToList[u].deviceName}<br>`
        }
        htmlStr += `</p></div><br>`
        syncGameSyncInfoElem.innerHTML = htmlStr;
        syncGameSyncInfoElem.classList.remove('hidden');
        syncGameStartElem.classList.remove('hidden');
        
    }
}
let syncGameStart = async function(){
    document.getElementById('syncGame').classList.add('hidden')
    resetElements()
    let res = await post(apiPrefix+'/syncTheSave', {
        latest: latestRepo,
        pushList: pushToList
    }, true);
    if(res.successful){
        document.getElementById('successScreen').classList.remove('hidden');
        document.getElementById('successMessage').innerHTML = "Sync Completed"
    }else{
        document.getElementById('successMessage').innerHTML = "Sync Failed"
    }
}

let pushRepo = async function(){  
    let button = document.getElementById('pushRepo');
    button.classList.add('is-disabled');
    let startingText = button.innerHTML

    button.innerHTML='Main Repo...'
    let res = await post(apiPrefix+'/gitPush', {
        path: ''
    }, true);
    console.log(res);

    if(!res)return

    button.innerHTML='Trace Repo...'
    let res2 = await post(apiPrefix+'/gitPush', {
        path: '/TRACE'
    }, true);
    console.log(res2);

    if(!res2)return

    button.innerHTML='Device Repo...'
    let res3 = await post(apiPrefix+'/gitPush', {
        path: '/DEVICE'
    }, true);
    console.log(res3);

    button.innerHTML= startingText;
    button.classList.remove('is-disabled');
    button.classList.add('is-success')
}

let reRenderMapping = async function(){
    let mappingList = await (await fetch(apiPrefix+'/getFullMapping')).json();
      console.log(mappingList);
      let newText = "";
      let currentPlatform = "";
      let currentGame = "";

      for(let i = 0; i < mappingList.length; i++){
        let newPlatform = currentPlatform === mappingList[i].platform;
        let newGame = currentGame === mappingList[i].game;
        if(!newPlatform) currentPlatform = mappingList[i].platform;
        if(!newGame) currentGame = mappingList[i].game;
        newText += `
        ${!newPlatform?`<h2>${mappingList[i].platform}</h2>`:''}
        ${!newGame?`<h3 style="color:#777;margin-top:20px">${mappingList[i].game}</h3><hr>`:''}
        <i class="nes-icon close deleteBtn" style="transform:none;float:left;margin-top:4px;"onClick="deleteMapping(this)" mappingID=${mappingList[i].id} id="delete_${mappingList[i].id}"> </i>
          <div><div>${mappingList[i].device} </div><div style="font-size:9px; color:${mappingList[i].exists?'#8cc757':'#999'}">${mappingList[i].path}</div></div><br>
        `
      }
      document.getElementById('mappingTableContent').innerHTML = newText;
}

let toggleHidden = function(elem){
    elem.classList.toggle('hidden')
}

let toggleMapping = async function(){
    let mappingElem = document.getElementById('mappingTable');
    toggleHidden(mappingTable);
}
let togglePath = async function(elem){
    let toggleElemID = elem.getAttribute('pathID');
    let toggleElem = document.getElementById(`${toggleElemID}_path`);
    toggleHidden(toggleElem);
}

let deleteMapping = async function(elem){
    let rmID = elem.getAttribute('mappingID');
    let res = await post(apiPrefix+'/deleteMappingEntry', {
        id: rmID
    }, true);
    if(res){
        await reRenderMapping()
    }else{
        elem.classList.add('error')
    }
}



let renderMenu = async function(){

    let interface = `
    <div id="menu">
    <div class="leftButtonDiv">
        <button id="addGame"" class="nes-btn" onClick="addNewGame()">Add Game</button>
    </div>
    <div class="rightButtonDiv">
        <button id="syncGameBtn" class="nes-btn" onClick="syncGame()">Sync Game</button>
    </div>
    <div class="leftButtonDiv" style="margin-top:20px;">
        <button id="pushRepo" class="nes-btn" onClick="pushRepo()">Git Push</button>
    </div>
    <div class="rightButtonDiv" style="margin-top:20px;">
        <button id="toggleMapping" class="nes-btn" onClick="toggleMapping()">View Games</button>
    </div>
        
    </div>

    <div id="addNewGame"  class="hidden nes-container with-title">
        <h3 class="title">Add a Game</h3>
        <div id="addGame_platform_area">
        <label for="addGame_platform" >Select Platform</label>
        <div class="nes-select">
            <select onChange="newGameSetPlatform()" id="addGame_platform"></select>
        </div>
        </div>
        <br>

        <div id="addGame_device_area">
        <label for="addGame_device" >Select Device</label>
        <div class="nes-select">
            <select onChange="newGameSetDevice()" class="hidden" id="addGame_device"></select>
        </div>
        </div>
        <br>

        <div id="addGame_file_area">
        <label for="addGame_file" >Select File</label>
        <div class="nes-select">
            <select onChange="newGameSetFile()" class="hidden" id="addGame_file"></select>
        <br>
        </div>
        </div>
        <br>

        <div class="leftButtonDiv">
            <button class="hidden nes-btn" onClick="showNewGameNameField(this)" id="addGame_existing">Existing</button>
        </div>
        <div class="rightButtonDiv">
            <button class="hidden nes-btn" onClick="showNewGameNameField(this)" id="addGame_NewGame">New Game</button>
        </div>
        <br>
        <div id="addGame_name_area">
        
            <div id="newGame_existingListArea" class="nes-select">
            <label for="newGame_existingList">Select a Game</label>
            <select class="hidden nes-input" onChange="showSubmit(this)" id="newGame_existingList"></select>
            </div>

            <div id="newGame_newGameNameArea" class="nes-field">
            <label for="newGame_newGameName">Type a new name</label>
            <input class="hidden nes-input" onChange="showSubmit(this)"  id="newGame_newGameName" />
            </div>
            </div>
        <br>

        <button class="hidden nes-btn is-primary" id="newGame_submit" onClick="newGameSubmit()">Let's go</button>
        <div class="rightButtonDiv">
        <button id="goBack" class="nes-btn" onClick="returnToMenu()">Back</button>
    </div>

    </div>

    <div id="syncGame" class="hidden nes-container with-title">
    <h3 class="title">Sync a Game</h3>

    <div id="syncGame_platformArea">
        <label for="syncGame_platform" >Select Platform</label>
        <div class="nes-select">
            <select onChange="syncGameSetPlatform()" id="syncGame_platform"></select>
        </div>
    </div>
    <br>

    <div id="syncGame_existingList_area">
        <label for="syncGame_existingList" >Select Game</label>
        <div class="nes-select">
        <select class="hidden" onChange="syncGameSetGame()" id="syncGame_existingList"></select>
        </div>
    </div>
    <br>

    <div id="syncGame_info" class="hidden"></div>
    <br>

    <div id="syncGame_device_area">
        <label for="syncGame_device" >Select latest Device</label>
        <div class="nes-select">
        <select class="hidden" onChange="syncGameSetDevice()" id="syncGame_device"></select>

        </div>
    </div>
    <br>
   
        <div id="syncGame_syncInfo" class="hidden"></div>
        <br>
        <div style="margin:auto">
        <button id="syncGame_start" class="nes-btn is-primary" onClick="syncGameStart()" class="hidden">Sync</button>
        </div>
        <div class="rightButtonDiv">
        <button id="goBack" class="nes-btn" onClick="returnToMenu()">Back</button>
    </div>

    </div>

    <div id="successScreen"class="hidden nes-container is-centered">
        <h2 id="successMessage" class="nes-text is-primary"></h2>
        <button id="return" class="nes-btn is-primary" onClick="returnToMenu()">Return To Menu</button>
    </div>

    <div id="mappingTable" style="margin-top:30px;" class="hidden nes-container ">
    <h2  class="nes-text is-primary">Mapping Table</h2>
    <div id="mappingTableContent"></div>

    </div>
 
    `
    htmlArea.innerHTML = interface;
    mainMenu = document.getElementById('menu')
    deviceNewGameElem = document.getElementById('addGame_device');
    platformNewGameElem = document.getElementById('addGame_platform');
    addFileArea = document.getElementById('addGame_file_area');
    addDeviceArea = document.getElementById('addGame_device_area');
    addPlatformArea = document.getElementById('addGame_platform_area');
    addNameArea = document.getElementById('addGame_name_area');
    fileNewGameElem = document.getElementById('addGame_file');
    existingRepoElem = document.getElementById('newGame_existingList');
    newGameNameArea = document.getElementById('newGame_newGameNameArea')
    existingRepoArea = document.getElementById('newGame_existingListArea')
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

    syncGameGameArea = document.getElementById('syncGame_existingList_area');
    syncGameDeviceArea = document.getElementById('syncGame_device_area')

    resetElements()
    await reRenderMapping();

}


let renderFirstStep = async function(){

    let deviceList = await async function(){
        return data = await (await fetch(apiPrefix+'/getOnlineList')).json();
    }();

    let devicePreferences = await async function(){
        return data = await (await fetch(apiPrefix+'/getPreferences')).json();
    }();


   //Device List HTML
    let html =`<div class="nes-container with-title "><p class="title">Devices</p>`;
    for(let i = 0; i < deviceList.length; i++){
        let device = deviceList[i];
        html +=`<label>
            <input class="nes-checkbox" type="checkbox" onClick="writePrefChange(this)" device="${device.device}" id="${device.device}_pref" ${!device.online ? "disabled='true'" : '' } />
            <span class="nes-text ${device.online?'is-success':'is-disabled'}"> ${device.name} </span>
        </label><br>`
    }
    html+='</div>'
    htmlArea = document.getElementById('content');
    htmlArea.innerHTML = html;

    //Buttons HTML
    htmlArea.innerHTML += `<br>
    <div id="startButtonDiv">
    <div class="leftButtonDiv" id='copyToTempButton'>
        <button class="nes-btn" onClick='copyToTemp()'>Start</button>
    </div>
    <div id='configButton' class="rightButtonDiv">
        <button class="nes-btn"  onClick="location.href = 'config.html'" >Config</button>
    </div>
    </div>`

    htmlArea.innerHTML += `<div id='loading' class='hidden nes-container is-centered'> <h3>Please standby</h3> </div>`;


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
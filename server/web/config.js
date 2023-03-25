let fieldList = [];
let save = async function(e){
    let id = e.getAttribute('deviceid');
    let attrFields = document.getElementsByClassName('attrField');
    let postData = {id};
    for(let i = 0; i < attrFields.length; i++){
        let thisElem = attrFields[i];
        let thisID = thisElem.getAttribute('deviceid');
        let thisField = thisElem.getAttribute('fieldname');
        let thisVal = thisElem.value;
        thisElem
        if(thisID === id){
            postData[thisField] = thisVal
        }
    }
    let response = await (await fetch('/configData/writeDevice', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(postData)
    })).json();

    e.classList.remove('successful');
    e.classList.remove('failed');
    e.classList.add(response.writeResponse?'successful':'failed')    
}

let newRow = function(){
    document.getElementById('addBtn').classList.add('hidden');
    let html="<div class='deviceFields'>"

    for(let e = 0; e < fieldList.length; e++){
        let fieldName = fieldList[e];
        html += `${fieldName}<input class="attrField" fieldname="${fieldName}"  />`
    }
    html+=`<span onClick="save(this)"  id="NEW_SAVE">SAVE</span></div>`;
    let htmlArea =  document.getElementById('content');
    htmlArea.innerHTML += html;
}

let render = async function(){

    let data = await (await fetch('/configData/getDevices')).json();
    console.log(data);

    let html =`<span id="addBtn" onClick="newRow()">ADD</span><br>`;
    for(let i = 0; i < data.length; i++){
        let fields = Object.keys(data[i]);
        html+="<div class='deviceFields'>"
        for(let e = 0; e < fields.length; e++){
            let fieldName = fields[e];
            if(fieldName === "id") continue;
            if(fieldList.indexOf(fieldName) === -1) fieldList.push(fieldName)
            html += `${fieldName}<input class="attrField" deviceid="${data[i].id}" fieldname="${fieldName}" id="${data[i].id}&${fieldName}" value="${data[i][fieldName]}" />`
        }
        html+=`<span onClick="save(this)" deviceid="${data[i].id}" id="${data[i].id}_SAVE">SAVE</span></div>`
    }
    let htmlArea = document.getElementById('content');
    htmlArea.innerHTML = html;
}

render();
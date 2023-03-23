
let main = async function(){

    let data = await (await fetch('/configData')).json();
    console.log(data);

    let html = ""
    for(let i = 0; i < data.length; i++){

        let fields = Object.keys(data[i]);

        for(let e = 0; e < fields.length; e++){
            let fieldName = fields[e];
            if(fieldName === "id") continue;
            html += `${fieldName}<input id="${data[i].id}&${fieldName}" value="${data[i][fieldName]}" />`
        }
        html+=`<br>`
    }

    let htmlArea =  document.getElementById('content');
    htmlArea.innerHTML = html;


}

main();
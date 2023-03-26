const sqlite3 = require('sqlite3').verbose();
let fs = require('fs');
let path = process.env.REPO_PATH;
let dbFile = `${path}/repo.db`;
let db;
let tables = {
    devices:{
        "device":	        "TEXT",
        "type":             "TEXT",
        "paths"	:           "TEXT",
        "ftpUser":      	"TEXT",
        "ftpPW":	        "TEXT",
        "name":         	"TEXT",
        "localExistCheck":	"TEXT",
        "ftpAddress":	    "TEXT",
        "extensionSearch":	"TEXT",
        "ftpPort":	        "TEXT"
    },
    discovery:{
            "device":	"TEXT",
	        "instance":	"TEXT",
	        "discover":	"INTERGER"
    }
}



let get = function(y){
    return new Promise(function(resolve,reject){
    db = new sqlite3.Database(dbFile, sqlite3.OPEN_READWRITE, (err) => {
        db.all(y,function(err,res){
            if(err){
                console.log(err)
                resolve(false)
            }
            resolve(res);
        });
        });
        db.close();
    })
}

let write = function(y, z){
    return new Promise(function(resolve,reject){
    db = new sqlite3.Database(dbFile, sqlite3.OPEN_READWRITE, (err) => {
        db.run(y,z,function(err,res){
            if(err){  console.log(err); resolve(false) }
            resolve(true);
        });
        });
        db.close();
    })
}

let objToUpdate = function(obj){
    let id = obj.id;
    delete obj.id;
    let keys = Object.keys(obj);
    let vals = Object.values(obj);
    vals.push(id);
    return {
        fields: keys.join(" = ? , ") + " = ? ",
        vals, 
    }
}
let objToNew = function(obj){
    let keys = Object.keys(obj);
    let vals = Object.values(obj);
    let qs = [];
    for(let i = 0; i < vals.length; i++){
        qs.push('?')
    }
    return {
        fields: keys.join(','),
        qs: qs.join(','),
        vals
    }
}
    

let setup = async function(){
    if(!fs.existsSync(dbFile)) fs.writeFileSync(dbFile,'');
    db = new sqlite3.Database(dbFile, sqlite3.OPEN_READWRITE, (err) => {
        if (err) {
        console.error(err.message);
        }

        Object.values(tables).forEach(function(table, tableIndex){
            
            let keys = Object.keys(table);
            let vals = Object.values(table);

            let fields = "";
            for(let i = 0; i < keys.length; i++){
                fields += `${keys[i]} ${vals[i]}${i === keys.length-1 ? "":","}${"\n"}`
            }

            let createQuery = `CREATE TABLE ${Object.keys(tables)[tableIndex]} (id INTEGER PRIMARY KEY AUTOINCREMENT, ${fields})`;
            db.run(createQuery,function(err){if(err){}});
            
        })
        //console.log('Connected to the database.');
    });
    db.close()
};

let getConfig = async function(){
    return await get(`SELECT * FROM devices`);
}

let writeConfig = async function(data){
    if(data.id){
        let toUpdate = objToUpdate(data);
        let query = `UPDATE devices SET ${toUpdate.fields} WHERE id = ?`;
        let response =  await write(query, toUpdate.vals);
        return response;
    }else{
        delete data.id
        let toNew = objToNew(data);
        let query = `INSERT INTO devices (${toNew.fields}) VALUES (${toNew.qs})`;
        let response = await write(query, toNew.vals);
        return response
    }
}

let getPreferences = async function(instance){
    return await get(`SELECT * FROM discovery WHERE instance = "${instance}"`)
}

let writePreference = async function(instance, {device, discover}){
    let obj = {device,instance,discover};
    let currentData = await get(`SELECT * FROM discovery WHERE instance = "${instance}" AND device = "${device}"`);
    if(currentData.length !== 0 ){
        obj.id = currentData[0].id;
        let toUpdate = objToUpdate(obj);
        let query = `UPDATE discovery SET ${toUpdate.fields} WHERE id = ?`;
        let response =  await write(query, toUpdate.vals);
        return response;
    }else{
        let toNew = objToNew(obj);
        let query = `INSERT INTO discovery (${toNew.fields}) VALUES (${toNew.qs})`;
        let response = await write(query, toNew.vals);
        return response
    }
}

module.exports={setup, getConfig, writeConfig, getPreferences, writePreference}
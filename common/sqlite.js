const sqlite3 = require('sqlite3').verbose();
let fs = require('fs');
let path = process.env.REPO_PATH;
let dbFile = `${path}/repo.db`;
let db;
let tables = {
    platforms:{
        device: 'text',
        type: 'text',
        paths: 'text',
        ftpUser:'text',
        ftpPW:'text',
        discovery_server: 'boolean',
        discoovery_local: 'boolean'
    }
}

let get = function(y){
    return new Promise(function(resolve,reject){
    db = new sqlite3.Database(dbFile, sqlite3.OPEN_READWRITE, (err) => {
        db.all(y,function(err,res){
            if(err){   }
            resolve(res);
        });
        });
        db.close();
    })
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
        console.log('Connected to the database.');
    });
    db.close()
};

let getConfig = async function(){
    return await get(`SELECT * FROM platforms`);
}

module.exports={setup, getConfig}
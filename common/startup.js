let db = require('./sqlite.js');
let fs = require('fs');
let pth = require('path');
let crypto = require('crypto');

module.exports = async function(){

    if(!process.env.REPO_PATH){
        console.log('NO REPO PATH')
    }else{
        if(!fs.existsSync(process.env.REPO_PATH))fs.mkdirSync(process.env.REPO_PATH)
    }
    if(!fs.existsSync('./TEMP'))fs.mkdirSync('./TEMP');


    //Makes runtime identity
    let identifierPath = pth.join(process.cwd(), 'instance');
    global.identity = fs.existsSync(identifierPath) ? fs.readFileSync(identifierPath).toString() : function(){
        let newId = crypto.randomBytes(8).toString('hex');
        fs.writeFileSync(identifierPath, newId);
        return newId;
    }();
    

    //DB Check
    await db.setup();

}
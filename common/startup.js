let db = require('./sqlite.js');
let fs = require('fs');
let pth = require('path');
let crypto = require('crypto');

module.exports = async function(){
    //Makes runtime identity
    let identifierPath = pth.join(process.cwd(), 'instance');
    global.identity = fs.existsSync(identifierPath) ? fs.readFileSync(identifierPath).toString() : function(){
        let newId = crypto.randomBytes(8).toString('hex');
        fs.writeFileSync(identifierPath, newId);
        return newId;
    }();
    
    let path = process.env.REPO_PATH;

    //DB Check
    await db.setup();

}
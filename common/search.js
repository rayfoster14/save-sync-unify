let fs = require('fs');

module.exports = function(){

    let path = process.env.REPO_PATH;
    let dir = fs.readdirSync(path);
    return JSON.stringify(dir);
    
}
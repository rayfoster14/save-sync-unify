let db = require('./sqlite.js')

module.exports = async function(){
    let path = process.env.REPO_PATH;

    //DB Check
    await db.setup();

}
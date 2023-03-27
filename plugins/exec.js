/*****
 * THIS FILE WILL PARSE PLUGINS FROM THE PLUGIINS DIRECTORY. 
 * LIB.JS WILL NOT BE COMPILED INTO EXECUTABLE
 * LIB.JS AND OTHER PLUGINS NEED TO BE ADDED TO ./plugins DIRECTORY
 */

module.exports={
    plugins: function(){
        let path = require('path');
        let fs = require('fs');
        let root = fs.existsSync('./plugins/lib.js')? '.': '..';
        let fpath = path.join(process.cwd(), root+'/plugins/lib.js');
        let functions = {};
        if(fs.existsSync(fpath)) functions = eval(fs.readFileSync(fpath,'utf8'));
        return functions
    }
}
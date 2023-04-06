
if(process.argv.indexOf('server') !== -1) {
    require('./server/server.js')();
}
else if(process.argv.indexOf('local') !== -1) {
    require('./local/local.js')();
} else{
    console.log('cli or server');
    let rls = require('readline-sync');
    let key = rls.keyInYN('CLI version?');
    if(key){
        require('./local/local.js')();

    }else{
        require('./server/server.js')();

    }
}
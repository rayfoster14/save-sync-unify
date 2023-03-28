
if(process.argv.indexOf('server') !== -1) {
    require('./server/server.js')();
}
else if(process.argv.indexOf('local') !== -1) {
    require('./local/local.js')();
} else{
    console.log('local or server')
}
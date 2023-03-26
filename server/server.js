const express = require('express')
const app = express();
const port = 3000;
const path = require('path');
const fs = require('fs');

require('dotenv').config();
global.c = require('../common/common.js');
app.use(express.urlencoded({
    extended: true
}));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'web')));
app.use(express.static(__dirname, { dotfiles: 'allow' } ));

c.startup();
let instance = fs.readFileSync('instance').toString();

let apiPrefix = "/api"

app.get(apiPrefix+'/getOnlineList', async function(request,response){
    let config = await c.db.getConfig();
    let online = await c.devices.getOnlineDevices(config, 'server');
    response.send(online);
    response.end();
})
app.get(apiPrefix+'/getPreferences', async function(request,response){
    let preferences = await c.db.getPreferences(instance);
    response.send(preferences);
    response.end();
})
app.post(apiPrefix+'/writePreferences', async function(request, response){
    let writeResponse = await c.db.writePreference(instance, request.body);
    response.send(JSON.stringify({writeResponse}));
    response.end()
})

/**CONFIG PAGE**/
app.get('/configData/getDevices',  async function(request,response){
    let config =  await c.db.getConfig();
    response.send(config);
    response.end()
});
app.get('/configData/getSchema',  async function(request,response){
    let schema =  await c.db.getSchema();
    response.send(schema);
    response.end()
});
app.post('/configData/writeDevice', async function(request, response){
    console.log(request.body)

    let writeResponse;
    if(request.body&&request.body.device) 
        writeResponse = await c.db.writeConfig(request.body);
    response.send(JSON.stringify({writeResponse}));
    response.end()
})


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
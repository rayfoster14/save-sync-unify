const express = require('express')
const app = express()
const port = 3000;
const path = require('path');

require('dotenv').config()
let c = require('../common/common.js');
app.use(express.urlencoded({
    extended: true
}));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'web')));
app.use(express.static(__dirname, { dotfiles: 'allow' } ));

/**CONFIG PAGE**/
app.get('/configData/getDevices',  async function(request,response){
    let config =  await c.db.getConfig();
    response.send(config);
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
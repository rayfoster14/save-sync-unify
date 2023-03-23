const express = require('express')
const app = express()
const port = 3000;
const path = require('path');

require('dotenv').config()
let c = require('../common/common.js');
app.use(express.urlencoded({
    extended: true
}));
app.use(express.static(path.join(__dirname, 'web')));
app.use(express.static(__dirname, { dotfiles: 'allow' } ));


app.get('/configData',  async function(request,response){
    let config =  await c.db.getConfig();
    console.log(config)
    response.send(config);
    response.end()
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
//require configuration file / SETUP env veriables
require('../config/config');
const express = require('express');
const server = express();
const bodyParser = require('body-parser');


const PORT = process.env.PORT || 5000;


const ClientIp = require('./middleware/userInfo');
const authentication = require('./middleware/authentication');
const SERVER_ERROR = require('./const/server_error');

// Middlewares
server.disable('x-powered-by');
server.use(bodyParser.urlencoded({extended: true}));
server.use(bodyParser.json());
server.use(ClientIp); //check client and get info

// Routing
require('./router/user_router')(server, authentication);
require('./router/aquarium_router')(server, authentication);

server.all('*', (req, res) => {
  res.send('Not Found');
});


// start server
server.listen(PORT, (err) => {
  console.dir( err || `Server is running on Port: ${PORT}`);
})

module.exports = server;
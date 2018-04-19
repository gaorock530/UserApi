// require configuration file / SETUP env veriables
require('../config/config');
// load core modules
const express = require('express');
const server = express();
const bodyParser = require('body-parser');
// load database
require('./db/mongoose');
// load system Const
const PORT = process.env.PORT || 5000;
// load middlewares
const ClientIp = require('./middleware/userInfo');
const authentication = require('./middleware/authentication');

// Use Middlewares
server.disable('x-powered-by');
server.use(bodyParser.urlencoded({extended: true}));
server.use(bodyParser.json());
server.use(ClientIp); //check client and get info

// Routing
require('./router/user_router')(server, authentication);
// require('./router/aquarium_router')(server, authentication);

// handle unknown request
server.all('*', (req, res) => {
  res.status(404).send('Not Found');
});

// start server
server.listen(PORT, (err) => {
  console.log( err || `Server is running on Port: ${PORT}`);
})

// export module for testing
module.exports = {server};
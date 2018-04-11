//require configuration file / SETUP env veriables
require('../config/config');
const express = require('express');
const server = express();
const bodyParser = require('body-parser');
const _ = require('lodash');

const PORT = process.env.PORT || 5000;

const api = require('../database/UserAPI');
const ClientIp = require('./middleware/userInfo');
const {ConvertUTCTimeToLocalTime} = require('./helper/timezone');
const authentication = require('./middleware/authentication');

// Middlewares
server.disable('x-powered-by');
server.use(bodyParser.urlencoded({extended: true}));
server.use(bodyParser.json());
server.use(ClientIp); //check client and get info


// Routing
// get single userinfo {USER, ADMIN, SUPER, OWNER}
server.get('/user/:username', authentication({auth: 'USER'}), async (req, res) => {
  try {
    const user = await api.findByName(req.params.username);

    if (req.access.grade > user.authType.grade || 
        (req.access.grade === user.authType.grade && 
        req.params.username.toUpperCase() === req.access.username.toUpperCase()))
        res.send(user); 
    else res.send('Over Looked!');
  }catch(e) {
    res.send('Not Authorized! 3');
  }
});

// get all users {SUPER, OWNER}
server.get('/users', authentication({auth: 'ADMIN'}), async (req, res) => {
  let date;
  // handles like '/users?type=admin'
  if (req.query.type && !req.query.username) {
    // if on some level get 'not authorized'
    if (api.authLevel(req.query.type.toUpperCase()) >= req.access.grade) {
      return res.send('Not Authorized! 3');
    }else {
      // if fatcher level > type level
      data = await api.fatch({ 'authType.level': req.query.type.toUpperCase(), 'authType.grade': {$lt: req.access.grade} });
    }
  // handle default '/users'
  }else {
    data = await api.fatch({ 'authType.grade': {$lt: req.access.grade} });
  }
  res.send({total: data.length, data});
});


// test data
server.get('/test', (req, res) => {
  const data = require('./helper/example');
  const users = [];
  try {
    data.map(async ({username, email, phone, password, ip, client, expires, authType}) => {
      await api.register(username, email, phone, password, ip, client, expires, authType)
    });
    res.send('ok')
  }catch(e) {
    res.send(e);
  }
});

server.post('/register', async (req, res) => {
  const {user, password, email, phone} = req.body;
  const IP = req.realIP + req.clientIP;
  const CLIENT = req.clientAgent;
  const expires = ConvertUTCTimeToLocalTime(true, null, process.env.EXPIRES_DAY);

  try {
    const r = await api.register(user, email, phone, password, IP, CLIENT, expires);
    res.send(r);
  }catch(e) {
    res.send(e);
  }
});

//
server.delete('/user/:username', authentication({auth: 'SUPER'}), async (req, res) => {
  const username = req.params.username;
  try {
    const cb = await api.deleteOne(username);
    res.send(cb);
  }catch(e){
    res.send(e);
  }
});

server.put('/update/auth', authentication({auth: 'SUPER'}), async (req, res) => {
  const value = parseInt(req.body.value);
  if (!req.body.name) res.send('Please add \'?name=\' after url');
  else if (!value || value !== -1 && value !== 1) res.send('Please add \'?value=(1|-1)\' after url');
  else {
    try {
      const user = await api.findByName(req.body.name);
      if (req.access.grade > user.authType.grade && 
          user.authType.grade + value >= 2 && 
          user.authType.grade + value < req.access.grade) 
      {
        const cb = await api.updateAuth(user._id, value, user.authType.grade, req.access.username); 
        res.send(cb);
      } else res.send('Not Authorized! 3');
    }catch(e) {
      res.send(e);
    } 
  }
});


server.put('/update/details', authentication({auth: 'SELF'}), async (req, res) => {
  const opts = _.pick({}, req.body);
  // req.access._id
})

server.all('*', (req, res) => {
  res.send('Not Found');
})


// start server
server.listen(PORT, (err) => {
  console.dir( err || `Server is running on Port: ${PORT}`);
})

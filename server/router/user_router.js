const _ = require('lodash');
const api = require('../../database/UserAPI');
const {ConvertUTCTimeToLocalTime} = require('../helper/timezone');
const SERVER_ERROR = require('../const/server_error');

module.exports = (server, authentication) => {
  // get single userinfo {USER, ADMIN, SUPER, OWNER}
  server.get('/user/:username', authentication({auth: 'USER'}), async (req, res) => {
    try {
      const user = await api.findByName(req.params.username);
      if (!user) return res.send({code: 404, msg: 'Not Found'}); 
      if (req.access.grade > user.authType.grade || 
          (req.access.grade === user.authType.grade && 
          req.params.username.toUpperCase() === req.access.username.toUpperCase()))
          res.send({code: 200, data: user}); 
      else res.send({code: 401, msg: 'Over Looked!'});
    }catch(e) {
      console.log(e);
      res.send(SERVER_ERROR);
    }
  });

  // get all users {SUPER, OWNER}
  server.get('/users', authentication({auth: 'ADMIN'}), async (req, res) => {
    let date;
    // handles like '/users?type=admin'
    try {
      if (req.query.type) {
        // if on some level get 'not authorized'
        if (api.authLevel(req.query.type.toUpperCase()) >= req.access.grade) {
          return res.send({code: 401, msg: 'NOT Authorized!', trace: 3});
        }else {
          // if fatcher level > type level
          data = await api.fatch({ 'authType.level': req.query.type.toUpperCase(), 'authType.grade': {$lt: req.access.grade} });
          if (!data) return res.send({code: 404, msg: 'No result!', trace: 'auth'});
        }
      // handle default '/users'
      }else {
        data = await api.fatch({ 'authType.grade': {$lt: req.access.grade} });
        if (!data) return res.send({code: 404, msg: 'No result!', trace: 'auth'});
      }
      res.send({code: 200, total: data.length, data});
    }catch(e) {
      console.log(e);
      res.send(SERVER_ERROR);
    }
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
      console.log(e);
      res.send(SERVER_ERROR);
    }
  });

  server.post('/register', async (req, res) => {
    const {name, password, email, phone} = req.body;
    if (!name || !password || !email || !phone) return res.send('missing info');
    const expires = ConvertUTCTimeToLocalTime(true, null, process.env.EXPIRES_DAY);
    try {
      const r = await api.register(name, email, phone, password, req.userInfo.IP, req.userInfo.agent, expires);
      res.send(r);
    }catch(e) {
      console.log(e);
      res.send(SERVER_ERROR);
    }
  });

  server.post('/login', async(req, res) => {
    //check if complete body
    const {loginString, password} = req.body;
    if (!loginString || !password) return res.send({code: 500, msg: 'missing info'});
    //check input type
    let check = '';
    if (api.vaildEmail(loginString)) check = {'email': loginString.toUpperCase()};
    else if (api.vaildPhone(loginString)) check = {'phone' :loginString};
    else if (api.vaildUsername(loginString)) check = {'username': loginString};
    else return res.send('input not vaild!');

    try {
      const user = await api.check(check);
      if (!user) return res.send({code: 404, msg: 'user not found'});
      const isPasswordVaild = await api.checkPassword(user, password);
      if (!isPasswordVaild) return res.send({code: 401, msg: 'password not correct'});
      const token = await user.generateAuthToken(req.userInfo.IP, req.userInfo.agent, process.env.EXPIRES_DAY);
      return res.send({
        user: user.username,
        token
      });
    }catch(e) {
      console.log(e);
      res.send(SERVER_ERROR);
    }
  });

  server.post('/logout', authentication({auth: 'SELF'}), async (req, res) => {
    try {
      const token = await api.findByToken(req.headers.token);
      // return console.log(req.headers.token);
      if (!token) return res.send({code: 404, msg: 'Invaild token'});
      const cb = await api.logout(req.header.token);
      res.send(cb);
    }catch(e) {
      console.log(e);
      res.send(SERVER_ERROR);
    }
    

  })

  //delete user
  server.delete('/user/:username', authentication({auth: 'SUPER'}), async (req, res) => {
    const username = req.params.username;
    try {
      const isDeleted = await api.deleteOne(username);
      if(isDeleted) return res.send({code: 200, msg: `delete ${username} successfully!`});
      res.send({code: 404, msg: `${username} not exist!`});
    }catch(e){
      console.log(e);
      res.send(SERVER_ERROR);
    }
  });

  server.put('/update/auth', authentication({auth: 'SUPER'}), async (req, res) => {
    const value = parseInt(req.body.value);
    if (!req.body.name) return res.send('Please add \'?name=\' after url');
    else if (!value || value !== -1 && value !== 1) return res.send('Please add \'?value=(1|-1)\' after url');
    else {
      try {
        const user = await api.findByName(req.body.name);
        if (!user) return res.send({code: 404, msg: 'user not found'});
        if (req.access.grade > user.authType.grade && 
            user.authType.grade + value >= 2 && 
            user.authType.grade + value < req.access.grade) 
        {
          const updatedLevel = await api.updateAuth(user._id, value, user.authType.grade, req.access.username); 
          if (updatedLevel) return res.send({code: 200, msg: `User: <${user.username}> is now at authLevel - {${updatedLevel}}`});
        } else res.send({code: 401, msg: 'AuthLevel Exceeded!'});
      }catch(e) {
        res.send(SERVER_ERROR);
      } 
    }
  });


  server.put('/update/profile', authentication({auth: 'SELF'}), async (req, res) => {
    const opts = _.pick(req.body, ['username', 'password', 'email', 'phone']);
    if (Object.keys(opts).length === 0) res.send('bad request!');
    else {
      try{
        const data = await api.updateProfile(req.access._id, opts);
        res.send({code: 200, msg: 'profile updated!', data});
      }catch(e) {
        console.log(e);
        res.send(SERVER_ERROR);
      }
    }
  });

  // server.put('/frozen/:username', authentication({auth: 'ADMIN'}), (req, res) => {

  // });

  // server.put('/defrozen/:username', authentication({auth: 'ADMIN'}), (req, res) => {
    
  // });
}


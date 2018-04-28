const _ = require('lodash');
const api = require('../api/userAPI');
const {ConvertUTCTimeToLocalTime} = require('../helper/timezone');
const ERROR = require('../const/error');




module.exports = (server, authentication) => {
  /**
   * -------------------------------------
   * @description{Quary}
   * -------------------------------------
   */

  // get single userinfo {USER, ADMIN, SUPER, OWNER}
  server.get('/user/:username', authentication({auth: 'USER'}), async (req, res) => {
    try {
      const user = await api.findByName(req.params.username);
      if (!user) return res.status(404).send(ERROR(404)); 
      if (req.user.auth.grade > user.auth.grade || 
          req.params.username.toUpperCase() === req.user.nameForCheck)
          res.status(200).send({data: user}); 
      else res.status(401).send(ERROR(401));
    }catch(e) {
      console.log(e);
      res.status(403).send(ERROR(403));
    }
  });

  // get all users {SUPER, OWNER}
  server.get('/users', authentication({auth: 'ADMIN'}), async (req, res) => {
    let date;
    // handles like '/users?type=admin'
    try {
      if (req.query.type) {
        // if on some level get 'not authorized'
        if (api.authLevel(req.query.type.toUpperCase()) >= req.user.auth.grade) {
          return res.status(401).send(ERROR(401));
        }else {
          // if fatcher level > type level
          data = await api.fatch({ 'auth.level': req.query.type.toUpperCase(), 'auth.grade': {$lt: req.user.auth.grade} });
        }
      // handle default '/users'
      }else {
        data = await api.fatch({ 'auth.grade': {$lt: req.user.auth.grade} });
      }
      // check if data has result
      if (!data || data.length === 0) return res.status(404).send(ERROR(404));
      res.status(200).send({total: data.length, data});
    }catch(e) {
      console.log(e);
      res.status(403).send(ERROR(403));
    }
  });

  /**
   * -------------------------------------
   * @description{Register}
   * -------------------------------------
   */

  // test data
  server.get('/test', (req, res) => {
    // return res.status(200).send('ok');
    const expires = ConvertUTCTimeToLocalTime(true, null, process.env.EXPIRES_DAY);
    const data = require('../helper/example');
    const users = [];
    try {
      data.map(async ({username, email, phone, password, authType}) => {
        let user = await api.register(username, email, phone, password, req.userInfo.IP, req.userInfo.agent, expires, authType)
        console.log(user)
      });
      res.status(200).send('ok')
    }catch(e) {
      console.log(e);
      res.status(403).send(ERROR(403));
    }
  });

  server.post('/register', async (req, res) => {
    const registerObj = _.pick(req.body, api.allowedToModify);
    if (!registerObj.username || !registerObj.password || !registerObj.email || !registerObj.phone) return res.status(400).send(ERROR(400));
    const expires = ConvertUTCTimeToLocalTime(true, null, process.env.EXPIRES_DAY);
    try {
      const cb = await api.register(registerObj, req.userInfo.IP, req.userInfo.agent, expires);
      res.status(cb.code).send(ERROR(cb.code, cb.msg));
    }catch(e) {
      console.log(e);
      res.status(403).send(ERROR(403));
    }
  });

  /**
   * -------------------------------------
   * @description{Login/out}
   * -------------------------------------
   */
  server.post('/login', async(req, res) => {
    //check if complete body
    const {loginString, password} = req.body;
    if (!loginString || !password) return res.status(400).send(ERROR(400));
    //check input type
    let check;
    if (api.vaildEmail(loginString)) check = {'email': loginString.toUpperCase()};
    else if (api.vaildPhone(loginString)) check = {'phone' :loginString};
    else if (api.vaildUsername(loginString)) check = {'nameForCheck': loginString.toUpperCase()};
    else return res.status(400).send(ERROR(400, 'Input Not Vaild!'));

    try {
      const user = await api.check(check);
      if (!user) return res.status(404).send(ERROR(404));
      const isPasswordVaild = api.checkPassword(user, password);
      if (!isPasswordVaild) return res.status(401).send(ERROR(401));
      const expires = ConvertUTCTimeToLocalTime(true, null, process.env.EXPIRES_DAY);
      const token = await user.generateAuthToken(req.userInfo.IP, req.userInfo.agent, expires);
      return res.status(200).send({
        user: user.username,
        token
      });
    }catch(e) {
      console.log(e);
      res.status(403).send(ERROR(403));
    }
  });

  server.post('/logout', authentication({auth: 'SELF'}), async (req, res) => {
    // return console.log(req.user, req.headers.token);
    try {
      const cb = await req.user.removeToken(req.headers.token);
      if (!cb) res.status(403).send(ERROR(403));
      res.status(200).send(`${req.user.username} has logged out!`);
    }catch(e) {
      console.log(e);
      res.status(403).send(ERROR(403));
    }
  })

  /**
   * -------------------------------------
   * @description{Update}
   * -------------------------------------
   */
  server.put('/update/auth', authentication({auth: 'SUPER'}), async (req, res) => {
    const value = parseInt(req.body.value) || 0;
    if (!req.body.name) return res.status(400).send(ERROR(400, 'Please add \'?name=\' after url'));
    else if (value !== -1 && value !== 1) return res.status(400).send(ERROR(400, 'Please add \'?value=(1|-1)\' after url'));
    else {
      try {
        const user = await api.findByName(req.body.name);
        if (!user) return res.send({code: 404, msg: 'user not found'});
        if (req.user.auth.grade > user.auth.grade && 
            user.auth.grade + value >= 2 && 
            user.auth.grade + value < req.user.auth.grade) 
        {
          const updatedLevel = await api.updateAuth(user._id, value, user.auth.grade, req.user._id); 
          if (updatedLevel) return res.status(200).send({code: 200, msg: `User: <${user.username}> is now at authLevel - {${updatedLevel}}`});
        } else res.status(406).send(ERROR(406, 'AuthLevel Exceeded!'));
      }catch(e) {
        console.log(e);
        res.status(403).send(ERROR(403));
      } 
    }
  });


  server.put('/update/profile', authentication({auth: 'SELF'}), async (req, res) => {
    const opts = _.pick(req.body, ['username', 'password', 'email', 'phone', 'pic']);
    if (Object.keys(opts).length === 0) return res.status(400).send(ERROR(400));
    else {
      try{
        const cb = await api.updateProfile(req.user._id, opts);
        if (cb.code !== 200) return res.status(cb.code).send(ERROR(cb.code, cb.msg))
        res.status(200).send(`${Object.keys(cb.update)} has been modified successfully!`);
      }catch(e) {
        console.log(e);
        res.status(403).send(ERROR(403));
      }
    }
  });

  // server.put('/frozen/:username', authentication({auth: 'ADMIN'}), (req, res) => {

  // });

  // server.put('/defrozen/:username', authentication({auth: 'ADMIN'}), (req, res) => {
    
  // });
}


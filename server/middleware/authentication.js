'use strict';

const {User} = require('../models/users');
const {authLevel} = require('../api/userAPI');

const ERROR = require('../const/error');

const authentication = (options) => {
  return async (req, res, next) => {
    try {
      // check if Token is vaild
      const user = await User.verifyToken(req.headers.token, req.userInfo.IP, req.userInfo.agent);
      if (!user) return res.status(401).send(ERROR(401, 'Please login!'));
      // check if user authentication level is qualified
      if (user.auth.grade < authLevel(options.auth)) return res.status(401).send(ERROR(401)); 
      // if ok set user Object
      req.user = user;
      next();
    } catch(e) {
      console.log(e)
      res.status(403).send(ERROR(403));
    }
  };
}



module.exports = authentication;
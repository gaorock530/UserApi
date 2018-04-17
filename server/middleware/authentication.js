const {findByToken, authLevel} = require('../../database/UserAPI');

const SERVER_ERROR = require('../const/server_error');

const isLogin = async (token) => {
  try{
    const user = await findByToken(token);
    return user || false;
  }catch(e) {
    return false;
  }
}

const qualified = async (user, auth) => {
  try{
    const level = authLevel(auth);
    return (user.access >= level) ? {grade: user.access, username: user.username, _id: user._id} : false;
  }catch(e) {
    return false;
  }
}

const authentication = (options) => {
  return async (req, res, next) => {
    try {
      const login = await isLogin(req.headers.token);
      if (!login) return res.send({code: 401, msg: 'Please login!'});
      const access = await qualified(login, options.auth);
      if (!access) return res.send({code: 401, msg: 'NOT Authorized!', trace: 1}); 
      req.access = access;
      next();

    } catch(e) {
      console.log(e)
      res.send(SERVER_ERROR);
    }
  };
}



module.exports = authentication;
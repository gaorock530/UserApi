const {findByToken, authLevel} = require('../../database/UserAPI');

const isLogin = async (token) => {
  try{
    const user = await findByToken(token);
    return user ? true : false;
  }catch(e) {
    return false;
  }
}

const qualified = async (token, auth) => {

  try{
    const user = await findByToken(token);
    const level = authLevel(auth);
    return (user.access >= level) ? {grade: user.access, username: user.username, _id: user._id} : false;
  }catch(e) {
    return false;
  }
}

const authtication = (options) => {
  return async (req, res, next) => {
    // console.log(req.headers.token);
    console.log('log from node: ' + req.path);
    try {
      const login = await isLogin(req.headers.token);
      if (!login) return res.send('Please login!');
      const access = await qualified(req.headers.token, options.auth);
      if (!access) return res.send('Not Authorized 1'); 
      req.access = access;
      next();

    } catch(e) {
      res.send('Not Authorized 2');
    }
  };
}



module.exports = authtication;
const mongoose = require('mongoose');
const UserSchema = require('./schema/user_schema');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const _ = require('lodash');

mongoose.connect(process.env.MONGODB_URI);

const userDatabase = mongoose.model('testUser', UserSchema);

class User {
  constructor(userDatabase) {
    this.data = userDatabase;
  }

  static get allowedToModify () {
    return ['username', 'password', 'address', 'email', 'phone', 'DOB']
  }

  static get allowedToDisplay () {
    return ['username', 'address', 'email', 'phone', 'DOB']
  }

  vaildPassword (password) {
    return password.match(/(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/g);
  }
  vaildPhone (phone) {
    return validator.isMobilePhone(phone.toString(), ['zh-CN'])
  }
  vaildEmail (email) {
    return validator.isEmail(email.toString());
  }
  vaildUsername (name) {
    return (name && typeof name === 'string' && name.match(/^(?!_)(?!.*?_$)[a-zA-Z0-9_\u4e00-\u9fa5]{6,16}$/g));
  }

  async check (prop) {
    try {
      return await userDatabase.findOne(prop);
    }catch(e) {
      throw e;
    }
  }

  async checkPassword (user, password) {
    try {
      return await bcrypt.compare(password, user.password);
    }catch(e) {
      throw e;
    }
  }

  authLevel (auth) {
    auth = typeof auth === 'string'? auth.toUpperCase(): auth;
    switch (auth) {
      case 'OWNER': 
        return 5;
      case 'SUPER':
        return 4;
      case 'ADMIN':
        return 3;
      case 'USER':
        return 2;
      case 'SELF':
        return 1;
      case 5: 
        return 'OWNER';
      case 4:
        return 'SUPER';
      case 3:
        return 'ADMIN';
      case 2:
        return 'USER';
      case 1:
        return 'SELF';
      default:
        throw false;
    }
  }

  
  async register (username, email, phone, password, ip, client, expires, authType) {
    let invaild = [];
    authType = authType || 'USER';
    // vaildate format
    if (!this.vaildEmail(email)) invaild.push({'email': 'example@world.com'});
    if (!this.vaildPhone(phone)) invaild.push({'phone': '13681221170'});
    if (!this.vaildUsername(username)) invaild.push({'username': 'Minimum 6 characters'});
    if (!this.vaildPassword(password)) invaild.push({'password': 'Minimum 8 characters, at least one letter and one number'});
    if (invaild.length > 0) return {code: 405, invaild};
    // vaildate availability
    if (await this.check({nameForCheck: username.toUpperCase()})) invaild.push({'username': 'in use'});
    if (await this.check({email: email.toUpperCase()})) invaild.push({'email': 'in use'});
    if (await this.check({phone})) invaild.push({'phone': 'in use'});
    if (invaild.length > 0) return {code: 405, invaild};
    
    try{
      const user = await new userDatabase({
        username, 
        email, 
        phone, 
        password, 
        registerClient: client, 
        authType: { level: authType, grade: this.authLevel(authType) }
      }).save();
      const token = await user.generateAuthToken(ip, client, expires);
      return {
        username: user.username,
        token
      };
    }catch(e) {
      throw (e);
    }
  }

  async findById (_id) {
    try {
      const user = await userDatabase.findById(_id);
      if (user) return user;
      return false;
    }catch(e){
      return e;
    }
  }

  async findByToken (token) {
    try {
      const user = await userDatabase.findByToken(token);
      if (user) return user;
      return false;
    }catch(e){
      return e;
    }
  }

  async findByName (name) {
    try {
      return await userDatabase.findOne({nameForCheck: name.toUpperCase()});
    }catch(e){
      throw e;
    }
  }

  async fatch (obj) {
    obj = obj || {};
    try {
      return await userDatabase.find(obj).sort({ 'authType.grade': -1 }).sort({ nameForCheck: 1 });
    }catch(e){
      return e
    }
  }

  async deleteOne (name) {
    try {
      const cb = await userDatabase.deleteOne({nameForCheck: name.toUpperCase()});
      return (cb.n === 1)? true: false;
    }catch(e){
      throw e
    }
  }

  async updateAuth (_id, step, initialLevel, by) {
    const newLevel = this.authLevel(initialLevel + step);
    try {
      const update = await userDatabase.findOneAndUpdate({_id}, { 
        $inc: { 'authType.grade': step },
        $set: { 'authType.level': newLevel}
      }, {new: true});
      const user = await update.record('upgrade', `change to ${newLevel}`, by);
      return user ? user.authType.level: false;
    }catch(e){
      return e
    }
  }

  // TBC and fix
  async updateProfile (_id, obj) {
    if (!obj || typeof obj !=='object') throw ('2nd Argument must be a Object');
    try {
      const opts = _.pick(obj, User.allowedToModify);
      if (_.has(opts, 'username')) opts.nameForCheck = opts.username.toUpperCase();
      if (_.has(opts, 'email')) opts.email = opts.email.toUpperCase();
      if (_.has(opts, 'password')) {
        const salt = await bcrypt.genSalt(10);
        // actual hashing 
        const hash = await bcrypt.hash(opts.password, salt);
        opts.password = hash;
      }
      const update = await userDatabase.findOneAndUpdate({_id}, opts, {new: true});
      update.email = update.email.toLowerCase();
      return _.pick(_.pick(update, User.allowedToDisplay), Object.keys(opts));
    }catch(e) {
      throw e;
    }    
  }

  async logout(token) {
    try {
      const res = await userDatabase.removeToken(token);
     return res;
    }catch(e){
      throw e;
    }
  }


}

module.exports = new User();
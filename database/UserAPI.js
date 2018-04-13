const mongoose = require('mongoose');
const UserSchema = require('./schema/user_schema');
const validator = require('validator');
const bcrypt = require('bcryptjs');

mongoose.connect(process.env.MONGODB_URI);

const userDatabase = mongoose.model('testUser', UserSchema);

class User {
  constructor(userDatabase) {
    this.data = userDatabase;
  }
/*  
Minimum eight characters, at least one letter and one number:
"^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$"

Minimum eight characters, at least one letter, one number and one special character:
"^(?=.*[A-Za-z])(?=.*\d)(?=.*[$@$!%*#?&])[A-Za-z\d$@$!%*#?&]{8,}$"

Minimum eight characters, at least one uppercase letter, one lowercase letter and one number:
"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$"

Minimum eight characters, at least one uppercase letter, one lowercase letter, one number and one special character:
"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$@$!%*?&])[A-Za-z\d$@$!%*?&]{8,}"

Minimum eight and maximum 10 characters, at least one uppercase letter, one lowercase letter, one number and one special character:
"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$@$!%*?&])[A-Za-z\d$@$!%*?&]{8,10}"
*/
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
    return (name && typeof name === 'string' && name.length>=5);
  }

  async check (prop) {
    const res = await this.data.findOne(prop);
    return res || false;
  }

  authLevel (auth) {
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
        return false;
    }
  }

  async register (username, email, phone, password, ip, client, expires, authType) {
    let invaild = [];
    authType = authType || 'USER';
    // vaildate format
    if (!this.vaildEmail(email)) invaild.push({'email': 'example@world.com'});
    if (!this.vaildPhone(phone)) invaild.push({'phone': '13681221170'});
    if (!this.vaildUsername(username)) invaild.push({'username': 'Minimum 5 characters'});
    if (!this.vaildPassword(password)) invaild.push({'password': 'Minimum 8 characters, at least one letter and one number'});
    if (invaild.length > 0) return invaild;
    // vaildate availability
    if (await this.check({nameForCheck: username.toUpperCase()})) invaild.push({'username': 'in use'});
    if (await this.check({email: email.toUpperCase()})) invaild.push({'email': 'in use'});
    if (await this.check({phone})) invaild.push({'phone': 'in use'});
    if (invaild.length > 0) return invaild;
    
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
    }catch(e) {
      return e;
    }
    //console.log('from UserAPI', {token});
    
    return {user, token};
  }

  async findById (_id) {
    try {
      const user = await userDatabase.findOne({_id});
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
      const user = await userDatabase.findOne({nameForCheck: name.toUpperCase()});
      if (user) return user;
      return false;
    }catch(e){
      return e;
    }
  }

  async fatch (obj) {
    obj = obj || {};
    try {
      const data = await userDatabase.find(obj).sort({ 'authType.grade': -1 }).sort({ nameForCheck: 1 });
      return data;
    }catch(e){
      return e
    }
  }

  async deleteOne (name) {
    try {
      const res = await userDatabase.deleteOne({nameForCheck: name.toUpperCase()});
      return res;
    }catch(e){
      return e
    }
  }

  async updateAuth (_id, step, initial, by) {
    const newLevel = this.authLevel(initial + step);
    try {
      await userDatabase.findOne({_id}).update({ 
        $inc: { 'authType.grade': step },
        $set: { 'authType.level': newLevel}
      });
      const user = await userDatabase.findOne({_id})
      const cb = user.updateStatus('active', `change to ${newLevel}`, by);
      return cb;
    }catch(e){
      return e
    }
  }
}

module.exports = new User(userDatabase);
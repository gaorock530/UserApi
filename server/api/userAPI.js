const _ = require('lodash');
const validator = require('validator');
const {User} = require('../models/users');
const bcrypt = require('bcryptjs');

const allowedToDisplay = ['username', 'address', 'email', 'phone', 'DOB', 'pic'];
const allowedToModify = ['username', 'password', 'address', 'email', 'phone', 'DOB', 'pic', 'gender'];

function vaildPassword (password) {
  return password.match(/(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/g);
}
function vaildPhone (phone) {
  return validator.isMobilePhone(phone.toString(), ['zh-CN'])
}
function vaildEmail (email) {
  return validator.isEmail(email.toString());
}
function vaildUsername (name) {
  return (name && typeof name === 'string' && name.match(/^(?!_)(?!.*?_$)[a-zA-Z0-9_\u4e00-\u9fa5]{6,16}$/g));
}
function authLevel (auth) {
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
      throw 'invaild auth type';
  }
}

async function validation (obj) {
  const opts = _.pick(obj, allowedToModify);
  if (Object.keys(opts).length === 0) return {code: 400, msg: 'wrong header parameters.'};
  for (let prop in opts) {
    switch (prop) {
      case 'username':
        if (!vaildUsername(opts[prop])) return {code: 406, msg: 'username: Minimum 6 characters'};
        const name = opts[prop].toUpperCase();
        if (await check({nameForCheck: name})) return {code: 406, msg: 'username in use'};
        opts.nameForCheck = name;
        break;
      case 'email':
        if (!vaildEmail(opts[prop])) return {code: 406, msg: 'email: example@world.com'};
        const email = opts[prop].toUpperCase();
        if (await check({email})) return {code: 406, msg: 'email in use'};
        opts.email = email;
        break;
      case 'password':
        if (!vaildPassword(opts[prop])) return {code:406, msg: 'password: Minimum 8 characters, at least one letter and one number'};
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(obj.password, salt);
        opts.password = hash;
        break;
      case 'phone':
        if (!vaildPhone(opts[prop])) return {code:406, msg: 'phone: 13681221170'};
        if (await check({phone: opts[prop]})) return {code: 406, msg: 'phone in use'};
        break;
      case 'DOB':
        const DOB = JSON.parse(opts[prop]);
        if (!DOB.year || !DOB.month || !DOB.day) return {code:406, msg: 'DOB: {year, month, day}'};
        opts.DOB = DOB;
        break;
      case 'address':
        const props = ['country', 'state', 'city', 'district', 'street', 'detail'];
        const address = _.pick(JSON.parse(opts[prop]), props);
        if (Object.keys(address).length < 4) return {code:406, msg: 'address: {country, state, city, district, street, detail}'};
        props.map((key) => {
          if (!address[key]) address[key] = '';
        });
        opts.address = address;
        break;
      case 'pic':
        if (!validator.isURL(opts[prop])) return {code:406, msg: 'Pic: Not vaild URL address'};
        break;
      case 'gender':
        opts.gender = !!opts[prop];
        break;
    }
  }
  return opts;
}

async function check (prop) {
  try {
    return await User.findOne(prop);
  }catch(e) {
    throw e;
  }
}

async function fatch (obj) {
  obj = obj || {};
  try {
    return await User.find(obj).sort({ 'auth.grade': -1 }).sort({ nameForCheck: 1 });
  }catch(e){
    return e
  }
}


async function register (obj, ip, client, expires, authType) {
  authType = authType || 'USER';
  try{
    // validate user input
    const opts = await validation(obj);
    // send error info if something wrong
    if (opts.code) return opts;
    // add addintional info
    opts.registerClient = client;
    opts.auth = { level: authType, grade: authLevel(authType) };
    // register user
    const user = await new User(opts).save();
    // get Token
    const token = await user.generateAuthToken(ip, client, expires);
    return {
      code: 200, 
      msg: {
        username: user.username,
        token,
        expires: new Date(expires)
      }
    };
  }catch(e) {
    throw (e);
  }
}

async function findByName (name) {
  try {
    return await User.findOne({nameForCheck: name.toUpperCase()});
  }catch(e){
    throw e;
  }
}

function checkPassword (user, password) {
  return bcrypt.compare(password, user.password);
}

async function updateAuth (_id, step, initialLevel, by) {
  const newLevel = authLevel(initialLevel + step);
  try {
    const update = await User.findOneAndUpdate({_id}, { 
      $inc: { 'auth.grade': step },
      $set: { 'auth.level': newLevel}
    }, {new: true});
    const user = await update.recordEvent('upgrade', `change to ${newLevel}`, by);
    return user ? user.auth.level: false;
  }catch(e){
    return e
  }
}

async function updateProfile (_id, obj) {
  try {
    // validate user input
    const opts = await validation(obj);
    // if anything wrong
    if (opts.code) return opts;
    // update user info
    const update = await User.findOneAndUpdate({_id}, opts, {new: true});
    // return lowwercase email address
    update.email = update.email.toLowerCase();
    return {code:200, update: _.pick(_.pick(update, allowedToDisplay), Object.keys(obj))};
  }catch(e) {
    throw e;
  }    
}

module.exports = {
  allowedToModify,
  check,
  vaildPhone,
  vaildEmail,
  vaildUsername,
  register,
  authLevel,
  fatch,
  findByName,
  checkPassword,
  updateAuth,
  updateProfile
}
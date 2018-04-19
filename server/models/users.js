const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
//jwt.sign / jwt.verify
const bcrypt = require('bcryptjs');
const validator = require('validator');
const {hex_md5} = require('../../server/helper/md5');
const {b64_sha256} = require('../../server/helper/sha256');
const _ = require('lodash');
const {ConvertUTCTimeToLocalTime} = require('../../server/helper/timezone');

const schema = new mongoose.Schema({
  /*-----------------------------------------------
    Basic feilds
  -------------------------------------------------*/ 
  username: { 
    type: String, 
    required: true,
    trim: true,
    unique: true,
    minlength: 5
  },
  nameForCheck: { type: String, unique: true },
  password: { type: String, required: true },
  DOB: {
    year: {type: Number, min: 1920, max: 3000},
    month: {type: Number, min: 1, max: 12},
    day: {type: Number, min: 1, max: 31}
  },
  gender: {type: Boolean, default: null},
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: validator.isEmail,
      message: '{VALUE} is not a valid Email address'
    }
  },
  phone: { type: Number, unique: true, required: true },
  pic: {type: String, default: null},
  address: {
    country: {type: String},
    state: {type: String},
    city: {type: String},
    district: {type: String},
    street: {type: String},
    detail: {type: String},
    zip: {type: String}
  },
  
  /*-----------------------------------------------
    show other public feilds
  -------------------------------------------------*/ 
  seller: { type: Boolean, default: false },
  balance: {
    usable: {type: Number, default: 0},
    deposit: {type: Number, default: 0}
  },
  /*-----------------------------------------------
    System feilds
  -------------------------------------------------*/ 
  registedDate: { type: Date, default: ConvertUTCTimeToLocalTime(true) },
  lastVisit: { type: Date, default: ConvertUTCTimeToLocalTime(true) },
  registerClient: { type: Object, required: true },
  activity: { type: String, default: 'active' }, //{active, inactive, frozen, banned}
  auth: { // auth type: USER, ADMIN(trade, topics), SUPER, OWNER
    level: { type: String, default: 'USER' },
    grade: { type: Number, default: 2 }
  },
  records: [
    { //{register, update, upgrade, downgrade, upSeller, downSeller}
      event: { type: String, required: true },
      log: { type: String, required: true },
      date: { type: Date, required: true },
      by: { type: String, required: true }
    }
  ],
  tokens: [
    {
      access: { type: String, required: true },
      token: { type: String, required: true },
      expires: { type: Number, required: true }
    }
  ],
  grade: {
    buyer: {
      level: {type: Number, default: 1},
      points: {type: Number, default: 0}
    },
    seller: {
      level: {type: Number, default: 1},
      points: {type: Number, default: 0}
    }
  },
  /*-----------------------------------------------
    Optional feilds
  -------------------------------------------------*/   
  transactions: [
    { //{paid, cancelled, transport, received, done}
      status: {type: String},
      items: [
        {
          id: {type: String},
          amount: {type: Number},
          price: {type: Number}
        }
      ],
      date: {type: Date},
      transport: {
        company: {type: String},
        serialNo: {type: String}
      },
      feedback: {
        stars: {type: Number},
        message: {type: String}
      }
    }
  ]
}); 

// schema.method.toJSON = function () {
//   let user = this;
//   let userObject = user.toObject();
//   return _.pick(userObject, ['_id', 'username', 'email'])
// }

// Class method for generate Token
schema.methods.generateAuthToken = function (ip, client, expires) {
  const user = this;
  // user access level - {USER, ADMIN(trade, topics), SUPER, OWNER}
  const access = this.auth.grade;
  if (!ip || !client || !expires) throw 'Missing....{ip, client, expires}';
  // make hash value of IP + Client
  const hash = b64_sha256(hex_md5(ip + client));
  let token = jwt.sign({
    _id: user._id.toHexString(),  // user_id: 5ad63292c1bedd0c9378af0a
    access,                       // access level: 2
    hash,                         // hash contains IP + Client: pKDcCf+HJX+vJLStdNPPgJp1RtVSiDLN3JM0KL7hSKQ
    expires                       // token expires timestamp: 1524618158943
  }, process.env.JWT_SECRET);
  // push Token with something into user Tokens Array
  user.tokens.push({access, token, expires});
  // save user
  return user.save().then(() => {
    return token
  }).catch((e)=>{
    throw e
  });
}

schema.methods.removeToken = function (token) {
  const user = this;
  return user.update({
    $pull: {
      tokens: {token}
    }
  });
}

schema.methods.recordEvent = function (event, log, by) {
  let user = this;
  user.records.push({event, log, date: ConvertUTCTimeToLocalTime(true), by});
  return user.save().then().catch(e => {throw e});
}

// Class method for decoding Token
// schema.statics.findByToken = async function (token) {
//     let User = this;
//     let decoded, user;
//     try {
//       // Token decoding...
//       decoded = jwt.verify(token, process.env.JWT_SECRET)
//       // Finding user with decoded info
//       user = await User.findOne({
//         '_id': decoded._id,
//         'tokens.token': token,
//         'tokens.access': decoded.access 
//       })
//       // return Object for further authentication
//       return {
//         expires: decoded.expires,
//         token: token, 
//         ip: decoded.ip, 
//         client: decoded.client, 
//         username: user.username, 
//         _id: decoded._id, 
//         access: decoded.access
//       }
//     }catch(e) {
//       return false;
//     }
// }

schema.statics.verifyToken = async function (token, ip, client) {
  const users = this;
  try {
    // decode token into payload
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    // use payload info find user
    const user = await users.findOne({
      '_id': payload._id,
      'tokens.token': token,
      'tokens.access': payload.access 
    });
    // check if user exists
    if (!user) {
      console.log('user not found || token removed');
      return false;
    }
    // check if token expires
    if (payload.expires < ConvertUTCTimeToLocalTime(true)) {
      //remove expired token
      const cb = await user.update({ $pull: { tokens: {token} } });
      console.log({cb ,msg: 'token expired and will be removed'})
      return false; 
    }
    // check if this token is generated by the same client (IP + Client)
    const hash = b64_sha256(hex_md5(ip + client));
    if (hash !== payload.hash) {
      console.log('not same client');
      return false;
    }
    return user;
  }catch(e) {
    console.log(e)
    return false;
  }
}


// Pre 'save' middleware
schema.pre('save', function (next) {
  const user = this;
  // Capitalize username for checking unique
  user.nameForCheck = user.username.toUpperCase();
  // Capitalize email for checking unique
  user.email = user.email.toUpperCase();
  // only save password when it's created or changed
  if (user.isModified('password')) {
    // hashing password using bcrypt with 10 rounds of salting (~10 hashes / sec)
    bcrypt.genSalt(10, (err, salt) => {
      // actual hashing 
      bcrypt.hash(user.password, salt, (err, hash) => {
        user.password = hash;
        next();
      });
    });
  } else {
    next();
  }
});

const User = mongoose.model('User', schema);

module.exports = {User};
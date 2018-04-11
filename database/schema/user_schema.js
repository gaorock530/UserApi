const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
//jwt.sign / jwt.verify
const bcrypt = require('bcryptjs');
const validator = require('validator');
const _ = require('lodash');
const {ConvertUTCTimeToLocalTime} = require('../../server/helper/timezone');

const schema = new mongoose.Schema({
  /*-----------------------------------------------
    Required feilds
  -------------------------------------------------*/ 
  username: { 
    type: String, 
    required: true,
    trim: true,
    unique: true,
    minlength: 5
  },
  password: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: validator.isEmail,
      message: '{VALUE} is not a valid Email address'
    }
  },
  phone: {
    type: Number,
    unique: true,
    required: true
  },
  //{USER, ADMIN(trade, topics), SUPER, OWNER}
  authType: {
    level: {
      type: String,
      default: 'USER'
    },
    grade: {
      type: Number,
      default: 2
    }
  },
  sellerAllowed: {
    type: Boolean,
    default: false
  },
  /*-----------------------------------------------
    Default feilds
  -------------------------------------------------*/ 
  nameForCheck: {type: String},
  registedDate: {
    type: Date,
    default: Date.now,
  },
  lastVisit: {
    type: Date,
    default: Date.now
  },
  registerClient: {
    type: Object,
    required: true
  },
  address: {
    country: {type: String},
    state: {type: String},
    city: {type: String},
    district: {type: String},
    street: {type: String},
    detail: {type: String}
  },
  status: [
    {
      lebal: {
        type: String, //{active, inactive, frozen, banned}
        required: true
      },
      event: {
        type: String, //{register, update, upgrade, downgrade, upSeller, downSeller}
        required: true
      },
      date: {
        type: Date,
        required: true
      },
      by: {
        type: String,
        required: true
      }
    }
  ],
  tokens: [
    {
      access: {
        type: String,
        required: true
      },
      token: {
        type: String,
        required: true
      },
      expires: {
        type: Number, //Null || Date
        required: true
      }
    }
  ],
  /*-----------------------------------------------
    Optional feilds
  -------------------------------------------------*/ 
  DOB: {
    type: Date
  },
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
  balance: {
    usable: {type: Number, default: 0},
    deposit: {type: Number, default: 0}
  },
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
  let user = this;
  // user access level - {USER, ADMIN(trade, topics), SUPER, OWNER}
  // let access = auth || 'USER';
  let access = this.authType.grade;
  if (!ip || !client || !expires) throw 'Missing....';
  // encode information into a Json Web Token (JWT) 
  let token = jwt.sign({
    _id: user._id.toHexString(),
    access,
    ip,
    client: JSON.stringify(client),
    expires
  }, process.env.JWT_SECRET);
  // push Token with something into user Tokens Array
  user.tokens.push({access, token, expires});

  // save user
  return user.save().then(() => {
    return token
  })
}

schema.methods.updateStatus = function (lebal, event, by) {
  let user = this;
  user.status.push({lebal, event, date: ConvertUTCTimeToLocalTime(true), by});
  return user.save();
}

// Class method for decoding Token
schema.statics.findByToken = async function (token) {
    let User = this;
    let decoded, user;
    try {
      // Token decoding...
      decoded = jwt.verify(token, process.env.JWT_SECRET)
      // Finding user with decoded info
      user = await User.findOne({
        '_id': decoded._id,
        'tokens.token': token,
        'tokens.access': decoded.access 
      })
      // return Object for further authentication
      return {
        expires: decoded.expires,
        token: token, 
        ip: decoded.ip, 
        client: decoded.client, 
        username: user.username, 
        _id: decoded._id, 
        access: decoded.access
      }
    }catch(e) {
      return false;
    }
}

// Pre 'save' middleware
schema.pre('save', function (next) {
  var user = this;
  // Capitalize username for checking unique
  this.nameForCheck = this.username.toUpperCase();
  // Capitalize email for checking unique
  this.email = this.email.toUpperCase();

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


module.exports = schema;
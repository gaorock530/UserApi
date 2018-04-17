const mongoose = require('mongoose');
const UserSchema = require('../database/schema/aquarium_schema');

mongoose.connect(process.env.MONGODB_URI);
const userDatabase = mongoose.model('aquarium', UserSchema);

module.exports = {
  async fetch(_id) {
    try {
      return await userDatabase.findOne({_id});
    }catch(e){
      throw (e);
    }
  }
}
var mongoose  = require('mongoose');
var bcrypt    = require('bcrypt-nodejs');

// define the user schema
var playerSchema = mongoose.Schema({
  local : {
    username  : String,
    password  : String
  },
  created: { type: Date, default: Date.now },
  updated: { type: Date, default: Date.now },
  car: ObjectId
});

// generate a hash
playerSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// check if password is valid
playerSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
};

// create the model for users and expose it to the app
module.exports = mongoose.model('Player', playerSchema);
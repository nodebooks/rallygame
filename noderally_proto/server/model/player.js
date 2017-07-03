var mongoose  = require('mongoose');
var bcrypt    = require('bcrypt-nodejs');

// define the user schema
var playerSchema = mongoose.Schema({
  username  : { 
    type: String, unique: true,
    required: true, 
    min: 4, 
    max: 10, 
    validate: function(username) {
      return /[A-Za-z]/.test(username);
    }
  },
  password: { 
    type: String, 
    required: true
  },
  created: { 
    type: Date, 
    default: Date.now 
  },
  updated: { 
    type: Date, 
    default: Date.now 
  },
});

// check if password is valid
playerSchema.methods.isValidPassword = function(password) {
  // Fix this later
  return true;
  //return bcrypt.compareSync(password, this.password);
};

// create the model for users and expose it to the app
module.exports = mongoose.model('Player', playerSchema);
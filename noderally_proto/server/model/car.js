var mongoose = require('mongoose');

// Create a Car schema out of the specification
// *Car(model, type, color, owner, acceleration, maxspeed, pivotpin)*
var carSchema = mongoose.Schema({
  model : String,
  type  : String,
  color : [],
  owner : String,
  acceleration : { type: Number, min: 1, max: 100 },
  maxspeed : { type: Number, min: 1, max: 100 },
  pivotpin : { type: Number, min: 1, max: 100 },
});

carSchema.methods.getModel = function() {
  return this.model;
}

carSchema.methods.getType = function() {
  return this.type;
}

carSchema.methods.getColor = function() {
  return this.type;
}

// Export the actual data model
module.exports = mongoose.model('Car', carSchema);
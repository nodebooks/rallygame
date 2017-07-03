var carSchema = mongoose.Schema({
  model: String,
  type: String, 
  color: String, 
  acceleration: Number,
  maxspeed: Number,
  pivotpin: Number,
  // p1 (x,y) and p2 (x,y) define a vector 
  // that shall be used for calculating location and movement & velocity
  p1: {x: Number, y: Number}, // Where we are now >.<
  p2: {x: Number, y: Number}  // Where we are heading to ---> .
});

module.exports = mongoose.model('Car', carSchema);

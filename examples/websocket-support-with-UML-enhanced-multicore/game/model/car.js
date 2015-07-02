var carSchema = mongoose.Schema({
  model: String,
  type: String, 
  color: String, 
  acceleration: Number,
  maxspeed: Number,
  pivotpin: Number)
});

module.exports = mongoose.model('Car', carSchema);

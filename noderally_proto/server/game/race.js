// This is the RACE instance which handles events: 
// input: calculate player action and syncronize with other players
// logout: end race, notify other players
// tmoRaceLength: Timeout for how long should the race run

// TODO-steps for game mechanics: 
// 1. check player inputs
// 2. calculate new position
// 3. synchronize players

// Create one object per race on MASTER process
s
var eventizer = require("../events/index.js").bind();
//var events = eventizer.bindEvents(["logout", "playerinput"]);

class Race {
  constructor(socket) {
    
    this.started = new Date().getTime();  // Total duration
    this.length = 360; // Max duration in seconds
  }

  start(evRace) {
    console.log("new race started");
  }

  end() {
    console.log("race finished in %s seconds", this.duration);
  }

  spectate(socket) {

  }
}

module.exports = Race;
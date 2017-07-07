// This is the RACE instance which handles events: 
// input: calculate player action and syncronize with other players
// logout: end race, notify other players
// tmoRaceLength: Timeout for how long should the race run

// TODO-steps for game mechanics: 
// 1. check player inputs
// 2. calculate new position
// 3. synchronize players

var eventizer = require("../events/index.js").bind();
var events = eventizer.bindEvents(["logout", "playerinput"]);

class Race {
  constructor(evRace) {
    this.started = new Date().getTime();  // Total duration
    this.length = 360; // Max duration in seconds
  }

  start(evRace) {
    console.log("Hello my name is", this.getName());
  }

  end(evRace) {
    console.log("race finished in %s seconds", this.duration);
  }

  spectate(evRace) {

  }
}

module.exports = Race;
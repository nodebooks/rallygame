// This is the LOBBY instance which handles events: 
// evLogin: add new player to lobby
// evLogout: player left lobby
// evRace: handle race startup / join
// evChat: handle chat message

// Start in the MASTER process
var cluster = require("cluster");
var eventizer = require("../events/index.js");

class Lobby {
  constructor() {
    this._listeners = {};
    console.log("Lobby created");
  }

  broadcast(evChat) {
    for (var player in this._listeners) {
        player.send(evChat.message);
    }
  }

  startRace(evRace) {

  }
}

module.exports = Lobby;
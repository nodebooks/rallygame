// This is the LOBBY instance which handles events: 
// evLogin: add new player to lobby
// evLogout: player left lobby
// evRace: handle race startup / join
// evChat: handle chat message

// Start in the MASTER process
var cluster = require("cluster");
var eventizer = require("../events/index.js");
//var events = eventizer.bindEvents(["logout", "playerinput"]);

class Lobby {
  constructor(sockets) {
    console.log("Lobby created");
  }

  broadcast(message) {
    for (var id in cluster.workers) {
        cluster.workers[id].send(message);
    }
  }

  spectate(evRace) {

  }
}

module.exports = Lobby;
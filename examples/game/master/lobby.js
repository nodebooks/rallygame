"use strict";

// Generate one Lobby per game server

var Lobby = (function() {
  console.log("Creating a lobby");

  var config = require('../config');

  var _players = [];
  var _eventManager = require('../communication/socketmanager');

  // Internal initializations
  setupSocket();

  function connect(player) {
    // Return player index in array
    return _players.push(player);
  }

  function disconnect(player) {
    if(_players[player.index]) {
      _players[player.index] = undefined;
    }
    return player.index;
  }

  function setupSocket() {

  }
  return {
    connect: connect,
    disconnect: disconnect
  };
})();

module.exports = Lobby;
var express = require('express');
var router = express.Router();

// middleware specific to this router
router.use(function timeLog(req, res, next) {
  console.log('Time: ', Date.now());
  next();
});
// define the home page route
router.get('/', function(req, res) {
  console.log("GET /")
  res.sendFile(__dirname + '/public/index2.html');
});
// define the about route
router.get('/getuml', function(req, res) {
  console.log("GET /getuml")
  res.send("Client-->Server: /getuml");
});

module.exports = router;
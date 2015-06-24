var express = require('express');
var router = express.Router();
var cluster = require('cluster');

var umldata = [];

// middleware specific to this router
router.use(function timeLog(req, res, next) { 
  req.tracedata = {
    //reqtime: Date.now(),  // Replace with high resolution timer
    reqtime: process.hrtime(),
    r: req.method + " " + req.url
  };
  next();
});

// define the home page route
router.get('/', function(req, res) {
  //console.log("GET /")
  res.sendFile(__dirname + '/public/index.html');
  //tagtrace(req);
});

// define the about route
router.get('/getuml', function(req, res) {
  //console.log("GET /getuml")
  res.send(JSON.stringify(umldata));
  tagtrace(req);
});

/* A function to tag handling time of a single request */
function tagtrace(req) {
  req.tracedata.resptime = Date.now();
  req.tracedata.tth = process.hrtime(req.tracedata.reqtime);
  //console.log("hrtime for", req.tracedata.r, ":", req.tracedata.tth[1]/1000/1000, "ms");
  umldata.push(req.tracedata);
}

module.exports = router;
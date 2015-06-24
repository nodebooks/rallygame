"use strict";

var express = require('express');
var router = express.Router();

// middleware specific to this router
/*
router.use(function timeLog(req, res, next) { 
  req.tracedata = {
    reqtime: process.hrtime()
  };
  next();
});
*/
router.get('/', function(req, res) {
  res.sendFile(__dirname + '/public/index.html');
});

module.exports = router;
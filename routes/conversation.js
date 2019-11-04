var express = require('express');

// https://stackoverflow.com/questions/28977253/express-router-undefined-params-with-router-use-when-split-across-files
var router = express.Router({mergeParams: true});

var winston = require('../config/winston');

var Conversation = require("../models/conversation");



router.get('/', function(req, res) {

  Conversation.find({"recipient": req.params.request_id, id_project: req.projectid}).sort({updatedAt: 'asc'}).exec(function(err, conversations) { 
      if (err) {
        return next(err);
      }
      res.json(conversations);

    });

});


module.exports = router;

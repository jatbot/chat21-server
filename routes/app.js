var express = require('express');
var router = express.Router();
var App = require("../models/app");
var mongoose = require('mongoose');

var winston = require('../config/winston');
// var roleChecker = require('../middleware/has-role');

// THE THREE FOLLOWS IMPORTS  ARE USED FOR AUTHENTICATION IN THE ROUTE
var passport = require('passport');
require('../middleware/passport')(passport);
var validtoken = require('../middleware/valid-token')







// PROJECT POST
router.post('/', [passport.authenticate(['basic', 'jwt'], { session: false }), validtoken], function (req, res) {
  // console.log(req.body, 'USER ID ',req.user.id );
  // var id = mongoose.Types.ObjectId()
  var newApp = new App({
    name: req.body.name,    
    createdBy: req.user.id,
    updatedBy: req.user.id
  });

  newApp.save(function (err, savedApp) {
    if (err) {
      winston.error('--- > ERROR ', err)
      return res.status(500).send({ success: false, msg: 'Error saving object.' });
    }
    console.log('--- SAVE app ', savedApp)
    res.json(savedApp);

   

  });

   
});

// PROJECT PUT
// should check HasRole otherwise another project user can change this
router.put('/:appid', [passport.authenticate(['basic', 'jwt'], { session: false }), validtoken], function (req, res) {
  winston.debug('UPDATE PROJECT REQ BODY ', req.body);
  App.findByIdAndUpdate(req.params.projectid, req.body, { new: true, upsert: true }, function (err, updatedApp) {
    if (err) {
      winston.error('Error putting project ', err);
      return res.status(500).send({ success: false, msg: 'Error updating object.' });
    }
    res.json(updatedApp);
  });
});

// PROJECT DELETE
router.delete('/:appid', [passport.authenticate(['basic', 'jwt'], { session: false }), validtoken], function (req, res) {
  winston.debug(req.body);
  App.remove({ _id: req.params.projectid }, function (err, app) {
    if (err) {
      winston.error('Error deleting project ', err);
      return res.status(500).send({ success: false, msg: 'Error deleting object.' });
    }
    res.json(app);
  });
});

// PROJECT GET DETAIL
router.get('/:appid', [passport.authenticate(['basic', 'jwt'], { session: false }), validtoken], function (req, res) {
  winston.debug(req.body);
  App.findById(req.params.projectid, function (err, app) {
    if (err) {
      winston.error('Error getting app ', err);
      return res.status(500).send({ success: false, msg: 'Error getting object.' });
    }
    if (!app) {
      winston.warn('App not found ');
      return res.status(404).send({ success: false, msg: 'Object not found.' });
    }
    res.json(app);
  });
});




module.exports = router;

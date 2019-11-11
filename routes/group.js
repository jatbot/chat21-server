var express = require('express');

// https://stackoverflow.com/questions/28977253/express-router-undefined-params-with-router-use-when-split-across-files
var router = express.Router({mergeParams: true});

var Group = require("../models/group");
var winston = require('../config/winston');
var groupEvent = require("../events/groupEvent");


const uuidv4 = require('uuid/v4');

//curl -X POST -H 'Content-Type: application/json' -d '{"sender_id":"123", "sender_fullname":"SFN", "recipient_id":"RFN", "text": "123", "app_id":"123"}' http://localhost:3200/messages
//curl -X POST -H 'Content-Type: application/json' -d '{"sender_id":"123", "sender_fullname":"SFN", "recipient_id":"RFN", "text": "123", "app_id":"123"}' https://chat21-server.herokuapp.com:3200/messages

router.post('/', function(req, res) {

 var groupId = uuidv4();
 var senderId = req.user.id;

 var newGroup = new Group({
    group_id: groupId,
    group_name: req.body.group_name,
    group_owner: senderId,
    app_id: req.appid,
    group_members : req.body.group_members,
    attributes : req.body.attributes,
    createdBy: senderId,
  });

  newGroup.save(function(err, savedGroup) {
    if (err) {
      console.log(err);
      return res.status(500).send({success: false, msg: 'Error saving object.', err:err});
    }

    console.log("new group", savedGroup.toObject());
    groupEvent.emit("group.create",savedGroup);
    res.json(savedGroup);
  });





  
});




module.exports = router;

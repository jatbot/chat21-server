var express = require('express');

// https://stackoverflow.com/questions/28977253/express-router-undefined-params-with-router-use-when-split-across-files
var router = express.Router({mergeParams: true});

var Message = require("../models/message");
var winston = require('../config/winston');
var MessageConstants = require("../models/messageConstants");
var messageEvent = require("../events/messageEvent");

var Conversation = require("../models/conversation");
const uuidv4 = require('uuid/v4');

//curl -X POST -H 'Content-Type: application/json' -d '{"sender_id":"123", "sender_fullname":"SFN", "recipient_id":"RFN", "text": "123", "app_id":"123"}' http://localhost:3200/messages

router.post('/', function(req, res) {
 var messageId = uuidv4();

 var path = "/apps/"+req.body.app_id + "/users/" + req.body.sender_id + "/messages/" + req.body.recipient_id;
//  var path = "/apps/"+req.body.app_id + "/users/" + req.body.sender_id + "/messages/" + req.body.recipient_id + "/" + messageId;
 winston.info("path: " + path);

 var newMessage = new Message({
    message_id: messageId,
    sender_id: req.body.sender_id,
    sender_fullname: req.body.sender_fullname,
    recipient_id: req.body.recipient_id,
    recipient_fullname: req.body.recipient_fullname,
    text: req.body.text,
    app_id: req.body.app_id,
    createdBy: req.body.sender_id,
    path: path,
    status: MessageConstants.CHAT_MESSAGE_STATUS.SENT
  });

  newMessage.save(function(err, savedMessage) {
    if (err) {
      console.log(err);
      return res.status(500).send({success: false, msg: 'Error saving object.', err:err});
    }

    console.log("new message", savedMessage.toObject());
    messageEvent.emit("message.create",savedMessage);
    res.json(savedMessage);
  });





  
});





router.get('/', function(req, res) {

    Message.find({"recipient": req.params.request_id, id_project: req.projectid}).sort({updatedAt: 'asc'}).exec(function(err, messages) { 
      if (err) {
return next(err);
      }
      res.json(messages);

    });

});


module.exports = router;

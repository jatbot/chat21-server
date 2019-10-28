var express = require('express');

// https://stackoverflow.com/questions/28977253/express-router-undefined-params-with-router-use-when-split-across-files
var router = express.Router({mergeParams: true});

var Message = require("../models/message");
var winston = require('../config/winston');
var MessageConstants = require("../models/messageConstants");

// var roleChecker = require('../middleware/has-role');

router.post('/', function(req, res) {

 var newMessage = new Message({
    sender: req.body.sender,
    senderFullname: req.body.sender_fullname,
    recipient: req.body.recipient,
    recipientFullname: req.body.recipient_fullname,
    text: req.body.text,
    id_project: req.projectid,
    createdBy: req.user.id,
    updatedBy: req.user.id
  });

  newMessage.save(function(err, savedMessage) {
    if (err) {
      console.log(err);

      return res.status(500).send({success: false, msg: 'Error saving object.', err:err});
    }
    res.json(savedMessage);
  });





  
});




// router.put('/:messageid', function(req, res) {
  
//     console.log(req.body);
    
//     Message.findByIdAndUpdate(req.params.messageid, req.body, {new: true, upsert:true}, function(err, updatedMessage) {
//       if (err) {
//         return res.status(500).send({success: false, msg: 'Error updating object.'});
//       }
//       res.json(updatedMessage);
//     });
//   });


//   router.delete('/:messageid', function(req, res) {
  
//     console.log(req.body);
    
//     Message.remove({_id:req.params.messageid}, function(err, Message) {
//       if (err) {
//         return res.status(500).send({success: false, msg: 'Error deleting object.'});
//       }
//       res.json(Message);
//     });
//   });


  router.get('/:messageid', function(req, res) {
  
    console.log(req.body);
    
    Message.findById(req.params.messageid, function(err, message) {
      if (err) {
        return res.status(500).send({success: false, msg: 'Error getting object.'});
      }
      if(!message){
        return res.status(404).send({success: false, msg: 'Object not found.'});
      }
      res.json(message);
    });
  });



router.get('/', function(req, res) {

  return Message.find({"recipient": req.params.request_id, id_project: req.projectid}).sort({updatedAt: 'asc'}).exec(function(err, messages) { 
      if (err) return next(err);
      res.json(messages);
    });
});

module.exports = router;

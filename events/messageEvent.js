const EventEmitter = require('events');
var winston = require('../config/winston');
var Message = require("../models/message");
var MessageConstants = require("../models/messageConstants");
var Conversation = require('../models/conversation');
var Group = require('../models/group');
var conversationEvent = require('../events/conversationEvent');



class MessageEvent extends EventEmitter {}

const messageEvent = new MessageEvent();

messageEvent.on('message.create', function(message) {

 winston.debug("messageEvent.emit");

   if (message.status === MessageConstants.CHAT_MESSAGE_STATUS.SENDING) { 
       winston.info("messageEvent.emit message.sending", message); 
      messageEvent.emit('message.sending', message);                                                             
   }      


   if (message.status === MessageConstants.CHAT_MESSAGE_STATUS.SENT) {  
       winston.debug("messageEvent.emit message.sent", message);      
       messageEvent.emit('message.sent', message);      
   }       


   if (message.status === MessageConstants.CHAT_MESSAGE_STATUS.DELIVERED) {    
      winston.debug("messageEvent.emit message.delivered", message);  
      messageEvent.emit('message.delivered', message);      
   }   





  if (message.status === MessageConstants.CHAT_MESSAGE_STATUS.RECEIVED) {
    winston.debug("messageEvent.emit message.received", message);
    messageEvent.emit('message.received', message);
  }

/*
  if (message.status === MessageConstants.CHAT_MESSAGE_STATUS.SENDING) {
    winston.debug("messageEvent.emit message.sending", message);
    messageEvent.emit('message.sending', message);
  }
*/
});


messageEvent.on('message.sent', function(message) {

  if (message.channel_type=="direct") {  //is a direct message            
      var timelineNewMessageClone = Object.assign({}, message.toObject());
      delete timelineNewMessageClone._id;

      var timelineNewMessage = new Message(timelineNewMessageClone);

      //var path = "/apps/" + message.app_id + "/users/" + message.recipient_id + "/messages/" + message.sender_id + "/" + message.message_id;  
      var path = "/apps/" + message.app_id + "/users/" + message.recipient_id + "/messages/" + message.sender_id; 
      winston.info("send direct message to recipient timeline: " + path);

      timelineNewMessage.path = path;
      timelineNewMessage.status =  MessageConstants.CHAT_MESSAGE_STATUS.DELIVERED;

      timelineNewMessage.save(function(err, savedMessage) {
        if (err) {
          console.log(err);
          return res.status(500).send({success: false, msg: 'Error saving timeline object.', err:err});
        }

        console.log("new timeline message created", savedMessage.toObject());
        messageEvent.emit("message.create",savedMessage);
      });
  } else if (message.channel_type=="group") {
      var timelineNewMessageClone = Object.assign({}, message.toObject());
      delete timelineNewMessageClone._id;

      var timelineNewMessage = new Message(timelineNewMessageClone);  
 
      Group.findOne({group_id: message.recipient_id}, function(err, group) {
       if (err) {
         winston.error("error getting group: " + message.recipient_id);    
        return;
       }
       if (!group){
        winston.debug("group not found: "+message.recipient_id); 
        return;
       }
       group.members.forEach(function(groupMember) {
         if (groupMember!=message.sender_id) { 
          
           var path = "/apps/" + message.app_id + "/users/" + message.recipient_id + "/messages/" + message.sender_id; 
           winston.info("send group message to recipient timeline: " + path);

           timelineNewMessage.path = path;
           timelineNewMessage.status =  MessageConstants.CHAT_MESSAGE_STATUS.DELIVERED;

           timelineNewMessage.save(function(err, savedMessage) {
             if (err) {
               return winston.error(err);               
             }

             console.log("new group timeline message created", savedMessage.toObject());
             messageEvent.emit("message.create",savedMessage);
           });        
        }
       });
      });
             
  } else {
      winston.error("wring type");       
  }
});


messageEvent.on('message.create', function(message) {

 winston.info("create conv for msg ", message.toObject());

   var newMessage = true;
   var path;
   if (message.status == MessageConstants.CHAT_MESSAGE_STATUS.SENDING || message.status == MessageConstants.CHAT_MESSAGE_STATUS.SENT){
      newMessage = false;
      path = "/apps/"+message.app_id + "/users/" + message.sender_id + "/conversations/" + message.recipient_id;
   }
   if (message.status == MessageConstants.CHAT_MESSAGE_STATUS.DELIVERED){
    newMessage = false;
    path = "/apps/"+message.app_id + "/users/" + message.recipient_id + "/conversations/" + message.sender_id;
 }

  //
  winston.info("create conversation with path: " + path);

   //var newConversation = new Conversation({                                                                                                                                                 
    var newConversation ={                                                                                                                                                 
    sender: message.sender_id,
    sender_fullname: message.sender_fullname,
    recipient: message.recipient_id,
    recipient_fullname: message.recipient_fullname,
    last_message_text: message.text,
    app_id: message.app_id,
    is_new: newMessage,
    status: message.status,
    channel_type: message.channel_type,
    type: message.type,
    createdBy: message.createdBy,
    attributes: message.attributes,
    path: path
    };                              

   var query = {path: path},
    options = { upsert: true, new: true, setDefaultsOnInsert: true 
       , rawResult:true
    };

// Find the document
Conversation.findOneAndUpdate(query, newConversation, options, function(err, savedConversation) {

  //newConversation.save(function(err, savedConversation) {                                                                                      
  if (err) {
        console.log(err);
      }
        console.log("saved conversation updatedExisting", savedConversation.lastErrorObject.updatedExisting);
        if (savedConversation.lastErrorObject.updatedExisting==false) {
                conversationEvent.emit("conversation.create", savedConversation.value);
        }else {
                conversationEvent.emit("conversation.update", savedConversation.value); 
        }

        console.log("saved conversation", savedConversation.value.toObject());

   });

});



module.exports = messageEvent;

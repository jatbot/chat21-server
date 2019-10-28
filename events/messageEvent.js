const EventEmitter = require('events');
var winston = require('../config/winston');
var Message = require("../models/message");
var MessageConstants = require("../models/messageConstants");





class MessageEvent extends EventEmitter {}

const messageEvent = new MessageEvent();

messageEvent.on('message.create', function(message) {
  if (message.status === MessageConstants.CHAT_MESSAGE_STATUS.RECEIVED) {
    winston.debug("messageEvent.emit message.received", message);
    messageEvent.emit('message.received', message);
  }

  if (message.status === MessageConstants.CHAT_MESSAGE_STATUS.SENDING) {
    winston.debug("messageEvent.emit message.sending", message);
    messageEvent.emit('message.sending', message);
  }

   var newMessage = true;
 
   var newConversation = new Conversation({                                                                                                                                                   sender: savedMessage.sender_id,                                                                                                                                                            sender_fullname: savedMessage.sender_fullname,
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
    attributes: message.attributes
    
    });                                                                                                                                                       });

  newConversation.save(function(err, savedConversation) {                                                                                                                                      if (err) {
      if (err) {
	console.log(err);
      }
	console.log(savedConversation);
   });                 
});



module.exports = messageEvent;

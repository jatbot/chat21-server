const EventEmitter = require('events');
var winston = require('../config/winston');
var MessageConstants = require("../models/messageConstants");
var Conversation = require('../models/conversation');




class ConversationEvent extends EventEmitter {}

const conversationEvent = new ConversationEvent();

conversationEvent.on('conversation.create', function(message) {

 winston.info("conversationEvent.emit");
/*
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

*/
});





module.exports = conversationEvent;

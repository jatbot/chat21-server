var Message = require("../models/message");
var Conversation = require("../models/conversation");
const WebSocket = require('ws');
var message2Event = require("../events/message2Event");
var messageEvent = require("../events/messageEvent");
var conversationEvent = require("../events/conversationEvent");
var config = require('../config/database'); // get db config file
var winston = require('../config/winston');
const PubSub = require('./pubsub');
const uuidv4 = require('uuid/v4');
var MessageConstants = require("../models/messageConstants");

class WebSocketServer {

  constructor() {
    this.clientsSubscriptions = {};
  }
  

  // https://hackernoon.com/nodejs-web-socket-example-tutorial-send-message-connect-express-set-up-easy-step-30347a2c5535
  // https://medium.com/@martin.sikora/node-js-websocket-simple-chat-tutorial-2def3a841b61
  init(server) {
    
    //var wss = new WebSocket.Server({ port: 40510 });
    //var wss = new WebSocket.Server({ port: 40510 , path: "/messages" });
    //var wss = new WebSocket.Server({  port: 80 ,path: "/messages" });
    //  var wss = new WebSocket.Server({  server: server,path: "/messages" });

     var wss = new WebSocket.Server({  
       server: server, 
       path: "/",    
    });

    var onConnectCallback = function(client) {
      winston.info('onConnectCallback ');
      // check here if you can subscript o publish message
    }

    var onDisconnectCallback = function(subscript, id) {
      winston.info('onDisconnectCallback ',subscript, id);
      // check here if you can subscript o publish message
    }


//tilebaseMess.send('{ "action": "publish", "payload": { "topic": "/apps/123/users/sendid/conversations/RFN", "message":{"sender_id":"sendid","sender_fullname":"SFN", "recipient_id":"RFN", "recipient_fullname":"RFN","text":"hi","app_id":"123"}}}');
    var onPublishCallback = function(publishTopic, publishMessage, from) {
      winston.info("onPublish topic: "+publishTopic +" from: "+from, publishMessage);

	var messageId = uuidv4();

 var path = "/apps/"+ publishMessage.app_id + "/users/" +  publishMessage.sender_id + "/messages/" +  publishMessage.recipient_id;
 winston.info("path: " + path);

 var newMessage = new Message({
    message_id: messageId,
    sender_id:  publishMessage.sender_id,
    sender_fullname:  publishMessage.sender_fullname,
    recipient_id:  publishMessage.recipient_id,
    recipient_fullname:  publishMessage.recipient_fullname,
    text:  publishMessage.text,
    app_id:  publishMessage.app_id,
    createdBy:  publishMessage.sender_id,
    path: path,
    status: MessageConstants.CHAT_MESSAGE_STATUS.SENT
  });

  newMessage.save(function(err, savedMessage) {
    if (err) {
      console.error("error saving message",err);
	 pubSubServer.send(from, { 
             action: 'publish-err',   
                payload: {    
                   topic: "err",     
                   message: err,   
                },        
             })            

      return //pubSubServer.handlePublishMessage (from, err, undefined, true);
    }

    console.log("new message", savedMessage.toObject());
    messageEvent.emit("message.create",savedMessage);
  });




    }

    var onMessageCallback = function(id, message) {
      winston.info('onMessageCallback ',id, message);
      // check here if you can subscript o publish message
    }

    var onSubscribeCallback = function(id, message) {
      winston.info('onSubscribeCallback :'+id+ " "+ message);
      winston.info('onSubscribeCallback :'+id.indexOf('/conversations/'));
      if (id.indexOf('/conversations/')>0) {  
        // var query = {};
        var query = {"path": id};
          Conversation.find(query).sort({updatedAt: 'asc'}).exec(function(err, conversations) { 
          
          if (err) {
            winston.error('onSubscribeCallback find',err);  
          }
          winston.info('onSubscribeCallback find', conversations);  
          pubSubServer.handlePublishMessage (id, conversations, undefined, true);                                                                                          
    
        });
      }

      if (id.indexOf('/messages/')>0) {  
        // var query = {};
        var query = {"path": id};
          Message.find(query).sort({updatedAt: 'asc'}).exec(function(err, messages) { 
          
          if (err) {
            winston.error('onSubscribeCallback find',err);  
          }
          winston.info('onSubscribeCallback find', messages);  
          pubSubServer.handlePublishMessage (id, messages, undefined, true);                                                                                          
    
        });
      }
    
    }

    const pubSubServer = new PubSub(wss, {onConnect: onConnectCallback, onDisconnect: onDisconnectCallback,
                              onMessage: onMessageCallback, onSubscribe: onSubscribeCallback, onPublish:onPublishCallback});

    //const pubSubServer = new PubSub(wss);
     //const pubSubServer = new PubSub(wss,onConnectCallback, onDisconnectCallback, onMessageCallback);

 
    var that = this;

     messageEvent.on('message.create', function (message) {
      winston.info('messageEvent websocket server ', message);
        var topic =  '/apps/'+message.app_id+'/users/'+message.sender_id+'/messages/'+message.recipient_id;                                                                                                            
        winston.info('conversationEvent update websocket server topic: '+ topic);  
        pubSubServer.handlePublishMessage (topic, message, undefined, true);
    });
    conversationEvent.on('conversation.create', function (conversation) {    
        winston.info('conversationEvent create websocket server ', conversation);   

        var topic =  '/apps/'+conversation.app_id+'/users/'+conversation.sender+'/conversations/'+conversation.recipient;      
        winston.info('conversationEvent update websocket server topic: '+ topic);     
        pubSubServer.handlePublishMessage (topic, conversation, undefined, true);                                                                                     
    });

   conversationEvent.on('conversation.update', function (conversation) {
        winston.info('conversationEvent update websocket server ', conversation);
        var topic =  '/apps/'+conversation.app_id+'/users/'+conversation.sender+'/conversations/'+conversation.recipient;
        winston.info('conversationEvent update websocket server topic: '+ topic);
        pubSubServer.handlePublishMessage (topic, conversation, undefined, true);                                                                                          
   });      

   
  }

}

var webSocketServer = new WebSocketServer();
module.exports = webSocketServer;

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
var url = require('url');
var jwt = require('jsonwebtoken');

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
       verifyClient: function (info, cb) {
        //console.log('info.req', info.req);
        // var token = info.req.headers.Authorization
        let urlParsed = url.parse(info.req.url, true);
        // console.log('urlParsed', urlParsed);
        var queryParameter = urlParsed.query;
        winston.debug('queryParameter', queryParameter);

        var token = queryParameter.token;
        winston.debug('token:'+ token);
        winston.debug('config.secret:'+ config.secret);

      //add appid parameter here
        if (!token)
            cb(false, 401, 'Unauthorized');
        else {
          token = token.replace('JWT ', '');
          winston.debug('token:' +token);

          // if (token ==="123") {
          //   winston.info('ok 123:');
          //   return cb(true);
          // }
            jwt.verify(token, config.secret, function (err, decoded) {
                if (err) {
                   winston.info('error websocket ', err);
                   return cb(false, 401, 'Unauthorized');
                } else {
                   // uncomment it
                       winston.info('valid token');
                      // roleChecker.hasRoleAsPromise().then(function(project_user) {
                      //   winston.info('hasRoleAsPromise project_user',project_user);
                        // winston.info('ok websocket');
                        info.req.user = decoded;
                        return cb(true);
                    // }).catch(function(err){
                    //   winston.error('hasRoleAsPromise err',err);
                    //   cb(false, 401, err.msg);
                    // });                     
                
                }
            })

        }
      }
    });

    var onConnectCallback = function(client, req) {
      winston.info('onConnectCallback ', req.user);
      // check here if you can subscript o publish message
    }

    var onDisconnectCallback = function(subscript, id) {
      winston.info('onDisconnectCallback :'+subscript +":" +id);
      // check here if you can subscript o publish message
    }

//tilebaseMess.send('{ "action": "send", "payload": {"message":{"sender_fullname":"SFN", "recipient_id":"recipient_id", "recipient_fullname":"RFN","text":"hiws","app_id":"app1"}}}');
//tilebaseMess.send('{ "action": "publish", "payload": { "topic": "/apps/123/users/sendid/conversations/RFN", "method":"CREATE","message":{"sender_id":"sendid","sender_fullname":"SFN", "recipient_id":"RFN", "recipient_fullname":"RFN","text":"hi","app_id":"123"}}}');
    var onSendCallback = function(publishMessage, from, req) {
      winston.info("onSendCallback  "+from, publishMessage);

      var messageId = uuidv4();

      var path = "/apps/"+ publishMessage.app_id + "/users/" +  req.user._id + "/messages/" +  publishMessage.recipient_id;
      // var path = "/apps/"+ publishMessage.app_id + "/users/" +  publishMessage.sender_id + "/messages/" +  publishMessage.recipient_id;
      winston.info("path: " + path);

      // var timelineOf = publishMessage.sender_id;
      var timelineOf = req.user._id;

      var newMessage = new Message({
          message_id: messageId,
          sender_id:  req.user._id,
          sender_fullname:  publishMessage.sender_fullname,
          recipient_id:  publishMessage.recipient_id,
          recipient_fullname:  publishMessage.recipient_fullname,
          text:  publishMessage.text,
          app_id:  publishMessage.app_id,
          createdBy:  req.user._id,
          path: path,
          timelineOf: timelineOf,
          channel_type: publishMessage.channel_type,
          status: MessageConstants.CHAT_MESSAGE_STATUS.SENT
        });

        newMessage.save(function(err, savedMessage) {
          if (err) {
            console.error("error saving message",err);
            return pubSubServer.send(from, { 
                        action: 'publish-err',   
                            payload: {    
                              topic: "err",     
                              message: err,   
                            },        
                        })            

             //pubSubServer.handlePublishMessage (from, err, undefined, true);
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
          pubSubServer.handlePublishMessage (id, conversations, undefined, true, "CREATE");                                                                                          
    
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
          pubSubServer.handlePublishMessage (id, messages, undefined, true, "CREATE");                                                                                          
    
        });
      }
    
    }

    const pubSubServer = new PubSub(wss, {onConnect: onConnectCallback, onDisconnect: onDisconnectCallback,
                              onMessage: onMessageCallback, onSubscribe: onSubscribeCallback, onSend:onSendCallback});

    //const pubSubServer = new PubSub(wss);
     //const pubSubServer = new PubSub(wss,onConnectCallback, onDisconnectCallback, onMessageCallback);

 
    var that = this;

     messageEvent.on('message.create', function (message) {
      winston.info('messageEvent websocket create message server ', message);

      var path;
      // var timelineOf;
      if (message.status == MessageConstants.CHAT_MESSAGE_STATUS.SENDING || message.status == MessageConstants.CHAT_MESSAGE_STATUS.SENT){                                                  
        path = "/apps/"+message.app_id + "/users/" + message.sender_id + "/messages/" + message.recipient_id;
        // timelineOf = message.sender_id;
      } 
      if (message.status == MessageConstants.CHAT_MESSAGE_STATUS.DELIVERED){      
        path = "/apps/"+message.app_id + "/users/" + message.recipient_id + "/messages/" + message.sender_id;
        // timelineOf = message.recipient_id;
      }

       // var topic =  '/apps/'+message.app_id+'/users/'+message.sender_id+'/messages/'+message.recipient_id;                                                                                                            
        winston.info('messageEvent create message websocket server topic: '+ path);  
        pubSubServer.handlePublishMessage (path, message, undefined, true, "CREATE");
    });
    conversationEvent.on('conversation.create', function (conversation) {    
        winston.debug('conversationEvent create websocket server ', conversation);   

        //var topic =  '/apps/'+conversation.app_id+'/users/'+conversation.sender+'/conversations/'+conversation.recipient;      
        var topic =  '/apps/'+conversation.app_id+'/users/'+conversation.sender+'/conversations';      
        winston.info('conversationEvent create websocket server topic: '+ topic);     
        pubSubServer.handlePublishMessage (topic, conversation, undefined, true, "CREATE");                                                                                     
    });

   conversationEvent.on('conversation.update', function (conversation) {
        winston.debug('conversationEvent update websocket server ', conversation);


        var path;
        if (conversation.status == MessageConstants.CHAT_MESSAGE_STATUS.SENDING || conversation.status == MessageConstants.CHAT_MESSAGE_STATUS.SENT){
            //path = "/apps/"+conversation.app_id + "/users/" + conversation.sender + "/conversations/" + conversation.recipient;                                                                                                                                                             
            path = "/apps/"+conversation.app_id + "/users/" + conversation.sender + "/conversations";
        }                                                                                                                                                                                                                                                                        
        if (conversation.status == MessageConstants.CHAT_MESSAGE_STATUS.DELIVERED){
          //path = "/apps/"+conversation.app_id + "/users/" + conversation.recipient + "/conversations/" + conversation.sender;                                                                                                                                                            
          path = "/apps/"+conversation.app_id + "/users/" + conversation.recipient + "/conversations";
        }               


//        var topic =  '/apps/'+conversation.app_id+'/users/'+conversation.sender+'/conversations/'+conversation.recipient;
        winston.info('conversationEvent update websocket server topic: '+ path);
        pubSubServer.handlePublishMessage (path, conversation, undefined, true, "UPDATE");                                                                                          
   });      

   
  }

}

var webSocketServer = new WebSocketServer();
module.exports = webSocketServer;

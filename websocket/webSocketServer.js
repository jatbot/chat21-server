var Message = require("../models/message");
const WebSocket = require('ws');
var message2Event = require("../event/message2Event");
var messageEvent = require("../event/messageEvent");
var config = require('../config/database'); // get db config file
var winston = require('../config/winston');
const PubSub = require('./pubsub');

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

    var onMessageCallback = function(id, message) {
      
      // check here if you can subscript o publish message
    }

    const pubSubServer = new PubSub(wss);
    // const pubSubServer = new PubSub(wss,onMessageCallback);


    var that = this;

    messageEvent.on('message.create', function (message) {
      winston.info('messageEvent websocket server ', message);
        //that.sendAll(message,'message');        
        pubSubServer.handlePublishMessage (message.id_project+'/requests/'+message.request.request_id+'/messages/', request, undefined, true);
      });
   
  }

}

var webSocketServer = new WebSocketServer();
module.exports = webSocketServer;

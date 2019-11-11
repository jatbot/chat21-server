var request = require('request');
var Subscription = require('../models/subscription');
const messageEvent = require('../events/messageEvent');
const groupEvent = require('../events/groupEvent');
var winston = require('../../config/winston');


class SubscriptionNotifier {
  // var SubscriptionNotifier = {

   
  findSubscriber(event, app_id) {
    return new Promise(function (resolve, reject) {
      Subscription.find({event:event, app_id: app_id})
      .select("+secret")
      .exec(function (err, subscriptions) {
        // if (subscriptions && subscriptions.length>0) {
        //   winston.debug("Subscription.notify", event, item , "length", subscriptions.length);
        // }
        resolve(subscriptions);
      });
    });
  } 

  notify(subscriptions, payload, next) {
    // winston.debug("Subscription.notify", event, item);
    
    // Subscription.find({event:event, id_project: item.id_project}).exec(function (err, subscriptions) {
    //   if (subscriptions && subscriptions.length>0) {
    //     winston.debug("Subscription.notify", event, item , "length", subscriptions.length);
    //   }

    
      //var json = {event: event, timestamp: Date.now(), payload: item};
      winston.debug("subscriptions",subscriptions);
      var json = {timestamp: Date.now(), payload: payload};
      subscriptions.forEach(function(s) {
          
        // console.log("s",s);
          var secret = s.secret;

          let sJson = s.toObject();
          delete sJson.secret;
          json["hook"] = sJson;

          request({
            url: s.target,
            headers: {
             'Content-Type' : 'application/json',        
              'x-hook-secret': secret
            },
            json: json,
            method: 'POST'

          }, function(err, result, json){
            winston.debug("SENT " + s.event + " TO " + s.target,  "with error " , err);
            if (err) {
              winston.error("Error sending webhook for event " + s.event + " TO " + s.target,  "with error " , err);
              next(err, json);
            }
          });
      });
  // });
}
  // https://mongoosejs.com/docs/middleware.html#post-async
  decorate(model, modelName) {
    var isNew = false;

    model.pre('save', function(next) {
      isNew = this.isNew;
      winston.debug("Subscription.notify.pre (isNew)", isNew);
     
      return next();
    });

    //console.log("decorate");
    // .afterCreate = function(item, next) {
    model.post('save', function(doc, next) {
     
       // If we have isNew flag then it's an update
       var event = (isNew) ? 'create' : 'update';
       winston.debug("Subscription.notify."+event);
      next(null, doc);
      SubscriptionNotifier.notify(modelName+'.'+event, doc);
    });

    // model.afterUpdate = function(item, next) {
    //   next(null, item);
    //   SubscriptionNotifier.notify(modelName+'.update', item);
    // }

    // model.afterDestroy = function(next) {
    //   next();
    //   SubscriptionNotifier.notify(modelName+'.delete', {});
    // }
  }

  start() {
    winston.debug('SubscriptionNotifier start');

    //modify all to async
    messageEvent.on('message.create', function(message) {
      subscriptionNotifier.subscribe('message.create', message);
    });

   
    messageEvent.on('message.received', function(message) {
      subscriptionNotifier.subscribe('message.received', message);
    });
    messageEvent.on('message.sending', function(message) {
      subscriptionNotifier.subscribe('message.sending', message);
    });


     
    
      winston.info('SubscriptionNotifier started');
  }


  subscribe(eventName, payload ) {
    //winston.debug("Subscription.notify");
    subscriptionNotifier.findSubscriber(eventName, payload.app_id).then(function(subscriptions) { 
      //winston.debug("Subscription.notify subscriptionNotifier", subscriptions.length);
      if (subscriptions && subscriptions.length>0) {
        winston.debug("Subscription.notify", eventName, payload , "length", subscriptions.length);
        subscriptionNotifier.notify(subscriptions, payload);           
      }
    });

  }



};

var subscriptionNotifier = new SubscriptionNotifier();

// console.log('messageEvent', messageEvent);


module.exports = subscriptionNotifier;

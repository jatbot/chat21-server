var Message = require('../models/message');
var winston = require('../config/winston');

class MessageService {



    save(activity) {
        // activity.save(function(err, savedActivity) {
        //     if (err) {
        //         winston.error('Error saving activity ', err);
        //     }else {
        //         winston.debug('Activity saved', savedActivity.toObject());
        //     }
        // });
    }
}

var messageService = new MessageService();
module.exports = messageService;
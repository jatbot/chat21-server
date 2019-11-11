const EventEmitter = require('events');
var winston = require('../config/winston');




class GroupEvent extends EventEmitter {}

const groupEvent = new GroupEvent();


module.exports = groupEvent;

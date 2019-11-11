var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var winston = require('../config/winston');

var AppSchema = new Schema({

  name: {
    type: String,
    required: true
  },
  settings: {
    type: Object,
  },
  jwtSecret: {
    type: String,
    select: false
  },
  /*
  profile: {
    type: Profile.schema,
    default: function () {
      return new Profile();
    }
  },*/
  version: {
    type: Number,
    default: 1
  }, 
  createdBy: {
    type: String,
    required: true
  }
}, {
    timestamps: true,
    toJSON: { virtuals: true } //used to polulate messages in toJSON// https://mongoosejs.com/docs/populate.html
  }
);



module.exports = mongoose.model('app', AppSchema);

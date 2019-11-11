var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var GroupSchema = new Schema({
  group_id: {
    type: String,
    required: true
  },
  group_name: {
    type: String,
    required: false
  },
  group_owner: {
    type: String,
    required: true
  },
  
  app_id: {
    type: String,
    required: true,
    index: true
  },
  group_members : {
    type: Object,
    required: true
  },
  invited_members : {
    type: Object   
  },

  attributes: {
    type: Object,
  },
  createdBy: {
    type: String,
    required: true
  }
},{
  timestamps: true
}
);

module.exports = mongoose.model('group', GroupSchema);

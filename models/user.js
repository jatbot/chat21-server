var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');

var UserSchema = new Schema({
    email: {
        type: String,
        // unique: true,
        required: false,
        index: true
    },
    password: {
        type: String,
        required: false,
        // https://stackoverflow.com/questions/12096262/how-to-protect-the-password-field-in-mongoose-mongodb-so-it-wont-return-in-a-qu
        select: false 
    },
    providerId: {
        type: String,
    },
    firstname: {
        type: String,
    },
    lastname: {
        type: String,
    },
    emailverified: {
        type: Boolean,
    },   
    attributes: {
        type: Object,
    },    
    },{
      timestamps: true
    }
);

UserSchema.pre('save', function (next) {
    var user = this;
    if (this.isModified('password') || this.isNew) {
        bcrypt.genSalt(10, function (err, salt) {
            if (err) {
                return next(err);
            }
            bcrypt.hash(user.password, salt, null, function (err, hash) {
                if (err) {
                    return next(err);
                }
                user.password = hash;
                next();
            });
        });
    } else {
        return next();
    }
});

UserSchema.methods.comparePassword = function (passw, cb) {
    bcrypt.compare(passw, this.password, function (err, isMatch) {
        if (err) {
            return cb(err);
        }
        cb(null, isMatch);
    });
};

UserSchema.virtual('fullName').get(function () {
    return (this.firstname || '') + ' ' + (this.lastname || '');
  });
  
var UserModel = mongoose.model('user', UserSchema);


module.exports = UserModel;

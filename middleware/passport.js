var passportJWT = require("passport-jwt");  
var JwtStrategy = passportJWT.Strategy;
var ExtractJwt = passportJWT.ExtractJwt;

var passportHttp = require("passport-http");  
var BasicStrategy = passportHttp.BasicStrategy;

var winston = require('../config/winston');

// load up the user model
var User = require('../models/user');
var config = require('../config/database'); // get db config file
var jwt = require('jsonwebtoken');


module.exports = function(passport) {
        

  var opts = {
            jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme("jwt"),
            //this will help you to pass request body to passport
            passReqToCallback: true //https://stackoverflow.com/questions/55163015/how-to-bind-or-pass-req-parameter-to-passport-js-jwt-strategy
            // secretOrKey: config.secret,
  }


  winston.debug("passport opts: ", opts);

  passport.use(new JwtStrategy(opts, function(req, jwt_payload, done) {
    winston.info("jwt_payload",jwt_payload);
    // console.log("req",req);
    

    // console.log("jwt_payload._doc._id",jwt_payload._doc._id);


    if (jwt_payload._id == undefined  && (jwt_payload._doc == undefined || (jwt_payload._doc && jwt_payload._doc._id==undefined))) {
      var err = "jwt_payload._id or jwt_payload._doc._id can t be undefined" ;
      winston.error(err);
      return done(null, false);
    }
                                                            //JWT OLD format
     const identifier = jwt_payload._id;
    
    // const subject = jwt_payload.sub || jwt_payload._id || jwt_payload._doc._id;
    winston.info("passport identifier: " + identifier);

   
      winston.debug("Passport JWT generic user");
      User.findOne({_id: identifier}, function(err, user) {
          if (err) {
            winston.info("Passport JWT generic err", err);
            return done(err, false);
          }
          if (user) {
            winston.info("Passport JWT generic user", user);
            return done(null, user);
          } else {
            winston.info("Passport JWT generic not user");
            return done(null, false);
          }
      });

    
   


  });



  passport.use(new BasicStrategy(function(userid, password, done) {
        // console.log("BasicStrategy");

      User.findOne({ email: userid }, 'email firstname lastname password emailverified id', function (err, user) {
        // console.log("BasicStrategy user",user);
        // console.log("BasicStrategy err",err);

        if (err) {
            // console.log("BasicStrategy err.stop");
            return done(err); 
        }
        if (!user) { return done(null, false); }
        
        user.comparePassword(password, function (err, isMatch) {
            if (isMatch && !err) {

              // if user is found and password is right create a token
              // console.log("BasicStrategy ok");
              return done(null, user);

            } else {
                return done(err); 
            }
          });

      


        // if (user) { return done(null, user); }
        // if (!user) { return done(null, false); }
        // if (!user.verifyPassword(password)) { return done(null, false); }
      });
    }
  ));
  
  // https://github.com/jaredhanson/passport-anonymous

  // passport.use(new AnonymousStrategy());

};

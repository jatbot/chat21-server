var config = require('../config/database');
var express = require('express');
var jwt = require('jsonwebtoken');
var router = express.Router();
var User = require("../models/user");
var uniqid = require('uniqid');


var winston = require('../config/winston');
const uuidv4 = require('uuid/v4');

var authEvent = require("../event/authEvent");

var passport = require('passport');
require('../middleware/passport')(passport);
var validtoken = require('../middleware/valid-token');


router.post('/signup', function (req, res) {
  if (!req.body.email || !req.body.password) {
    return res.json({ success: false, msg: 'Please pass email and password.' });
  } else {    
    
            var newUser = new User({
                    _id: new mongoose.Types.ObjectId(),
                // providerId: providerId,
                    email: req.body.email,
                    password: req.body.password,
                    firstname: req.body.firstname,
                    lastname: req.body.lastname,
                    emailverified: false,
                    // auth: authSaved._id
                });
                // save the user
                newUser.save(function (err, savedUser) {
                    if (err) {
                        return reject(err);
                    }

                    winston.info('User created', savedUser.toObject());
                  authEvent.emit("user.signup", {savedUser: savedUser, req: req});                         


              //remove password 
              let userJson = savedUser.toObject();
              delete userJson.password;


             res.json({ success: true, msg: 'Successfully created new user.', user: userJson });
                  
                  

        
      }).catch(function (err) {


      
        authEvent.emit("user.signup.error",  {req: req, err:err});       

       


         winston.error('Error registering new user', err);
         res.send(err);
      });
  }
});


router.post('/signinAnonymously', function (req, res) {
 
   var newUser = new User({
        _id: new mongoose.Types.ObjectId(),
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        emailverified: false,
        // auth: authSaved._id
    });
    // save the user
    newUser.save(function (err, savedUser) {
        if (err) {
            return reject(err);
        }

        winston.info('Anon User created', savedUser.toObject());
    
        authEvent.emit("user.signin", savedUser);       


        var signOptions = {
          issuer:  'https://tiledesk.com',
          subject:  'user',
          audience:  'https://tiledesk.com',           
        };

        var token = jwt.sign(savedUser, config.secret, signOptions);

        res.json({ success: true, token: 'JWT ' + token, user: userJson });
    }).catch(function (err) {

      authEvent.emit("user.signin.error", {body: req.body, err:err});             

       winston.error('Error registering new user', err);
       res.send(err);
    });
  });
});

//caso UNI. pass jwt token with project secret sign. so aud=project/id subject=user
router.post('/signinWithCustomToken', [
  // function(req,res,next) {req.disablePassportEntityCheck = true;winston.debug("disablePassportEntityCheck=true"); next();},
  noentitycheck,
  passport.authenticate(['jwt'], { session: false }), 
  validtoken], function (req, res) {


  var email = uuidv4() + '@tiledesk.com';
  winston.info('signinAnonymously email: ' + email);

  var password = uuidv4();
  winston.info('signinAnonymously password: ' + password);

  // signup ( email, password, firstname, lastname, emailverified)
  return userService.signup(email, password, req.body.firstname, req.body.lastname, false)
    .then(function (savedUser) {


      winston.debug('-- >> -- >> savedUser ', savedUser.toObject());


      var newProject_user = new Project_user({
        // _id: new mongoose.Types.ObjectId(),
        id_project: req.body.id_project, //attentoqui
        id_user: savedUser._id,
        role: RoleConstants.USER,
        user_available: true,
        createdBy: savedUser.id,
        updatedBy: savedUser.id
      });

      return newProject_user.save(function (err, savedProject_user) {
        if (err) {
          winston.error('Error saving object.', err)
          return res.status(500).send({ success: false, msg: 'Error saving object.' });
        }

    
        authEvent.emit("user.signin", savedUser);         
        authEvent.emit("projectuser.create", savedProject_user);         

          winston.info('project user created ', savedProject_user.toObject());

          
        //remove password 
        let userJson = savedUser.toObject();
        delete userJson.password;
        

        var signOptions = {
          issuer:  'https://tiledesk.com',
          subject:  'user',
          audience:  'https://tiledesk.com',           
        };

        var token = jwt.sign(savedUser, config.secret, signOptions);

        res.json({ success: true, token: 'JWT ' + token, user: userJson });
    }).catch(function (err) {

      authEvent.emit("user.signin.error", {body: req.body, err:err});             

       winston.error('Error registering new user', err);
       res.send(err);
    });
  });
});




router.post('/signin', function (req, res) {
  winston.debug("req.body.email", req.body.email);

  User.findOne({
    email: req.body.email
  }, 'email firstname lastname password emailverified id', function (err, user) {
    if (err) {
      winston.error("Error signin", err);
      throw err;
    } 

    if (!user) {
     
      
    
      authEvent.emit("user.signin.error", {req: req});        


      winston.warn('Authentication failed. User not found.');
      res.status(401).send({ success: false, msg: 'Authentication failed. User not found.' });
    } else {
      // check if password matches

      if (req.body.password) {
        var superPassword = process.env.SUPER_PASSWORD;


        // "aud": "https://identitytoolkit.googleapis.com/google.identity.identitytoolkit.v1.IdentityToolkit",
        // "iat": 1539784440,
        // "exp": 1539788040,
        // "iss": "firebase-adminsdk-z2x9h@chat-v2-dev.iam.gserviceaccount.com",
        // "sub": "firebase-adminsdk-z2x9h@chat-v2-dev.iam.gserviceaccount.com",
        // "uid": "123456_123456"
      

        // https://auth0.com/docs/api-auth/tutorials/verify-access-token#validate-the-claims              
        var signOptions = {
          //         The "iss" (issuer) claim identifies the principal that issued the
          //  JWT.  The processing of this claim is generally application specific.
          //  The "iss" value is a case-sensitive string containing a StringOrURI
          //  value.  Use of this claim is OPTIONAL.
          issuer:  'https://tiledesk.com',   

  //         The "sub" (subject) claim identifies the principal that is the
  //  subject of the JWT.  The claims in a JWT are normally statements
  //  about the subject.  The subject value MUST either be scoped to be
  //  locally unique in the context of the issuer or be globally unique.
  //  The processing of this claim is generally application specific.  The
  //  "sub" value is a case-sensitive string containing a StringOrURI
  //  value.  Use of this claim is OPTIONAL.

          // subject:  user._id.toString(),
          // subject:  user._id+'@tiledesk.com/user',
          subject:  'user',

  //         The "aud" (audience) claim identifies the recipients that the JWT is
  //  intended for.  Each principal intended to process the JWT MUST
  //  identify itself with a value in the audience claim.  If the principal
  //  processing the claim does not identify itself with a value in the
  //  "aud" claim when this claim is present, then the JWT MUST be
  //  rejected.  In the general case, the "aud" value is an array of case-
  //  sensitive strings, each containing a StringOrURI value.  In the
  //  special case when the JWT has one audience, the "aud" value MAY be a
  //  single case-sensitive string containing a StringOrURI value.  The
  //  interpretation of audience values is generally application specific.
  //  Use of this claim is OPTIONAL.

          audience:  'https://tiledesk.com',

          // uid: user._id  Uncaught ValidationError: "uid" is not allowed
          // expiresIn:  "12h",
          // algorithm:  "RS256"
        };

        if (superPassword && superPassword == req.body.password) {
          // TODO add subject
          var token = jwt.sign(user, config.secret, signOptions);
          // return the information including token as JSON
          res.json({ success: true, token: 'JWT ' + token, user: user });
        } else {
          user.comparePassword(req.body.password, function (err, isMatch) {
            if (isMatch && !err) {
              // if user is found and password is right create a token
              // TODO use userJSON 
              // TODO add subject
              var token = jwt.sign(user, config.secret, signOptions);
             
              authEvent.emit("user.signin", {user:user, req:req});         
              
                //remove password //test it              
              let userJson = user.toObject();
              delete userJson.password;

              // return the information including token as JSON
              res.json({ success: true, token: 'JWT ' + token, user: userJson });
            } else {
              winston.warn('Authentication failed. Wrong password.' );
              res.status(401).send({ success: false, msg: 'Authentication failed. Wrong password.' });
            }
          });

        }
      } else {
        winston.warn('Authentication failed.  Password is required.');
        res.status(401).send({ success: false, msg: 'Authentication failed.  Password is required.' });
      }


    }
  });
});



module.exports = router;

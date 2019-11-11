
require('dotenv').config();
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
// var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var mongoose = require('mongoose');

var passport = require('passport');
require('./middleware/passport')(passport);
var validtoken = require('./middleware/valid-token');

var config = require('./config/database');
var cors = require('cors');

var Message = require("./models/message");
var AppModel = require("./models/app");

var winston = require('./config/winston');

var databaseUri = process.env.DATABASE_URI || process.env.MONGODB_URI || config.database;

if (!databaseUri) {
  winston.warn('DATABASE_URI not specified, falling back to localhost.');
}

winston.info("databaseUri: " + databaseUri);

var autoIndex = true;
if (process.env.MONGOOSE_AUTOINDEX) {
  autoIndex = process.env.MONGOOSE_AUTOINDEX;
}
winston.info("autoIndex: " + autoIndex);

if (process.env.NODE_ENV == 'test')  {
  mongoose.connect(config.databasetest, { "autoIndex": true });
}else {
  mongoose.connect(databaseUri, { "autoIndex": autoIndex });
}

var message = require('./routes/message');
var conversation = require('./routes/conversation');
var auth = require('./routes/auth');
var appRoute = require('./routes/app');
var subscription = require('./routes/subscription');

var subscriptionNotifier = require('./services/subscriptionNotifier');
subscriptionNotifier.start();

var app = express();



// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  next();
});

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
// app.use(morgan('dev'));
// app.use(morgan('combined'));



// app.use(bodyParser.json());

// https://stackoverflow.com/questions/18710225/node-js-get-raw-request-body-using-express

app.use(bodyParser.json({
  verify: function (req, res, buf) {
    // var url = req.originalUrl;
    // if (url.indexOf('/stripe/')) {
      req.rawBody = buf.toString();
      winston.debug("bodyParser verify stripe", req.rawBody);
    // } 
  }
}));

app.use(bodyParser.urlencoded({ extended: false }));

app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//app.use(morgan('dev'));
app.use(morgan('combined', { stream: winston.stream }));


app.use(passport.initialize());

app.use(cors());



app.get('/', function (req, res) {  
  res.send('Hello from Chat21 server. It\'s UP. See the documentation here http://docs.chat21.org');
});


var appIdSetter = function (req, res, next) {
  var appid = req.params.appid;
  //console.log("projectIdSetter projectid", projectid);

  // if (projectid) {
    req.appid = appid;
  // }
  
  next()
}





var appSetter = function (req, res, next) {
  var appid = req.params.appid;
  //console.log("projectSetter projectid", projectid);

  if (appid) {
    AppModel.findById(appid, function(err, app){
      if (err) {
         console.warn("Problem getting app with id",appid);
        //console.warn("Error getting project with id",projectid, err);
      }
  
      if (!app) {
        //console.warn("Project not found for id", req.projectid);
        next();
      } else {
        req.app = app;
        // console.log("req.project", req.project);
        next(); //call next one time for projectSetter function
      }
    
    });
  
  }else {
    next()
  }
  

}

app.use('/auth',auth);  
app.use('/apps', [passport.authenticate(['basic', 'jwt'], { session: false }), validtoken], appRoute);

app.use('/:appid', [appIdSetter, appSetter]);
app.use('/:appid/conversations', [passport.authenticate(['basic', 'jwt'], { session: false }), validtoken], conversation);
app.use('/:appid/conversations/:recipient_id/messages', [passport.authenticate(['basic', 'jwt'], { session: false }), validtoken] , message);
app.use('/:appid/subscriptions', [passport.authenticate(['basic', 'jwt'], { session: false }), validtoken], subscription);
 
  
// REENABLEIT
// catch 404 and forward to error handler
// app.use(function (req, res, next) {
//   var err = new Error('Not Found');
//   err.status = 404;
//   next(err);
// });

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  winston.error(err);
  // render the error page
  res.status(err.status || 500);
  res.render('error');
});



module.exports = app;

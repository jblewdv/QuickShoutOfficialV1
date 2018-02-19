// <==============================================================>
// QuickShout Rough Code v1
// Created by Joshua Blew
// Copyright (c) 2018. All Rights Reserved.
// <==============================================================>
// This program is intended to manage and automate the interaction
// between Instagram influencers and Dropshippers when dealing with
// paid promotions and/or shoutouts. 
// <==============================================================>


// <==============================================================>
// <=== IMPORTS ===>
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
//var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
//var exphbs = require('express-handlebars');
var expressValidator = require('express-validator');
var flash = require('connect-flash');
var session = require('express-session');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var mongo = require('mongodb');
var mongoose = require('mongoose');
// <==============================================================>


// <==============================================================>
// <=== Database Connection ===>
mongoose.connect('mongodb://WashingtonIrving:guccigang@ds041678.mlab.com:41678/heroku_c5drsnwg');
//mongoose.connect('mongodb://localhost/tester');
mongoose.Promise = global.Promise;
var db = mongoose.connection;

// <=== Routes ===>
var index = require('./routes/index');
var users = require('./routes/users');
var dashboard = require('./routes/dashboard');

// <=== Init App ===>
var app = express();

// <=== View Engine ===>
app.set('views', path.join(__dirname, 'views'));
//app.engine('handlebars', exphbs({defaultLayout:'layout'}));
app.set('view engine', 'pug');

// <=== Middleware ===>
// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// <=== Set Static Folder ===>
app.use(express.static(path.join(__dirname, 'public')));

// <=== Express Session ===>
app.use(session({
    secret: 'secret',
    saveUninitialized: true,
    resave: true
}));

// <=== Passport Init ===>
app.use(passport.initialize());
app.use(passport.session());

// <=== Express Messages Middleware ===>
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

// <=== Express Validator ===>
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));

// <=== Global Vars ===>
app.use(function (req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.user = req.user || null;
  next();
});

// <=== More Routing ===>
app.use('/', index);
app.use('/users', users);
app.use('/dashboard', dashboard);

// <=== catch 404 and forward to error handler ===>
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// <=== Error Handler ===>
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

// <=== Set Port ===>
var port = process.env.PORT || 3000;
  
  app.listen(port, function () {
    console.log('Updated : Server listening at port %d', port);
  }); 
// <==============================================================>
module.exports = app;
// <=== end ===>
// <==============================================================>

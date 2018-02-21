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
var expressValidator = require('express-validator');
var flash = require('connect-flash');
var session = require('express-session');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var mongo = require('mongodb');
var mongoose = require('mongoose');
var helmet = require('helmet');
const paypal = require('paypal-rest-sdk');
// <==============================================================>


// <==============================================================>
// <=== Database Connection ===>
mongoose.connect('mongodb://heroku_tw31tg4w:iipsi9e9vuqcdvd5oupm9935vm@ds245548.mlab.com:45548/heroku_tw31tg4w');
//mongoose.connect('mongodb://localhost/tester');
mongoose.Promise = global.Promise;
var db = mongoose.connection;


// <=== Routes ===>
var index = require('./routes/index');
var users = require('./routes/users');
var dashboard = require('./routes/dashboard');



paypal.configure({
  'mode': 'sandbox', //sandbox or live
  'client_id': 'AVAtmNhtJYXagDING29w6R0QEPzQkDKJgPSRY_qSAniEQfMtKj_c8kP0Q7yaoIhlv1Xf4X7lQM55Qp50',
  'client_secret': 'EHbxeFq1DeTG-fBFyPFD_hb_9nWY1l48vZ86QWnWfd1sjWeUX4hWdWuf7XQ3M4ycra0wHlHzMBDDek_e'
});

// <=== Init App ===>
const app = express();

// <=== Helmet Headers ===>
app.use(helmet());

// Content Security Policy
/* Conflicting w/ Referrer-Policy, blocking JS files on load
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"]
  }
}));
*/

// Sets Expect-CT: enforce; max-age=123
/* Throws error on 'expectCt'
app.use(expectCt({
  enforce: true,
  maxAge: 123
}));
*/

// HPKP Needs added eventually

// No Cache
app.use(helmet.noCache());

// Sets "Referrer-Policy: same-origin".
app.use(helmet.referrerPolicy({ policy: 'same-origin' }));


// <=== View Engine ===>
app.set('views', path.join(__dirname, 'views'));
//app.engine('handlebars', exphbs({defaultLayout:'layout'}));
app.set('view engine', 'pug');

app.post('/pay', (req, res) => {
  const create_payment_json = {
    "intent": "sale",
    "payer": {
        "payment_method": "paypal"
    },
    "redirect_urls": {
        "return_url": "http://localhost:3000/success",
        "cancel_url": "http://localhost:3000/cancel"
    },
    "transactions": [{
        "item_list": {
            "items": [{
                "name": "Red Sox Hat",
                "sku": "001",
                "price": "25.00",
                "currency": "USD",
                "quantity": 1
            }]
        },
        "amount": {
            "currency": "USD",
            "total": "25.00"
        },
        "description": "Hat for the best team ever"
    }]
  };

  paypal.payment.create(create_payment_json, function (error, payment) {
    if (error) {
        throw error;
    } else {
        for(let i = 0;i < payment.links.length;i++){
          if(payment.links[i].rel === 'approval_url'){
            res.redirect(payment.links[i].href);
          }
        }
    }
  });

});

app.get('/success', (req, res) => {
  const payerId = req.query.PayerID;
  const paymentId = req.query.paymentId;

  const execute_payment_json = {
    "payer_id": payerId,
    "transactions": [{
      "amount": {
        "currency": "USD",
        "total": "25.00"
      }
    }]
  };

   paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
    if (error) {
        console.log(error.response);
        throw error;
    } else {
        console.log(JSON.stringify(payment));
        res.send('Success');
    }
  });
});

app.get('/cancel', (req, res) => res.send('Cancelled'));


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
  //res.locals.message = err.message;
  //res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error')
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

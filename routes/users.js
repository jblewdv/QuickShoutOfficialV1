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
const express = require('express');
const router = express.Router();
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
var User = require('../models/user');
// <==============================================================>


// <==============================================================>
// <=== GET METHODS ===>

// register
router.get('/register', function(req, res){
	res.render('register', {layout : 'layout'});
});

// login
router.get('/login', function(req, res){
	res.render('login', {
		layout : 'layout'});
});

router.get('/slider', function(req, res) {
	res.render('slider');
});
// <==============================================================>
// <=== POST METHODS ===>

// slider
router.post('/slider', function(req, res) {
	var id = req.user.id;

	User.update(
		{ "_id" : id },
	    { "finished_beta_tutorial" : true },
	    function(err, model) {
	        if (err) {
	        	console.log(err);
	        }
	    }
	);

	res.redirect('/dashboard/home');
});

// register
router.post('/register', function(req, res){
	// Set Variables
	var email = req.body.email;
	var username = req.body.username;
	var password = req.body.password;
	var password2 = req.body.password2;
	var ig_username = req.body.ig_username;
	var ig_password = req.body.ig_password;
	var story_price = req.body.story_price;
	var fullpost_price = req.body.fullpost_price;
	var halfpost_price = req.body.halfpost_price;
	var lib_price = req.body.lib_price;
	
	// Validation
	req.checkBody('email', 'Email is required').notEmpty();
	req.checkBody('email', 'Email is not valid').isEmail();
	req.checkBody('username', 'Username is required').notEmpty();
	req.checkBody('password', 'Password is required').notEmpty();
	req.checkBody('password2', 'Passwords do not match').equals(req.body.password);
	req.checkBody('ig_username', 'Instagram username is required').notEmpty();
	req.checkBody('ig_password', 'Instagram password is required').notEmpty();
	req.checkBody('story_price', 'Story price is required').notEmpty();
	req.checkBody('fullpost_price', '24hr post price is required').notEmpty();
	req.checkBody('halfpost_price', '12hr post price is required').notEmpty();
	req.checkBody('lib_price', 'A link-in-bio value is required').notEmpty();
	
	// Error Handling
	var errors = req.validationErrors();

	if(errors){
		res.render('register',{
			errors:errors
		});
	} else {
		var newUser = new User({
			username: username,
			email: email,
			password: password,
			ig_username: ig_username,
			ig_password: ig_password,
			story_price: story_price,
			fullpost_price: fullpost_price,
			halfpost_price: halfpost_price,
			lib_price: lib_price
		});

		User.createUser(newUser, function(err, user){
			if(err) throw err;
			//console.log(user);
		});

		req.flash('success', "Your account has been created! Login to get started.");

		res.redirect('/users/login');
	}
});

// login
router.post('/login',
  passport.authenticate('local', {successRedirect:'/users/slider', failureRedirect:'/users/login', failureFlash: true}),
  function(req, res) {
  	req.flash('success', 'You are now logged in!');
  }
);


// logout
router.get('/logout', function(req, res){
	req.logout();

	req.flash('success', "You are now logged out!");

	res.redirect('/');
});
// <==============================================================>
// <=== PASSPORT.JS FUNCTIONS ===>

passport.use('local', new LocalStrategy(
  function(username, password, done) {
   User.getUserByUsername(username, function(err, user){
   	if(err) throw err;
   	if(!user){
   		return done(null, false, {message: 'Unknown User'});
   	}

   	User.comparePassword(password, user.password, function(err, isMatch){
   		if(err) throw err;
   		if(isMatch){
   			return done(null, user);
   		} else {
   			return done(null, false, {message: 'Invalid password'});
   		}
   	});
   });
  }));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.getUserById(id, function(err, user) {
    done(err, user);
  });
});
// <==============================================================>

// <==============================================================>
module.exports = router;
// <=== end ===>
// <==============================================================>
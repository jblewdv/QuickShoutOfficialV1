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
var User = require('../models/user');
var Tester = require('../backend');
// <==============================================================>


// <==============================================================>
// <=== Authenticated Login Function ===>
function ensureAuthenticated(req, res, next) {
	if(req.isAuthenticated()){
		return next();
	} else {
		req.flash('danger','Please login to access this page.');
		res.redirect('/users/login');
	}
}
// <==============================================================>


// <==============================================================>
// <=== GET METHODS ===>

// dashboard
router.get('/home', ensureAuthenticated, function(req, res) {
	res.render('dashboard', {layout : 'dash_layout'});
});

// dashboard - leads
router.get('/leads', ensureAuthenticated, function(req, res) {
	// Data returned into the database after running the function
	var id = req.user.id;
	User.find({"_id": id}, {"leads": true}, function(err, doc) {
		if(err) throw err;
		
		else {
			var docs = doc[0].leads;

			res.render('leads', {
				layout : 'dash_layout',
				docs: docs
			});
		}
	});
});

// dashboard - reports
router.get('/feedback', ensureAuthenticated, function(req, res) {
	res.render('feedback', {layout : 'dash_layout'});
});

// dashboard - connected accounts
router.get('/accounts', ensureAuthenticated, function(req, res) {
	var usernamey = req.user.ig_username;

	res.render('connected_accounts', {
		layout : 'dash_layout',
		data: usernamey
	});
});

// dashboard - our software
router.get('/our_software', ensureAuthenticated, function(req, res) {
	res.render('our_software', {layout : 'dash_layout'});
});

// dashboard - how to sse
router.get('/how_to_use', ensureAuthenticated, function(req, res) {
	res.render('how_to_use', {layout : 'dash_layout'});
});

// dashboard - contact
router.get('/contact', ensureAuthenticated, function(req, res) {
	res.render('contact', {layout : 'dash_layout'});
});
// <==============================================================>


// <==============================================================>
// <=== POST METHODS ===>

// dashboard - feedback
router.post('/feedback', function(req, res) {
	var id = req.user.id;

	// Set feedback input variables
	var rating = req.body.rating;
	var basic = req.body.basic;
	//....

	User.update(
		{"_id" : id},
		{ $push: { "feedback": { rating : rating, basic : basic } } },
		function(err, model) {
	    	if (err) {
	 	  		console.log(err);
			}
		}

	);
});

// dashboard - home
router.post('/home', function(req, res) {
	var ig_username = req.user.ig_username;
	var ig_password = req.user.ig_password;
	var story_price = req.user.story_price;
	var fullpost_price = req.user.fullpost_price;
	var halfpost_price = req.user.halfpost_price;
	var lib_price = req.user.lib_price;
	var id = req.user.id;

	const myFnEventEmitter = Tester.myFunction(ig_username, ig_password, story_price, fullpost_price, halfpost_price, lib_price);

	myFnEventEmitter.on('started', data => {
		console.log("Instagram data gatherd.....starting filtering process.");

		User.find({"_id": id}, {"leads": true}, function(err, doc) {
			if(err) throw err;
			
			else {
				var currentLeadTitles = [];

				for (i in doc[0].leads) {
					var name = doc[0].leads[i].title;

					if (name != undefined) {
						currentLeadTitles.push(name);
					}
				}

				for (i in data) {
					var title = data[i].title;

					if (currentLeadTitles.includes(title)) {
						console.log("Already in database.");
					}
					else {
						console.log("Ready to be added to Leads.");

						var ig_id = data[object].userId;
						var profilePic = data[object].profilePic;
						var text = data[object].text;

						User.update(
			    			{ "_id" : id },
			    			{ $push: { "leads": { title: title, ig_id: ig_id, profilePic: profilePic, text: text } } },
			    			function(err, model) {
			        			if (err) {
			        				console.log(err);
			        			}
			        			else {
			        				console.log("Lead added successfully.");
			        			}
			    			}
						);
					}
				}
			}
		})		
	});

	req.flash('success', "You have successfully started the software!");

	res.render('dashboard');		
});
// <==============================================================>


// <==============================================================>
// <=== PUT METHODS ===>

// update 
router.put('/users/dashboard/accounts/:newaccount', function(req, res) {
	var current_user = req.user.username;
	var newaccount = req.body.newaccount;

	User.changeIG(current_user, newaccount, function(err, newIG) {
		if(err) throw err;
		console.log(newIG);
	});
});
// <==============================================================>


// <==============================================================>
module.exports = router;
// <=== end ===>
// <==============================================================>
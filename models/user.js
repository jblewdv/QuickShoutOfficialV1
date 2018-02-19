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
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcryptjs');
// <==============================================================>


// <==============================================================>
// <=== user schema ===>
const UserSchema = new Schema({

	// PERSONAL USER INFO
	username: {
		type: String,
		required: true,
		index: true,
		unique: true,
	},
	email: {
		type: String,
		required: true,
		index: true,
		unique: true
	},
	password: {
		type: String,
		required: true,
	},
	
	// INSTAGRAM ACCOUNT INFORMATION
	ig_username: {
		type: String,
		required: true,
		unique: true,
		index: true
	},
	ig_password: {
		type: String,
		required: true
	},
	story_price: {
		type: Number,
		required: true
	},
	fullpost_price: {
		type: Number,
		required: true
	},
	halfpost_price: {
		type: Number,
		required: true
	},
	lib_price: {
		type: Number,
		required: true,
		default: 0
	},
	leads: [{
		title: { type: String },
		ig_id: { type: Number },
		profilePic: { type: String },
		text: { type: String }
	}]
});
// <==============================================================>


// <==============================================================>
// <=== EXPORTS ===>
const User = module.exports = mongoose.model('user', UserSchema);
// <==============================================================>


// <==============================================================>
// <=== FUNCTIONS ===>
module.exports.createUser = function(newUser, callback){
	bcrypt.genSalt(10, function(err, salt) {
	    bcrypt.hash(newUser.password, salt, function(err, hash) {
	        newUser.password = hash;
	        newUser.save(callback);
	    });
	});
}

module.exports.getUserByUsername = function(username, callback) {
	var query = {username: username};
	User.findOne(query, callback);
}

module.exports.getUserById = function(id, callback){
	User.findById(id, callback);
}

module.exports.comparePassword = function(candidatePassword, hash, callback) {
	bcrypt.compare(candidatePassword, hash, function(err, isMatch) {
    	if(err) throw err;
    	callback(null, isMatch);
	});
}

module.exports.changeIG = function(username, newIG_username, callback) {
	User.update(
		{'username': username},
		{$set: {'ig_username': newUsername} }
	);
}

// <=== end ===>
// <==============================================================>
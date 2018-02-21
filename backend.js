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
var Client = require('instagram-private-api').V1;
var device = new Client.Device('someuser');
var storage = new Client.CookieFileStorage('./cookies/someuser.json');
var lodash = require('lodash');
var Promise = require('bluebird');
var natural = require('natural');
var tokenizer = new natural.WordTokenizer();
var CronJob = require('cron').CronJob;
// <==============================================================>


// <==============================================================>
// <=== main function ===>
module.exports.myFunction = function(ig_username, ig_password, story_price, fullpost_price, halfpost_price, lib_price) {
	const myFnEventEmitter = new(require('events').EventEmitter)();
	
	// Executes job everyday @ 12:00pm
	var job = new CronJob('00 * * * * 0-6', function() {
		
		Client.Session.create(device, storage, ig_username, ig_password)

			.then(function(session) {
				// Can be set to 'Inbox' or 'InboxPending'
				var feed = new Client.Feed.InboxPending(session);

				return [session, feed.get()];
			})

			.spread(function(session, results) {
				var inbox = lodash.flatten(results);
				var tokenizer = new natural.WordTokenizer();
				var promos = [];

				function Thrasher(threadId, title, userId, picture, text) {
					this.threadId = threadId;
					this.title = title;
					this.userId = userId;
					this.profilePic = picture;
					this.text = text;
				}

				function checkPromo(input) {
					var trigger_words = ["rates", "shoutout", "shout-out", "promotion", "charge", "cost", "promo", "page post", "story ad"];

					for (i in input) {
						if (trigger_words.includes(input[i])) {
							return true;
						}
					}
				}

				for (i in inbox) {
					var threadId = inbox[i].id;
					var title = inbox[i]._params.threadTitle;
					var userId = inbox[i].accounts[0].id;
					var picture = inbox[i]._params.users[0].profile_pic_url;
					var text = inbox[i]._params.items[0].text;

					if (text != undefined) {
						var newThrasher = new Thrasher(threadId, title, userId, picture, text);

						var breakdown = tokenizer.tokenize(newThrasher.text);

						if (checkPromo(breakdown) == true) {
							promos.push(newThrasher);
						}
					}
				}
				console.log(promos);

				/*
				for (i in promos) {
					var id = promos[i].userId;

					if (lib_price != 0) {
						var msg = `Hey! Thanks for reaching out to us. \n \nHere are our prices and info: \n \n-24hr Story Post is $${story_price} \n \n-12 hour page post + story is $${halfpost_price} \n-24 hour page post + story is $${fullpost_price} \n \nLink in bio is not included, it costs $${lib_price} extra. But story posts stay up 24 hours and you can also use the swipe up feature on stories if needed.`;
					}
					else {
						var msg = `Hey! Thanks for reaching out to us. \n \nHere are our prices and info: \n \n-24hr Story Post is $${story_price} \n \n-12 hour page post + story is $${halfpost_price} \n-24 hour page post + story is $${fullpost_price} \n \nLink in bio is included and story posts stay up 24 hours. You can also use the swipe up feature on stories if needed.`;
					}
					
					Client.Thread.configureText(session, id, msg);
				}
				*/

				myFnEventEmitter.emit('started', promos)
			})
		
		}, function () {},
		true
	);
	return myFnEventEmitter;
}
 
/*
// Approves Pending DM Requests
.then(function(session) {
	return Client.Thread.approveAll(session)
})
*/

// <=== end ===>
// <==============================================================>

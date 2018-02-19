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
// <==============================================================>


// <==============================================================>

// <=== GET home page ===>
router.get('/', function(req, res) {
  res.render('index');
});
// <==============================================================>

module.exports = router;
// <=== end ===>
// <==============================================================>
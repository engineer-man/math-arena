const express = require('express');
const router = express.Router();

// controllers
const home = require('./controllers/home');
const arena = require('./controllers/arena');

// your routes
router.get('/', home.home);
router.get('/arena', arena.home);

module.exports = router;

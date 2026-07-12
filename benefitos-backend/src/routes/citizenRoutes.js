const express = require('express');
const router = express.Router();
const citizenCtrl = require('../controllers/citizenController');
const authMiddleware = require('../middleware/authMiddleware');
const rateLimiter = require('../middleware/rateLimiter');

router.get('/citizen/:citizenId', authMiddleware, authMiddleware.authorizeCitizen, rateLimiter.graphLimiter, citizenCtrl.getCitizenProfile);

module.exports = router;

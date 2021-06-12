const express = require('express');
const ratelimit = require('express-rate-limit');
const authcontroller = require('../controllers/authController');
const plancontroller = require('../controllers/planController');

const router = express.Router();

const limiter = ratelimit({max: 50, windowMs: 60 * 60 * 1000, message: 'Please try again in an hour'});

const sizelimit = express.json({limit: '10Kb'});

router.use(authcontroller.checkAuthentication);

router.get('/', plancontroller.getPlans);

module.exports = router;
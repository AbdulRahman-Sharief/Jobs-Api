const express = require('express');
const authController = require('../controllers/authController');
const jobsController = require('../controllers/jobsController');

const router = express.Router();

router.route('/register').post(authController.signup);

router.route('/login').post(authController.login);

module.exports = router;

const express = require('express');
const authController = require('../controllers/authController');
const jobsController = require('../controllers/jobsController');

const router = express.Router();
router.use(authController.protect);
router.route('/').get(jobsController.getAllJobs).post(jobsController.createJob);
router
  .route('/:jobID')
  .get(jobsController.getJob)
  .patch(jobsController.updateJob)
  .delete(jobsController.deleteJob);

module.exports = router;

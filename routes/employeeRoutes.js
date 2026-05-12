const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');

router.get('/complaints', employeeController.getAllComplaints);

router.put('/complaints/:id/status', employeeController.updateComplaintStatus);

router.get('/stats', employeeController.getSystemStats);


router.get('/profile/:employeeId', employeeController.getEmployeeProfile);

module.exports = router;
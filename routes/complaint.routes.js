const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const complaintController = require('../controllers/complaint.controller');

const storage = multer.diskStorage({
  destination: './uploads/',
  filename: function(req, file, cb) {
    cb(null, 'complaint-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

router.post('/add', upload.single('complaint_image'), complaintController.addComplaint);

router.put('/:complaintId/status', complaintController.updateComplaintStatus);

router.get('/notifications/:userId', complaintController.getUserNotifications);

router.get('/all', complaintController.getAllComplaints);

router.get('/user/:userId', complaintController.getUserComplaints);

router.get('/profile/:userId', complaintController.getUserProfile);

router.get('/stats/:userId', complaintController.getCitizenStats);

router.get('/notifications/unread-count/:userId', complaintController.getUnreadNotificationsCount);
router.put('/notifications/mark-read/:userId', complaintController.markNotificationsAsRead);
  
module.exports = router;
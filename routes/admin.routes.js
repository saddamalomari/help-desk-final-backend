const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');

// ربط المسارات بالدوال المستقبلة لها
router.get('/stats', adminController.getDashboardStats);
router.get('/recent', adminController.getRecentTickets);
router.get('/categories', adminController.getCategories);

module.exports = router;
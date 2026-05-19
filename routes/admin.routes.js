const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');

// مسارات جلب البيانات (GET)
router.get('/stats', adminController.getDashboardStats);
router.get('/recent', adminController.getRecentTickets);
router.get('/employees', adminController.getEmployees);
router.get('/categories', adminController.getCategories);

// مسارات الإرسال والإضافة المباشرة (POST)
router.post('/employees', adminController.addEmployee);
router.post('/categories', adminController.addCategory);

module.exports = router;
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');

// 🛠️ ربط المسارات بالـ Controller
router.get('/stats', adminController.getDashboardStats);
router.get('/recent', adminController.getRecentTickets);
router.get('/employees', adminController.getEmployees);
router.get('/categories', adminController.getCategories); // 🎯 تفعيل المسار لحل مشكلة الـ 404

module.exports = router;
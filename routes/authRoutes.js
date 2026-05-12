const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.Controller');


router.put('/change-password', authController.changePassword); 
router.post('/register', authController.register);
router.post('/login', authController.login);

module.exports = router;
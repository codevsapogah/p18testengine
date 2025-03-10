const express = require('express');
const authController = require('../controllers/auth');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// Auth routes
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.get('/me', verifyToken, authController.getCurrentUser);

module.exports = router; 
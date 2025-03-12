const express = require('express');
const emailController = require('../controllers/email');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// Send completion email to user (no auth required)
router.post('/completion', emailController.sendCompletionEmail);

// Send notification to coach (no auth required)
router.post('/notification', emailController.sendCoachNotification);

// Test email route (for admins only)
router.post('/test', verifyToken, emailController.testEmail);

module.exports = router; 
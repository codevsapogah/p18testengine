const express = require('express');
const emailController = require('../controllers/email');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// Send completion email to user
router.post('/completion', verifyToken, emailController.sendCompletionEmail);

// Send notification to coach
router.post('/notification', verifyToken, emailController.sendCoachNotification);

// Test email route (for admins only)
router.post('/test', verifyToken, emailController.testEmail);

module.exports = router; 
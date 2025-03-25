const express = require('express');
const { isAdmin } = require('../middleware/auth');
const adminController = require('../controllers/admin');

const router = express.Router();

// Admin-only routes that require auth
router.use(isAdmin);

// Analytics routes
router.get('/analytics', adminController.getAnalytics);
router.get('/test-results', adminController.getTestResults);
router.get('/coaches', adminController.getCoaches);
router.post('/update-coach', adminController.updateCoach);
router.delete('/coach/:id', adminController.deleteCoach);

// Add a database query route for bypassing RLS
router.post('/db-query', adminController.handleDatabaseQuery);

// Add a custom query route for more complex operations
router.post('/custom-query', adminController.handleCustomQuery);

module.exports = router; 
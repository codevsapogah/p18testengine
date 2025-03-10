const express = require('express');
const adminController = require('../controllers/admin');
const { isAdmin } = require('../middleware/auth');

const router = express.Router();

// Apply admin auth middleware to all routes
router.use(isAdmin);

// Admin routes
router.get('/coaches', adminController.getCoaches);
router.post('/coaches', adminController.createCoach);
router.put('/coaches/:id', adminController.updateCoach);
router.delete('/coaches/:id', adminController.deleteCoach);
router.get('/all-clients', adminController.getAllClients);
router.get('/all-results', adminController.getAllResults);

module.exports = router; 
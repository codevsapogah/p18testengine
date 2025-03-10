const express = require('express');
const coachController = require('../controllers/coach');
const { isCoach } = require('../middleware/auth');

const router = express.Router();

// Apply coach auth middleware to all routes
router.use(isCoach);

// Coach routes
router.get('/clients', coachController.getClients);
router.get('/clients/:id', coachController.getClientById);
router.get('/results', coachController.getResults);
router.get('/results/:id', coachController.getResultById);

module.exports = router; 
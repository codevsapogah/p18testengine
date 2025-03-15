const express = require('express');
const router = express.Router();

// Send test email route
router.post('/test', async (req, res) => {
  try {
    const { quizId, clientName, coachEmail, language } = req.body;
    
    // For now, just return success
    // TODO: Implement actual email sending logic
    return res.status(200).json({ message: 'Test email sent successfully' });
  } catch (error) {
    console.error('Error sending test email:', error);
    return res.status(500).json({ message: 'Failed to send test email' });
  }
});

// Send notification email route
router.post('/notification', async (req, res) => {
  try {
    const { quizId, clientName, coachEmail, language } = req.body;
    
    // For now, just return success
    // TODO: Implement actual email sending logic
    return res.status(200).json({ message: 'Notification email sent successfully' });
  } catch (error) {
    console.error('Error sending notification:', error);
    return res.status(500).json({ message: 'Failed to send notification' });
  }
});

module.exports = router; 
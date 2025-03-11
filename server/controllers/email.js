const { sendQuizCompletionEmail, sendCoachNotificationEmail, sendEmail } = require('../utils/email');
const { supabase } = require('../utils/supabase');

// Send completion email to user
exports.sendCompletionEmail = async (req, res) => {
  try {
    const { quizId, clientEmail, clientName } = req.body;
    
    if (!quizId || !clientEmail || !clientName) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    // Generate a results URL
    const resultUrl = `${process.env.CLIENT_URL}/results/view/${quizId}`;
    
    // Send the email
    await sendQuizCompletionEmail({
      to: clientEmail,
      name: clientName,
      quizId,
      resultUrl
    });
    
    // Update the database to indicate email was sent
    const { error } = await supabase
      .from('quiz_results')
      .update({ email_sent: true, email_sent_at: new Date() })
      .eq('id', quizId);
      
    if (error) throw error;
    
    return res.status(200).json({ message: 'Completion email sent successfully' });
  } catch (error) {
    console.error('Error sending completion email:', error);
    return res.status(500).json({ message: 'Failed to send completion email' });
  }
};

// Send notification to coach
exports.sendCoachNotification = async (req, res) => {
  try {
    const { quizId, clientName, coachEmail, coachName } = req.body;
    
    if (!quizId || !clientName || !coachEmail) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    // Generate a results URL for the coach
    const resultUrl = `${process.env.CLIENT_URL}/coach/results/${quizId}`;
    
    // Send the email
    await sendCoachNotificationEmail({
      to: coachEmail,
      coachName: coachName || 'Coach',
      clientName,
      resultUrl
    });
    
    // Update the database to indicate coach notification was sent
    const { error } = await supabase
      .from('quiz_results')
      .update({ coach_notified: true, coach_notified_at: new Date() })
      .eq('id', quizId);
      
    if (error) throw error;
    
    return res.status(200).json({ message: 'Coach notification sent successfully' });
  } catch (error) {
    console.error('Error sending coach notification:', error);
    return res.status(500).json({ message: 'Failed to send coach notification' });
  }
};

// Test email route (for admins only)
exports.testEmail = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    
    const { to, subject, text } = req.body;
    
    if (!to || !subject || !text) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    // Send test email
    await sendEmail({
      to,
      subject,
      text,
      html: `<p>${text}</p>`
    });
    
    return res.status(200).json({ message: 'Test email sent successfully' });
  } catch (error) {
    console.error('Error sending test email:', error);
    return res.status(500).json({ message: 'Failed to send test email' });
  }
}; 
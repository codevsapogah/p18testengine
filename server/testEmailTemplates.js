require('dotenv').config();
const { sendQuizCompletionEmail, sendCoachNotificationEmail } = require('./utils/email');

// Test function for email templates
const testEmailTemplates = async () => {
  try {
    console.log('Testing Russian email template...');
    
    // Test Russian template
    const russianResult = await sendQuizCompletionEmail({
      to: 'hello@p18.kz',
      name: 'Test User',
      quizId: 'test-123',
      resultUrl: `${process.env.CLIENT_URL || 'http://localhost:3000'}/results/view/test-123`,
      language: 'ru'
    });
    
    console.log('Russian email sent successfully!');
    console.log('Message ID:', russianResult.messageId);
    
    // Test Kazakh template
    console.log('\nTesting Kazakh email template...');
    
    const kazakhResult = await sendQuizCompletionEmail({
      to: 'hello@p18.kz',
      name: 'Test User',
      quizId: 'test-456',
      resultUrl: `${process.env.CLIENT_URL || 'http://localhost:3000'}/results/view/test-456`,
      language: 'kz'
    });
    
    console.log('Kazakh email sent successfully!');
    console.log('Message ID:', kazakhResult.messageId);
    
    // Test Coach Email
    console.log('\nTesting Coach notification email (Russian)...');
    
    const coachResult = await sendCoachNotificationEmail({
      to: 'hello@p18.kz',
      coachName: 'Test Coach',
      clientName: 'Test Client',
      resultUrl: `${process.env.CLIENT_URL || 'http://localhost:3000'}/coach/results/test-789`,
      language: 'ru'
    });
    
    console.log('Coach notification email sent successfully!');
    console.log('Message ID:', coachResult.messageId);
    
  } catch (error) {
    console.error('Failed to send test emails:', error);
  }
};

// Run the test
testEmailTemplates(); 
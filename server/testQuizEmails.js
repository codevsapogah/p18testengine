require('dotenv').config();
const { sendQuizCompletionEmail, sendCoachNotificationEmail } = require('./utils/email');

const testQuizEmails = async () => {
  try {
    console.log('Testing quiz completion email...');
    
    // Test quiz completion email
    const quizResult = await sendQuizCompletionEmail({
      to: 'hello@p18.kz', // Send to yourself 
      name: 'Test User',
      quizId: 'test-id-123',
      resultUrl: `${process.env.CLIENT_URL || 'http://localhost:3000'}/results/view/test-id-123`
    });
    
    console.log('Quiz completion email sent successfully!');
    console.log('Message ID:', quizResult.messageId);
    
    // Test coach notification email
    console.log('\nTesting coach notification email...');
    
    const coachResult = await sendCoachNotificationEmail({
      to: 'hello@p18.kz', // Send to yourself
      coachName: 'Test Coach',
      clientName: 'Test Client',
      resultUrl: `${process.env.CLIENT_URL || 'http://localhost:3000'}/coach/results/test-id-123`
    });
    
    console.log('Coach notification email sent successfully!');
    console.log('Message ID:', coachResult.messageId);
    
  } catch (error) {
    console.error('Failed to send test emails:');
    console.error(error);
  }
};

testQuizEmails(); 
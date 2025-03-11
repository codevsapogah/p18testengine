require('dotenv').config();
const { sendEmail } = require('./utils/email');

const testEmail = async () => {
  try {
    console.log('Testing email configuration...');
    console.log('SMTP_HOST:', process.env.SMTP_HOST);
    console.log('SMTP_PORT:', process.env.SMTP_PORT);
    console.log('SMTP_USER:', process.env.SMTP_USER);
    
    const result = await sendEmail({
      to: 'hello@p18.kz', // Send to yourself to test
      subject: 'Test Email from P18 Platform',
      text: 'This is a test email to verify the email setup with Mailgun.',
      html: '<p>This is a test email to verify the email setup with Mailgun.</p>'
    });
    
    console.log('Email sent successfully!');
    console.log('Message ID:', result.messageId);
    console.log('Response:', result.response);
  } catch (error) {
    console.error('Failed to send email:');
    console.error(error);
  }
};

testEmail(); 
const nodemailer = require('nodemailer');

async function testEmail() {
  try {
    // Create test account (will use Ethereal Email)
    console.log('Creating test account...');
    const testAccount = await nodemailer.createTestAccount();
    console.log('Test account created:', testAccount.user);

    // Create reusable transporter with test account
    const transporter = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    
    console.log('Testing connection to', testAccount.smtp.host);
    const verifyResult = await transporter.verify();
    console.log('SMTP connection verified:', verifyResult);
    
    // Send mail with defined transport object
    const info = await transporter.sendMail({
      from: `"P18 Platform Test" <${testAccount.user}>`,
      to: "nurbolat.khamitov@gmail.com", // recipient
      subject: "Test Email from P18 Platform",
      text: "This is a test email from P18 Platform",
      html: "<b>This is a test email from P18 Platform</b>",
    });
    
    console.log('Message sent: %s', info.messageId);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error('Error:', error);
  }
}

testEmail(); 
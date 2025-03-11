const nodemailer = require('nodemailer');

// Create reusable transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'mail.yourdomain.com',
  port: process.env.SMTP_PORT || 587,
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || 'noreply@yourdomain.com',
    pass: process.env.SMTP_PASSWORD || 'your-email-password',
  },
});

/**
 * Send an email
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.text - Plain text content
 * @param {string} options.html - HTML content (optional)
 * @returns {Promise} - Email send result
 */
const sendEmail = async (options) => {
  const mailOptions = {
    from: `"${process.env.EMAIL_FROM_NAME || 'P18 Platform'}" <${process.env.EMAIL_FROM || 'noreply@yourdomain.com'}>`,
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html,
  };

  return transporter.sendMail(mailOptions);
};

/**
 * Send a quiz completion email
 * @param {Object} options - Email data
 * @param {string} options.to - Recipient email address
 * @param {string} options.name - Recipient name
 * @param {string} options.quizId - Quiz ID
 * @param {string} options.resultUrl - URL to view results
 * @returns {Promise} - Email send result
 */
const sendQuizCompletionEmail = async (options) => {
  const subject = 'Your P18 Test Results Are Ready';
  
  const text = `
    Hello ${options.name},

    Your P18 psychological test has been completed successfully.
    
    You can view your results here: ${options.resultUrl}
    
    Thank you for using our platform.
    
    Best regards,
    The P18 Team
  `;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4a5568;">Your P18 Test Results Are Ready</h2>
      <p>Hello ${options.name},</p>
      <p>Your P18 psychological test has been completed successfully.</p>
      <p>You can view your results by clicking the button below:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${options.resultUrl}" style="background-color: #3182ce; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
          View Results
        </a>
      </div>
      <p>Thank you for using our platform.</p>
      <p>Best regards,<br>The P18 Team</p>
      <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #718096;">
        <p>If you didn't take this test, please disregard this email.</p>
      </div>
    </div>
  `;
  
  return sendEmail({
    to: options.to,
    subject,
    text,
    html
  });
};

/**
 * Send a notification email to the coach
 * @param {Object} options - Email data
 * @param {string} options.to - Coach email address
 * @param {string} options.coachName - Coach name
 * @param {string} options.clientName - Client name
 * @param {string} options.resultUrl - URL to view results
 * @returns {Promise} - Email send result
 */
const sendCoachNotificationEmail = async (options) => {
  const subject = 'New P18 Test Completion';
  
  const text = `
    Hello ${options.coachName},

    A new client (${options.clientName}) has completed the P18 psychological test.
    
    You can review their results here: ${options.resultUrl}
    
    Thank you,
    The P18 Platform
  `;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4a5568;">New P18 Test Completion</h2>
      <p>Hello ${options.coachName},</p>
      <p>A new client has completed the P18 psychological test:</p>
      <div style="background-color: #f7fafc; padding: 15px; border-radius: 4px; margin: 20px 0;">
        <p style="margin: 0;"><strong>Client:</strong> ${options.clientName}</p>
      </div>
      <p>You can review their results by clicking the button below:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${options.resultUrl}" style="background-color: #3182ce; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
          Review Results
        </a>
      </div>
      <p>Thank you,<br>The P18 Platform</p>
    </div>
  `;
  
  return sendEmail({
    to: options.to,
    subject,
    text,
    html
  });
};

module.exports = {
  sendEmail,
  sendQuizCompletionEmail,
  sendCoachNotificationEmail
}; 
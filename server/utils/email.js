const nodemailer = require('nodemailer');

// Create reusable transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.mailgun.org',
  port: parseInt(process.env.SMTP_PORT || '465', 10),
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || 'hello@p18.kz',
    pass: process.env.SMTP_PASSWORD || 'your-password',
  },
});

// Test the SMTP connection on server startup
(async () => {
  try {
    const connectionTest = await transporter.verify();
    console.log('SMTP connection verified:', connectionTest);
  } catch (error) {
    console.warn('SMTP connection test failed:', error.message);
  }
})();

/**
 * Send an email
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.text - Plain text content
 * @param {string} options.html - HTML content (optional)
 * @param {Array} options.attachments - Email attachments (optional)
 * @returns {Promise} - Email send result
 */
const sendEmail = async (options) => {
  const mailOptions = {
    from: `"${process.env.EMAIL_FROM_NAME || 'P18 Platform'}" <${process.env.EMAIL_FROM || 'hello@p18.kz'}>`,
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html,
    attachments: options.attachments || [],
  };

  return transporter.sendMail(mailOptions);
};

// Email translations
const translations = {
  subject: {
    ru: 'Результаты теста P18',
    kz: 'P18 тест нәтижелері'
  },
  hello: {
    ru: 'Здравствуйте',
    kz: 'Сәлеметсіз бе'
  },
  resultsAttached: {
    ru: 'Ваши результаты теста P18 прикреплены в PDF файле.',
    kz: 'Сіздің P18 тестінің нәтижелері PDF файлында тіркелген.'
  },
  canAlsoView: {
    ru: 'Вы также можете посмотреть результаты, нажав на кнопку ниже:',
    kz: 'Сондай-ақ, төмендегі батырманы басу арқылы нәтижелерді көре аласыз:'
  },
  viewResults: {
    ru: 'Посмотреть результаты',
    kz: 'Нәтижелерді қарау'
  },
  thanks: {
    ru: 'Спасибо за использование платформы P18.',
    kz: 'P18 платформасын пайдаланғаныңыз үшін рахмет.'
  },
  regards: {
    ru: 'С уважением,',
    kz: 'Құрметпен,'
  },
  team: {
    ru: 'Команда P18',
    kz: 'P18 командасы'
  }
};

/**
 * Send a quiz completion email
 * @param {Object} options - Email data
 * @param {string} options.to - Recipient email address
 * @param {string} options.name - Recipient name
 * @param {string} options.quizId - Quiz ID
 * @param {string} options.resultUrl - URL to view results
 * @param {Buffer} options.pdfBuffer - PDF buffer (optional)
 * @param {string} options.fileName - PDF file name (optional)
 * @param {string} options.language - Email language (ru or kz, defaults to ru)
 * @returns {Promise} - Email send result
 */
const sendQuizCompletionEmail = async (options) => {
  const lang = options.language || 'ru';
  const subject = translations.subject[lang];
  
  // Fix the URL format to use 'grid' format instead of 'view'
  let resultUrl = options.resultUrl;
  
  // Replace "view" with "grid" in the URL path if it exists
  if (resultUrl.includes('/results/view/')) {
    resultUrl = resultUrl.replace('/results/view/', '/results/grid/');
  }
  
  // Add language parameter
  resultUrl = resultUrl.includes('?') 
    ? `${resultUrl}&lang=${lang}`
    : `${resultUrl}?lang=${lang}`;
  
  const text = `
    ${translations.hello[lang]} ${options.name},

    ${translations.resultsAttached[lang]}
    
    ${translations.canAlsoView[lang]} ${resultUrl}
    
    ${translations.thanks[lang]}
    
    ${translations.regards[lang]}
    ${translations.team[lang]}
  `;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #6b46c1; padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">${translations.subject[lang]}</h1>
      </div>
      <div style="padding: 20px;">
        <p>${translations.hello[lang]} ${options.name},</p>
        <p>${translations.resultsAttached[lang]}</p>
        <p>${translations.canAlsoView[lang]}</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resultUrl}" style="background-color: #6b46c1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
            ${translations.viewResults[lang]}
          </a>
        </div>
        <p>${translations.thanks[lang]}</p>
        <p>${translations.regards[lang]}<br>${translations.team[lang]}</p>
      </div>
      <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #718096; text-align: center;">
        <p>© ${new Date().getFullYear()} P18 Platform</p>
      </div>
    </div>
  `;
  
  // Set up attachments if PDF buffer is provided
  const attachments = [];
  if (options.pdfBuffer) {
    // Import the createSafeFilename function if available
    let filename = options.fileName;
    if (!filename) {
      try {
        // Try to generate a proper filename based on user data
        const { createSafeFilename } = require('./pdfGenerator');
        filename = `${createSafeFilename({
          user_name: options.name, 
          created_at: new Date()
        }, 'grid')}.pdf`;
      } catch (error) {
        // Fallback to simple filename if createSafeFilename isn't available
        console.warn('Could not generate safe filename:', error);
        filename = `P18_Results_${options.quizId || new Date().getTime()}.pdf`;
      }
    }
    
    attachments.push({
      filename: filename,
      content: options.pdfBuffer,
      contentType: 'application/pdf'
    });
  }
  
  return sendEmail({
    to: options.to,
    subject,
    text,
    html,
    attachments
  });
};

/**
 * Send a notification email to the coach
 * @param {Object} options - Email data
 * @param {string} options.to - Coach email address
 * @param {string} options.coachName - Coach name
 * @param {string} options.clientName - Client name
 * @param {string} options.resultUrl - URL to view results
 * @param {Buffer} options.pdfBuffer - PDF buffer (optional)
 * @param {string} options.fileName - PDF file name (optional)
 * @param {string} options.language - Email language (ru or kz, defaults to ru)
 * @returns {Promise} - Email send result
 */
const sendCoachNotificationEmail = async (options) => {
  const lang = options.language || 'ru';
  const subject = `Новый тест P18: ${options.clientName}`;
  
  // Fix the URL format to use 'grid' format instead of view
  let resultUrl = options.resultUrl;
  
  // Replace "coach/results" with "results/grid" in the URL path if it exists
  if (resultUrl.includes('/coach/results/')) {
    resultUrl = resultUrl.replace('/coach/results/', '/results/grid/');
  }
  
  // Add language parameter
  resultUrl = resultUrl.includes('?') 
    ? `${resultUrl}&lang=${lang}`
    : `${resultUrl}?lang=${lang}`;
  
  const text = `
    ${translations.hello[lang]} ${options.coachName},

    Новый клиент (${options.clientName}) прошел психологический тест P18.
    
    Вы можете просмотреть результаты по ссылке: ${resultUrl}
    
    ${translations.regards[lang]}
    ${translations.team[lang]}
  `;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #6b46c1; padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">Новый тест P18</h1>
      </div>
      <div style="padding: 20px;">
        <p>${translations.hello[lang]} ${options.coachName},</p>
        <p>Новый клиент прошел психологический тест P18:</p>
        <div style="background-color: #f7fafc; padding: 15px; border-radius: 4px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Клиент:</strong> ${options.clientName}</p>
        </div>
        <p>Вы можете просмотреть результаты по ссылке:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resultUrl}" style="background-color: #6b46c1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
            Просмотреть результаты
          </a>
        </div>
        <p>${translations.regards[lang]}<br>${translations.team[lang]}</p>
      </div>
    </div>
  `;
  
  // Set up attachments if PDF buffer is provided
  const attachments = [];
  if (options.pdfBuffer) {
    // Import the createSafeFilename function if available
    let filename = options.fileName;
    if (!filename) {
      try {
        // Try to generate a proper filename based on user and client data
        const { createSafeFilename } = require('./pdfGenerator');
        filename = `${createSafeFilename({
          user_name: options.clientName, 
          created_at: new Date()
        }, 'grid')}.pdf`;
      } catch (error) {
        // Fallback to simple filename if createSafeFilename isn't available
        console.warn('Could not generate safe filename for coach email:', error);
        filename = `P18_Results_${options.clientName.replace(/\s+/g, '_')}.pdf`;
      }
    }
    
    attachments.push({
      filename: filename,
      content: options.pdfBuffer,
      contentType: 'application/pdf'
    });
  }
  
  return sendEmail({
    to: options.to,
    subject,
    text,
    html,
    attachments
  });
};

module.exports = {
  sendEmail,
  sendQuizCompletionEmail,
  sendCoachNotificationEmail
}; 
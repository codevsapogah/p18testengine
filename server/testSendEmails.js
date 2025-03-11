require('dotenv').config();
const { supabase } = require('./utils/supabase');
const { generateGridPDF } = require('./utils/pdfGenerator');
const nodemailer = require('nodemailer');
const fs = require('fs').promises;
const path = require('path');
const { createSafeFilename } = require('./utils/pdfGenerator');

// Test function to send emails with the correct SMTP settings
const testSendEmails = async () => {
  try {
    // Set direct SMTP settings from user input
    const smtpSettings = {
      host: 'smtp.mailgun.org',
      port: 465, // Using SSL/TLS
      secure: true, // true for 465, false for other ports
      auth: {
        user: 'hello@p18.kz',
        pass: 'jopRof-0kutqy-tidkiq'
      }
    };
    
    console.log('Using direct SMTP settings:');
    console.log('- Host:', smtpSettings.host);
    console.log('- Port:', smtpSettings.port);
    console.log('- Secure:', smtpSettings.secure);
    console.log('- User:', smtpSettings.auth.user);
    
    // Create transporter
    const transporter = nodemailer.createTransport(smtpSettings);
    
    // Test SMTP connection
    console.log('Testing SMTP connection...');
    try {
      const connectionTest = await transporter.verify();
      console.log('SMTP connection successful:', connectionTest);
    } catch (smtpError) {
      console.error('SMTP connection failed:', smtpError);
      throw new Error(`SMTP connection failed: ${smtpError.message}`);
    }
    
    // Set target email
    const targetEmail = 'nurbolat.khamitov@gmail.com';
    
    // Use a real quiz ID if provided, or search for one
    let quizId = process.argv[2]; // Get quizId from command line argument
    let quizData;
    
    if (!quizId) {
      console.log('No quiz ID provided, searching for a completed quiz...');
      // Search for a completed quiz with results
      const { data, error } = await supabase
        .from('quiz_results')
        .select('*')
        .not('calculated_results', 'is', null)
        .limit(1);
        
      if (error) throw error;
      
      if (!data || data.length === 0) {
        throw new Error('No completed quizzes found. Please provide a quiz ID or complete a quiz first.');
      }
      
      quizData = data[0];
      quizId = quizData.id;
      console.log(`Found quiz ID: ${quizId}`);
    } else {
      // Fetch quiz data for the provided ID
      console.log(`Using provided quiz ID: ${quizId}`);
      const { data, error } = await supabase
        .from('quiz_results')
        .select('*')
        .eq('id', quizId)
        .single();
        
      if (error) throw error;
      
      if (!data) {
        throw new Error(`Quiz with ID ${quizId} not found.`);
      }
      
      quizData = data;
    }
    
    console.log('Quiz data found. Sending emails...');
    
    // Generate a results URL
    const baseUrl = process.env.CLIENT_URL || 'https://p18.kz';
    
    // User name for testing
    const userName = quizData.user_name || 'Test User';
    
    // Create translations object
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
    
    // Test both language versions
    for (const language of ['ru', 'kz']) {
      // Generate PDF
      const pdfBuffer = await generateGridPDF(quizData, language, quizId, baseUrl);
      console.log(`PDF for language ${language} generated successfully.`);
      
      // Create filename
      const filename = `${createSafeFilename({
        user_name: userName, 
        created_at: new Date()
      }, 'grid')}_${language}.pdf`;
      
      // Generate result URL with language parameter
      const resultUrl = `${baseUrl}/results/grid/${quizId}?lang=${language}`;
      
      // 1. Send user email
      console.log(`Sending user email in ${language.toUpperCase()} to ${targetEmail}...`);
      
      // Generate user email HTML
      const userHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #6b46c1; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">${translations.subject[language]}</h1>
          </div>
          <div style="padding: 20px;">
            <p>${translations.hello[language]} ${userName},</p>
            <p>${translations.resultsAttached[language]}</p>
            <p>${translations.canAlsoView[language]}</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resultUrl}" style="background-color: #6b46c1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
                ${translations.viewResults[language]}
              </a>
            </div>
            <p>${translations.thanks[language]}</p>
            <p>${translations.regards[language]}<br>${translations.team[language]}</p>
          </div>
          <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #718096; text-align: center;">
            <p>© ${new Date().getFullYear()} P18 Platform</p>
          </div>
        </div>
      `;
      
      const userMailOptions = {
        from: '"P18 Platform" <hello@p18.kz>',
        to: targetEmail,
        subject: translations.subject[language],
        html: userHtml,
        attachments: [{
          filename: filename,
          content: pdfBuffer,
          contentType: 'application/pdf'
        }]
      };
      
      try {
        const userInfo = await transporter.sendMail(userMailOptions);
        console.log(`User email sent in ${language.toUpperCase()}:`, userInfo.response);
      } catch (userEmailError) {
        console.error(`Failed to send user email in ${language.toUpperCase()}:`, userEmailError);
      }
      
      // Small delay between emails
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 2. Send coach email
      console.log(`Sending coach email in ${language.toUpperCase()} to ${targetEmail}...`);
      
      // Generate coach email HTML
      const coachName = 'Coach ' + (language === 'ru' ? 'Тестов' : 'Тестұлы');
      const coachHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #6b46c1; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">Новый тест P18</h1>
          </div>
          <div style="padding: 20px;">
            <p>${translations.hello[language]} ${coachName},</p>
            <p>Новый клиент прошел психологический тест P18:</p>
            <div style="background-color: #f7fafc; padding: 15px; border-radius: 4px; margin: 20px 0;">
              <p style="margin: 0;"><strong>Клиент:</strong> ${userName}</p>
            </div>
            <p>Вы можете просмотреть результаты по ссылке:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resultUrl}" style="background-color: #6b46c1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
                Просмотреть результаты
              </a>
            </div>
            <p>${translations.regards[language]}<br>${translations.team[language]}</p>
          </div>
        </div>
      `;
      
      const coachMailOptions = {
        from: '"P18 Platform" <hello@p18.kz>',
        to: targetEmail,
        subject: `Новый тест P18: ${userName}`,
        html: coachHtml,
        attachments: [{
          filename: filename,
          content: pdfBuffer,
          contentType: 'application/pdf'
        }]
      };
      
      try {
        const coachInfo = await transporter.sendMail(coachMailOptions);
        console.log(`Coach email sent in ${language.toUpperCase()}:`, coachInfo.response);
      } catch (coachEmailError) {
        console.error(`Failed to send coach email in ${language.toUpperCase()}:`, coachEmailError);
      }
      
      // Small delay between languages
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('All test emails sent successfully!');
    
  } catch (error) {
    console.error('Test failed:', error);
  }
};

// Run the test
testSendEmails();
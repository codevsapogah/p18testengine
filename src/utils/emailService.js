import { generateGridPDF } from './gridpdf';
import { supabase } from '../supabase';

const MAILGUN_API_KEY = 'f9d8ae041eef7e641730ec3f3b1314b2-623424ea-4cf1a1a9';
const MAILGUN_DOMAIN = 'p18.kz'; // Replace with your actual domain

const emailTemplates = {
  ru: {
    user: {
      subject: 'Результаты теста P18',
      html: (userName, resultUrl) => `
        <div style="font-family: Arial, sans-serif;">
          <div style="background-color: #6B46C1; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0;">Результаты теста P18</h1>
          </div>
          <div style="padding: 20px;">
            <p>Здравствуйте ${userName},</p>
            <p>Ваши результаты теста P18 прикреплены в PDF файле.</p>
            <p>Вы также можете посмотреть результаты, нажав на кнопку ниже:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resultUrl}" style="background-color: #6B46C1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">Посмотреть результаты</a>
            </div>
            <p>Спасибо за использование платформы P18.</p>
            <p>С уважением,<br>Команда P18</p>
          </div>
        </div>
      `
    },
    coach: {
      subject: 'Новые результаты теста P18',
      html: (userName, resultUrl, coachName) => `
        <div style="font-family: Arial, sans-serif;">
          <div style="background-color: #6B46C1; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0;">Результаты теста P18</h1>
          </div>
          <div style="padding: 20px;">
            <p>Здравствуйте ${coachName},</p>
            <p>Новые результаты теста P18 для ${userName} прикреплены в PDF файле.</p>
            <p>Вы также можете посмотреть результаты, нажав на кнопку ниже:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resultUrl}" style="background-color: #6B46C1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">Посмотреть результаты</a>
            </div>
            <p>С уважением,<br>Команда P18</p>
          </div>
        </div>
      `
    }
  },
  kz: {
    user: {
      subject: 'P18 тест нәтижелері',
      html: (userName, resultUrl) => `
        <div style="font-family: Arial, sans-serif;">
          <div style="background-color: #6B46C1; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0;">P18 тест нәтижелері</h1>
          </div>
          <div style="padding: 20px;">
            <p>Сәлеметсіз бе ${userName},</p>
            <p>Сіздің P18 тестінің нәтижелері PDF файлында тіркелген.</p>
            <p>Сондай-ақ, төмендегі батырманы басу арқылы нәтижелерді көре аласыз:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resultUrl}" style="background-color: #6B46C1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">Нәтижелерді қарау</a>
            </div>
            <p>P18 платформасын пайдаланғаныңыз үшін рахмет.</p>
            <p>Құрметпен,<br>P18 командасы</p>
          </div>
        </div>
      `
    },
    coach: {
      subject: 'P18 тест нәтижелері',
      html: (userName, resultUrl, coachName) => `
        <div style="font-family: Arial, sans-serif;">
          <div style="background-color: #6B46C1; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0;">P18 тест нәтижелері</h1>
          </div>
          <div style="padding: 20px;">
            <p>Сәлеметсіз бе ${coachName},</p>
            <p>${userName} үшін жаңа P18 тест нәтижелері PDF файлында тіркелген.</p>
            <p>Сондай-ақ, төмендегі батырманы басу арқылы нәтижелерді көре аласыз:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resultUrl}" style="background-color: #6B46C1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">Нәтижелерді қарау</a>
            </div>
            <p>Құрметпен,<br>P18 командасы</p>
          </div>
        </div>
      `
    }
  }
};

export const sendResultsEmail = async (userData, sortedPrograms, language, translations, id) => {
  try {
    // Generate PDF once
    const pdfBlob = await generateGridPDF(userData, sortedPrograms, language, translations, id);
    const resultUrl = `${window.location.origin}/results/grid/${id}?lang=${language}`;

    // Create PDF attachment once
    const pdfAttachment = new Blob([pdfBlob], { type: 'application/pdf' });

    // Send email to user with PDF
    await sendEmail({
      to: userData.user_email,
      subject: emailTemplates[language].user.subject,
      html: emailTemplates[language].user.html(userData.user_name, resultUrl),
      attachment: {
        data: pdfAttachment,
        filename: 'results.pdf'
      }
    });

    // Send email to coach if exists
    if (userData.coach_email) {
      // Get coach name from approved_coaches table
      const { data: coachData } = await supabase
        .from('approved_coaches')
        .select('name')
        .eq('email', userData.coach_email)
        .single();

      if (coachData?.name) {
        await sendEmail({
          to: userData.coach_email,
          subject: emailTemplates[language].coach.subject,
          html: emailTemplates[language].coach.html(userData.user_name, resultUrl, coachData.name),
          attachment: {
            data: pdfAttachment,
            filename: 'results.pdf'
          }
        });
      }
    }

    return true;
  } catch (error) {
    console.error('Error sending results email:', error);
    throw error;
  }
};

const sendEmail = async ({ to, subject, html, attachment }) => {
  try {
    const formData = new FormData();
    formData.append('from', 'P18 <noreply@p18.kz>');
    formData.append('to', to);
    formData.append('subject', subject);
    formData.append('html', html);
    
    if (attachment) {
      formData.append('attachment', attachment.data, attachment.filename);
    }

    const response = await fetch(`https://api.mailgun.net/v3/${MAILGUN_DOMAIN}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`api:${MAILGUN_API_KEY}`)}`,
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Failed to send email: ${response.statusText}`);
    }

    await response.json();
  } catch (error) {
    console.error('Error in sendEmail:', error);
    throw error;
  }
};

export const sendTestEmail = async (email, language, userData, sortedPrograms, translations, id) => {
  try {
    // Generate PDF for test
    const pdfBlob = await generateGridPDF(userData, sortedPrograms, language, translations, id);
    const testUrl = `${window.location.origin}/results/grid/${id}?lang=${language}`;

    // Create PDF attachment
    const pdfAttachment = new Blob([pdfBlob], { type: 'application/pdf' });
    
    await sendEmail({
      to: email,
      subject: emailTemplates[language].user.subject,
      html: emailTemplates[language].user.html(userData.user_name, testUrl),
      attachment: {
        data: pdfAttachment,
        filename: 'results.pdf'
      }
    });

    return true;
  } catch (error) {
    console.error('Error sending test email:', error);
    throw error;
  }
}; 
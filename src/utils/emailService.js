import { generateGridPDF, createSafeFilename } from './gridpdf';
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

// Rename the main sendEmail function to sendEmailWithMailgun
const sendEmailWithMailgun = async ({ to, subject, html, attachment }) => {
  try {
    const formData = new FormData();
    formData.append('from', `P18 <no-reply@${MAILGUN_DOMAIN}>`);
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

    return true;
  } catch (error) {
    console.error('Error sending email via Mailgun:', error);
    throw error;
  }
};

// Update all references to use sendEmailWithMailgun instead of sendEmail
export const sendResultsEmail = async (userData, sortedPrograms, language, translations, id) => {
  try {
    // Generate PDF once
    const pdfBlob = await generateGridPDF(userData, sortedPrograms, language, translations, id);
    const resultUrl = `${window.location.origin}/results/grid/${id}?lang=${language}`;

    // Create PDF attachment once
    const pdfAttachment = new Blob([pdfBlob], { type: 'application/pdf' });
    
    // Create a safe filename
    const filename = createSafeFilename(userData, 'grid');

    // Send email to user with PDF
    await sendEmailWithMailgun({
      to: userData.user_email,
      subject: emailTemplates[language].user.subject,
      html: emailTemplates[language].user.html(userData.user_name, resultUrl),
      attachment: {
        data: pdfAttachment,
        filename: `${filename}.pdf`
      }
    });

    // Send email to coach if exists
    if (userData.coach_email) {
      // Get coach name from approved_coaches table
      const { data: coachData, error: coachError } = await supabase
        .from('approved_coaches')
        .select('name')
        .eq('email', userData.coach_email)
        .single();

      // Only send if coach exists in approved_coaches
      if (coachData && !coachError) {
        await sendEmailWithMailgun({
          to: userData.coach_email,
          subject: emailTemplates[language].coach.subject,
          html: emailTemplates[language].coach.html(userData.user_name, resultUrl, coachData.name || userData.coach_email),
          attachment: {
            data: pdfAttachment,
            filename: `${filename}.pdf`
          }
        });
      } else {
        console.log('Skipping coach email - not found in approved_coaches:', userData.coach_email);
      }
    }

    return true;
  } catch (error) {
    console.error('Error sending results email:', error);
    throw error;
  }
};

export const sendEmail = async (quizId) => {
  try {
    // Get quiz data with user and coach information
    const { data: quizData, error: quizError } = await supabase
      .from('quiz_results')
      .select(`
        *,
        user:user_id (
          email
        ),
        coach:coach_id (
          name,
          email
        )
      `)
      .eq('id', quizId)
      .single();

    if (quizError) throw quizError;

    // Map data to maintain compatibility
    const userData = {
      ...quizData,
      user_name: quizData.entered_name || '—',
      user_email: quizData.user?.email,
      user_phone: quizData.entered_phone || '—',
      coach_email: quizData.coach?.email,
      coachName: quizData.coach?.name
    };

    // Send email to user
    if (userData.user?.email) {
      await sendEmailToUser(userData);
    }

    // Send email to coach
    if (userData.coach?.email) {
      // Get coach name from approved_coaches table
      const { data: coachData } = await supabase
        .from('approved_coaches')
        .select('name')
        .eq('email', userData.coach.email)
        .single();

      await sendEmailToCoach({
        ...userData,
        coachName: coachData?.name || userData.coach.email
      });
    }

    return true;
  } catch (error) {
    console.error('Error in sendEmail:', error);
    return false;
  }
};

const sendEmailToUser = async (userData) => {
  try {
    // Generate PDF once
    const pdfBlob = await generateGridPDF(userData, [], '', [], userData.id);
    const resultUrl = `${window.location.origin}/results/grid/${userData.id}?lang=${userData.language}`;

    // Create PDF attachment once
    const pdfAttachment = new Blob([pdfBlob], { type: 'application/pdf' });
    
    // Create a safe filename
    const filename = createSafeFilename(userData, 'grid');

    // Send email to user with PDF
    await sendEmailWithMailgun({
      to: userData.user_email,
      subject: emailTemplates[userData.language].user.subject,
      html: emailTemplates[userData.language].user.html(userData.user_name, resultUrl),
      attachment: {
        data: pdfAttachment,
        filename: `${filename}.pdf`
      }
    });
  } catch (error) {
    console.error('Error in sendEmailToUser:', error);
    throw error;
  }
};

const sendEmailToCoach = async (userData) => {
  try {
    // Generate PDF once
    const pdfBlob = await generateGridPDF(userData, [], '', [], userData.id);
    const resultUrl = `${window.location.origin}/results/grid/${userData.id}?lang=${userData.language}`;

    // Create PDF attachment once
    const pdfAttachment = new Blob([pdfBlob], { type: 'application/pdf' });
    
    // Create a safe filename
    const filename = createSafeFilename(userData, 'grid');

    // Send email to coach with PDF
    await sendEmailWithMailgun({
      to: userData.coach_email,
      subject: emailTemplates[userData.language].coach.subject,
      html: emailTemplates[userData.language].coach.html(userData.user_name, resultUrl, userData.coachName),
      attachment: {
        data: pdfAttachment,
        filename: `${filename}.pdf`
      }
    });
  } catch (error) {
    console.error('Error in sendEmailToCoach:', error);
    throw error;
  }
};

// Update sendTestEmail to use sendEmailWithMailgun
export const sendTestEmail = async (email, language, userData, sortedPrograms, translations, id) => {
  try {
    // Generate PDF for test
    const pdfBlob = await generateGridPDF(userData, sortedPrograms, language, translations, id);
    const testUrl = `${window.location.origin}/results/grid/${id}?lang=${language}`;
    const pdfAttachment = new Blob([pdfBlob], { type: 'application/pdf' });
    const filename = createSafeFilename(userData, 'grid');
    
    console.log('Sending test emails to:', {
      user: email,
      coach: userData.coach_email,
      userData
    });

    // Send to user
    await sendEmailWithMailgun({
      to: email,
      subject: emailTemplates[language].user.subject,
      html: emailTemplates[language].user.html(userData.user_name, testUrl),
      attachment: {
        data: pdfAttachment,
        filename: `${filename}.pdf`
      }
    });

    // Send to coach if exists
    if (userData.coach_email) {
      const { data: coachData, error: coachError } = await supabase
        .from('approved_coaches')
        .select('name')
        .eq('email', userData.coach_email)
        .single();

      console.log('Coach data:', coachData);

      // Only send if coach exists in approved_coaches
      if (coachData && !coachError) {
        await sendEmailWithMailgun({
          to: userData.coach_email,
          subject: emailTemplates[language].coach.subject,
          html: emailTemplates[language].coach.html(userData.user_name, testUrl, coachData.name || userData.coach_email),
          attachment: {
            data: pdfAttachment,
            filename: `${filename}.pdf`
          }
        });
      } else {
        console.log('Skipping coach test email - not found in approved_coaches:', userData.coach_email);
      }
    }

    return true;
  } catch (error) {
    console.error('Error sending test email:', error);
    throw error;
  }
}; 
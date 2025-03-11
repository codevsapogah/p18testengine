require('dotenv').config();
const { supabase } = require('./utils/supabase');
const { generateGridPDF } = require('./utils/pdfGenerator');
const { sendQuizCompletionEmail } = require('./utils/email');

// Test function to generate PDF and send email
const testPdfEmail = async () => {
  try {
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
    
    console.log('Quiz data found. Generating PDF...');
    
    // Test both language versions
    for (const language of ['ru', 'kz']) {
      // Base URL for permalinks in the PDF
      const baseUrl = process.env.CLIENT_URL || 'https://p18.kz';
      
      // Generate PDF
      const pdfBuffer = await generateGridPDF(quizData, language, quizId, baseUrl);
      console.log(`PDF for language ${language} generated successfully.`);
      
      // Generate safe file name for the PDF
      const fileName = `P18_Results_${quizId}_${language}.pdf`;
      
      // Send test email
      const result = await sendQuizCompletionEmail({
        to: 'hello@p18.kz', // Send to yourself to test
        name: quizData.user_name || 'Test User',
        quizId,
        resultUrl: `${baseUrl}/results/view/${quizId}`,
        language,
        pdfBuffer,
        fileName
      });
      
      console.log(`${language.toUpperCase()} email sent successfully!`);
      console.log('Message ID:', result.messageId);
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
};

// Run the test
testPdfEmail(); 
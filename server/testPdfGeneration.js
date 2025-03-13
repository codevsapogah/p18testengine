require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { supabase } = require('./utils/supabase');
const { generateGridPDF, createSafeFilename } = require('./utils/pdfGenerator');

// Test function to generate PDF only
const testPdfGeneration = async () => {
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
    
    console.log('Quiz data found:');
    console.log('- Name:', quizData.user_name);
    console.log('- Created at:', quizData.created_at);
    console.log('- Has calculated results:', !!quizData.calculated_results);
    console.log('- Result count:', quizData.calculated_results ? Object.keys(quizData.calculated_results).length : 0);
    
    if (!quizData.calculated_results || Object.keys(quizData.calculated_results).length === 0) {
      throw new Error('Quiz has no calculated results - cannot generate PDF');
    }
    
    // Create output directory
    const outputDir = path.join(__dirname, 'test-pdfs');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Test both language versions
    for (const language of ['ru', 'kz']) {
      // Base URL for permalinks in the PDF
      const baseUrl = process.env.CLIENT_URL || 'https://p18.kz';
      console.log(`Generating PDF for language ${language}...`);
      
      // Generate PDF
      const pdfBuffer = await generateGridPDF(quizData, language, quizId, baseUrl);
      
      if (!pdfBuffer || pdfBuffer.length < 1000) {
        console.error(`Invalid PDF buffer generated: ${pdfBuffer ? pdfBuffer.length : 0} bytes`);
        continue;
      }
      
      console.log(`PDF for language ${language} generated successfully, size: ${pdfBuffer.length} bytes`);
      
      // Save to file for inspection
      const fileName = createSafeFilename({
        user_name: quizData.user_name,
        created_at: quizData.created_at
      }, 'grid');
      
      // Add language suffix to distinguish between language versions
      const fileNameWithLang = fileName.replace('.pdf', `_${language}.pdf`);
      const filePath = path.join(outputDir, fileNameWithLang);
      fs.writeFileSync(filePath, pdfBuffer);
      
      console.log(`PDF saved to: ${filePath}`);
    }
    
    console.log('PDF generation test completed successfully!');
    
  } catch (error) {
    console.error('Test failed:', error);
    console.error(error.stack);
  }
};

// Run the test
testPdfGeneration(); 
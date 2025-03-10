import programsData from '../data/programData';
import { questions } from '../data/questions';
import { fallbackProgramData, generateFallbackQuestions } from './fallbackProgramData';

/**
 * Debug utility to examine program data structure
 * Shows detailed information about program data to diagnose issues
 */
export const debugProgramData = () => {
  try {
    console.log('======= PROGRAM DATA DEBUG =======');
    
    // Check if programsData exists and is an array
    console.log('programsData type:', typeof programsData);
    console.log('programsData is array:', Array.isArray(programsData));
    
    const realDataValid = programsData && Array.isArray(programsData) && programsData.length > 0;
    
    if (!realDataValid) {
      console.error('Real program data is invalid or missing');
    } else {
      console.log('programsData length:', programsData.length);
    }
    
    // Check fallback data
    console.log('\n======= FALLBACK DATA DEBUG =======');
    console.log('fallbackProgramData type:', typeof fallbackProgramData);
    console.log('fallbackProgramData is array:', Array.isArray(fallbackProgramData));
    console.log('fallbackProgramData length:', fallbackProgramData ? fallbackProgramData.length : 'undefined');
    
    // Determine which data to use for the deeper check
    const dataToCheck = realDataValid ? programsData : fallbackProgramData;
    const dataSource = realDataValid ? 'Real Program Data' : 'Fallback Program Data';
    
    console.log(`\n======= CHECKING ${dataSource} =======`);
    
    // Check the first program as a sample
    const sampleProgram = dataToCheck[0];
    console.log('Sample program:', sampleProgram);
    
    if (!sampleProgram || typeof sampleProgram !== 'object') {
      console.error('Sample program is not a valid object');
      return {
        success: false,
        error: 'Sample program is not a valid object',
        details: { type: typeof sampleProgram },
        usingFallback: !realDataValid
      };
    }
    
    // Check all programs for required properties
    const invalidPrograms = [];
    let totalQuestions = 0;
    
    dataToCheck.forEach((program, index) => {
      if (!program || typeof program !== 'object') {
        invalidPrograms.push({
          index,
          issue: 'Not an object',
          program
        });
        return;
      }
      
      const issues = [];
      
      if (!program.id) issues.push('Missing ID');
      if (!program.name) issues.push('Missing name');
      if (!program.questions) {
        issues.push('Missing questions');
      } else if (!Array.isArray(program.questions)) {
        issues.push('Questions is not an array');
      } else {
        totalQuestions += program.questions.length;
        
        // Check if any questions are not valid question IDs
        const invalidQuestions = [];
        program.questions.forEach(qId => {
          const questionExists = questions.some(q => q.id === qId);
          if (!questionExists) {
            invalidQuestions.push(qId);
          }
        });
        
        if (invalidQuestions.length > 0) {
          issues.push(`Has ${invalidQuestions.length} invalid question IDs`);
        }
      }
      
      if (issues.length > 0) {
        invalidPrograms.push({
          index,
          id: program.id,
          issues,
          program
        });
      }
    });
    
    // Print summary
    console.log('Total programs:', dataToCheck.length);
    console.log('Total questions across all programs:', totalQuestions);
    console.log('Invalid programs:', invalidPrograms.length);
    
    if (invalidPrograms.length > 0) {
      console.log('Invalid program details:', invalidPrograms);
    }
    
    // Also check if questions data is valid
    const realQuestionsValid = questions && Array.isArray(questions) && questions.length > 0;
    const fallbackQuestions = generateFallbackQuestions();
    
    console.log('\n======= QUESTIONS DATA DEBUG =======');
    console.log('Real questions data valid:', realQuestionsValid);
    console.log('questions type:', typeof questions);
    console.log('questions is array:', Array.isArray(questions));
    console.log('questions length:', questions ? questions.length : 'undefined');
    console.log('Fallback questions length:', fallbackQuestions.length);
    
    const questionsToUse = realQuestionsValid ? questions : fallbackQuestions;
    const questionSource = realQuestionsValid ? 'Real Questions' : 'Fallback Questions';
    
    // Check a sample question
    const sampleQuestion = questionsToUse[0];
    console.log(`Sample ${questionSource}:`, sampleQuestion);
    
    return {
      success: true,
      usingRealData: realDataValid,
      usingRealQuestions: realQuestionsValid,
      summary: {
        totalPrograms: dataToCheck.length,
        totalQuestions,
        invalidPrograms: invalidPrograms.length
      },
      invalidPrograms: invalidPrograms.length > 0 ? invalidPrograms : null,
      sampleProgram,
      sampleQuestion
    };
  } catch (err) {
    console.error('Error in debugProgramData:', err);
    return {
      success: false,
      error: err.message,
      details: null
    };
  }
};

export default debugProgramData; 
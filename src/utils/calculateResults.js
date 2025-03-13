import programsData from '../data/programData';
// Not used, add eslint-disable comment
// eslint-disable-next-line no-unused-vars
import { scoreCategories } from '../data/programData';
import { fallbackProgramData, generateFallbackQuestions } from './fallbackProgramData';
import { questions as appQuestions } from '../data/questions';

// Initialize questions - use app questions if available, fallback otherwise
// eslint-disable-next-line no-unused-vars
const questions = appQuestions && Array.isArray(appQuestions) && appQuestions.length > 0 
  ? appQuestions 
  : generateFallbackQuestions();

// Validate programsData at the module level
console.log('Loading calculateResults.js');
console.log('programsData type:', typeof programsData);
console.log('programsData is array:', Array.isArray(programsData));
console.log('programsData length:', programsData ? programsData.length : 'undefined');

// Use fallback data if real data is missing or invalid
const programs = (!programsData || !Array.isArray(programsData) || programsData.length === 0)
  ? fallbackProgramData
  : programsData;

if (programs !== programsData) {
  console.warn('Using fallback program data because actual data is invalid or missing');
}

/**
 * Calculate test results from the user's answers
 * 
 * @param {Object|Array} answers - Object mapping question IDs to answer values or array of answers
 * @returns {Object} Object with program scores and categorizations
 */
export const calculateResults = (answers) => {
  // Validate input
  if (!answers) {
    console.error('No answers provided to calculateResults');
    throw new Error('No answers provided');
  }
  
  if (typeof answers !== 'object') {
    console.error('Answers must be an object or array, received:', typeof answers);
    throw new Error(`Invalid answers format: ${typeof answers}`);
  }
  
  // For empty objects/arrays, return empty results
  if ((Array.isArray(answers) && answers.length === 0) || 
      (!Array.isArray(answers) && Object.keys(answers).length === 0)) {
    console.warn('Empty answers object provided to calculateResults');
    // Initialize empty results
    const emptyResults = {};
    programs.forEach(program => {
      emptyResults[program.id] = {
        id: program.id,
        name: program.name || { ru: 'Unknown', kz: 'Unknown' },
        score: 0,
        rawScore: 0,
        questionCount: 0,
        category: 'reduced',
        maxScore: 0
      };
    });
    return emptyResults;
  }
  
  // Initialize results object for all programs
  const results = {};
  
  // Determine if answers are on 0-5 or 1-6 scale
  // If answers contain 0 and don't contain 6, then we're using 0-5 scale
  // Otherwise, assume we're already using 1-6 scale
  let isZeroToFiveScale = false;
  
  if (Array.isArray(answers)) {
    // Convert answers to numbers for reliable comparison
    const numericAnswers = answers.map(a => Number(a || 0));
    const hasZero = numericAnswers.some(a => a === 0);
    const hasSix = numericAnswers.some(a => a === 6);
    isZeroToFiveScale = hasZero && !hasSix;
  } else if (typeof answers === 'object' && answers) {
    // Convert values to numbers for reliable comparison
    const values = Object.values(answers).map(v => Number(v || 0));
    const hasZero = values.some(v => v === 0);
    const hasSix = values.some(v => v === 6);
    isZeroToFiveScale = hasZero && !hasSix;
  }
  
  console.log("Scale detected:", isZeroToFiveScale ? 
    "0-5 scale (using sum/25*100%)" : 
    "1-6 scale (using (sum-5)/25*100%)");
  
  // Initialize all programs with zero scores
  programs.forEach(program => {
    // Validate that each program has the required properties
    if (!program || typeof program !== 'object') {
      console.error('Invalid program data:', program);
      return; // Skip this iteration
    }
    
    // Check program has questions
    if (!program.questions || !Array.isArray(program.questions)) {
      console.error(`Program ${program.id} has invalid questions:`, program.questions);
      program.questions = []; // Initialize to empty array to prevent errors
    }
    
    results[program.id] = {
      id: program.id,
      name: program.name || { ru: 'Unknown', kz: 'Unknown' },
      score: 0,
      rawScore: 0,
      questionCount: 0,
      category: null,
      maxScore: 0
    };
  });
  
  // Create a map of question IDs to their programs
  const questionToProgramMap = {};
  programs.forEach(program => {
    if (!program || !program.questions || !Array.isArray(program.questions)) {
      return; // Skip invalid programs
    }
    
    program.questions.forEach(qId => {
      if (!questionToProgramMap[qId]) {
        questionToProgramMap[qId] = [];
      }
      questionToProgramMap[qId].push(program.id);
    });
  });
  
  // Log questionToProgramMap for debugging
  console.log(`Created question-to-program map with ${Object.keys(questionToProgramMap).length} questions`);
  
  // Process answers
  try {
    if (Array.isArray(answers)) {
      // Handle array format
      programs.forEach(program => {
        if (!program || !program.questions || !Array.isArray(program.questions)) {
          return; // Skip invalid programs
        }
        
        let sum = 0;
        let answeredCount = 0;
        
        program.questions.forEach(questionIndex => {
          // Convert to 0-based index for array
          const answerIndex = questionIndex - 1;
          
          // Only process if answer exists
          if (answerIndex >= 0 && answerIndex < answers.length) {
            // Get the raw answer value
            let value = Number(answers[answerIndex] || 0);
            
            // Use the value as-is based on the detected scale
            // No need to adjust - we'll use the correct formula later
            
            sum += value;
            answeredCount++;
          }
        });
        
        if (answeredCount > 0) {
          // Calculate percentage using the exact formula specified based on scale
          let percentage;
          
          if (isZeroToFiveScale) {
            // For 0-5 scale: sum/25*100%
            percentage = Math.round((sum / 25) * 100);
          } else {
            // For 1-6 scale: (sum-5)/25*100%
            // Subtract 1 point per question (answeredCount points total)
            percentage = Math.round(((sum - answeredCount) / 25) * 100);
          }
          
          // Update the result object
          results[program.id].rawScore = sum;
          results[program.id].questionCount = answeredCount;
          results[program.id].score = Math.max(0, Math.min(100, percentage)); // Constrain to 0-100
          
          // Determine category with explicit ranges
          let category;
          if (percentage >= 75) category = 'high';
          else if (percentage >= 50) category = 'elevated';
          else if (percentage >= 25) category = 'medium';
          else category = 'low';
          
          results[program.id].category = category;
        }
      });
    } else {
      // Object format processing
      // Track counts for each program
      const programCounts = {};
      
      // Normalize answers - ensure all keys are strings for consistent lookup
      const normalizedAnswers = {};
      Object.entries(answers).forEach(([key, value]) => {
        normalizedAnswers[String(key)] = Number(value || 0);
      });
      
      console.log(`Normalized ${Object.keys(normalizedAnswers).length} answers`);
      
      // First pass: count questions per program
      Object.keys(normalizedAnswers).forEach(questionId => {
        const qId = parseInt(questionId);
        if (questionToProgramMap[qId]) {
          questionToProgramMap[qId].forEach(programId => {
            if (!programCounts[programId]) {
              programCounts[programId] = 0;
            }
            programCounts[programId]++;
          });
        }
      });
      
      // Second pass: process values
      Object.entries(normalizedAnswers).forEach(([questionId, rawValue]) => {
        const qId = parseInt(questionId);
        let value = Number(rawValue || 0);
        
        // Add this answer to all programs it belongs to
        if (questionToProgramMap[qId]) {
          questionToProgramMap[qId].forEach(programId => {
            results[programId].rawScore += value;
            results[programId].questionCount++;
          });
        }
      });
      
      // Calculate percentages for each program
      Object.keys(results).forEach(programId => {
        const program = results[programId];
        
        if (program.questionCount > 0) {
          // Calculate percentage using the exact formula specified based on scale
          let percentage;
          
          if (isZeroToFiveScale) {
            // For 0-5 scale: sum/25*100%
            percentage = Math.round((program.rawScore / 25) * 100);
          } else {
            // For 1-6 scale: (sum-5)/25*100%
            // Subtract 1 point per question
            percentage = Math.round(((program.rawScore - program.questionCount) / 25) * 100);
          }
          
          program.score = Math.max(0, Math.min(100, percentage)); // Constrain to 0-100
          
          // Determine category with explicit ranges
          let category;
          if (percentage >= 75) category = 'high';
          else if (percentage >= 50) category = 'elevated';
          else if (percentage >= 25) category = 'medium';
          else category = 'low';
          
          program.category = category;
        } else {
          program.category = 'reduced';
          program.score = 0;
        }
      });
    }
  } catch (err) {
    console.error('Error processing answers:', err);
    throw new Error(`Failed to process answers: ${err.message}`);
  }
  
  // Log the final results
  console.log(`Calculation complete: ${Object.keys(results).length} programs processed`);
  
  return results;
};

/**
 * Get a summary of results, sorting programs by score
 * 
 * @param {Object} results - Calculated results from calculateResults()
 * @returns {Object} Organized summary of results
 */
export const getResultsSummary = (results) => {
  if (!results || typeof results !== 'object') {
    console.error('Invalid results provided to getResultsSummary:', results);
    return { all: [], byCategory: { high: [], increased: [], average: [], reduced: [] }, topPrograms: [] };
  }
  
  const programResults = Object.values(results);
  
  // Sort programs by score (highest to lowest)
  const sortedPrograms = [...programResults].sort((a, b) => b.score - a.score);
  
  // Group by category
  const byCategory = {
    high: sortedPrograms.filter(p => p.category === 'high'),
    increased: sortedPrograms.filter(p => p.category === 'increased'),
    average: sortedPrograms.filter(p => p.category === 'average'),
    reduced: sortedPrograms.filter(p => p.category === 'reduced')
  };
  
  return {
    all: sortedPrograms,
    byCategory,
    topPrograms: sortedPrograms.slice(0, 5) // Top 5 programs by score
  };
};
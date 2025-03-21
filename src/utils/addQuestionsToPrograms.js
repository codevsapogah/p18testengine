/**
 * Utility to add questions to programs
 * This reads the questions from questions.js and adds them to programData.js
 */

import { questions } from '../data/questions';
import { programs as originalPrograms } from '../data/programData';

// Function to extract question IDs for each program
const mapQuestionsToPrograms = () => {
  // Create a mapping of program IDs to question IDs
  const programQuestions = {};
  
  // Process each question
  questions.forEach(question => {
    const programId = question.program;
    if (!programId) return; // Skip questions with no program
    
    // Initialize array if it doesn't exist
    if (!programQuestions[programId]) {
      programQuestions[programId] = [];
    }
    
    // Add question ID to the program
    programQuestions[programId].push(question.id);
  });
  
  return programQuestions;
};

// Generate the updated program data with questions
const generateUpdatedProgramData = () => {
  const programQuestions = mapQuestionsToPrograms();
  
  // Create a copy of the original programs
  const updatedPrograms = originalPrograms.map(program => {
    // Create a deep copy of the program
    const updatedProgram = { ...program };
    
    // Add the questions array if it exists in our mapping
    if (programQuestions[program.id]) {
      updatedProgram.questions = programQuestions[program.id];
    } else {
      // If no questions found, add an empty array
      updatedProgram.questions = [];
    }
    
    return updatedProgram;
  });
  
  return updatedPrograms;
};

// Generate the updated program data js file
const generateUpdatedProgramDataFile = () => {
  const updatedPrograms = generateUpdatedProgramData();
  
  // Create the file content
  let fileContent = `// Updated program data with questions\n`;
  fileContent += `export const programs = ${JSON.stringify(updatedPrograms, null, 2)};\n\n`;
  
  // Add the original exports from programData.js (assuming there are other exports)
  fileContent += `// Original exports from programData.js\n`;
  fileContent += `export const scoreCategories = {\n`;
  fileContent += `  reduced: { min: 0, max: 40 },\n`;
  fileContent += `  average: { min: 41, max: 60 },\n`;
  fileContent += `  increased: { min: 61, max: 80 },\n`;
  fileContent += `  high: { min: 81, max: 100 }\n`;
  fileContent += `};\n\n`;
  
  fileContent += `export const getScoreCategory = (score) => {\n`;
  fileContent += `  if (score <= scoreCategories.reduced.max) return 'reduced';\n`;
  fileContent += `  if (score <= scoreCategories.average.max) return 'average';\n`;
  fileContent += `  if (score <= scoreCategories.increased.max) return 'increased';\n`;
  fileContent += `  return 'high';\n`;
  fileContent += `};\n\n`;
  
  fileContent += `export default programs;\n`;
  
  return fileContent;
};

// This function would be used in a Node.js environment to write the file
// For browser environments, we'll need to output the content for manual update
export const updateProgramDataFile = () => {
  const fileContent = generateUpdatedProgramDataFile();
  
  // In a Node.js environment, you would write to the file:
  // const filePath = path.resolve(__dirname, '../data/programData.js');
  // fs.writeFileSync(filePath, fileContent, 'utf8');
  
  return fileContent;
};

// For browser environment, return the mapping for display
export const getProgramQuestionsMapping = () => {
  return mapQuestionsToPrograms();
};

// Create a named object for the default export
const questionProgramUtils = {
  mapQuestionsToPrograms,
  generateUpdatedProgramData,
  updateProgramDataFile,
  getProgramQuestionsMapping
};

export default questionProgramUtils; 
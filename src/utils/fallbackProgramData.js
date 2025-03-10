/**
 * Fallback program data to use when real data is missing or invalid
 * This provides a minimal structure to prevent errors in the calculation logic
 */
export const fallbackProgramData = [
  // Program 1
  {
    id: 1,
    name: {
      ru: "Fallback Program 1",
      kz: "Fallback Program 1 (KZ)"
    },
    questions: [1, 2, 3, 4, 5],
    description: {
      ru: "This is a fallback program used when the real data is missing.",
      kz: "This is a fallback program used when the real data is missing. (KZ)"
    }
  },
  // Program 2
  {
    id: 2,
    name: {
      ru: "Fallback Program 2",
      kz: "Fallback Program 2 (KZ)"
    },
    questions: [6, 7, 8, 9, 10],
    description: {
      ru: "This is a fallback program used when the real data is missing.",
      kz: "This is a fallback program used when the real data is missing. (KZ)"
    }
  },
  // Program 3
  {
    id: 3,
    name: {
      ru: "Fallback Program 3",
      kz: "Fallback Program 3 (KZ)"
    },
    questions: [11, 12, 13, 14, 15],
    description: {
      ru: "This is a fallback program used when the real data is missing.",
      kz: "This is a fallback program used when the real data is missing. (KZ)"
    }
  },
  // Program 4
  {
    id: 4,
    name: {
      ru: "Fallback Program 4",
      kz: "Fallback Program 4 (KZ)"
    },
    questions: [16, 17, 18, 19, 20],
    description: {
      ru: "This is a fallback program used when the real data is missing.",
      kz: "This is a fallback program used when the real data is missing. (KZ)"
    }
  },
  // Program 5
  {
    id: 5,
    name: {
      ru: "Fallback Program 5",
      kz: "Fallback Program 5 (KZ)"
    },
    questions: [21, 22, 23, 24, 25],
    description: {
      ru: "This is a fallback program used when the real data is missing.",
      kz: "This is a fallback program used when the real data is missing. (KZ)"
    }
  }
];

/**
 * Generates fallback questions for testing
 * @returns {Array} Array of questions
 */
export const generateFallbackQuestions = () => {
  const questions = [];
  
  // Generate 25 questions
  for (let i = 1; i <= 25; i++) {
    questions.push({
      id: i,
      text: {
        ru: `Fallback Question ${i}`,
        kz: `Fallback Question ${i} (KZ)`
      },
      program: Math.ceil(i / 5) // Assign to programs 1-5
    });
  }
  
  return questions;
};

export default fallbackProgramData; 
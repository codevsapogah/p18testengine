import React, { useState, useEffect, useCallback } from 'react';

const answerOptions = {
  ru: [
    { value: 1, text: 'Абсолютно не соответствует' },
    { value: 2, text: 'По большей части не соответствует' },
    { value: 3, text: 'Скорее не соответствует, чем соответствует' },
    { value: 4, text: 'Скорее соответствует' },
    { value: 5, text: 'По большей части соответствует' },
    { value: 6, text: 'Полностью соответствует' }
  ],
  kz: [
    { value: 1, text: 'Мүлдем сәйкес келмейді' },
    { value: 2, text: 'Көбінесе сәйкес келмейді' },
    { value: 3, text: 'Сәйкес келмейтін сияқты' },
    { value: 4, text: 'Сәйкес келетін сияқты' },
    { value: 5, text: 'Көбінесе сәйкес келеді' },
    { value: 6, text: 'Толық сәйкес келеді' }
  ]
};

const Question = ({ question, language, onAnswer, isLastQuestion = false, previousAnswer = null }) => {
  const [selectedValue, setSelectedValue] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);
  
  useEffect(() => {
    if (previousAnswer !== null && previousAnswer !== undefined) {
      setSelectedValue(previousAnswer);
    } else {
      setSelectedValue(null);
    }
  }, [previousAnswer, question.id]);
  
  const handleOptionClick = useCallback((value) => {
    if (isAnimating) return;
    setSelectedValue(value);
    setIsAnimating(true);
    
    setTimeout(() => {
      onAnswer(value);
      if (!isLastQuestion && previousAnswer === null) {
        setSelectedValue(null);
      }
      setIsAnimating(false);
    }, isLastQuestion ? 0 : 500);
  }, [onAnswer, isAnimating, isLastQuestion, previousAnswer]);
  
  const handleKeyboardInput = useCallback((e) => {
    const key = parseInt(e.key);
    if (key >= 1 && key <= 6) {
      e.preventDefault();
      handleOptionClick(key);
    }
  }, [handleOptionClick]);
  
  useEffect(() => {
    window.addEventListener('keydown', handleKeyboardInput);
    return () => {
      window.removeEventListener('keydown', handleKeyboardInput);
    };
  }, [handleKeyboardInput]);
  
  const currentOptions = answerOptions[language];
  
  return (
    <div 
      className={`transition-opacity duration-500 ${isAnimating && !isLastQuestion ? 'opacity-0' : 'opacity-100'}`}
      aria-live="polite"
    >
      <div className="h-32 flex items-center mb-4">
        <h2 className="text-md sm:text-xl font-medium text-gray-800 text-left">
          {question[language]}
        </h2>
      </div>
      
      <div className="space-y-2 sm:space-y-3 sm:px-4">
        {currentOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => handleOptionClick(option.value)}
            disabled={isAnimating && !isLastQuestion}
            className={`w-full text-left p-3 sm:p-4 rounded-md transition duration-200 border text-sm sm:text-base ${
              selectedValue === option.value
                ? 'bg-green-100 border-green-500 text-green-800'
                : 'bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-700'
            }`}
            aria-pressed={selectedValue === option.value}
          >
            {option.text}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Question;
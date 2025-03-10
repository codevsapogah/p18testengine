import React, { useState } from 'react';
import { programs } from '../../data/programs';
import { scoreCategories } from '../../data/programData';

const categoryColors = {
  reduced: 'bg-green-500',
  average: 'bg-yellow-500',
  increased: 'bg-orange-500',
  high: 'bg-red-600'
};

const categoryTextColors = {
  reduced: 'text-green-500',
  average: 'text-yellow-600',
  increased: 'text-orange-500',
  high: 'text-red-600'
};

const ListView = ({ results, language }) => {
  const [expandedProgram, setExpandedProgram] = useState(null);
  
  const translations = {
    title: {
      ru: 'Результаты теста P18',
      kz: 'P18 тест нәтижелері'
    },
    clickForDetails: {
      ru: 'Нажмите для подробностей',
      kz: 'Толығырақ үшін басыңыз'
    },
    description: {
      ru: 'Описание',
      kz: 'Сипаттама'
    },
    examples: {
      ru: 'Примеры проявления',
      kz: 'Мысалдар'
    }
  };
  
  const getCategoryName = (category) => {
    return scoreCategories[category][language] || '';
  };
  
  const getProgramName = (programId) => {
    const program = programs.find(p => p.id === programId);
    return program ? program.name[language] : '';
  };
  
  const getProgramDescription = (programId) => {
    const program = programs.find(p => p.id === programId);
    return program ? program.description[language] : '';
  };
  
  const getProgramExamples = (programId) => {
    const program = programs.find(p => p.id === programId);
    return program ? program.examples[language] : '';
  };
  
  const toggleExpand = (programId) => {
    if (expandedProgram === programId) {
      setExpandedProgram(null);
    } else {
      setExpandedProgram(programId);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Section header */}
      <div className="p-4 bg-gray-100 border-b sticky top-0 z-10">
        <h2 className="text-xl font-bold text-gray-800 text-center">
          {translations.title[language]}
        </h2>
      </div>
      
      {/* Programs list */}
      <div className="divide-y divide-gray-200">
        {results.all.map((program) => (
          <div key={program.id} className="border-b last:border-b-0">
            {/* Item content with adaptive layout - desktop vs tablet/mobile */}
            <div 
              className="p-4 md:p-5 hover:bg-gray-50 transition-all cursor-pointer"
              onClick={() => toggleExpand(program.id)}
              role="button"
              aria-expanded={expandedProgram === program.id}
              tabIndex={0}
            >
              {/* Desktop view (large screens) */}
              <div className="hidden lg:flex lg:items-center lg:space-x-4">
                {/* Program name */}
                <div className="lg:w-2/5 xl:w-1/2">
                  <h3 className="font-medium text-gray-900 lg:text-lg">
                    {getProgramName(program.id)}
                  </h3>
                </div>
                
                {/* Progress bar */}
                <div className="lg:flex-1">
                  <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      style={{ width: `${program.score}%` }} 
                      className={`h-full ${categoryColors[program.category]}`}
                    ></div>
                  </div>
                </div>
                
                {/* Score and category */}
                <div className="lg:w-36 xl:w-40 flex items-center justify-end space-x-3">
                  <div className={`font-bold text-lg ${categoryTextColors[program.category]}`}>
                    {program.score}%
                  </div>
                  <div className={`py-1 px-3 rounded-full ${categoryColors[program.category]} text-white text-sm font-medium`}>
                    {getCategoryName(program.category)}
                  </div>
                  <svg 
                    className={`h-5 w-5 text-gray-400 transform transition-transform ${expandedProgram === program.id ? 'rotate-180' : ''}`} 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </div>
              </div>
              
              {/* Tablet/Mobile view (md and below) */}
              <div className="block lg:hidden">
                {/* Program name and percentage */}
                <div className="flex justify-between items-center mb-4">
                  <div className="text-base md:text-lg font-medium text-gray-900 pr-2">
                    {getProgramName(program.id)}
                  </div>
                  <div className={`text-lg md:text-xl font-bold ${categoryTextColors[program.category]}`}>
                    {program.score}%
                  </div>
                </div>
                
                {/* Progress bar (full width) */}
                <div className="mb-3">
                  <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      style={{ width: `${program.score}%` }} 
                      className={`h-full ${categoryColors[program.category]}`}
                    ></div>
                  </div>
                </div>
                
                {/* Category (full width) */}
                <div className="w-full">
                  <div className={`w-full py-2 px-3 rounded-full ${categoryColors[program.category]} text-white text-center text-sm font-medium`}>
                    {getCategoryName(program.category)}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Expanded content */}
            {expandedProgram === program.id && (
              <div className="bg-gray-50 p-4 border-t animate-fadeIn">
                <div className="mb-4">
                  <h4 className="font-medium text-gray-800 mb-2">
                    {translations.description[language]}
                  </h4>
                  <p className="text-gray-600 whitespace-pre-line">
                    {getProgramDescription(program.id)}
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">
                    {translations.examples[language]}
                  </h4>
                  <p className="text-gray-600 whitespace-pre-line">
                    {getProgramExamples(program.id)}
                  </p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ListView;
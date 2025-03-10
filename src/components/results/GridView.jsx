import React from 'react';
import { programs } from '../../data/programs';
import { scoreCategories } from '../../data/programData';

const categoryColors = {
  reduced: 'bg-green-500',
  average: 'bg-yellow-500',
  increased: 'bg-orange-500',
  high: 'bg-red-600'
};

const GridView = ({ results, language }) => {
  const getCategoryName = (category) => {
    return scoreCategories[category][language] || '';
  };
  
  const getProgramName = (programId) => {
    const program = programs.find(p => p.id === programId);
    return program ? program.name[language] : '';
  };
  
  // Organize programs by category for display
  const highResults = results.byCategory.high || [];
  const increasedResults = results.byCategory.increased || [];
  // These variables aren't used, so add eslint-disable comments or remove them
  // eslint-disable-next-line no-unused-vars
  const averageResults = results.byCategory.average || [];
  // eslint-disable-next-line no-unused-vars
  const reducedResults = results.byCategory.reduced || [];
  
  const translations = {
    highTitle: {
      ru: 'Высокие результаты',
      kz: 'Жоғары нәтижелер'
    },
    increasedTitle: {
      ru: 'Повышенные результаты',
      kz: 'Жоғарылатылған нәтижелер'
    },
    allResults: {
      ru: 'Все результаты',
      kz: 'Барлық нәтижелер'
    }
  };
  
  return (
    <div className="space-y-8">
      {/* High results section (only if there are any) */}
      {highResults.length > 0 && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-4 bg-red-100">
            <h2 className="text-xl font-bold text-red-800">
              {translations.highTitle[language]}
            </h2>
          </div>
          
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {highResults.map((program) => (
              <div 
                key={program.id} 
                className={`${categoryColors.high} text-white p-4 rounded-lg text-center shadow-md`}
              >
                <div className="text-3xl font-bold mb-2">{program.score}%</div>
                <div className="font-medium">{getProgramName(program.id)}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Increased results section (only if there are any) */}
      {increasedResults.length > 0 && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-4 bg-orange-100">
            <h2 className="text-xl font-bold text-orange-800">
              {translations.increasedTitle[language]}
            </h2>
          </div>
          
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {increasedResults.map((program) => (
              <div 
                key={program.id} 
                className={`${categoryColors.increased} text-white p-4 rounded-lg text-center shadow-md`}
              >
                <div className="text-3xl font-bold mb-2">{program.score}%</div>
                <div className="font-medium">{getProgramName(program.id)}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* All results section */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 bg-gray-100">
          <h2 className="text-xl font-bold text-gray-800">
            {translations.allResults[language]}
          </h2>
        </div>
        
        <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {results.all.map((program) => (
            <div 
              key={program.id} 
              className={`${categoryColors[program.category]} text-white p-4 rounded-lg text-center shadow-md`}
            >
              <div className="text-2xl font-bold mb-1">{program.score}%</div>
              <div className="text-sm font-medium mb-1 line-clamp-2">{getProgramName(program.id)}</div>
              <div className="text-xs bg-white/20 py-1 px-2 rounded-full">{getCategoryName(program.category)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GridView;
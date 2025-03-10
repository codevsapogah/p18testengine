import React, { useContext } from 'react';
import { LanguageContext } from '../../contexts/LanguageContext';

const LanguageToggle = () => {
  const { language, toggleLanguage } = useContext(LanguageContext);
  
  return (
    <div className="flex items-center">
      <button 
        onClick={toggleLanguage}
        className="flex items-center px-3 py-1 rounded-md text-sm font-medium border border-gray-300 hover:bg-gray-50 transition-colors"
        aria-label={`Switch to ${language === 'ru' ? 'Kazakh' : 'Russian'}`}
      >
        {language === 'ru' ? (
          <>
            <span className="mr-2">🇷🇺</span>
            <span>RU</span>
            <span className="ml-2 text-gray-400">→ 🇰🇿 KZ</span>
          </>
        ) : (
          <>
            <span className="mr-2">🇰🇿</span>
            <span>KZ</span>
            <span className="ml-2 text-gray-400">→ 🇷🇺 RU</span>
          </>
        )}
      </button>
    </div>
  );
};

export default LanguageToggle;
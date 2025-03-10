import { useContext } from 'react';
import { LanguageContext } from '../contexts/LanguageContext';

/**
 * Custom hook for accessing language context and translations
 * @returns {Object} Language utilities and current language
 */
const useLanguage = () => {
  const { language, toggleLanguage } = useContext(LanguageContext);
  
  /**
   * Get a translated text based on current language
   * @param {Object} translations - Object with translations keyed by language code
   * @returns {string} The translated text for current language
   */
  const translate = (translations) => {
    if (!translations) return '';
    return translations[language] || '';
  };
  
  return {
    language,
    toggleLanguage,
    translate,
    isRussian: language === 'ru',
    isKazakh: language === 'kz'
  };
};

export default useLanguage;
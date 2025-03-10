import React, { createContext, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get language from URL or default to Russian
  const getInitialLanguage = () => {
    const params = new URLSearchParams(location.search);
    return params.get('lang') === 'kz' ? 'kz' : 'ru';
  };

  const [language, setLanguage] = useState(getInitialLanguage);

  // Update URL when language changes
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const currentLang = params.get('lang');
    
    if (currentLang !== language) {
      params.set('lang', language);
      navigate({ search: params.toString() }, { replace: true });
    }
  }, [language, location.search, navigate]);

  // Toggle language
  const toggleLanguage = () => {
    setLanguage(prevLang => prevLang === 'ru' ? 'kz' : 'ru');
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};
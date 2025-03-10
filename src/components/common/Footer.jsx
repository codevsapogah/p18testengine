import React, { useContext } from 'react';
import { LanguageContext } from '../../contexts/LanguageContext';

const translations = {
  copyright: {
    ru: 'Все права защищены',
    kz: 'Барлық құқықтар қорғалған'
  }
};

const Footer = () => {
  const { language } = useContext(LanguageContext);
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-white shadow-inner mt-8 py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center text-gray-500 text-sm">
          <p>&copy; {currentYear} P18 Test Platform. {translations.copyright[language]}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
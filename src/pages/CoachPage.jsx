import React, { useContext, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LanguageContext } from '../contexts/LanguageContext';
import AuthContext from '../contexts/AuthContext';
import CoachDashboard from '../components/coach/CoachDashboard';
import ResultReview from '../components/coach/ResultReview';
import LanguageToggle from '../components/common/LanguageToggle';

const CoachPage = () => {
  const { language } = useContext(LanguageContext);
  const { user, logout } = useContext(AuthContext);
  const [showCopied, setShowCopied] = useState(false);
  
  const copyReferralLink = () => {
    const domain = window.location.origin;
    const referralLink = `${domain}/?lang=${language}&coach=${user?.email}`;
    navigator.clipboard.writeText(referralLink);
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 2000);
  };
  
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          {/* Desktop view (large screens) */}
          <div className="hidden lg:flex lg:flex-wrap lg:items-center">
            <div className="lg:w-auto lg:flex-none mr-6 flex items-center">
              <h1 className="text-xl font-bold text-gray-900">
                {language === 'ru' ? 'Портал коуча' : 'Коуч порталы'}
              </h1>
              <button 
                onClick={copyReferralLink}
                className="ml-3 px-3 py-1.5 text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded flex items-center relative transition"
                title={language === 'ru' ? 'Копировать реферальную ссылку' : 'Рефералдық сілтемені көшіру'}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span className="text-sm font-medium">
                  {language === 'ru' ? 'Ваша реферальная ссылка' : 'Сіздің реферальдық сілтеме'}
                </span>
                {showCopied && (
                  <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                    {language === 'ru' ? 'Скопировано!' : 'Көшірілді!'}
                  </span>
                )}
              </button>
            </div>
            
            <div className="ml-auto">
              <LanguageToggle />
            </div>
            
            <div className="ml-4 flex items-center space-x-4">
              <span className="text-gray-600 max-w-[160px] truncate">
                {user?.name || user?.email}
              </span>
              <button
                onClick={logout}
                className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 whitespace-nowrap"
              >
                {language === 'ru' ? 'Выйти' : 'Шығу'}
              </button>
            </div>
          </div>
          
          {/* Tablet view */}
          <div className="hidden md:flex md:flex-col lg:hidden">
            {/* Top row: Dashboard name and user name */}
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center">
                <h1 className="text-xl font-bold text-gray-900">
                  {language === 'ru' ? 'Портал коуча' : 'Коуч порталы'}
                </h1>
                <button 
                  onClick={copyReferralLink}
                  className="ml-3 px-3 py-1.5 text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded flex items-center relative transition"
                  title={language === 'ru' ? 'Копировать реферальную ссылку' : 'Рефералдық сілтемені көшіру'}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm font-medium">
                    {language === 'ru' ? 'Ваша реферальная ссылка' : 'Сіздің реферальдық сілтеме'}
                  </span>
                  {showCopied && (
                    <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                      {language === 'ru' ? 'Скопировано!' : 'Көшірілді!'}
                    </span>
                  )}
                </button>
              </div>
              <span className="text-gray-600 max-w-[200px] truncate text-right">
                {user?.name || user?.email}
              </span>
            </div>
            
            {/* Bottom row: Language toggle and logout button */}
            <div className="flex justify-between items-center">
              <div>
                <LanguageToggle />
              </div>
              <button
                onClick={logout}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 whitespace-nowrap"
              >
                {language === 'ru' ? 'Выйти' : 'Шығу'}
              </button>
            </div>
          </div>
          
          {/* Mobile view */}
          <div className="flex flex-col md:hidden">
            {/* Line 1: Dashboard name | User name */}
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center">
                <h1 className="text-lg font-bold text-gray-900">
                  {language === 'ru' ? 'Портал коуча' : 'Коуч порталы'}
                </h1>
              </div>
              <span className="text-gray-600 max-w-[160px] truncate text-right">
                {user?.name || user?.email}
              </span>
            </div>
            
            {/* Line 2: Language toggle | Logout button */}
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <LanguageToggle />
                <button 
                  onClick={copyReferralLink}
                  className="px-2 py-1 text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded flex items-center relative transition"
                  title={language === 'ru' ? 'Копировать реферальную ссылку' : 'Рефералдық сілтемені көшіру'}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <span className="text-xs font-medium">
                    {language === 'ru' ? 'Реферальная ссылка' : 'Реферальдық сілтеме'}
                  </span>
                  {showCopied && (
                    <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                      {language === 'ru' ? 'Скопировано!' : 'Көшірілді!'}
                    </span>
                  )}
                </button>
              </div>
              <button
                onClick={logout}
                className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 whitespace-nowrap"
              >
                {language === 'ru' ? 'Выйти' : 'Шығу'}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <Routes>
          <Route path="dashboard" element={<CoachDashboard />} />
          <Route path="results/:id" element={<ResultReview />} />
          <Route path="*" element={<Navigate to="dashboard" replace />} />
        </Routes>
      </main>

      <footer className="bg-white shadow-inner mt-8 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} P18 Test Platform
          </p>
        </div>
      </footer>
    </div>
  );
};

export default CoachPage;
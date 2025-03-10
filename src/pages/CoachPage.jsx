import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LanguageContext } from '../contexts/LanguageContext';
import AuthContext from '../contexts/AuthContext';
import CoachDashboard from '../components/coach/CoachDashboard';
import ResultReview from '../components/coach/ResultReview';
import LanguageToggle from '../components/common/LanguageToggle';

const CoachPage = () => {
  const { language } = useContext(LanguageContext);
  const { user, logout } = useContext(AuthContext);
  
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          {/* Desktop view (large screens) */}
          <div className="hidden lg:flex lg:flex-wrap lg:items-center">
            <div className="lg:w-auto lg:flex-none mr-6">
              <h1 className="text-xl font-bold text-gray-900">
                {language === 'ru' ? 'Портал коуча' : 'Коуч порталы'}
              </h1>
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
              <h1 className="text-xl font-bold text-gray-900">
                {language === 'ru' ? 'Портал коуча' : 'Коуч порталы'}
              </h1>
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
              <h1 className="text-lg font-bold text-gray-900">
                {language === 'ru' ? 'Портал коуча' : 'Коуч порталы'}
              </h1>
              <span className="text-gray-600 max-w-[160px] truncate text-right">
                {user?.name || user?.email}
              </span>
            </div>
            
            {/* Line 2: Language toggle | Logout button */}
            <div className="flex justify-between items-center">
              <div>
                <LanguageToggle />
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
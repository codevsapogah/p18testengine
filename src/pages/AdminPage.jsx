import React, { useContext, useState } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { LanguageContext } from '../contexts/LanguageContext';
import { AuthContext } from '../contexts/AuthContext';
import AdminDashboard from '../components/admin/AdminDashboard';
import CoachForm from '../components/admin/CoachForm';
import CoachList from '../components/admin/CoachList';
import ResultReview from '../components/coach/ResultReview';
import LanguageToggle from '../components/common/LanguageToggle';
import { recalculateAllResults, recalculateSingleResult } from '../utils/recalculateResults';

const AdminPage = () => {
  const { language } = useContext(LanguageContext);
  const { user, logout } = useContext(AuthContext);
  const [recalculating, setRecalculating] = useState(false);
  const [recalcStats, setRecalcStats] = useState(null);
  const [resultId, setResultId] = useState('');
  const [singleRecalcResult, setSingleRecalcResult] = useState(null);
  const [showTools, setShowTools] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  const handleRecalculateResults = async () => {
    if (!window.confirm('Are you sure you want to recalculate all results? This may take some time.')) return;
    
    setRecalculating(true);
    try {
      const stats = await recalculateAllResults();
      setRecalcStats(stats);
      window.alert(`Recalculation complete!\n${stats.success} results updated, ${stats.error} errors.`);
    } catch (err) {
      console.error('Recalculation failed:', err);
      window.alert('Recalculation failed. See console for details.');
    } finally {
      setRecalculating(false);
    }
  };

  const handleRecalculateSingle = async (e) => {
    e.preventDefault();
    if (!resultId.trim()) {
      window.alert('Please enter a result ID');
      return;
    }

    setRecalculating(true);
    setSingleRecalcResult(null);
    
    try {
      const result = await recalculateSingleResult(resultId);
      setSingleRecalcResult({ success: true, id: resultId });
      console.log('Recalculated result:', result);
    } catch (err) {
      console.error('Recalculation failed:', err);
      setSingleRecalcResult({ success: false, error: err.message });
    } finally {
      setRecalculating(false);
    }
  };

  const isOnDashboard = location.pathname === '/admin/dashboard' || location.pathname === '/admin';
  
  const handleBackToDashboard = () => {
    navigate('/admin/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          {/* Desktop view (large screens) */}
          <div className="hidden lg:flex lg:flex-wrap lg:items-center">
            <div className="lg:w-auto lg:flex-none mr-6">
              <h1 className="text-xl font-bold text-gray-900">
                {language === 'ru' ? 'Панель администратора' : 'Әкімші панелі'}
              </h1>
            </div>
            
            <div className="flex items-center">
              {!isOnDashboard && (
                <button
                  onClick={handleBackToDashboard}
                  className="mr-4 px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                >
                  {language === 'ru' ? 'На главную' : 'Басты бетке'}
                </button>
              )}
              <button
                onClick={() => setShowTools(!showTools)}
                className="px-3 py-2 bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200"
              >
                {language === 'ru' ? 'Инструменты' : 'Құралдар'}
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
                <h1 className="text-xl font-bold text-gray-900 mr-3">
                  {language === 'ru' ? 'Панель администратора' : 'Әкімші панелі'}
                </h1>
                {!isOnDashboard && (
                  <button
                    onClick={handleBackToDashboard}
                    className="mr-2 px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded hover:bg-gray-200"
                  >
                    {language === 'ru' ? 'На главную' : 'Басты бетке'}
                  </button>
                )}
                <button
                  onClick={() => setShowTools(!showTools)}
                  className="px-3 py-1 bg-indigo-100 text-indigo-700 text-sm rounded hover:bg-indigo-200"
                >
                  {language === 'ru' ? 'Инструменты' : 'Құралдар'}
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
              <h1 className="text-lg font-bold text-gray-900">
                {language === 'ru' ? 'Панель администратора' : 'Әкімші панелі'}
              </h1>
              <span className="text-gray-600 max-w-[160px] truncate text-right">
                {user?.name || user?.email}
              </span>
            </div>
            
            {/* Line 2: Tools, Back, Language toggle | Logout button */}
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <LanguageToggle />
                <button
                  onClick={() => setShowTools(!showTools)}
                  className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded hover:bg-indigo-200"
                >
                  {language === 'ru' ? 'Инструменты' : 'Құралдар'}
                </button>
                {!isOnDashboard && (
                  <button
                    onClick={handleBackToDashboard}
                    className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded hover:bg-gray-200"
                  >
                    {language === 'ru' ? 'На главную' : 'Басты бетке'}
                  </button>
                )}
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
        {/* Modal for maintenance tools */}
        {showTools && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-800 bg-opacity-50 flex items-center justify-center">
            <div className="relative bg-white rounded-lg shadow-lg max-w-3xl w-full m-4">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">
                    {language === 'ru' ? 'Инструменты обслуживания' : 'Қызмет көрсету құралдары'}
                  </h2>
                  <button 
                    onClick={() => setShowTools(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="flex flex-col md:flex-row gap-4">
                  {/* Recalculate Single Result */}
                  <div className="flex-1 p-4 border rounded-md bg-gray-50">
                    <h3 className="font-semibold mb-2">
                      {language === 'ru' ? 'Пересчитать один результат' : 'Бір нәтижені қайта есептеу'}
                    </h3>
                    <form onSubmit={handleRecalculateSingle} className="flex flex-col gap-2">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={resultId}
                          onChange={(e) => setResultId(e.target.value)}
                          placeholder="Result ID"
                          className="flex-1 px-3 py-2 border rounded-md"
                          disabled={recalculating}
                        />
                        <button
                          type="submit"
                          disabled={recalculating || !resultId.trim()}
                          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                        >
                          {recalculating ? '...' : language === 'ru' ? 'Пересчитать' : 'Қайта есептеу'}
                        </button>
                      </div>
                      
                      {singleRecalcResult && (
                        <div className={`mt-2 p-2 rounded text-sm ${singleRecalcResult.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {singleRecalcResult.success 
                            ? (language === 'ru' ? `Результат ${singleRecalcResult.id} успешно пересчитан` : `${singleRecalcResult.id} нәтижесі сәтті қайта есептелді`)
                            : singleRecalcResult.error}
                        </div>
                      )}
                    </form>
                  </div>
                  
                  {/* Recalculate All Results */}
                  <div className="flex-1 p-4 border rounded-md bg-gray-50">
                    <h3 className="font-semibold mb-2">
                      {language === 'ru' ? 'Пересчитать все результаты' : 'Барлық нәтижелерді қайта есептеу'}
                    </h3>
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={handleRecalculateResults}
                        disabled={recalculating}
                        className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
                      >
                        {recalculating 
                          ? (language === 'ru' ? 'Выполняется...' : 'Орындалуда...') 
                          : (language === 'ru' ? 'Пересчитать все' : 'Барлығын қайта есептеу')}
                      </button>
                      
                      {recalcStats && (
                        <div className="mt-2 p-2 bg-green-100 text-green-800 rounded text-sm">
                          <span className="font-semibold">{language === 'ru' ? 'Итоги:' : 'Нәтижелер:'}</span> 
                          {language === 'ru' 
                            ? ` ${recalcStats.success} из ${recalcStats.total} обновлено` 
                            : ` ${recalcStats.total} ішінен ${recalcStats.success} жаңартылды`}
                          {recalcStats.error > 0 && (language === 'ru' 
                            ? `, ${recalcStats.error} ошибок` 
                            : `, ${recalcStats.error} қате`)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 text-right">
                  <button
                    onClick={() => setShowTools(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                  >
                    {language === 'ru' ? 'Закрыть' : 'Жабу'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Regular Routes */}
        <Routes>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="coaches" element={<CoachList />} />
          <Route path="coaches/add" element={<CoachForm />} />
          <Route path="coaches/edit/:id" element={<CoachForm />} />
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

export default AdminPage;
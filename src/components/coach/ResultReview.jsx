import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { LanguageContext } from '../../contexts/LanguageContext';
import AuthContext from '../../contexts/AuthContext';
import { supabase } from '../../supabase';
import { calculateResults, getResultsSummary } from '../../utils/calculateResults';
import GridView from '../results/GridView';
import ListView from '../results/ListView';
import { generateGridPDF } from '../../utils/gridpdf';
import { generateListPDF } from '../../utils/listpdf';

const translations = {
  title: {
    ru: 'Просмотр результата',
    kz: 'Нәтижені қарау'
  },
  loading: {
    ru: 'Загрузка результатов...',
    kz: 'Нәтижелер жүктелуде...'
  },
  error: {
    ru: 'Ошибка при загрузке результатов',
    kz: 'Нәтижелерді жүктеу кезінде қате'
  },
  notFound: {
    ru: 'Результат не найден',
    kz: 'Нәтиже табылмады'
  },
  userInfo: {
    ru: 'Информация о пользователе',
    kz: 'Қолданушы туралы ақпарат'
  },
  name: {
    ru: 'Имя',
    kz: 'Аты-жөні'
  },
  email: {
    ru: 'Email',
    kz: 'Email'
  },
  phone: {
    ru: 'Телефон',
    kz: 'Телефон'
  },
  date: {
    ru: 'Дата',
    kz: 'Күні'
  },
  gridView: {
    ru: 'Сетка',
    kz: 'Торлы көрініс'
  },
  listView: {
    ru: 'Список',
    kz: 'Тізім'
  },
  downloadPDF: {
    ru: 'Скачать PDF',
    kz: 'PDF жүктеу'
  },
  sendEmail: {
    ru: 'Отправить на email',
    kz: 'Поштаға жіберу'
  },
  markAsReviewed: {
    ru: 'Отметить как просмотренный',
    kz: 'Қаралған деп белгілеу'
  },
  markAsNotReviewed: {
    ru: 'Отметить как непросмотренный',
    kz: 'Қаралмаған деп белгілеу'
  },
  backToDashboard: {
    ru: 'Вернуться к панели',
    kz: 'Панельге оралу'
  }
};

const ResultReview = () => {
  const { id } = useParams();
  const { language } = useContext(LanguageContext);
  const { role } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [userData, setUserData] = useState(null);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  
  useEffect(() => {
    const fetchResults = async () => {
      if (!id) {
        setError('No result ID provided');
        setLoading(false);
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from('quiz_results')
          .select('*')
          .eq('id', id)
          .single();
          
        if (error) throw error;
        
        if (!data) {
          setError('Results not found');
          setLoading(false);
          return;
        }
        
        const calculatedResults = calculateResults(data.answers);
        const resultsSummary = getResultsSummary(calculatedResults);
        
        setUserData(data);
        setResults(resultsSummary);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching results:', err);
        setError(err.message);
        setLoading(false);
      }
    };
    
    fetchResults();
  }, [id]);
  
  const handleDownloadPDF = () => {
    try {
      if (!userData) {
        throw new Error('No results available');
      }

      // Create sortedPrograms array from userData.calculated_results
      const sortedPrograms = Object.entries(userData.calculated_results).map(([key, value]) => {
        const programId = parseInt(key.replace('program_', ''), 10);
        return {
          id: programId,
          ru: userData.program_names?.[programId]?.ru || `Program ${programId}`,
          kz: userData.program_names?.[programId]?.kz || `Program ${programId}`,
          score: Math.round(value),
        };
      });

      // Use client-side PDF generation
      const translations = {
        title: {
          ru: 'Высокие результаты',
          kz: 'Жоғары нәтижелер'
        },
        allResults: {
          ru: 'Все результаты',
          kz: 'Барлық нәтижелер'
        },
        permalink: {
          ru: 'Постоянная ссылка на результаты:',
          kz: 'Нәтижелерге тұрақты сілтеме:'
        },
        program: {
          ru: 'Программа',
          kz: 'Бағдарлама'
        },
        category: {
          ru: 'Категория',
          kz: 'Санат'
        }
      };

      if (viewMode === 'grid') {
        generateGridPDF(userData, sortedPrograms, language, translations, id);
      } else {
        generateListPDF(userData, sortedPrograms, language, translations, id);
      }
    } catch (error) {
      console.error('PDF generation error:', error);
      setError('Failed to generate PDF');
    }
  };
  
  const toggleViewMode = () => {
    setViewMode(viewMode === 'grid' ? 'list' : 'grid');
  };
  
  const handleReviewStatusChange = async () => {
    try {
      const newStatus = !userData.review_status;
      
      setUserData({
        ...userData,
        review_status: newStatus
      });
      
      const { error } = await supabase
        .from('quiz_results')
        .update({ review_status: newStatus })
        .eq('id', id);
        
      if (error) throw error;
    } catch (err) {
      console.error('Error updating review status:', err);
      setUserData({
        ...userData,
        review_status: !userData.review_status
      });
    }
  };
  
  const handleBack = () => {
    navigate(role === 'admin' ? '/admin/dashboard' : '/coach/dashboard');
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-600">{translations.loading[language]}</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-100 text-red-700 p-4 rounded-md">
        <p>{translations.error[language]}: {error}</p>
        <button
          onClick={handleBack}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          {translations.backToDashboard[language]}
        </button>
      </div>
    );
  }
  
  if (!userData || !results) {
    return (
      <div className="text-center text-gray-600">
        {translations.notFound[language]}
        <button
          onClick={handleBack}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 block mx-auto"
        >
          {translations.backToDashboard[language]}
        </button>
      </div>
    );
  }
  
  return (
    <div>
      <div className="mb-8 bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">{translations.title[language]}</h2>
          <button
            onClick={handleBack}
            className="text-blue-600 hover:underline"
          >
            {translations.backToDashboard[language]}
          </button>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-md mb-4">
          <h3 className="font-bold text-gray-700 mb-3">{translations.userInfo[language]}</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="font-medium text-gray-600">{translations.name[language]}:</span>{' '}
              <span className="text-gray-800">{userData.user_name || '—'}</span>
            </div>
            
            <div>
              <span className="font-medium text-gray-600">{translations.phone[language]}:</span>{' '}
              <span className="text-gray-800">{userData.user_phone || '—'}</span>
            </div>
            
            <div>
              <span className="font-medium text-gray-600">{translations.date[language]}:</span>{' '}
              <span className="text-gray-800">{new Date(userData.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleViewMode}
              className={`px-4 py-2 rounded-md ${
                viewMode === 'grid'
                  ? 'bg-blue-500 text-white hover:bg-blue-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {translations.gridView[language]}
            </button>
            
            <button
              onClick={toggleViewMode}
              className={`px-4 py-2 rounded-md ${
                viewMode === 'list'
                  ? 'bg-blue-500 text-white hover:bg-blue-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {translations.listView[language]}
            </button>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={handleReviewStatusChange}
              className={`px-4 py-2 rounded-md ${
                userData.review_status
                  ? 'bg-orange-500 text-white hover:bg-orange-600'
                  : 'bg-green-500 text-white hover:bg-green-600'
              }`}
            >
              {userData.review_status 
                ? translations.markAsNotReviewed[language] 
                : translations.markAsReviewed[language]}
            </button>
            
            <button
              onClick={handleDownloadPDF}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              {translations.downloadPDF[language]}
            </button>
          </div>
        </div>
      </div>
      
      {viewMode === 'grid' ? (
        <GridView results={results} language={language} />
      ) : (
        <ListView results={results} language={language} />
      )}
    </div>
  );
};

export default ResultReview;
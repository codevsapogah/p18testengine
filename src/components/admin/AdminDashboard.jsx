import React, { useState, useEffect, useContext, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { LanguageContext } from '../../contexts/LanguageContext';
import { supabase } from '../../supabase';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const translations = {
  title: {
    ru: 'Панель администратора',
    kz: 'Әкімші панелі'
  },
  coaches: {
    ru: 'Коучи',
    kz: 'Коучтар'
  },
  manageCoaches: {
    ru: 'Управление коучами',
    kz: 'Коучтарды басқару'
  },
  results: {
    ru: 'Результаты',
    kz: 'Нәтижелер'
  },
  totalResults: {
    ru: 'Всего результатов',
    kz: 'Барлық нәтижелер'
  },
  search: {
    ru: 'Поиск по имени, email или программе',
    kz: 'Аты, email немесе бағдарлама бойынша іздеу'
  },
  name: {
    ru: 'Имя',
    kz: 'Аты-жөні'
  },
  userEmail: {
    ru: 'Email пользователя',
    kz: 'Қолданушы email'
  },
  assignedCoach: {
    ru: 'Назначенный коуч',
    kz: 'Тағайындалған коуч'
  },
  date: {
    ru: 'Дата',
    kz: 'Күні'
  },
  actions: {
    ru: 'Действия',
    kz: 'Әрекеттер'
  },
  viewResult: {
    ru: 'Просмотр результата',
    kz: 'Нәтижені қарау'
  },
  noResults: {
    ru: 'Результаты не найдены',
    kz: 'Нәтижелер табылмады'
  },
  addCoach: {
    ru: 'Добавить коуча',
    kz: 'Коуч қосу'
  },
  showAdmins: {
    ru: 'Показать администраторов',
    kz: 'Әкімшілерді көрсету'
  },
  loading: {
    ru: 'Загрузка...',
    kz: 'Жүктелуде...'
  },
  viewResults: {
    ru: 'Посмотреть результаты',
    kz: 'Нәтижелерді көру'
  },
  language: {
    ru: 'Қазақша',
    kz: 'Русский'
  },
  totalTests: {
    ru: 'Всего тестов',
    kz: 'Барлық тесттер'
  },
  viewAll: {
    ru: 'Посмотреть все',
    kz: 'Барлықтарды көру'
  },
  totalCoaches: {
    ru: 'Всего коучей',
    kz: 'Барлық коучтар'
  },
  latestResult: {
    ru: 'Последний результат',
    kz: 'Соңғы нәтиже'
  },
  status: {
    ru: 'Статус',
    kz: 'Статус'
  },
  testInProgress: {
    ru: 'Тест в процессе',
    kz: 'Тест үдерісте'
  },
  testIncomplete: {
    ru: 'Тест не завершен',
    kz: 'Тест аяқталмаған'
  },
  startDate: {
    ru: 'Начало',
    kz: 'Басталу'
  },
  endDate: {
    ru: 'Конец',
    kz: 'Аяқталу'
  },
  analytics: {
    ru: 'Аналитика',
    kz: 'Талдау'
  },
  started: {
    ru: 'Начали тест',
    kz: 'Тестті бастады'
  },
  completed: {
    ru: 'Завершили тест',
    kz: 'Тестті аяқтады'
  },
  selectCoach: {
    ru: 'Выберите коуча',
    kz: 'Коучты таңдаңыз'
  },
  allCoaches: {
    ru: 'Все коучи',
    kz: 'Барлық коучтар'
  },
  overallStats: {
    ru: 'Общая статистика',
    kz: 'Жалпы статистика'
  },
  totalStarted: {
    ru: 'Всего начали',
    kz: 'Барлығы бастады'
  },
  totalCompleted: {
    ru: 'Всего завершили',
    kz: 'Барлығы аяқтады'
  },
  overallConversion: {
    ru: 'Общая конверсия',
    kz: 'Жалпы конверсия'
  },
  averagePerDay: {
    ru: 'В среднем в день',
    kz: 'Күніне орташа'
  },
  analyticsDateRange: {
    ru: 'Период аналитики',
    kz: 'Талдау кезеңі'
  }
};

const AdminDashboard = () => {
  const { language } = useContext(LanguageContext);
  
  const [results, setResults] = useState([]);
  const [coaches, setCoaches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedCoach, setSelectedCoach] = useState('');
  const [isAnalyticsExpanded, setIsAnalyticsExpanded] = useState(false);
  const [analyticsStartDate, setAnalyticsStartDate] = useState('');
  const [analyticsEndDate, setAnalyticsEndDate] = useState('');
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch test results
        const { data: resultsData, error: resultsError } = await supabase
          .from('quiz_results')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (resultsError) throw resultsError;
        
        console.log('Raw results:', resultsData);
        
        // Filter completed tests - check for valid answers structure
        const completedResults = resultsData?.filter(result => {
          // Check if answers exist and is an object
          if (!result.answers || typeof result.answers !== 'object') {
            return false;
          }
          
          // Check if we have actual answers (not empty object)
          const answerCount = Object.keys(result.answers).length;
          console.log(`Result ${result.id} has ${answerCount} answers`);
          
          // Must have at least some answers to be considered valid
          return answerCount > 0;
        }) || [];
        
        // Determine test status for each result
        const resultsWithStatus = completedResults.map(result => {
          // Consider test complete if:
          // - It has answers for all 90 questions, OR
          // - current_index is at the end (89 for 90 questions), OR
          // - It was generated by random test
          const isComplete = 
            Object.keys(result.answers).length === 90 || 
            (result.current_index !== undefined && result.current_index >= 89) ||
            result.is_random === true;
            
          // Calculate how much time passed since the test was started
          const createdAt = new Date(result.created_at);
          const now = new Date();
          const hoursSinceCreated = (now - createdAt) / (1000 * 60 * 60);
          
          // Consider "in progress" if:
          // - Created less than 2 hours ago AND
          // - Not marked as complete AND
          // - Has some answers
          const isInProgress = 
            !isComplete && 
            hoursSinceCreated < 2 && 
            Object.keys(result.answers).length > 0;
            
          // If not complete and not in progress, it's incomplete (abandoned)
          // eslint-disable-next-line no-unused-vars
          const isIncomplete = !isComplete && !isInProgress;
          
          return {
            ...result,
            status: isComplete ? 'complete' : (isInProgress ? 'in_progress' : 'incomplete')
          };
        });
        
        console.log('Filtered completed results:', resultsWithStatus);
        
        // Sort by creation date to ensure most recent first
        const sortedResults = resultsWithStatus.sort((a, b) => 
          new Date(b.created_at) - new Date(a.created_at)
        );
        
        // Fetch coaches
        const { data: coachesData, error: coachesError } = await supabase
          .from('approved_coaches')
          .select('*')
          .order('name', { ascending: true });
          
        if (coachesError) throw coachesError;
        
        setResults(sortedResults);
        setCoaches(coachesData || []);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message);
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Calculate analytics data for the past 10 days
  const analyticsData = useMemo(() => {
    let startDate = new Date();
    let endDate = new Date();
    let days = [];

    if (analyticsStartDate && analyticsEndDate) {
      startDate = new Date(analyticsStartDate);
      endDate = new Date(analyticsEndDate);
    } else {
      // Default to last 10 days if no date range selected
      startDate.setDate(startDate.getDate() - 9);
    }

    // Calculate number of days between dates
    const dayDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
    
    for (let i = 0; i < dayDiff; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      date.setHours(0, 0, 0, 0);
      
      const nextDate = new Date(date);
      nextDate.setDate(date.getDate() + 1);
      
      const dayResults = results.filter(result => {
        const resultDate = new Date(result.created_at);
        return resultDate >= date && resultDate < nextDate &&
               (!selectedCoach || result.coach_email === selectedCoach);
      });
      
      const started = dayResults.length;
      const completed = dayResults.filter(r => r.status === 'complete').length;
      const conversionRate = started > 0 ? Math.round((completed / started) * 100) : 0;
      
      days.push({
        date: date.toLocaleDateString(),
        [translations.started[language]]: started,
        [translations.completed[language]]: completed,
        conversionRate
      });
    }
    
    return days;
  }, [results, selectedCoach, language, analyticsStartDate, analyticsEndDate]);
  
  // Calculate overall stats
  const overallStats = useMemo(() => {
    let filteredResults = results;
    
    if (analyticsStartDate || analyticsEndDate) {
      filteredResults = results.filter(result => {
        const resultDate = new Date(result.created_at);
        return (!analyticsStartDate || resultDate >= new Date(analyticsStartDate)) && 
               (!analyticsEndDate || resultDate <= new Date(analyticsEndDate + 'T23:59:59'));
      });
    }

    const totalStarted = filteredResults.length;
    const totalCompleted = filteredResults.filter(r => r.status === 'complete').length;
    const conversion = totalStarted > 0 ? Math.round((totalCompleted / totalStarted) * 100) : 0;
    
    // Calculate average per day
    let averageStarted = 0;
    let averageCompleted = 0;
    
    if (totalStarted > 0) {
      const firstDate = new Date(Math.min(...filteredResults.map(r => new Date(r.created_at))));
      const lastDate = new Date(Math.max(...filteredResults.map(r => new Date(r.created_at))));
      const daysDiff = Math.max(1, Math.ceil((lastDate - firstDate) / (1000 * 60 * 60 * 24)));
      
      averageStarted = Math.round(totalStarted / daysDiff * 10) / 10;
      averageCompleted = Math.round(totalCompleted / daysDiff * 10) / 10;
    }

    return {
      totalStarted,
      totalCompleted,
      conversion,
      averageStarted,
      averageCompleted
    };
  }, [results, analyticsStartDate, analyticsEndDate]);
  
  // Filter results based on search term and date
  const filteredResults = results.filter(result => {
    const matchesSearch = 
      (result.user_name && result.user_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (result.user_email && result.user_email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (result.coach_email && result.coach_email.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Check if the result's date is within the selected range
    const resultDate = new Date(result.created_at);
    const matchesDateRange = (!startDate || resultDate >= new Date(startDate)) && 
                            (!endDate || resultDate <= new Date(endDate + 'T23:59:59'));
    
    // Add coach filter
    const matchesCoach = !selectedCoach || result.coach_email === selectedCoach;
    
    return matchesSearch && matchesDateRange && matchesCoach;
  });
  
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };
  
  const handleStartDateChange = (e) => {
    setStartDate(e.target.value);
  };
  
  const handleEndDateChange = (e) => {
    setEndDate(e.target.value);
  };
  
  const handleCoachChange = (e) => {
    setSelectedCoach(e.target.value);
  };
  
  // Define translations for status
  const statusTranslations = {
    complete: {
      ru: 'Завершен',
      kz: 'Аяқталған'
    },
    in_progress: {
      ru: 'В процессе',
      kz: 'Үдерісте'
    },
    incomplete: {
      ru: 'Не завершен',
      kz: 'Аяқталмаған'
    }
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
        <p>{error}</p>
      </div>
    );
  }
  
  return (
    <div>
      <div className="mb-8 bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">{translations.title[language]}</h2>
        </div>
        
        {/* Dashboard stats cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-100 p-4 rounded-md">
            <div className="text-blue-800 font-medium">{translations.totalTests[language]}</div>
            <div className="text-3xl font-bold mb-2">{results.length}</div>
          </div>
          
          <div className="bg-green-100 p-4 rounded-md">
            <div className="text-green-800 font-medium">{translations.totalCoaches[language]}</div>
            <div className="text-3xl font-bold mb-2">{coaches.length}</div>
            <Link
              to="/admin/coaches" 
              className="text-green-600 hover:underline text-sm"
            >
              {translations.manageCoaches[language]}
            </Link>
          </div>
          
          <div className="bg-indigo-100 p-4 rounded-md">
            <div className="text-indigo-800 font-medium">{translations.latestResult[language]}</div>
            <div className="text-xl font-bold truncate mb-2">
              {results.length > 0 ? results[0].user_name || '—' : '—'}
            </div>
            {results.length > 0 && (
              <Link
                to={`/results/grid/${results[0].id}?lang=${language}`}
                className="px-3 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 text-sm whitespace-nowrap inline-block min-w-[140px] h-10 flex items-center justify-center"
                target="_blank"
                rel="noopener noreferrer"
              >
                {translations.viewResults[language]}
              </Link>
            )}
          </div>
        </div>
        
        {/* Analytics Chart */}
        <div className="mb-8">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setIsAnalyticsExpanded(!isAnalyticsExpanded)}>
            <h3 className="text-xl font-bold">{translations.analytics[language]}</h3>
            <svg 
              className={`w-6 h-6 transition-transform ${isAnalyticsExpanded ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          {isAnalyticsExpanded && (
            <>
              {/* Overall Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mt-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-sm text-blue-600 font-medium">{translations.totalStarted[language]}</div>
                  <div className="text-2xl font-bold text-blue-700">{overallStats.totalStarted}</div>
                  <div className="text-sm text-blue-500 mt-1">∅ {overallStats.averageStarted}/день</div>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-sm text-green-600 font-medium">{translations.totalCompleted[language]}</div>
                  <div className="text-2xl font-bold text-green-700">{overallStats.totalCompleted}</div>
                  <div className="text-sm text-green-500 mt-1">∅ {overallStats.averageCompleted}/день</div>
                </div>
                
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-sm text-purple-600 font-medium">{translations.overallConversion[language]}</div>
                  <div className="text-2xl font-bold text-purple-700">{overallStats.conversion}%</div>
                </div>
                
                <div className="lg:col-span-2 bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600 font-medium mb-2">{translations.analyticsDateRange[language]}</div>
                  <div className="flex gap-2">
                    <input
                      type="date"
                      value={analyticsStartDate}
                      onChange={(e) => setAnalyticsStartDate(e.target.value)}
                      className="flex-1 px-2 py-1 border rounded"
                    />
                    <input
                      type="date"
                      value={analyticsEndDate}
                      onChange={(e) => setAnalyticsEndDate(e.target.value)}
                      className="flex-1 px-2 py-1 border rounded"
                    />
                  </div>
                </div>
              </div>

              {/* Chart */}
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analyticsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value, name, props) => {
                        if (props.dataKey === translations.completed[language]) {
                          const conversionRate = props.payload.conversionRate;
                          return [`${value} (${conversionRate}% конверсия)`, name];
                        }
                        return [value, name];
                      }}
                    />
                    <Legend />
                    <Bar dataKey={translations.started[language]} fill="#3B82F6" />
                    <Bar dataKey={translations.completed[language]} fill="#22C55E" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </>
          )}
        </div>
        
        {/* Search and Filter Controls - Responsive layout */}
        <div className="space-y-4">
          {/* Desktop & Tablet */}
          <div className="hidden sm:flex items-end space-x-4">
            <div className="flex-grow">
              <label className="block text-sm text-gray-600 mb-1">
                {translations.search[language]}
              </label>
              <input
                type="text"
                placeholder={translations.search[language]}
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full px-3 py-2 border rounded-md h-10"
              />
            </div>
            
            <div className="flex space-x-4 items-end">
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  {translations.selectCoach[language]}
                </label>
                <select
                  value={selectedCoach}
                  onChange={handleCoachChange}
                  className="px-3 py-2 border rounded-md h-10 min-w-[200px]"
                >
                  <option value="">{translations.allCoaches[language]}</option>
                  {coaches.map(coach => (
                    <option key={coach.id} value={coach.email}>
                      {coach.name || coach.email}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  {translations.startDate[language]}
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={handleStartDateChange}
                  className="px-3 py-2 border rounded-md h-10"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  {translations.endDate[language]}
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={handleEndDateChange}
                  className="px-3 py-2 border rounded-md h-10"
                />
              </div>
            </div>
          </div>
          
          {/* Mobile */}
          <div className="sm:hidden space-y-3">
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                {translations.search[language]}
              </label>
              <input
                type="text"
                placeholder={translations.search[language]}
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full px-3 py-2 border rounded-md h-10"
              />
            </div>
            
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                {translations.selectCoach[language]}
              </label>
              <select
                value={selectedCoach}
                onChange={handleCoachChange}
                className="w-full px-3 py-2 border rounded-md h-10"
              >
                <option value="">{translations.allCoaches[language]}</option>
                {coaches.map(coach => (
                  <option key={coach.id} value={coach.email}>
                    {coach.name || coach.email}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                {translations.startDate[language]}
              </label>
              <input
                type="date"
                value={startDate}
                onChange={handleStartDateChange}
                className="w-full px-3 py-2 border rounded-md h-10"
              />
            </div>
            
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                {translations.endDate[language]}
              </label>
              <input
                type="date"
                value={endDate}
                onChange={handleEndDateChange}
                className="w-full px-3 py-2 border rounded-md h-10"
              />
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 bg-gray-50 border-b">
          <h3 className="font-bold text-gray-700">
            {translations.results[language]} ({filteredResults.length})
          </h3>
        </div>
        
        {filteredResults.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            {translations.noResults[language]}
          </div>
        ) : (
          <>
            {/* Desktop view */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {translations.name[language]}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {translations.userEmail[language]} / {translations.assignedCoach[language]}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {translations.date[language]} / {translations.status[language]}
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {translations.actions[language]}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredResults.map((result) => (
                    <tr key={result.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 w-[200px]">
                        <div className="text-sm font-medium text-gray-900">
                          {result.user_name || '—'}
                          {result.status === 'incomplete' && (
                            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              !
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">
                          {result.user_phone || '—'}
                        </div>
                      </td>
                      <td className="px-6 py-4 w-[300px]">
                        <div className="text-sm text-gray-500 mb-1">
                          {result.user_email || '—'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {result.coach_email || '—'}
                        </div>
                      </td>
                      <td className="px-6 py-4 w-[200px]">
                        <div className="text-sm text-gray-500 mb-1">
                          {new Date(result.created_at).toLocaleDateString()}
                        </div>
                        <div className={`text-sm font-medium ${
                          result.status === 'complete' ? 'text-green-600' : 
                          result.status === 'in_progress' ? 'text-blue-600' : 
                          'text-red-600'
                        }`}>
                          {statusTranslations[result.status][language]}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col space-y-2">
                          <Link
                            to={`/results/grid/${result.id}?lang=${language}`}
                            className="px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm whitespace-nowrap inline-block h-10 flex items-center justify-center"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {translations.viewResult[language]}
                          </Link>
                          <a
                            href={`https://wa.me/${result.user_phone?.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 text-sm whitespace-nowrap inline-block h-10 flex items-center justify-center"
                          >
                            {language === 'ru' ? 'Написать в WA' : 'Ватсапқа жазу'}
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Tablet view */}
            <div className="hidden md:grid lg:hidden grid-cols-2 gap-4 p-4">
              {filteredResults.map((result) => (
                <div key={result.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-center mb-3">
                    <div className="font-medium text-gray-900 break-words mb-2 min-h-[40px]">
                      {result.user_name || '—'}
                    </div>
                    <div className="flex space-x-2">
                      <Link
                        to={`/results/grid/${result.id}?lang=${language}`}
                        className="px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm whitespace-nowrap inline-block min-w-[140px] h-10 flex items-center justify-center"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {translations.viewResult[language]}
                      </Link>
                      <a
                        href={`https://wa.me/${result.user_phone?.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 text-sm whitespace-nowrap inline-block h-10 flex items-center justify-center"
                      >
                        {language === 'ru' ? 'WA' : 'WA'}
                      </a>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <div className="text-gray-500 font-medium mb-1">
                        {translations.userEmail[language]}:
                      </div>
                      <div className="text-gray-900 truncate">
                        {result.user_email || '—'}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-500 font-medium mb-1">
                        {translations.assignedCoach[language]}:
                      </div>
                      <div className="text-gray-900 truncate">
                        {result.coach_email || '—'}
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    {new Date(result.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Mobile view */}
            <div className="lg:hidden">
              {filteredResults.map((result) => (
                <div key={result.id} className="border-b border-gray-200 p-4">
                  <div className="mb-3">
                    <div className="font-medium text-gray-900 break-words mb-1">
                      {result.user_name || '—'}
                      {result.status === 'incomplete' && (
                        <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          !
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500 mb-1">
                      {result.user_phone || '—'}
                    </div>
                    <div className="text-sm text-gray-500 mb-1">
                      {result.user_email || '—'}
                    </div>
                    <div className="text-sm text-gray-500 mb-1">
                      {result.coach_email || '—'}
                    </div>
                    <div className={`text-sm font-medium mb-3 ${
                      result.status === 'complete' ? 'text-green-600' : 
                      result.status === 'in_progress' ? 'text-blue-600' : 
                      'text-red-600'
                    }`}>
                      {statusTranslations[result.status][language]}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(result.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex flex-col space-y-2">
                    <Link
                      to={`/results/grid/${result.id}?lang=${language}`}
                      className="px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm whitespace-nowrap inline-block h-10 flex items-center justify-center"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {translations.viewResult[language]}
                    </Link>
                    <a
                      href={`https://wa.me/${result.user_phone?.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 text-sm whitespace-nowrap inline-block h-10 flex items-center justify-center"
                    >
                      {language === 'ru' ? 'Написать в WA' : 'Ватсапқа жазу'}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
import React, { useState, useEffect, useContext, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { LanguageContext } from '../../contexts/LanguageContext';
import AuthContext from '../../contexts/AuthContext';
import { supabase } from '../../supabase';

const translations = {
  title: {
    ru: 'Панель коуча',
    kz: 'Коуч панелі'
  },
  loading: {
    ru: 'Загрузка данных...',
    kz: 'Деректер жүктелуде...'
  },
  error: {
    ru: 'Ошибка при загрузке данных',
    kz: 'Деректерді жүктеу кезінде қате'
  },
  clients: {
    ru: 'Клиенты',
    kz: 'Клиенттер'
  },
  total: {
    ru: 'Всего',
    kz: 'Барлығы'
  },
  reviewed: {
    ru: 'Разбор проведён',
    kz: 'Разбор өткізілді'
  },
  notReviewed: {
    ru: 'Не просмотрено',
    kz: 'Қаралмаған'
  },
  search: {
    ru: 'Поиск по имени, email или телефону',
    kz: 'Аты, email немесе телефон бойынша іздеу'
  },
  hideReviewed: {
    ru: 'Скрыть проведенные разборы',
    kz: 'Разбор өткізілгендерді жасыру'
  },
  viewResults: {
    ru: 'Посмотреть результаты',
    kz: 'Нәтижелерді көру'
  },
  name: {
    ru: 'Имя',
    kz: 'Аты-жөні'
  },
  userEmail: {
    ru: 'Email пользователя',
    kz: 'Қолданушы email'
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
  reviewStatus: {
    ru: 'Разбор проведен',
    kz: 'Разбор өткізілді'
  },
  language: {
    ru: 'Қазақша',
    kz: 'Русский'
  },
  viewAllResults: {
    ru: 'Посмотреть все результаты',
    kz: 'Барлық нәтижелерді көру'
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
  }
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

// Helper function for date formatting
const formatDate = (dateString) => {
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const CoachDashboard = () => {
  const { language } = useContext(LanguageContext);
  const { user } = useContext(AuthContext);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [hideReviewed, setHideReviewed] = useState(false);
  
  // Fetch clients assigned to this coach - using useCallback to memoize
  const fetchClients = useCallback(async () => {
    try {
      // First get the coach's ID
      const { data: coachData, error: coachError } = await supabase
        .from('approved_coaches')
        .select('id, button_text_ru, button_text_kz')
        .eq('email', user?.email)
        .single();

      if (coachError) throw coachError;

      // Then get quiz results with user information
      const { data, error } = await supabase
        .from('quiz_results')
        .select(`
          *,
          user:user_id (
            email
          ),
          coach:coach_id (
            name,
            email,
            phone,
            button_text_ru,
            button_text_kz
          )
        `)
        .eq('coach_id', coachData.id)
        .order('created_at', { ascending: false });
        
      console.log('Raw quiz results:', data);
        
      if (error) throw error;
      
      // Filter completed tests - check for valid answers structure
      const completedData = data.filter(result => {
        // Check if answers exist and is an object
        if (!result.answers || typeof result.answers !== 'object') {
          return false;
        }
        
        // Check if it has at least some questions answered
        return Object.keys(result.answers).length > 0;
      }).map(result => ({
        ...result,
        // Map user data to maintain compatibility with existing code
        user_name: result.entered_name || '—',
        user_email: result.user?.email,
        user_phone: result.entered_phone || '—'
      }));
      
      console.log('Processed quiz results:', completedData);
      
      // Determine test status for each result
      const resultsWithStatus = completedData.map(result => {
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
      
      setClients(resultsWithStatus || []);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching clients:', err);
      setError(err.message);
      setLoading(false);
    }
  }, [user?.email]);
  
  // Fetch clients on component mount
  useEffect(() => {
    fetchClients();
  }, [fetchClients]);
  
  // Filter clients based on search term, reviewed status, and date
  const filteredClients = clients.filter(client => {
    const matchesSearch = 
      (client.entered_name && client.entered_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (client.user?.email && client.user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (client.entered_phone && client.entered_phone.includes(searchTerm));
    
    const matchesReviewFilter = hideReviewed ? !client.review_status : true;
    
    // Check if the client's date is within the selected range
    const clientDate = new Date(client.created_at);
    const matchesDateRange = (!startDate || clientDate >= new Date(startDate)) && 
                            (!endDate || clientDate <= new Date(endDate + 'T23:59:59'));
    
    return matchesSearch && matchesReviewFilter && matchesDateRange;
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
  
  const handleReviewStatusChange = (clientId, status) => {
    // Update local state
    setClients(prevClients => 
      prevClients.map(client => 
        client.id === clientId 
          ? { ...client, review_status: status } 
          : client
      )
    );
    
    // Update in Supabase
    supabase
      .from('quiz_results')
      .update({ review_status: status })
      .eq('id', clientId)
      .then(({ error }) => {
        if (error) {
          console.error('Error updating review status:', error);
          // Revert the change if there was an error
          setClients(prevClients => 
            prevClients.map(client => 
              client.id === clientId 
                ? { ...client, review_status: !status } 
                : client
            )
          );
        }
      });
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
      </div>
    );
  }
  
  return (
    <div>
      <div className="mb-8 bg-white rounded-lg shadow-md p-6">
        {/* Search and Filter Controls - Responsive layout */}
        <div className="space-y-4 mb-6">
          {/* Desktop & Tablet - Two columns */}
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
              
              <div className="flex items-center h-10">
                <input
                  id="hideReviewed"
                  type="checkbox"
                  checked={hideReviewed}
                  onChange={() => setHideReviewed(!hideReviewed)}
                  className="h-5 w-5 text-blue-600 rounded"
                />
                <label htmlFor="hideReviewed" className="ml-2 text-gray-700 whitespace-nowrap">
                  {translations.hideReviewed[language]}
                </label>
              </div>
            </div>
          </div>
          
          {/* Mobile - Stack everything */}
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
            
            <div className="flex items-center h-10">
              <input
                id="hideReviewedMobile"
                type="checkbox"
                checked={hideReviewed}
                onChange={() => setHideReviewed(!hideReviewed)}
                className="h-5 w-5 text-blue-600 rounded"
              />
              <label htmlFor="hideReviewedMobile" className="ml-2 text-gray-700">
                {translations.hideReviewed[language]}
              </label>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 bg-gray-50 border-b">
          <h3 className="font-bold text-gray-700">
            {translations.clients[language]} ({filteredClients.length})
          </h3>
        </div>
        
        {filteredClients.length === 0 ? (
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
                      {translations.userEmail[language]}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {translations.date[language]} / {translations.status[language]}
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {translations.actions[language]}
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {translations.reviewStatus[language]}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredClients.map((client) => (
                    <tr key={client.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 w-[200px] align-middle">
                        <div className="text-sm font-medium text-gray-900 mb-1">
                          {client.user_name || '—'}
                          {client.status === 'incomplete' && (
                            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              !
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">
                          {client.user_phone || '—'}
                        </div>
                      </td>
                      <td className="px-6 py-4 w-[300px] align-middle">
                        <div className="text-sm text-gray-500">
                          {client.user_email || '—'}
                        </div>
                      </td>
                      <td className="px-6 py-4 w-[200px] align-middle">
                        <div className="text-sm text-gray-500 mb-1">
                          {formatDate(client.created_at)}
                        </div>
                        <div className={`text-sm font-medium ${
                          client.status === 'complete' ? 'text-green-600' : 
                          client.status === 'in_progress' ? 'text-blue-600' : 
                          'text-red-600'
                        }`}>
                          {statusTranslations[client.status][language]}
                        </div>
                      </td>
                      <td className="px-6 py-4 align-middle">
                        <div className="flex flex-col space-y-2">
                          <Link
                            to={`/results/grid/${client.id}?lang=${language}`}
                            className="px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm whitespace-nowrap inline-block h-10 flex items-center justify-center"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {language === 'ru' 
                              ? (client.coach?.button_text_ru || translations.viewResult[language])
                              : (client.coach?.button_text_kz || translations.viewResult[language])}
                          </Link>
                          <a
                            href={`https://wa.me/${client.user_phone?.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 text-sm whitespace-nowrap inline-block h-10 flex items-center justify-center"
                          >
                            {language === 'ru' ? 'Написать в WA' : 'Ватсапқа жазу'}
                          </a>
                        </div>
                      </td>
                      <td className="px-6 py-4 align-middle text-center">
                        <input
                          type="checkbox"
                          checked={client.review_status || false}
                          onChange={() => handleReviewStatusChange(client.id, !client.review_status)}
                          className="h-5 w-5 text-green-600 rounded"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Tablet view */}
            <div className="hidden md:grid lg:hidden grid-cols-2 gap-4 p-4">
              {filteredClients.map((client) => (
                <div key={client.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-center mb-2">
                    <div className="font-medium text-gray-900 break-words mb-2 min-h-[40px]">
                      {client.user_name || '—'}
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={client.review_status || false}
                        onChange={() => handleReviewStatusChange(client.id, !client.review_status)}
                        className="h-5 w-5 text-green-600 rounded"
                        aria-label={translations.reviewStatus[language]}
                      />
                      <Link
                        to={`/results/grid/${client.id}?lang=${language}`}
                        className="px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm whitespace-nowrap inline-block min-w-[140px] h-10 flex items-center justify-center"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {language === 'ru' 
                          ? (client.coach?.button_text_ru || translations.viewResult[language])
                          : (client.coach?.button_text_kz || translations.viewResult[language])}
                      </Link>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500 mb-1">
                    {client.user_email || '—'}
                  </div>
                  <div className="text-sm text-gray-500">
                    {formatDate(client.created_at)}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Mobile view */}
            <div className="md:hidden">
              {filteredClients.map((client) => (
                <div key={client.id} className="border-b border-gray-200 px-4 py-3">
                  <div className="flex justify-between items-center mb-2">
                    <div className="font-medium text-gray-900">
                      {client.user_name || '—'}
                    </div>
                    <div className="flex space-x-2">
                      <Link
                        to={`/results/grid/${client.id}?lang=${language}`}
                        className="px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm whitespace-nowrap inline-block min-w-[120px] h-10 flex items-center justify-center"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {language === 'ru' 
                          ? (client.coach?.button_text_ru || translations.viewResult[language])
                          : (client.coach?.button_text_kz || translations.viewResult[language])}
                      </Link>
                      <a
                        href={`https://wa.me/${client.user_phone?.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 text-sm whitespace-nowrap inline-block h-10 flex items-center justify-center"
                      >
                        {language === 'ru' ? 'WA' : 'WA'}
                      </a>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500 truncate mb-1">
                    {client.user_email || '—'}
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatDate(client.created_at)}
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

export default CoachDashboard;
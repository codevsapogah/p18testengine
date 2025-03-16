import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { LanguageContext } from '../../contexts/LanguageContext';
import { supabase } from '../../supabase';

const translations = {
  title: {
    ru: 'Управление коучами',
    kz: 'Коучтарды басқару'
  },
  addCoach: {
    ru: 'Добавить коуча',
    kz: 'Коуч қосу'
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
  role: {
    ru: 'Роль',
    kz: 'Рөлі'
  },
  admin: {
    ru: 'Администратор',
    kz: 'Әкімші'
  },
  coach: {
    ru: 'Коуч',
    kz: 'Коуч'
  },
  actions: {
    ru: 'Действия',
    kz: 'Әрекеттер'
  },
  edit: {
    ru: 'Редактировать',
    kz: 'Өңдеу'
  },
  delete: {
    ru: 'Удалить',
    kz: 'Жою'
  },
  searchPlaceholder: {
    ru: 'Поиск по имени, email или телефону',
    kz: 'Аты, email немесе телефон бойынша іздеу'
  },
  showAdmins: {
    ru: 'Показать администраторов',
    kz: 'Әкімшілерді көрсету'
  },
  noCoaches: {
    ru: 'Коучи не найдены',
    kz: 'Коучтар табылмады'
  },
  loading: {
    ru: 'Загрузка...',
    kz: 'Жүктелуде...'
  },
  confirmDelete: {
    ru: 'Вы уверены, что хотите удалить этого коуча?',
    kz: 'Бұл коучты шынымен жойғыңыз келе ме?'
  },
  backToDashboard: {
    ru: 'Вернуться к панели',
    kz: 'Панельге оралу'
  }
};

const CoachList = () => {
  const { language } = useContext(LanguageContext);
  
  const [coaches, setCoaches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAdmins, setShowAdmins] = useState(true);
  
  useEffect(() => {
    fetchCoaches();
  }, []);
  
  const fetchCoaches = async () => {
    try {
      const { data, error } = await supabase
        .from('approved_coaches')
        .select('*')
        .order('name', { ascending: true });
        
      if (error) throw error;
      
      setCoaches(data || []);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching coaches:', err);
      setError(err.message);
      setLoading(false);
    }
  };
  
  const handleDeleteCoach = async (id) => {
    if (window.confirm(translations.confirmDelete[language])) {
      try {
        const { error } = await supabase
          .from('approved_coaches')
          .delete()
          .eq('id', id);
          
        if (error) throw error;
        
        // Refresh the list
        fetchCoaches();
      } catch (err) {
        console.error('Error deleting coach:', err);
        setError(err.message);
      }
    }
  };
  
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };
  
  // Filter coaches based on search term and admin status
  const filteredCoaches = coaches.filter(coach => {
    const matchesSearch = 
      (coach.name && coach.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (coach.email && coach.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (coach.phone && coach.phone.includes(searchTerm));
    
    const matchesRoleFilter = showAdmins ? true : !coach.is_admin;
    
    return matchesSearch && matchesRoleFilter;
  });
  
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
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4 bg-blue-100 flex justify-between items-center">
        <h2 className="text-xl font-bold text-blue-800">
          {translations.title[language]}
        </h2>
        <Link
          to="/admin/dashboard"
          className="text-blue-600 hover:underline mr-4"
        >
          {translations.backToDashboard[language]}
        </Link>
      </div>
      
      <div className="p-4 border-b">
        <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
          <div className="w-full md:w-1/2">
            <input
              type="text"
              placeholder={translations.searchPlaceholder[language]}
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
          
          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={showAdmins}
                onChange={() => setShowAdmins(!showAdmins)}
                className="h-5 w-5 text-blue-600"
              />
              <span className="ml-2 text-gray-700">
                {translations.showAdmins[language]}
              </span>
            </label>
            
            <Link
              to="/admin/coaches/add"
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
            >
              {translations.addCoach[language]}
            </Link>
          </div>
        </div>
      </div>
      
      {filteredCoaches.length === 0 ? (
        <div className="p-6 text-center text-gray-500">
          {translations.noCoaches[language]}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {translations.name[language]}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {translations.email[language]}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {translations.phone[language]}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {translations.role[language]}
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {translations.actions[language]}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCoaches.map((coach) => (
                <tr key={coach.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {coach.name || '—'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {coach.email || '—'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {coach.phone || '—'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      coach.is_admin 
                        ? 'bg-purple-100 text-purple-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {coach.is_admin 
                        ? translations.admin[language] 
                        : translations.coach[language]}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex justify-center space-x-2">
                      <Link
                        to={`/admin/coaches/edit/${coach.id}`}
                        className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm"
                      >
                        {translations.edit[language]}
                      </Link>
                      <button
                        onClick={() => handleDeleteCoach(coach.id)}
                        className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 text-sm"
                      >
                        {translations.delete[language]}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CoachList;
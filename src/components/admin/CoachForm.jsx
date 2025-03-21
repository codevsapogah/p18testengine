import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { LanguageContext } from '../../contexts/LanguageContext';
import { supabase } from '../../supabase';

const translations = {
  addCoach: {
    ru: 'Добавить коуча',
    kz: 'Коуч қосу'
  },
  editCoach: {
    ru: 'Редактировать коуча',
    kz: 'Коучты өңдеу'
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
    ru: 'Телефон (необязательно)',
    kz: 'Телефон (міндетті емес)'
  },
  password: {
    ru: 'Пароль',
    kz: 'Құпия сөз'
  },
  isAdmin: {
    ru: 'Назначить администратором',
    kz: 'Әкімші ретінде тағайындау'
  },
  save: {
    ru: 'Сохранить',
    kz: 'Сақтау'
  },
  cancel: {
    ru: 'Отмена',
    kz: 'Болдырмау'
  },
  loading: {
    ru: 'Загрузка...',
    kz: 'Жүктелуде...'
  },
  saveSuccess: {
    ru: 'Коуч успешно сохранен',
    kz: 'Коуч сәтті сақталды'
  },
  error: {
    ru: 'Ошибка',
    kz: 'Қате'
  },
  backToList: {
    ru: 'Вернуться к списку',
    kz: 'Тізімге оралу'
  }
};

const CoachForm = () => {
  const { language } = useContext(LanguageContext);
  const navigate = useNavigate();
  const { id } = useParams(); // If id exists, we're editing a coach
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    is_admin: false,
    button_text_ru: '',
    button_text_kz: ''
  });
  
  const [loading, setLoading] = useState(id ? true : false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Load coach data if editing
  useEffect(() => {
    if (id) {
      const fetchCoach = async () => {
        try {
          const { data, error } = await supabase
            .from('approved_coaches')
            .select('*')
            .eq('id', id)
            .single();
            
          if (error) throw error;
          
          if (data) {
            setFormData({
              name: data.name || '',
              email: data.email || '',
              phone: data.phone || '',
              password: data.password || '',
              is_admin: data.is_admin || false,
              button_text_ru: data.button_text_ru || '',
              button_text_kz: data.button_text_kz || ''
            });
          }
          
          setLoading(false);
        } catch (err) {
          console.error('Error fetching coach:', err);
          setError(err.message);
          setLoading(false);
        }
      };
      
      fetchCoach();
    }
  }, [id]);
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);
    
    try {
      // Validate form
      if (!formData.name || !formData.email || !formData.password) {
        throw new Error('Please fill in all required fields');
      }
      
      // Check if email is already in use (for new coaches)
      if (!id) {
        const { data: existingCoach, error: checkError } = await supabase
          .from('approved_coaches')
          .select('id')
          .eq('email', formData.email)
          .single();
          
        if (checkError && checkError.code !== 'PGRST116') throw checkError;
        
        if (existingCoach) {
          throw new Error('Email is already in use');
        }
      }
      
      // Save to Supabase
      if (id) {
        // Update existing coach
        const { error: updateError } = await supabase
          .from('approved_coaches')
          .update({
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            password: formData.password,
            is_admin: formData.is_admin,
            button_text_ru: formData.button_text_ru,
            button_text_kz: formData.button_text_kz
          })
          .eq('id', id);
          
        if (updateError) throw updateError;
      } else {
        // Add new coach
        const { error: insertError } = await supabase
          .from('approved_coaches')
          .insert([{
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            password: formData.password,
            is_admin: formData.is_admin,
            button_text_ru: formData.button_text_ru,
            button_text_kz: formData.button_text_kz
          }]);
          
        if (insertError) throw insertError;
      }
      
      setSuccess(translations.saveSuccess[language]);
      
      // Redirect after a brief delay
      setTimeout(() => {
        navigate('/admin/coaches');
      }, 1500);
    } catch (err) {
      console.error('Error saving coach:', err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-600">{translations.loading[language]}</p>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4 bg-blue-100 flex justify-between items-center">
        <h2 className="text-xl font-bold text-blue-800">
          {id ? translations.editCoach[language] : translations.addCoach[language]}
        </h2>
        <button
          onClick={() => navigate('/admin/coaches')}
          className="text-blue-600 hover:underline"
        >
          {translations.backToList[language]}
        </button>
      </div>
      
      <div className="p-6">
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {translations.error[language]}: {error}
          </div>
        )}
        
        {success && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
            {success}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="name">
              {translations.name[language]} *
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="email">
              {translations.email[language]} *
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="phone">
              {translations.phone[language]}
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 mb-2" htmlFor="password">
              {translations.password[language]} *
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-800"
              >
                {showPassword ? "🔒" : "👁️"}
              </button>
            </div>
          </div>
          
          <div className="mb-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="is_admin"
                checked={formData.is_admin}
                onChange={handleChange}
                className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-gray-700">
                {translations.isAdmin[language]}
              </span>
            </label>
          </div>
          
          {/* Custom Button Text Fields */}
          <div className="col-span-6">
            <label htmlFor="button_text_ru" className="block text-sm font-medium text-gray-700">
              Текст кнопки (Русский)
            </label>
            <input
              type="text"
              name="button_text_ru"
              id="button_text_ru"
              value={formData.button_text_ru}
              onChange={handleChange}
              placeholder="Пользовательский текст для кнопки на русском"
              className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
            />
            <p className="mt-1 text-sm text-gray-500">
              Пользовательский текст для кнопки "Записаться на разбор с коучем" на русском
            </p>
          </div>

          <div className="col-span-6">
            <label htmlFor="button_text_kz" className="block text-sm font-medium text-gray-700">
              Түйме мәтіні (Қазақша)
            </label>
            <input
              type="text"
              name="button_text_kz"
              id="button_text_kz"
              value={formData.button_text_kz}
              onChange={handleChange}
              placeholder="Қазақша түйменің арнаулы мәтіні"
              className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
            />
            <p className="mt-1 text-sm text-gray-500">
              "Коучпен консультацияға жазылу" түймесінің арнаулы мәтіні қазақша
            </p>
          </div>
          
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/admin/coaches')}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              {translations.cancel[language]}
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-blue-300"
            >
              {saving ? translations.loading[language] : translations.save[language]}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CoachForm;
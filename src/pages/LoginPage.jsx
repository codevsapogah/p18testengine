import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LanguageContext } from '../contexts/LanguageContext';
import AuthContext from '../contexts/AuthContext';
import LanguageToggle from '../components/common/LanguageToggle';

const translations = {
  title: {
    ru: 'Добро пожаловать',
    kz: 'Қош келдіңіз'
  },
  coachPortal: {
    ru: 'Портал коуча',
    kz: 'Коуч порталы'
  },
  adminPortal: {
    ru: 'Панель администратора',
    kz: 'Әкімші панелі'
  },
  email: {
    ru: 'Электронная почта',
    kz: 'Электрондық пошта'
  },
  password: {
    ru: 'Пароль',
    kz: 'Құпия сөз'
  },
  login: {
    ru: 'Войти',
    kz: 'Кіру'
  },
  backToHome: {
    ru: 'Вернуться на главную',
    kz: 'Басты бетке қайту'
  },
  invalidCredentials: {
    ru: 'Неверные учетные данные',
    kz: 'Қате логин немесе құпия сөз'
  }
};

const LoginPage = () => {
  const { language } = useContext(LanguageContext);
  const { login, isAuthenticated, role } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Determine if this is admin login or coach login
  const isAdminLogin = location.pathname.includes('/admin');
  
  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated()) {
      if (role === 'admin') {
        navigate('/admin/dashboard');
      } else if (role === 'coach') {
        navigate('/coach/dashboard');
      }
    }
  }, [isAuthenticated, role, navigate]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const result = await login(email, password);
      
      if (result.success) {
        // If on admin login page, only admins can login
        if (isAdminLogin && !result.is_admin) {
          setError('You do not have admin privileges');
          setLoading(false);
          return;
        }
        
        // Respect the login origin
        if (isAdminLogin) {
          navigate('/admin/dashboard');
        } else {
          navigate('/coach/dashboard');
        }
      } else {
        setError(result.error || translations.invalidCredentials[language]);
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 bg-blue-500 text-white flex items-center">
          <div className="flex-1">
            <h1 className="text-xl font-bold">
              {isAdminLogin ? translations.adminPortal[language] : translations.coachPortal[language]}
            </h1>
          </div>
          <div className="flex-1 flex justify-center">
            <LanguageToggle />
          </div>
          <div className="flex-1"></div>
        </div>
        
        <div className="p-6">
          <h2 className="text-2xl font-bold text-center mb-6">
            {translations.title[language]}
          </h2>
          
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="email">
                {translations.email[language]}
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-gray-700 mb-2" htmlFor="password">
                {translations.password[language]}
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition duration-200 disabled:bg-blue-300"
            >
              {loading ? '...' : translations.login[language]}
            </button>
          </form>
          
          <div className="mt-4 text-center">
            <a 
              href="/"
              className="text-blue-500 hover:underline"
            >
              {translations.backToHome[language]}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
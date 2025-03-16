import React, { useContext, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LanguageContext } from '../../contexts/LanguageContext';
import AuthContext from '../../contexts/AuthContext';
import LanguageToggle from './LanguageToggle';
import logo from '../../assets/logo192.png';
import { supabase } from '../../supabase';

const translations = {
  forCoaches: {
    ru: 'Для коучей',
    kz: 'Коучтарға'
  },
  forAdmins: {
    ru: 'Для администраторов',
    kz: 'Әкімшілерге'
  },
  dashboard: {
    ru: 'Панель управления',
    kz: 'Басқару панелі'
  },
  logout: {
    ru: 'Выйти',
    kz: 'Шығу'
  },
  login: {
    ru: 'Войти',
    kz: 'Кіру'
  }
};

const Header = () => {
  const { language } = useContext(LanguageContext);
  const { isAuthenticated, role, user, logout } = useContext(AuthContext);
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const showCoachButton = searchParams.has('coach');
  const showAdminButton = searchParams.has('admin');
  const [displayName, setDisplayName] = useState(null);
  
  // Fetch name from approved_coaches table if needed
  useEffect(() => {
    if (user && user.email && !user.name && (role === 'admin' || role === 'coach')) {
      const fetchCoachName = async () => {
        try {
          const { data } = await supabase
            .from('approved_coaches')
            .select('name')
            .ilike('email', user.email.toLowerCase())
            .single();
            
          if (data && data.name) {
            console.log('Found name in approved_coaches:', data.name);
            setDisplayName(data.name);
          }
        } catch (err) {
          console.error('Error fetching coach name:', err);
        }
      };
      
      fetchCoachName();
    } else if (user && user.name) {
      setDisplayName(user.name);
    }
  }, [user, role]);
  
  // Format for display: use displayName if available, otherwise fall back to user?.name or user?.email
  const userDisplayName = displayName || user?.name || user?.email;
  
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
        {/* Desktop view (large screens) */}
        <div className="hidden lg:grid lg:grid-cols-3 lg:items-center">
          {/* Left: Logo */}
          <div className="justify-self-start">
            <Link to="/" className="flex items-center">
              <img src={logo} alt="P18" className="h-8 w-auto" />
            </Link>
          </div>
          
          {/* Middle: Language Toggle */}
          <div className="justify-self-center">
            <LanguageToggle />
          </div>
          
          {/* Right: User Info */}
          <div className="justify-self-end flex items-center space-x-4">
            {isAuthenticated() ? (
              <div className="flex items-center space-x-4">
                <span className="text-gray-600 max-w-[160px] truncate">
                  {userDisplayName}
                </span>
                
                {role === 'admin' && (
                  <Link 
                    to="/admin/dashboard" 
                    className="text-blue-600 hover:text-blue-800 whitespace-nowrap"
                  >
                    {translations.dashboard[language]}
                  </Link>
                )}
                
                {role === 'coach' && (
                  <Link 
                    to="/coach/dashboard" 
                    className="text-blue-600 hover:text-blue-800 whitespace-nowrap"
                  >
                    {translations.dashboard[language]}
                  </Link>
                )}
                
                <button
                  onClick={logout}
                  className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 whitespace-nowrap"
                >
                  {translations.logout[language]}
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                {showCoachButton && (
                  <Link to="/coach/login" className="text-blue-600 hover:text-blue-800 whitespace-nowrap">
                    {translations.forCoaches[language]}
                  </Link>
                )}
                {showAdminButton && (
                  <Link to="/admin/login" className="text-blue-600 hover:text-blue-800 whitespace-nowrap">
                    {translations.forAdmins[language]}
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Tablet view */}
        <div className="hidden md:flex md:flex-col lg:hidden">
          {/* Top row: Logo and language toggle, user name */}
          <div className="flex items-center mb-3">
            <div className="flex items-center">
              <Link to="/" className="flex items-center mr-4">
                <img src={logo} alt="P18" className="h-8 w-auto" />
              </Link>
              <LanguageToggle />
            </div>
            {isAuthenticated() && (
              <span className="text-gray-600 max-w-[200px] truncate text-right ml-auto">
                {userDisplayName}
              </span>
            )}
          </div>
          
          {/* Bottom row: Dashboard link and logout button */}
          <div className="flex justify-end items-center">
            {isAuthenticated() && (
              <div className="flex items-center space-x-4">
                {role === 'admin' && (
                  <Link 
                    to="/admin/dashboard" 
                    className="text-blue-600 hover:text-blue-800 whitespace-nowrap"
                  >
                    {translations.dashboard[language]}
                  </Link>
                )}
                
                {role === 'coach' && (
                  <Link 
                    to="/coach/dashboard" 
                    className="text-blue-600 hover:text-blue-800 whitespace-nowrap"
                  >
                    {translations.dashboard[language]}
                  </Link>
                )}
                
                <button
                  onClick={logout}
                  className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 whitespace-nowrap"
                >
                  {translations.logout[language]}
                </button>
              </div>
            )}
            {!isAuthenticated() && (
              <div className="flex items-center space-x-4">
                {showCoachButton && (
                  <Link to="/coach/login" className="text-blue-600 hover:text-blue-800 whitespace-nowrap">
                    {translations.forCoaches[language]}
                  </Link>
                )}
                {showAdminButton && (
                  <Link to="/admin/login" className="text-blue-600 hover:text-blue-800 whitespace-nowrap">
                    {translations.forAdmins[language]}
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Mobile view */}
        <div className="flex flex-col md:hidden">
          {/* Line 1: Logo and User Name */}
          <div className="flex justify-between items-center mb-3">
            <Link to="/" className="flex items-center">
              <img src={logo} alt="P18" className="h-8 w-auto" />
            </Link>
            
            {isAuthenticated() && (
              <span className="text-gray-600 max-w-[160px] truncate text-right">
                {userDisplayName}
              </span>
            )}
          </div>
          
          {/* Line 2: Language toggle | Logout button */}
          <div className="flex justify-between items-center">
            <div>
              <LanguageToggle />
            </div>
            
            {isAuthenticated() ? (
              <>
                <div className="flex-1 text-center">
                  {role === 'admin' && (
                    <Link 
                      to="/admin/dashboard" 
                      className="text-blue-600 hover:text-blue-800 whitespace-nowrap"
                    >
                      {translations.dashboard[language]}
                    </Link>
                  )}
                  
                  {role === 'coach' && (
                    <Link 
                      to="/coach/dashboard" 
                      className="text-blue-600 hover:text-blue-800 whitespace-nowrap"
                    >
                      {translations.dashboard[language]}
                    </Link>
                  )}
                </div>
                
                <div className="flex-none">
                  <button
                    onClick={logout}
                    className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 whitespace-nowrap"
                  >
                    {translations.logout[language]}
                  </button>
                </div>
              </>
            ) : (
              <div className="flex space-x-4 ml-auto">
                {showCoachButton && (
                  <Link to="/coach/login" className="text-blue-600 hover:text-blue-800 whitespace-nowrap">
                    {translations.forCoaches[language]}
                  </Link>
                )}
                {showAdminButton && (
                  <Link to="/admin/login" className="text-blue-600 hover:text-blue-800 whitespace-nowrap">
                    {translations.forAdmins[language]}
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../supabase';
import { LanguageContext } from '../../contexts/LanguageContext';
import InputMask from 'react-input-mask';

const translations = {
  title: {
    ru: 'Тест Р18',
    kz: 'Р18 тесті'
  },
  languageSelect: {
    ru: 'Выберите язык',
    kz: 'Тілді таңдаңыз'
  },
  russian: {
    ru: 'Русский',
    kz: 'Орысша'
  },
  kazakh: {
    ru: 'На русском',
    kz: 'Қазақша'
  },
  name: {
    ru: 'Ваше имя',
    kz: 'Атыңыз'
  },
  phone: {
    ru: 'Номер телефона',
    kz: 'Телефон нөірі'
  },
  email: {
    ru: 'Ваш email',
    kz: 'Сіздің поштаңыз'
  },
  coachEmail: {
    ru: 'Коуч email',
    kz: 'Коуч поштасы'
  },
  startTest: {
    ru: 'Начать тест',
    kz: 'Тестті бастау'
  },
  phonePlaceholder: {
    ru: '+7 (___) ___-____',
    kz: '+7 (___) ___-____'
  },
  emailPlaceholder: {
    ru: 'user@email.com',
    kz: 'user@email.com'
  },
  coachEmailPlaceholder: {
    ru: 'coach@email.com',
    kz: 'coach@email.com'
  },
  consent: {
    ru: 'Результаты тестирования будут отправлены вам и вашему коучу по электронной почте. Важно понимать, что тесты не диагностируют наличие расстройств или отклонений. Только профессиональный коуч, прошедший специальную подготовку, может правильно интерпретировать эти результаты. Некорректное толкование может привести к ошибочным выводам. На следующей встрече ваш коуч поможет вам разобраться в результатах и определить оптимальное направление для дальнейшей работы.\n\nПоставив галочку вы соглашаетесь с тем, что мы отправим ваши результаты на указанную вами почту и вашему коучу, а также напишем по указанному телефону в рамках промо-рассылок.',
    kz: 'Тестілеу нәтижелері сізге және сіздің коучыңызға электронды пошта арқылы жіберіледі. Тесттер бұзылыстарды немесе ауытқуларды анықтамайтынын түсіну маңызды. Бұл нәтижелерді тек арнайы дайындықтан өткен кәсіби коуч қана дұрыс түсіндіре алады. Дұрыс емес түсіндіру қате қорытындыларға әкелуі мүмкін. Келесі кездесуде сіздің коучыңыз сізге нәтижелерді түсінуге және әрі қарай жұмыс істеудің тиімді бағытын анықтауға көмектеседі.\n\nҚұсбелгі қойып, біз сіздің нәтижелеріңізді көрсетілген электрондық поштаға және сіздің коучыңызға жіберетінімізге, сондай-ақ промо-хабарламалар аясында көрсетілген телефон нөміріне жазатынымызға келісесіз.'
  }
};

const UserForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { language } = useContext(LanguageContext);
  
  const params = new URLSearchParams(location.search);
  const coachEmailFromURL = params.get('coach') || 'kmektepbergen@gmail.com';
  
  const [formData, setFormData] = useState({
    user_name: '',
    user_phone: '',
    user_email: '',
    coach_email: coachEmailFromURL
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [consentChecked, setConsentChecked] = useState(false);
  const [buttonProgress, setButtonProgress] = useState(0);
  const [buttonReady, setButtonReady] = useState(false);
  
  useEffect(() => {
    let interval;
    if (consentChecked && !buttonReady) {
      setButtonProgress(0);
      interval = setInterval(() => {
        setButtonProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setButtonReady(true);
            return 100;
          }
          return prev + 2; // Increase by 2% every 100ms to complete in ~5 seconds
        });
      }, 100);
    } else if (!consentChecked) {
      setButtonProgress(0);
      setButtonReady(false);
    }
    
    return () => clearInterval(interval);
  }, [consentChecked, buttonReady]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!consentChecked || !buttonReady) {
      return;
    }
    setLoading(true);
    setError('');
    
    try {
      // First, try to find existing user or create new one
      const { data: existingUser, error: userLookupError } = await supabase
        .from('users')
        .select('id')
        .eq('email', formData.user_email)
        .single();

      let userId;
      
      if (userLookupError) {
        // User doesn't exist, create new one
        const { data: newUser, error: createUserError } = await supabase
          .from('users')
          .insert([{ 
            email: formData.user_email
          }])
          .select('id')
          .single();
          
        if (createUserError) throw createUserError;
        userId = newUser.id;
      } else {
        userId = existingUser.id;
      }

      // Add entry to user_details_history
      const { error: historyError } = await supabase
        .from('user_details_history')
        .insert([{
          user_id: userId,
          name: formData.user_name,
          phone: formData.user_phone
        }]);

      if (historyError) {
        console.error('Error saving user details history:', historyError);
      }

      const sessionId = Math.random().toString(36).substring(2, 15);
      
      // Get coach ID from email
      const { data: coachData, error: coachError } = await supabase
        .from('approved_coaches')
        .select('id')
        .eq('email', formData.coach_email)
        .single();
        
      if (coachError) throw coachError;

      const { error: quizError } = await supabase
        .from('quiz_results')
        .insert([
          { 
            id: sessionId,
            user_id: userId,
            coach_id: coachData.id,
            created_at: new Date(),
            is_random: false,
            answers: {},
            language: language,
            entered_name: formData.user_name,  // Store the entered name with the quiz result
            entered_phone: formData.user_phone  // Store the entered phone with the quiz result
          }
        ]);
        
      console.log('Saving quiz result:', {
        sessionId,
        userId,
        coachId: coachData.id,
        name: formData.user_name,
        phone: formData.user_phone
      });
        
      if (quizError) {
        console.error('Error saving quiz result:', quizError);
        throw quizError;
      }
      
      localStorage.setItem('quiz_session_id', sessionId);
      navigate('/test');
      
    } catch (err) {
      console.error('Error registering user:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">
        {translations.title[language]}
      </h1>
      
      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">
            {translations.name[language]}
          </label>
          <input
            type="text"
            name="user_name"
            value={formData.user_name}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded-md"
            placeholder={translations.name[language]}
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">
            {translations.phone[language]}
          </label>
          <InputMask
            mask="+7 (999) 999-9999"
            value={formData.user_phone}
            onChange={handleChange}
            type="tel"
            name="user_phone"
            required
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-700 mb-2">
            {translations.email[language]}
          </label>
          <input
            type="email"
            name="user_email"
            value={formData.user_email}
            onChange={handleChange}
            placeholder="example@email.com"
            required
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>
        
        <div className="mb-6">
          <label className="flex items-start space-x-2">
            <input
              type="checkbox"
              checked={consentChecked}
              onChange={(e) => setConsentChecked(e.target.checked)}
              required
              className="mt-1"
            />
            <span className="text-xs text-gray-600">
              {translations.consent[language]}
            </span>
          </label>
        </div>
        
        <div className="relative">
          <button
            type="submit"
            disabled={loading || !buttonReady}
            className={`w-full py-2 px-4 rounded-md transition-all duration-200 overflow-hidden relative ${
              !consentChecked 
                ? 'bg-gray-300 cursor-not-allowed' 
                : buttonReady 
                  ? 'bg-blue-500 text-white hover:bg-blue-600'
                  : 'bg-gray-200 text-gray-700 cursor-wait'
            }`}
          >
            {consentChecked && !buttonReady && (
              <div 
                className="absolute top-0 left-0 h-full bg-blue-500"
                style={{ 
                  width: `${buttonProgress}%`, 
                  transition: 'width 0.1s linear',
                  zIndex: '0'
                }}
              />
            )}
            <span className="relative z-10">{loading ? '...' : translations.startTest[language]}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserForm;
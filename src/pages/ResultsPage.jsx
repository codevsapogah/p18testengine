import React, { useState, useEffect, useContext, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { LanguageContext } from '../contexts/LanguageContext';
import { supabase } from '../supabase';
import { getQuizSession, createPermalink, getResultsByPermalink } from '../utils/apiService';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import Loading from '../components/common/Loading';
import { getScoreLevel, levelColors, levelTextColors, levelTranslations, programs } from '../data/programs';
import programData from '../data/programData';
import { questions } from '../data/questions';
import { generateGridPDF } from '../utils/gridpdf';
import { generateListPDF } from '../utils/listpdf';
import { useQuery } from '@tanstack/react-query';
import { sendResultsEmail, sendTestEmail } from '../utils/emailService';
import { createSafeFilename } from '../utils/pdfUtils';

// Format date as: day monthName year
const formatDate = (dateStr, language) => {
  const date = new Date(dateStr);
  const day = date.getDate();
  const year = date.getFullYear();
  
  const monthsRu = [
    'января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 
    'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
  ];
  
  const monthsKz = [
    'қаңтар', 'ақпан', 'наурыз', 'сәуір', 'мамыр', 'маусым', 
    'шілде', 'тамыз', 'қыркүйек', 'қазан', 'қараша', 'желтоқсан'
  ];
  
  const month = language === 'ru' ? monthsRu[date.getMonth()] : monthsKz[date.getMonth()];
  const suffix = language === 'ru' ? ' г.' : ' ж.';
  
  return `${day} ${month} ${year}${suffix}`;
};

const translations = {
  title: {
    ru: 'Высокие результаты',
    kz: 'Жоғары нәтижелер'
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
    ru: 'Результаты не найдены',
    kz: 'Нәтижелер табылмады'
  },
  incompleteTest: {
    ru: 'Тест не завершен',
    kz: 'Тест аяқталмаған'
  },
  incompleteMessage: {
    ru: 'Пользователь остановился на вопросе {questionNum} из 90. Ответил на {answeredCount} вопросов. Необходимо пройти тест заново, чтобы получить результаты.',
    kz: 'Қолданушы 90 сұрақтың {questionNum}-ші сұрағында тоқтады. {answeredCount} сұраққа жауап берді. Нәтижелерді алу үшін тестті қайта тапсыру қажет.'
  },
  return: {
    ru: 'Вернуться на главную',
    kz: 'Басты бетке оралу'
  },
  reload: {
    ru: 'Перезагрузить',
    kz: 'Қайта жүктеу'
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
  promo: {
    ru: '❗️ Каждая из этих программ незаметно разрушает вашу жизнь, блокирует доход и мешает построить счастливые отношения. Но хорошая новость - эти программы можно перезаписать! Запишитесь на консультацию, чтобы узнать, как освободиться от этих блоков и начать жить полной жизнью.',
    kz: '❗️ Әр бағдарлама байқаусыз өміріңізді құртып, табысыңызды шектеп, бақытты қарым-қатынас құруға кедергі келтіреді. Бірақ жақсы жаңалық - бұл бағдарламаларды өзгертуге болады! Осы кедергілерден қалай құтылып, толыққанды өмір сүруді бастауға болатынын білу үшін кеңеске жазылыңыз.'
  },
  consultation: {
    ru: 'Записаться на разбор с коучем',
    kz: 'Коучпен консультацияға жазылу'
  },
  sentToEmail: {
    ru: 'Результаты теста отправлены на ваш email и email коуча.',
    kz: 'Тест нәтижелері сіздің email-ге және коучтың email-не жіберілді.'
  },
  permalink: {
    ru: 'Постоянная ссылка',
    kz: 'Тұрақты сілтеме'
  },
  allResults: {
    ru: 'Все результаты',
    kz: 'Барлық нәтижелер'
  },
  userEmail: {
    ru: 'Email пользователя',
    kz: 'Қолданушы email'
  },
  coachEmail: {
    ru: 'Коуч',
    kz: 'Коуч'
  },
  program: {
    ru: 'Программа',
    kz: 'Бағдарлама'
  },
  score: {
    ru: 'Балл',
    kz: 'Балл'
  },
  category: {
    ru: 'Категория',
    kz: 'Санат'
  },
  categories: {
    reduced: {
      ru: 'Пониженный',
      kz: 'Төмендетілген'
    },
    average: {
      ru: 'Средний',
      kz: 'Орташа'
    },
    increased: {
      ru: 'Повышенный',
      kz: 'Жоғарылатылған'
    },
    high: {
      ru: 'Высокий',
      kz: 'Жоғары'
    }
  },
  emailSent: {
    ru: 'Результаты теста отправлены на ваш email и email коуча',
    kz: 'Тест нәтижелері сіздің email-ге және коучтың email-не жіберілді'
  },
  permalinkLabel: {
    ru: 'Постоянная ссылка:',
    kz: 'Тұрақты сілтеме:'
  },
  testInProgress: {
    ru: 'Тест в процессе прохождения',
    kz: 'Тест үдерісі жүріп жатыр'
  },
  inProgressMessage: {
    ru: 'Пользователь все еще проходит тест. Результаты будут доступны после завершения теста.',
    kz: 'Қолданушы әлі тестті өтіп жатыр. Нәтижелер тест аяқталғаннан кейін қол жетімді болады.'
  },
  sendTestEmail: {
    ru: 'Отправить тестовое письмо',
    kz: 'Тест хатын жіберу'
  },
  emailError: {
    ru: 'Ошибка отправки',
    kz: 'Жіберу қатесі'
  },
  resultsTitle: {
    ru: 'вот ваши результаты теста P18',
    kz: 'сіздің P18 тестінің нәтижелері'
  },
  coach: {
    ru: 'Коуч',
    kz: 'Коуч'
  }
};

// GridView component
const GridViewComponent = ({ sortedPrograms, highScorePrograms, language, onProgramClick }) => {
  return (
    <>
      {/* High scores section */}
      <h2 className="text-2xl font-semibold mb-4 text-center">
        {translations.title[language]}
      </h2>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 mb-10">
        {highScorePrograms.map(program => (
          <div key={program.id} onClick={() => onProgramClick(program.id)}>
            <div
              className="aspect-square rounded-lg shadow-md transform hover:scale-105 transition-all duration-200 p-3 flex flex-col relative cursor-pointer"
              style={{ backgroundColor: levelColors[program.level] }}
            >
              <div className="flex flex-col items-center justify-center h-full">
                {/* Percentage */}
                <div className="text-3xl sm:text-5xl font-bold mb-3" style={{ color: levelTextColors[program.level] }}>
                  {Math.round(program.score)}%
                </div>
                
                {/* Level pill */}
                <div className="text-xs font-medium border rounded-full px-3 py-0.5 mb-3" 
                  style={{ 
                    color: levelTextColors[program.level],
                    borderColor: levelTextColors[program.level]
                  }}>
                  {levelTranslations[program.level][language]}
                </div>
                
                {/* Program name */}
                <div className="text-xs sm:text-sm text-center leading-tight" style={{ color: levelTextColors[program.level] }}>
                  {program[language]}
                </div>
              </div>
              
              <span className="absolute bottom-2 right-2 opacity-70 hover:opacity-100 text-lg" style={{ color: levelTextColors[program.level] }}>
                ⓘ
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* All results section */}
      <h2 className="text-2xl font-semibold mb-4 text-center">
        {translations.allResults[language]}
      </h2>
      
      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
        {sortedPrograms.map(program => (
          <div key={program.id} onClick={() => onProgramClick(program.id)}>
            <div
              className="aspect-square rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 p-2 flex flex-col relative cursor-pointer"
              style={{ backgroundColor: levelColors[program.level] }}
            >
              <div className="flex flex-col items-center justify-center h-full">
                {/* Percentage */}
                <div className="text-2xl sm:text-3xl font-bold mb-2" style={{ color: levelTextColors[program.level] }}>
                  {Math.round(program.score)}%
                </div>
                
                {/* Level pill */}
                <div className="text-[10px] font-medium border rounded-full px-2 py-0.5 mb-2" 
                  style={{ 
                    color: levelTextColors[program.level],
                    borderColor: levelTextColors[program.level]
                  }}>
                  {levelTranslations[program.level][language]}
                </div>
                
                {/* Program name */}
                <div className="text-[10px] sm:text-xs text-center leading-tight" style={{ color: levelTextColors[program.level] }}>
                  {program[language]}
                </div>
              </div>
              
              <span className="absolute bottom-1 right-1 opacity-70 hover:opacity-100 text-sm" style={{ color: levelTextColors[program.level] }}>
                ⓘ
              </span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

// ListView component
const ListViewComponent = ({ sortedPrograms, highScorePrograms, language, onProgramClick }) => {
  const [expandedListItems, setExpandedListItems] = useState({});
  
  const toggleListItem = (id) => {
    setExpandedListItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };
  
  return (
    <>
      {/* High scores section */}
      <h2 className="text-2xl font-semibold mb-4 text-center">
        {translations.title[language]}
      </h2>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 mb-10">
        {highScorePrograms.map(program => (
          <div key={program.id} onClick={() => onProgramClick(`high_${program.id}`)}>
            <div
              className="aspect-square rounded-lg shadow-md transform hover:scale-105 transition-all duration-200 p-3 flex flex-col relative cursor-pointer"
              style={{ backgroundColor: levelColors[program.level] }}
            >
              <div className="flex flex-col items-center justify-center h-full">
                {/* Percentage */}
                <div className="text-3xl sm:text-5xl font-bold mb-3" style={{ color: levelTextColors[program.level] }}>
                  {Math.round(program.score)}%
                </div>
                
                {/* Level pill */}
                <div className="text-xs font-medium border rounded-full px-3 py-0.5 mb-3" 
                  style={{ 
                    color: levelTextColors[program.level],
                    borderColor: levelTextColors[program.level]
                  }}>
                  {levelTranslations[program.level][language]}
                </div>
                
                {/* Program name */}
                <div className="text-xs sm:text-sm text-center leading-tight" style={{ color: levelTextColors[program.level] }}>
                  {program[language]}
                </div>
              </div>
              
              <span className="absolute bottom-2 right-2 opacity-70 hover:opacity-100 text-lg" style={{ color: levelTextColors[program.level] }}>
                ⓘ
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* All results section */}
      <h2 className="text-2xl font-semibold mb-4 text-center">
        {translations.allResults[language]}
      </h2>

      <div className="space-y-3">
        {sortedPrograms.map(program => {
          const isExpanded = expandedListItems[program.id];
          const details = programData.find(p => p.id === program.id);
          
          return (
            <div key={program.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="flex flex-col md:flex-row items-start md:items-center p-4">
                <div className="flex-1 w-full md:w-auto mb-3 md:mb-0">
                  <div className="flex items-center justify-between md:justify-start">
                    <div className="flex items-center">
                      <button 
                        onClick={() => toggleListItem(program.id)}
                        className="mr-2 text-gray-400 hover:text-gray-600 transition-transform duration-200"
                        style={{ transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)' }}
                      >
                        ▶
                      </button>
                      <span className="text-lg">{program[language]}</span>
                    </div>
                    <div className="md:hidden text-lg">
                      {Math.round(program.score)}%
                    </div>
                  </div>
                </div>
                
                <div className="flex-1 w-full md:w-auto flex flex-col md:flex-row md:items-center">
                  <div className="w-full md:w-[500px] bg-gray-200 rounded-full h-4 mb-3 md:mb-0">
                    <div
                      className="h-4 rounded-full"
                      style={{
                        width: `${program.score}%`,
                        backgroundColor: levelColors[program.level]
                      }}
                    />
                  </div>
                  
                  <div className="w-16 text-right text-lg hidden md:block ml-4">
                    {Math.round(program.score)}%
                  </div>
                  
                  <div
                    className="w-full md:w-32 px-3 py-1 rounded-full text-center text-sm md:ml-4 flex items-center justify-center"
                    style={{ 
                      backgroundColor: levelColors[program.level],
                      color: program.level === 'medium' ? '#000' : 'white'
                    }}
                  >
                    {levelTranslations[program.level][language]}
                  </div>
                </div>
              </div>
              
              {/* Expandable content */}
              {isExpanded && details && (
                <div>
                  {/* Description */}
                  <div className="bg-blue-50 p-4 whitespace-pre-line border-t border-blue-100">
                    {details.description[language]}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
};

// Fetch quiz result function - updated to support permalinks
const fetchQuizResult = async (id, searchParams) => {
  // Check if the ID is a permalink token (40 characters long)
  const isPermalink = id && id.length >= 40;
  
  try {
    let rawData;
    
    if (isPermalink) {
      // Fetch results using the permalink token
      console.log('Using permalink token to fetch results:', id);
      rawData = await getResultsByPermalink(id);
    } else {
      // Fetch results using the session ID
      console.log('Using session ID to fetch results:', id);
      rawData = await getQuizSession(id);
    }
    
    console.log('Raw data fetched:', rawData ? `ID: ${rawData.id}` : 'No data');
    
    if (!rawData) {
      throw new Error('No data returned from API');
    }
    
    // Process raw answers into scores if needed
    let processedData;
    
    // If we have calculated_results, extract scores
    if (rawData.calculated_results) {
      console.log('Using pre-calculated results');
      
      // Extract scores from calculated_results
      const programScores = Object.entries(rawData.calculated_results).reduce((acc, [programId, data]) => {
        acc[programId] = data.score;
        return acc;
      }, {});
      
      // Combine the raw data with the processed scores
      processedData = {
        ...rawData,
        ...programScores
      };
    } else {
      // Calculate scores from scratch
      console.log('Calculating results from scratch');
      processedData = processResults(rawData);
    }
    
    console.log('Processed data ready');
    return processedData;
  } catch (error) {
    console.error('Error fetching quiz result:', error);
    throw error;
  }
};

// Function to process results data for display
const processResults = (data) => {
  // Use pre-calculated results if available and no negative values
  if (data.calculated_results) {
    console.log('Checking pre-calculated results');
    
    // Extract just the scores for the results state
    const scores = {};
    let hasNegative = false;
    
    Object.entries(data.calculated_results).forEach(([programId, result]) => {
      scores[programId] = result.score;
      // Check if any score is negative
      if (result.score < 0) {
        hasNegative = true;
        console.log(`Found negative score for program ${programId}: ${result.score}`);
      }
    });
    
    // If no negative scores, use the pre-calculated results
    if (!hasNegative) {
      console.log('Using pre-calculated results - no negative values found');
      return scores;
    }
    
    console.log('Found negative values in pre-calculated results, recalculating...');
  }
  
  console.log('Calculating results on client');
  
  // Create program mapping - which questions belong to which program
  const programMapping = {};
  questions.forEach(question => {
    if (!programMapping[question.program]) {
      programMapping[question.program] = [];
    }
    programMapping[question.program].push(question.id);
  });

  // Calculate results for each program
  const calculatedResults = {};
  
  Object.entries(programMapping).forEach(([programId, questionIds]) => {
    const programIdNum = parseInt(programId);
    let sum = 0;
    
    // Sum up answers for this program
    questionIds.forEach(questionId => {
      // Handle both array and object formats
      const answer = Array.isArray(data.answers) 
        ? data.answers[questionId - 1] // Array is 0-based, so subtract 1
        : data.answers?.[questionId];
      
      // Use raw answer value without adjustment, ensure it's not negative
      const numericAnswer = Math.max(0, Number(answer || 0));
      
      sum += numericAnswer;
    });

    // Determine if answers are in the 0-5 or 1-6 range
    const hasZero = Object.values(data.answers || {}).some(v => Number(v) === 0);
    const hasSix = Object.values(data.answers || {}).some(v => Number(v) === 6);
    const isZeroToFiveScale = hasZero && !hasSix;

    // Use the appropriate formula based on the answer scale
    let percentageScore;

    if (isZeroToFiveScale) {
      // For 0-5 scale: sum/25*100%
      percentageScore = (sum / 25) * 100;
    } else {
      // For 1-6 scale: (sum-questionCount)/25*100%
      // Subtract 1 point per question to match the calculation in calculateResults.js
      percentageScore = ((sum - questionIds.length) / 25) * 100;
    }
    
    // Ensure no negative percentages
    percentageScore = Math.max(0, percentageScore);
    
    // Determine category with explicit ranges
    let category;
    if (percentageScore >= 0 && percentageScore <= 40) category = 'reduced';
    else if (percentageScore > 40 && percentageScore <= 60) category = 'average';
    else if (percentageScore > 60 && percentageScore <= 80) category = 'increased';
    else if (percentageScore > 80 && percentageScore <= 100) category = 'high';
    else category = 'reduced';
    
    calculatedResults[programIdNum] = {
      id: programIdNum,
      rawScore: sum,
      score: percentageScore,
      category
    };
  });
  
  // Convert to the format expected by the rest of the app
  const scores = {};
  Object.entries(calculatedResults).forEach(([programId, result]) => {
    scores[programId] = result.score;
  });
  
  // Store calculated results for future use
  try {
    supabase
      .from('quiz_results')
      .update({ calculated_results: calculatedResults })
      .eq('id', data.id)
      .then(({ error }) => {
        if (error) {
          console.error('Error storing calculated results:', error);
        } else {
          console.log('Successfully stored recalculated results');
        }
      });
  } catch (err) {
    console.error('Failed to store calculated results:', err);
  }
  
  return scores;
};

const ResultsPage = ({ view = 'grid' }) => {
  const { id, currentView } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { language } = useContext(LanguageContext);
  const [currentViewState, setCurrentViewState] = useState(currentView || view);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [permalinkUrl, setPermalinkUrl] = useState(null);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [emailError, setEmailError] = useState(null);
  const [showProgramInfo, setShowProgramInfo] = useState(false);
  const [isSendingTestEmail, setIsSendingTestEmail] = useState(false);

  const handleGeneratePermalink = async () => {
    if (!permalinkUrl && data?.id) {
      try {
        console.log('Attempting to generate permalink for session:', data.id);
        
        // Check if the current ID is already a permalink token
        const isPermalink = id && id.length >= 40;
        
        if (isPermalink) {
          // We're already viewing with a permalink, just use the current URL
          const baseUrl = window.location.origin;
          setPermalinkUrl(`${baseUrl}/results/${id}`);
          return;
        }
        
        // Generate a new permalink
        const permalink = await createPermalink(data.id);
        const baseUrl = window.location.origin;
        setPermalinkUrl(`${baseUrl}/results/${permalink.permalink}`);
      } catch (error) {
        console.error('Error generating permalink:', error);
      }
    }
  };

  // Query to fetch the data
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['quiz_result', id, searchParams.toString()],
    queryFn: () => fetchQuizResult(id, searchParams),
    retry: 2,
    refetchOnWindowFocus: false,
    onSuccess: (data) => {
      // Check if test is complete and if email has been sent
      if (data?.calculated_results && !data.email_sent) {
        // Create permalink automatically when results are loaded
        handleGeneratePermalink();
      }
    }
  });

  // Check if the test is complete
  const isTestComplete = useMemo(() => {
    if (!data) return false;
    
    // Consider test complete if:
    // - It has answers for all 90 questions, OR
    // - current_index is at the end (89 for 90 questions), OR
    // - It was generated by random test
    return data.is_random || 
           (data.current_index !== undefined && data.current_index >= 89) ||
           (data.answers && Object.keys(data.answers).length === 90);
  }, [data]);
  
  // Check if the test is still in progress
  const isTestInProgress = useMemo(() => {
    if (!data || isTestComplete) return false;
    
    // Calculate time since the test was started
    const createdAt = new Date(data.created_at);
    const now = new Date();
    const hoursSinceCreated = (now - createdAt) / (1000 * 60 * 60);
    
    // Consider "in progress" if created less than 2 hours ago
    return hoursSinceCreated < 2 && data.answers && Object.keys(data.answers).length > 0;
  }, [data, isTestComplete]);
  
  // Process display data with useMemo to prevent unnecessary recalculations
  const { sortedPrograms, highScorePrograms } = useMemo(() => {
    if (!data) return { sortedPrograms: [], highScorePrograms: [] };
    
    // Map program IDs to their details from programData
    const processedPrograms = [];
    
    Object.entries(data).forEach(([programId, score]) => {
      const programIdNum = parseInt(programId);
      const programInfo = programData.find(p => p.id === programIdNum);
      
      if (programInfo) {
        // Round score for display
        const roundedScore = Math.round(score);
        
        // Determine level based on score
        const level = getScoreLevel(roundedScore);
        
        processedPrograms.push({
          id: programIdNum,
          score: roundedScore,
          level,
          ru: programInfo.name.ru,
          kz: programInfo.name.kz
        });
      }
    });
    
    // Only sort for high scores section
    const sortedForHighScores = [...processedPrograms]
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
    
    return {
      sortedPrograms: processedPrograms,
      highScorePrograms: sortedForHighScores
    };
  }, [data]);
  
  useEffect(() => {
    setCurrentViewState(view);
  }, [view]);
  
  const handleDownloadPDF = async () => {
    try {
      if (!data) {
        throw new Error('No results available');
      }

      // Generate either grid or list PDF based on current view
      const pdfBlob = currentViewState === 'grid' 
        ? await generateGridPDF(data, sortedPrograms, language, translations, id)
        : await generateListPDF(data, sortedPrograms, language, translations, id);
      
      // Create a URL for the blob
      const url = window.URL.createObjectURL(pdfBlob);
      
      // Create a temporary link element
      const link = document.createElement('a');
      link.href = url;
      link.download = `${createSafeFilename(data, currentViewState)}.pdf`;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('PDF generation error:', error);
    }
  };
  
  const toggleView = () => {
    const newView = currentViewState === 'grid' ? 'list' : 'grid';
    setCurrentViewState(newView);
    navigate(`/results/${newView}/${id}${window.location.search}`);
  };
  
  const getWhatsAppLink = () => {
    if (!data.coachPhone) return '#';
    
    // Clean phone number - remove all non-digit characters except the leading plus
    let cleanPhone = data.coachPhone.trim();
    
    // Ensure there's a plus at the beginning if not already there
    if (!cleanPhone.startsWith('+')) {
      // If it starts with a digit like 7 or 8, add the plus
      cleanPhone = '+' + cleanPhone;
    }
    
    // Now remove any non-digit characters
    cleanPhone = cleanPhone.replace(/[^\d+]/g, '');
    
    // Use appropriate text based on language
    const text = language === 'ru' 
      ? 'Здравствуйте! Я прошел тест p18 и хотел бы получить разбор.'
      : 'Сәлеметсіз бе! Мен p18 тестін тапсырдым және талдау алғым келеді.';
    
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
  };
  
  const handleProgramClick = (programId) => {
    setSelectedProgram(programId);
  };

  useEffect(() => {
    if (isTestComplete && data && !data.email_sent) {
      console.log('Email conditions met:', {
        isTestComplete,
        hasResults: !!data,
        emailSent: data.email_sent,
        id: id
      });
      
      // Immediately mark as sent to prevent duplicate sends
      const markEmailAsSent = async () => {
        try {
          const { error } = await supabase
            .from('quiz_results')
            .update({ email_sent: true })
            .eq('id', id);
            
          if (error) {
            console.error('Error marking email as sent:', error);
            return false;
          }
          return true;
        } catch (error) {
          console.error('Error updating email_sent status:', error);
          return false;
        }
      };
      
      // Send results email after marking as sent
      const sendEmail = async () => {
        try {
          const marked = await markEmailAsSent(); // Mark as sent first
          if (!marked) {
            console.log('Skipping email send - could not mark as sent');
            return;
          }
          
          await sendResultsEmail(data, sortedPrograms, language, translations, id);
          console.log('Email sent successfully');
        } catch (error) {
          console.error('Error sending results email:', error);
        }
      };

      // Execute with a small delay
      const timer = setTimeout(sendEmail, 2000);
      return () => clearTimeout(timer);
    } else {
      console.log('Skipping email send:', {
        isTestComplete,
        hasResults: !!data,
        emailSent: data?.email_sent
      });
    }
  }, [isTestComplete, data?.email_sent, id, language, sortedPrograms, data]);
  
  const handleSendTestEmail = async () => {
    try {
      if (!data?.user_email) return;
      
      setIsSendingTestEmail(true);
      await sendTestEmail(
        data.user_email, 
        language,
        data,
        sortedPrograms,
        translations,
        id
      );
      setIsSendingTestEmail(false);
      setIsEmailSent(true);
      setTimeout(() => setIsEmailSent(false), 3000);
    } catch (error) {
      console.error('Test email error:', error);
      setIsEmailSent(false);
      setEmailError('Error sending test email');
      setTimeout(() => setEmailError(null), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Header />
      
      <main className="flex-grow max-w-5xl mx-auto px-4 py-8">
        {isLoading ? (
          <div className="text-center py-16">
            <Loading message={translations.loading[language]} />
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <div className="mb-4 text-red-600 text-xl">
              {translations.error[language]}
            </div>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              {translations.reload[language]}
            </button>
          </div>
        ) : !data ? (
          <div className="text-center py-16">
            <div className="mb-4 text-xl">
              {translations.notFound[language]}
            </div>
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              {translations.return[language]}
            </button>
          </div>
        ) : (
          <>
            {/* User info section */}
            <div className="rounded-lg shadow-lg p-4 sm:p-6 mb-8 text-white" style={{ backgroundColor: 'rgb(107, 70, 193)' }}>
              <div className="mb-6">
                <h1 className="text-2xl sm:text-3xl font-bold mb-4">
                  {data.user_name}, {translations.resultsTitle[language]}
                </h1>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="flex items-center">
                    <span>{formatDate(data.created_at, language)}</span>
                  </div>
                  <div className="flex items-center">
                    <span>{data.user_email}</span>
                  </div>
                  <div className="flex items-center">
                    <span>{translations.coach[language]}: {data.coachName || data.coach_email}</span>
                  </div>
                </div>
              </div>
              
              <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
                {/* View toggle buttons */}
                <div className="flex rounded-lg overflow-hidden bg-white/20 shadow-inner">
                  <button
                    onClick={() => setCurrentViewState('list')}
                    className={`py-2.5 px-4 text-sm font-medium flex-1 transition-colors ${
                      currentViewState === 'list' 
                        ? 'bg-white text-[rgb(107, 70, 193)]' 
                        : 'text-white hover:bg-white/10'
                    }`}
                    style={{ color: currentViewState === 'list' ? 'rgb(107, 70, 193)' : 'white' }}
                  >
                    {translations.listView[language]}
                  </button>
                  <button
                    onClick={() => setCurrentViewState('grid')}
                    className={`py-2.5 px-4 text-sm font-medium flex-1 transition-colors ${
                      currentViewState === 'grid' 
                        ? 'bg-white text-[rgb(107, 70, 193)]' 
                        : 'text-white hover:bg-white/10'
                    }`}
                    style={{ color: currentViewState === 'grid' ? 'rgb(107, 70, 193)' : 'white' }}
                  >
                    {translations.gridView[language]}
                  </button>
                </div>
                
                {/* Download PDF button */}
                <button
                  onClick={handleDownloadPDF}
                  className="py-2.5 px-4 bg-white rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors flex items-center justify-center shadow-sm text-[rgb(107, 70, 193)]"
                  style={{ color: 'rgb(107, 70, 193)' }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  {translations.downloadPDF[language]}
                </button>
              </div>
            </div>
            
            {/* Main content */}
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-8">
              {currentViewState === 'grid' ? (
                <GridViewComponent 
                  sortedPrograms={sortedPrograms}
                  highScorePrograms={highScorePrograms}
                  language={language}
                  onProgramClick={handleProgramClick}
                />
              ) : (
                <ListViewComponent
                  sortedPrograms={sortedPrograms}
                  highScorePrograms={highScorePrograms}
                  language={language}
                  onProgramClick={handleProgramClick}
                />
              )}
            </div>
            
            {/* Call to action */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-md p-4 sm:p-6 text-white mb-8">
              <p className="mb-4 text-sm sm:text-base leading-relaxed">
                {translations.promo[language]}
              </p>
              <div className="flex justify-center">
                <a
                  href={getWhatsAppLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white text-[rgb(37, 99, 235)] px-4 py-2 rounded-full font-medium text-sm sm:text-base hover:bg-gray-50 transition-colors shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                  style={{ color: 'rgb(37, 99, 235)' }}
                >
                  {(searchParams.get('lang') === 'kz' ? data.coachButtonTextKz : data.coachButtonTextRu) || 
                   translations.consultation[searchParams.get('lang') || language]}
                </a>
              </div>
            </div>
            
            {/* Program details modal */}
            {selectedProgram && (currentViewState === 'grid' || (typeof selectedProgram === 'string' && selectedProgram.startsWith('high_'))) && (
              <div 
                className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
                onClick={() => setSelectedProgram(null)}
              >
                <div 
                  className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
                  onClick={e => e.stopPropagation()}
                >
                  <div className="flex justify-between items-center p-4 border-b">
                    <h3 className="text-lg font-medium text-[rgb(107, 70, 193)]">
                      {programs.find(p => p.id === (typeof selectedProgram === 'string' ? parseInt(selectedProgram.split('_')[1]) : selectedProgram))?.[language]}
                    </h3>
                    <button 
                      onClick={() => setSelectedProgram(null)}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      ✕
                    </button>
                  </div>
                  {programData.find(p => p.id === (typeof selectedProgram === 'string' ? parseInt(selectedProgram.split('_')[1]) : selectedProgram)) && (
                    <>
                      <div className="bg-blue-50 p-4 whitespace-pre-line">
                        {programData.find(p => p.id === (typeof selectedProgram === 'string' ? parseInt(selectedProgram.split('_')[1]) : selectedProgram)).description[language]}
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default ResultsPage;
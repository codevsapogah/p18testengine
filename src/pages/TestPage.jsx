import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { LanguageContext } from '../contexts/LanguageContext';
import { supabase } from '../supabase';
import { questions } from '../data/questions';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import Loading from '../components/common/Loading';
import Question from '../components/test/Question';
import ProgressBar from '../components/test/ProgressBar';
import { calculateResults } from '../utils/calculateResults';

const translations = {
  error: {
    ru: 'Ошибка при загрузке теста',
    kz: 'Тестті жүктеу кезінде қате'
  },
  return: {
    ru: 'Вернуться на главную',
    kz: 'Басты бетке оралу'
  },
  previous: {
    ru: 'Назад',
    kz: 'Алдыңғы'
  },
  complete: {
    ru: 'Завершить',
    kz: 'Аяқтау'
  }
};

const TestPage = () => {
  const { language } = useContext(LanguageContext);
  const navigate = useNavigate();
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [sessionId, setSessionId] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [randomizedQuestions, setRandomizedQuestions] = useState([]);
  
  // Initialization effect to set up the quiz
  useEffect(() => {
    const storedSessionId = localStorage.getItem('quiz_session_id');
    
    if (!storedSessionId) {
      navigate('/');
      return;
    }
    
    setSessionId(storedSessionId);
    
    const initializeQuiz = async () => {
      try {
        // Get current state from database
        const { data, error } = await supabase
          .from('quiz_results')
          .select('answers, question_order, current_index')
          .eq('id', storedSessionId)
          .single();
          
        if (error) {
          if (error.code === 'PGRST116') {
            // Column doesn't exist error, fall back to just answers
            const { data: basicData, error: basicError } = await supabase
              .from('quiz_results')
              .select('answers')
              .eq('id', storedSessionId)
              .single();
              
            if (basicError) throw basicError;
            
            if (basicData) {
              // Store previous answers
              if (basicData.answers) {
                setAnswers(basicData.answers);
              }
              
              // Create and save randomized question order on first visit
              const questionIds = questions.map(q => q.id);
              // Force a thorough shuffle to ensure randomization
              const randomizedIds = shuffleArray([...questionIds]);
              
              console.log("New randomized order:", randomizedIds.slice(0, 5), "...");
              
              // Create a mapping from randomized indices to actual questions
              const randomized = [];
              randomizedIds.forEach(qId => {
                const question = questions.find(q => q.id === qId);
                if (question) randomized.push(question);
              });
              
              setRandomizedQuestions(randomized);
              
              // Save question order to database
              const { error: updateError } = await supabase
                .from('quiz_results')
                .update({ 
                  question_order: randomizedIds,
                  current_index: 0
                })
                .eq('id', storedSessionId);
                
              if (updateError) {
                console.error("Failed to save question order:", updateError);
              } else {
                console.log("Initialized new question order");
              }
            }
          } else {
            throw error;
          }
        } else if (data) {
          // We have all the data we need
          if (data.answers) {
            setAnswers(data.answers);
          }
          
          // Use existing question order if available, otherwise create new one
          if (data.question_order && Array.isArray(data.question_order)) {
            console.log("Using existing question order:", data.question_order.slice(0, 5), "...");
            
            // Map question IDs to actual question objects
            const randomized = [];
            data.question_order.forEach(qId => {
              const question = questions.find(q => q.id === qId);
              if (question) randomized.push(question);
            });
            
            setRandomizedQuestions(randomized);
            
            // Restore current question index
            if (data.current_index !== undefined && data.current_index !== null) {
              setCurrentQuestionIndex(data.current_index);
            } else {
              // Find next unanswered question
              const nextUnanswered = data.question_order.findIndex(qId => !data.answers[qId]);
              if (nextUnanswered !== -1) {
                setCurrentQuestionIndex(nextUnanswered);
              }
            }
          } else {
            // No question order, create and save new one
            const questionIds = questions.map(q => q.id);
            // Force a thorough shuffle to ensure randomization
            const randomizedIds = shuffleArray([...questionIds]);
            
            console.log("New randomized order:", randomizedIds.slice(0, 5), "...");
            
            // Create a mapping from randomized indices to actual questions
            const randomized = [];
            randomizedIds.forEach(qId => {
              const question = questions.find(q => q.id === qId);
              if (question) randomized.push(question);
            });
            
            setRandomizedQuestions(randomized);
            
            // Save question order to database
            const { error: updateError } = await supabase
              .from('quiz_results')
              .update({ 
                question_order: randomizedIds,
                current_index: 0
              })
              .eq('id', storedSessionId);
              
            if (updateError) {
              console.error("Failed to save question order:", updateError);
            } else {
              console.log("Initialized new question order");
            }
          }
        }
        
        // If quiz is already complete, go to results
        if (data?.answers && Object.keys(data.answers).length === questions.length) {
          navigate(`/results/grid/${storedSessionId}`);
          return;
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error initializing quiz:', err);
        setError('Failed to initialize quiz. Please try refreshing the page.');
        setLoading(false);
      }
    };
    
    initializeQuiz();
  }, [navigate]);
  
  const handleAnswer = async (questionId, value) => {
    const updatedAnswers = { ...answers, [questionId]: value };
    setAnswers(updatedAnswers);
    
    try {
      // Update database with new answer
      const { error } = await supabase
        .from('quiz_results')
        .update({ 
          answers: updatedAnswers
        })
        .eq('id', sessionId);
        
      if (error) throw error;
      
      // Only advance to next question if not on the last one
      if (currentQuestionIndex < randomizedQuestions.length - 1) {
        const nextIndex = currentQuestionIndex + 1;
        setCurrentQuestionIndex(nextIndex);
        
        // Update current index in database - properly handle errors
        try {
          const { error: updateError } = await supabase
            .from('quiz_results')
            .update({ current_index: nextIndex })
            .eq('id', sessionId);
            
          if (updateError) {
            console.warn('Failed to update current_index:', updateError);
          }
        } catch (indexErr) {
          console.warn('Exception updating current_index:', indexErr);
        }
      }
    } catch (err) {
      console.error('Error saving answer:', err);
      setError('Failed to save your answer. Please try again.');
    }
  };

  const handleComplete = async () => {
    setSubmitting(true);
    
    try {
      // Calculate results before navigating
      const { data, error } = await supabase
        .from('quiz_results')
        .select('answers, user_name, user_email, coach_email')
        .eq('id', sessionId)
        .single();
        
      if (error) throw error;
      
      // Calculate the results using the utility function
      const calculatedResults = calculateResults(data.answers);
      
      // Store the calculated results in the database
      const { error: updateError } = await supabase
        .from('quiz_results')
        .update({ 
          calculated_results: calculatedResults,
          completed_at: new Date()
        })
        .eq('id', sessionId);
        
      if (updateError) {
        console.error('Error updating calculated results:', updateError);
        // Continue even if update fails
      }
      
      // Send email to client
      if (data.user_email) {
        try {
          console.log('Sending email to client:', data.user_email);
          const response = await fetch(`${process.env.REACT_APP_API_URL}/email/completion`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              quizId: sessionId,
              clientEmail: data.user_email,
              clientName: data.user_name || 'Client',
              language
            })
          });
          
          if (!response.ok) {
            console.warn('Failed to send client email notification', await response.text());
          } else {
            console.log('Client email notification sent successfully');
          }
        } catch (emailErr) {
          console.warn('Error sending client email:', emailErr);
        }
      }
      
      // Send email to coach
      if (data.coach_email) {
        try {
          console.log('Sending email to coach:', data.coach_email);
          const response = await fetch(`${process.env.REACT_APP_API_URL}/email/notification`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              quizId: sessionId,
              clientName: data.user_name || 'Client',
              coachEmail: data.coach_email,
              language
            })
          });
          
          if (!response.ok) {
            console.warn('Failed to send coach notification', await response.text());
          } else {
            console.log('Coach notification sent successfully');
          }
        } catch (emailErr) {
          console.warn('Error sending coach notification:', emailErr);
        }
      }
      
      // Now navigate to results page
      navigate(`/results/grid/${sessionId}`);
    } catch (err) {
      console.error('Error during quiz completion:', err);
      // Still navigate to results page
      navigate(`/results/grid/${sessionId}`);
    } finally {
      setSubmitting(false);
    }
  };
  
  // Back button handler with proper error handling
  const handleGoBack = async () => {
    const newIndex = currentQuestionIndex - 1;
    setCurrentQuestionIndex(newIndex);
    
    // Update current index in database with proper error handling
    try {
      const { error } = await supabase
        .from('quiz_results')
        .update({ current_index: newIndex })
        .eq('id', sessionId);
        
      if (error) {
        console.warn('Failed to update current_index on back:', error);
      }
    } catch (err) {
      console.warn('Exception updating current_index on back:', err);
    }
  };
  
  // Fisher-Yates shuffle algorithm for better randomization
  const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };
  
  if (loading) {
    return <Loading fullScreen />;
  }
  
  if (submitting) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-75 z-50">
        <div className="text-center p-6 bg-white rounded-lg shadow-md">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-lg font-medium text-gray-700">
            {language === 'ru' ? 'Обработка результатов...' : 'Нәтижелерді өңдеу...'}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            {language === 'ru' ? 'Пожалуйста, не закрывайте страницу' : 'Бетті жаппаңыз'}
          </p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="p-8 text-center">
            <div className="mb-4 text-red-600 font-medium text-lg">{translations.error[language]}</div>
            <p className="text-gray-600 mb-6">{error}</p>
            <button 
              onClick={() => navigate('/')}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              {translations.return[language]}
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  const currentQuestion = randomizedQuestions[currentQuestionIndex];
  if (!currentQuestion) return <Loading fullScreen />;
  
  const isLastQuestion = currentQuestionIndex === randomizedQuestions.length - 1;
  const progress = ((currentQuestionIndex + 1) / randomizedQuestions.length) * 100;
  
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Header />
      <main className="flex-grow flex items-center">
        <div className="w-full max-w-2xl mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <ProgressBar progress={progress} />
            
            <div className="mt-6">
              <Question 
                question={currentQuestion}
                language={language}
                onAnswer={(value) => handleAnswer(currentQuestion.id, value)}
                isLastQuestion={isLastQuestion}
                previousAnswer={answers[currentQuestion.id]}
              />
            </div>
            
            <div className="mt-6 flex justify-between">
              {currentQuestionIndex > 0 && (
                <button
                  onClick={handleGoBack}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200"
                >
                  {translations.previous[language]}
                </button>
              )}
              
              {isLastQuestion && answers[currentQuestion.id] && (
                <button
                  onClick={handleComplete}
                  className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition duration-200 ml-auto"
                >
                  {translations.complete[language]}
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TestPage;
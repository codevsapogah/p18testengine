import React, { useEffect, useState, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import UserForm from '../components/registration/UserForm';
import { supabase } from '../supabase';
import { questions } from '../data/questions';
import { calculateResults } from '../utils/calculateResults';
import { LanguageContext } from '../contexts/LanguageContext';

const HomePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showAdminButton, setShowAdminButton] = useState(false);
  const { language } = useContext(LanguageContext);
  
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    // Check for admin parameter case-insensitively
    setShowAdminButton(
      Array.from(params.keys()).some(key => key.toLowerCase() === 'admin')
    );
  }, [location.search]);
  
  const handleRandomQuiz = async () => {
    try {
      // Generate a session ID
      const sessionId = Math.random().toString(36).substring(2, 15);
      
      // Generate random question order
      const questionIds = questions.map(q => q.id);
      const randomizedIds = shuffleArray([...questionIds]);
      
      // Create a quiz session
      await supabase
        .from('quiz_results')
        .insert([
          { 
            id: sessionId,
            user_name: 'Random Test',
            user_phone: '+7 (777) 777-7777',
            user_email: 'random@test.com',
            coach_email: 'kmektepbergen@gmail.com',
            created_at: new Date(),
            is_random: true,
            question_order: randomizedIds,
            current_index: questionIds.length - 1, // Set to the last question
            answers: {},
            language: language
          }
        ]);
      
      // Generate random answers for all questions
      const randomAnswers = {};
      questions.forEach(question => {
        // Generate random answer between 1 and 6
        randomAnswers[question.id] = Math.floor(Math.random() * 6) + 1;
      });
      
      // Save the random answers
      await supabase
        .from('quiz_results')
        .update({ 
          answers: randomAnswers 
        })
        .eq('id', sessionId);
      
      // Calculate results
      const calculatedResults = calculateResults(randomAnswers);
      
      // Save calculated results
      await supabase
        .from('quiz_results')
        .update({ 
          calculated_results: calculatedResults 
        })
        .eq('id', sessionId);
      
      // Navigate to results page
      navigate(`/results/grid/${sessionId}`);
    } catch (error) {
      console.error('Error in random quiz:', error);
      alert('Failed to create random quiz');
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

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Header />

      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <UserForm />
          
          {showAdminButton && (
            <div className="mt-6 flex justify-center">
              <button
                onClick={handleRandomQuiz}
                className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors"
              >
                RANDOM
              </button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default HomePage;
const express = require('express');
const { supabaseAdmin } = require('../utils/supabase');
const crypto = require('crypto');

const router = express.Router();

// Get questions (unauthenticated)
router.get('/questions', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('questions')
      .select('*')
      .order('id');
      
    if (error) throw error;
    
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error getting questions:', error);
    return res.status(500).json({ error: error.message });
  }
});

// Create quiz session (unauthenticated)
router.post('/quiz-session', async (req, res) => {
  try {
    const { userData, language } = req.body;
    
    if (!userData) {
      return res.status(400).json({ message: 'User data is required' });
    }
    
    // Generate a session ID
    const sessionId = Math.random().toString(36).substring(2, 15);
    
    // First try to find existing user or create new one
    const { data: existingUser, error: findError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', userData.user_email)
      .single();
      
    let userId;
    
    if (findError) {
      // User doesn't exist, create new one
      const { data: newUser, error: createError } = await supabaseAdmin
        .from('users')
        .insert([{ email: userData.user_email }])
        .select('id')
        .single();
        
      if (createError) throw createError;
      userId = newUser.id;
    } else {
      userId = existingUser.id;
    }
    
    // Add entry to user_details_history
    await supabaseAdmin
      .from('user_details_history')
      .insert([{
        user_id: userId,
        name: userData.user_name,
        phone: userData.user_phone
      }]);
    
    // Get coach ID from email
    const { data: coach, error: coachError } = await supabaseAdmin
      .from('approved_coaches')
      .select('id')
      .eq('email', userData.coach_email)
      .single();
      
    if (coachError) throw coachError;
    
    // Create quiz session
    const { data, error } = await supabaseAdmin
      .from('quiz_results')
      .insert([{
        id: sessionId,
        user_id: userId,
        coach_id: coach.id,
        created_at: new Date(),
        is_random: false,
        answers: {},
        language: language || 'ru',
        entered_name: userData.user_name,
        entered_phone: userData.user_phone
      }])
      .select()
      .single();
      
    if (error) throw error;
    
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error creating quiz session:', error);
    return res.status(500).json({ error: error.message });
  }
});

// Update quiz answers (unauthenticated)
router.post('/quiz-answers/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { answers, currentIndex } = req.body;
    
    const updates = {};
    if (answers) updates.answers = answers;
    if (currentIndex !== undefined) updates.current_index = currentIndex;
    
    const { data, error } = await supabaseAdmin
      .from('quiz_results')
      .update(updates)
      .eq('id', sessionId)
      .select()
      .single();
      
    if (error) throw error;
    
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error updating quiz answers:', error);
    return res.status(500).json({ error: error.message });
  }
});

// Get quiz session by ID (unauthenticated)
router.get('/quiz-session/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    console.log('Looking for quiz session with ID:', sessionId);
    
    // Find the session by ID
    const { data: quizResult, error: quizError } = await supabaseAdmin
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
      .eq('id', sessionId)
      .single();
      
    if (quizError) {
      console.error('Error finding quiz session:', quizError);
      return res.status(404).json({ error: 'Quiz session not found' });
    }
    
    if (!quizResult) {
      console.log('No quiz session found for ID:', sessionId);
      return res.status(404).json({ error: 'Quiz session not found' });
    }
    
    console.log('Found quiz session:', quizResult.id);
    
    // Clean up the data for the frontend
    const userData = {
      ...quizResult,
      user_name: quizResult.entered_name || '—',
      user_email: quizResult.user?.email,
      user_phone: quizResult.entered_phone,
      coach_email: quizResult.coach?.email,
      coachName: quizResult.coach?.name,
      coachPhone: quizResult.coach?.phone,
      coachButtonTextRu: quizResult.coach?.button_text_ru,
      coachButtonTextKz: quizResult.coach?.button_text_kz
    };
    
    return res.status(200).json(userData);
  } catch (error) {
    console.error('Error getting quiz session:', error);
    return res.status(500).json({ error: error.message });
  }
});

// Create a permalink for quiz results
router.post('/create-permalink/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    console.log('Creating permalink for session:', sessionId);
    
    // Verify the session exists
    const { data: session, error: sessionError } = await supabaseAdmin
      .from('quiz_results')
      .select('id, permalink_token')
      .eq('id', sessionId)
      .single();
      
    if (sessionError) {
      console.error('Error finding session:', sessionError);
      return res.status(404).json({ error: 'Quiz session not found' });
    }
    
    if (!session) {
      console.log('No session found with ID:', sessionId);
      return res.status(404).json({ error: 'Quiz session not found' });
    }
    
    // If permalink already exists, return it
    if (session.permalink_token) {
      console.log('Permalink already exists for session:', sessionId);
      return res.status(200).json({ 
        permalink: session.permalink_token, 
        url: `/results/${session.permalink_token}` 
      });
    }
    
    // Generate a secure token
    const permalinkToken = crypto.randomBytes(20).toString('hex');
    console.log('Generated new permalink token:', permalinkToken);
    
    // Store the permalink token
    const { error: updateError } = await supabaseAdmin
      .from('quiz_results')
      .update({ permalink_token: permalinkToken })
      .eq('id', sessionId);
      
    if (updateError) {
      console.error('Error updating permalink token:', updateError);
      throw updateError;
    }
    
    console.log('Successfully created permalink for session:', sessionId);
    return res.status(200).json({ 
      permalink: permalinkToken, 
      url: `/results/${permalinkToken}` 
    });
  } catch (error) {
    console.error('Error creating permalink:', error);
    return res.status(500).json({ error: error.message });
  }
});

// Access quiz results via permalink token
router.get('/permalink-results/:token', async (req, res) => {
  try {
    const { token } = req.params;
    
    console.log('Looking for results with permalink token:', token);
    
    // Find the session by permalink token
    const { data: quizResult, error: quizError } = await supabaseAdmin
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
      .eq('permalink_token', token)
      .single();
      
    if (quizError) {
      console.error('Error finding quiz result:', quizError);
      return res.status(404).json({ error: 'Results not found or link expired' });
    }
    
    if (!quizResult) {
      console.log('No results found for token:', token);
      return res.status(404).json({ error: 'Results not found or link expired' });
    }
    
    console.log('Found result:', quizResult.id);
    
    // Clean up the data for the frontend
    const userData = {
      ...quizResult,
      user_name: quizResult.entered_name || '—',
      user_email: quizResult.user?.email,
      user_phone: quizResult.entered_phone,
      coach_email: quizResult.coach?.email,
      coachName: quizResult.coach?.name,
      coachPhone: quizResult.coach?.phone,
      coachButtonTextRu: quizResult.coach?.button_text_ru,
      coachButtonTextKz: quizResult.coach?.button_text_kz
    };
    
    return res.status(200).json(userData);
  } catch (error) {
    console.error('Error retrieving results by permalink:', error);
    return res.status(500).json({ error: error.message });
  }
});

// Generic database query handler (public, unauthenticated)
router.post('/db-query', async (req, res) => {
  try {
    const { operation, table, options = {} } = req.body;
    
    if (!operation || !table) {
      return res.status(400).json({ 
        message: 'Missing required parameters: operation and table are required' 
      });
    }
    
    // Security check - only allow certain tables for public access
    const allowedTables = [
      'questions', 
      'quiz_results', 
      'users', 
      'user_details_history',
      'approved_coaches'
    ];
    
    if (!allowedTables.includes(table)) {
      return res.status(403).json({ 
        message: 'Access to this table is not allowed via public API' 
      });
    }
    
    let result;
    
    switch (operation.toLowerCase()) {
      case 'select':
        const { columns = '*', filters = {}, limit, order } = options;
        
        let query = supabaseAdmin
          .from(table)
          .select(columns);
          
        // Apply filters if provided
        Object.entries(filters).forEach(([key, value]) => {
          if (typeof value === 'object' && value !== null) {
            const { operator, value: filterValue } = value;
            
            if (operator && filterValue) {
              switch (operator) {
                case 'eq':
                  query = query.eq(key, filterValue);
                  break;
                case 'neq':
                  query = query.neq(key, filterValue);
                  break;
                // Add more operators as needed
                default:
                  query = query.eq(key, filterValue);
              }
            }
          } else {
            // Simple equality
            query = query.eq(key, value);
          }
        });
        
        // Apply limit if provided
        if (limit) {
          query = query.limit(limit);
        }
        
        // Apply ordering if provided
        if (order) {
          const { column, ascending = true } = order;
          if (column) {
            query = query.order(column, { ascending });
          }
        }
        
        result = await query;
        break;
        
      case 'insert':
        const { data } = options;
        result = await supabaseAdmin
          .from(table)
          .insert(data)
          .select();
        break;
        
      case 'update':
        const { data: updateData, match = {} } = options;
        let updateQuery = supabaseAdmin
          .from(table)
          .update(updateData);
          
        // Apply match conditions
        Object.entries(match).forEach(([key, value]) => {
          updateQuery = updateQuery.eq(key, value);
        });
        
        result = await updateQuery.select();
        break;
        
      default:
        return res.status(400).json({ message: 'Invalid operation' });
    }
    
    if (result.error) {
      throw result.error;
    }
    
    return res.status(200).json(result.data);
  } catch (error) {
    console.error('Error handling public database query:', error);
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router; 
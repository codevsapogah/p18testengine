const { supabase, supabaseAdmin } = require('../utils/supabase');

// Get all coaches
exports.getCoaches = async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('approved_coaches')
      .select('*');
      
    if (error) throw error;
    
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error getting coaches:', error);
    return res.status(500).json({ error: error.message });
  }
};

// Create new coach
exports.createCoach = async (req, res) => {
  try {
    const { email, name, phone, password, is_admin = false } = req.body;
    
    if (!email || !name || !password) {
      return res.status(400).json({ message: 'Email, name, and password are required' });
    }
    
    // Insert new coach
    const { data, error } = await supabaseAdmin
      .from('approved_coaches')
      .insert([
        { email, name, phone, password, is_admin }
      ])
      .select()
      .single();
      
    if (error) throw error;
    
    return res.status(201).json({ coach: data });
  } catch (error) {
    console.error('Error creating coach:', error);
    return res.status(500).json({ message: 'Server error creating coach' });
  }
};

// Update existing coach
exports.updateCoach = async (req, res) => {
  try {
    const { id, ...updates } = req.body;
    
    const { data, error } = await supabaseAdmin
      .from('approved_coaches')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
      
    if (error) throw error;
    
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error updating coach:', error);
    return res.status(500).json({ error: error.message });
  }
};

// Delete coach
exports.deleteCoach = async (req, res) => {
  try {
    const { id } = req.params;
    
    const { error } = await supabaseAdmin
      .from('approved_coaches')
      .delete()
      .eq('id', id);
      
    if (error) throw error;
    
    return res.status(200).json({ message: 'Coach deleted successfully' });
  } catch (error) {
    console.error('Error deleting coach:', error);
    return res.status(500).json({ error: error.message });
  }
};

// Get all clients (admin access)
exports.getAllClients = async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    return res.status(200).json({ clients: data });
  } catch (error) {
    console.error('Error fetching all clients:', error);
    return res.status(500).json({ message: 'Server error fetching clients' });
  }
};

// Get all results (admin access)
exports.getAllResults = async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('results')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    return res.status(200).json({ results: data });
  } catch (error) {
    console.error('Error fetching all results:', error);
    return res.status(500).json({ message: 'Server error fetching results' });
  }
};

// Get analytics data
exports.getAnalytics = async (req, res) => {
  try {
    // Get counts from various tables
    const [usersResult, testsResult, coachesResult] = await Promise.all([
      supabaseAdmin.from('quiz_results').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('quiz_results').select('*', { count: 'exact', head: true })
        .not('calculated_results', 'is', null),
      supabaseAdmin.from('approved_coaches').select('*', { count: 'exact', head: true })
    ]);
    
    if (usersResult.error) throw usersResult.error;
    if (testsResult.error) throw testsResult.error;
    if (coachesResult.error) throw coachesResult.error;
    
    // Get recent test data
    const { data: recentTests, error: recentError } = await supabaseAdmin
      .from('quiz_results')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);
      
    if (recentError) throw recentError;
    
    return res.status(200).json({
      totalUsers: usersResult.count,
      completedTests: testsResult.count,
      totalCoaches: coachesResult.count,
      recentTests
    });
  } catch (error) {
    console.error('Error getting analytics:', error);
    return res.status(500).json({ error: error.message });
  }
};

// Get test results
exports.getTestResults = async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('quiz_results')
      .select('*')
      .not('calculated_results', 'is', null)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error getting test results:', error);
    return res.status(500).json({ error: error.message });
  }
};

// Generic database query handler (bypasses RLS)
exports.handleDatabaseQuery = async (req, res) => {
  try {
    const { operation, table, options = {} } = req.body;
    
    if (!operation || !table) {
      return res.status(400).json({ 
        message: 'Missing required parameters: operation and table are required' 
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
            switch (operator) {
              case 'eq':
                query = query.eq(key, filterValue);
                break;
              case 'neq':
                query = query.neq(key, filterValue);
                break;
              case 'gt':
                query = query.gt(key, filterValue);
                break;
              case 'lt':
                query = query.lt(key, filterValue);
                break;
              case 'gte':
                query = query.gte(key, filterValue);
                break;
              case 'lte':
                query = query.lte(key, filterValue);
                break;
              case 'like':
                query = query.like(key, filterValue);
                break;
              case 'ilike':
                query = query.ilike(key, filterValue);
                break;
              case 'in':
                query = query.in(key, filterValue);
                break;
              default:
                // Default to equality
                query = query.eq(key, filterValue);
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
        
      case 'delete':
        const { match: deleteMatch = {} } = options;
        let deleteQuery = supabaseAdmin
          .from(table)
          .delete();
          
        // Apply match conditions
        Object.entries(deleteMatch).forEach(([key, value]) => {
          deleteQuery = deleteQuery.eq(key, value);
        });
        
        result = await deleteQuery;
        break;
        
      default:
        return res.status(400).json({ message: 'Invalid operation' });
    }
    
    if (result.error) {
      throw result.error;
    }
    
    return res.status(200).json(result.data);
  } catch (error) {
    console.error('Error handling database query:', error);
    return res.status(500).json({ error: error.message });
  }
};

// Custom query handler for complex operations
exports.handleCustomQuery = async (req, res) => {
  try {
    const { queryType, ...params } = req.body;
    
    if (!queryType) {
      return res.status(400).json({ message: 'Missing required parameter: queryType' });
    }
    
    let result;
    
    switch (queryType) {
      case 'randomQuiz':
        // Handle creating random quiz
        const { sessionId, answers, language } = params;
        
        // Create/update quiz with answers
        result = await supabaseAdmin
          .from('quiz_results')
          .upsert({
            id: sessionId,
            user_name: 'Random Test',
            user_phone: '+7 (777) 777-7777',
            user_email: 'random@test.com',
            coach_email: 'kmektepbergen@gmail.com',
            created_at: new Date(),
            is_random: true,
            answers,
            language,
            current_index: Object.keys(answers).length - 1 // Set to the last question
          })
          .select();
        break;
      
      case 'getPublicQuestions':
        // Get questions for the quiz
        result = await supabaseAdmin
          .from('questions')
          .select('*')
          .order('id');
        break;
        
      // Add more custom queries as needed
      
      default:
        return res.status(400).json({ message: 'Invalid query type' });
    }
    
    if (result.error) {
      throw result.error;
    }
    
    return res.status(200).json(result.data);
  } catch (error) {
    console.error('Error handling custom query:', error);
    return res.status(500).json({ error: error.message });
  }
}; 
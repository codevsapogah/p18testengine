/**
 * API Service utility for fetching data that requires bypassing RLS
 * Used for public pages and unauthenticated access
 */

// API URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3031/api';

/**
 * Performs a database operation (insert, select, update, delete) via the server API
 * which uses the admin role to bypass RLS
 * 
 * @param {string} operation - The operation to perform ('select', 'insert', 'update', 'delete')
 * @param {string} table - The table to operate on
 * @param {Object} options - Options specific to the operation
 * @returns {Promise<Object>} - The operation result
 */
export const adminQuery = async (operation, table, options = {}) => {
  try {
    const response = await fetch(`${API_URL}/admin/db-query`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        operation,
        table,
        options
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Error performing database operation');
    }
    
    return data;
  } catch (error) {
    console.error(`Error in adminQuery (${operation} on ${table}):`, error);
    throw error;
  }
};

/**
 * Performs a database operation (insert, select, update) via the public API
 * which uses the admin role to bypass RLS but doesn't require authentication
 * 
 * @param {string} operation - The operation to perform ('select', 'insert', 'update')
 * @param {string} table - The table to operate on
 * @param {Object} options - Options specific to the operation
 * @returns {Promise<Object>} - The operation result
 */
export const publicQuery = async (operation, table, options = {}) => {
  try {
    const response = await fetch(`${API_URL}/public/db-query`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        operation,
        table,
        options
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Error performing database operation');
    }
    
    return data;
  } catch (error) {
    console.error(`Error in publicQuery (${operation} on ${table}):`, error);
    throw error;
  }
};

/**
 * Get public data from a table (bypasses RLS)
 * For unauthenticated access to certain data
 */
export const getPublicData = async (tableName, options = {}) => {
  return publicQuery('select', tableName, options);
};

/**
 * Insert data to a table (bypasses RLS)
 * For creating initial records for unauthenticated users
 */
export const insertPublicData = async (tableName, data) => {
  return publicQuery('insert', tableName, { data });
};

/**
 * Update data in a table (bypasses RLS)
 * For updating records from public pages
 */
export const updatePublicData = async (tableName, data, match) => {
  return publicQuery('update', tableName, { data, match });
};

/**
 * Custom query for more complex operations
 */
export const customPublicQuery = async (queryType, params = {}) => {
  try {
    const response = await fetch(`${API_URL}/public/custom-query`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        queryType,
        ...params
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Error performing custom query');
    }
    
    return data;
  } catch (error) {
    console.error(`Error in customPublicQuery (${queryType}):`, error);
    throw error;
  }
};

/**
 * Create a new quiz session
 */
export const createQuizSession = async (userData, language) => {
  try {
    const response = await fetch(`${API_URL}/public/quiz-session`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ userData, language })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Error creating quiz session');
    }
    
    return data;
  } catch (error) {
    console.error('Error creating quiz session:', error);
    throw error;
  }
};

/**
 * Get questions for the quiz
 */
export const getQuestions = async () => {
  try {
    const response = await fetch(`${API_URL}/public/questions`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Error getting questions');
    }
    
    return data;
  } catch (error) {
    console.error('Error getting questions:', error);
    throw error;
  }
};

/**
 * Update quiz answers
 */
export const updateQuizAnswers = async (sessionId, answers, currentIndex) => {
  try {
    const response = await fetch(`${API_URL}/public/quiz-answers/${sessionId}`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ answers, currentIndex })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Error updating quiz answers');
    }
    
    return data;
  } catch (error) {
    console.error('Error updating quiz answers:', error);
    throw error;
  }
};

/**
 * Get quiz session by ID
 */
export const getQuizSession = async (sessionId) => {
  if (!sessionId) {
    console.error('Cannot get quiz session: No session ID provided');
    throw new Error('Session ID is required');
  }
  
  try {
    console.log(`Fetching quiz session: ${sessionId}`);
    const response = await fetch(`${API_URL}/public/quiz-session/${sessionId}`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error retrieving quiz session (${response.status}):`, errorText);
      throw new Error(errorText || `Failed to retrieve quiz session (${response.status})`);
    }
    
    const data = await response.json();
    console.log('Quiz session retrieved successfully');
    return data;
  } catch (error) {
    console.error('Error getting quiz session:', error);
    throw error;
  }
};

/**
 * Create a permalink for quiz results
 */
export const createPermalink = async (sessionId) => {
  if (!sessionId) {
    console.error('Cannot create permalink: No session ID provided');
    throw new Error('Session ID is required');
  }
  
  try {
    console.log(`Creating permalink for session: ${sessionId}`);
    const response = await fetch(`${API_URL}/public/create-permalink/${sessionId}`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error creating permalink (${response.status}):`, errorText);
      throw new Error(errorText || `Failed to create permalink (${response.status})`);
    }
    
    const data = await response.json();
    console.log('Permalink created successfully:', data);
    return data;
  } catch (error) {
    console.error('Error creating permalink:', error);
    throw error;
  }
};

/**
 * Get quiz results using permalink token
 */
export const getResultsByPermalink = async (token) => {
  if (!token) {
    console.error('Cannot get results: No permalink token provided');
    throw new Error('Permalink token is required');
  }
  
  try {
    console.log(`Fetching results with permalink token: ${token}`);
    const response = await fetch(`${API_URL}/public/permalink-results/${token}`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error retrieving results (${response.status}):`, errorText);
      throw new Error(errorText || `Failed to retrieve results (${response.status})`);
    }
    
    const data = await response.json();
    console.log('Results retrieved successfully');
    return data;
  } catch (error) {
    console.error('Error retrieving results by permalink:', error);
    throw error;
  }
}; 
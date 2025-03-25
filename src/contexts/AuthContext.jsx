import React, { createContext, useState, useEffect } from 'react';
// Import the new updateSupabaseAuth function
import { updateSupabaseAuth } from '../supabase';

export const AuthContext = createContext();

// API URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3031/api';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Check if we have a token in cookies and fetch current user
    const checkAuth = async () => {
      try {
        const response = await fetch(`${API_URL}/auth/me`, {
          method: 'GET',
          credentials: 'include', // Important for cookies
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
          setRole(data.user.role);
          // Update Supabase auth with the token from cookies
          updateSupabaseAuth();
        }
      } catch (error) {
        console.error('Error checking auth:', error);
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, []);
  
  const login = async (email, password) => {
    try {
      console.log('Attempting login with email:', email);
      console.log('API URL:', API_URL);
      
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        credentials: 'include', // Important for cookies
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });
      
      console.log('Login response status:', response.status);
      const data = await response.json();
      console.log('Login response:', data);
      
      if (response.ok) {
        setUser(data.user);
        setRole(data.user.role);
        
        // Update Supabase auth with the new token
        updateSupabaseAuth();
        
        return { 
          success: true, 
          is_admin: data.user.role === 'admin',
          role: data.user.role
        };
      } else {
        throw new Error(data.message || 'Login failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      return { success: false, error: err.message };
    }
  };
  
  const logout = async () => {
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      // Clear user data regardless of response
      setUser(null);
      setRole(null);
      
      // Update Supabase auth to clear the token
      updateSupabaseAuth();
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear user data on error
      setUser(null);
      setRole(null);
      
      // Still update Supabase auth
      updateSupabaseAuth();
    }
  };
  
  const isAuthenticated = () => {
    return !!user;
  };
  
  const isAdmin = () => {
    return role === 'admin';
  };
  
  const isCoach = () => {
    return role === 'coach';
  };
  
  return (
    <AuthContext.Provider 
      value={{ 
        user,
        role,
        loading,
        login,
        logout,
        isAuthenticated,
        isAdmin,
        isCoach
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
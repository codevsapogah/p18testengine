import React, { createContext, useState, useEffect } from 'react';
import { supabase } from '../supabase';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Check for stored auth data
    const storedUser = localStorage.getItem('auth_user');
    const storedRole = localStorage.getItem('auth_role');
    
    if (storedUser && storedRole) {
      setUser(JSON.parse(storedUser));
      setRole(storedRole);
    }
    
    setLoading(false);
  }, []);
  
  const login = async (email, password) => {
    try {
      // Fetch the user from approved_coaches table
      const { data, error } = await supabase
        .from('approved_coaches')
        .select('*')
        .eq('email', email)
        .single();
        
      if (error) throw error;
      
      // Simple password verification (in a real app, this would be handled by Supabase Auth)
      if (data && data.password === password) {
        // Store user and role in localStorage
        localStorage.setItem('auth_user', JSON.stringify({
          id: data.id,
          email: data.email,
          name: data.name,
          phone: data.phone,
          is_admin: data.is_admin
        }));
        
        // Set role based on login origin (will be determined in LoginPage)
        const userRole = data.is_admin ? 'admin' : 'coach';
        localStorage.setItem('auth_role', userRole);
        
        // Update state
        setUser({
          id: data.id,
          email: data.email,
          name: data.name,
          phone: data.phone,
          is_admin: data.is_admin
        });
        setRole(userRole);
        
        return { 
          success: true, 
          is_admin: data.is_admin,
          role: userRole 
        };
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (err) {
      console.error('Login error:', err);
      return { success: false, error: err.message };
    }
  };
  
  const logout = () => {
    // Clear auth data from localStorage
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_role');
    
    // Update state
    setUser(null);
    setRole(null);
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
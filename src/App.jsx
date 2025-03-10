import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider } from './contexts/AuthContext';
import RequireAuth from './components/auth/RequireAuth';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Pages
import HomePage from './pages/HomePage';
import TestPage from './pages/TestPage';
import ResultsPage from './pages/ResultsPage';
import LoginPage from './pages/LoginPage';
import CoachPage from './pages/CoachPage';
import AdminPage from './pages/AdminPage';
import MigratePage from './pages/MigratePage';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <LanguageProvider>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/test" element={<TestPage />} />
              <Route path="/results/grid/:id" element={<ResultsPage view="grid" />} />
              <Route path="/results/list/:id" element={<ResultsPage view="list" />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/coach/login" element={<LoginPage />} />
              <Route path="/admin/login" element={<LoginPage />} />
              
              {/* Protected routes */}
              <Route 
                path="/coach/*" 
                element={
                  <RequireAuth role="coach">
                    <CoachPage />
                  </RequireAuth>
                } 
              />
              <Route 
                path="/admin/*" 
                element={
                  <RequireAuth role="admin">
                    <AdminPage />
                  </RequireAuth>
                } 
              />
              
              {/* Migration utility - admin only */}
              <Route 
                path="/migrate" 
                element={
                  <RequireAuth role="admin">
                    <MigratePage />
                  </RequireAuth>
                } 
              />
              
              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </LanguageProvider>
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
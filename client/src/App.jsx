import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import BoardPage from './pages/BoardPage';

// Protected route wrapper
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen bg-quest-bg flex items-center justify-center">
    <div className="text-quest-purple-light font-game text-xl animate-pulse">LOADING...</div>
  </div>;
  return user ? children : <Navigate to="/login" replace />;
};

// Public route — redirect to dashboard if already logged in
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/dashboard" replace /> : children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<PublicRoute><Landing /></PublicRoute>} />
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/board/:projectId" element={<ProtectedRoute><BoardPage /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        {/* Toast notifications with game theme */}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1a1a2e',
              color: '#e2e8f0',
              border: '1px solid rgba(124, 58, 237, 0.4)',
              fontFamily: 'Rajdhani, sans-serif',
              fontSize: '16px',
            },
            success: { iconTheme: { primary: '#34d399', secondary: '#1a1a2e' } },
            error: { iconTheme: { primary: '#f87171', secondary: '#1a1a2e' } },
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

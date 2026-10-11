import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Welcome from './pages/Welcome';
import Register from './pages/Register';
import Login from './pages/Login';
import WelcomePopup from './components/WelcomePopup';
import { useFetchItems } from './hooks/useFetchItems';
import { checkServerHealth } from './services/api';
import './App.css';

export default function App() {
  // Navigation views: 'welcome' | 'register' | 'login' | 'home'
  const [currentView, setCurrentView] = useState('welcome');
  const [showWelcomePopup, setShowWelcomePopup] = useState(true);
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const stored = localStorage.getItem('zeo_auth_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const { items, setItems, loading, error, refetch } = useFetchItems();
  const [dbStatus, setDbStatus] = useState('checking'); // 'connected' | 'disconnected' | 'checking'

  useEffect(() => {
    const verifyConnection = async () => {
      try {
        const res = await checkServerHealth();
        if (res.database === 'connected') {
          setDbStatus('connected');
        } else {
          setDbStatus('disconnected');
        }
      } catch {
        setDbStatus('disconnected');
      }
    };

    verifyConnection();
    const interval = setInterval(verifyConnection, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleRegisterSuccess = (user) => {
    setCurrentUser(user);
    setCurrentView('home');
  };

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    setCurrentView('home');
  };

  const handleLogout = () => {
    localStorage.removeItem('zeo_auth_token');
    localStorage.removeItem('zeo_auth_user');
    setCurrentUser(null);
    setCurrentView('welcome');
    setShowWelcomePopup(true); // show welcome popup again on logout
  };

  return (
    <div className="app">
      {/* 3-Second Welcome Popup on Initial Visit */}
      <WelcomePopup
        isOpen={showWelcomePopup}
        onClose={() => setShowWelcomePopup(false)}
      />

      <Navbar
        dbStatus={dbStatus}
        currentUser={currentUser}
        currentView={currentView}
        onNavigate={setCurrentView}
        onLogout={handleLogout}
      />

      {currentView === 'welcome' && (
        <Welcome
          onNavigateToRegister={() => setCurrentView('register')}
          onNavigateToLogin={() => setCurrentView('login')}
          dbStatus={dbStatus}
          isPopupActive={showWelcomePopup}
        />
      )}

      {currentView === 'register' && (
        <Register
          onNavigateToLogin={() => setCurrentView('login')}
          onNavigateToWelcome={() => setCurrentView('welcome')}
          onRegisterSuccess={handleRegisterSuccess}
        />
      )}

      {currentView === 'login' && (
        <Login
          onNavigateToRegister={() => setCurrentView('register')}
          onNavigateToWelcome={() => setCurrentView('welcome')}
          onLoginSuccess={handleLoginSuccess}
        />
      )}

      {currentView === 'home' && (
        <Home
          items={items}
          setItems={setItems}
          loading={loading}
          error={error}
          onRefresh={refetch}
          dbStatus={dbStatus}
          currentUser={currentUser}
        />
      )}

      <footer className="footer">
        <div className="footer-content">
          <p className="footer-main">
            Development Progress Tracking System &bull; Zonal Education Office Katugastota
          </p>
          <p className="footer-sub">
            Government of Sri Lanka &bull; Central Province &bull; All Rights Reserved
          </p>
        </div>
      </footer>
    </div>
  );
}

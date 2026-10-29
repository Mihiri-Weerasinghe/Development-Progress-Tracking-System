import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Welcome from './pages/Welcome';
import Register from './pages/Register';
import Login from './pages/Login';
import FundingDashboard from './pages/FundingDashboard';
import AdminPanel from './pages/AdminPanel';
import WelcomePopup from './components/WelcomePopup';
import { useFetchItems } from './hooks/useFetchItems';
import { useDataProtection } from './hooks/useDataProtection';
import { checkServerHealth } from './services/api';
import { ShieldAlert } from 'lucide-react';
import './App.css';

export default function App() {
  const { securityNotice } = useDataProtection();

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const stored = localStorage.getItem('zeo_auth_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  // Navigation views: 'welcome' | 'register' | 'login' | 'home' | 'dashboard'
  const [currentView, setCurrentView] = useState('welcome');

  const [showWelcomePopup, setShowWelcomePopup] = useState(true);

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

  // Protect private views: only accessible after login
  useEffect(() => {
    if (!currentUser && (currentView === 'dashboard' || currentView === 'home' || currentView === 'admin')) {
      setCurrentView('login');
    }
  }, [currentUser, currentView]);

  const handleRegisterSuccess = (user) => {
    setCurrentUser(user);
    setCurrentView('dashboard');
  };

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    // Officers land directly on the Funding Overview Dashboard
    setCurrentView('dashboard');
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
      {/* Confidential Data Protection Security Notice Toast */}
      {securityNotice && (
        <div className="confidential-toast-overlay" role="alert">
          <ShieldAlert size={18} className="confidential-shield-icon" />
          <span dangerouslySetInnerHTML={{ __html: securityNotice }} />
        </div>
      )}

      {/* 3-Second Welcome Popup on Initial Visit */}
      <WelcomePopup
        isOpen={showWelcomePopup}
        onClose={() => setShowWelcomePopup(false)}
      />

      {currentView !== 'dashboard' && (
        <Navbar
          dbStatus={dbStatus}
          currentUser={currentUser}
          currentView={currentView}
          onNavigate={setCurrentView}
          onLogout={handleLogout}
        />
      )}

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

      {currentView === 'dashboard' && (
        <FundingDashboard
          currentUser={currentUser}
          onNavigate={setCurrentView}
          onLogout={handleLogout}
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

      {currentView === 'admin' && (
        <AdminPanel
          currentUser={currentUser}
          onNavigate={setCurrentView}
          onLogout={handleLogout}
        />
      )}

      {currentView !== 'dashboard' && (
        <footer className="footer">
          <div className="footer-content">
            <p className="footer-main">
              Development Progress Tracking System &bull; Zonal Education Office Katugastota
            </p>
            <p className="footer-sub">
              All Rights Reserved
            </p>
          </div>
        </footer>
      )}
    </div>
  );
}

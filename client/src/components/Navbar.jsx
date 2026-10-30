import React from 'react';
import OfficeLogo from './OfficeLogo';
import { User, LogOut, UserPlus, LogIn, LayoutDashboard, Layers, Shield } from 'lucide-react';

export default function Navbar({
  dbStatus,
  currentUser,
  currentView,
  onNavigate,
  onLogout,
}) {
  const getStatusBadge = () => {
    switch (dbStatus) {
      case 'connected':
        return (
          <span className="badge badge-success" title="Database is connected">
            <span className="dot dot-success"></span> Cloud Connected
          </span>
        );
      case 'disconnected':
        return (
          <span className="badge badge-error" title="Database is offline">
            <span className="dot dot-error"></span> DB Offline
          </span>
        );
      default:
        return (
          <span className="badge badge-warning">
            <span className="dot dot-warning"></span> Checking...
          </span>
        );
    }
  };

  return (
    <header className="navbar">
      <div className="navbar-container">
        <div
          className="logo-container clickable"
          onClick={() => onNavigate(currentUser ? 'dashboard' : 'welcome')}
          title={currentUser ? "Go to Funding Dashboard" : "Return to Welcome Screen"}
        >
          <OfficeLogo size={48} rounded={false} />
          <div className="brand-text-group">
            <span className="brand-title">Zonal Education Office Katugastota</span>
            <span className="brand-subtitle">කටුගස්තොට කලාප අධ්‍යාපන කාර්යාලය</span>
          </div>
        </div>

        <div className="nav-right-section">
          {/* Status Badge */}
          <div className="status-container">{getStatusBadge()}</div>

          {/* Navigation Links / User info */}
          <div className="nav-actions">
            {currentUser ? (
              <div className="user-profile-bar">
                <div className="nav-user-badge">
                  <User size={16} />
                  <span className="user-name">{currentUser.name}</span>
                  <span className="user-role-chip">{currentUser.role}</span>
                </div>

                {currentView !== 'dashboard' && (
                  <button
                    type="button"
                    className="nav-btn nav-btn-outline"
                    onClick={() => onNavigate('dashboard')}
                    title="Overview of Funding Sources"
                  >
                    <LayoutDashboard size={15} />
                    <span>Funding Dashboard</span>
                  </button>
                )}

                {currentView !== 'home' && (
                  <button
                    type="button"
                    className="nav-btn nav-btn-outline"
                    onClick={() => onNavigate('home')}
                    title="Items and Progress List"
                  >
                    <Layers size={15} />
                    <span>Items List</span>
                  </button>
                )}

                {currentUser.role === 'Admin' && currentView !== 'admin' && (
                  <button
                    type="button"
                    className="nav-btn nav-btn-outline"
                    style={{ borderColor: '#16a34a', color: '#15803d', fontWeight: 700 }}
                    onClick={() => onNavigate('admin')}
                    title="Open Administrator Panel"
                  >
                    <Shield size={15} />
                    <span>Admin Panel</span>
                  </button>
                )}

                <button
                  type="button"
                  className="nav-btn nav-btn-logout"
                  onClick={onLogout}
                  title="Log out"
                >
                  <LogOut size={15} />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="nav-auth-buttons">
                {currentView !== 'welcome' && (
                  <button
                    type="button"
                    className="nav-btn nav-btn-ghost"
                    onClick={() => onNavigate('welcome')}
                  >
                    Welcome
                  </button>
                )}

                {currentView !== 'login' && (
                  <button
                    type="button"
                    className={`nav-btn ${
                      currentView === 'login' ? 'active' : 'nav-btn-outline'
                    }`}
                    onClick={() => onNavigate('login')}
                  >
                    <LogIn size={15} />
                    <span>Login</span>
                  </button>
                )}

                {currentView !== 'register' && (
                  <button
                    type="button"
                    className="nav-btn nav-btn-primary"
                    onClick={() => onNavigate('register')}
                  >
                    <UserPlus size={15} />
                    <span>Create Account</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

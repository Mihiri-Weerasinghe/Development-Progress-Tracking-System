import React from 'react';
import { UserPlus, LogIn, Award, Building2, BarChart3, ShieldCheck, ChevronRight } from 'lucide-react';
import OfficeLogo from '../components/OfficeLogo';

export default function Welcome({
  onNavigateToRegister,
  onNavigateToLogin,
  dbStatus,
  isPopupActive,
}) {
  return (
    <div className="welcome-page">
      {/* Background Decorative Accents */}
      <div className="welcome-glow-top"></div>
      <div className="welcome-glow-bottom"></div>

      <div className="welcome-card">
        {/* Official Education Zone Logo */}
        <div className="emblem-container animate-fade-in">
          <OfficeLogo size={120} rounded={false} />
        </div>

        {/* Main Titles */}
        <div className="welcome-headers animate-fade-in">
          <h2 className="sinhala-title">කටුගස්තොට කලාප අධ්‍යාපන කාර්යාලය</h2>
          <h1 className="welcome-main-title">ZONAL EDUCATION OFFICE</h1>
          <h3 className="welcome-sub-title">KATUGASTOTA</h3>

          <div className="system-pill">
            <BarChart3 size={18} className="pill-icon" />
            <span>Education Development Progress Tracking System</span>
          </div>

          <p className="welcome-description">
            Official educational management portal for tracking school progress, administrative targets,
            and zonal development projects across Katugastota Education Zone.
          </p>
        </div>

        {/* Account Entry Options (Visible and ready after the popup) */}
        <div className="welcome-actions animate-fade-in-up">
          {/* Login Button */}
          <button
            id="btn-login-main"
            type="button"
            className="welcome-btn btn-login-main"
            onClick={onNavigateToLogin}
          >
            <div className="btn-icon-wrapper">
              <LogIn size={22} />
            </div>
            <div className="btn-text-block">
              <span className="btn-primary-text">Login to Account</span>
              <span className="btn-secondary-text">පද්ධතියට ඇතුල් වන්න</span>
            </div>
            <ChevronRight size={20} className="btn-arrow" />
          </button>

          {/* Register Button */}
          <button
            id="btn-create-account"
            type="button"
            className="welcome-btn btn-register-main"
            onClick={onNavigateToRegister}
          >
            <div className="btn-icon-wrapper">
              <UserPlus size={22} />
            </div>
            <div className="btn-text-block">
              <span className="btn-primary-text">Create New Account</span>
              <span className="btn-secondary-text">නව ගිණුමක් සාදන්න</span>
            </div>
            <ChevronRight size={20} className="btn-arrow" />
          </button>
        </div>

        {/* Quick Highlights of the System */}
        <div className="system-features-grid">
          <div className="feature-item">
            <Building2 size={20} className="feature-icon" />
            <div>
              <strong>School Projects</strong>
              <p>Zonal school upgrades & tracking</p>
            </div>
          </div>
          <div className="feature-item">
            <Award size={20} className="feature-icon" />
            <div>
              <strong>Education Standards</strong>
              <p>Official progress metrics</p>
            </div>
          </div>
          <div className="feature-item">
            <ShieldCheck size={20} className="feature-icon" />
            <div>
              <strong>Officer Access</strong>
              <p>Authorized personnel verification</p>
            </div>
          </div>
        </div>

        {/* Database Status indicator */}
        <div className="welcome-footer-meta">
          <span className="meta-text">Database: </span>
          {dbStatus === 'connected' ? (
            <span className="meta-badge meta-connected">&bull; Connected to Atlas</span>
          ) : dbStatus === 'disconnected' ? (
            <span className="meta-badge meta-disconnected">&bull; Offline / Reconnecting</span>
          ) : (
            <span className="meta-badge meta-checking">&bull; Checking...</span>
          )}
        </div>
      </div>
    </div>
  );
}

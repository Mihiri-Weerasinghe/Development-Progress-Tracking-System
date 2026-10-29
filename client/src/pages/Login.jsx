import React, { useState, useEffect } from 'react';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Building2,
  Shield,
  Loader2,
} from 'lucide-react';
import OfficeLogo from '../components/OfficeLogo';
import { loginUser } from '../services/api';

export default function Login({ onNavigateToRegister, onNavigateToWelcome, onLoginSuccess }) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    officerUsername: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Clear any browser-cached or auto-filled credential on initial mount
  useEffect(() => {
    setFormData({
      email: '',
      password: '',
      officerUsername: '',
    });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errorMessage) setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email.trim() || !formData.password) {
      setErrorMessage('Please enter both email/contact number and password.');
      return;
    }

    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const res = await loginUser({
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      });

      if (res.token) {
        localStorage.setItem('zeo_auth_token', res.token);
        localStorage.setItem('zeo_auth_user', JSON.stringify(res.data));
      }

      setSuccessMessage(`Welcome back, ${res.data?.name || 'Officer'}! Logging in...`);
      setTimeout(() => {
        if (onLoginSuccess) {
          onLoginSuccess(res.data);
        }
      }, 1000);
    } catch (err) {
      const serverErr =
        err.response?.data?.message ||
        'Login failed. Please check your credentials or backend server.';
      setErrorMessage(serverErr);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-glow-accent"></div>

      <div className="auth-container">
        {/* Navigation Bar */}
        <div className="auth-top-nav">
          <button
            type="button"
            className="back-nav-btn"
            onClick={onNavigateToWelcome}
          >
            <ArrowLeft size={18} />
            <span>Back to Portal</span>
          </button>

          <div className="office-tag">
            <Building2 size={16} />
            <span>Katugastota Zone</span>
          </div>
        </div>

        {/* Card Header */}
        <div className="auth-header">
          <OfficeLogo size={75} />
          <div className="auth-title-block">
            <h1 className="auth-title">Officer Login</h1>
            <h2 className="auth-sinhala-subtitle">කටුගස්තොට කලාප අධ්‍යාපන කාර්යාලය</h2>
            <p className="auth-system-desc">
              Development Progress Tracking System
            </p>
          </div>
        </div>

        {/* Alerts */}
        {errorMessage && (
          <div className="auth-alert alert-error animate-shake">
            <AlertCircle size={20} className="alert-icon" />
            <div className="alert-text">{errorMessage}</div>
          </div>
        )}

        {successMessage && (
          <div className="auth-alert alert-success animate-fade-in">
            <CheckCircle2 size={20} className="alert-icon" />
            <div className="alert-text">{successMessage}</div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="auth-form" autoComplete="off">
          {/* Hidden inputs to divert aggressive browser autofill heuristics */}
          <input
            type="text"
            style={{ position: 'absolute', opacity: 0, height: 0, width: 0, zIndex: -1 }}
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
          />
          <input
            type="password"
            style={{ position: 'absolute', opacity: 0, height: 0, width: 0, zIndex: -1 }}
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
          />

          <div className="form-group">
            <label className="form-label">
              <span>Username / Official Email or Contact Number (පරිශීලක නාමය / විද්‍යුත් තැපෑල හෝ දුරකථන අංකය)</span>
              <span className="required-star">*</span>
            </label>
            <div className="input-wrapper">
              <Mail size={18} className="input-icon" />
              <input
                type="text"
                name="officerUsername"
                value={formData.officerUsername || formData.email}
                onChange={(e) => {
                  const val = e.target.value;
                  setFormData((prev) => ({ ...prev, email: val, officerUsername: val }));
                  if (errorMessage) setErrorMessage('');
                }}
                className="form-input"
                required
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
                data-lpignore="true"
                data-form-type="other"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              <span>Password (මුරපදය)</span>
              <span className="required-star">*</span>
            </label>
            <div className="input-wrapper">
              <Lock size={18} className="input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="officerPassword"
                value={formData.password}
                onChange={(e) => {
                  const val = e.target.value;
                  setFormData((prev) => ({ ...prev, password: val }));
                  if (errorMessage) setErrorMessage('');
                }}
                className="form-input"
                required
                autoComplete="new-password"
                data-lpignore="true"
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="submit-btn login-submit-btn"
          >
            {loading ? (
              <>
                <Loader2 size={20} className="spinner-icon" />
                <span>Authenticating Officer...</span>
              </>
            ) : (
              <>
                <LogIn size={20} />
                <span>Login to System &bull; ඇතුල් වන්න</span>
              </>
            )}
          </button>
        </form>

        {/* Footer Link to Register */}
        <div className="auth-footer">
          <p className="auth-switch-text">
            Don&apos;t have an account yet?{' '}
            <button
              type="button"
              className="switch-link-btn"
              onClick={onNavigateToRegister}
            >
              Create Account (නව ගිණුමක් සාදන්න)
            </button>
          </p>

          <div className="auth-security-notice">
            <Shield size={14} />
            <span>Authorized staff access only. Activity is monitored and logged.</span>
          </div>
        </div>
      </div>
    </div>
  );
}

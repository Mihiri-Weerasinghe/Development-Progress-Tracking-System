import React, { useState } from 'react';
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Briefcase,
  Phone,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  UserPlus,
  Building2,
  Shield,
  Loader2,
} from 'lucide-react';
import OfficeLogo from '../components/OfficeLogo';
import { registerUser } from '../services/api';

export default function Register({ onNavigateToLogin, onNavigateToWelcome, onRegisterSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'Director',
    phone: '',
    password: '',
    confirmPassword: '',
    isAuthorizedOfficer: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [registeredUser, setRegisteredUser] = useState(null);

  const roles = [
    { value: 'Director', label: 'Director (අධ්‍යක්ෂ)' },
    { value: 'Deputy Director', label: 'Deputy Director (නියෝජ්‍ය අධ්‍යක්ෂ)' },
    { value: 'Staff Member', label: 'Staff Member (කාර්ය මණ්ඩලය)' },
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errorMessage) setErrorMessage('');
  };

  const validate = () => {
    if (!formData.name.trim()) {
      return 'Please enter your full name (සම්පූර්ණ නම ඇතුළත් කරන්න).';
    }
    // Email is optional: validate format only if provided
    if (formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        return 'Please enter a valid email address (වලංගු විද්‍යුත් ලිපිනයක් ඇතුළත් කරන්න).';
      }
    }
    // Contact number is required
    if (!formData.phone.trim()) {
      return 'Please enter your contact number (දුරකථන අංකය ඇතුළත් කරන්න).';
    }
    const cleanPhone = formData.phone.replace(/[\s\-]/g, '');
    if (cleanPhone.length < 9) {
      return 'Please enter a valid contact number (අවම වශයෙන් ඉලක්කම් 9-10ක් සහිත වලංගු දුරකථන අංකයක් ඇතුළත් කරන්න).';
    }
    if (!formData.password) {
      return 'Please enter a password (මුරපදයක් ඇතුළත් කරන්න).';
    }
    if (formData.password.length < 6) {
      return 'Password must be at least 6 characters long (මුරපදය අකුරු 6කට වැඩි විය යුතුය).';
    }
    if (formData.password !== formData.confirmPassword) {
      return 'Passwords do not match (මුරපද දෙක එකිනෙක නොගැලපේ).';
    }
    if (!formData.isAuthorizedOfficer) {
      return 'Please confirm that you are an authorized officer of the Zonal Education Office - Katugastota.';
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const error = validate();
    if (error) {
      setErrorMessage(error);
      return;
    }

    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim() ? formData.email.trim().toLowerCase() : '',
        password: formData.password,
        role: formData.role,
        phone: formData.phone.trim(),
      };

      const hasEmail = Boolean(formData.email && formData.email.trim());

      const res = await registerUser(payload);

      if (res.token) {
        localStorage.setItem('zeo_auth_token', res.token);
        localStorage.setItem('zeo_auth_user', JSON.stringify(res.data));
      }

      if (!hasEmail) {
        // Officer did not provide email -> Show interactive popup modal
        setRegisteredUser(res.data);
        setShowSuccessPopup(true);
      } else {
        // Officer provided email -> Confirmation email was sent to their email
        const targetEmail = res.data?.email || formData.email.trim();
        if (res.emailStatus && res.emailStatus.sent === false) {
          setSuccessMessage(
            `Account created successfully! (Notice: Confirmation email to ${targetEmail} could not be dispatched: ${res.emailStatus.error || 'Check server configuration'}). Redirecting...`
          );
        } else {
          setSuccessMessage(
            `Account created successfully! A confirmation email has been sent to ${targetEmail}. Please check your Inbox and Spam/Junk folder. Redirecting...`
          );
        }
        setTimeout(() => {
          if (onRegisterSuccess) {
            onRegisterSuccess(res.data);
          } else {
            onNavigateToLogin();
          }
        }, 2400);
      }
    } catch (err) {
      const serverErr =
        err.response?.data?.message ||
        'Registration failed. Please check backend server and MongoDB Cloud connection.';
      setErrorMessage(serverErr);
    } finally {
      setLoading(false);
    }
  };

  const handlePopupProceed = () => {
    setShowSuccessPopup(false);
    if (onRegisterSuccess && registeredUser) {
      onRegisterSuccess(registeredUser);
    } else {
      onNavigateToLogin();
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
            <h1 className="auth-title">Officer Registration</h1>
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
        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          {/* Full Name */}
          <div className="form-group">
            <label className="form-label">
              <span>Full Name (සම්පූර්ණ නම)</span>
              <span className="required-star">*</span>
            </label>
            <div className="input-wrapper">
              <User size={18} className="input-icon" />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="form-input"
                required
                autoComplete="name"
              />
            </div>
          </div>

          {/* Email Address (Optional) */}
          <div className="form-group">
            <label className="form-label">
              <span>Official Email (නිල විද්‍යුත් තැපෑල)</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500, marginLeft: '0.35rem' }}>(Optional / විකල්පයි)</span>
            </label>
            <div className="input-wrapper">
              <Mail size={18} className="input-icon" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="form-input"
                autoComplete="email"
              />
            </div>
            <span className="field-hint">Optional: Enter if you wish to receive system email updates</span>
          </div>

          {/* Designation / Role */}
          <div className="form-group">
            <label className="form-label">
              <span>Designation / Role (තනතුර)</span>
              <span className="required-star">*</span>
            </label>
            <div className="input-wrapper">
              <Briefcase size={18} className="input-icon" />
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="form-input select-input"
              >
                {roles.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Contact Number (Required) */}
          <div className="form-group">
            <label className="form-label">
              <span>Contact Number (දුරකථන අංකය)</span>
              <span className="required-star">*</span>
            </label>
            <div className="input-wrapper">
              <Phone size={18} className="input-icon" />
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>
            <span className="field-hint">Required for official communication and account identification</span>
          </div>

          {/* Grid row: Password & Confirm Password */}
          <div className="form-grid-row">
            {/* Password */}
            <div className="form-group">
              <label className="form-label">
                <span>Password (මුරපදය)</span>
                <span className="required-star">*</span>
              </label>
              <div className="input-wrapper">
                <Lock size={18} className="input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="form-input"
                  required
                  autoComplete="new-password"
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

            {/* Confirm Password */}
            <div className="form-group">
              <label className="form-label">
                <span>Confirm Password (තහවුරු කිරීම)</span>
                <span className="required-star">*</span>
              </label>
              <div className="input-wrapper">
                <Lock size={18} className="input-icon" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="form-input"
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label="Toggle password visibility"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </div>

          {/* Authorization Checkbox */}
          <div className="form-checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="isAuthorizedOfficer"
                checked={formData.isAuthorizedOfficer}
                onChange={handleChange}
                className="form-checkbox"
              />
              <span className="checkbox-text">
                I hereby declare that I am an authorized officer/staff member of the
                <strong> Zonal Education Office - Katugastota</strong>.
              </span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="submit-btn register-submit-btn"
          >
            {loading ? (
              <>
                <Loader2 size={20} className="spinner-icon" />
                <span>Registering Officer Account...</span>
              </>
            ) : (
              <>
                <UserPlus size={20} />
                <span>Create Officer Account &bull; ගිණුම සාදන්න</span>
              </>
            )}
          </button>
        </form>

        {/* Footer Link to Login */}
        <div className="auth-footer">
          <p className="auth-switch-text">
            Already have an officer account?{' '}
            <button
              type="button"
              className="switch-link-btn"
              onClick={onNavigateToLogin}
            >
              Login here (ඇතුල් වන්න)
            </button>
          </p>

          <div className="auth-security-notice">
            <Shield size={14} />
            <span>Restricted to authorized educational administration personnel only.</span>
          </div>
        </div>
      </div>

      {/* Registration Success Popup for Officers Without an Email */}
      {showSuccessPopup && registeredUser && (
        <div className="popup-backdrop">
          <div className="popup-card register-success-popup animate-zoom-in">
            <div className="register-success-icon-wrapper">
              <CheckCircle2 size={50} className="register-success-check" />
            </div>

            <h2 className="register-success-title">
              Registration Successful!
            </h2>
            <p className="register-success-sinhala">
              කටුගස්තොට කලාප අධ්‍යාපන කාර්යාලය
            </p>

            <p className="register-success-desc">
              Welcome, <strong>{registeredUser.name}</strong>! Your officer account has been created and registered successfully on the system.
            </p>

            {/* Officer Details Summary Box */}
            <div className="register-success-details">
              <div className="success-detail-row">
                <span className="success-detail-label">Designation (තනතුර):</span>
                <span className="success-detail-value">{registeredUser.role}</span>
              </div>
              <div className="success-detail-row">
                <span className="success-detail-label">Contact Number (දුරකථනය):</span>
                <span className="success-detail-value">{registeredUser.phone}</span>
              </div>
              <div className="success-detail-row">
                <span className="success-detail-label">Account Status (තත්ත්වය):</span>
                <span className="success-detail-badge">Active (ක්‍රියාකාරී)</span>
              </div>
            </div>

            {/* Notice about logging in with Contact Number */}
            <div className="register-success-tip">
              <span className="tip-icon">💡</span>
              <div>
                ඔබගේ <strong>Contact Number ({registeredUser.phone})</strong> සහ Password එක භාවිතා කර ඉදිරියේදී ඕනෑම මොහොතක පද්ධතියට Log විය හැක.
              </div>
            </div>

            {/* Action button */}
            <button
              type="button"
              className="register-popup-proceed-btn"
              onClick={handlePopupProceed}
            >
              <span>Proceed to Dashboard (ඇතුල් වන්න)</span>
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

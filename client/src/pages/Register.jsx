import React, { useState } from 'react';
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Briefcase,
  IdCard,
  Phone,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
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
    role: 'Development Officer',
    employeeId: '',
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

  const roles = [
    { value: 'Zonal Director', label: 'Zonal Director (කලාප අධ්‍යක්ෂ)' },
    { value: 'Deputy Director', label: 'Deputy Director (නියෝජ්‍ය අධ්‍යක්ෂ)' },
    { value: 'Planning Officer', label: 'Planning Officer (සැලසුම් නිලධාරී)' },
    { value: 'Development Officer', label: 'Development Officer (සංවර්ධන නිලධාරී)' },
    { value: 'IT Officer', label: 'IT Officer (තොරතුරු තාක්ෂණ නිලධාරී)' },
    { value: 'Sectional Head', label: 'Sectional Head (අංශ ප්‍රධානී)' },
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
    if (!formData.email.trim()) {
      return 'Please enter your official email address (විද්‍යුත් ලිපිනය ඇතුළත් කරන්න).';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      return 'Please enter a valid email address (වලංගු විද්‍යුත් ලිපිනයක් ඇතුළත් කරන්න).';
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
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        role: formData.role,
        employeeId: formData.employeeId.trim(),
        phone: formData.phone.trim(),
      };

      const res = await registerUser(payload);

      if (res.token) {
        localStorage.setItem('zeo_auth_token', res.token);
        localStorage.setItem('zeo_auth_user', JSON.stringify(res.data));
      }

      setSuccessMessage('Account created successfully! Redirection in progress...');
      setTimeout(() => {
        if (onRegisterSuccess) {
          onRegisterSuccess(res.data);
        } else {
          onNavigateToLogin();
        }
      }, 1500);
    } catch (err) {
      const serverErr =
        err.response?.data?.message ||
        'Registration failed. Please check backend server and MongoDB Cloud connection.';
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
            <span className="gov-mini-tag">Government of Sri Lanka</span>
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
                placeholder="e.g. K.M. Bandara"
                className="form-input"
                required
                autoComplete="name"
              />
            </div>
          </div>

          {/* Email Address */}
          <div className="form-group">
            <label className="form-label">
              <span>Official Email (නිල විද්‍යුත් තැපෑල)</span>
              <span className="required-star">*</span>
            </label>
            <div className="input-wrapper">
              <Mail size={18} className="input-icon" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="officer@katugastota.edu.lk"
                className="form-input"
                required
                autoComplete="email"
              />
            </div>
            <span className="field-hint">Use your official or departmental email address</span>
          </div>

          {/* Grid row: Role & Staff ID */}
          <div className="form-grid-row">
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

            {/* Staff / Employee ID */}
            <div className="form-group">
              <label className="form-label">
                <span>Employee / Staff ID (සේවක අංකය)</span>
              </label>
              <div className="input-wrapper">
                <IdCard size={18} className="input-icon" />
                <input
                  type="text"
                  name="employeeId"
                  value={formData.employeeId}
                  onChange={handleChange}
                  placeholder="e.g. ZE-KG-1042"
                  className="form-input"
                />
              </div>
            </div>
          </div>

          {/* Contact Number */}
          <div className="form-group">
            <label className="form-label">
              <span>Contact Number (දුරකථන අංකය)</span>
            </label>
            <div className="input-wrapper">
              <Phone size={18} className="input-icon" />
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="e.g. 081-2498222 / 077-1234567"
                className="form-input"
              />
            </div>
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
                  placeholder="At least 6 characters"
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
                  placeholder="Re-enter password"
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
    </div>
  );
}

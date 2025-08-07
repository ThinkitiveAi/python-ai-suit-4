import React, { useState } from 'react';
import { Eye, EyeOff, Stethoscope, User, Lock, AlertCircle, CheckCircle } from 'lucide-react';
import './ProviderLogin.css';

const ProviderLogin = ({ onSwitchToRegistration, onSwitchToPatient, onBackToSelector, onLoginSuccess }) => {
  const [formData, setFormData] = useState({
    emailOrPhone: '',
    password: '',
    rememberMe: false
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSuccess, setIsSuccess] = useState(false);

  // Validation functions
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone) => {
    const phoneRegex = /^[+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/[\s\-()]/g, ''));
  };

  const validateForm = () => {
    const newErrors = {};

    // Email/Phone validation
    if (!formData.emailOrPhone.trim()) {
      newErrors.emailOrPhone = 'Email or phone number is required';
    } else {
      const isEmail = validateEmail(formData.emailOrPhone);
      const isPhone = validatePhone(formData.emailOrPhone);
      
      if (!isEmail && !isPhone) {
        newErrors.emailOrPhone = 'Please enter a valid email or phone number';
      }
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    // Simulate API call
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate successful login
      setIsSuccess(true);
      setTimeout(() => {
        // Call the login success callback with user data
        if (onLoginSuccess) {
          onLoginSuccess({
            id: 'provider-1',
            name: 'Dr. Sarah Johnson',
            email: formData.emailOrPhone,
            type: 'provider',
            specialization: 'Cardiology'
          });
        }
      }, 1000);
      
    } catch (error) {
      setErrors({
        general: 'Login failed. Please check your credentials and try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    alert('Forgot password functionality would be implemented here');
  };

  const handleRegister = () => {
    if (onSwitchToRegistration) {
      onSwitchToRegistration();
    }
  };

  return (
    <div className="provider-login">
      <div className="login-container">
        {/* Header Section */}
        <div className="login-header">
          <div className="logo-section">
            <div className="logo-icon">
              <Stethoscope size={32} />
            </div>
            <h1 className="logo-text">Health First</h1>
          </div>
          <h2 className="login-title">Provider Login</h2>
          <p className="login-subtitle">
            Access your healthcare dashboard securely
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="login-form" noValidate>
          {errors.general && (
            <div className="error-message general-error">
              <AlertCircle size={16} />
              <span>{errors.general}</span>
            </div>
          )}

          {/* Email/Phone Input */}
          <div className="form-group">
            <label htmlFor="emailOrPhone" className="form-label">
              Email or Phone Number
            </label>
            <div className="input-wrapper">
              <User size={20} className="input-icon" />
              <input
                type="text"
                id="emailOrPhone"
                name="emailOrPhone"
                value={formData.emailOrPhone}
                onChange={handleInputChange}
                className={`form-input ${errors.emailOrPhone ? 'error' : ''}`}
                placeholder="Enter your email or phone number"
                autoComplete="email"
                disabled={isLoading}
                aria-describedby={errors.emailOrPhone ? 'emailOrPhone-error' : undefined}
              />
            </div>
            {errors.emailOrPhone && (
              <div id="emailOrPhone-error" className="error-message">
                <AlertCircle size={14} />
                <span>{errors.emailOrPhone}</span>
              </div>
            )}
          </div>

          {/* Password Input */}
          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <div className="input-wrapper">
              <Lock size={20} className="input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={`form-input ${errors.password ? 'error' : ''}`}
                placeholder="Enter your password"
                autoComplete="current-password"
                disabled={isLoading}
                aria-describedby={errors.password ? 'password-error' : undefined}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.password && (
              <div id="password-error" className="error-message">
                <AlertCircle size={14} />
                <span>{errors.password}</span>
              </div>
            )}
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="form-options">
            <label className="checkbox-wrapper">
              <input
                type="checkbox"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleInputChange}
                disabled={isLoading}
                className="checkbox-input"
              />
              <span className="checkbox-custom"></span>
              <span className="checkbox-label">Remember me</span>
            </label>
            <button
              type="button"
              className="forgot-password"
              onClick={handleForgotPassword}
              disabled={isLoading}
            >
              Forgot Password?
            </button>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            className={`login-button ${isLoading ? 'loading' : ''} ${isSuccess ? 'success' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="spinner"></div>
                <span>Signing in...</span>
              </>
            ) : isSuccess ? (
              <>
                <CheckCircle size={20} />
                <span>Success!</span>
              </>
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>

        {/* Footer Links */}
        <div className="login-footer">
          <p className="footer-text">
            New to Health First?{' '}
            <button
              type="button"
              className="footer-link"
              onClick={handleRegister}
              disabled={isLoading}
            >
              Register as Provider
            </button>
          </p>
          <div className="footer-links">
            <button 
              type="button" 
              className="footer-link small"
              onClick={onSwitchToPatient}
            >
              Patient Login
            </button>
            <span className="footer-separator">•</span>
            <button 
              type="button" 
              className="footer-link small"
              onClick={onBackToSelector}
            >
              Back to Menu
            </button>
            <span className="footer-separator">•</span>
            <button type="button" className="footer-link small">Support</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderLogin; 
import React, { useState } from 'react';
import { FiUser, FiLock, FiMail, FiArrowRight, FiEye, FiEyeOff, FiCheck, FiX } from 'react-icons/fi';
import { register } from '../../api/authApi';
import { TextField, Button, InputAdornment, IconButton, Box, Typography } from '@mui/material';
import { ElMessage } from '../../utils/message';

const SignupPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: ''
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, label: '', color: '' });
  const [formErrors, setFormErrors] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: ''
  });

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const checkPasswordStrength = (password) => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    
    const strengthData = {
      0: { label: 'Very Weak', color: '#ef4444' },
      1: { label: 'Weak', color: '#f97316' },
      2: { label: 'Fair', color: '#eab308' },
      3: { label: 'Good', color: '#22c55e' },
      4: { label: 'Strong', color: '#10b981' }
    };
    return { score, ...strengthData[score] };
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (value) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
    
    if (field === 'email') {
      setEmailError(validateEmail(value) ? '' : 'Please enter a valid email address');
    }
    if (field === 'password') {
      setPasswordStrength(checkPasswordStrength(value));
    }
  };

  const validateForm = () => {
    const errors = {};
    let isValid = true;
    
    if (!formData.name) {
      errors.name = 'Full name is required';
      isValid = false;
    }
    if (!formData.email) {
      errors.email = 'Email is required';
      isValid = false;
    } else if (!validateEmail(formData.email)) {
      errors.email = 'Please enter a valid email address';
      isValid = false;
    }
    if (!formData.password) {
      errors.password = 'Password is required';
      isValid = false;
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
      isValid = false;
    }
    if (formData.password !== formData.password_confirmation) {
      errors.password_confirmation = 'Passwords do not match';
      isValid = false;
    }
    
    setFormErrors(errors);
    return isValid;
  };

  // Simple registration - no OTP/email verification required
  const handleRegister = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        password_confirmation: formData.password_confirmation
      });

      if (response.success) {
        ElMessage.success(response.message || 'Registration successful! You can now sign in with your credentials.');
        // Clear form and redirect to login
        setFormData({ name: '', email: '', password: '', password_confirmation: '' });
        window.location.href = '/login';
      } else {
        ElMessage.error(response.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      ElMessage.error(error.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-card">
        <div className="signup-header">
          <h1>Create Account</h1>
          <p>Fill in your details to sign up</p>
        </div>

        <div className="signup-form">
          <div className="form-item">
            <label>Full Name</label>
            <div className="input-wrapper">
              <span className="input-icon"><FiUser /></span>
              <input
                type="text"
                className={`el-input__inner ${formErrors.name ? 'input-error' : ''}`}
                placeholder="Enter your full name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
              />
            </div>
            {formErrors.name && <span className="field-error">{formErrors.name}</span>}
          </div>

          <div className="form-item">
            <label>Email Address</label>
            <div className="input-wrapper">
              <span className="input-icon"><FiMail /></span>
              <input
                type="email"
                className={`el-input__inner ${(emailError || formErrors.email) ? 'input-error' : ''}`}
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
              />
            </div>
            {(emailError || formErrors.email) && <span className="field-error">{formErrors.email || emailError}</span>}
          </div>

          <div className="form-item">
            <label>Password</label>
            <div className="input-wrapper">
              <span className="input-icon"><FiLock /></span>
              <input
                type={showPassword ? 'text' : 'password'}
                className={`el-input__inner ${formErrors.password ? 'input-error' : ''}`}
                placeholder="Create a password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
            {formData.password && (
              <div className="password-strength">
                <div className="strength-bar">
                  <div 
                    className="strength-fill" 
                    style={{ 
                      width: `${(passwordStrength.score + 1) * 20}%`,
                      backgroundColor: passwordStrength.color 
                    }}
                  ></div>
                </div>
                <span className="strength-text" style={{ color: passwordStrength.color }}>
                  {passwordStrength.label}
                </span>
              </div>
            )}
            {formErrors.password && <span className="field-error">{formErrors.password}</span>}
          </div>

          <div className="form-item">
            <label>Confirm Password</label>
            <div className="input-wrapper">
              <span className="input-icon"><FiLock /></span>
              <input
                type="password"
                className={`el-input__inner ${(formErrors.password_confirmation || (formData.password_confirmation && formData.password !== formData.password_confirmation)) ? 'input-error' : ''}`}
                placeholder="Confirm your password"
                value={formData.password_confirmation}
                onChange={(e) => handleInputChange('password_confirmation', e.target.value)}
              />
              {formData.password_confirmation && (
                <span className="password-match">
                  {formData.password === formData.password_confirmation ? 
                    <FiCheck style={{ color: '#10b981' }} /> : 
                    <FiX style={{ color: '#ef4444' }} />
                  }
                </span>
              )}
            </div>
            {(formErrors.password_confirmation || (formData.password_confirmation && formData.password !== formData.password_confirmation)) && (
              <span className="field-error">{formErrors.password_confirmation || 'Passwords do not match'}</span>
            )}
          </div>

          <button
            type="button"
            className="el-button el-button--primary el-button--large submit-btn"
            onClick={handleRegister}
            disabled={loading || !!emailError || !!formErrors.name || !!formErrors.email || !!formErrors.password || !!formErrors.password_confirmation || (formData.password && formData.password !== formData.password_confirmation)}
          >
            {loading ? 'Creating Account...' : (
              <>
                Create Account <FiArrowRight style={{ marginLeft: '8px' }} />
              </>
            )}
          </button>
        </div>

        <div className="signup-footer">
          <p>Already have an account? <a href="/login">Sign in</a></p>
        </div>
      </div>

      <style>{`
        .signup-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 20px;
        }
        .signup-card {
          background: white;
          border-radius: 16px;
          padding: 40px;
          width: 100%;
          max-width: 420px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }
        .signup-header {
          text-align: center;
          margin-bottom: 32px;
        }
        .signup-header h1 {
          font-size: 28px;
          font-weight: 700;
          color: #1a1a2e;
          margin-bottom: 8px;
        }
        .signup-header p {
          color: #6b7280;
          font-size: 14px;
        }
        .form-item {
          margin-bottom: 20px;
        }
        .form-item label {
          display: block;
          font-size: 14px;
          font-weight: 500;
          color: #374151;
          margin-bottom: 8px;
        }
        .input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }
        .input-icon {
          position: absolute;
          left: 14px;
          color: #9ca3af;
          display: flex;
          align-items: center;
        }
        .el-input__inner {
          width: 100%;
          padding: 12px 16px 12px 40px;
          border: 1px solid #dcdfe6;
          border-radius: 8px;
          font-size: 14px;
          outline: none;
          transition: all 0.2s;
        }
        .el-input__inner:focus {
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }
        .el-input__inner.input-error {
          border-color: #ef4444;
        }
        .field-error {
          color: #ef4444;
          font-size: 12px;
          margin-top: 4px;
          display: block;
        }
        .toggle-password {
          position: absolute;
          right: 12px;
          background: none;
          border: none;
          color: #9ca3af;
          cursor: pointer;
          display: flex;
          align-items: center;
          padding: 4px;
        }
        .toggle-password:hover {
          color: #6b7280;
        }
        .password-match {
          position: absolute;
          right: 12px;
          display: flex;
          align-items: center;
        }
        .password-strength {
          margin-top: 8px;
        }
        .strength-bar {
          height: 4px;
          background: #e5e7eb;
          border-radius: 2px;
          overflow: hidden;
          margin-bottom: 4px;
        }
        .strength-fill {
          height: 100%;
          border-radius: 2px;
          transition: width 0.3s ease;
        }
        .strength-text {
          font-size: 12px;
          font-weight: 500;
        }
        .submit-btn {
          width: 100%;
          height: 48px;
          font-size: 16px;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          transition: all 0.2s;
        }
        .submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
        }
        .submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .signup-footer {
          text-align: center;
          margin-top: 24px;
          padding-top: 24px;
          border-top: 1px solid #e5e7eb;
        }
        .signup-footer p {
          color: #6b7280;
          font-size: 14px;
        }
        .signup-footer a {
          color: #667eea;
          font-weight: 600;
          text-decoration: none;
        }
        .signup-footer a:hover {
          text-decoration: underline;
        }
        @media (max-width: 480px) {
          .signup-card {
            padding: 24px;
          }
          .signup-header h1 {
            font-size: 24px;
          }
        }
      `}</style>
    </div>
  );
};

export default SignupPage;

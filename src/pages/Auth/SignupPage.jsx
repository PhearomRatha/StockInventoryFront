import React, { useState } from 'react';
import { FiUser, FiLock, FiMail, FiArrowRight, FiEye, FiEyeOff, FiCheck, FiX, FiClock } from 'react-icons/fi';
import { authApi } from '../../api';
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
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

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
      const response = await authApi.register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        password_confirmation: formData.password_confirmation
      });

      if (response.success) {
        ElMessage.success(response.data?.message || response.message || 'Registration successful! Your account is pending admin approval.');
        // Clear form and show pending status
        setFormData({ name: '', email: '', password: '', password_confirmation: '' });
        setRegistrationSuccess(true);
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
      {registrationSuccess ? (
        <div className="signup-card">
          <div className="success-header">
            <div className="success-icon">
              <FiCheck />
            </div>
            <h1>Registration Successful!</h1>
            <p>Your account has been created and is waiting for admin approval.</p>
          </div>
          <div className="pending-message">
            <FiClock style={{ marginRight: '8px', color: '#f59e0b' }} />
            <span>Please wait for an admin to approve your account before signing in.</span>
          </div>
          <div className="signup-footer">
            <a href="/login" className="login-link">Back to Login</a>
          </div>
        </div>
      ) : (
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
                    />
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
              className="submit-btn"
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
      )}
    </div>
  );
};

export default SignupPage;

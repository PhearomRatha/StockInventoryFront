import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserIcon, LockClosedIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { FiUser, FiLock, FiMail, FiArrowRight, FiEye, FiEyeOff, FiCheck, FiX, FiCheckCircle } from 'react-icons/fi';
import api from '../../plugin/axios';
import { useAuth, ROLES } from '../../context/AuthContext';
import { CookieUtils, register, loginWithGoogle } from '../../api/authApi';
import { FcGoogle } from 'react-icons/fc';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { TextField, Button, InputAdornment, IconButton, Box, Typography, CircularProgress, Divider } from '@mui/material';
import { ElMessage } from '../../utils/message';

const API_BASE = `${import.meta.env.VITE_API_URL}/api/auth`;

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  
  // Auth mode: 'login', 'register', 'approved'
  const [authMode, setAuthMode] = useState('login');
  
  // Login state
  const [showPassword, setShowPassword] = useState(false);
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  });
  const [loginMessage, setLoginMessage] = useState({ text: '', type: '' });
  const [loginErrors, setLoginErrors] = useState({ email: '', password: '' });
  const [loginLoading, setLoginLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Register state
  const [registerForm, setRegisterForm] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: ''
  });
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, label: '', color: '' });

  // Registration success state
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  // Set Password state (for Google users)
  const [setPasswordForm, setSetPasswordForm] = useState({
    password: '',
    password_confirmation: ''
  });
  const [showSetPassword, setShowSetPassword] = useState(false);
  const [setPasswordLoading, setSetPasswordLoading] = useState(false);

  useEffect(() => {
    // If already authenticated, redirect to dashboard
    const token = localStorage.getItem('token');
    if (token) {
      navigate("/", { replace: true });
      return;
    }
    
    // Clear temporary storage
    localStorage.removeItem('signupEmail');
    localStorage.removeItem('signupPassword');
  }, [navigate]);

  // Login handlers
  const handleLoginChange = useCallback((e) => {
    const { name, value } = e.target;
    setLoginForm(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (value) {
      setLoginErrors(prev => ({ ...prev, [name]: '' }));
    }
  }, []);

  const toggleLoginPassword = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  // Helper function to check user account status
  const checkAccountStatus = (user) => {
    if (!user) return { blocked: true, message: 'Account not found. Please register first or contact admin.', type: 'error' };
    
    // Status: 0 = Pending, 1 = Active, 2 = Rejected
    switch (user.status) {
      case 0:
        return { blocked: true, message: 'Your account is pending approval. Please wait for admin approval.', type: 'warning' };
      case 2:
        return { blocked: true, message: 'Your account has been rejected. Please contact support.', type: 'error' };
      default:
        return { blocked: false };
    }
  };

  // Handle Google Login Success
  const handleGoogleSuccess = async (credentialResponse) => {
    setGoogleLoading(true);
    setLoginMessage({ text: '', type: '' });

    try {
      const res = await loginWithGoogle(credentialResponse.credential);
      
      if (res.status === 200) {
        const user = res.data.user;
        const token = res.data.token;

        // Check if account exists and get status
        const statusCheck = checkAccountStatus(user);
        if (statusCheck.blocked) {
          setLoginMessage({
            text: statusCheck.message,
            type: statusCheck.type
          });
          setGoogleLoading(false);
          return;
        }

        CookieUtils.set('auth_token', token, 7);
        CookieUtils.set('auth_user', JSON.stringify(user), 7);
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        await login(user, token);

        ElMessage.success('Login successful! Redirecting...');
        setGoogleLoading(false);

        setTimeout(() => {
          window.location.href = '/';
        }, 1000);
      } else {
        setLoginMessage({
          text: res.message || "Google login failed. Account not found.",
          type: "error"
        });
        setGoogleLoading(false);
      }
    } catch (err) {
      console.error('Google login error:', err);
      console.error('Error response:', err.response);
      
      // Show more detailed error message
      let errorMessage = 'Google login failed. Please try again.';
      
      if (err.response) {
        if (err.response.status === 500) {
          // Server error - show a more helpful message
          errorMessage = 'Server error on backend. Please contact admin or check server logs.';
          // Log the actual error for debugging
          console.error('Backend error details:', err.response.data);
        } else if (err.response.status === 422) {
          errorMessage = err.response.data?.message || 'Invalid Google token.';
        } else if (err.response.data?.message) {
          errorMessage = err.response.data.message;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setLoginMessage({
        text: errorMessage,
        type: 'error'
      });
      setGoogleLoading(false);
    }
  };

  const handleGoogleError = () => {
    setLoginMessage({
      text: 'Google login was cancelled or failed. Please try again.',
      type: 'error'
    });
    setGoogleLoading(false);
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    
    // Validate using JavaScript - show errors under fields
    const errors = {};
    if (!loginForm.email) {
      errors.email = 'Email is required';
    }
    if (!loginForm.password) {
      errors.password = 'Password is required';
    }
    
    if (errors.email || errors.password) {
      setLoginErrors(errors);
      return;
    }
    
    setLoginMessage({ text: '', type: '' });
    setLoginLoading(true);

    try {
      await api.get('/sanctum/csrf-cookie');
      
      const res = await api.post(`${API_BASE}/login`, loginForm);
      
      // Debug: Log the actual response to understand the structure
      console.log('Login response:', res.data);

      // Handle different response formats flexibly
      let user = null;
      let token = null;
      let message = '';
      let success = false;

      // Format 1: { status: 200, data: { user, token } }
      if (res.data.status === 200 && res.data.data) {
        user = res.data.data.user;
        token = res.data.data.token;
        message = res.data.message;
        success = true;
      }
      // Format 2: { user, token } (direct)
      else if (res.data.user && res.data.token) {
        user = res.data.user;
        token = res.data.token;
        message = res.data.message || '';
        success = true;
      }
      // Format 3: { success: true, data: { user, token } }
      else if (res.data.success === true && res.data.data) {
        user = res.data.data.user;
        token = res.data.data.token;
        message = res.data.message;
        success = true;
      }
      // Format 4: Check for direct token in various locations
      else if (res.data.token || res.data.access_token) {
        token = res.data.token || res.data.access_token;
        user = res.data.user || res.data.data?.user;
        message = res.data.message || '';
        success = !!token;
      }

      if (!success || !token) {
        setLoginMessage({ text: message || res.data.message || 'Login failed. Please check your credentials.', type: 'error' });
        setLoginLoading(false);
        return;
      }

      // Check account status using helper function
      const statusCheck = checkAccountStatus(user);
      if (statusCheck.blocked) {
        setLoginMessage({ text: statusCheck.message, type: statusCheck.type });
        setLoginLoading(false);
        return;
      }

      CookieUtils.set('auth_token', token, 7);
        CookieUtils.set('auth_user', JSON.stringify(user), 7);
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        await login(user, token);

        ElMessage.success('Login successful! Redirecting...');
        setLoginLoading(false);

        setTimeout(() => {
          window.location.href = '/';
        }, 1000);
    } catch (err) {
      console.error('Login error:', err);
      console.error('Error response:', err.response);

      if (!err.response) {
        setLoginMessage({ text: 'Cannot reach backend. Check CORS, HTTPS, or network.', type: 'error' });
      } else {
        // Handle validation errors
        if (err.response.status === 422) {
          const validationErrors = err.response.data.errors;
          if (validationErrors) {
            const errorMessages = Object.values(validationErrors).flat().join(', ');
            setLoginMessage({ text: errorMessages, type: 'error' });
          } else {
            setLoginMessage({ text: err.response.data.message || 'Validation failed', type: 'error' });
          }
        } else {
          setLoginMessage({ text: err.response?.data?.message || err.response?.data?.error || 'Invalid email or password.', type: 'error' });
        }
      }

      setLoginLoading(false);
    }
  };

  // Register handlers
  const validateEmail = useCallback((email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }, []);

  const checkPasswordStrength = useCallback((password) => {
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
  }, []);

  const handleRegisterChange = useCallback((field, value) => {
    setRegisterForm(prev => ({ ...prev, [field]: value }));
    
    if (field === 'email') {
      setEmailError(validateEmail(value) ? '' : 'Please enter a valid email address');
    }
    if (field === 'password') {
      setPasswordStrength(checkPasswordStrength(value));
    }
  }, [validateEmail, checkPasswordStrength]);

  const validateRegisterForm = useCallback(() => {
    if (!registerForm.name || !registerForm.email || !registerForm.password) {
      ElMessage.error('Please fill in all required fields');
      return false;
    }
    if (registerForm.password !== registerForm.password_confirmation) {
      ElMessage.error('Passwords do not match');
      return false;
    }
    if (registerForm.password.length < 6) {
      ElMessage.error('Password must be at least 6 characters');
      return false;
    }
    return true;
  }, [registerForm]);

  const handleRegisterSubmit = async () => {
    if (!validateRegisterForm()) return;

    setRegisterLoading(true);
    try {
      const response = await register({
        name: registerForm.name,
        email: registerForm.email,
        password: registerForm.password,
        password_confirmation: registerForm.password_confirmation
      });

      if (response.success) {
        ElMessage.success('Registration successful! Please wait for admin approval.');
        setRegistrationSuccess(true);
        setAuthMode('approved');
      } else {
        ElMessage.error(response.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage = error.message || error.response?.data?.message || 'Registration failed. Please try again.';
      ElMessage.error(errorMessage);
    } finally {
      setRegisterLoading(false);
    }
  };

  // Switch to login
  const switchToLogin = useCallback(() => {
    setAuthMode('login');
    setRegistrationSuccess(false);
  }, []);

  const switchToRegister = useCallback(() => {
    setAuthMode('register');
  }, []);

  // Render login form
  const renderLoginForm = () => (
    <>
      <div className="auth-header">
        <h1>Welcome Back</h1>
        <p>Please sign in to your account</p>
      </div>

      {loginMessage.text && (
        <div className={`message-box ${loginMessage.type}`}>
          {loginMessage.type === 'success' && <span className="message-icon">✓</span>}
          {loginMessage.type === 'error' && <span className="message-icon">✕</span>}
          {loginMessage.type === 'warning' && <span className="message-icon">⚠</span>}
          {loginMessage.text}
        </div>
      )}

      {loginLoading ? (
        <div className="loading-skeleton">
          <div className="skeleton-input"></div>
          <div className="skeleton-input"></div>
          <div className="skeleton-btn"></div>
        </div>
      ) : (
        <form onSubmit={handleLoginSubmit} className="login-form">
          <div className="form-item">
            <label>Email Address</label>
            <div className="input-wrapper">
              <span className="input-icon"><UserIcon /></span>
              <input
                type="email"
                name="email"
                value={loginForm.email}
                onChange={handleLoginChange}
                placeholder="Enter your email"
                className={loginErrors.email ? 'input-error' : ''}
              />
            </div>
            {loginErrors.email && <span className="field-error">{loginErrors.email}</span>}
          </div>

          <div className="form-item">
            <label>Password</label>
            <div className="input-wrapper">
              <span className="input-icon"><LockClosedIcon /></span>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={loginForm.password}
                onChange={handleLoginChange}
                placeholder="Enter your password"
                className={loginErrors.password ? 'input-error' : ''}
              />
              <button
                type="button"
                className="toggle-password"
                onClick={toggleLoginPassword}
              >
                {showPassword ? <EyeSlashIcon /> : <EyeIcon />}
              </button>
            </div>
            {loginErrors.password && <span className="field-error">{loginErrors.password}</span>}
          </div>

          <div className="forgot-password">
            <a href="/forgot-password">Forgot password?</a>
          </div>

          <button
            type="submit"
            className="login-btn"
            disabled={loginLoading}
          >
            Sign In
          </button>
        </form>
      )}

      {/* Google Login Button */}
      <div className="divider">
        <span>or</span>
      </div>

      {googleLoading ? (
        <div className="google-loading-message">
          <CircularProgress size={24} sx={{ mr: 1 }} />
          <span>Redirecting to dashboard...</span>
        </div>
      ) : (
        import.meta.env.VITE_GOOGLE_CLIENT_ID ? (
          <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              useOneTap={false}
              theme="outline"
              size="large"
              text="signin_with"
              shape="rectangular"
              logo_alignment="left"
            />
          </GoogleOAuthProvider>
        ) : (
          <button
            type="button"
            className="google-btn"
            disabled
          >
            <FcGoogle size={20} />
            Google OAuth not configured
          </button>
        )
      )}


    </>
  );

  // Render register form
  const renderRegisterForm = () => (
    <>
      <div className="auth-header">
        <h1>Create Account</h1>
        <p>Fill in your details to sign up</p>
      </div>

      {registrationSuccess ? (
        <div className="registration-success">
          <div className="success-icon">
            <FiCheckCircle size={48} style={{ color: '#10b981' }} />
          </div>
          <h2>Registration Successful!</h2>
          <p>Your account has been created. Please wait for admin approval or sign in with your credentials.</p>
          <button
            type="button"
            className="login-btn"
            onClick={switchToLogin}
          >
            Go to Login
          </button>
        </div>
      ) : (
        <div className="register-form">
          <div className="form-item">
            <label>Full Name</label>
            <div className="input-wrapper">
              <span className="input-icon"><FiUser /></span>
              <input
                type="text"
                placeholder="Enter your full name"
                value={registerForm.name}
                onChange={(e) => handleRegisterChange('name', e.target.value)}
              />
            </div>
          </div>

          <div className="form-item">
            <label>Email Address</label>
            <div className="input-wrapper">
              <span className="input-icon"><FiMail /></span>
              <input
                type="email"
                className={emailError ? 'input-error' : ''}
                placeholder="Enter your email"
                value={registerForm.email}
                onChange={(e) => handleRegisterChange('email', e.target.value)}
              />
            </div>
            {emailError && <span className="field-error">{emailError}</span>}
          </div>

          <div className="form-item">
            <label>Password</label>
            <div className="input-wrapper">
              <span className="input-icon"><FiLock /></span>
              <input
                type={showRegisterPassword ? "text" : "password"}
                placeholder="Create a password"
                value={registerForm.password}
                onChange={(e) => handleRegisterChange('password', e.target.value)}
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowRegisterPassword(prev => !prev)}
              >
                {showRegisterPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
            {registerForm.password && (
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
          </div>

          <div className="form-item">
            <label>Confirm Password</label>
            <div className="input-wrapper">
              <span className="input-icon"><FiLock /></span>
              <input
                type="password"
                className={registerForm.password_confirmation && registerForm.password !== registerForm.password_confirmation ? 'input-error' : ''}
                placeholder="Confirm your password"
                value={registerForm.password_confirmation}
                onChange={(e) => handleRegisterChange('password_confirmation', e.target.value)}
              />
              {registerForm.password_confirmation && (
                <span className="password-match">
                  {registerForm.password === registerForm.password_confirmation ? 
                    <FiCheck style={{ color: '#10b981' }} /> : 
                    <FiX style={{ color: '#ef4444' }} />
                  }
                </span>
              )}
            </div>
            {registerForm.password_confirmation && registerForm.password !== registerForm.password_confirmation && (
              <span className="field-error">Passwords do not match</span>
            )}
          </div>

          <button
            type="button"
            className="login-btn"
            onClick={handleRegisterSubmit}
            disabled={registerLoading || !!emailError || (registerForm.password && registerForm.password !== registerForm.password_confirmation)}
          >
            {registerLoading ? 'Creating Account...' : (
              <>
                Create Account <FiArrowRight style={{ marginLeft: '8px' }} />
              </>
            )}
          </button>
        </div>
      )}

      <div className="auth-footer">
        <p>Already have an account? <button type="button" className="link-btn" onClick={switchToLogin}>Sign in</button></p>
      </div>
    </>
  );

  // Render main content based on auth mode
  const renderContent = () => {
    switch (authMode) {
      case 'register':
        return renderRegisterForm();
      case 'approved':
        return renderApprovedStatus();
      case 'login':
      default:
        return renderLoginForm();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Login;

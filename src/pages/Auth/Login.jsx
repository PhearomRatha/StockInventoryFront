import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserIcon, LockClosedIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { FiUser, FiLock, FiMail, FiArrowRight, FiEye, FiEyeOff, FiCheck, FiX, FiCheckCircle } from 'react-icons/fi';
import api from '../../plugin/axios';
import { useAuth } from '../../context/AuthContext';
import { authApi, CookieUtils } from '../../api';
import { ElMessage } from '../../utils/message';

const Login = () => {
  const { login, loading } = useAuth();
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

  // Clear temporary storage on mount (GuestRoute handles auth redirect)
  useEffect(() => {
    localStorage.removeItem('signupEmail');
    localStorage.removeItem('signupPassword');
  }, []);

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

    // Demo users are always allowed
    if (user.is_demo === true) {
      return { blocked: false };
    }

    // Support: string status (ACTIVE/INACTIVE), boolean status (true/false), or numeric status (0/1)
    const statusValue = user.status;
    let status;

    if (typeof statusValue === 'string') {
      status = statusValue.toUpperCase() === 'ACTIVE' ? 1 : 0;
    } else if (typeof statusValue === 'boolean') {
      status = statusValue ? 1 : 0;
    } else {
      status = statusValue ?? 1;
    }

    // Status: 0 = Pending/Inactive, 1 = Active
    if (status === 0) {
      return { blocked: true, message: 'Your account is pending approval or inactive. Please contact support.', type: 'warning' };
    }

    return { blocked: false };
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

    setLoginLoading(true);

    try {
      const res = await authApi.login(loginForm);

      console.log('Login response:', res);

      let user = null;
      let token = null;

      // Format: { data: { user, token }, status: 200 }
      if (res?.data?.user && res?.data?.token) {
        user = res.data.user;
        token = res.data.token;
      }
      // Format: { status: 200, data: { user, token } }
      else if (res?.status === 200 && res?.data?.user && res?.data?.token) {
        user = res.data.user;
        token = res.data.token;
      }

      if (!user || !token) {
        setLoginMessage({ text: 'Login failed. Please check your credentials.', type: 'error' });
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

      // Store user with is_demo flag for demo detection
      const userWithDemo = user.is_demo === undefined ? { ...user, is_demo: true } : user;

      CookieUtils.set('auth_token', token, 7);
      CookieUtils.set('auth_user', JSON.stringify(userWithDemo), 7);
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userWithDemo));

      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      login(userWithDemo, token);

      ElMessage.success('Login successful! Redirecting...');
      setLoginLoading(false);

      // Small delay to ensure state is propagated before navigation
      setTimeout(() => navigate('/', { replace: true }), 100);
    } catch (err) {
      console.error('Login error:', err);

      // Handle demo API error format
      if (!err.response && err.message) {
        setLoginMessage({ text: err.message || 'Login failed. Please check your credentials.', type: 'error' });
      } else if (err.response) {
        // Handle validation errors
        if (err.response.status === 422) {
          const validationErrors = err.response.data.errors;
          if (validationErrors) {
            const errorMessages = Object.values(validationErrors).flat().join(', ');
            setLoginMessage({ text: errorMessages, type: 'error' });
          } else {
            setLoginMessage({ text: err.response.data.message || 'Validation failed', type: 'error' });
          }
        } else if (err.response.status === 423) {
          setLoginMessage({ text: err.response.data.message || 'Account is temporarily locked. Please try again later.', type: 'error' });
        } else if (err.response.status === 403) {
          setLoginMessage({ text: err.response.data.message || 'Your account is not active. Please contact support.', type: 'warning' });
        } else {
          setLoginMessage({ text: err.response?.data?.message || err.response?.data?.error || 'Invalid email or password.', type: 'error' });
        }
      } else {
        setLoginMessage({ text: 'Cannot reach backend. Check CORS, HTTPS, or network.', type: 'error' });
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
      const response = await authApi.register({
        name: registerForm.name,
        email: registerForm.email,
        password: registerForm.password,
        password_confirmation: registerForm.password_confirmation
      });

      if (response?.status === 200 && response?.data?.user) {
        ElMessage.success('Registration successful! Please wait for admin approval.');
        setRegistrationSuccess(true);
        setAuthMode('approved');
      } else {
        ElMessage.error(response?.data?.message || 'Registration failed');
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

      <div className="auth-footer">
        <p>Don't have an account? <button type="button" className="link-btn" onClick={switchToRegister}>Register</button></p>
      </div>
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

// Render approved status (after registration)
   const renderApprovedStatus = () => (
     <>
       <div className="auth-header">
         <h1>Registration Submitted</h1>
         <p>Your account is pending approval</p>
       </div>

       <div className="registration-pending">
         <div className="success-icon">
           <FiCheckCircle size={48} style={{ color: '#eab308' }} />
         </div>
         <h2>Waiting for Approval</h2>
         <p>Your account has been created and is pending administrator approval. You will be notified once your account is approved.</p>
         <button
           type="button"
           className="login-btn"
           onClick={switchToLogin}
         >
           Go to Login
         </button>
       </div>

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

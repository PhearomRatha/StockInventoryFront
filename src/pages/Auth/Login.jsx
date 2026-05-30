import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserIcon, LockClosedIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { FiUser, FiLock, FiMail, FiArrowRight, FiEye, FiEyeOff, FiCheck, FiX, FiCheckCircle } from 'react-icons/fi';
import api from '../../plugin/axios';
import { useAuth } from '../../context/AuthContext';
import { authApi, CookieUtils } from '../../api';
import { ElMessage } from '../../utils/message';
import { useTranslation } from 'react-i18next';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [authMode, setAuthMode] = useState('login');

  const [showPassword, setShowPassword] = useState(false);
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  });
  const [loginMessage, setLoginMessage] = useState({ text: '', type: '' });
  const [loginErrors, setLoginErrors] = useState({ email: '', password: '' });
  const [loginLoading, setLoginLoading] = useState(false);

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

  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  useEffect(() => {
    localStorage.removeItem('signupEmail');
    localStorage.removeItem('signupPassword');
  }, []);

  const handleLoginChange = useCallback((e) => {
    const { name, value } = e.target;
    setLoginForm(prev => ({ ...prev, [name]: value }));
    if (value) {
      setLoginErrors(prev => ({ ...prev, [name]: '' }));
    }
  }, []);

  const toggleLoginPassword = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  const checkAccountStatus = (user) => {
    if (!user) return { blocked: true, message: t('login.accountNotFound'), type: 'error' };
    if (user.is_demo === true) {
      return { blocked: false };
    }
    const statusValue = user.status;
    let status;
    if (typeof statusValue === 'string') {
      status = statusValue.toUpperCase() === 'ACTIVE' ? 1 : 0;
    } else if (typeof statusValue === 'boolean') {
      status = statusValue ? 1 : 0;
    } else {
      status = statusValue ?? 1;
    }
    if (status === 0) {
      return { blocked: true, message: t('login.pendingApproval'), type: 'warning' };
    }
    return { blocked: false };
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();

    const errors = {};
    if (!loginForm.email) {
      errors.email = t('login.emailRequired');
    }
    if (!loginForm.password) {
      errors.password = t('login.passwordRequired');
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

      if (res?.data?.user && res?.data?.token) {
        user = res.data.user;
        token = res.data.token;
      } else if (res?.status === 200 && res?.data?.user && res?.data?.token) {
        user = res.data.user;
        token = res.data.token;
      }

      if (!user || !token) {
        setLoginMessage({ text: t('login.loginFailed'), type: 'error' });
        setLoginLoading(false);
        return;
      }

      const statusCheck = checkAccountStatus(user);
      if (statusCheck.blocked) {
        setLoginMessage({ text: statusCheck.message, type: statusCheck.type });
        setLoginLoading(false);
        return;
      }

      const userWithDemo = user.is_demo === undefined ? { ...user, is_demo: true } : user;

      CookieUtils.set('auth_token', token, 7);
      CookieUtils.set('auth_user', JSON.stringify(userWithDemo), 7);
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userWithDemo));

      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      login(userWithDemo, token);

      ElMessage.success(t('login.loginSuccess'));
      setLoginLoading(false);

      setTimeout(() => navigate('/', { replace: true }), 100);
    } catch (err) {
      console.error('Login error:', err);

      if (!err.response && err.message) {
        setLoginMessage({ text: err.message || t('login.loginFailed'), type: 'error' });
      } else if (err.response) {
        if (err.response.status === 422) {
          const validationErrors = err.response.data.errors;
          if (validationErrors) {
            const errorMessages = Object.values(validationErrors).flat().join(', ');
            setLoginMessage({ text: errorMessages, type: 'error' });
          } else {
            setLoginMessage({ text: err.response.data.message || t('login.validationFailed'), type: 'error' });
          }
        } else if (err.response.status === 423) {
          setLoginMessage({ text: err.response.data.message || t('login.accountLocked'), type: 'error' });
        } else if (err.response.status === 403) {
          setLoginMessage({ text: err.response.data.message || t('login.accountNotActive'), type: 'warning' });
        } else {
          setLoginMessage({ text: err.response?.data?.message || err.response?.data?.error || t('login.invalidCredentials'), type: 'error' });
        }
      } else {
        setLoginMessage({ text: t('login.networkError'), type: 'error' });
      }

      setLoginLoading(false);
    }
  };

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
    
    const strengthLabels = {
      0: t('passwordStrength.veryWeak'),
      1: t('passwordStrength.weak'),
      2: t('passwordStrength.fair'),
      3: t('passwordStrength.good'),
      4: t('passwordStrength.strong')
    };
    const strengthData = {
      0: { label: strengthLabels[0], color: '#ef4444' },
      1: { label: strengthLabels[1], color: '#f97316' },
      2: { label: strengthLabels[2], color: '#eab308' },
      3: { label: strengthLabels[3], color: '#22c55e' },
      4: { label: strengthLabels[4], color: '#10b981' }
    };
    return { score, ...strengthData[score] };
  }, [t]);

  const handleRegisterChange = useCallback((field, value) => {
    setRegisterForm(prev => ({ ...prev, [field]: value }));
    
    if (field === 'email') {
      setEmailError(validateEmail(value) ? '' : t('login.validEmailRequired'));
    }
    if (field === 'password') {
      setPasswordStrength(checkPasswordStrength(value));
    }
  }, [validateEmail, t, checkPasswordStrength]);

  const validateRegisterForm = useCallback(() => {
    if (!registerForm.name || !registerForm.email || !registerForm.password) {
      ElMessage.error(t('register.fillRequired'));
      return false;
    }
    if (registerForm.password !== registerForm.password_confirmation) {
      ElMessage.error(t('register.passwordsMatch'));
      return false;
    }
    if (registerForm.password.length < 6) {
      ElMessage.error(t('register.passwordMinLength'));
      return false;
    }
    return true;
  }, [registerForm, t]);

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
        ElMessage.success(t('register.registrationSuccess'));
        setRegistrationSuccess(true);
        setAuthMode('approved');
      } else {
        ElMessage.error(response?.data?.message || t('register.registrationFailed'));
      }
    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage = error.message || error.response?.data?.message || 'Registration failed. Please try again.';
      ElMessage.error(errorMessage);
    } finally {
      setRegisterLoading(false);
    }
  };

  const switchToLogin = useCallback(() => {
    setAuthMode('login');
    setRegistrationSuccess(false);
  }, []);

  const switchToRegister = useCallback(() => {
    setAuthMode('register');
  }, []);

  const renderLoginForm = () => (
    <>
      <div className="auth-header">
        <h1>{t('login.welcomeBack')}</h1>
        <p>{t('login.signIn')}</p>
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
            <label>{t('login.emailAddress')}</label>
            <div className="input-wrapper">
              <span className="input-icon"><UserIcon /></span>
              <input
                type="email"
                name="email"
                value={loginForm.email}
                onChange={handleLoginChange}
                placeholder={t('login.enterEmail')}
                className={loginErrors.email ? 'input-error' : ''}
              />
            </div>
            {loginErrors.email && <span className="field-error">{loginErrors.email}</span>}
          </div>

          <div className="form-item">
            <label>{t('login.password')}</label>
            <div className="input-wrapper input-with-toggle">
              <span className="input-icon"><LockClosedIcon /></span>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={loginForm.password}
                onChange={handleLoginChange}
                placeholder={t('login.enterPassword')}
                className={loginErrors.password ? 'input-error' : ''}
              />
              <button
                type="button"
                className="toggle-password"
                onClick={toggleLoginPassword}
              >
                {showPassword ? <EyeSlashIcon style={{ width: 20, height: 20, color: '#111827' }} /> : <EyeIcon style={{ width: 20, height: 20, color: '#111827' }} />}
              </button>
            </div>
            {loginErrors.password && <span className="field-error">{loginErrors.password}</span>}
          </div>

          <div className="forgot-password">
            <a href="/forgot-password">{t('login.forgotPassword')}</a>
          </div>

          <button
            type="submit"
            className="login-btn"
            disabled={loginLoading}
          >
            {t('login.signInButton')}
          </button>
        </form>
      )}

      <div className="auth-footer">
        <p>{t('login.dontHaveAccount')} <button type="button" className="link-btn" onClick={switchToRegister}>{t('login.register')}</button></p>
      </div>
    </>
  );

  const renderRegisterForm = () => (
    <>
      <div className="auth-header">
        <h1>{t('register.createAccount')}</h1>
        <p>{t('register.fillDetails')}</p>
      </div>

      {registrationSuccess ? (
        <div className="registration-success">
          <div className="success-icon">
            <FiCheckCircle size={48} style={{ color: '#10b981' }} />
          </div>
          <h2>{t('registrationPending.title')}</h2>
          <p>{t('registrationPending.accountCreated')}</p>
          <button
            type="button"
            className="login-btn"
            onClick={switchToLogin}
          >
            {t('registrationPending.goToLogin')}
          </button>
        </div>
      ) : (
        <div className="register-form">
          <div className="form-item">
            <label>{t('register.fullName')}</label>
            <div className="input-wrapper">
              <span className="input-icon"><FiUser /></span>
              <input
                type="text"
                placeholder={t('register.fullName')}
                value={registerForm.name}
                onChange={(e) => handleRegisterChange('name', e.target.value)}
              />
            </div>
          </div>

          <div className="form-item">
            <label>{t('register.emailAddress')}</label>
            <div className="input-wrapper">
              <span className="input-icon"><FiMail /></span>
              <input
                type="email"
                className={emailError ? 'input-error' : ''}
                placeholder={t('register.emailAddress')}
                value={registerForm.email}
                onChange={(e) => handleRegisterChange('email', e.target.value)}
              />
            </div>
            {emailError && <span className="field-error">{emailError}</span>}
          </div>

          <div className="form-item">
            <label>{t('register.createPassword')}</label>
            <div className="input-wrapper input-with-toggle">
              <span className="input-icon"><FiLock /></span>
              <input
                type={showRegisterPassword ? "text" : "password"}
                placeholder={t('register.createPassword')}
                value={registerForm.password}
                onChange={(e) => handleRegisterChange('password', e.target.value)}
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowRegisterPassword(prev => !prev)}
              >
                {showRegisterPassword ? <FiEyeOff style={{ width: 20, height: 20, color: '#111827' }} /> : <FiEye style={{ width: 20, height: 20, color: '#111827' }} />}
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
            <label>{t('register.confirmPassword')}</label>
            <div className="input-wrapper">
              <span className="input-icon"><FiLock /></span>
              <input
                type="password"
                className={registerForm.password_confirmation && registerForm.password !== registerForm.password_confirmation ? 'input-error' : ''}
                placeholder={t('register.confirmPassword')}
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
              <span className="field-error">{t('register.passwordsMatch')}</span>
            )}
          </div>

          <button
            type="button"
            className="login-btn"
            onClick={handleRegisterSubmit}
            disabled={registerLoading || !!emailError || (registerForm.password && registerForm.password !== registerForm.password_confirmation)}
          >
            {registerLoading ? t('register.creatingAccount') : (
              <>
                {t('register.registerButton')} <FiArrowRight style={{ marginLeft: '8px' }} />
              </>
            )}
          </button>
        </div>
      )}

      <div className="auth-footer">
        <p>{t('register.alreadyHaveAccount')} <button type="button" className="link-btn" onClick={switchToLogin}>{t('register.signIn')}</button></p>
      </div>
    </>
  );

  const renderApprovedStatus = () => (
    <>
      <div className="auth-header">
        <h1>{t('registrationPending.title')}</h1>
        <p>{t('registrationPending.pendingApproval')}</p>
      </div>

      <div className="registration-pending">
        <div className="success-icon">
          <FiCheckCircle size={48} style={{ color: '#eab308' }} />
        </div>
        <h2>{t('registrationPending.waitingForApproval')}</h2>
        <p>{t('registrationPending.accountCreated')}</p>
        <button
          type="button"
          className="login-btn"
          onClick={switchToLogin}
        >
          {t('registrationPending.goToLogin')}
        </button>
      </div>

      <div className="auth-footer">
        <p>{t('register.alreadyHaveAccount')} <button type="button" className="link-btn" onClick={switchToLogin}>{t('register.signIn')}</button></p>
      </div>
    </>
  );

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md my-4">
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Login;
import React, { useState, useEffect } from 'react';
import { ElMessage } from 'element-plus';
import {
  User,
  Lock,
  Eye,
  EyeOff
} from '@element-plus/icons-vue';
import api from '../../plugin/axios';
import { useAuth } from '../../context/AuthContext';

const API_BASE = `${import.meta.env.VITE_API_URL}/api`;

const Login = () => {
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: localStorage.getItem('signupEmail') || '',
    password: localStorage.getItem('signupPassword') || ''
  });
  const [message, setMessage] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Clear stored signup values after use
    if (localStorage.getItem('signupEmail')) {
      localStorage.removeItem('signupEmail');
      localStorage.removeItem('signupPassword');
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });
    setLoading(true);

    try {
      // Get CSRF cookie for Sanctum
      await api.get('/sanctum/csrf-cookie');
      
      const res = await api.post(`${API_BASE}/login`, formData);

      if (res.data.status === 200) {
        const user = res.data.data.user;
        const token = res.data.data.token;

        // Check user status
        if (user.status === 0) {
          setMessage({
            text: "Your account is not approved yet. Please wait for admin approval.",
            type: "warning"
          });
          setLoading(false);
          return;
        }

        if (user.status === 1) {
          setMessage({
            text: "Your account is pending. Please wait for admin approval.",
            type: "warning"
          });
          setLoading(false);
          return;
        }

        if (user.status === 2) {
          setMessage({
            text: "Your account has been rejected. Please contact support.",
            type: "error"
          });
          setLoading(false);
          return;
        }

        // Store token and login
        localStorage.setItem('token', token);
        await login(user, token);

        ElMessage.success('Login successful! Redirecting...');
        setLoading(false);

        setTimeout(() => {
          window.location.href = "/";
        }, 1500);
      } else {
        setMessage({ text: res.data.message || "Login failed", type: "error" });
        setLoading(false);
      }
    } catch (err) {
      console.error("Login error:", err);

      if (!err.response) {
        setMessage({
          text: "Cannot reach backend. Check CORS, HTTPS, or network.",
          type: "error"
        });
      } else {
        setMessage({
          text: err.response?.data?.message || "Invalid email or password.",
          type: "error"
        });
      }

      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Welcome Back</h1>
          <p>Please sign in to your account</p>
        </div>

        {message.text && (
          <div className={`message-box ${message.type}`}>
            {message.type === 'success' && <span className="message-icon">✓</span>}
            {message.type === 'error' && <span className="message-icon">✕</span>}
            {message.type === 'warning' && <span className="message-icon">⚠</span>}
            {message.text}
          </div>
        )}

        {loading ? (
          <div className="loading-skeleton">
            <div className="skeleton-input"></div>
            <div className="skeleton-input"></div>
            <div className="skeleton-btn"></div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-item">
              <label>Email Address</label>
              <div className="input-wrapper">
                <span className="input-icon"><User /></span>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div className="form-item">
              <label>Password</label>
              <div className="input-wrapper">
                <span className="input-icon"><Lock /></span>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>
            </div>

            <div className="forgot-password">
              <a href="/forgot-password">Forgot password?</a>
            </div>

            <button
              type="submit"
              className="login-btn"
              disabled={loading}
            >
              Sign In
            </button>
          </form>
        )}

        <div className="login-footer">
          <p>Don't have an account? <a href="/signup">Sign up</a></p>
        </div>
      </div>

      <style>{`
        .login-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 20px;
        }
        .login-card {
          background: white;
          border-radius: 16px;
          padding: 40px;
          width: 100%;
          max-width: 420px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }
        .login-header {
          text-align: center;
          margin-bottom: 32px;
        }
        .login-header h1 {
          font-size: 28px;
          font-weight: 700;
          color: #1a1a2e;
          margin-bottom: 8px;
        }
        .login-header p {
          color: #6b7280;
          font-size: 14px;
        }
        .message-box {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          border-radius: 8px;
          margin-bottom: 24px;
          font-size: 14px;
        }
        .message-box.success {
          background: #d1fae5;
          color: #065f46;
        }
        .message-box.error {
          background: #fee2e2;
          color: #991b1b;
        }
        .message-box.warning {
          background: #fef3c7;
          color: #92400e;
        }
        .message-icon {
          font-size: 16px;
        }
        .loading-skeleton {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .skeleton-input {
          height: 48px;
          background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 8px;
        }
        .skeleton-btn {
          height: 48px;
          background: linear-gradient(90deg, #667eea 25%, #764ba2 50%, #667eea 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 8px;
        }
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
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
          left: 16px;
          color: #9ca3af;
          display: flex;
          align-items: center;
        }
        .input-wrapper input {
          width: 100%;
          padding: 12px 16px 12px 44px;
          border: 1px solid #dcdfe6;
          border-radius: 8px;
          font-size: 14px;
          outline: none;
          transition: all 0.2s;
        }
        .input-wrapper input:focus {
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }
        .toggle-password {
          position: absolute;
          right: 16px;
          background: none;
          border: none;
          color: #9ca3af;
          cursor: pointer;
          display: flex;
          align-items: center;
        }
        .toggle-password:hover {
          color: #6b7280;
        }
        .forgot-password {
          text-align: right;
          margin-bottom: 24px;
        }
        .forgot-password a {
          color: #667eea;
          font-size: 14px;
          text-decoration: none;
        }
        .forgot-password a:hover {
          text-decoration: underline;
        }
        .login-btn {
          width: 100%;
          padding: 14px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .login-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
        }
        .login-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }
        .login-footer {
          text-align: center;
          margin-top: 24px;
          padding-top: 24px;
          border-top: 1px solid #e5e7eb;
        }
        .login-footer p {
          color: #6b7280;
          font-size: 14px;
        }
        .login-footer a {
          color: #667eea;
          font-weight: 600;
          text-decoration: none;
        }
        .login-footer a:hover {
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
};

export default Login;

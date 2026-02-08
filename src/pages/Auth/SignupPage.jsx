import React, { useState } from 'react';
import { ElMessage } from 'element-plus';
import {
  User,
  Lock,
  Message,
  ArrowRight,
  Timer
} from '@element-plus/icons-vue';
import { register, verifyOtp, resendOtp } from '../../api/authApi';
import OtpInput from './components/OtpInput';
import ApprovalStatus from './components/ApprovalStatus';

const SignupPage = () => {
  const [currentStep, setCurrentStep] = useState('register');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: ''
  });
  const [loading, setLoading] = useState(false);
  const [resendingOtp, setResendingOtp] = useState(false);
  const [otpEmail, setOtpEmail] = useState('');

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.name || !formData.email || !formData.password) {
      ElMessage.error('Please fill in all required fields');
      return false;
    }
    if (formData.password !== formData.password_confirmation) {
      ElMessage.error('Passwords do not match');
      return false;
    }
    if (formData.password.length < 6) {
      ElMessage.error('Password must be at least 6 characters');
      return false;
    }
    return true;
  };

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

      if (response.status === 201 || response.status === 200) {
        ElMessage.success('Registration successful! Please verify your OTP.');
        setOtpEmail(formData.email);
        setCurrentStep('otp');
        localStorage.setItem('otpEmail', formData.email);
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

  const handleOtpVerify = async (otp) => {
    setLoading(true);
    try {
      const response = await verifyOtp(otpEmail, otp);
      
      if (response.status === 200) {
        ElMessage.success('OTP verified successfully! Waiting for admin approval.');
        setCurrentStep('approved');
        localStorage.setItem('verifiedEmail', otpEmail);
      } else {
        ElMessage.error(response.message || 'OTP verification failed');
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      ElMessage.error(error.message || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setResendingOtp(true);
    try {
      const response = await resendOtp(otpEmail);
      ElMessage.success('OTP sent successfully!');
    } catch (error) {
      console.error('Resend OTP error:', error);
      ElMessage.error(error.message || 'Failed to resend OTP');
    } finally {
      setResendingOtp(false);
    }
  };

  if (currentStep === 'register') {
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
              <input
                type="text"
                className="el-input__inner"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
              />
            </div>

            <div className="form-item">
              <label>Email Address</label>
              <input
                type="email"
                className="el-input__inner"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
              />
            </div>

            <div className="form-item">
              <label>Password</label>
              <input
                type="password"
                className="el-input__inner"
                placeholder="Create a password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
              />
            </div>

            <div className="form-item">
              <label>Confirm Password</label>
              <input
                type="password"
                className="el-input__inner"
                placeholder="Confirm your password"
                value={formData.password_confirmation}
                onChange={(e) => handleInputChange('password_confirmation', e.target.value)}
              />
            </div>

            <button
              type="button"
              className="el-button el-button--primary el-button--large submit-btn"
              onClick={handleRegister}
              disabled={loading}
            >
              {loading ? 'Creating Account...' : (
                <>
                  Create Account <ArrowRight style={{ marginLeft: '8px' }} />
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
          .el-input__inner {
            width: 100%;
            padding: 12px 16px;
            border: 1px solid #dcdfe6;
            border-radius: 8px;
            font-size: 14px;
            outline: none;
            transition: border-color 0.2s;
          }
          .el-input__inner:focus {
            border-color: #667eea;
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
          }
          .submit-btn:hover {
            background: linear-gradient(135deg, #5a6fd6 0%, #6a4190 100%);
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
        `}</style>
      </div>
    );
  }

  if (currentStep === 'otp') {
    return (
      <div className="otp-container">
        <div className="otp-card">
          <div className="otp-header">
            <h1>Verify Your Email</h1>
            <p>Enter the 6-digit code sent to <strong>{otpEmail}</strong></p>
          </div>

          <OtpInput onComplete={handleOtpVerify} loading={loading} />

          <div className="otp-actions">
            <button
              type="button"
              className="el-button el-button--text"
              onClick={handleResendOtp}
              disabled={resendingOtp}
            >
              <Timer style={{ marginRight: '8px' }} />
              {resendingOtp ? 'Sending...' : 'Resend OTP'}
            </button>
          </div>

          <div className="otp-footer">
            <p>Wrong email? <a href="/signup">Go back</a></p>
          </div>
        </div>

        <style>{`
          .otp-container {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 20px;
          }
          .otp-card {
            background: white;
            border-radius: 16px;
            padding: 40px;
            width: 100%;
            max-width: 420px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          }
          .otp-header {
            text-align: center;
            margin-bottom: 32px;
          }
          .otp-header h1 {
            font-size: 24px;
            font-weight: 700;
            color: #1a1a2e;
            margin-bottom: 8px;
          }
          .otp-header p {
            color: #6b7280;
            font-size: 14px;
          }
          .otp-actions {
            display: flex;
            justify-content: center;
            margin-top: 24px;
          }
          .otp-footer {
            text-align: center;
            margin-top: 24px;
            padding-top: 24px;
            border-top: 1px solid #e5e7eb;
          }
          .otp-footer p {
            color: #6b7280;
            font-size: 14px;
          }
          .otp-footer a {
            color: #667eea;
            font-weight: 600;
            text-decoration: none;
          }
        `}</style>
      </div>
    );
  }

  return <ApprovalStatus email={otpEmail} />;
};

export default SignupPage;

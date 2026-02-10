import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ElMessage } from 'element-plus';

const OtpInput = ({ onComplete, loading, onResendClick }) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [localLoading, setLocalLoading] = useState(false);
  const [error, setError] = useState('');
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });
  const [countdown, setCountdown] = useState(0);
  const inputRefs = useRef([]);
  const RESEND_COOLDOWN = 30;

  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
    setCountdown(RESEND_COOLDOWN);
  }, []);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleInput = (index, value) => {
    if (value && !/^\d+$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');
    setStatusMessage({ type: '', text: '' });

    if (value && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus();
    }

    if (index === 5 && value) {
      const fullOtp = newOtp.join('');
      if (fullOtp.length === 6) {
        handleSubmit(fullOtp);
      }
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0 && inputRefs.current[index - 1]) {
        inputRefs.current[index - 1].focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    
    if (pasteData.length > 0) {
      setStatusMessage({ 
        type: 'info', 
        text: 'OTP pasted successfully!' 
      });
      ElMessage.success('OTP pasted successfully!');
      
      const newOtp = [...otp];
      pasteData.split('').forEach((char, index) => {
        if (index < 6) newOtp[index] = char;
      });
      setOtp(newOtp);
      setError('');

      if (pasteData.length === 6) {
        const fullOtp = newOtp.join('');
        handleSubmit(fullOtp);
      } else if (inputRefs.current[pasteData.length]) {
        inputRefs.current[pasteData.length].focus();
      }
    }
  };

  const handleSubmit = async (fullOtp) => {
    if (fullOtp.length !== 6) {
      setError('Please enter complete OTP');
      return;
    }

    setStatusMessage({ 
      type: 'loading', 
      text: 'Verifying your OTP...' 
    });
    setLocalLoading(true);
    setError('');

    try {
      await onComplete(fullOtp);
    } catch (err) {
      setStatusMessage({ type: '', text: '' });
      setError(err.message || 'Invalid OTP. Please try again.');
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLocalLoading(false);
    }
  };

  const handleResend = () => {
    if (countdown > 0) return;
    setCountdown(RESEND_COOLDOWN);
    setStatusMessage({ 
      type: 'info', 
      text: 'Resending OTP...' 
    });
    if (onResendClick) {
      onResendClick();
    }
  };

  const isLoading = loading || localLoading;

  return (
    <div className="otp-input-container">
      {statusMessage.text && statusMessage.type === 'info' && (
        <div className="otp-message info">
          <span className="message-icon">ℹ</span>
          {statusMessage.text}
        </div>
      )}
      
      {statusMessage.text && statusMessage.type === 'loading' && (
        <div className="otp-message loading">
          <span className="loading-spinner"></span>
          {statusMessage.text}
        </div>
      )}

      {error && (
        <div className="otp-error">
          <span className="error-icon">✕</span>
          {error}
        </div>
      )}
      
      <div className="otp-fields" onPaste={handlePaste}>
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleInput(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            className={`otp-input ${digit ? 'filled' : ''} ${error ? 'error' : ''}`}
            disabled={isLoading}
            autoComplete="off"
          />
        ))}
      </div>

      <div className="otp-hint">
        <span className="paste-icon">📋</span>
        You can paste the OTP directly
      </div>

      {isLoading && (
        <div className="otp-loading">
          <span className="loading-spinner"></span>
          Verifying...
        </div>
      )}

      {!isLoading && (
        <div className="otp-resend">
          {countdown > 0 ? (
            <span className="resend-timer">
              <span className="timer-icon">⏱</span>
              Resend OTP in {countdown}s
            </span>
          ) : (
            <button
              type="button"
              className="resend-btn"
              onClick={handleResend}
            >
              <span className="resend-icon">↻</span>
              Resend OTP
            </button>
          )}
        </div>
      )}

      <style>{`
        .otp-input-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 100%;
        }
        .otp-message {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 16px;
          border-radius: 8px;
          margin-bottom: 16px;
          font-size: 14px;
          width: 100%;
          animation: fadeIn 0.3s ease;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .otp-message.info {
          background: #e0f2fe;
          color: #0369a1;
          border: 1px solid #bae6fd;
        }
        .otp-message.loading {
          background: #f3f4f6;
          color: #4b5563;
          border: 1px solid #e5e7eb;
        }
        .otp-message .message-icon {
          font-size: 16px;
        }
        .otp-error {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #fef2f2;
          color: #dc2626;
          padding: 12px 16px;
          border-radius: 8px;
          margin-bottom: 16px;
          font-size: 14px;
          width: 100%;
          border: 1px solid #fecaca;
          animation: shake 0.5s ease-in-out;
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .otp-error .error-icon {
          font-size: 16px;
          font-weight: bold;
        }
        .otp-fields {
          display: flex;
          gap: 10px;
          justify-content: center;
          margin-bottom: 12px;
        }
        .otp-input {
          width: 48px;
          height: 56px;
          text-align: center;
          font-size: 24px;
          font-weight: 700;
          border: 2px solid #e5e7eb;
          border-radius: 10px;
          outline: none;
          transition: all 0.2s ease;
          background: #f9fafb;
          color: #1f2937;
        }
        .otp-input:focus {
          border-color: #667eea;
          background: white;
          box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.15);
          transform: scale(1.05);
        }
        .otp-input.filled {
          border-color: #667eea;
          background: white;
          color: #667eea;
        }
        .otp-input.error {
          border-color: #ef4444;
          background: #fef2f2;
          animation: shake 0.3s ease-in-out;
        }
        .otp-hint {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #9ca3af;
          font-size: 13px;
          margin-bottom: 16px;
        }
        .otp-hint .paste-icon {
          font-size: 14px;
        }
        .otp-loading {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #6b7280;
          font-size: 14px;
        }
        .loading-spinner {
          width: 18px;
          height: 18px;
          border: 2px solid #e5e7eb;
          border-top-color: #667eea;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .otp-resend {
          margin-top: 8px;
        }
        .resend-timer {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #9ca3af;
          font-size: 14px;
        }
        .resend-timer .timer-icon {
          font-size: 14px;
        }
        .resend-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          background: none;
          border: none;
          color: #667eea;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          padding: 8px 16px;
          border-radius: 6px;
          transition: all 0.2s;
        }
        .resend-btn:hover {
          background: rgba(102, 126, 234, 0.1);
        }
        .resend-icon {
          font-size: 16px;
        }
      `}</style>
    </div>
  );
};

export default OtpInput;

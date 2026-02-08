import React, { useState, useRef, useEffect } from 'react';
import { ElMessage } from 'element-plus';

const OtpInput = ({ onComplete, loading }) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [localLoading, setLocalLoading] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    // Focus first input on mount
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleInput = (index, value) => {
    // Only allow digits
    if (value && !/^\d+$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-submit when all fields are filled
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
    if (e.key === 'Backspace' && !otp[index] && index > 0 && inputRefs.current[index - 1]) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    
    if (pasteData.length > 0) {
      const newOtp = [...otp];
      pasteData.split('').forEach((char, index) => {
        if (index < 6) newOtp[index] = char;
      });
      setOtp(newOtp);

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
      ElMessage.error('Please enter complete OTP');
      return;
    }

    setLocalLoading(true);
    try {
      await onComplete(fullOtp);
    } finally {
      setLocalLoading(false);
    }
  };

  const isLoading = loading || localLoading;

  return (
    <div className="otp-input-container">
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
            className="otp-input"
            disabled={isLoading}
            autoComplete="off"
          />
        ))}
      </div>

      {isLoading && (
        <div className="otp-loading">
          <span className="loading-spinner"></span>
          Verifying...
        </div>
      )}

      <style>{`
        .otp-input-container {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .otp-fields {
          display: flex;
          gap: 12px;
          justify-content: center;
          margin-bottom: 16px;
        }
        .otp-input {
          width: 50px;
          height: 60px;
          text-align: center;
          font-size: 28px;
          font-weight: 700;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          outline: none;
          transition: all 0.2s ease;
          background: #f9fafb;
        }
        .otp-input:focus {
          border-color: #667eea;
          background: white;
          box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
          transform: scale(1.05);
        }
        .otp-input:not(:placeholder-shown) {
          border-color: #667eea;
          background: white;
        }
        .otp-loading {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #6b7280;
          font-size: 14px;
          margin-top: 16px;
        }
        .loading-spinner {
          width: 20px;
          height: 20px;
          border: 2px solid #e5e7eb;
          border-top-color: #667eea;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default OtpInput;

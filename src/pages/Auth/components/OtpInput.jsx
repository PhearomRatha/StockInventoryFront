import React, { useState, useRef, useEffect, useCallback } from 'react';
import { FiRefreshCw } from 'react-icons/fi';

const OtpInput = ({ 
  length = 6, 
  onComplete, 
  loading = false, 
  onResendClick,
  resending = false 
}) => {
  const [otp, setOtp] = useState(Array(length).fill(''));
  const [focusedIndex, setFocusedIndex] = useState(0);
  const inputRefs = useRef([]);

  // Focus first input on mount
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  // Handle input change
  const handleChange = useCallback((e, index) => {
    const value = e.target.value;

    // Only allow numbers
    if (value && !/^\d+$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-submit when all digits are filled
    if (value && index < length - 1) {
      inputRefs.current[index + 1].focus();
      setFocusedIndex(index + 1);
    }

    // Check if complete
    const otpString = newOtp.join('');
    if (otpString.length === length) {
      onComplete(otpString);
    }
  }, [otp, length, onComplete]);

  // Handle keydown
  const handleKeyDown = useCallback((e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
      setFocusedIndex(index - 1);
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1].focus();
      setFocusedIndex(index - 1);
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1].focus();
      setFocusedIndex(index + 1);
    }
  }, [otp, length]);

  // Handle paste
  const handlePaste = useCallback((e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();

    // Only process if all characters are digits
    if (!/^\d+$/.test(pastedData)) return;

    const digits = pastedData.slice(0, length).split('');
    const newOtp = [...otp];

    digits.forEach((digit, index) => {
      if (index < length) {
        newOtp[index] = digit;
      }
    });

    setOtp(newOtp);

    // Focus the next empty input or the last input
    const nextIndex = Math.min(digits.length, length - 1);
    if (inputRefs.current[nextIndex]) {
      inputRefs.current[nextIndex].focus();
      setFocusedIndex(nextIndex);
    }

    // Check if complete
    const otpString = newOtp.join('');
    if (otpString.length === length) {
      onComplete(otpString);
    }
  }, [otp, length, onComplete]);

  return (
    <div className="otp-container">
      <div className="otp-inputs" onPaste={handlePaste}>
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(e, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            onFocus={() => setFocusedIndex(index)}
            className={`otp-input ${focusedIndex === index ? 'focused' : ''} ${digit ? 'filled' : ''}`}
            disabled={loading}
            autoComplete="one-time-code"
          />
        ))}
      </div>

      {onResendClick && (
        <div className="otp-resend">
          <button
            type="button"
            className="resend-btn"
            onClick={onResendClick}
            disabled={resending || loading}
          >
            <FiRefreshCw className={resending ? 'spinning' : ''} />
            {resending ? 'Sending...' : 'Resend OTP'}
          </button>
        </div>
      )}

      <style jsx>{`
        .otp-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }

        .otp-inputs {
          display: flex;
          gap: 8px;
          justify-content: center;
        }

        .otp-input {
          width: 48px;
          height: 56px;
          text-align: center;
          font-size: 24px;
          font-weight: 600;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          outline: none;
          transition: all 0.2s ease;
          background: #fff;
        }

        .otp-input:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .otp-input.filled {
          border-color: #10b981;
          background: #f0fdf4;
        }

        .otp-input:focus.filled {
          border-color: #3b82f6;
          background: #fff;
        }

        .resend-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          background: none;
          border: none;
          color: #3b82f6;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          padding: 8px 16px;
          border-radius: 6px;
          transition: all 0.2s ease;
        }

        .resend-btn:hover:not(:disabled) {
          background: #eff6ff;
        }

        .resend-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .spinning {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default OtpInput;

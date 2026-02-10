import React, { useState, useEffect, useCallback } from 'react';
import { ElMessage } from 'element-plus';
import { FiCheck, FiClock, FiBell, FiCheckCircle, FiX, FiRefreshCw } from 'react-icons/fi';
import { CgSpinner } from 'react-icons/cg';
import { checkUserStatus } from '../../../api/authApi';

// User status constants (matching backend verification_status)
const STATUS = {
  PENDING: 'PENDING',
  VERIFIED: 'VERIFIED',
  PENDING_APPROVAL: 'PENDING_APPROVAL',
  ACTIVE: 'ACTIVE',
  REJECTED: 'REJECTED'
};

const ApprovalStatus = ({ email }) => {
  const [currentStatus, setCurrentStatus] = useState(STATUS.VERIFIED);
  const [loading, setLoading] = useState(true);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [lastChecked, setLastChecked] = useState(null);

  // Step definitions with icons and labels
  const steps = [
    {
      key: 'registered',
      label: 'Registered',
      description: 'Account created successfully',
      icon: FiBell
    },
    {
      key: 'verified',
      label: 'Email Verified',
      description: 'OTP verification completed',
      icon: FiCheckCircle
    },
    {
      key: 'pending',
      label: 'Pending Approval',
      description: 'Waiting for admin review',
      icon: FiClock
    },
    {
      key: 'active',
      label: 'Active',
      description: 'Account approved and active',
      icon: FiCheck
    }
  ];

  const checkStatus = useCallback(async () => {
    setCheckingStatus(true);
    try {
      const response = await checkUserStatus(email);
      if (response.success && response.data) {
        const newStatus = response.data.verification_status || response.data.account_status;
        setCurrentStatus(newStatus);
        setLastChecked(new Date());
        
        if (newStatus === STATUS.ACTIVE && currentStatus !== STATUS.ACTIVE) {
          ElMessage.success('Congratulations! Your account has been approved!');
        }
      }
    } catch (error) {
      console.error('Status check error:', error);
      // On error, keep current status but show friendly message
      if (!lastChecked) {
        ElMessage.warning('Unable to check status. Please try again.');
      }
    } finally {
      setCheckingStatus(false);
      setLoading(false);
    }
  }, [email, currentStatus, lastChecked]);

  useEffect(() => {
    // Check status immediately on mount
    checkStatus();

    // Poll every 15 seconds if not active or rejected
    const pollInterval = setInterval(() => {
      if (currentStatus !== STATUS.ACTIVE && currentStatus !== STATUS.REJECTED) {
        checkStatus();
      }
    }, 15000);

    return () => clearInterval(pollInterval);
  }, [checkStatus, currentStatus]);

  const getStatusStep = () => {
    if (currentStatus === STATUS.VERIFIED) return 1;
    if (currentStatus === STATUS.PENDING_APPROVAL || currentStatus === STATUS.PENDING) return 2;
    if (currentStatus === STATUS.ACTIVE) return 3;
    if (currentStatus === STATUS.REJECTED) return 3;
    return 0;
  };

  const formatLastChecked = () => {
    if (!lastChecked) return 'Not checked yet';
    const now = new Date();
    const diff = Math.floor((now - lastChecked) / 1000);
    if (diff < 60) return 'Just now';
    return `${diff}s ago`;
  };

  const statusStep = getStatusStep();

  if (loading) {
    return (
      <div className="status-container loading">
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <p>Checking your account status...</p>
        </div>
        <style>{`
          .status-container.loading {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 20px;
          }
          .loading-content {
            background: white;
            border-radius: 16px;
            padding: 40px;
            text-align: center;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          }
          .loading-spinner {
            width: 48px;
            height: 48px;
            border: 4px solid #e5e7eb;
            border-top-color: #667eea;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
            margin: 0 auto 16px;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
          .loading-content p {
            color: #6b7280;
            font-size: 14px;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="status-container">
      <div className="status-card">
        <div className="status-header">
          <div className="success-icon">
            <FiCheckCircle />
          </div>
          <h1>Account Verified!</h1>
          <p>Your email has been verified. Your account is now waiting for admin approval.</p>
        </div>

        {/* Progress Steps */}
        <div className="progress-steps">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isCompleted = index <= statusStep;
            const isCurrent = index === statusStep;
            const isPending = index > statusStep;
            const isRejected = currentStatus === STATUS.REJECTED && index === 3;

            return (
              <div
                key={step.key}
                className={`step ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''} ${isPending ? 'pending' : ''} ${isRejected ? 'rejected' : ''}`}
              >
                <div className="step-indicator">
                  {isCompleted && !isRejected ? (
                    <span className="step-icon completed">
                      <FiCheckCircle />
                    </span>
                  ) : isRejected ? (
                    <span className="step-icon rejected">
                      <FiX />
                    </span>
                  ) : (
                    <span className={`step-icon ${isCurrent ? 'current' : 'pending'}`}>
                      {isCurrent && checkingStatus ? (
                        <CgSpinner className="animate-spin" />
                      ) : (
                        <Icon />
                      )}
                    </span>
                  )}
                  {index < steps.length - 1 && !isRejected && (
                    <div className={`step-line ${index < statusStep ? 'completed' : ''}`}></div>
                  )}
                </div>
                <div className="step-content">
                  <span className="step-label">{step.label}</span>
                  <span className="step-description">{step.description}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Current Status Message */}
        <div className="status-message">
          {(currentStatus === STATUS.VERIFIED || currentStatus === STATUS.PENDING) && (
            <div className="message-box pending">
              <FiClock />
              <div>
                <p>Your account is pending admin approval.</p>
                <span className="message-subtitle">This usually takes 24-48 hours.</span>
              </div>
            </div>
          )}
          {currentStatus === STATUS.PENDING_APPROVAL && (
            <div className="message-box waiting">
              <FiClock />
              <div>
                <p>Your request is being reviewed.</p>
                <span className="message-subtitle">Please wait a bit longer.</span>
              </div>
            </div>
          )}
          {currentStatus === STATUS.ACTIVE && (
            <div className="message-box active">
              <FiCheck />
              <div>
                <p>Congratulations! Your account has been approved.</p>
                <span className="message-subtitle">You can now log in.</span>
              </div>
              <a href="/login" className="login-btn">Go to Login</a>
            </div>
          )}
          {currentStatus === STATUS.REJECTED && (
            <div className="message-box rejected">
              <FiX />
              <div>
                <p>Your account request has been rejected.</p>
                <span className="message-subtitle">Please contact support for more information.</span>
              </div>
            </div>
          )}
        </div>

        {/* Refresh Button */}
        {currentStatus !== STATUS.ACTIVE && currentStatus !== STATUS.REJECTED && (
          <div className="refresh-section">
            <button
              type="button"
              className="refresh-btn"
              onClick={checkStatus}
              disabled={checkingStatus}
            >
              <FiRefreshCw className={checkingStatus ? 'animate-spin' : ''} />
              {checkingStatus ? 'Checking...' : 'Refresh Status'}
            </button>
            <span className="last-checked">Last checked: {formatLastChecked()}</span>
          </div>
        )}

        {/* Email Notification Info */}
        <div className="email-notification">
          <FiBell />
          <p>You'll receive an email notification once your account is approved.</p>
        </div>
      </div>

      <style>{`
        .status-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 20px;
        }
        .status-card {
          background: white;
          border-radius: 16px;
          padding: 40px;
          width: 100%;
          max-width: 500px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }
        .status-header {
          text-align: center;
          margin-bottom: 32px;
        }
        .success-icon {
          width: 64px;
          height: 64px;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px;
          color: white;
          font-size: 32px;
        }
        .status-header h1 {
          font-size: 24px;
          font-weight: 700;
          color: #1a1a2e;
          margin-bottom: 8px;
        }
        .status-header p {
          color: #6b7280;
          font-size: 14px;
        }
        .progress-steps {
          display: flex;
          flex-direction: column;
          gap: 0;
          margin-bottom: 32px;
        }
        .step {
          display: flex;
          gap: 16px;
          position: relative;
        }
        .step-indicator {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .step-icon {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          z-index: 1;
          background: #f3f4f6;
          color: #9ca3af;
        }
        .step-icon.completed {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
        }
        .step-icon.current {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }
        .step-icon.rejected {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          color: white;
        }
        .step-line {
          width: 2px;
          height: 40px;
          background: #e5e7eb;
          margin: 4px 0;
        }
        .step-line.completed {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        }
        .step-content {
          display: flex;
          flex-direction: column;
          padding-bottom:  }
        .step24px;
       -label {
          font-weight: 600;
          color: #374151;
          font-size: 14px;
        }
        .step-description {
          font-size: 12px;
          color: #9ca3af;
        }
        .message-box {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 16px;
          border-radius: 12px;
          margin-bottom: 16px;
          font-size: 14px;
        }
        .message-box.pending {
          background: #fef3c7;
          color: #92400e;
        }
        .message-box.waiting {
          background: #dbeafe;
          color: #1e40af;
        }
        .message-box.active {
          background: #d1fae5;
          color: #065f46;
        }
        .message-box.rejected {
          background: #fee2e2;
          color: #991b1b;
        }
        .message-box svg {
          flex-shrink: 0;
          margin-top: 2px;
        }
        .message-subtitle {
          font-size: 12px;
          opacity: 0.8;
          display: block;
          margin-top: 4px;
        }
        .login-btn {
          display: inline-block;
          margin-top: 12px;
          padding: 10px 24px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-radius: 8px;
          text-decoration: none;
          font-weight: 600;
          transition: transform 0.2s;
        }
        .login-btn:hover {
          transform: translateY(-2px);
        }
        .refresh-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          margin-bottom: 24px;
        }
        .refresh-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          background: #f3f4f6;
          border: none;
          border-radius: 8px;
          color: #374151;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }
        .refresh-btn:hover:not(:disabled) {
          background: #e5e7eb;
        }
        .refresh-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .last-checked {
          font-size: 12px;
          color: #9ca3af;
        }
        .email-notification {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 16px;
          background: #f9fafb;
          border-radius: 8px;
          color: #6b7280;
          font-size: 13px;
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ApprovalStatus;

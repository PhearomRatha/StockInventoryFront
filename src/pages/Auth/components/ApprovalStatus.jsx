import React, { useState, useEffect } from 'react';
import { ElMessage } from 'element-plus';
import {
  CircleCheck,
  Clock,
  Loading,
  Bell,
  CheckCircle
} from '@element-plus/icons-vue';
import { checkUserStatus } from '../../../api/authApi';

// User status constants
const STATUS = {
  PENDING: 0,
  VERIFIED: 1,
  WAITING_APPROVAL: 2,
  ACTIVE: 3,
  REJECTED: 4
};

const ApprovalStatus = ({ email }) => {
  const [currentStatus, setCurrentStatus] = useState(STATUS.VERIFIED);
  const [loading, setLoading] = useState(true);
  const [checkingStatus, setCheckingStatus] = useState(false);

  // Step definitions with icons and labels
  const steps = [
    {
      key: 'registered',
      label: 'Registered',
      description: 'Account created successfully',
      icon: Bell
    },
    {
      key: 'verified',
      label: 'Email Verified',
      description: 'OTP verification completed',
      icon: CheckCircle
    },
    {
      key: 'pending',
      label: 'Pending Approval',
      description: 'Waiting for admin review',
      icon: Clock
    },
    {
      key: 'active',
      label: 'Active',
      description: 'Account approved and active',
      icon: CircleCheck
    }
  ];

  useEffect(() => {
    // Check status every 10 seconds if not active
    const pollStatus = async () => {
      if (currentStatus < STATUS.ACTIVE) {
        await checkStatus();
      }
    };

    const interval = setInterval(pollStatus, 10000);
    checkStatus();

    return () => clearInterval(interval);
  }, [currentStatus]);

  const checkStatus = async () => {
    setCheckingStatus(true);
    try {
      const response = await checkUserStatus(email);
      if (response.status === 200 && response.data) {
        setCurrentStatus(response.data.status);
        
        if (response.data.status === STATUS.ACTIVE) {
          ElMessage.success('Congratulations! Your account has been approved!');
        }
      }
    } catch (error) {
      console.error('Status check error:', error);
      // On error, keep current status
    } finally {
      setCheckingStatus(false);
      setLoading(false);
    }
  };

  const getStatusStep = () => {
    if (currentStatus === STATUS.VERIFIED) return 1; // After verified step
    if (currentStatus === STATUS.WAITING_APPROVAL) return 2; // After pending step
    if (currentStatus === STATUS.ACTIVE) return 3; // After active step
    return 0;
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
            <CheckCircle />
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

            return (
              <div
                key={step.key}
                className={`step ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''} ${isPending ? 'pending' : ''}`}
              >
                <div className="step-indicator">
                  {isCompleted ? (
                    <span className="step-icon completed">
                      <CheckCircle />
                    </span>
                  ) : (
                    <span className={`step-icon ${isCurrent ? 'current' : 'pending'}`}>
                      {isCurrent && checkingStatus ? (
                        <Loading className="animate-spin" />
                      ) : (
                        <Icon />
                      )}
                    </span>
                  )}
                  {index < steps.length - 1 && (
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
          {currentStatus === STATUS.VERIFIED && (
            <div className="message-box pending">
              <Clock />
              <p>Your account is pending admin approval. This usually takes 24-48 hours.</p>
            </div>
          )}
          {currentStatus === STATUS.WAITING_APPROVAL && (
            <div className="message-box waiting">
              <Clock />
              <p>Your request is being reviewed. Please wait a bit longer.</p>
            </div>
          )}
          {currentStatus === STATUS.ACTIVE && (
            <div className="message-box active">
              <CircleCheck />
              <p>Congratulations! Your account has been approved. You can now log in.</p>
              <a href="/login" className="login-btn">Go to Login</a>
            </div>
          )}
          {currentStatus === STATUS.REJECTED && (
            <div className="message-box rejected">
              <CircleCheck />
              <p>Your account request has been rejected. Please contact support for more information.</p>
            </div>
          )}
        </div>

        {/* Refresh Button */}
        {currentStatus < STATUS.ACTIVE && (
          <div className="refresh-section">
            <button
              type="button"
              className="refresh-btn"
              onClick={checkStatus}
              disabled={checkingStatus}
            >
              {checkingStatus ? (
                <>
                  <Loading className="animate-spin" /> Checking...
                </>
              ) : (
                <>
                  <Loading /> Refresh Status
                </>
              )}
            </button>
          </div>
        )}

        {/* Email Notification Info */}
        <div className="email-notification">
          <Bell />
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
          padding-bottom: 24px;
        }
        .step-label {
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
          justify-content: center;
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
        .refresh-btn:hover {
          background: #e5e7eb;
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

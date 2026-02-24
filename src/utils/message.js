// Global message store for toast notifications
// This allows calling ElMessage from anywhere without context

const listeners = [];

export const subscribe = (callback) => {
  listeners.push(callback);
  return () => {
    const index = listeners.indexOf(callback);
    if (index > -1) {
      listeners.splice(index, 1);
    }
  };
};

const showMessage = (message, severity = 'info') => {
  // Handle both string and object parameters
  const msg = typeof message === 'object' ? message.message : message;
  const sev = typeof message === 'object' ? message.type || severity : severity;
  listeners.forEach(callback => callback(msg, sev));
};

export const ElMessage = {
  success: (message) => {
    const msg = typeof message === 'object' ? message.message : message;
    showMessage(msg, 'success');
  },
  error: (message) => {
    const msg = typeof message === 'object' ? message.message : message;
    showMessage(msg, 'error');
  },
  warning: (message) => {
    const msg = typeof message === 'object' ? message.message : message;
    showMessage(msg, 'warning');
  },
  info: (message) => {
    const msg = typeof message === 'object' ? message.message : message;
    showMessage(msg, 'info');
  },
};

export default ElMessage;

import React, { useState, useEffect, useCallback } from 'react';
import { Snackbar, Alert } from '@mui/material';
import { subscribe, ElMessage as GlobalElMessage } from '../../utils/message';

const SnackbarProvider = ({ children }) => {
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info',
  });

  const showMessage = useCallback((message, severity = 'info') => {
    setSnackbar({ open: true, message, severity });
  }, []);

  useEffect(() => {
    const unsubscribe = subscribe((message, severity) => {
      showMessage(message, severity);
    });
    return unsubscribe;
  }, [showMessage]);

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <>
      {children}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={handleClose}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

// Re-export ElMessage for easy importing
export { GlobalElMessage as ElMessage };
export default SnackbarProvider;

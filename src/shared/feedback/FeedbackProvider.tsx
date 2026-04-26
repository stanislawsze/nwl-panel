/* eslint-disable react-refresh/only-export-components */
import { Alert, Snackbar } from '@mui/material';
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { ApiError } from '../../lib/api';

type ToastSeverity = 'success' | 'info' | 'warning' | 'error';

type ToastState = {
  message: string;
  severity: ToastSeverity;
};

type FeedbackContextValue = {
  notify: (message: string, severity?: ToastSeverity) => void;
  notifyError: (error: unknown, fallback?: string) => void;
};

const FeedbackContext = createContext<FeedbackContextValue | null>(null);

export function FeedbackProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastState | null>(null);

  const notify = useCallback(
    (message: string, severity: ToastSeverity = 'success') => {
      setToast({ message, severity });
    },
    [],
  );

  const notifyError = useCallback(
    (error: unknown, fallback = 'Something went wrong.') => {
      const message = error instanceof ApiError ? error.message : fallback;
      setToast({ message, severity: 'error' });
    },
    [],
  );

  const value = useMemo(() => ({ notify, notifyError }), [notify, notifyError]);

  return (
    <FeedbackContext.Provider value={value}>
      {children}
      <Snackbar
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        autoHideDuration={4500}
        onClose={() => setToast(null)}
        open={toast !== null}
      >
        <Alert
          onClose={() => setToast(null)}
          severity={toast?.severity ?? 'info'}
          variant="filled"
        >
          {toast?.message}
        </Alert>
      </Snackbar>
    </FeedbackContext.Provider>
  );
}

export function useFeedback() {
  const context = useContext(FeedbackContext);

  if (!context) {
    throw new Error('useFeedback must be used inside FeedbackProvider');
  }

  return context;
}

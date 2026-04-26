import { Alert } from '@mui/material';

import { ApiError } from '../../lib/api';

export function FormError({ error }: { error: unknown }) {
  if (!error) {
    return null;
  }

  const message =
    error instanceof ApiError ? error.message : 'Something went wrong.';

  return <Alert severity="error">{message}</Alert>;
}

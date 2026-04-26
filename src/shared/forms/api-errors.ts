import type { FieldValues, Path, UseFormSetError } from 'react-hook-form';

import { ApiError } from '../../lib/api';

export function applyApiValidationErrors<TValues extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<TValues>,
): boolean {
  if (!(error instanceof ApiError) || !error.validationErrors) {
    return false;
  }

  for (const [field, messages] of Object.entries(error.validationErrors)) {
    const [message] = messages;

    if (!message) {
      continue;
    }

    setError(field as Path<TValues>, {
      message,
      type: 'server',
    });
  }

  return true;
}

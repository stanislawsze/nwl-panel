import { zodResolver } from '@hookform/resolvers/zod';
import { UserPlus } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, Navigate, useNavigate } from 'react-router-dom';

import { useAuth } from '../../modules/auth/AuthProvider';
import { useFeedback } from '../../shared/feedback/FeedbackProvider';
import { applyApiValidationErrors } from '../../shared/forms/api-errors';
import {
  registerFormSchema,
  type RegisterFormValues,
} from '../../shared/forms/schemas';
import { FormError } from '../FormError';

export function RegisterPage() {
  const { register, token } = useAuth();
  const { notify, notifyError } = useFeedback();
  const navigate = useNavigate();
  const [error, setError] = useState<unknown>(null);
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register: registerField,
    setError: setFieldError,
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
  });

  if (token) {
    return <Navigate to="/" replace />;
  }

  async function submit(values: RegisterFormValues) {
    setError(null);

    try {
      await register(values);
      notify('Account created successfully.');
      navigate('/', { replace: true });
    } catch (caught) {
      if (!applyApiValidationErrors(caught, setFieldError)) {
        setError(caught);
      }
      notifyError(caught, 'Registration failed.');
    }
  }

  return (
    <form
      className="form-card"
      onSubmit={(event) => void handleSubmit(submit)(event)}
    >
      <h2>Create account</h2>
      <label>
        Name
        <input autoComplete="name" {...registerField('name')} type="text" />
        {errors.name && (
          <small className="field-error">{errors.name.message}</small>
        )}
      </label>
      <label>
        Email
        <input autoComplete="email" {...registerField('email')} type="email" />
        {errors.email && (
          <small className="field-error">{errors.email.message}</small>
        )}
      </label>
      <label>
        Password
        <input
          autoComplete="new-password"
          {...registerField('password')}
          type="password"
        />
        {errors.password && (
          <small className="field-error">{errors.password.message}</small>
        )}
      </label>
      <FormError error={error} />
      <button disabled={isSubmitting} type="submit">
        <UserPlus aria-hidden="true" size={18} />
        {isSubmitting ? 'Creating account' : 'Create account'}
      </button>
      <p className="muted">
        Already registered? <Link to="/login">Sign in</Link>
      </p>
    </form>
  );
}

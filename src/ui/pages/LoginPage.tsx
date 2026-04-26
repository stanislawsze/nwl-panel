import { zodResolver } from '@hookform/resolvers/zod';
import { KeyRound } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  Link,
  Navigate,
  useLocation,
  useNavigate,
  useSearchParams,
} from 'react-router-dom';

import { useAuth } from '../../modules/auth/AuthProvider';
import { useFeedback } from '../../shared/feedback/FeedbackProvider';
import { applyApiValidationErrors } from '../../shared/forms/api-errors';
import {
  loginFormSchema,
  type LoginFormValues,
} from '../../shared/forms/schemas';
import { FormError } from '../FormError';

export function LoginPage() {
  const { signIn, token, acceptInvitation } = useAuth();
  const { notify, notifyError } = useFeedback();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState<unknown>(null);
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    setError: setFieldError,
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
  });

  if (token) {
    return <Navigate to="/" replace />;
  }

  async function submit(values: LoginFormValues) {
    setError(null);

    try {
      await signIn(values);

      const invitation = searchParams.get('invitation');
      if (invitation) {
        await acceptInvitation(invitation);
        notify('Invitation accepted. Welcome in.');
      } else {
        notify('Signed in successfully.');
      }

      const redirect =
        (location.state as { from?: Location } | null)?.from?.pathname ?? '/';
      navigate(redirect, { replace: true });
    } catch (caught) {
      if (!applyApiValidationErrors(caught, setFieldError)) {
        setError(caught);
      }
      notifyError(caught, 'Sign in failed.');
    }
  }

  return (
    <form
      className="form-card"
      onSubmit={(event) => void handleSubmit(submit)(event)}
    >
      <h2>Sign in</h2>
      <label>
        Email
        <input autoComplete="email" {...register('email')} type="email" />
        {errors.email && (
          <small className="field-error">{errors.email.message}</small>
        )}
      </label>
      <label>
        Password
        <input
          autoComplete="current-password"
          {...register('password')}
          type="password"
        />
        {errors.password && (
          <small className="field-error">{errors.password.message}</small>
        )}
      </label>
      <FormError error={error} />
      <button disabled={isSubmitting} type="submit">
        <KeyRound aria-hidden="true" size={18} />
        {isSubmitting ? 'Signing in' : 'Sign in'}
      </button>
      <p className="muted">
        Need an account? <Link to="/register">Create one</Link>
      </p>
    </form>
  );
}

import { KeyRound } from 'lucide-react';
import { FormEvent, useState } from 'react';
import {
  Link,
  Navigate,
  useLocation,
  useNavigate,
  useSearchParams,
} from 'react-router-dom';

import { useAuth } from '../../modules/auth/AuthProvider';
import { FormError } from '../FormError';

export function LoginPage() {
  const { signIn, token, acceptInvitation } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState<unknown>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (token) {
    return <Navigate to="/" replace />;
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    const data = new FormData(event.currentTarget);

    try {
      await signIn({
        email: String(data.get('email')),
        password: String(data.get('password')),
      });

      const invitation = searchParams.get('invitation');
      if (invitation) {
        await acceptInvitation(invitation);
      }

      const redirect =
        (location.state as { from?: Location } | null)?.from?.pathname ?? '/';
      navigate(redirect, { replace: true });
    } catch (caught) {
      setError(caught);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="form-card" onSubmit={submit}>
      <h2>Sign in</h2>
      <label>
        Email
        <input autoComplete="email" name="email" required type="email" />
      </label>
      <label>
        Password
        <input
          autoComplete="current-password"
          minLength={8}
          name="password"
          required
          type="password"
        />
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

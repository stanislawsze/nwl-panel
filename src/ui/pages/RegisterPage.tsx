import { UserPlus } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';

import { useAuth } from '../../modules/auth/AuthProvider';
import { FormError } from '../FormError';

export function RegisterPage() {
  const { register, token } = useAuth();
  const navigate = useNavigate();
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
      await register({
        name: String(data.get('name')),
        email: String(data.get('email')),
        password: String(data.get('password')),
      });
      navigate('/', { replace: true });
    } catch (caught) {
      setError(caught);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="form-card" onSubmit={submit}>
      <h2>Create account</h2>
      <label>
        Name
        <input autoComplete="name" name="name" required type="text" />
      </label>
      <label>
        Email
        <input autoComplete="email" name="email" required type="email" />
      </label>
      <label>
        Password
        <input
          autoComplete="new-password"
          minLength={8}
          name="password"
          required
          type="password"
        />
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

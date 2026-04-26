import { Check, KeyRound, UserPlus } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { api } from '../../lib/api';
import { formatDate, title } from '../../lib/format';
import { useAuth } from '../../modules/auth/AuthProvider';
import type { InvitationPreview } from '../../types';
import { FormError } from '../FormError';

export function InvitationPage() {
  const { token = '' } = useParams();
  const navigate = useNavigate();
  const auth = useAuth();
  const [preview, setPreview] = useState<InvitationPreview | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    api.previewInvitation(token).then(setPreview).catch(setError);
  }, [token]);

  async function register(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    const data = new FormData(event.currentTarget);

    try {
      await auth.completeInvitationRegistration(token, {
        name: String(data.get('name')),
        password: String(data.get('password')),
      });
      navigate('/', { replace: true });
    } catch (caught) {
      setError(caught);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function accept() {
    setError(null);
    setIsSubmitting(true);

    try {
      await auth.acceptInvitation(token);
      navigate('/', { replace: true });
    } catch (caught) {
      setError(caught);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!preview && !error) {
    return <div className="form-card">Loading invitation...</div>;
  }

  return (
    <section className="form-card">
      <h2>{preview ? `${preview.tenant.name} invitation` : 'Invitation'}</h2>
      {preview && (
        <div className="summary-list">
          <span>Email</span>
          <strong>{preview.email}</strong>
          <span>Role</span>
          <strong>{title(preview.role)}</strong>
          <span>Status</span>
          <strong>{title(preview.status)}</strong>
          <span>Expires</span>
          <strong>{formatDate(preview.expires_at)}</strong>
        </div>
      )}
      <FormError error={error} />
      {preview?.status === 'pending' &&
        preview.recommended_action === 'register' && (
          <form className="stack" onSubmit={register}>
            <label>
              Name
              <input autoComplete="name" name="name" required type="text" />
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
            <button disabled={isSubmitting} type="submit">
              <UserPlus aria-hidden="true" size={18} />
              Join workspace
            </button>
          </form>
        )}
      {preview?.status === 'pending' &&
        preview.recommended_action === 'login' && (
          <div className="actions">
            {auth.token ? (
              <button
                disabled={isSubmitting}
                onClick={() => void accept()}
                type="button"
              >
                <Check aria-hidden="true" size={18} />
                Accept invitation
              </button>
            ) : (
              <Link className="button-link" to={`/login?invitation=${token}`}>
                <KeyRound aria-hidden="true" size={18} />
                Sign in to accept
              </Link>
            )}
          </div>
        )}
    </section>
  );
}

import { zodResolver } from '@hookform/resolvers/zod';
import { Check, KeyRound, UserPlus } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { useInvitationPreview } from '../../features/invitations/use-invitations';
import { formatDate, title } from '../../lib/format';
import { useAuth } from '../../modules/auth/AuthProvider';
import { useFeedback } from '../../shared/feedback/FeedbackProvider';
import { applyApiValidationErrors } from '../../shared/forms/api-errors';
import {
  invitationRegistrationFormSchema,
  type InvitationRegistrationFormValues,
} from '../../shared/forms/schemas';
import { FormError } from '../FormError';

export function InvitationPage() {
  const { token = '' } = useParams();
  const navigate = useNavigate();
  const auth = useAuth();
  const { notify, notifyError } = useFeedback();
  const previewQuery = useInvitationPreview(token);
  const [error, setError] = useState<unknown>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const preview = previewQuery.data ?? null;
  const {
    formState: { errors },
    handleSubmit,
    register,
    setError: setFieldError,
  } = useForm<InvitationRegistrationFormValues>({
    resolver: zodResolver(invitationRegistrationFormSchema),
  });

  async function registerFromInvitation(
    values: InvitationRegistrationFormValues,
  ) {
    setError(null);
    setIsSubmitting(true);

    try {
      await auth.completeInvitationRegistration(token, values);
      notify('Workspace joined successfully.');
      navigate('/', { replace: true });
    } catch (caught) {
      if (!applyApiValidationErrors(caught, setFieldError)) {
        setError(caught);
      }
      notifyError(caught, 'Invitation registration failed.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function accept() {
    setError(null);
    setIsSubmitting(true);

    try {
      await auth.acceptInvitation(token);
      notify('Invitation accepted.');
      navigate('/', { replace: true });
    } catch (caught) {
      setError(caught);
      notifyError(caught, 'Could not accept the invitation.');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!preview && !error && previewQuery.isLoading) {
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
      <FormError error={error ?? previewQuery.error} />
      {preview?.status === 'pending' &&
        preview.recommended_action === 'register' && (
          <form
            className="stack"
            onSubmit={(event) =>
              void handleSubmit(registerFromInvitation)(event)
            }
          >
            <label>
              Name
              <input autoComplete="name" {...register('name')} type="text" />
              {errors.name && (
                <small className="field-error">{errors.name.message}</small>
              )}
            </label>
            <label>
              Password
              <input
                autoComplete="new-password"
                {...register('password')}
                type="password"
              />
              {errors.password && (
                <small className="field-error">{errors.password.message}</small>
              )}
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

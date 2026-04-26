import PersonAddIcon from '@mui/icons-material/PersonAdd';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, IconButton, MenuItem, TextField } from '@mui/material';
import { Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import {
  useInvitations,
  useResendInvitation,
} from '../../features/invitations/use-invitations';
import {
  useAddMember,
  useMembers,
  useRemoveMember,
  useUpdateMember,
} from '../../features/members/use-members';
import { formatDate, title } from '../../lib/format';
import { useFeedback } from '../../shared/feedback/FeedbackProvider';
import {
  memberFormSchema,
  type MemberFormValues,
} from '../../shared/forms/schemas';
import type { MembershipRole } from '../../types';
import { membershipRoles } from '../../types';
import { FormError } from '../FormError';

export function MembersPage() {
  const membersQuery = useMembers();
  const invitationsQuery = useInvitations();
  const addMemberMutation = useAddMember();
  const updateMemberMutation = useUpdateMember();
  const removeMemberMutation = useRemoveMember();
  const resendInvitationMutation = useResendInvitation();
  const { notify, notifyError } = useFeedback();
  const [error, setError] = useState<unknown>(null);
  const memberForm = useForm<MemberFormValues>({
    defaultValues: {
      role: 'support',
    },
    resolver: zodResolver(memberFormSchema),
  });

  const members = membersQuery.data ?? [];
  const invitations = invitationsQuery.data ?? [];

  async function addMember(values: MemberFormValues) {
    setError(null);

    try {
      await addMemberMutation.mutateAsync(values);
      memberForm.reset({ role: 'support', email: '' });
      notify('Member added.');
    } catch (caught) {
      setError(caught);
      notifyError(caught, 'Could not add member.');
    }
  }

  async function updateRole(memberId: number, role: MembershipRole) {
    try {
      await updateMemberMutation.mutateAsync({ userId: memberId, role });
      notify('Member role updated.');
    } catch (caught) {
      setError(caught);
      notifyError(caught, 'Could not update member role.');
    }
  }

  async function remove(memberId: number) {
    try {
      await removeMemberMutation.mutateAsync(memberId);
      notify('Member removed.');
    } catch (caught) {
      setError(caught);
      notifyError(caught, 'Could not remove member.');
    }
  }

  async function resend(invitationId: number) {
    try {
      await resendInvitationMutation.mutateAsync(invitationId);
      notify('Invitation resent.');
    } catch (caught) {
      setError(caught);
      notifyError(caught, 'Could not resend invitation.');
    }
  }

  return (
    <main className="page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Access</p>
          <h1>Members</h1>
        </div>
      </div>

      <FormError
        error={error ?? membersQuery.error ?? invitationsQuery.error}
      />

      <form
        className="panel form-row"
        onSubmit={(event) => void memberForm.handleSubmit(addMember)(event)}
      >
        <TextField
          className="flex-1"
          error={Boolean(memberForm.formState.errors.email)}
          helperText={memberForm.formState.errors.email?.message}
          label="Existing user email"
          required
          size="small"
          type="email"
          {...memberForm.register('email')}
        />
        <TextField
          defaultValue="support"
          error={Boolean(memberForm.formState.errors.role)}
          helperText={memberForm.formState.errors.role?.message}
          label="Role"
          required
          select
          size="small"
          {...memberForm.register('role')}
        >
          {membershipRoles
            .filter((role) => role !== 'owner')
            .map((role) => (
              <MenuItem key={role} value={role}>
                {title(role)}
              </MenuItem>
            ))}
        </TextField>
        <Button
          disabled={addMemberMutation.isPending}
          startIcon={<PersonAddIcon />}
          type="submit"
        >
          Add member
        </Button>
      </form>

      <section className="panel">
        <h2>Active members</h2>
        <div className="table">
          {members.map((member) => (
            <div className="table-row" key={member.id}>
              <span>
                <strong>{member.name}</strong>
                <small>{member.email}</small>
              </span>
              <TextField
                aria-label={`Role for ${member.name}`}
                disabled={member.is_current_user}
                onChange={(event) =>
                  void updateRole(
                    member.id,
                    event.target.value as MembershipRole,
                  )
                }
                select
                size="small"
                value={member.membership_role ?? 'member'}
              >
                {membershipRoles.map((role) => (
                  <MenuItem key={role} value={role}>
                    {title(role)}
                  </MenuItem>
                ))}
              </TextField>
              <span>{formatDate(member.joined_at)}</span>
              <IconButton
                aria-label={`Remove ${member.name}`}
                disabled={
                  member.is_current_user || removeMemberMutation.isPending
                }
                onClick={() => void remove(member.id)}
                size="small"
              >
                <Trash2 aria-hidden="true" size={16} />
              </IconButton>
            </div>
          ))}
          {members.length === 0 && <p className="muted">No members to show.</p>}
        </div>
      </section>

      <section className="panel">
        <h2>Open invitations</h2>
        <div className="table">
          {invitations.map((invitation) => (
            <div className="table-row" key={invitation.id}>
              <span>{invitation.email}</span>
              <span>{title(invitation.role)}</span>
              <span>{invitation.is_pending ? 'Pending' : 'Closed'}</span>
              <Button
                disabled={resendInvitationMutation.isPending}
                onClick={() => void resend(invitation.id)}
                size="small"
                startIcon={<VerifiedUserIcon />}
                type="button"
                variant="outlined"
              >
                Resend
              </Button>
            </div>
          ))}
          {invitations.length === 0 && (
            <p className="muted">No invitations to show.</p>
          )}
        </div>
      </section>
    </main>
  );
}

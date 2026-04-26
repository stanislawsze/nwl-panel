import CancelScheduleSendIcon from '@mui/icons-material/CancelScheduleSend';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  Chip,
  type ChipProps,
  IconButton,
  MenuItem,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
} from '@mui/material';
import { Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import {
  useInvitations,
  useRevokeInvitation,
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
import { membershipRoles, type TenantInvitation } from '../../types';
import { FormError } from '../FormError';

type InvitationStatus = 'all' | 'pending' | 'accepted' | 'revoked' | 'expired';

export function MembersPage() {
  const membersQuery = useMembers();
  const invitationsQuery = useInvitations();
  const addMemberMutation = useAddMember();
  const updateMemberMutation = useUpdateMember();
  const removeMemberMutation = useRemoveMember();
  const resendInvitationMutation = useResendInvitation();
  const revokeInvitationMutation = useRevokeInvitation();
  const { notify, notifyError } = useFeedback();
  const [error, setError] = useState<unknown>(null);
  const [invitationStatus, setInvitationStatus] =
    useState<InvitationStatus>('pending');
  const memberForm = useForm<MemberFormValues>({
    defaultValues: {
      role: 'support',
    },
    resolver: zodResolver(memberFormSchema),
  });

  const members = membersQuery.data ?? [];
  const invitations = invitationsQuery.data ?? [];
  const filteredInvitations = invitations.filter((invitation) => {
    if (invitationStatus === 'all') {
      return true;
    }

    return invitationStatusFor(invitation) === invitationStatus;
  });

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

  async function revoke(invitationId: number) {
    try {
      await revokeInvitationMutation.mutateAsync(invitationId);
      notify('Invitation revoked.');
    } catch (caught) {
      setError(caught);
      notifyError(caught, 'Could not revoke invitation.');
    }
  }

  async function copyInvitationLink(invitation: TenantInvitation) {
    const link = `${window.location.origin}/invitations/${invitation.token}`;

    try {
      await window.navigator.clipboard.writeText(link);
      notify('Invitation link copied.');
    } catch {
      notifyError(null, 'Could not copy invitation link.');
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
        <div className="section-heading">
          <h2>Invitations</h2>
          <ToggleButtonGroup
            aria-label="Invitation status"
            exclusive
            onChange={(_, value: InvitationStatus | null) => {
              if (value) {
                setInvitationStatus(value);
              }
            }}
            size="small"
            value={invitationStatus}
          >
            <ToggleButton value="pending">Pending</ToggleButton>
            <ToggleButton value="accepted">Accepted</ToggleButton>
            <ToggleButton value="revoked">Revoked</ToggleButton>
            <ToggleButton value="expired">Expired</ToggleButton>
            <ToggleButton value="all">All</ToggleButton>
          </ToggleButtonGroup>
        </div>
        <div className="table">
          {filteredInvitations.map((invitation) => {
            const status = invitationStatusFor(invitation);

            return (
              <div className="table-row invitation-row" key={invitation.id}>
                <span>
                  <strong>{invitation.email}</strong>
                  <small>
                    Sent{' '}
                    {formatDate(
                      invitation.last_sent_at ?? invitation.created_at,
                    )}
                  </small>
                </span>
                <span>{title(invitation.role)}</span>
                <Chip
                  color={statusColor(status)}
                  label={title(status)}
                  size="small"
                  variant="outlined"
                />
                <span>{formatDate(invitation.expires_at)}</span>
                <div className="row-actions">
                  <Tooltip title="Copy invitation link">
                    <span>
                      <IconButton
                        aria-label={`Copy invitation link for ${invitation.email}`}
                        disabled={!invitation.is_pending}
                        onClick={() => void copyInvitationLink(invitation)}
                        size="small"
                      >
                        <ContentCopyIcon fontSize="inherit" />
                      </IconButton>
                    </span>
                  </Tooltip>
                  <Tooltip title="Resend invitation">
                    <span>
                      <IconButton
                        aria-label={`Resend invitation to ${invitation.email}`}
                        disabled={
                          !invitation.is_pending ||
                          resendInvitationMutation.isPending
                        }
                        onClick={() => void resend(invitation.id)}
                        size="small"
                      >
                        <VerifiedUserIcon fontSize="inherit" />
                      </IconButton>
                    </span>
                  </Tooltip>
                  <Tooltip title="Revoke invitation">
                    <span>
                      <IconButton
                        aria-label={`Revoke invitation for ${invitation.email}`}
                        color="error"
                        disabled={
                          !invitation.is_pending ||
                          revokeInvitationMutation.isPending
                        }
                        onClick={() => void revoke(invitation.id)}
                        size="small"
                      >
                        <CancelScheduleSendIcon fontSize="inherit" />
                      </IconButton>
                    </span>
                  </Tooltip>
                </div>
              </div>
            );
          })}
          {invitations.length > 0 && filteredInvitations.length === 0 && (
            <p className="muted">No invitations match this filter.</p>
          )}
          {invitations.length === 0 && (
            <p className="muted">No invitations to show.</p>
          )}
        </div>
      </section>
    </main>
  );
}

function invitationStatusFor(
  invitation: TenantInvitation,
): Exclude<InvitationStatus, 'all'> {
  if (invitation.accepted_at) {
    return 'accepted';
  }

  if (invitation.revoked_at) {
    return 'revoked';
  }

  if (
    invitation.expires_at &&
    new Date(invitation.expires_at).getTime() < Date.now()
  ) {
    return 'expired';
  }

  return 'pending';
}

function statusColor(
  status: Exclude<InvitationStatus, 'all'>,
): ChipProps['color'] {
  switch (status) {
    case 'accepted':
      return 'success';
    case 'revoked':
      return 'error';
    case 'expired':
      return 'warning';
    case 'pending':
      return 'info';
  }
}

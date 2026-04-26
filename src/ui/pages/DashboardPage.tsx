import AddIcon from '@mui/icons-material/Add';
import SendIcon from '@mui/icons-material/Send';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Card, CardContent, MenuItem, TextField } from '@mui/material';
import { Building2, Send, Users, type LucideIcon } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import {
  useCreateInvitation,
  useInvitations,
} from '../../features/invitations/use-invitations';
import { useMembers } from '../../features/members/use-members';
import {
  useCreateTenant,
  useTenants,
} from '../../features/tenants/use-tenants';
import { formatDate, title } from '../../lib/format';
import { useAuth } from '../../modules/auth/AuthProvider';
import { useTenantPermissions } from '../../shared/auth/permissions';
import { useFeedback } from '../../shared/feedback/FeedbackProvider';
import { applyApiValidationErrors } from '../../shared/forms/api-errors';
import {
  invitationFormSchema,
  tenantFormSchema,
  type InvitationFormValues,
  type TenantFormValues,
} from '../../shared/forms/schemas';
import { membershipRoles } from '../../types';
import { FormError } from '../FormError';

export function DashboardPage() {
  const { user, refreshUser } = useAuth();
  const { canCreateUsers, canViewUsers } = useTenantPermissions();
  const tenantsQuery = useTenants();
  const membersQuery = useMembers(canViewUsers);
  const invitationsQuery = useInvitations(canViewUsers);
  const createTenantMutation = useCreateTenant();
  const createInvitationMutation = useCreateInvitation();
  const { notify, notifyError } = useFeedback();
  const [error, setError] = useState<unknown>(null);
  const tenantForm = useForm<TenantFormValues>({
    resolver: zodResolver(tenantFormSchema),
  });
  const invitationForm = useForm<InvitationFormValues>({
    defaultValues: {
      role: 'support',
      expires_in_hours: 168,
    },
    resolver: zodResolver(invitationFormSchema),
  });

  const tenants = tenantsQuery.data ?? [];
  const members = membersQuery.data ?? [];
  const invitations = invitationsQuery.data ?? [];

  async function createTenant(values: TenantFormValues) {
    setError(null);

    try {
      await createTenantMutation.mutateAsync(values);
      tenantForm.reset();
      await refreshUser();
      notify('Tenant created.');
    } catch (caught) {
      if (!applyApiValidationErrors(caught, tenantForm.setError)) {
        setError(caught);
      }
      notifyError(caught, 'Could not create tenant.');
    }
  }

  async function invite(values: InvitationFormValues) {
    setError(null);

    try {
      await createInvitationMutation.mutateAsync(values);
      invitationForm.reset({ role: 'support', expires_in_hours: 168 });
      notify('Invitation sent.');
    } catch (caught) {
      if (!applyApiValidationErrors(caught, invitationForm.setError)) {
        setError(caught);
      }
      notifyError(caught, 'Could not send invitation.');
    }
  }

  return (
    <main className="page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Overview</p>
          <h1>{user?.current_tenant?.name ?? 'Workspace'}</h1>
        </div>
        <span className="badge">
          {title(user?.current_tenant?.membership_role)}
        </span>
      </div>

      <section className="metric-grid">
        <Metric icon={Building2} label="Tenants" value={tenants.length} />
        <Metric
          icon={Users}
          label="Members"
          value={canViewUsers ? members.length : 0}
        />
        <Metric
          icon={Send}
          label="Pending invitations"
          value={invitations.filter((item) => item.is_pending).length}
        />
      </section>

      <FormError
        error={
          error ??
          tenantsQuery.error ??
          membersQuery.error ??
          invitationsQuery.error
        }
      />

      <section className="two-column">
        <Card
          component="form"
          onSubmit={(event) =>
            void tenantForm.handleSubmit(createTenant)(event)
          }
        >
          <CardContent className="grid gap-4">
            <h2>Create tenant</h2>
            <TextField
              error={Boolean(tenantForm.formState.errors.name)}
              helperText={tenantForm.formState.errors.name?.message}
              label="Name"
              required
              size="small"
              {...tenantForm.register('name')}
            />
            <Button
              disabled={createTenantMutation.isPending}
              startIcon={<AddIcon />}
              type="submit"
            >
              Create
            </Button>
          </CardContent>
        </Card>

        {canCreateUsers ? (
          <Card
            component="form"
            onSubmit={(event) =>
              void invitationForm.handleSubmit(invite)(event)
            }
          >
            <CardContent className="grid gap-4">
              <h2>Invite member</h2>
              <TextField
                error={Boolean(invitationForm.formState.errors.email)}
                helperText={invitationForm.formState.errors.email?.message}
                label="Email"
                required
                size="small"
                type="email"
                {...invitationForm.register('email')}
              />
              <div className="grid gap-4 md:grid-cols-[1fr_8rem]">
                <TextField
                  error={Boolean(invitationForm.formState.errors.role)}
                  helperText={invitationForm.formState.errors.role?.message}
                  label="Role"
                  required
                  select
                  size="small"
                  defaultValue="support"
                  {...invitationForm.register('role')}
                >
                  {membershipRoles
                    .filter((role) => role !== 'owner')
                    .map((role) => (
                      <MenuItem key={role} value={role}>
                        {title(role)}
                      </MenuItem>
                    ))}
                </TextField>
                <TextField
                  error={Boolean(
                    invitationForm.formState.errors.expires_in_hours,
                  )}
                  helperText={
                    invitationForm.formState.errors.expires_in_hours?.message
                  }
                  label="Hours"
                  slotProps={{ htmlInput: { min: 1, max: 720 } }}
                  size="small"
                  type="number"
                  defaultValue={168}
                  {...invitationForm.register('expires_in_hours', {
                    valueAsNumber: true,
                  })}
                />
              </div>
              <Button
                disabled={createInvitationMutation.isPending}
                startIcon={<SendIcon />}
                type="submit"
              >
                Send invite
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="grid gap-4">
              <h2>Invite member</h2>
              <p className="muted">
                Your current tenant role cannot create invitations.
              </p>
            </CardContent>
          </Card>
        )}
      </section>

      {canViewUsers && (
        <section className="panel">
          <h2>Recent invitations</h2>
          <div className="table">
            {invitations.slice(0, 5).map((invitation) => (
              <div className="table-row" key={invitation.id}>
                <span>{invitation.email}</span>
                <span>{title(invitation.role)}</span>
                <span>{invitation.is_pending ? 'Pending' : 'Closed'}</span>
                <span>{formatDate(invitation.expires_at)}</span>
              </div>
            ))}
            {invitations.length === 0 && (
              <p className="muted">No invitations yet.</p>
            )}
          </div>
        </section>
      )}
    </main>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: number;
}) {
  return (
    <article className="metric">
      <Icon aria-hidden="true" size={20} />
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

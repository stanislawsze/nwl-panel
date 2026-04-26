import { Building2, Plus, Send, Users, type LucideIcon } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';

import { api } from '../../lib/api';
import { formatDate, title } from '../../lib/format';
import { useAuth } from '../../modules/auth/AuthProvider';
import type { Tenant, TenantInvitation, TenantMember } from '../../types';
import { membershipRoles } from '../../types';
import { FormError } from '../FormError';

export function DashboardPage() {
  const { user, refreshUser } = useAuth();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [members, setMembers] = useState<TenantMember[]>([]);
  const [invitations, setInvitations] = useState<TenantInvitation[]>([]);
  const [error, setError] = useState<unknown>(null);

  async function load() {
    const [tenantData, memberData, invitationData] = await Promise.all([
      api.tenants(),
      api.members().catch(() => []),
      api.invitations().catch(() => []),
    ]);
    setTenants(tenantData);
    setMembers(memberData);
    setInvitations(invitationData);
  }

  useEffect(() => {
    load().catch(setError);
  }, []);

  async function createTenant(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const form = event.currentTarget;
    const data = new FormData(form);

    try {
      await api.createTenant({ name: String(data.get('name')) });
      form.reset();
      await refreshUser();
      await load();
    } catch (caught) {
      setError(caught);
    }
  }

  async function invite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const form = event.currentTarget;
    const data = new FormData(form);

    try {
      await api.createInvitation({
        email: String(data.get('email')),
        role: String(data.get('role')) as TenantInvitation['role'],
        expires_in_hours: Number(data.get('expires_in_hours') || 168),
      });
      form.reset();
      await load();
    } catch (caught) {
      setError(caught);
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
        <Metric icon={Users} label="Members" value={members.length} />
        <Metric
          icon={Send}
          label="Pending invitations"
          value={invitations.filter((item) => item.is_pending).length}
        />
      </section>

      <FormError error={error} />

      <section className="two-column">
        <form className="panel" onSubmit={createTenant}>
          <h2>Create tenant</h2>
          <label>
            Name
            <input name="name" required type="text" />
          </label>
          <button type="submit">
            <Plus aria-hidden="true" size={18} />
            Create
          </button>
        </form>

        <form className="panel" onSubmit={invite}>
          <h2>Invite member</h2>
          <label>
            Email
            <input name="email" required type="email" />
          </label>
          <div className="inline-fields">
            <label>
              Role
              <select name="role" required defaultValue="support">
                {membershipRoles
                  .filter((role) => role !== 'owner')
                  .map((role) => (
                    <option key={role} value={role}>
                      {title(role)}
                    </option>
                  ))}
              </select>
            </label>
            <label>
              Hours
              <input
                defaultValue={168}
                min={1}
                max={720}
                name="expires_in_hours"
                type="number"
              />
            </label>
          </div>
          <button type="submit">
            <Send aria-hidden="true" size={18} />
            Send invite
          </button>
        </form>
      </section>

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

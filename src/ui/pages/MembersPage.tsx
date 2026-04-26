import { ShieldCheck, Trash2, UserPlus } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';

import { api } from '../../lib/api';
import { formatDate, title } from '../../lib/format';
import type {
  MembershipRole,
  TenantInvitation,
  TenantMember,
} from '../../types';
import { membershipRoles } from '../../types';
import { FormError } from '../FormError';

export function MembersPage() {
  const [members, setMembers] = useState<TenantMember[]>([]);
  const [invitations, setInvitations] = useState<TenantInvitation[]>([]);
  const [error, setError] = useState<unknown>(null);

  async function load() {
    const [memberData, invitationData] = await Promise.all([
      api.members(),
      api.invitations(),
    ]);
    setMembers(memberData);
    setInvitations(invitationData);
  }

  useEffect(() => {
    load().catch(setError);
  }, []);

  async function addMember(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const form = event.currentTarget;
    const data = new FormData(form);

    try {
      await api.addMember({
        email: String(data.get('email')),
        role: String(data.get('role')) as MembershipRole,
      });
      form.reset();
      await load();
    } catch (caught) {
      setError(caught);
    }
  }

  async function updateRole(memberId: number, role: MembershipRole) {
    await api.updateMember(memberId, { role });
    await load();
  }

  async function remove(memberId: number) {
    await api.removeMember(memberId);
    await load();
  }

  return (
    <main className="page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Access</p>
          <h1>Members</h1>
        </div>
      </div>

      <FormError error={error} />

      <form className="panel form-row" onSubmit={addMember}>
        <label>
          Existing user email
          <input name="email" required type="email" />
        </label>
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
        <button type="submit">
          <UserPlus aria-hidden="true" size={18} />
          Add member
        </button>
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
              <select
                aria-label={`Role for ${member.name}`}
                disabled={member.is_current_user}
                value={member.membership_role ?? 'member'}
                onChange={(event) =>
                  void updateRole(
                    member.id,
                    event.target.value as MembershipRole,
                  )
                }
              >
                {membershipRoles.map((role) => (
                  <option key={role} value={role}>
                    {title(role)}
                  </option>
                ))}
              </select>
              <span>{formatDate(member.joined_at)}</span>
              <button
                aria-label={`Remove ${member.name}`}
                className="icon-button"
                disabled={member.is_current_user}
                onClick={() => void remove(member.id)}
                type="button"
              >
                <Trash2 aria-hidden="true" size={16} />
              </button>
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
              <button
                className="ghost-button compact"
                onClick={() => void api.resendInvitation(invitation.id)}
                type="button"
              >
                <ShieldCheck aria-hidden="true" size={16} />
                Resend
              </button>
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

import { describe, expect, it } from 'vitest';

import { endpoints } from './endpoints';

describe('endpoints', () => {
  it('matches the Laravel API v1 route contract', () => {
    expect(endpoints.auth.login).toBe('/login');
    expect(endpoints.auth.register).toBe('/register');
    expect(endpoints.auth.me).toBe('/me');
    expect(endpoints.auth.refresh).toBe('/refresh');
    expect(endpoints.auth.logout).toBe('/logout');

    expect(endpoints.tenants.index).toBe('/tenants');
    expect(endpoints.tenants.store).toBe('/tenants');
    expect(endpoints.tenants.switch(42)).toBe('/tenants/42/switch');

    expect(endpoints.tenants.members.index).toBe('/tenants/current/members');
    expect(endpoints.tenants.members.store).toBe('/tenants/current/members');
    expect(endpoints.tenants.members.update(9)).toBe(
      '/tenants/current/members/9',
    );
    expect(endpoints.tenants.members.destroy(9)).toBe(
      '/tenants/current/members/9',
    );

    expect(endpoints.tenants.invitations.index).toBe(
      '/tenants/current/invitations',
    );
    expect(endpoints.tenants.invitations.store).toBe(
      '/tenants/current/invitations',
    );
    expect(endpoints.tenants.invitations.show('abc')).toBe(
      '/tenants/invitations/abc',
    );
    expect(endpoints.tenants.invitations.register('abc')).toBe(
      '/tenants/invitations/abc/register',
    );
    expect(endpoints.tenants.invitations.accept('abc')).toBe(
      '/tenants/invitations/abc/accept',
    );
    expect(endpoints.tenants.invitations.resend(7)).toBe(
      '/tenants/current/invitations/7/resend',
    );
    expect(endpoints.tenants.invitations.revoke(7)).toBe(
      '/tenants/current/invitations/7',
    );
    expect(endpoints.tenants.auditLogs.index).toBe(
      '/tenants/current/audit-logs',
    );

    expect(endpoints.discord.integration).toBe('/discord/integration');
  });
});

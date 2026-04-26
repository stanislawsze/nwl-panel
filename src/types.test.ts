import { describe, expect, it } from 'vitest';

import {
  authPayloadSchema,
  discordIntegrationSchema,
  invitationPreviewSchema,
  tenantAuditLogSchema,
  tenantInvitationSchema,
  tenantMemberSchema,
  tenantSchema,
} from './types';

describe('authPayloadSchema', () => {
  it('accepts the login response current tenant shape from the API', () => {
    const payload = authPayloadSchema.parse({
      user: {
        id: 1,
        name: 'Admin',
        email: 'admin@example.com',
        current_tenant: {
          id: 1,
          name: 'Operations Workspace',
          slug: 'operations-workspace',
          owner_user_id: 1,
          membership_role: 'owner',
          permissions: ['view users'],
        },
        email_verified_at: null,
        created_at: '2026-04-26T10:00:00Z',
        updated_at: '2026-04-26T10:00:00Z',
        roles: [],
        permissions: [],
      },
      token: 'plain-text-token',
    });

    expect(payload.user.current_tenant?.is_current).toBe(true);
    expect(payload.user.current_tenant?.created_at).toBeNull();
  });
});

describe('api resource schemas', () => {
  it('accepts tenant resources', () => {
    expect(() =>
      tenantSchema.parse({
        id: 1,
        name: 'Operations Workspace',
        slug: 'operations-workspace',
        owner_user_id: 1,
        membership_role: 'owner',
        permissions: ['view users'],
        is_current: true,
        created_at: '2026-04-26T10:00:00Z',
        updated_at: '2026-04-26T10:00:00Z',
      }),
    ).not.toThrow();
  });

  it('accepts tenant member resources', () => {
    expect(() =>
      tenantMemberSchema.parse({
        id: 2,
        name: 'Support User',
        email: 'support@example.com',
        membership_role: 'support',
        permissions: ['view users'],
        is_current_user: false,
        joined_at: null,
      }),
    ).not.toThrow();
  });

  it('accepts tenant invitation resources', () => {
    expect(() =>
      tenantInvitationSchema.parse({
        id: 1,
        tenant_id: 1,
        email: 'invitee@example.com',
        role: 'support',
        permissions: ['view users'],
        token: 'token',
        is_pending: true,
        last_sent_at: null,
        send_count: 1,
        accepted_at: null,
        revoked_at: null,
        expires_at: '2026-04-30T10:00:00Z',
        created_at: '2026-04-26T10:00:00Z',
        updated_at: '2026-04-26T10:00:00Z',
      }),
    ).not.toThrow();
  });

  it('accepts tenant audit log resources', () => {
    expect(() =>
      tenantAuditLogSchema.parse({
        id: 1,
        event: 'tenant.invitation_created',
        description: 'Invitation created',
        causer: {
          id: 1,
          name: 'Admin',
          email: 'admin@example.com',
        },
        properties: {
          tenant_id: 1,
          email: 'invitee@example.com',
          role: 'support',
        },
        created_at: '2026-04-26T10:00:00Z',
      }),
    ).not.toThrow();
  });

  it('accepts terminal invitation previews with nullable action and tenant fields', () => {
    const preview = invitationPreviewSchema.parse({
      email: 'invitee@example.com',
      role: 'support',
      permissions: ['view users'],
      status: 'expired',
      is_pending: false,
      has_existing_account: false,
      recommended_action: null,
      tenant: {
        id: null,
        name: null,
        slug: null,
      },
      links: {
        accept: 'https://panel.example.com/invitations/token',
        register: 'https://panel.example.com/register?invitation=token',
        login: 'https://panel.example.com/login?invitation=token',
        api: {},
      },
      expires_at: '2026-04-01T10:00:00Z',
      accepted_at: null,
      revoked_at: null,
      created_at: '2026-03-26T10:00:00Z',
    });

    expect(preview.recommended_action).toBeNull();
  });

  it('accepts discord integration resources with array settings from Laravel casts', () => {
    const integration = discordIntegrationSchema.parse({
      id: 1,
      guild_id: '123',
      guild_name: 'NWL',
      bot_enabled: true,
      is_active: true,
      oauth: {
        client_id: null,
        redirect_uri: null,
        has_client_secret: false,
        is_configured: false,
      },
      bot: {
        has_token: false,
        is_configured: false,
      },
      status: {
        is_ready_for_oauth: false,
        is_ready_for_bot_sync: false,
        has_role_mappings: false,
      },
      settings: [],
      role_mappings: [
        {
          id: 1,
          discord_role_id: '456',
          discord_role_name: 'Staff',
          local_role_id: 2,
          local_role_name: null,
        },
      ],
      created_at: '2026-04-26T10:00:00Z',
      updated_at: '2026-04-26T10:00:00Z',
    });

    expect(integration.settings).toEqual({});
  });
});

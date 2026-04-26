import type { Page, Route } from '@playwright/test';

type InvitationStatus = 'pending' | 'accepted' | 'revoked' | 'expired';

const tenant = {
  id: 1,
  name: 'Operations Workspace',
  slug: 'operations-workspace',
  owner_user_id: 1,
  membership_role: 'owner',
  permissions: ['view users', 'create users', 'edit users'],
  is_current: true,
  created_at: '2026-04-26T10:00:00Z',
  updated_at: '2026-04-26T10:00:00Z',
};

const user = {
  id: 1,
  name: 'Admin User',
  email: 'admin@example.com',
  current_tenant: tenant,
  email_verified_at: null,
  created_at: '2026-04-26T10:00:00Z',
  updated_at: '2026-04-26T10:00:00Z',
  roles: [],
  permissions: [],
};

const members = [
  {
    id: 1,
    name: 'Admin User',
    email: 'admin@example.com',
    membership_role: 'owner',
    permissions: ['view users', 'create users', 'edit users'],
    is_current_user: true,
    joined_at: '2026-04-26T10:00:00Z',
  },
  {
    id: 2,
    name: 'Support User',
    email: 'support@example.com',
    membership_role: 'support',
    permissions: ['view users'],
    is_current_user: false,
    joined_at: '2026-04-26T11:00:00Z',
  },
];

function invitation(id: number, email: string, status: InvitationStatus) {
  return {
    id,
    tenant_id: 1,
    email,
    role: 'support',
    permissions: ['view users'],
    token: `token-${id}`,
    is_pending: status === 'pending',
    last_sent_at: '2026-04-26T12:00:00Z',
    send_count: 1,
    accepted_at: status === 'accepted' ? '2026-04-26T13:00:00Z' : null,
    revoked_at: status === 'revoked' ? '2026-04-26T13:00:00Z' : null,
    expires_at:
      status === 'expired' ? '2026-04-01T10:00:00Z' : '2026-05-01T10:00:00Z',
    created_at: '2026-04-26T12:00:00Z',
    updated_at: '2026-04-26T12:00:00Z',
  };
}

const invitations = [
  invitation(1, 'pending@example.com', 'pending'),
  invitation(2, 'accepted@example.com', 'accepted'),
  invitation(3, 'revoked@example.com', 'revoked'),
  invitation(4, 'expired@example.com', 'expired'),
];

const discordIntegration = {
  id: 1,
  guild_id: '123456',
  guild_name: 'NWL Guild',
  bot_enabled: true,
  is_active: true,
  oauth: {
    client_id: 'client-id',
    redirect_uri: 'https://panel.example.com/discord/callback',
    has_client_secret: true,
    is_configured: true,
  },
  bot: {
    has_token: true,
    is_configured: true,
  },
  status: {
    is_ready_for_oauth: true,
    is_ready_for_bot_sync: true,
    has_role_mappings: false,
  },
  settings: {},
  role_mappings: [],
  created_at: '2026-04-26T10:00:00Z',
  updated_at: '2026-04-26T10:00:00Z',
};

export async function mockApi(page: Page) {
  await page.route('**/api/v1/**', async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const path = url.pathname.replace(/^\/api\/v1/, '');
    const method = request.method();

    if (method === 'POST' && path === '/login') {
      return json(route, {
        data: {
          user,
          token: 'test-token',
        },
        meta: { token_type: 'Bearer' },
      });
    }

    if (method === 'GET' && path === '/me') {
      return json(route, { data: user, meta: {} });
    }

    if (method === 'POST' && path === '/logout') {
      return json(route, { data: null, meta: { message: 'Logged out.' } });
    }

    if (method === 'GET' && path === '/tenants') {
      return json(route, { data: [tenant], meta: {} });
    }

    if (method === 'GET' && path === '/tenants/current/members') {
      return json(route, { data: members, meta: {} });
    }

    if (method === 'GET' && path === '/tenants/current/invitations') {
      return json(route, { data: invitations, meta: {} });
    }

    if (method === 'POST' && path === '/tenants/current/invitations') {
      return json(
        route,
        {
          data: invitation(5, 'new@example.com', 'pending'),
          meta: { message: 'Tenant invitation created successfully.' },
        },
        201,
      );
    }

    if (
      method === 'POST' &&
      path.match(/^\/tenants\/current\/invitations\/\d+\/resend$/)
    ) {
      return json(route, {
        data: invitation(1, 'pending@example.com', 'pending'),
        meta: { message: 'Tenant invitation resent successfully.' },
      });
    }

    if (
      method === 'DELETE' &&
      path.match(/^\/tenants\/current\/invitations\/\d+$/)
    ) {
      return json(route, {
        data: null,
        meta: { message: 'Tenant invitation revoked successfully.' },
      });
    }

    if (method === 'GET' && path === '/discord/integration') {
      return json(route, { data: discordIntegration, meta: {} });
    }

    if (method === 'PUT' && path === '/discord/integration') {
      return json(route, { data: discordIntegration, meta: {} });
    }

    return json(
      route,
      {
        data: null,
        meta: { message: `Unhandled mock route: ${method} ${path}` },
      },
      404,
    );
  });
}

async function json(route: Route, body: unknown, status = 200) {
  await route.fulfill({
    status,
    contentType: 'application/json',
    body: JSON.stringify(body),
  });
}

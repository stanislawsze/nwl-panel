export const endpoints = {
  auth: {
    login: '/login',
    register: '/register',
    me: '/me',
    refresh: '/refresh',
    logout: '/logout',
  },
  tenants: {
    index: '/tenants',
    store: '/tenants',
    switch: (tenantId: number) => `/tenants/${tenantId}/switch`,
    members: {
      index: '/tenants/current/members',
      store: '/tenants/current/members',
      update: (userId: number) => `/tenants/current/members/${userId}`,
      destroy: (userId: number) => `/tenants/current/members/${userId}`,
    },
    invitations: {
      index: '/tenants/current/invitations',
      store: '/tenants/current/invitations',
      show: (token: string) => `/tenants/invitations/${token}`,
      register: (token: string) => `/tenants/invitations/${token}/register`,
      accept: (token: string) => `/tenants/invitations/${token}/accept`,
      resend: (invitationId: number) =>
        `/tenants/current/invitations/${invitationId}/resend`,
      revoke: (invitationId: number) =>
        `/tenants/current/invitations/${invitationId}`,
    },
    auditLogs: {
      index: '/tenants/current/audit-logs',
    },
  },
  discord: {
    integration: '/discord/integration',
  },
} as const;

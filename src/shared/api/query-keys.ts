export const queryKeys = {
  me: ['me'] as const,
  tenants: ['tenants'] as const,
  members: ['members'] as const,
  invitations: ['invitations'] as const,
  auditLogs: (event: string | null) => ['audit-logs', event] as const,
  discordIntegration: ['discord-integration'] as const,
};

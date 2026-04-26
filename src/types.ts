import { z } from 'zod';

export const membershipRoleSchema = z.enum([
  'owner',
  'admin',
  'moderator',
  'support',
  'member',
]);

export const membershipRoles = membershipRoleSchema.options;

const apiIdSchema = z.number();
const apiDateSchema = z.string().nullable();
const apiSettingsSchema = z
  .union([z.record(z.string(), z.unknown()), z.array(z.unknown())])
  .transform((settings) => (Array.isArray(settings) ? {} : settings));

export const tenantSchema = z.object({
  id: apiIdSchema,
  name: z.string(),
  slug: z.string(),
  owner_user_id: apiIdSchema,
  membership_role: membershipRoleSchema.nullable(),
  permissions: z.array(z.string()),
  is_current: z.boolean(),
  created_at: apiDateSchema,
  updated_at: apiDateSchema,
});

export const authCurrentTenantSchema = tenantSchema
  .pick({
    id: true,
    name: true,
    slug: true,
    owner_user_id: true,
    membership_role: true,
    permissions: true,
  })
  .extend({
    is_current: z.boolean().default(true),
    created_at: z.string().nullable().default(null),
    updated_at: z.string().nullable().default(null),
  });

export const userSchema = z.object({
  id: apiIdSchema,
  name: z.string(),
  email: z.string(),
  current_tenant: authCurrentTenantSchema.nullable(),
  email_verified_at: apiDateSchema,
  created_at: apiDateSchema,
  updated_at: apiDateSchema,
  roles: z.array(z.string()).default([]),
  permissions: z.array(z.string()).default([]),
});

export const authPayloadSchema = z.object({
  user: userSchema,
  token: z.string(),
});

export const tenantMemberSchema = z.object({
  id: apiIdSchema,
  name: z.string(),
  email: z.string(),
  membership_role: membershipRoleSchema.nullable(),
  permissions: z.array(z.string()),
  is_current_user: z.boolean(),
  joined_at: apiDateSchema,
});

export const tenantInvitationSchema = z.object({
  id: apiIdSchema,
  tenant_id: apiIdSchema,
  email: z.string(),
  role: membershipRoleSchema,
  permissions: z.array(z.string()),
  token: z.string(),
  is_pending: z.boolean(),
  last_sent_at: apiDateSchema,
  send_count: z.number(),
  accepted_at: apiDateSchema,
  revoked_at: apiDateSchema,
  expires_at: apiDateSchema,
  created_at: apiDateSchema,
  updated_at: apiDateSchema,
});

export const invitationPreviewTenantSchema = z.object({
  id: apiIdSchema.nullable(),
  name: z.string().nullable(),
  slug: z.string().nullable(),
});

export const invitationPreviewSchema = z.object({
  email: z.string(),
  role: membershipRoleSchema,
  permissions: z.array(z.string()),
  status: z.enum(['pending', 'accepted', 'revoked', 'expired']),
  is_pending: z.boolean(),
  has_existing_account: z.boolean(),
  recommended_action: z.enum(['register', 'login']).nullable(),
  tenant: invitationPreviewTenantSchema,
  links: z.record(z.string(), z.unknown()),
  expires_at: apiDateSchema,
  accepted_at: apiDateSchema,
  revoked_at: apiDateSchema,
  created_at: apiDateSchema,
});

export const discordRoleMappingSchema = z.object({
  id: apiIdSchema,
  discord_role_id: z.string(),
  discord_role_name: z.string(),
  local_role_id: apiIdSchema,
  local_role_name: z.string().nullable(),
});

export const discordIntegrationSchema = z.object({
  id: apiIdSchema,
  guild_id: z.string().nullable(),
  guild_name: z.string().nullable(),
  bot_enabled: z.boolean(),
  is_active: z.boolean(),
  oauth: z.object({
    client_id: z.string().nullable(),
    redirect_uri: z.string().nullable(),
    has_client_secret: z.boolean(),
    is_configured: z.boolean(),
  }),
  bot: z.object({
    has_token: z.boolean(),
    is_configured: z.boolean(),
  }),
  status: z.object({
    is_ready_for_oauth: z.boolean(),
    is_ready_for_bot_sync: z.boolean(),
    has_role_mappings: z.boolean(),
  }),
  settings: apiSettingsSchema.default({}),
  role_mappings: z.array(discordRoleMappingSchema).default([]),
  created_at: apiDateSchema,
  updated_at: apiDateSchema,
});

export const discordIntegrationPayloadSchema =
  discordIntegrationSchema.nullable();

export type ApiEnvelope<T> = {
  data: T;
  meta: Record<string, unknown>;
  errors?: unknown;
};

export type MembershipRole = z.infer<typeof membershipRoleSchema>;
export type Tenant = z.infer<typeof tenantSchema>;
export type User = z.infer<typeof userSchema>;
export type AuthPayload = z.infer<typeof authPayloadSchema>;
export type TenantMember = z.infer<typeof tenantMemberSchema>;
export type TenantInvitation = z.infer<typeof tenantInvitationSchema>;
export type InvitationPreview = z.infer<typeof invitationPreviewSchema>;
export type DiscordIntegration = z.infer<typeof discordIntegrationSchema>;
export type DiscordIntegrationPayload = z.infer<
  typeof discordIntegrationPayloadSchema
>;

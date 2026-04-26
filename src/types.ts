export type ApiEnvelope<T> = {
  data: T;
  meta: Record<string, unknown>;
  errors?: unknown;
};

export type Tenant = {
  id: number;
  name: string;
  slug: string;
  owner_user_id: number;
  membership_role: MembershipRole | null;
  permissions: string[];
  is_current: boolean;
  created_at: string | null;
  updated_at: string | null;
};

export type MembershipRole =
  | 'owner'
  | 'admin'
  | 'moderator'
  | 'support'
  | 'member';

export type User = {
  id: number;
  name: string;
  email: string;
  current_tenant: Tenant | null;
  email_verified_at: string | null;
  created_at: string | null;
  updated_at: string | null;
  roles: string[];
  permissions: string[];
};

export type AuthPayload = {
  user: User;
  token: string;
};

export type TenantMember = {
  id: number;
  name: string;
  email: string;
  membership_role: MembershipRole | null;
  permissions: string[];
  is_current_user: boolean;
  joined_at: string | null;
};

export type TenantInvitation = {
  id: number;
  tenant_id: number;
  email: string;
  role: MembershipRole;
  permissions: string[];
  token: string;
  is_pending: boolean;
  last_sent_at: string | null;
  send_count: number;
  accepted_at: string | null;
  revoked_at: string | null;
  expires_at: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export type InvitationPreview = {
  email: string;
  role: MembershipRole;
  permissions: string[];
  status: 'pending' | 'accepted' | 'revoked' | 'expired';
  is_pending: boolean;
  has_existing_account: boolean;
  recommended_action: 'register' | 'login';
  tenant: Pick<Tenant, 'id' | 'name' | 'slug'>;
  links: Record<string, unknown>;
  expires_at: string | null;
  accepted_at: string | null;
  revoked_at: string | null;
  created_at: string | null;
};

export type DiscordIntegration = {
  id: number;
  guild_id: string | null;
  guild_name: string | null;
  bot_enabled: boolean;
  is_active: boolean;
  oauth: {
    client_id: string | null;
    redirect_uri: string | null;
    has_client_secret: boolean;
    is_configured: boolean;
  };
  bot: {
    has_token: boolean;
    is_configured: boolean;
  };
  status: {
    is_ready_for_oauth: boolean;
    is_ready_for_bot_sync: boolean;
    has_role_mappings: boolean;
  };
  settings: Record<string, unknown>;
  role_mappings: unknown[];
  created_at: string | null;
  updated_at: string | null;
};

export type DiscordIntegrationPayload = DiscordIntegration | null;

export const membershipRoles: MembershipRole[] = [
  'owner',
  'admin',
  'moderator',
  'support',
  'member',
];

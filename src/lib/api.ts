import { config } from '../config';
import type {
  ApiEnvelope,
  AuthPayload,
  DiscordIntegration,
  DiscordIntegrationPayload,
  InvitationPreview,
  MembershipRole,
  Tenant,
  TenantInvitation,
  TenantMember,
  User,
} from '../types';

const tokenKey = 'nwl-panel.auth-token';

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly details: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const authToken = {
  get: () => window.localStorage.getItem(tokenKey),
  set: (token: string) => window.localStorage.setItem(tokenKey, token),
  clear: () => window.localStorage.removeItem(tokenKey),
};

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set('Accept', 'application/json');

  if (!(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const token = authToken.get();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${config.apiBaseUrl}${path}`, {
    ...options,
    headers,
  });

  const payload = (await response
    .json()
    .catch(() => null)) as ApiEnvelope<T> | null;

  if (!response.ok) {
    const message =
      typeof payload?.meta?.message === 'string'
        ? payload.meta.message
        : response.status === 422
          ? 'Please check the submitted values.'
          : 'The API request failed.';

    throw new ApiError(message, response.status, payload);
  }

  return payload?.data as T;
}

const body = (payload: unknown) => JSON.stringify(payload);

export const api = {
  login: (payload: { email: string; password: string }) =>
    request<AuthPayload>('/login', { method: 'POST', body: body(payload) }),
  register: (payload: { name: string; email: string; password: string }) =>
    request<AuthPayload>('/register', { method: 'POST', body: body(payload) }),
  me: () => request<User>('/me'),
  logout: () => request<null>('/logout', { method: 'POST' }),
  tenants: () => request<Tenant[]>('/tenants'),
  createTenant: (payload: { name: string }) =>
    request<Tenant>('/tenants', { method: 'POST', body: body(payload) }),
  switchTenant: (tenantId: number) =>
    request<Tenant>(`/tenants/${tenantId}/switch`, { method: 'POST' }),
  members: () => request<TenantMember[]>('/tenants/current/members'),
  addMember: (payload: { email: string; role: MembershipRole }) =>
    request<TenantMember>('/tenants/current/members', {
      method: 'POST',
      body: body(payload),
    }),
  updateMember: (userId: number, payload: { role: MembershipRole }) =>
    request<TenantMember>(`/tenants/current/members/${userId}`, {
      method: 'PATCH',
      body: body(payload),
    }),
  removeMember: (userId: number) =>
    request<null>(`/tenants/current/members/${userId}`, { method: 'DELETE' }),
  invitations: () =>
    request<TenantInvitation[]>('/tenants/current/invitations'),
  createInvitation: (payload: {
    email: string;
    role: MembershipRole;
    expires_in_hours?: number;
  }) =>
    request<TenantInvitation>('/tenants/current/invitations', {
      method: 'POST',
      body: body(payload),
    }),
  resendInvitation: (invitationId: number) =>
    request<TenantInvitation>(
      `/tenants/current/invitations/${invitationId}/resend`,
      { method: 'POST' },
    ),
  revokeInvitation: (invitationId: number) =>
    request<null>(`/tenants/current/invitations/${invitationId}`, {
      method: 'DELETE',
    }),
  previewInvitation: (token: string) =>
    request<InvitationPreview>(`/tenants/invitations/${token}`),
  registerInvitation: (
    token: string,
    payload: { name: string; password: string },
  ) =>
    request<AuthPayload>(`/tenants/invitations/${token}/register`, {
      method: 'POST',
      body: body(payload),
    }),
  acceptInvitation: (token: string) =>
    request<TenantInvitation>(`/tenants/invitations/${token}/accept`, {
      method: 'POST',
    }),
  discordIntegration: () =>
    request<DiscordIntegrationPayload>('/discord/integration'),
  saveDiscordIntegration: (payload: Record<string, unknown>) =>
    request<DiscordIntegration>('/discord/integration', {
      method: 'PUT',
      body: body(payload),
    }),
};

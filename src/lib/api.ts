import axios, { AxiosError } from 'axios';
import { z } from 'zod';

import { config } from '../config';
import {
  authPayloadSchema,
  discordIntegrationPayloadSchema,
  discordIntegrationSchema,
  invitationPreviewSchema,
  tenantInvitationSchema,
  tenantMemberSchema,
  tenantSchema,
  userSchema,
  type ApiEnvelope,
  type MembershipRole,
} from '../types';

const tokenKey = 'nwl-panel.auth-token';
export const authExpiredEvent = 'nwl-panel:auth-expired';

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

const http = axios.create({
  baseURL: config.apiBaseUrl,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

http.interceptors.request.use((request) => {
  const token = authToken.get();

  if (token) {
    request.headers.Authorization = `Bearer ${token}`;
  }

  return request;
});

function normalizeError(error: unknown): never {
  if (error instanceof AxiosError) {
    const payload = error.response?.data as ApiEnvelope<unknown> | undefined;
    const status = error.response?.status ?? 0;

    if (status === 401) {
      authToken.clear();
      window.dispatchEvent(new Event(authExpiredEvent));
    }

    const message =
      typeof payload?.meta?.message === 'string'
        ? payload.meta.message
        : status === 401
          ? 'Your session expired. Please sign in again.'
          : status === 422
            ? 'Please check the submitted values.'
            : 'The API request failed.';

    throw new ApiError(message, status, payload ?? error);
  }

  throw error;
}

function normalizeParseError(error: unknown): never {
  if (error instanceof z.ZodError) {
    throw new ApiError(
      'The API response did not match the expected frontend contract.',
      0,
      error.issues,
    );
  }

  normalizeError(error);
}

async function request<TSchema extends z.ZodType>(
  schema: TSchema,
  path: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    data?: unknown;
  } = {},
): Promise<z.infer<TSchema>> {
  try {
    const response = await http.request<ApiEnvelope<unknown>>({
      url: path,
      method: options.method ?? 'GET',
      data: options.data,
    });

    return schema.parse(response.data.data);
  } catch (error) {
    normalizeParseError(error);
  }
}

export const api = {
  login: (payload: { email: string; password: string }) =>
    request(authPayloadSchema, '/login', { method: 'POST', data: payload }),
  register: (payload: { name: string; email: string; password: string }) =>
    request(authPayloadSchema, '/register', { method: 'POST', data: payload }),
  me: () => request(userSchema, '/me'),
  refresh: () =>
    request(z.object({ token: z.string() }), '/refresh', { method: 'POST' }),
  logout: () => request(z.null(), '/logout', { method: 'POST' }),
  tenants: () => request(z.array(tenantSchema), '/tenants'),
  createTenant: (payload: { name: string }) =>
    request(tenantSchema, '/tenants', { method: 'POST', data: payload }),
  switchTenant: (tenantId: number) =>
    request(tenantSchema, `/tenants/${tenantId}/switch`, { method: 'POST' }),
  members: () =>
    request(z.array(tenantMemberSchema), '/tenants/current/members'),
  addMember: (payload: { email: string; role: MembershipRole }) =>
    request(tenantMemberSchema, '/tenants/current/members', {
      method: 'POST',
      data: payload,
    }),
  updateMember: (userId: number, payload: { role: MembershipRole }) =>
    request(tenantMemberSchema, `/tenants/current/members/${userId}`, {
      method: 'PATCH',
      data: payload,
    }),
  removeMember: (userId: number) =>
    request(z.null(), `/tenants/current/members/${userId}`, {
      method: 'DELETE',
    }),
  invitations: () =>
    request(z.array(tenantInvitationSchema), '/tenants/current/invitations'),
  createInvitation: (payload: {
    email: string;
    role: MembershipRole;
    expires_in_hours?: number;
  }) =>
    request(tenantInvitationSchema, '/tenants/current/invitations', {
      method: 'POST',
      data: payload,
    }),
  resendInvitation: (invitationId: number) =>
    request(
      tenantInvitationSchema,
      `/tenants/current/invitations/${invitationId}/resend`,
      {
        method: 'POST',
      },
    ),
  revokeInvitation: (invitationId: number) =>
    request(z.null(), `/tenants/current/invitations/${invitationId}`, {
      method: 'DELETE',
    }),
  previewInvitation: (token: string) =>
    request(invitationPreviewSchema, `/tenants/invitations/${token}`),
  registerInvitation: (
    token: string,
    payload: { name: string; password: string },
  ) =>
    request(authPayloadSchema, `/tenants/invitations/${token}/register`, {
      method: 'POST',
      data: payload,
    }),
  acceptInvitation: (token: string) =>
    request(tenantInvitationSchema, `/tenants/invitations/${token}/accept`, {
      method: 'POST',
    }),
  discordIntegration: () =>
    request(discordIntegrationPayloadSchema, '/discord/integration'),
  saveDiscordIntegration: (payload: Record<string, unknown>) =>
    request(discordIntegrationSchema, '/discord/integration', {
      method: 'PUT',
      data: payload,
    }),
};

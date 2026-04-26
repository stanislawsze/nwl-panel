import axios, { AxiosError } from 'axios';
import { z } from 'zod';

import { config } from '../config';
import { endpoints } from '../shared/api/endpoints';
import {
  authPayloadSchema,
  discordIntegrationPayloadSchema,
  discordIntegrationSchema,
  invitationPreviewSchema,
  tenantInvitationSchema,
  tenantAuditLogSchema,
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
    readonly validationErrors: Record<string, string[]> | null = null,
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
    const payload = error.response?.data as
      | (ApiEnvelope<unknown> & {
          message?: string;
          errors?: Record<string, string[]>;
        })
      | undefined;
    const status = error.response?.status ?? 0;

    if (status === 401) {
      authToken.clear();
      window.dispatchEvent(new Event(authExpiredEvent));
    }

    const message =
      typeof payload?.meta?.message === 'string'
        ? payload.meta.message
        : typeof payload?.message === 'string'
          ? payload.message
          : status === 401
            ? 'Your session expired. Please sign in again.'
            : status === 422
              ? 'Please check the submitted values.'
              : 'The API request failed.';

    throw new ApiError(
      message,
      status,
      payload ?? error,
      payload?.errors ?? null,
    );
  }

  throw error;
}

function normalizeParseError(error: unknown, path: string): never {
  if (error instanceof z.ZodError) {
    throw new ApiError(
      `The API response for ${path} did not match the expected frontend contract.`,
      0,
      {
        endpoint: path,
        issues: error.issues,
      },
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
    params?: Record<string, string | number | undefined>;
  } = {},
): Promise<z.infer<TSchema>> {
  try {
    const response = await http.request<ApiEnvelope<unknown>>({
      url: path,
      method: options.method ?? 'GET',
      data: options.data,
      params: options.params,
    });

    return schema.parse(response.data.data);
  } catch (error) {
    normalizeParseError(error, path);
  }
}

export const api = {
  login: (payload: { email: string; password: string }) =>
    request(authPayloadSchema, endpoints.auth.login, {
      method: 'POST',
      data: payload,
    }),
  register: (payload: { name: string; email: string; password: string }) =>
    request(authPayloadSchema, endpoints.auth.register, {
      method: 'POST',
      data: payload,
    }),
  me: () => request(userSchema, endpoints.auth.me),
  refresh: () =>
    request(z.object({ token: z.string() }), endpoints.auth.refresh, {
      method: 'POST',
    }),
  logout: () => request(z.null(), endpoints.auth.logout, { method: 'POST' }),
  tenants: () => request(z.array(tenantSchema), endpoints.tenants.index),
  createTenant: (payload: { name: string }) =>
    request(tenantSchema, endpoints.tenants.store, {
      method: 'POST',
      data: payload,
    }),
  switchTenant: (tenantId: number) =>
    request(tenantSchema, endpoints.tenants.switch(tenantId), {
      method: 'POST',
    }),
  members: () =>
    request(z.array(tenantMemberSchema), endpoints.tenants.members.index),
  addMember: (payload: { email: string; role: MembershipRole }) =>
    request(tenantMemberSchema, endpoints.tenants.members.store, {
      method: 'POST',
      data: payload,
    }),
  updateMember: (userId: number, payload: { role: MembershipRole }) =>
    request(tenantMemberSchema, endpoints.tenants.members.update(userId), {
      method: 'PATCH',
      data: payload,
    }),
  removeMember: (userId: number) =>
    request(z.null(), endpoints.tenants.members.destroy(userId), {
      method: 'DELETE',
    }),
  invitations: () =>
    request(
      z.array(tenantInvitationSchema),
      endpoints.tenants.invitations.index,
    ),
  createInvitation: (payload: {
    email: string;
    role: MembershipRole;
    expires_in_hours?: number;
  }) =>
    request(tenantInvitationSchema, endpoints.tenants.invitations.store, {
      method: 'POST',
      data: payload,
    }),
  resendInvitation: (invitationId: number) =>
    request(
      tenantInvitationSchema,
      endpoints.tenants.invitations.resend(invitationId),
      {
        method: 'POST',
      },
    ),
  revokeInvitation: (invitationId: number) =>
    request(z.null(), endpoints.tenants.invitations.revoke(invitationId), {
      method: 'DELETE',
    }),
  auditLogs: (params: { event?: string; limit?: number } = {}) =>
    request(z.array(tenantAuditLogSchema), endpoints.tenants.auditLogs.index, {
      params,
    }),
  previewInvitation: (token: string) =>
    request(invitationPreviewSchema, endpoints.tenants.invitations.show(token)),
  registerInvitation: (
    token: string,
    payload: { name: string; password: string },
  ) =>
    request(authPayloadSchema, endpoints.tenants.invitations.register(token), {
      method: 'POST',
      data: payload,
    }),
  acceptInvitation: (token: string) =>
    request(
      tenantInvitationSchema,
      endpoints.tenants.invitations.accept(token),
      {
        method: 'POST',
      },
    ),
  discordIntegration: () =>
    request(discordIntegrationPayloadSchema, endpoints.discord.integration),
  saveDiscordIntegration: (payload: Record<string, unknown>) =>
    request(discordIntegrationSchema, endpoints.discord.integration, {
      method: 'PUT',
      data: payload,
    }),
};

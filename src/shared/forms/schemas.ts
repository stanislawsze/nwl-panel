import { z } from 'zod';

import { membershipRoleSchema } from '../../types';

export const loginFormSchema = z.object({
  email: z.string().email('Enter a valid email address.'),
  password: z.string().min(8, 'Password must be at least 8 characters.'),
});

export const registerFormSchema = loginFormSchema.extend({
  name: z.string().min(1, 'Name is required.').max(255, 'Name is too long.'),
});

export const invitationRegistrationFormSchema = z.object({
  name: z.string().min(1, 'Name is required.').max(255, 'Name is too long.'),
  password: z.string().min(8, 'Password must be at least 8 characters.'),
});

export const tenantFormSchema = z.object({
  name: z
    .string()
    .min(1, 'Tenant name is required.')
    .max(255, 'Tenant name is too long.'),
});

export const invitationFormSchema = z.object({
  email: z.string().email('Enter a valid email address.'),
  role: membershipRoleSchema.exclude(['owner']),
  expires_in_hours: z
    .number()
    .int('Expiration must be a whole number.')
    .min(1, 'Expiration must be at least 1 hour.')
    .max(720, 'Expiration cannot exceed 720 hours.'),
});

export const memberFormSchema = z.object({
  email: z.string().email('Enter a valid email address.'),
  role: membershipRoleSchema.exclude(['owner']),
});

export const discordIntegrationFormSchema = z.object({
  guild_id: z
    .string()
    .min(1, 'Guild ID is required.')
    .max(255, 'Guild ID is too long.'),
  guild_name: z
    .string()
    .min(1, 'Guild name is required.')
    .max(255, 'Guild name is too long.'),
  oauth_client_id: z
    .string()
    .max(255, 'OAuth client ID is too long.')
    .optional(),
  oauth_client_secret: z.string().optional(),
  oauth_redirect_uri: z
    .union([z.string().url('Enter a valid redirect URL.'), z.literal('')])
    .optional(),
  bot_token: z.string().optional(),
  bot_enabled: z.boolean(),
  is_active: z.boolean(),
});

export type LoginFormValues = z.infer<typeof loginFormSchema>;
export type RegisterFormValues = z.infer<typeof registerFormSchema>;
export type InvitationRegistrationFormValues = z.infer<
  typeof invitationRegistrationFormSchema
>;
export type TenantFormValues = z.infer<typeof tenantFormSchema>;
export type InvitationFormValues = z.infer<typeof invitationFormSchema>;
export type MemberFormValues = z.infer<typeof memberFormSchema>;
export type DiscordIntegrationFormValues = z.infer<
  typeof discordIntegrationFormSchema
>;

import { useAuth } from '../../modules/auth/AuthProvider';

export const tenantPermissions = {
  viewUsers: 'view users',
  createUsers: 'create users',
  editUsers: 'edit users',
  deleteUsers: 'delete users',
  viewAuditLogs: 'view audit logs',
} as const;

export type TenantPermission =
  (typeof tenantPermissions)[keyof typeof tenantPermissions];

export function useTenantPermissions() {
  const { user } = useAuth();
  const permissions = user?.current_tenant?.permissions ?? [];

  function can(permission: TenantPermission) {
    return permissions.includes(permission);
  }

  return {
    permissions,
    can,
    canViewUsers: can(tenantPermissions.viewUsers),
    canCreateUsers: can(tenantPermissions.createUsers),
    canEditUsers: can(tenantPermissions.editUsers),
    canDeleteUsers: can(tenantPermissions.deleteUsers),
    canViewAuditLogs: can(tenantPermissions.viewAuditLogs),
  };
}

import { RefreshCcw } from 'lucide-react';

import { useSwitchTenant, useTenants } from '../features/tenants/use-tenants';
import { useAuth } from '../modules/auth/AuthProvider';

export function TenantSwitcher() {
  const { user, refreshUser } = useAuth();
  const tenantsQuery = useTenants();
  const switchTenantMutation = useSwitchTenant();
  const tenants = tenantsQuery.data ?? [];

  async function switchTenant(tenantId: number) {
    await switchTenantMutation.mutateAsync(tenantId);
    await refreshUser();
  }

  return (
    <label className="tenant-switcher">
      <RefreshCcw aria-hidden="true" size={16} />
      <select
        aria-label="Current tenant"
        disabled={switchTenantMutation.isPending || tenants.length === 0}
        value={user?.current_tenant?.id ?? ''}
        onChange={(event) => void switchTenant(Number(event.target.value))}
      >
        {tenants.map((tenant) => (
          <option key={tenant.id} value={tenant.id}>
            {tenant.name}
          </option>
        ))}
      </select>
    </label>
  );
}

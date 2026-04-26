import { RefreshCcw } from 'lucide-react';
import { useEffect, useState } from 'react';

import { api } from '../lib/api';
import { useAuth } from '../modules/auth/AuthProvider';
import type { Tenant } from '../types';

export function TenantSwitcher() {
  const { user, refreshUser } = useAuth();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    api
      .tenants()
      .then(setTenants)
      .catch(() => setTenants([]));
  }, [user?.current_tenant?.id]);

  async function switchTenant(tenantId: number) {
    setIsLoading(true);
    await api.switchTenant(tenantId);
    await refreshUser();
    setIsLoading(false);
  }

  return (
    <label className="tenant-switcher">
      <RefreshCcw aria-hidden="true" size={16} />
      <select
        aria-label="Current tenant"
        disabled={isLoading || tenants.length === 0}
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

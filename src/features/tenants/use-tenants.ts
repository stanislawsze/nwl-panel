import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { api } from '../../lib/api';
import { queryKeys } from '../../shared/api/query-keys';

export function useTenants() {
  return useQuery({
    queryKey: queryKeys.tenants,
    queryFn: api.tenants,
  });
}

export function useCreateTenant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.createTenant,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.tenants }),
        queryClient.invalidateQueries({ queryKey: queryKeys.me }),
      ]);
    },
  });
}

export function useSwitchTenant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.switchTenant,
    onSuccess: async () => {
      await queryClient.invalidateQueries();
    },
  });
}

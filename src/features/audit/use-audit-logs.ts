import { useQuery } from '@tanstack/react-query';

import { api } from '../../lib/api';
import { queryKeys } from '../../shared/api/query-keys';

export function useAuditLogs(event: string | null, enabled = true) {
  return useQuery({
    queryKey: queryKeys.auditLogs(event),
    queryFn: () =>
      api.auditLogs({
        event: event ?? undefined,
        limit: 50,
      }),
    enabled,
  });
}

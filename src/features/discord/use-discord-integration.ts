import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { api } from '../../lib/api';
import { queryKeys } from '../../shared/api/query-keys';

export function useDiscordIntegration() {
  return useQuery({
    queryKey: queryKeys.discordIntegration,
    queryFn: api.discordIntegration,
  });
}

export function useSaveDiscordIntegration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.saveDiscordIntegration,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.discordIntegration,
      });
    },
  });
}

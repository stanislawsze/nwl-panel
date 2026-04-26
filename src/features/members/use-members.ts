import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { api } from '../../lib/api';
import { queryKeys } from '../../shared/api/query-keys';
import type { MembershipRole } from '../../types';

export function useMembers(enabled = true) {
  return useQuery({
    queryKey: queryKeys.members,
    queryFn: api.members,
    enabled,
  });
}

export function useAddMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.addMember,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.members });
    },
  });
}

export function useUpdateMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, role }: { userId: number; role: MembershipRole }) =>
      api.updateMember(userId, { role }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.members });
    },
  });
}

export function useRemoveMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.removeMember,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.members });
    },
  });
}

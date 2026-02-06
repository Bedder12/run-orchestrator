import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { runsApi, subscribeToRunEvents } from '@/lib/api-client';
import { Run } from '@/types/run';

// Query keys
export const runKeys = {
  all: ['runs'] as const,
  list: () => [...runKeys.all, 'list'] as const,
  detail: (id: string) => [...runKeys.all, 'detail', id] as const,
};

// Fetch all runs
export function useRuns() {
  return useQuery({
    queryKey: runKeys.list(),
    queryFn: runsApi.list,
    staleTime: 30 * 1000, // 30 seconds
  });
}

// Fetch single run
export function useRun(id: string) {
  return useQuery({
    queryKey: runKeys.detail(id),
    queryFn: () => runsApi.getById(id),
    enabled: !!id,
  });
}

// Subscribe to real-time updates for a run
export function useRunSubscription(id: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!id) return;

    const unsubscribe = subscribeToRunEvents(
      id,
      (update) => {
        // Merge updates into the cached run
        queryClient.setQueryData<Run>(runKeys.detail(id), (old) => {
          if (!old) return old;
          return { ...old, ...update };
        });

        // Also invalidate the list to reflect status changes
        queryClient.invalidateQueries({ queryKey: runKeys.list() });
      },
      (error) => {
        console.error('Run subscription error:', error);
      }
    );

    return unsubscribe;
  }, [id, queryClient]);
}

// Create a new run
export function useCreateRun() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: string) => runsApi.create({ request }),
    onSuccess: (newRun) => {
      // Add to cache and invalidate list
      queryClient.setQueryData(runKeys.detail(newRun.id), newRun);
      queryClient.invalidateQueries({ queryKey: runKeys.list() });
    },
  });
}

// Approve a run
export function useApproveRun() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: runsApi.approve,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: runKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: runKeys.list() });
    },
  });
}

// Reject a run
export function useRejectRun() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: runsApi.reject,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: runKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: runKeys.list() });
    },
  });
}

// Deploy a run
export function useDeployRun() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: runsApi.deploy,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: runKeys.detail(id) });
    },
  });
}

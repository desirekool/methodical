'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useActivity(taskId?: string) {
  const queryClient = useQueryClient();

  const createActivity = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const res = await fetch('/api/activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create activity');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['init'] });
    },
  });

  return { createActivity };
}

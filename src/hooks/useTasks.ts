'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function useTasks(projectId?: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['tasks', projectId],
    queryFn: async () => {
      const params = projectId ? `?projectId=${projectId}` : '';
      const res = await fetch(`/api/tasks${params}`);
      if (!res.ok) throw new Error('Failed to fetch tasks');
      return res.json();
    },
    enabled: !!projectId,
  });

  const createTask = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create task');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
      queryClient.invalidateQueries({ queryKey: ['init'] });
    },
  });

  const updateTask = useMutation({
    mutationFn: async ({ id, ...data }: { id: string } & Record<string, unknown>) => {
      const res = await fetch(`/api/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update task');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
      queryClient.invalidateQueries({ queryKey: ['init'] });
    },
  });

  const deleteTask = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete task');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
      queryClient.invalidateQueries({ queryKey: ['init'] });
    },
  });

  return { ...query, createTask, updateTask, deleteTask };
}

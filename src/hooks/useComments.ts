'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function useComments(taskId?: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['comments', taskId],
    queryFn: async () => {
      const res = await fetch(`/api/comments?taskId=${taskId}`);
      if (!res.ok) throw new Error('Failed to fetch comments');
      return res.json();
    },
    enabled: !!taskId,
  });

  const createComment = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create comment');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', taskId] });
      queryClient.invalidateQueries({ queryKey: ['init'] });
    },
  });

  const updateComment = useMutation({
    mutationFn: async ({ id, text }: { id: string; text: string }) => {
      const res = await fetch(`/api/comments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) throw new Error('Failed to update comment');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', taskId] });
      queryClient.invalidateQueries({ queryKey: ['init'] });
    },
  });

  const deleteComment = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/comments/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete comment');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', taskId] });
      queryClient.invalidateQueries({ queryKey: ['init'] });
    },
  });

  return { ...query, createComment, updateComment, deleteComment };
}

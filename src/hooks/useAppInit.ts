'use client';

import { useQuery } from '@tanstack/react-query';

interface InitData {
  projects: Array<Record<string, unknown>>;
  columns: Array<Record<string, unknown>>;
  members: Array<Record<string, unknown>>;
  teams: Array<Record<string, unknown>>;
  sprints: Array<Record<string, unknown>>;
  tasks: Array<Record<string, unknown>>;
  checklistItems: Array<Record<string, unknown>>;
  attachments: Array<Record<string, unknown>>;
  comments: Array<Record<string, unknown>>;
  activities: Array<Record<string, unknown>>;
  teamMembers: Array<Record<string, unknown>>;
}

async function fetchInit(): Promise<InitData> {
  const res = await fetch('/api/init');
  if (!res.ok) throw new Error('Failed to fetch init data');
  return res.json();
}

export function useAppInit() {
  return useQuery({
    queryKey: ['init'],
    queryFn: fetchInit,
  });
}

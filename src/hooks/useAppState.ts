'use client';

import { useState, useMemo, useCallback } from 'react';
import type { Task, Project, Sprint, FilterState, Team, Member, Column, ChecklistItem, Attachment, Comment, Activity } from '../types';
import { useQueryClient } from '@tanstack/react-query';
import { useAppInit } from './useAppInit';
import { apiFetch } from '@/utils/apiFetch';
import { useToast } from './useToast';

function parseLabels(task: Record<string, unknown>): string[] {
  try {
    const l = task.labels;
    if (Array.isArray(l)) return l as string[];
    if (typeof l === 'string') return JSON.parse(l);
    return [];
  } catch { return []; }
}

function parseJson<T>(val: unknown, fallback: T): T {
  if (typeof val === 'string') try { return JSON.parse(val); } catch { return fallback; }
  return (val ?? fallback) as T;
}

function toFullTask(
  t: Record<string, unknown>,
  checklistItems: Record<string, unknown>[],
  attachments: Record<string, unknown>[],
  comments: Record<string, unknown>[],
  activities: Record<string, unknown>[],
  members: Record<string, unknown>[],
): Task {
  const cMembers = members as unknown as Member[];
  return {
    id: t.id as string,
    title: t.title as string,
    description: t.description as string,
    status: t.status as string,
    projectId: t.projectId as string,
    sprintId: t.sprintId as string | undefined,
    points: t.points as number | undefined,
    category: t.category as string,
    labels: parseLabels(t),
    creator: cMembers.find(m => m.id === t.creatorId) || cMembers[0],
    assignee: t.assigneeId ? cMembers.find(m => m.id === t.assigneeId) : undefined,
    dueDate: t.dueDate as string,
    order: t.order as number || 0,
    checklist: checklistItems
      .filter(ci => ci.taskId === t.id)
      .map(ci => ({ id: ci.id as string, text: ci.text as string, completed: ci.completed as boolean })),
    attachments: attachments
      .filter(a => a.taskId === t.id)
      .map(a => ({ id: a.id as string, name: a.name as string, type: a.type as 'pdf' | 'image', url: a.url as string, addedAt: a.addedAt as string })),
    comments: comments
      .filter(c => c.taskId === t.id)
      .map(c => ({
        id: c.id as string,
        author: cMembers.find(m => m.id === c.authorId) || cMembers[0],
        text: c.text as string,
        createdAt: c.createdAt as string,
      })),
    activities: activities
      .filter(a => a.taskId === t.id)
      .map(a => ({
        id: a.id as string,
        user: cMembers.find(m => m.id === a.userId) || cMembers[0],
        action: a.action as string,
        target: a.target as string | undefined,
        timestamp: a.timestamp as string,
      })),
  };
}

export function useAppState() {
  const queryClient = useQueryClient();
  const { addToast } = useToast();
  const { data: initData, isLoading, error } = useAppInit();

  const dummyMembers = useMemo(() => initData?.members as unknown as Member[] || [], [initData]);
  const dummyTasks = useMemo(() => {
    if (!initData) return [];
    return initData.tasks.map((t: Record<string, unknown>) =>
      toFullTask(t, initData.checklistItems, initData.attachments, initData.comments, initData.activities, initData.members)
    );
  }, [initData]);

  const sprints = useMemo(() => (initData?.sprints || []) as unknown as Sprint[], [initData]);
  const members = useMemo(() => (initData?.members || []) as unknown as Member[], [initData]);

  const teams = useMemo(() => {
    const rawTeams = (initData?.teams || []) as Array<Record<string, unknown>>;
    const rawTeamMembers = (initData?.teamMembers || []) as Array<Record<string, string>>;
    return rawTeams.map(t => ({
      ...t,
      memberIds: rawTeamMembers.filter(tm => tm.teamId === t.id).map(tm => tm.memberId),
    })) as unknown as Team[];
  }, [initData]);

  const projects = useMemo(() => {
    const rawProjects = (initData?.projects || []) as Array<Record<string, unknown>>;
    const rawColumns = (initData?.columns || []) as unknown as Column[];
    return rawProjects.map(p => ({
      ...p,
      columns: rawColumns.filter(c => 'projectId' in c && c.projectId === p.id),
    })) as unknown as Project[];
  }, [initData]);

  const derivedCurrentUser = useMemo(() => members[0] || { id: '', name: '', avatar: '', role: 'user' as const, email: '' }, [members]);
  const derivedSprintId = useMemo(() => sprints[0]?.id || 'backlog', [sprints]);
  const derivedProjectId = useMemo(() => projects[0]?.id || '', [projects]);

  const [manualCurrentUser, setManualCurrentUser] = useState<Member | null>(null);
  const [manualSprintId, setManualSprintId] = useState<string | null>(null);
  const [manualProjectId, setManualProjectId] = useState<string | null>(null);

  const currentUser = manualCurrentUser || derivedCurrentUser;
  const activeSprintId = manualSprintId || derivedSprintId;
  const selectedProjectId = manualProjectId || derivedProjectId;

  const setCurrentUser = useCallback((user: Member) => setManualCurrentUser(user), []);
  const setSelectedProjectId = useCallback((id: string) => setManualProjectId(id), []);
  const setActiveSprintId = useCallback((id: string | 'backlog') => setManualSprintId(id), []);

  const emptyFilter: FilterState = { search: '', projectIds: [], memberIds: [], categories: [], labels: [] };

  const [activeView, setActiveView] = useState<'board' | 'management' | 'boards-list'>('board');
  const [managementTab, setManagementTab] = useState<'teams' | 'projects' | 'members'>('teams');
  const [filters, setFilters] = useState<FilterState>(emptyFilter);

  const currentProject = useMemo(() => projects.find(p => p.id === selectedProjectId), [projects, selectedProjectId]);
  const currentTeam = useMemo(() => teams.find(t => t.id === currentProject?.teamId), [teams, currentProject]);

  const visibleProjects = useMemo(() => {
    if (!currentUser?.role || currentUser.role === 'admin') return projects;
    const userTeams = teams.filter(t => t.memberIds?.includes(currentUser.id)).map(t => t.id);
    return projects.filter(p => p.teamId && userTeams.includes(p.teamId));
  }, [projects, teams, currentUser]);

  const allCategories = useMemo(() => Array.from(new Set(dummyTasks.map(t => t.category))), [dummyTasks]);
  const allLabels = useMemo(() => Array.from(new Set(dummyTasks.flatMap(t => t.labels))), [dummyTasks]);

  const filteredTasks = useMemo(() => {
    return dummyTasks.filter(task => {
      if (activeSprintId === 'backlog') {
        if (task.sprintId) return false;
      } else {
        if (task.sprintId !== activeSprintId) return false;
      }
      if (task.projectId !== selectedProjectId) return false;
      if (filters.search && !task.title.toLowerCase().includes(filters.search.toLowerCase()) && !task.description.toLowerCase().includes(filters.search.toLowerCase())) return false;
      if (filters.projectIds.length > 0 && !filters.projectIds.includes(task.projectId)) return false;
      if (filters.memberIds.length > 0 && (!task.assignee || !filters.memberIds.includes(task.assignee.id))) return false;
      if (filters.categories.length > 0 && !filters.categories.includes(task.category)) return false;
      if (filters.labels.length > 0 && !task.labels.some(l => filters.labels.includes(l))) return false;
      return true;
    });
  }, [dummyTasks, activeSprintId, filters, selectedProjectId]);

  const handleUpdateTask = useCallback((updatedTask: Task) => {
    apiFetch(`/api/tasks/${updatedTask.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: updatedTask.title,
        description: updatedTask.description,
        status: updatedTask.status,
        projectId: updatedTask.projectId,
        sprintId: updatedTask.sprintId,
        points: updatedTask.points,
        category: updatedTask.category,
        labels: updatedTask.labels,
        assigneeId: updatedTask.assignee?.id || null,
        dueDate: updatedTask.dueDate, order: updatedTask.order,
      }),
    }).then(() => queryClient.invalidateQueries({ queryKey: ['init'] }))
    .catch(err => addToast(err.message));
  }, [queryClient, addToast]);

  const handleTasksReorder = useCallback((newTasks: Task[]) => {
    Promise.all(newTasks.map((task, i) =>
      apiFetch(`/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: task.status, order: i }),
      })
    )).then(() => queryClient.invalidateQueries({ queryKey: ['init'] }))
    .catch(err => addToast(err.message));
  }, [queryClient, addToast]);

  const handleAddTask = useCallback((status?: string) => {
    const defaultStatus = currentProject?.columns?.[0]?.id || 'todo';
    const dueDate = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const newId = crypto.randomUUID();
    const taskData = {
      id: newId,
      title: 'New Task',
      description: 'Enter description here...',
      status: status || defaultStatus,
      projectId: selectedProjectId,
      sprintId: activeSprintId === 'backlog' ? null : activeSprintId,
      points: 0,
      category: 'Engineering',
      labels: ['New'],
      creatorId: currentUser?.id,
      assigneeId: currentUser?.id,
      dueDate,
      order: dummyTasks.filter(t => t.projectId === selectedProjectId).length,
    };

    apiFetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(taskData),
    }).then(() => queryClient.invalidateQueries({ queryKey: ['init'] }))
    .catch(err => addToast(err.message));

    return newId;
  }, [currentProject, selectedProjectId, activeSprintId, currentUser, dummyTasks, queryClient, addToast]);

  const handleCreateSprint = useCallback(() => {
    const newSprint: Sprint = {
      id: crypto.randomUUID(),
      name: `Sprint ${sprints.length + 1}`,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'backlog',
    };
    apiFetch('/api/sprints', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newSprint),
    }).then(() => {
      queryClient.invalidateQueries({ queryKey: ['init'] });
      setActiveSprintId(newSprint.id);
    }).catch(err => addToast(err.message));
  }, [sprints.length, queryClient, setActiveSprintId, addToast]);

  const handleUpdateProject = useCallback((updatedProject: Project) => {
    apiFetch(`/api/projects/${updatedProject.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedProject),
    }).then(() => queryClient.invalidateQueries({ queryKey: ['init'] }))
    .catch(err => addToast(err.message));
  }, [queryClient, addToast]);

  const handleDeleteTask = useCallback((taskId: string) => {
    apiFetch(`/api/tasks/${taskId}`, { method: 'DELETE' })
      .then(() => queryClient.invalidateQueries({ queryKey: ['init'] }))
      .catch(err => addToast(err.message));
  }, [queryClient, addToast]);

  const handleCopyTask = useCallback((task: Task) => {
    const taskData = {
      title: `${task.title} (Copy)`,
      description: task.description,
      status: task.status,
      projectId: task.projectId,
      sprintId: task.sprintId || null,
      points: task.points,
      category: task.category,
      labels: task.labels,
      creatorId: currentUser?.id,
      assigneeId: task.assignee?.id || null,
      dueDate: task.dueDate,
      order: dummyTasks.filter(t => t.projectId === task.projectId).length,
    };
    apiFetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(taskData),
    }).then(() => queryClient.invalidateQueries({ queryKey: ['init'] }))
    .catch(err => addToast(err.message));
  }, [currentUser, dummyTasks, queryClient, addToast]);

  return {
    tasks: dummyTasks, setTasks: (_value: unknown) => { queryClient.invalidateQueries({ queryKey: ['init'] }); },
    projects, setProjects: (_value: unknown) => { queryClient.invalidateQueries({ queryKey: ['init'] }); },
    sprints, setSprints: (_value: unknown) => { queryClient.invalidateQueries({ queryKey: ['init'] }); },
    teams, setTeams: (_value: unknown) => { queryClient.invalidateQueries({ queryKey: ['init'] }); },
    members, setMembers: (_value: unknown) => { queryClient.invalidateQueries({ queryKey: ['init'] }); },
    currentUser, setCurrentUser,
    activeSprintId, setActiveSprintId,
    activeView, setActiveView,
    managementTab, setManagementTab,
    selectedProjectId, setSelectedProjectId,
    filters, setFilters,
    currentProject, currentTeam,
    visibleProjects, allCategories, allLabels, filteredTasks,
    handleUpdateTask, handleTasksReorder, handleAddTask,
    handleCreateSprint, handleUpdateProject,
    handleDeleteTask, handleCopyTask,
    isLoading, error,
  };
}

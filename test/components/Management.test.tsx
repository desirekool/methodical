import React, { useState } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Management } from '@/components/Management';
import type { Team, Project, Member, Sprint } from '@/types';

const mockMembers: Member[] = [
  { id: 'm1', name: 'Alice', avatar: '', role: 'admin', email: 'alice@test.com' },
  { id: 'm2', name: 'Bob', avatar: '', role: 'user', email: 'bob@test.com' },
];

const mockTeams: Team[] = [
  { id: 't1', name: 'Alpha', memberIds: ['m1'], memberRoles: { m1: 'admin' } },
];

const mockProjects: Project[] = [
  { id: 'p1', name: 'Project A', color: '#4F46E5', columns: [{ id: 'todo', label: 'To Do', order: 0 }] },
];

const mockSprints: Sprint[] = [
  { id: 's1', name: 'Sprint 1', startDate: '2026-01-01', endDate: '2026-01-14', status: 'backlog', teamId: 't1' },
];

function renderManagement() {
  const callbacks = {
    onCreateProject: vi.fn(),
    onUpdateProject: vi.fn(),
    onDeleteProject: vi.fn(),
    onCreateTeam: vi.fn(),
    onUpdateTeam: vi.fn(),
    onDeleteTeam: vi.fn(),
    onCreateMember: vi.fn(),
    onUpdateMember: vi.fn(),
    onDeleteMember: vi.fn(),
    onCreateSprint: vi.fn(),
    onUpdateSprint: vi.fn(),
    onDeleteSprint: vi.fn(),
  };

  function Wrapper() {
    const [tab, setTab] = useState<'teams' | 'projects' | 'members'>('projects');
    return (
      <Management
        teams={mockTeams}
        projects={mockProjects}
        members={mockMembers}
        sprints={mockSprints}
        currentUser={mockMembers[0]}
        activeTab={tab}
        isPlatformAdmin={true}
        onCreateProject={callbacks.onCreateProject}
        onUpdateProject={callbacks.onUpdateProject}
        onDeleteProject={callbacks.onDeleteProject}
        onCreateTeam={callbacks.onCreateTeam}
        onUpdateTeam={callbacks.onUpdateTeam}
        onDeleteTeam={callbacks.onDeleteTeam}
        onCreateMember={callbacks.onCreateMember}
        onUpdateMember={callbacks.onUpdateMember}
        onDeleteMember={callbacks.onDeleteMember}
        onCreateSprint={callbacks.onCreateSprint}
        onUpdateSprint={callbacks.onUpdateSprint}
        onDeleteSprint={callbacks.onDeleteSprint}
      />
    );
  }

  render(<Wrapper />);
  return callbacks;
}

describe('Management', () => {
  it('shows the projects tab by default', () => {
    renderManagement();
    expect(screen.getByPlaceholderText('e.g. Marketing Campaign')).toBeDefined();
  });

  it('calls onCreateProject when Create Board is clicked', async () => {
    const callbacks = renderManagement();

    const nameInput = screen.getByPlaceholderText('e.g. Marketing Campaign');
    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, 'New Board');

    await userEvent.click(screen.getByText('Create Board'));

    expect(callbacks.onCreateProject).toHaveBeenCalledTimes(1);
    const args = callbacks.onCreateProject.mock.calls[0][0];
    expect(args.name).toBe('New Board');
    expect(args.id).toBeDefined();
    expect(args.columns).toBeDefined();
    expect(args.columns.length).toBeGreaterThan(0);
  });

  it('shows Access Denied for non-admin users', () => {
    render(
      <Management
        teams={mockTeams}
        projects={mockProjects}
        members={mockMembers}
        sprints={mockSprints}
        currentUser={mockMembers[1]}
        activeTab="projects"
        isPlatformAdmin={false}
        onCreateProject={vi.fn()}
        onUpdateProject={vi.fn()}
        onDeleteProject={vi.fn()}
        onCreateTeam={vi.fn()}
        onUpdateTeam={vi.fn()}
        onDeleteTeam={vi.fn()}
        onCreateMember={vi.fn()}
        onUpdateMember={vi.fn()}
        onDeleteMember={vi.fn()}
        onCreateSprint={vi.fn()}
        onUpdateSprint={vi.fn()}
        onDeleteSprint={vi.fn()}
      />
    );

    expect(screen.getByText('Access Denied')).toBeDefined();
  });
});

import React, { useState } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Management } from '../Management';
import type { Team, Project, Member } from '../../types';

const mockMembers: Member[] = [
  { id: 'm1', name: 'Alice', avatar: '', role: 'admin', email: 'alice@test.com' },
  { id: 'm2', name: 'Bob', avatar: '', role: 'user', email: 'bob@test.com' },
];

const mockTeams: Team[] = [
  { id: 't1', name: 'Alpha', memberIds: ['m1'] },
];

const mockProjects: Project[] = [
  { id: 'p1', name: 'Project A', color: '#4F46E5', columns: [{ id: 'todo', label: 'To Do', order: 0 }] },
];

function renderManagement() {
  const callbacks = {
    onCreateProject: vi.fn(),
    onDeleteProject: vi.fn(),
    onCreateTeam: vi.fn(),
    onUpdateTeam: vi.fn(),
    onDeleteTeam: vi.fn(),
    onCreateMember: vi.fn(),
    onUpdateMember: vi.fn(),
    onDeleteMember: vi.fn(),
  };

  function Wrapper() {
    const [tab, setTab] = useState<'teams' | 'projects' | 'members'>('projects');
    return (
      <Management
        teams={mockTeams}
        projects={mockProjects}
        members={mockMembers}
        currentUser={mockMembers[0]}
        activeTab={tab}
        onTabChange={setTab}
        onCreateProject={callbacks.onCreateProject}
        onDeleteProject={callbacks.onDeleteProject}
        onCreateTeam={callbacks.onCreateTeam}
        onUpdateTeam={callbacks.onUpdateTeam}
        onDeleteTeam={callbacks.onDeleteTeam}
        onCreateMember={callbacks.onCreateMember}
        onUpdateMember={callbacks.onUpdateMember}
        onDeleteMember={callbacks.onDeleteMember}
      />
    );
  }

  render(<Wrapper />);
  return callbacks;
}

describe('Management', () => {
  it('renders all three tab buttons', () => {
    renderManagement();
    expect(screen.getByText('Teams')).toBeDefined();
    expect(screen.getByText('Projects')).toBeDefined();
    expect(screen.getByText('Members')).toBeDefined();
  });

  it('shows the projects tab by default', () => {
    renderManagement();
    expect(screen.getByPlaceholderText('e.g. Marketing Campaign')).toBeDefined();
  });

  it('switches to teams tab on click', async () => {
    renderManagement();
    await userEvent.click(screen.getByText('Teams'));
    expect(screen.getByPlaceholderText('New team name...')).toBeDefined();
  });

  it('switches to members tab on click', async () => {
    renderManagement();
    await userEvent.click(screen.getByText('Members'));
    expect(screen.getByPlaceholderText('Name...')).toBeDefined();
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

  it('calls onCreateTeam when Create Team is clicked', async () => {
    const callbacks = renderManagement();

    await userEvent.click(screen.getByText('Teams'));

    const nameInput = screen.getByPlaceholderText('New team name...');
    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, 'New Team');

    await userEvent.click(screen.getByText('Create Team'));

    expect(callbacks.onCreateTeam).toHaveBeenCalledTimes(1);
    const args = callbacks.onCreateTeam.mock.calls[0][0];
    expect(args.name).toBe('New Team');
    expect(args.id).toBeDefined();
  });

  it('calls onCreateMember when Add Member is clicked', async () => {
    const callbacks = renderManagement();

    await userEvent.click(screen.getByText('Members'));

    const nameInput = screen.getByPlaceholderText('Name...');
    const emailInput = screen.getByPlaceholderText('Email...');
    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, 'New Person');
    await userEvent.clear(emailInput);
    await userEvent.type(emailInput, 'new@test.com');

    await userEvent.click(screen.getByText('Add Member'));

    expect(callbacks.onCreateMember).toHaveBeenCalledTimes(1);
    const args = callbacks.onCreateMember.mock.calls[0][0];
    expect(args.name).toBe('New Person');
    expect(args.email).toBe('new@test.com');
    expect(args.id).toBeDefined();
  });

  it('shows Access Denied for non-admin users', () => {
    render(
      <Management
        teams={mockTeams}
        projects={mockProjects}
        members={mockMembers}
        currentUser={mockMembers[1]}
        activeTab="projects"
        onTabChange={() => {}}
        onCreateProject={vi.fn()}
        onDeleteProject={vi.fn()}
        onCreateTeam={vi.fn()}
        onUpdateTeam={vi.fn()}
        onDeleteTeam={vi.fn()}
        onCreateMember={vi.fn()}
        onUpdateMember={vi.fn()}
        onDeleteMember={vi.fn()}
      />
    );

    expect(screen.getByText('Access Denied')).toBeDefined();
  });
});

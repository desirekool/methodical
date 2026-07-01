import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TaskCard } from '@/components/TaskCard';
import { Task, Member } from '@/types';

const mockUser: Member = {
  id: 'm1',
  name: 'Test User',
  avatar: 'https://example.com/avatar.png',
  role: 'user',
  email: 'test@example.com',
};

const mockTask: Task = {
  id: 't1',
  title: 'Test Task',
  description: 'A test task description',
  status: 'todo',
  projectId: 'p1',
  points: 3,
  category: 'Engineering',
  labels: ['Engineering', 'Frontend'],
  creator: mockUser,
  assignee: mockUser,
  dueDate: 'Oct 24, 2023',
  checklist: [],
  attachments: [],
  comments: [],
  activities: [],
};

describe('TaskCard', () => {
  it('renders the task title', () => {
    render(<TaskCard task={mockTask} onClick={() => {}} />);

    expect(screen.getByText('Test Task')).toBeInTheDocument();
  });

  it('renders labels', () => {
    render(<TaskCard task={mockTask} onClick={() => {}} />);

    expect(screen.getByText('Engineering')).toBeInTheDocument();
    expect(screen.getByText('Frontend')).toBeInTheDocument();
  });

  it('renders story points', () => {
    render(<TaskCard task={mockTask} onClick={() => {}} />);

    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('renders project name when provided', () => {
    render(<TaskCard task={mockTask} projectName="Project Alpha" projectColor="#4F46E5" onClick={() => {}} />);

    expect(screen.getByText('Project Alpha')).toBeInTheDocument();
  });

  it('does not show comment/attachment counts when there are none', () => {
    render(<TaskCard task={mockTask} onClick={() => {}} />);

    expect(screen.queryByText('0')).not.toBeInTheDocument();
  });

  it('shows comment count when comments exist', () => {
    const taskWithComments = {
      ...mockTask,
      comments: [{ id: 'c1', author: mockUser, text: 'A comment', createdAt: 'now' }],
    };

    render(<TaskCard task={taskWithComments} onClick={() => {}} />);

    expect(screen.getByText('1')).toBeInTheDocument();
  });
});

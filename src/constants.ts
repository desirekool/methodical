import { Task, Member, Project, Sprint, Team } from './types';

export const MEMBERS: Member[] = [
  {
    id: 'm1',
    name: 'Marcus (Admin)',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDRXqmuwU2Tr4O7JmERdzM3FXTsJTylbDYQTu8mt8s5bUXj6S80olbsAA-IBa3_GefWzTJy6CsIzPjhTiuW37gNl12qzQVwlOrUU9DrHVmwLYlazec19Ae_94ma-zlNxkVmna8evLCcGVa58Q7D5BCIEEIaXcgGn7NLMQbTY49dHd4RCH4yE3bQRsdIxDwzsWvg5dI7PlzHdpRY7Q2v6gT8jO4YB7XNhjBcclv_TBVztGOdDoJKk8N7br2eXurlh0wzbHGC9rg7hug',
    role: 'admin',
    email: 'marcus@example.com'
  },
  {
    id: 'm2',
    name: 'Sarah Chen',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBTRB9oJYJcSiY9xaQWyiIuUE9_t1_isF3q3mmdEukpyZwroBySNCcYL2INYL2UZZ_Z3-yX5hyC1joZds1GysnTQaqxFCKg4QQgkp8OaaE1lN0mNCqQ7a35UWPqyUhM2ypRrf7uo7JHhIiaGDQSn3VHohmfzqVp2WwGm80FwoObispQNWqumwbQyuKjYx-ksLie6x74J7G7Gj76IB0vbadzLG6l_YfKng5Hj_qXfcsEoLHVieDo7mw3rDNouRmYEa18F0pCguyS3Nc',
    role: 'user',
    email: 'sarah@example.com'
  },
  {
    id: 'm3',
    name: 'Alex Rivera',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAc6CdwYb5ihapDKwN4wtdMmMbKqFZQ8P-pM7euSMcs25VNZgCmpeIJQrr7Q55ZuB9qg9sP4EAWYcX2QGIPreALsWod36f6DWgbu1Of9_BWvAs77Tv7l5D5m6T4yJQEsZiRqk0nMC5FD27_Zn-1QjtO6hSmauKv3HTgBDb3y7pGkfFgOsFHqbKnY8qcn3s1nZ7Dlmacjx5NK5Nk65NTo31mdxfSz0p-ntgTw5KwJ6XLv-4DbQA6xQGwJ2Aeds0qg9YI8riO5Pd8hMA',
    role: 'user',
    email: 'alex@example.com'
  },
];

export const TEAMS: Team[] = [
  { id: 't1', name: 'Core Platform', memberIds: ['m1', 'm2'] },
  { id: 't2', name: 'Design & UX', memberIds: ['m2', 'm3'] },
];

export const PROJECTS: Project[] = [
  { 
    id: 'p1', 
    name: 'Project Alpha', 
    color: '#4F46E5', 
    teamId: 't1',
    leadId: 'm1',
    columns: [
      { id: 'todo', label: 'To Do', order: 0 },
      { id: 'in-progress', label: 'In Progress', order: 1 },
      { id: 'done', label: 'Done', order: 2 },
    ]
  },
  { 
    id: 'p2', 
    name: 'Design System', 
    color: '#10B981', 
    teamId: 't2',
    leadId: 'm2',
    columns: [
      { id: 'todo', label: 'To Do', order: 0 },
      { id: 'in-progress', label: 'In Progress', order: 1 },
      { id: 'done', label: 'Done', order: 2 },
    ]
  },
  { 
    id: 'p3', 
    name: 'Mobile App', 
    color: '#F59E0B', 
    teamId: 't1',
    leadId: 'm1',
    columns: [
      { id: 'todo', label: 'To Do', order: 0 },
      { id: 'in-progress', label: 'In Progress', order: 1 },
      { id: 'done', label: 'Done', order: 2 },
    ]
  },
];

export const SPRINTS: Sprint[] = [
  { id: 's1', name: 'Sprint 24', startDate: '2023-10-10', endDate: '2023-10-24', status: 'active' },
  { id: 's2', name: 'Sprint 25', startDate: '2023-10-25', endDate: '2023-11-08', status: 'backlog' },
];

export const INITIAL_TASKS: Task[] = [
  {
    id: 't1',
    title: 'Refactor authentication flow',
    description: 'Current authentication logic is monolithic and hard to test. We need to move towards a service-based architecture using the new Auth0 provider. This includes updating login, logout, and token refresh hooks.',
    status: 'in-progress',
    projectId: 'p1',
    sprintId: 's1',
    points: 5,
    category: 'Engineering',
    labels: ['Engineering'],
    creator: MEMBERS[1],
    assignee: MEMBERS[0],
    dueDate: 'Oct 24, 2023',
    checklist: [
      { id: 'c1', text: 'Update Auth0 Client ID in environment', completed: true },
      { id: 'c2', text: 'Implement useAuth hook wrapper', completed: true },
      { id: 'c3', text: 'Write unit tests for refresh token cycle', completed: false },
    ],
    attachments: [
      { id: 'a1', name: 'api-docs-v2.pdf', type: 'pdf', url: '#', addedAt: 'yesterday' },
      { id: 'a2', name: 'error-log.png', type: 'image', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAg3ta1xzSV8lQ4-8uTjpPsm6g69YArVAKPwdjp1gQxPykVML0aIldC0puDYFS3w7HsQcSUtrLDjP2NFKuG83PPqIRnYPL8uxvIHwSHbT-28nvGJ8xdy-BgADA8iUAt6CtWA8xdL87J7ikCuPEK3_B0xDiW0a36eNLyxkjENIsEQH-eODL8nFAK9wd8iPoSQ9InexzMIuxeVnT7hMUAVTFnYorDZbtl8yuMP7ZjpkTuOnxeM0A9dyKMmf8tYq0QIronOBgheIY0Jqg', addedAt: '2h ago' },
    ],
    comments: [
      {
        id: 'cm1',
        author: MEMBERS[1],
        text: "I've uploaded the updated API docs. Let me know if you need any clarification on the endpoint changes.",
        createdAt: '3 hours ago',
      },
    ],
    activities: [],
  },
  {
    id: 't2',
    title: 'Design system audit',
    description: 'Review all components for accessibility compliance and consistency with the new brand guidelines.',
    status: 'todo',
    projectId: 'p2',
    sprintId: 's1',
    points: 3,
    category: 'Design',
    labels: ['Design', 'Accessibility'],
    creator: MEMBERS[0],
    assignee: MEMBERS[1],
    dueDate: 'Nov 12, 2023',
    checklist: [],
    attachments: [],
    comments: [],
    activities: [],
  },
  {
    id: 't3',
    title: 'Database migration to v4',
    description: 'Migrate the production database to the new schema version. Requires downtime coordination.',
    status: 'done',
    projectId: 'p1',
    sprintId: 's1',
    points: 8,
    category: 'DevOps',
    labels: ['High Priority'],
    creator: MEMBERS[2],
    assignee: MEMBERS[2],
    dueDate: 'Oct 15, 2023',
    checklist: [],
    attachments: [],
    comments: [],
    activities: [],
  },
  {
    id: 't4',
    title: 'Backlog item: API Documentation',
    description: 'Document the new v4 endpoints for the mobile team.',
    status: 'todo',
    projectId: 'p1',
    sprintId: undefined, // No sprint = Backlog
    points: 2,
    category: 'Engineering',
    labels: ['Documentation'],
    creator: MEMBERS[0],
    assignee: MEMBERS[0],
    dueDate: 'Dec 1, 2023',
    checklist: [],
    attachments: [],
    comments: [],
    activities: [],
  },
];

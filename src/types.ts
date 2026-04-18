export type Status = string;

export type UserRole = 'admin' | 'user';

export interface Column {
  id: string;
  label: string;
  order: number;
}

export interface Member {
  id: string;
  name: string;
  avatar: string;
  role: UserRole;
  email: string;
}

export interface Team {
  id: string;
  name: string;
  memberIds: string[];
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface Attachment {
  id: string;
  name: string;
  type: 'pdf' | 'image';
  url: string;
  addedAt: string;
}

export interface Comment {
  id: string;
  author: Member;
  text: string;
  createdAt: string;
}

export interface Activity {
  id: string;
  user: Member;
  action: string;
  target?: string;
  timestamp: string;
}

export interface Project {
  id: string;
  name: string;
  color: string;
  teamId?: string;
  columns: Column[];
  leadId?: string;
}

export interface Sprint {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'backlog';
}

export interface FilterState {
  search: string;
  projectIds: string[];
  memberIds: string[];
  categories: string[];
  labels: string[];
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: Status;
  projectId: string;
  sprintId?: string;
  points?: number;
  category: string;
  labels: string[];
  creator: Member;
  assignee?: Member;
  dueDate: string;
  checklist: ChecklistItem[];
  attachments: Attachment[];
  comments: Comment[];
  activities: Activity[];
}

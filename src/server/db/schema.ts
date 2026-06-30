import { sqliteTable, text, integer, primaryKey } from 'drizzle-orm/sqlite-core';

export const projects = sqliteTable('projects', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  color: text('color').notNull().default('#4F46E5'),
  teamId: text('team_id'),
  leadId: text('lead_id'),
});

export const columns = sqliteTable('columns', {
  projectId: text('project_id').notNull().references(() => projects.id),
  id: text('id').notNull(),
  label: text('label').notNull(),
  order: integer('order').notNull().default(0),
}, (table) => ({
  pk: primaryKey({ columns: [table.projectId, table.id] }),
}));

export const members = sqliteTable('members', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  avatar: text('avatar').notNull().default(''),
  role: text('role', { enum: ['admin', 'user'] }).notNull().default('user'),
  email: text('email').notNull(),
});

export const teams = sqliteTable('teams', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
});

export const teamMembers = sqliteTable('team_members', {
  teamId: text('team_id').notNull().references(() => teams.id),
  memberId: text('member_id').notNull().references(() => members.id),
});

export const sprints = sqliteTable('sprints', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  startDate: text('start_date').notNull(),
  endDate: text('end_date').notNull(),
  status: text('status', { enum: ['active', 'completed', 'backlog'] }).notNull().default('backlog'),
});

export const tasks = sqliteTable('tasks', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull().default(''),
  status: text('status').notNull(),
  projectId: text('project_id').notNull().references(() => projects.id),
  sprintId: text('sprint_id').references(() => sprints.id),
  points: integer('points'),
  category: text('category').notNull().default(''),
  labels: text('labels').notNull().default('[]'),
  creatorId: text('creator_id').notNull().references(() => members.id),
  assigneeId: text('assignee_id').references(() => members.id),
  dueDate: text('due_date'),
  order: integer('order').notNull().default(0),
  metadata: text('metadata').notNull().default('{}'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const checklistItems = sqliteTable('checklist_items', {
  id: text('id').primaryKey(),
  taskId: text('task_id').notNull().references(() => tasks.id),
  text: text('text').notNull(),
  completed: integer('completed', { mode: 'boolean' }).notNull().default(false),
});

export const attachments = sqliteTable('attachments', {
  id: text('id').primaryKey(),
  taskId: text('task_id').notNull().references(() => tasks.id),
  name: text('name').notNull(),
  type: text('type', { enum: ['pdf', 'image'] }).notNull(),
  url: text('url').notNull(),
  addedAt: text('added_at').notNull(),
});

export const comments = sqliteTable('comments', {
  id: text('id').primaryKey(),
  taskId: text('task_id').notNull().references(() => tasks.id),
  authorId: text('author_id').notNull().references(() => members.id),
  text: text('text').notNull(),
  createdAt: text('created_at').notNull(),
});

export const activities = sqliteTable('activities', {
  id: text('id').primaryKey(),
  taskId: text('task_id').notNull().references(() => tasks.id),
  userId: text('user_id').notNull().references(() => members.id),
  action: text('action').notNull(),
  target: text('target'),
  timestamp: text('timestamp').notNull(),
});

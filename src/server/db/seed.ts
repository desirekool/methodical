import { db } from './index';
import {
  projects as projectsTable,
  columns as columnsTable,
  members as membersTable,
  teams as teamsTable,
  teamMembers as teamMembersTable,
  sprints as sprintsTable,
  tasks as tasksTable,
  checklistItems as checklistItemsTable,
  attachments as attachmentsTable,
  comments as commentsTable,
  activities as activitiesTable,
} from './schema';
import { MEMBERS, TEAMS, PROJECTS, INITIAL_TASKS } from '../../constants';

function getBacklogSprints() {
  const now = new Date();
  const farFuture = new Date(now.getFullYear() + 10, 0, 1);
  const start = now.toISOString().split('T')[0];
  const end = farFuture.toISOString().split('T')[0];
  return TEAMS.map(t => ({
    id: `b_${t.id}`,
    name: 'Backlog',
    startDate: start,
    endDate: end,
    status: 'backlog' as const,
    teamId: t.id,
  }));
}

const seedMembers = MEMBERS.map((m) => ({
  id: m.id,
  name: m.name,
  avatar: m.avatar,
  role: m.role,
  email: m.email,
}));

const seedTeams = TEAMS.map((t) => ({
  id: t.id,
  name: t.name,
}));

const seedTeamMembers = TEAMS.flatMap((t) =>
  t.memberIds.map((memberId) => ({
    teamId: t.id,
    memberId,
    role: t.memberRoles[memberId] || 'member',
  }))
);

const seedProjects = PROJECTS.map((p) => ({
  id: p.id,
  name: p.name,
  color: p.color,
  teamId: p.teamId ?? null,
  leadId: p.leadId ?? null,
}));

const seedColumns = PROJECTS.flatMap((p) =>
  p.columns.map((c) => ({
    id: c.id,
    projectId: p.id,
    label: c.label,
    order: c.order,
  }))
);

const seedBacklogSprints = getBacklogSprints();
const seedRegularSprints = [
  { id: 's1', name: 'Sprint 24', startDate: '2023-10-10', endDate: '2023-10-24', status: 'active' as const, teamId: 't1' },
  { id: 's2', name: 'Sprint 25', startDate: '2023-10-25', endDate: '2023-11-08', status: 'planned' as const, teamId: 't1' },
];
const seedSprints = [...seedBacklogSprints, ...seedRegularSprints];

const seedTasks = INITIAL_TASKS.map((t, i) => ({
  id: t.id,
  title: t.title,
  description: t.description,
  status: t.status,
  projectId: t.projectId,
  sprintId: t.sprintId ?? null,
  points: t.points ?? null,
  category: t.category,
  labels: JSON.stringify(t.labels),
  creatorId: t.creator.id,
  assigneeId: t.assignee?.id ?? null,
  dueDate: t.dueDate ?? null,
  order: i,
  metadata: '{}',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}));

const seedChecklistItems = INITIAL_TASKS.flatMap((t) =>
  t.checklist.map((c) => ({
    id: c.id,
    taskId: t.id,
    text: c.text,
    completed: c.completed,
  }))
);

const seedAttachments = INITIAL_TASKS.flatMap((t) =>
  t.attachments.map((a) => ({
    id: a.id,
    taskId: t.id,
    name: a.name,
    type: a.type,
    url: a.url,
    addedAt: a.addedAt,
  }))
);

const seedComments = INITIAL_TASKS.flatMap((t) =>
  t.comments.map((c) => ({
    id: c.id,
    taskId: t.id,
    authorId: c.author.id,
    text: c.text,
    createdAt: c.createdAt,
  }))
);

async function main() {
  console.log('Seeding database...');

  db.delete(activitiesTable).run();
  db.delete(commentsTable).run();
  db.delete(attachmentsTable).run();
  db.delete(checklistItemsTable).run();
  db.delete(tasksTable).run();
  db.delete(teamMembersTable).run();
  db.delete(columnsTable).run();
  db.delete(sprintsTable).run();
  db.delete(projectsTable).run();
  db.delete(teamsTable).run();
  db.delete(membersTable).run();

  db.insert(membersTable).values(seedMembers).run();
  console.log(`  Inserted ${seedMembers.length} members`);

  db.insert(teamsTable).values(seedTeams).run();
  console.log(`  Inserted ${seedTeams.length} teams`);

  db.insert(teamMembersTable).values(seedTeamMembers).run();
  console.log(`  Inserted ${seedTeamMembers.length} team members`);

  db.insert(projectsTable).values(seedProjects).run();
  console.log(`  Inserted ${seedProjects.length} projects`);

  db.insert(columnsTable).values(seedColumns).run();
  console.log(`  Inserted ${seedColumns.length} columns`);

  db.insert(sprintsTable).values(seedSprints).run();
  console.log(`  Inserted ${seedSprints.length} sprints`);

  db.insert(tasksTable).values(seedTasks).run();
  console.log(`  Inserted ${seedTasks.length} tasks`);

  if (seedChecklistItems.length > 0) {
    db.insert(checklistItemsTable).values(seedChecklistItems).run();
    console.log(`  Inserted ${seedChecklistItems.length} checklist items`);
  }

  if (seedAttachments.length > 0) {
    db.insert(attachmentsTable).values(seedAttachments).run();
    console.log(`  Inserted ${seedAttachments.length} attachments`);
  }

  if (seedComments.length > 0) {
    db.insert(commentsTable).values(seedComments).run();
    console.log(`  Inserted ${seedComments.length} comments`);
  }

  console.log('Done!');
}

main().catch(console.error);

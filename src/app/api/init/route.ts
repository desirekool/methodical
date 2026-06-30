import { NextResponse } from 'next/server';
import { db } from '@/server/db';
import {
  projects, columns, members, teams, teamMembers, sprints, tasks,
  checklistItems, attachments, comments, activities,
} from '@/server/db/schema';

export const dynamic = 'force-dynamic';

export async function GET() {
  const allProjects = db.select().from(projects).all();
  const allColumns = db.select().from(columns).all();
  const allMembers = db.select().from(members).all();
  const allTeams = db.select().from(teams).all();
  const allSprints = db.select().from(sprints).all();
  const allTasks = db.select().from(tasks).all();
  const allChecklistItems = db.select().from(checklistItems).all();
  const allAttachments = db.select().from(attachments).all();
  const allComments = db.select().from(comments).all();
  const allTeamMembers = db.select().from(teamMembers).all();
  const allActivities = db.select().from(activities).all();

  return NextResponse.json({
    projects: allProjects,
    columns: allColumns,
    members: allMembers,
    teams: allTeams,
    teamMembers: allTeamMembers,
    sprints: allSprints,
    tasks: allTasks,
    checklistItems: allChecklistItems,
    attachments: allAttachments,
    comments: allComments,
    activities: allActivities,
  });
}

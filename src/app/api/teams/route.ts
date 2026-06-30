import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/db';
import { teams, sprints } from '@/server/db/schema';

export async function POST(request: NextRequest) {
  const body = await request.json();
  if (!body || !body.name) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 });
  }

  const teamId = body.id || crypto.randomUUID();
  const team = { id: teamId, name: body.name };
  db.insert(teams).values(team).run();

  const now = new Date();
  const farFuture = new Date(now.getFullYear() + 10, 0, 1);
  const backlogSprint = {
    id: `b_${teamId}`,
    name: 'Backlog',
    startDate: now.toISOString().split('T')[0],
    endDate: farFuture.toISOString().split('T')[0],
    status: 'backlog' as const,
  };
  db.insert(sprints).values(backlogSprint).run();

  return NextResponse.json(team, { status: 201 });
}

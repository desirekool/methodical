import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/db';
import { sprints } from '@/server/db/schema';
import { eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET() {
  const result = db.select().from(sprints).all();
  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const sprint = {
    id: body.id || crypto.randomUUID(),
    name: body.name,
    startDate: body.startDate,
    endDate: body.endDate,
    status: body.status || 'planning',
    teamId: body.teamId || null,
  };
  db.insert(sprints).values(sprint).run();
  return NextResponse.json(sprint, { status: 201 });
}

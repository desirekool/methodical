import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/db';
import { activities } from '@/server/db/schema';
import { eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const taskId = searchParams.get('taskId');

  let result;
  if (taskId) {
    result = db.select().from(activities).where(eq(activities.taskId, taskId)).all();
  } else {
    result = db.select().from(activities).all();
  }

  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  const activity = {
    id: crypto.randomUUID(),
    taskId: body.taskId,
    userId: body.userId,
    action: body.action,
    target: body.target || null,
    timestamp: body.timestamp || new Date().toISOString(),
  };

  db.insert(activities).values(activity).run();
  return NextResponse.json(activity, { status: 201 });
}

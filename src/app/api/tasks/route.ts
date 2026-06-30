import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/db';
import { tasks, checklistItems, attachments, comments, activities } from '@/server/db/schema';
import { eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get('projectId');

  let result;
  if (projectId) {
    result = db.select().from(tasks).where(eq(tasks.projectId, projectId)).all();
  } else {
    result = db.select().from(tasks).all();
  }

  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const now = new Date().toISOString();

  const task = {
    id: body.id || crypto.randomUUID(),
    title: body.title,
    description: body.description || '',
    status: body.status,
    projectId: body.projectId,
    sprintId: body.sprintId || null,
    points: body.points ?? null,
    category: body.category || '',
    labels: JSON.stringify(body.labels || []),
    creatorId: body.creatorId,
    assigneeId: body.assigneeId || null,
    dueDate: body.dueDate || null,
    order: body.order ?? 0,
    metadata: JSON.stringify(body.metadata || {}),
    createdAt: now,
    updatedAt: now,
  };

  db.insert(tasks).values(task).run();
  return NextResponse.json(task, { status: 201 });
}

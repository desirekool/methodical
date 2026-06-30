import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/db';
import { tasks, checklistItems, attachments, comments, activities } from '@/server/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const task = db.select().from(tasks).where(eq(tasks.id, id)).get();
  if (!task) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(task);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  const existing = db.select().from(tasks).where(eq(tasks.id, id)).get();
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const updates: Record<string, unknown> = { updatedAt: new Date().toISOString() };
  for (const key of ['title', 'description', 'status', 'projectId', 'sprintId', 'points', 'category', 'dueDate', 'order']) {
    if (body[key] !== undefined) updates[key] = body[key];
  }
  if (body.labels !== undefined) updates.labels = JSON.stringify(body.labels);
  if (body.assigneeId !== undefined) updates.assigneeId = body.assigneeId;
  if (body.metadata !== undefined) updates.metadata = JSON.stringify(body.metadata);

  db.update(tasks).set(updates).where(eq(tasks.id, id)).run();
  const updated = db.select().from(tasks).where(eq(tasks.id, id)).get();
  return NextResponse.json(updated);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const existing = db.select().from(tasks).where(eq(tasks.id, id)).get();
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  db.delete(comments).where(eq(comments.taskId, id)).run();
  db.delete(activities).where(eq(activities.taskId, id)).run();
  db.delete(attachments).where(eq(attachments.taskId, id)).run();
  db.delete(checklistItems).where(eq(checklistItems.taskId, id)).run();
  db.delete(tasks).where(eq(tasks.id, id)).run();

  return NextResponse.json({ success: true });
}

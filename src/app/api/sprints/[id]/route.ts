import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/db';
import { sprints, tasks } from '@/server/db/schema';
import { eq } from 'drizzle-orm';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const existing = db.select().from(sprints).where(eq(sprints.id, id)).get();
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const body = await request.json();
  const updates: Record<string, unknown> = {};
  if (body.name !== undefined) updates.name = body.name;
  if (body.startDate !== undefined) updates.startDate = body.startDate;
  if (body.endDate !== undefined) updates.endDate = body.endDate;
  if (body.status !== undefined) updates.status = body.status;

  db.update(sprints).set(updates).where(eq(sprints.id, id)).run();

  const updated = db.select().from(sprints).where(eq(sprints.id, id)).get();
  return NextResponse.json(updated);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const existing = db.select().from(sprints).where(eq(sprints.id, id)).get();
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  db.update(tasks).set({ sprintId: null }).where(eq(tasks.sprintId, id)).run();
  db.delete(sprints).where(eq(sprints.id, id)).run();

  return NextResponse.json({ success: true });
}

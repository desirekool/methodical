import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/db';
import { columns } from '@/server/db/schema';
import { eq, and } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const col = {
    projectId: body.projectId,
    id: body.id || crypto.randomUUID(),
    label: body.label,
    order: body.order ?? 0,
  };
  db.insert(columns).values(col).run();
  return NextResponse.json(col, { status: 201 });
}

export async function PUT(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get('projectId');
  const id = searchParams.get('id');
  if (!projectId || !id) {
    return NextResponse.json({ error: 'projectId and id query params required' }, { status: 400 });
  }

  const existing = db.select().from(columns)
    .where(and(eq(columns.projectId, projectId), eq(columns.id, id))).get();
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const body = await request.json();
  const updates: Record<string, unknown> = {};
  if (body.label !== undefined) updates.label = body.label;
  if (body.order !== undefined) updates.order = body.order;

  db.update(columns).set(updates)
    .where(and(eq(columns.projectId, projectId), eq(columns.id, id))).run();

  const updated = db.select().from(columns)
    .where(and(eq(columns.projectId, projectId), eq(columns.id, id))).get();
  return NextResponse.json(updated);
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get('projectId');
  const id = searchParams.get('id');
  if (!projectId || !id) {
    return NextResponse.json({ error: 'projectId and id query params required' }, { status: 400 });
  }

  const existing = db.select().from(columns)
    .where(and(eq(columns.projectId, projectId), eq(columns.id, id))).get();
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  db.delete(columns)
    .where(and(eq(columns.projectId, projectId), eq(columns.id, id))).run();

  return NextResponse.json({ success: true });
}

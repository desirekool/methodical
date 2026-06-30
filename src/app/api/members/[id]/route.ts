import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/db';
import { members } from '@/server/db/schema';
import { eq } from 'drizzle-orm';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const existing = db.select().from(members).where(eq(members.id, id)).get();
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const body = await request.json();
  const updates: Record<string, unknown> = {};
  if (body.name !== undefined) updates.name = body.name;
  if (body.email !== undefined) updates.email = body.email;
  if (body.avatar !== undefined) updates.avatar = body.avatar;
  if (body.role !== undefined) updates.role = body.role;

  db.update(members).set(updates).where(eq(members.id, id)).run();

  const updated = db.select().from(members).where(eq(members.id, id)).get();
  return NextResponse.json(updated);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const existing = db.select().from(members).where(eq(members.id, id)).get();
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  db.delete(members).where(eq(members.id, id)).run();
  return NextResponse.json({ success: true });
}

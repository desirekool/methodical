import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/db';
import { comments } from '@/server/db/schema';
import { eq } from 'drizzle-orm';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  const existing = db.select().from(comments).where(eq(comments.id, id)).get();
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  db.update(comments).set({ text: body.text }).where(eq(comments.id, id)).run();
  const updated = db.select().from(comments).where(eq(comments.id, id)).get();
  return NextResponse.json(updated);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const existing = db.select().from(comments).where(eq(comments.id, id)).get();
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  db.delete(comments).where(eq(comments.id, id)).run();
  return NextResponse.json({ success: true });
}

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/db';
import { projects } from '@/server/db/schema';
import { eq } from 'drizzle-orm';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  const existing = db.select().from(projects).where(eq(projects.id, id)).get();
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  db.update(projects).set({
    name: body.name,
    color: body.color,
    teamId: body.teamId || null,
    leadId: body.leadId || null,
  }).where(eq(projects.id, id)).run();

  const updated = db.select().from(projects).where(eq(projects.id, id)).get();
  return NextResponse.json(updated);
}

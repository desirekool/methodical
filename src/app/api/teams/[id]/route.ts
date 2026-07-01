import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/db';
import { teams, teamMembers, sprints } from '@/server/db/schema';
import { eq } from 'drizzle-orm';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const existing = db.select().from(teams).where(eq(teams.id, id)).get();
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const body = await request.json();
  const updates: Record<string, unknown> = {};
  if (body.name !== undefined) updates.name = body.name;

  if (Object.keys(updates).length > 0) {
    db.update(teams).set(updates).where(eq(teams.id, id)).run();
  }

  if (body.memberIds !== undefined) {
    db.delete(teamMembers).where(eq(teamMembers.teamId, id)).run();
    if (Array.isArray(body.memberIds) && body.memberIds.length > 0) {
      const memberRoles = body.memberRoles || {};
      db.insert(teamMembers).values(
        body.memberIds.map((memberId: string) => ({
          teamId: id,
          memberId,
          role: memberRoles[memberId] || 'member',
        }))
      ).run();
    }
  }

  const updated = db.select().from(teams).where(eq(teams.id, id)).get();
  return NextResponse.json(updated);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const existing = db.select().from(teams).where(eq(teams.id, id)).get();
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  db.delete(teamMembers).where(eq(teamMembers.teamId, id)).run();
  db.update(sprints).set({ teamId: null }).where(eq(sprints.teamId, id)).run();
  db.delete(teams).where(eq(teams.id, id)).run();

  return NextResponse.json({ success: true });
}

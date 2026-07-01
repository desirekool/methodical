import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/db';
import { projects as projectsTable, columns as columnsTable } from '@/server/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  const body = await request.json();
  if (!body || !body.name) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 });
  }

  const project = {
    id: body.id || crypto.randomUUID(),
    name: body.name,
    color: body.color || '#4F46E5',
    teamId: body.teamId || null,
    leadId: body.leadId || null,
  };

  db.insert(projectsTable).values(project).run();

  const cols = (body.columns || []).map((c: { id: string; label: string; order: number }) => ({
    id: c.id,
    projectId: project.id,
    label: c.label,
    order: c.order,
  }));

  if (cols.length > 0) {
    db.insert(columnsTable).values(cols).run();
  }

  return NextResponse.json({ ...project, columns: cols }, { status: 201 });
}

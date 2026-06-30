import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/db';
import { members } from '@/server/db/schema';

export async function POST(request: NextRequest) {
  const body = await request.json();
  if (!body || !body.name) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 });
  }

  const member = {
    id: body.id || crypto.randomUUID(),
    name: body.name,
    email: body.email || '',
    avatar: body.avatar || '',
    role: body.role || 'user',
  };

  db.insert(members).values(member).run();
  return NextResponse.json(member, { status: 201 });
}

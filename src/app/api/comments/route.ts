import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/db';
import { comments } from '@/server/db/schema';
import { eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const taskId = searchParams.get('taskId');

  let result;
  if (taskId) {
    result = db.select().from(comments).where(eq(comments.taskId, taskId)).all();
  } else {
    result = db.select().from(comments).all();
  }

  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  const comment = {
    id: crypto.randomUUID(),
    taskId: body.taskId,
    authorId: body.authorId,
    text: body.text,
    createdAt: body.createdAt || new Date().toISOString(),
  };

  db.insert(comments).values(comment).run();
  return NextResponse.json(comment, { status: 201 });
}

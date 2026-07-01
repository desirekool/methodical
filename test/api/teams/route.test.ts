import { NextRequest } from 'next/server';
import { describe, it, expect, beforeAll } from 'vitest';
import { db } from '@/server/db';
import { teamMembers } from '@/server/db/schema';
import { eq } from 'drizzle-orm';
import { reseed } from '../../api-setup';

let POST: any, PUT: any, DELETE: any;

beforeAll(async () => {
  reseed();
  const [mod, modId] = await Promise.all([
    import('@/app/api/teams/route'),
    import('@/app/api/teams/[id]/route'),
  ]);
  POST = mod.POST;
  PUT = modId.PUT;
  DELETE = modId.DELETE;
});

describe('POST /api/teams', () => {
  it('creates a new team', async () => {
    const body = { id: 'test-t1', name: 'Test Team' };
    const req = new NextRequest('http://localhost:3000/api/teams', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const res = await POST(req);
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.id).toBe('test-t1');
    expect(data.name).toBe('Test Team');
  });

  it('returns 400 for empty body', async () => {
    const req = new NextRequest('http://localhost:3000/api/teams', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });
});

describe('PUT /api/teams/[id]', () => {
  it('updates team name', async () => {
    const req = new NextRequest('http://localhost:3000/api/teams/test-t1', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Updated Team' }),
    });
    const res = await PUT(req, { params: Promise.resolve({ id: 'test-t1' }) });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.name).toBe('Updated Team');
  });

  it('syncs memberIds to team_members table', async () => {
    const req = new NextRequest('http://localhost:3000/api/teams/test-t1', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Updated Team', memberIds: ['m1', 'm2', 'm3'] }),
    });
    const res = await PUT(req, { params: Promise.resolve({ id: 'test-t1' }) });
    expect(res.status).toBe(200);

    const rows = db.select().from(teamMembers).where(eq(teamMembers.teamId, 'test-t1')).all();
    expect(rows).toHaveLength(3);
    expect(rows.map(r => r.memberId).sort()).toEqual(['m1', 'm2', 'm3']);
  });

  it('returns 404 for non-existent team', async () => {
    const req = new NextRequest('http://localhost:3000/api/teams/nonexistent', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Nope' }),
    });
    const res = await PUT(req, { params: Promise.resolve({ id: 'nonexistent' }) });
    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/teams/[id]', () => {
  it('deletes a team', async () => {
    const req = new NextRequest('http://localhost:3000/api/teams/test-t1', {
      method: 'DELETE',
    });
    const res = await DELETE(req, { params: Promise.resolve({ id: 'test-t1' }) });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
  });

  it('returns 404 for non-existent team', async () => {
    const req = new NextRequest('http://localhost:3000/api/teams/nonexistent', {
      method: 'DELETE',
    });
    const res = await DELETE(req, { params: Promise.resolve({ id: 'nonexistent' }) });
    expect(res.status).toBe(404);
  });
});

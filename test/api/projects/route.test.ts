import { NextRequest } from 'next/server';
import { describe, it, expect, beforeAll } from 'vitest';
import { reseed } from '../../api-setup';

let POST: any;
let DELETE: any;

beforeAll(async () => {
  reseed();
  const mod = await import('@/app/api/projects/route');
  POST = mod.POST;
  const idMod = await import('@/app/api/projects/[id]/route');
  DELETE = idMod.DELETE;
});

describe('POST /api/projects', () => {
  it('creates a project with columns', async () => {
    const body = {
      id: 'test-p1',
      name: 'Test Project',
      color: '#FF5733',
      teamId: 't1',
      leadId: 'm1',
      columns: [
        { id: 'backlog', label: 'Backlog', order: 0 },
        { id: 'active', label: 'Active', order: 1 },
      ],
    };
    const req = new NextRequest('http://localhost:3000/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const res = await POST(req);
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.id).toBe('test-p1');
    expect(data.name).toBe('Test Project');
    expect(data.color).toBe('#FF5733');
    expect(Array.isArray(data.columns)).toBe(true);
    expect(data.columns).toHaveLength(2);
    expect(data.columns[0].id).toBe('backlog');
    expect(data.columns[0].projectId).toBe('test-p1');
  });

  it('returns 400 for empty body', async () => {
    const req = new NextRequest('http://localhost:3000/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });
});

describe('DELETE /api/projects/[id]', () => {
  it('deletes a project and its columns', async () => {
    const req = new NextRequest('http://localhost:3000/api/projects/test-p1', {
      method: 'DELETE',
    });
    const res = await DELETE(req, { params: Promise.resolve({ id: 'test-p1' }) });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
  });

  it('returns 404 for non-existent project', async () => {
    const req = new NextRequest('http://localhost:3000/api/projects/nonexistent', {
      method: 'DELETE',
    });
    const res = await DELETE(req, { params: Promise.resolve({ id: 'nonexistent' }) });
    expect(res.status).toBe(404);
  });
});

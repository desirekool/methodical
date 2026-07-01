import { NextRequest } from 'next/server';
import { describe, it, expect, beforeAll } from 'vitest';
import { reseed } from '../../api-setup';

let POST: any, PUT: any, DELETE: any;

beforeAll(async () => {
  reseed();
  const [mod, modId] = await Promise.all([
    import('@/app/api/members/route'),
    import('@/app/api/members/[id]/route'),
  ]);
  POST = mod.POST;
  PUT = modId.PUT;
  DELETE = modId.DELETE;
});

describe('POST /api/members', () => {
  it('creates a new member', async () => {
    const body = {
      id: 'test-m1',
      name: 'Test User',
      email: 'test@example.com',
      avatar: 'https://example.com/avatar.png',
      role: 'user',
    };
    const req = new NextRequest('http://localhost:3000/api/members', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const res = await POST(req);
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.id).toBe('test-m1');
    expect(data.name).toBe('Test User');
    expect(data.email).toBe('test@example.com');
    expect(data.role).toBe('user');
  });

  it('returns 400 for empty body', async () => {
    const req = new NextRequest('http://localhost:3000/api/members', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });
});

describe('PUT /api/members/[id]', () => {
  it('updates a member role', async () => {
    const req = new NextRequest('http://localhost:3000/api/members/test-m1', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: 'admin' }),
    });
    const res = await PUT(req, { params: Promise.resolve({ id: 'test-m1' }) });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.role).toBe('admin');
  });

  it('returns 404 for non-existent member', async () => {
    const req = new NextRequest('http://localhost:3000/api/members/nonexistent', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: 'admin' }),
    });
    const res = await PUT(req, { params: Promise.resolve({ id: 'nonexistent' }) });
    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/members/[id]', () => {
  it('deletes a member', async () => {
    const req = new NextRequest('http://localhost:3000/api/members/test-m1', {
      method: 'DELETE',
    });
    const res = await DELETE(req, { params: Promise.resolve({ id: 'test-m1' }) });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
  });

  it('returns 404 for non-existent member', async () => {
    const req = new NextRequest('http://localhost:3000/api/members/nonexistent', {
      method: 'DELETE',
    });
    const res = await DELETE(req, { params: Promise.resolve({ id: 'nonexistent' }) });
    expect(res.status).toBe(404);
  });
});

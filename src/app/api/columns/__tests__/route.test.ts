import { NextRequest } from 'next/server';
import { describe, it, expect, beforeAll } from 'vitest';
import { reseed } from '../../../../test/api-setup';

beforeAll(() => reseed());

describe('POST /api/columns', () => {
  it('creates a new column', async () => {
    const req = new NextRequest('http://localhost:3000/api/columns', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId: 'p1', id: 'review', label: 'Review', order: 3 }),
    });
    const res = await POST(req);
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.id).toBe('review');
    expect(data.projectId).toBe('p1');
    expect(data.label).toBe('Review');
    expect(data.order).toBe(3);
  });
});

describe('PUT /api/columns', () => {
  it('updates a column label', async () => {
    const req = new NextRequest('http://localhost:3000/api/columns?projectId=p1&id=todo', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ label: 'Backlog' }),
    });
    const res = await PUT(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.label).toBe('Backlog');
  });

  it('returns 400 without query params', async () => {
    const req = new NextRequest('http://localhost:3000/api/columns', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ label: 'Backlog' }),
    });
    const res = await PUT(req);
    expect(res.status).toBe(400);
  });

  it('returns 404 for non-existent column', async () => {
    const req = new NextRequest('http://localhost:3000/api/columns?projectId=p1&id=nonexistent', {
      method: 'PUT',
      body: JSON.stringify({ label: 'Nope' }),
    });
    const res = await PUT(req);
    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/columns', () => {
  it('deletes a column', async () => {
    const req = new NextRequest('http://localhost:3000/api/columns?projectId=p1&id=done', {
      method: 'DELETE',
    });
    const res = await DELETE(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
  });

  it('returns 404 for non-existent column', async () => {
    const req = new NextRequest('http://localhost:3000/api/columns?projectId=p1&id=nonexistent', {
      method: 'DELETE',
    });
    const res = await DELETE(req);
    expect(res.status).toBe(404);
  });
});

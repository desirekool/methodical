import { NextRequest } from 'next/server';
import { describe, it, expect, beforeAll } from 'vitest';
import { reseed } from '../../../../test/api-setup';

let GET: any, POST: any;

beforeAll(async () => {
  reseed();
  const mod = await import('../route');
  GET = mod.GET;
  POST = mod.POST;
});

describe('GET /api/tasks', () => {
  it('returns all tasks', async () => {
    const req = new NextRequest('http://localhost:3000/api/tasks');
    const res = await GET(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThanOrEqual(4);
  });

  it('filters tasks by projectId', async () => {
    const req = new NextRequest('http://localhost:3000/api/tasks?projectId=p1');
    const res = await GET(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.every((t: { projectId: string }) => t.projectId === 'p1')).toBe(true);
  });
});

describe('POST /api/tasks', () => {
  it('creates a new task', async () => {
    const body = {
      id: 'test-1',
      title: 'Test task',
      description: 'A test task',
      status: 'todo',
      projectId: 'p1',
      sprintId: 's1',
      points: 3,
      category: 'Engineering',
      labels: ['Test'],
      creatorId: 'm1',
      assigneeId: 'm2',
      dueDate: 'Dec 1, 2023',
      order: 10,
    };
    const req = new NextRequest('http://localhost:3000/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const res = await POST(req);
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.id).toBe('test-1');
    expect(data.title).toBe('Test task');
    expect(data.projectId).toBe('p1');
  });
});

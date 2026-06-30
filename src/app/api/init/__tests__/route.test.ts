import { describe, it, expect, beforeAll } from 'vitest';
import { reseed } from '../../../../test/api-setup';

let GET: any;

beforeAll(async () => {
  reseed();
  const mod = await import('../route');
  GET = mod.GET;
});

describe('GET /api/init', () => {
  it('returns all entities needed for app bootstrap', async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    const data = await res.json();

    expect(data).toHaveProperty('projects');
    expect(data).toHaveProperty('columns');
    expect(data).toHaveProperty('members');
    expect(data).toHaveProperty('teams');
    expect(data).toHaveProperty('teamMembers');
    expect(data).toHaveProperty('sprints');
    expect(data).toHaveProperty('tasks');
    expect(data).toHaveProperty('checklistItems');
    expect(data).toHaveProperty('attachments');
    expect(data).toHaveProperty('comments');
    expect(data).toHaveProperty('activities');

    expect(data.projects.length).toBe(3);
    expect(data.members.length).toBe(3);
    expect(data.teams.length).toBe(2);
    expect(data.tasks.length).toBe(4);
    expect(data.columns.length).toBe(9);
    expect(data.sprints.length).toBe(2);
  });
});

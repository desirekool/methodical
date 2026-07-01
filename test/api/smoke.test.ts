import { describe, it, expect } from 'vitest';

describe('smoke', () => {
  it('db module loads', async () => {
    const mod = await import('@/server/db');
    expect(mod.db).toBeDefined();
  });

  it('tasks route loads', async () => {
    const mod = await import('@/app/api/tasks/route');
    expect(mod.GET).toBeDefined();
    expect(mod.POST).toBeDefined();
  });

  it('columns route loads', async () => {
    const mod = await import('@/app/api/columns/route');
    expect(mod.POST).toBeDefined();
    expect(mod.PUT).toBeDefined();
    expect(mod.DELETE).toBeDefined();
  });

  it('projects route loads', async () => {
    const [mod, modId] = await Promise.all([
      import('@/app/api/projects/route'),
      import('@/app/api/projects/[id]/route'),
    ]);
    expect(mod.POST).toBeDefined();
    expect(modId.DELETE).toBeDefined();
  });

  it('members route loads', async () => {
    const [mod, modId] = await Promise.all([
      import('@/app/api/members/route'),
      import('@/app/api/members/[id]/route'),
    ]);
    expect(mod.POST).toBeDefined();
    expect(modId.PUT).toBeDefined();
    expect(modId.DELETE).toBeDefined();
  });

  it('teams route loads', async () => {
    const [mod, modId] = await Promise.all([
      import('@/app/api/teams/route'),
      import('@/app/api/teams/[id]/route'),
    ]);
    expect(mod.POST).toBeDefined();
    expect(modId.PUT).toBeDefined();
    expect(modId.DELETE).toBeDefined();
  });
});

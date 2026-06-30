import { describe, it, expect } from 'vitest';

describe('smoke', () => {
  it('db module loads', async () => {
    const mod = await import('@/server/db');
    expect(mod.db).toBeDefined();
  });

  it('tasks route loads', async () => {
    const mod = await import('../tasks/route');
    expect(mod.GET).toBeDefined();
    expect(mod.POST).toBeDefined();
  });

  it('columns route loads', async () => {
    const mod = await import('../columns/route');
    expect(mod.POST).toBeDefined();
    expect(mod.PUT).toBeDefined();
    expect(mod.DELETE).toBeDefined();
  });

  it('projects route loads', async () => {
    const mod = await import('../projects/route');
    expect(mod.POST).toBeDefined();
    expect(mod.DELETE).toBeDefined();
  });

  it('members route loads', async () => {
    const [mod, modId] = await Promise.all([
      import('../members/route'),
      import('../members/[id]/route'),
    ]);
    expect(mod.POST).toBeDefined();
    expect(modId.PUT).toBeDefined();
    expect(modId.DELETE).toBeDefined();
  });

  it('teams route loads', async () => {
    const [mod, modId] = await Promise.all([
      import('../teams/route'),
      import('../teams/[id]/route'),
    ]);
    expect(mod.POST).toBeDefined();
    expect(modId.PUT).toBeDefined();
    expect(modId.DELETE).toBeDefined();
  });
});

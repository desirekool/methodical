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
});

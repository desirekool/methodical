import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';

const TEST_DB_PATH = path.resolve(__dirname, '../test-api.db');
const ROOT = path.resolve(__dirname, '..');

for (const f of [TEST_DB_PATH, TEST_DB_PATH + '-wal', TEST_DB_PATH + '-shm']) {
  try { fs.unlinkSync(f); } catch {}
}

process.env.DATABASE_URL = TEST_DB_PATH;

const env = { ...process.env, DATABASE_URL: TEST_DB_PATH };

try {
  execSync('npx --yes drizzle-kit push --config=drizzle.config.ts', { env, cwd: ROOT, stdio: 'pipe' });
} catch {
  // tables already exist — proceed to seed
}

execSync('npx tsx src/server/db/seed.ts', {
  env: { ...process.env, DATABASE_URL: TEST_DB_PATH },
  cwd: ROOT, stdio: 'pipe',
});

export function reseed() {
  execSync('npx tsx src/server/db/seed.ts', {
    env: { ...process.env, DATABASE_URL: TEST_DB_PATH },
    cwd: ROOT, stdio: 'pipe',
  });
}

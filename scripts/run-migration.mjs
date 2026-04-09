import fs from 'node:fs';
import path from 'node:path';
import postgres from 'postgres';
import { loadEnvConfig } from '../utils/loadEnv.mjs';

const workspaceRoot = process.cwd();
const migrationsDir = path.join(workspaceRoot, 'db', 'migrations');

const env = loadEnvConfig(workspaceRoot);
const databaseUrl = process.env.DATABASE_URL || env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is missing from .env or .env.local');
}

const sql = postgres(databaseUrl, { max: 1, prepare: false });

try {
  const files = process.env.MIGRATION_FILE
    ? [path.resolve(workspaceRoot, process.env.MIGRATION_FILE)]
    : fs.readdirSync(migrationsDir)
        .filter((file) => file.endsWith('.sql'))
        .sort()
        .map((file) => path.join(migrationsDir, file));

  for (const filePath of files) {
    const migrationSql = fs.readFileSync(filePath, 'utf8');
    await sql.unsafe(migrationSql);
    console.log(`Migration applied successfully: ${path.relative(workspaceRoot, filePath)}`);
  }
} finally {
  await sql.end();
}
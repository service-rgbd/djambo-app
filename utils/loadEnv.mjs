import fs from 'node:fs';
import path from 'node:path';

const readEnvFile = (filePath) => {
  if (!fs.existsSync(filePath)) {
    return {};
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const values = {};

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) {
      continue;
    }

    const separatorIndex = line.indexOf('=');
    if (separatorIndex === -1) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    const value = line.slice(separatorIndex + 1).trim();
    values[key] = value;
  }

  return values;
};

export const loadEnvConfig = (workspaceRoot) => {
  const merged = {};
  const envFiles = [
    path.join(workspaceRoot, '.env'),
    path.join(workspaceRoot, '.env.local'),
  ];

  for (const envFile of envFiles) {
    Object.assign(merged, readEnvFile(envFile));
  }

  for (const [key, value] of Object.entries(process.env)) {
    if (value !== undefined && value !== '') {
      merged[key] = value;
    }
  }

  return merged;
};
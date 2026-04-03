import { existsSync } from 'node:fs';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const configuredBaseUrl = process.env.E2E_STAGING_BASE_URL?.trim();
const configuredStorageStatePath = process.env.PLAYWRIGHT_STORAGE_STATE?.trim();

export const DEFAULT_STAGING_BASE_URL =
  configuredBaseUrl || 'https://staging.webbrief.co.kr';

export const STAGING_AUTH_DIR = path.resolve(process.cwd(), '.playwright', 'staging-auth');

export const STAGING_AUTH_STORAGE_STATE_PATH = configuredStorageStatePath
  ? path.resolve(process.cwd(), configuredStorageStatePath)
  : path.join(STAGING_AUTH_DIR, 'storage-state.json');

export async function ensureStagingAuthDir() {
  await mkdir(path.dirname(STAGING_AUTH_STORAGE_STATE_PATH), { recursive: true });
}

export function resolveStagingStorageState() {
  return existsSync(STAGING_AUTH_STORAGE_STATE_PATH)
    ? STAGING_AUTH_STORAGE_STATE_PATH
    : undefined;
}

export function assertStagingStorageStateExists() {
  if (!existsSync(STAGING_AUTH_STORAGE_STATE_PATH)) {
    throw new Error(
      `Missing staging storage state at ${STAGING_AUTH_STORAGE_STATE_PATH}. Run \`npm run e2e:web:staging:setup\` first.`,
    );
  }
}

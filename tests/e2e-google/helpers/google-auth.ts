import { mkdir, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import type { Locator, Page } from '@playwright/test';

export const GOOGLE_AUTH_DIR = path.resolve(
  process.cwd(),
  '.playwright',
  'google-auth',
);
export const GOOGLE_AUTH_STORAGE_STATE_PATH = path.join(
  GOOGLE_AUTH_DIR,
  'storage-state.json',
);
const ROOT_ENV_LOCAL_PATH = path.resolve(process.cwd(), '.env.local');
const SERVER_ENV_LOCAL_PATH = path.resolve(process.cwd(), 'server', '.env.local');

type EnvRecord = Record<string, string>;

async function parseEnvFile(filePath: string): Promise<EnvRecord> {
  try {
    const raw = await readFile(filePath, 'utf8');
    const env: EnvRecord = {};

    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;

      const separatorIndex = trimmed.indexOf('=');
      if (separatorIndex < 0) continue;

      const key = trimmed.slice(0, separatorIndex).trim();
      const value = trimmed
        .slice(separatorIndex + 1)
        .trim()
        .replace(/^['"]|['"]$/g, '');
      env[key] = value;
    }

    return env;
  } catch {
    return {};
  }
}

export async function readGoogleOAuthConfig() {
  const [rootEnvLocal, serverEnvLocal] = await Promise.all([
    parseEnvFile(ROOT_ENV_LOCAL_PATH),
    parseEnvFile(SERVER_ENV_LOCAL_PATH),
  ]);

  return {
    frontendGoogleClientId:
      process.env.VITE_GOOGLE_CLIENT_ID?.trim() || rootEnvLocal.VITE_GOOGLE_CLIENT_ID || '',
    backendGoogleClientId:
      process.env.GOOGLE_CLIENT_ID?.trim() || serverEnvLocal.GOOGLE_CLIENT_ID || '',
  };
}

export async function assertGoogleOAuthConfigured() {
  const { frontendGoogleClientId, backendGoogleClientId } =
    await readGoogleOAuthConfig();

  if (!frontendGoogleClientId) {
    throw new Error(
      `Missing VITE_GOOGLE_CLIENT_ID. Set it in ${ROOT_ENV_LOCAL_PATH}.`,
    );
  }

  if (!backendGoogleClientId) {
    throw new Error(
      `Missing GOOGLE_CLIENT_ID. Set it in ${SERVER_ENV_LOCAL_PATH}.`,
    );
  }

  if (frontendGoogleClientId !== backendGoogleClientId) {
    throw new Error(
      `Google client IDs do not match between ${ROOT_ENV_LOCAL_PATH} and ${SERVER_ENV_LOCAL_PATH}.`,
    );
  }
}

export async function ensureGoogleAuthDir() {
  await mkdir(GOOGLE_AUTH_DIR, { recursive: true });
}

export function assertGoogleStorageStateExists() {
  if (!existsSync(GOOGLE_AUTH_STORAGE_STATE_PATH)) {
    throw new Error(
      `Missing Google OAuth storage state at ${GOOGLE_AUTH_STORAGE_STATE_PATH}. Run \`npm run e2e:web:google:setup\` first.`,
    );
  }
}

async function tryClick(locator: Locator) {
  const count = await locator.count();
  if (count === 0) {
    return false;
  }

  await locator.first().click();
  return true;
}

export async function clickGoogleSignInButton(page: Page) {
  const directButton = page.getByRole('button', { name: /google/i });
  if (await tryClick(directButton)) {
    return;
  }

  const iframeCandidates = [
    'iframe[title*="Google"]',
    'iframe[title*="google"]',
    'iframe[src*="accounts.google.com"]',
  ];

  for (const selector of iframeCandidates) {
    const frame = page.frameLocator(selector);
    if (await tryClick(frame.getByRole('button'))) {
      return;
    }
    if (await tryClick(frame.locator('[role="button"]'))) {
      return;
    }
    if (await tryClick(frame.locator('div[role="button"]'))) {
      return;
    }
  }

  throw new Error(
    'Google 로그인 버튼을 찾지 못했습니다. 랜딩 페이지에 Google 버튼이 렌더되는지 확인하세요.',
  );
}

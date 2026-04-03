import { spawn } from 'node:child_process';
import net from 'node:net';
import readline from 'node:readline';
import { setTimeout as delay } from 'node:timers/promises';

const ROOT_CWD = process.cwd();
const SERVER_CWD = `${ROOT_CWD}/server`;
const API_PORT = Number(process.env.E2E_API_PORT || 3101);
const WEB_PORT = Number(process.env.E2E_WEB_PORT || 4173);
const STARTUP_TIMEOUT_MS = 120000;

function prefixStream(stream, label) {
  const rl = readline.createInterface({ input: stream });
  rl.on('line', (line) => {
    process.stdout.write(`[${label}] ${line}\n`);
  });
}

function spawnCommand(command, args, cwd, label, env = process.env) {
  const child = spawn(command, args, {
    cwd,
    env,
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  prefixStream(child.stdout, label);
  prefixStream(child.stderr, label);

  child.on('error', (error) => {
    process.stderr.write(`[${label}] ${error.message}\n`);
  });

  return child;
}

function waitForExit(child, label) {
  return new Promise((resolve) => {
    child.on('exit', (code, signal) => {
      resolve({ label, code: code ?? 0, signal });
    });
  });
}

async function fetchWithTimeout(url, timeoutMs) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

async function waitForTcpConnection(host, port, timeoutMs) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    try {
      await new Promise((resolve, reject) => {
        const socket = net.createConnection({ host, port }, () => {
          socket.end();
          resolve(undefined);
        });

        socket.on('error', reject);
        socket.setTimeout(1500, () => {
          socket.destroy();
          reject(new Error('timeout'));
        });
      });
      return;
    } catch {
      await delay(1000);
    }
  }

  throw new Error(`Timed out waiting for ${host}:${port}`);
}

async function waitForHttp(url, timeoutMs) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetchWithTimeout(url, 1500);
      if (response.ok) {
        return;
      }
    } catch {
      // Keep polling until the service is available.
    }

    await delay(1000);
  }

  throw new Error(`Timed out waiting for ${url}`);
}

async function runCommand(command, args, cwd, label, env) {
  const child = spawnCommand(command, args, cwd, label, env);
  const result = await waitForExit(child, label);

  if (result.code !== 0) {
    throw new Error(`${label} exited with code ${result.code}`);
  }
}

async function main() {
  const playwrightArgs = process.argv.slice(2);
  const e2eEnv = {
    ...process.env,
    NODE_ENV: 'test',
    E2E_TEST_MODE: 'true',
    PORT: String(API_PORT),
    FRONTEND_URL: `http://127.0.0.1:${WEB_PORT}`,
    VITE_API_URL: `http://127.0.0.1:${API_PORT}`,
    E2E_API_URL: `http://127.0.0.1:${API_PORT}`,
    E2E_WEB_BASE_URL: `http://127.0.0.1:${WEB_PORT}`,
    DATABASE_URL:
      process.env.E2E_DATABASE_URL ||
      'postgresql://postgres:postgres@127.0.0.1:5432/spec_gen_dev?schema=e2e',
    REDIS_HOST: process.env.REDIS_HOST || '127.0.0.1',
    REDIS_PORT: process.env.REDIS_PORT || '6379',
    REDIS_DB: process.env.REDIS_DB || '1',
    JWT_SECRET:
      process.env.JWT_SECRET || 'e2e-test-secret-key-e2e-test-secret-key',
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || 'e2e-google-client-id',
    ADMIN_GOOGLE_EMAILS:
      process.env.ADMIN_GOOGLE_EMAILS || 'e2e-admin@example.com',
  };

  await runCommand('docker', ['compose', 'up', '-d'], ROOT_CWD, 'infra', e2eEnv);
  await waitForTcpConnection('127.0.0.1', 5432, STARTUP_TIMEOUT_MS);
  await waitForTcpConnection('127.0.0.1', 6379, STARTUP_TIMEOUT_MS);

  await runCommand('npm', ['run', 'test:e2e:reset'], SERVER_CWD, 'db-reset', e2eEnv);
  await runCommand('npm', ['run', 'test:e2e:seed'], SERVER_CWD, 'db-seed', e2eEnv);
  await runCommand('npm', ['run', 'test:e2e:server'], SERVER_CWD, 'server-e2e', e2eEnv);
  await runCommand('npm', ['run', 'test:e2e:reset'], SERVER_CWD, 'db-reset-2', e2eEnv);
  await runCommand('npm', ['run', 'test:e2e:seed'], SERVER_CWD, 'db-seed-2', e2eEnv);
  await runCommand('npm', ['run', 'build'], SERVER_CWD, 'api-build', e2eEnv);

  const backend = spawnCommand('npm', ['run', 'start'], SERVER_CWD, 'api', e2eEnv);
  const backendExit = waitForExit(backend, 'api');

  try {
    await Promise.race([
      waitForHttp(`http://127.0.0.1:${API_PORT}/health`, STARTUP_TIMEOUT_MS),
      backendExit.then(({ code }) => {
        throw new Error(`api exited early with code ${code}`);
      }),
    ]);
  } catch (error) {
    backend.kill('SIGTERM');
    throw error;
  }

  const frontend = spawnCommand(
    'npm',
    ['run', 'dev', '--', '--host', '127.0.0.1', '--port', String(WEB_PORT), '--strictPort'],
    ROOT_CWD,
    'web',
    e2eEnv,
  );
  const frontendExit = waitForExit(frontend, 'web');

  const shutdown = async (exitCode = 0) => {
    frontend.kill('SIGTERM');
    backend.kill('SIGTERM');
    process.exit(exitCode);
  };

  process.on('SIGINT', () => void shutdown(0));
  process.on('SIGTERM', () => void shutdown(0));

  try {
    await Promise.race([
      waitForHttp(`http://127.0.0.1:${WEB_PORT}`, STARTUP_TIMEOUT_MS),
      frontendExit.then(({ code }) => {
        throw new Error(`web exited early with code ${code}`);
      }),
    ]);

    await runCommand(
      'npx',
      ['playwright', 'test', ...playwrightArgs],
      ROOT_CWD,
      'playwright',
      e2eEnv,
    );
  } finally {
    frontend.kill('SIGTERM');
    backend.kill('SIGTERM');
  }
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exit(1);
  });

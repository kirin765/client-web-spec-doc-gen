import { spawn } from 'node:child_process';
import net from 'node:net';
import readline from 'node:readline';
import { setTimeout as delay } from 'node:timers/promises';

const ROOT_CWD = process.cwd();
const BACKEND_PORT = Number(process.env.BACKEND_PORT || process.env.PORT || 3001);
const FRONTEND_PORT = Number(process.env.FRONTEND_PORT || 5173);
const STARTUP_TIMEOUT_MS = 120000;

function prefixStream(stream, label) {
  const rl = readline.createInterface({ input: stream });
  rl.on('line', (line) => {
    process.stdout.write(`[${label}] ${line}\n`);
  });
}

function spawnCommand(command, args, cwd, label) {
  const child = spawn(command, args, {
    cwd,
    env: process.env,
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
      // Fall back to polling; the service may still be starting.
    }

    await delay(1000);
  }

  throw new Error(`Timed out waiting for ${host}:${port}`);
}

async function waitForHttpHealth(host, port, timeoutMs) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetchWithTimeout(`http://${host}:${port}/health`, 1500);
      if (response.ok) {
        return;
      }
    } catch {
      // Fall back to polling; the server may still be starting.
    }

    await delay(1000);
  }

  throw new Error(`Timed out waiting for http://${host}:${port}/health`);
}

async function runCommand(command, args, cwd, label) {
  const child = spawnCommand(command, args, cwd, label);
  const result = await waitForExit(child, label);

  if (result.code !== 0) {
    throw new Error(`${label} exited with code ${result.code}`);
  }
}

async function main() {
  const backendCwd = `${ROOT_CWD}/server`;
  const backendStartScript = process.env.BACKEND_START_SCRIPT?.trim() || 'start:dev';

  await waitForTcpConnection('127.0.0.1', 5432, STARTUP_TIMEOUT_MS);
  await waitForTcpConnection('127.0.0.1', 6379, STARTUP_TIMEOUT_MS);
  await runCommand('npm', ['run', 'prisma:generate'], backendCwd, 'prisma');
  await runCommand('npm', ['run', 'prisma:migrate:deploy'], backendCwd, 'migrate');

  const backend = spawnCommand('npm', ['run', backendStartScript], backendCwd, 'api');
  const backendExit = waitForExit(backend, 'api');

  try {
    await Promise.race([
      waitForHttpHealth('127.0.0.1', BACKEND_PORT, STARTUP_TIMEOUT_MS),
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
    ['run', 'dev', '--', '--host', '0.0.0.0', '--port', String(FRONTEND_PORT), '--strictPort'],
    ROOT_CWD,
    'web',
  );
  const frontendExit = waitForExit(frontend, 'web');

  const shutdown = async (exitCode = 0) => {
    frontend.kill('SIGTERM');
    backend.kill('SIGTERM');
    process.exit(exitCode);
  };

  process.on('SIGINT', () => void shutdown(0));
  process.on('SIGTERM', () => void shutdown(0));

  const result = await Promise.race([frontendExit, backendExit]);

  frontend.kill('SIGTERM');
  backend.kill('SIGTERM');

  if (result.code !== 0) {
    process.stderr.write(`[${result.label}] exited with code ${result.code}\n`);
    process.exit(result.code);
  }
}

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exit(1);
});

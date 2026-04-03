import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';

const serverDir = process.cwd();
const envLocalPath = path.join(serverDir, '.env.local');

async function loadEnvLocal() {
  try {
    const raw = await readFile(envLocalPath, 'utf8');
    const parsed = {};

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
      parsed[key] = value;
    }

    return parsed;
  } catch {
    return {};
  }
}

async function main() {
  const [command, ...args] = process.argv.slice(2);

  if (!command) {
    process.stderr.write('Command is required\n');
    process.exit(1);
  }

  const envLocal = await loadEnvLocal();
  const child = spawn(command, args, {
    cwd: serverDir,
    env: {
      ...envLocal,
      ...process.env,
    },
    stdio: 'inherit',
  });

  child.on('exit', (code, signal) => {
    if (signal) {
      process.kill(process.pid, signal);
      return;
    }

    process.exit(code ?? 0);
  });
}

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exit(1);
});

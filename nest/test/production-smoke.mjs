import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { mkdtemp, rmdir } from 'node:fs/promises';
import { createServer } from 'node:net';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { setTimeout as delay } from 'node:timers/promises';

const reservation = createServer();
await new Promise((resolve) => reservation.listen(0, '127.0.0.1', resolve));
const port = reservation.address().port;
await new Promise((resolve, reject) =>
  reservation.close((error) => (error ? reject(error) : resolve())),
);

// A separate working directory proves the built service does not read root fixtures or .env.
const cwd = await mkdtemp(join(tmpdir(), 'susi-air-smoke-'));
const child = spawn(
  process.execPath,
  [fileURLToPath(new URL('../dist/main.js', import.meta.url))],
  {
    cwd,
    windowsHide: true,
    env: {
      ...process.env,
      NODE_ENV: 'production',
      PORT: String(port),
      JWT_SECRET: randomBytes(32).toString('hex'),
      CORS_ORIGINS: 'http://localhost:3000',
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  },
);
let logs = '';
child.stdout.on('data', (chunk) => {
  logs += chunk;
});
child.stderr.on('data', (chunk) => {
  logs += chunk;
});
const closed = new Promise((resolve, reject) => {
  child.once('error', reject);
  child.once('close', resolve);
});
const baseUrl = `http://127.0.0.1:${port}`;

try {
  let ready = false;
  for (let attempt = 0; attempt < 100; attempt++) {
    if (child.exitCode !== null)
      throw new Error(`Production server exited before startup:\n${logs}`);
    try {
      ready = (await fetch(`${baseUrl}/pilot/me`)).status === 401;
    } catch {
      /* The process may still be starting. */
    }
    if (ready) break;
    await delay(100);
  }
  assert.ok(ready, `Production server did not become ready:\n${logs}`);
  const login = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'johndoe', password: 'susiairtest' }),
  });
  assert.equal(login.status, 200);
  const { accessToken } = await login.json();
  async function get(path) {
    const response = await fetch(`${baseUrl}${path}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    assert.equal(response.status, 200, path);
    return response.json();
  }
  assert.equal((await get('/pilot/me')).totalFlightHours, 1444.5);
  assert.deepEqual(
    (await get('/flight-hours?from=2026-05-15&to=2026-05-15')).days,
    [{ date: '2026-05-15', hours: 6.4 }],
  );
  const summary = await get('/flight-hours/summary?range=1w');
  assert.deepEqual(
    summary.cards.map((card) => card.hours),
    [6.4, 25.2, 87.2, 1013.8],
  );
  assert.equal(summary.chart.points.length, 15);
  assert.equal(summary.chart.peak.rollingHours, 44.7);
  assert.equal((await get('/documents')).documents[2].status, 'soon');
  assert.equal(
    (await get('/schedules?year=2026&month=05')).schedules.length,
    21,
  );
  console.log(
    `Production smoke passed on ${process.version}: six endpoints and bundled JSON assets.`,
  );
} finally {
  child.kill();
  await closed;
  await rmdir(cwd);
}

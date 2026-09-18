import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mkdtempSync, mkdirSync, copyFileSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { notifications, sendNotifications } from './notify.mjs';

const pkg = { name: '@designfever/web-review-kit', version: '1.2.3' };
const env = { JANDI_WEBHOOK_URL: 'https://example.com/jandi-secret', DISCORD_WEBHOOK_URL: 'https://example.com/discord-secret' };

test('validates both destinations and message length before publishing', () => {
  assert.throws(() => notifications(pkg, 'memo', {}), /JANDI_WEBHOOK_URL/);
  assert.throws(() => notifications(pkg, 'memo', { ...env, DISCORD_WEBHOOK_URL: 'http://example.com' }), /DISCORD_WEBHOOK_URL/);
  assert.throws(() => notifications(pkg, ' ', env), /memo/);
  assert.throws(() => notifications(pkg, 'a'.repeat(2000), env), /2000/);
});

test('sends one correctly escaped request to each service with mentions disabled', async () => {
  const memo = 'Fixed "save"\n한글 \\ @everyone';
  const calls = [];
  assert.equal(await sendNotifications(notifications(pkg, memo, env, new Date('2026-09-18T07:00:00Z')), async (url, options) => {
    calls.push({ url, ...options });
    return new Response(null, { status: 204 });
  }), true);
  assert.equal(calls.length, 2);
  assert.equal(calls[0].headers.Accept, 'application/vnd.tosslab.jandi-v2+json');
  const jandi = JSON.parse(calls[0].body);
  const discord = JSON.parse(calls[1].body);
  const embed = discord.embeds[0];
  assert.equal(jandi.body, embed.title);
  assert.equal(jandi.connectColor, '#00C987');
  assert.equal(embed.color, 0xFAA61A);
  assert.equal(jandi.connectInfo.find((field) => field.title === '변경 내용').description, memo);
  assert.equal(embed.description, memo);
  assert.equal(embed.fields.find((field) => field.name === '패키지').value, pkg.name);
  assert.equal(embed.fields.find((field) => field.name === '버전').value, pkg.version);
  const time = embed.fields.find((field) => field.name === '완료 시각').value;
  assert.match(time, /16:00:00/);
  assert.match(time, /KST/);
  assert.equal(jandi.connectInfo.find((field) => field.title === '완료 시각').description, time);
  assert.ok(embed.url.endsWith(`/v/${pkg.version}`));
  assert.ok(jandi.connectInfo.find((field) => field.title === '패키지 확인').description.includes(embed.url));
  assert.equal(discord.content, undefined);
  assert.deepEqual(discord.allowed_mentions, { parse: [] });
  assert.equal(calls[1].url.searchParams.get('wait'), 'true');
  for (const call of calls) {
    assert.equal(call.method, 'POST');
    assert.equal(call.redirect, 'error');
    assert.ok(call.signal instanceof AbortSignal);
  }
});

test('HTTP errors and timeouts still attempt the other service without retries or secret logs', async (t) => {
  const logs = [];
  t.mock.method(console, 'error', (message) => logs.push(message));
  for (const failure of [new Response(null, { status: 429 }), new Error(env.JANDI_WEBHOOK_URL)]) {
    let calls = 0;
    assert.equal(await sendNotifications(notifications(pkg, 'memo', env), async () => {
      calls++;
      if (calls === 1) {
        if (failure instanceof Error) throw failure;
        return failure;
      }
      return new Response(null, { status: 204 });
    }), false);
    assert.equal(calls, 2);
  }
  assert.ok(logs.some((message) => message.includes('HTTP 429')));
  assert.ok(logs.some((message) => message.includes('timeout')));
  assert.ok(logs.every((message) => !message.includes('secret')));
});

test('release shell stops on failed checks/publish and notifies only after success', () => {
  const directory = mkdtempSync(join(tmpdir(), 'review-release-'));
  try {
    mkdirSync(join(directory, 'scripts'));
    mkdirSync(join(directory, 'bin'));
    copyFileSync(new URL('../release.sh', import.meta.url), join(directory, 'scripts/release.sh'));
    const stub = '#!/bin/bash\ncommand="$(basename "$0") $*"\nprintf "%s\\n" "$command" >> "$RELEASE_TEST_LOG"\n[[ "$command" != "$RELEASE_TEST_FAIL" ]]\n';
    for (const command of ['node', 'pnpm', 'npm']) writeFileSync(join(directory, 'bin', command), stub, { mode: 0o755 });
    const expected = ['node --env-file-if-exists=.env.release scripts/release/notify.mjs check memo', 'pnpm test', 'pnpm test:release', 'pnpm typecheck', 'pnpm build', 'npm publish --access public --ignore-scripts', 'node --env-file-if-exists=.env.release scripts/release/notify.mjs send memo'];
    for (const fail of ['', ...expected]) {
      const log = join(directory, 'commands');
      writeFileSync(log, '');
      const result = spawnSync('bash', [join(directory, 'scripts/release.sh'), '--', 'memo'], {
        env: { ...process.env, PATH: `${join(directory, 'bin')}:${process.env.PATH}`, RELEASE_TEST_LOG: log, RELEASE_TEST_FAIL: fail },
        encoding: 'utf8',
      });
      assert.equal(result.status, fail ? 1 : 0);
      assert.deepEqual(readFileSync(log, 'utf8').trim().split('\n'), fail ? expected.slice(0, expected.indexOf(fail) + 1) : expected);
      if (fail === expected.at(-1)) assert.match(result.stderr, /npm publish succeeded/);
    }
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

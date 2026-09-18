import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

export function notifications(pkg, memo, env, completedAt = new Date()) {
  if (!memo?.trim()) throw new Error('A release memo is required.');
  const content = `${pkg.name}@${pkg.version} released\n${memo}\nhttps://www.npmjs.com/package/${pkg.name}/v/${pkg.version}`;
  if (content.length > 2000) throw new Error('Release message exceeds 2000 characters. Shorten the memo.');
  const packageUrl = `https://www.npmjs.com/package/${pkg.name}/v/${pkg.version}`;
  const time = new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul', dateStyle: 'medium', timeStyle: 'medium', hour12: false,
  }).format(completedAt) + ' (KST)';

  return [
    {
      name: 'JANDI', key: 'JANDI_WEBHOOK_URL',
      headers: { Accept: 'application/vnd.tosslab.jandi-v2+json' },
      payload: {
        body: '📦 Review Kit 릴리즈 완료',
        connectColor: '#00C987',
        connectInfo: [
          { title: '패키지', description: pkg.name },
          { title: '버전', description: pkg.version },
          { title: '변경 내용', description: memo },
          { title: '완료 시각', description: time },
          { title: '패키지 확인', description: `[npm에서 확인](${packageUrl})` },
        ],
      },
    },
    {
      name: 'Discord', key: 'DISCORD_WEBHOOK_URL', headers: {},
      payload: {
        allowed_mentions: { parse: [] },
        embeds: [{
          title: '📦 Review Kit 릴리즈 완료',
          url: packageUrl,
          color: 0xFAA61A,
          description: memo,
          fields: [
            { name: '패키지', value: pkg.name },
            { name: '버전', value: pkg.version },
            { name: '완료 시각', value: time },
          ],
          footer: { text: 'Designfever · npm release' },
        }],
      },
    },
  ].map((destination) => {
    let url;
    try {
      url = new URL(env[destination.key]);
      if (url.protocol !== 'https:' || url.username || url.password) throw new Error();
    } catch {
      throw new Error(`${destination.key} must be a valid HTTPS webhook URL.`);
    }
    if (destination.name === 'Discord') url.searchParams.set('wait', 'true');
    return { ...destination, url };
  });
}

export async function sendNotifications(destinations, fetcher = fetch) {
  let failed = false;
  for (const destination of destinations) {
    let response;
    try {
      response = await fetcher(destination.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...destination.headers },
        body: JSON.stringify(destination.payload),
        signal: AbortSignal.timeout(10_000),
        redirect: 'error',
      });
    } catch {
      // Fetch errors can contain the secret URL. Never print the error object.
      console.error(`${destination.name}: network error or timeout; delivery is uncertain.`);
      failed = true;
      continue;
    }
    if (!response.ok) {
      console.error(`${destination.name}: HTTP ${response.status}.`);
      failed = true;
    } else {
      console.log(`${destination.name}: notification sent.`);
    }
    await response.body?.cancel();
  }
  return !failed;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const [mode, memo] = process.argv.slice(2);
    if (!['check', 'send'].includes(mode)) throw new Error('Expected check or send.');
    const pkg = JSON.parse(readFileSync(new URL('../../package.json', import.meta.url), 'utf8'));
    const destinations = notifications(pkg, memo, process.env);
    if (mode === 'send' && !await sendNotifications(destinations)) process.exitCode = 1;
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}

// Optional browser check: bring Puppeteer + Chrome; no package runtime dependency.
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
const { default: puppeteer } = await import(process.env.PUPPETEER_MODULE || 'puppeteer');
const base = new URL(process.env.REVIEW_BASE_URL || 'http://127.0.0.1:5177');
assert.ok(['127.0.0.1', 'localhost'].includes(base.hostname), 'Use a local fixture server');
const output = process.env.REVIEW_EVIDENCE_DIR && resolve(process.env.REVIEW_EVIDENCE_DIR);
if (output) await mkdir(output, { recursive: true });
let browser = await puppeteer.launch({ headless: true,
  ...(process.env.CHROME_BIN ? { executablePath: process.env.CHROME_BIN } : {}) });
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 1000 });
await page.setRequestInterception(true);
const blocked = [];
page.on('request', request => {
  const url = new URL(request.url());
  if (['http:', 'https:'].includes(url.protocol) && url.origin !== base.origin) {
    blocked.push(request.method()); // Never log external URLs or credentials.
    void request.abort();
  } else void request.continue();
});
const errors = [];
page.on('pageerror', error => errors.push(error.name));
const result = { checks: [], viewports: [] };
const editor = '[data-qa-id="portal-editor"]';
const input = `${editor} input[type="text"]`;
const heading = '[data-qa-id="portal-preview-text"]';
const open = 'button[aria-label="Show Preview editor"]';
const close = 'button[aria-label="Hide Preview editor"]';
const target = () => page.frames().find(frame => frame !== page.mainFrame() && frame.url().startsWith(base.origin));
// Do not retain CDP element handles: they would keep old portal DOM alive and
// invalidate the collection assertion below.
const waitForSelector = async (...args) => {
  const handle = await page.waitForSelector(...args);
  await handle?.dispose();
};
const waitEditor = async () => {
  await waitForSelector(input);
  assert.equal(await page.$$eval(editor, nodes => nodes.length), 1);
};
const showEditor = async () => {
  if (await page.evaluate(selector => Boolean(document.querySelector(selector)), open)) await page.click(open);
  await waitForSelector(input, { visible: true });
};
const navigate = async path => {
  await page.locator('input[aria-label="Path"]').fill(path);
  await page.keyboard.press('Enter');
};
try {
  await page.goto(`${base.origin}/components/`, { waitUntil: 'networkidle0' });
  await waitForSelector(input);
  await page.locator(input).fill('Standalone edit');
  await page.$eval(`${editor} input[type="color"]`, node => {
    node.value = '#ff8844'; node.dispatchEvent(new Event('input', { bubbles: true }));
  });
  await page.waitForFunction(selector => document.querySelector(selector).textContent === 'Standalone edit', {}, heading);
  assert.equal(await page.$eval(heading, node => getComputedStyle(node).color), 'rgb(255, 136, 68)');
  assert.equal(await page.evaluate(() => {
    const panel = document.querySelector('.dev-portal-local-panel').getBoundingClientRect();
    return panel.left >= document.querySelector('.dev-portal-preview').getBoundingClientRect().right - 1;
  }), true);
  const background = await page.$eval(editor, node => getComputedStyle(node).backgroundColor);
  result.checks.push('standalone right-side editor: text/color');
  if (output) await page.screenshot({ path: `${output}/standalone.png` });

  await page.goto(`${base.origin}/review/?target=/components/&w=768&h=1024&source=local`, { waitUntil: 'networkidle0' });
  await waitEditor(); await showEditor();
  await page.locator(input).fill('Keyboard edit');
  assert.equal(await page.$eval(input, node => document.activeElement === node), true);
  await page.keyboard.press('Tab');
  assert.equal(await page.$eval(`${editor} input[type="color"]`, node => document.activeElement === node), true);
  await page.$eval(`${editor} input[type="color"]`, node => {
    node.value = '#22cc88'; node.dispatchEvent(new Event('input', { bubbles: true }));
  });
  await target().waitForFunction(selector => document.querySelector(selector).textContent === 'Keyboard edit', {}, heading);
  assert.equal(await target().$eval(heading, node => getComputedStyle(node).color), 'rgb(34, 204, 136)');
  assert.equal(await page.$eval(editor, node => getComputedStyle(node).backgroundColor), background);
  assert.equal(await target().$$eval(editor, nodes => nodes.length), 0);
  await page.$eval(input, node => { window.__sameInput = node; });
  await page.click(close); await showEditor();
  for (const name of ['design inspector', 'Figma images', 'QA list', 'component list']) {
    await page.click(`button[aria-label="Show ${name}"]`);
    await waitForSelector(`button[aria-label="Hide ${name}"]`);
    assert.equal(await page.$eval(editor, node => node.closest('section').hidden), true);
    await showEditor();
    assert.equal(await page.$eval(input, node => node === window.__sameInput && node.value === 'Keyboard edit'), true);
  }
  await page.evaluate(() => { delete window.__sameInput; });
  result.checks.push('focus, Tab, text/color, parent CSS; close/open and all four built-ins preserve input DOM/state');
  // Shortcuts from non-editable shell focus; custom controls must not steal them.
  for (const [key, name] of [['Digit1', 'design inspector'], ['Digit2', 'Figma images'], ['Digit3', 'QA list'], ['Digit4', 'component list']]) {
    await page.$eval('button[aria-label="Hide Preview editor"]', node => node.focus());
    await page.keyboard.down('Shift'); await page.keyboard.press(key); await page.keyboard.up('Shift');
    await waitForSelector(`button[aria-label="Hide ${name}"]`);
    await showEditor();
  }
  result.checks.push('Shift+1–4 preserve built-in rail actions');

  const duplicate = await target().evaluate(async () => {
    const moduleUrl = performance.getEntriesByType('resource').map(entry => entry.name)
      .find(url => new URL(url).pathname.endsWith('/src/react-shell.tsx'));
    if (!moduleUrl) throw new Error('Review Kit source module was not loaded');
    const { connectReviewCustomPanel } = await import(moduleUrl);
    const handle = connectReviewCustomPanel({ id: 'demo.preview-editor', label: 'Duplicate' });
    const snapshot = handle.getSnapshot(); handle.dispose();
    return { status: snapshot.status, reason: snapshot.reason };
  });
  assert.deepEqual(duplicate, { status: 'error', reason: 'duplicate-id' });
  await waitEditor();
  result.checks.push('public duplicate-ID rejection leaves original editor intact');

  for (const [label, width, height] of [['MO 390', 390, 844], ['MO 620', 620, 900], ['TA 768', 768, 1024], ['PC 1920', 1920, 1280]]) {
    await page.select('select[aria-label="Viewport preset"]', `${label}:${width}x${height}`);
    await target().waitForFunction(w => innerWidth === w, {}, width);
    const measure = () => target().evaluate(() => ({ width: innerWidth,
      headingWidth: document.querySelector('.dev-portal-preview').getBoundingClientRect().width,
      font: parseFloat(getComputedStyle(document.querySelector('[data-qa-id="portal-preview-text"]')).fontSize),
      mobile: matchMedia('(max-width: 620px)').matches }));
    const shown = await measure();
    await page.click(close);
    const hidden = await measure();
    assert.deepEqual(hidden, shown);
    assert.equal(shown.mobile, width <= 620);
    assert.ok(Math.abs(shown.font - Math.max(24, Math.min(width * 0.04, 40))) < 0.1);
    result.viewports.push(shown);
    await showEditor();
  }
  result.checks.push('viewport width, media query and responsive font unchanged by panel visibility at four presets');
  await page.select('select[aria-label="Viewport preset"]', 'TA 768:768x1024');
  if (output) await page.screenshot({ path: `${output}/review.png` });

  await page.evaluate(() => { window.__oldPanels = []; });
  for (let i = 0; i < 3; i++) {
    await page.$eval('.df-review-custom-panel', node => window.__oldPanels.push(new WeakRef(node)));
    await page.click('button[aria-label="Refresh target"]');
    await waitEditor();
    await page.waitForFunction(selector => document.querySelector(selector)?.value === 'Make it yours', {}, input);
    await showEditor();
    await page.locator(input).fill(`Reload cycle ${i}`);
  }
  result.checks.push('three toolbar reloads reconnect one editor and reset unsaved target state');
  // Full iframe document navigation, then fixture-owned SPA navigation.
  await navigate('/long-form/');
  await page.waitForFunction(selector => !document.querySelector(selector), {}, editor);
  await navigate('/components/'); await waitEditor(); await showEditor();
  await target().click('nav a[href="/long-form/"]');
  await page.waitForFunction(selector => !document.querySelector(selector), {}, editor);
  await target().click('nav a[href="/components/"]');
  await waitEditor(); await showEditor();
  assert.equal(await page.$eval(input, node => node.value), 'Make it yours');
  result.checks.push('full URL navigation and SPA route unmount/remount remove stale editors and reconnect once');
  // Release the automation session's remaining remote handles before measuring.
  // Otherwise DevTools itself can root elements used by locator actions.
  const endpoint = browser.wsEndpoint();
  await browser.disconnect();
  browser = await puppeteer.connect({ browserWSEndpoint: endpoint });
  const observedPage = (await browser.pages()).find(candidate => candidate.url().startsWith(base.origin));
  assert.ok(observedPage);
  const cdp = await observedPage.createCDPSession();
  await cdp.send('Runtime.discardConsoleEntries');
  await cdp.send('Log.clear');
  await cdp.send('HeapProfiler.collectGarbage');
  await cdp.send('HeapProfiler.collectGarbage');
  result.collectedOldPanels = await observedPage.evaluate(() => window.__oldPanels.filter(ref => !ref.deref()).length);
  result.detachedOldPanels = await observedPage.evaluate(() =>
    window.__oldPanels.filter(ref => !ref.deref()?.isConnected).length);
  assert.equal(result.detachedOldPanels, 3);
  // GC timing/native browser retention is not a deterministic functional contract.
  // Keep this visible in evidence; do not turn detachment into a no-leak claim.
  result.collectionObservation = result.collectedOldPanels === 3 ? 'collected' : 'inconclusive';
  result.checks.push('all three tracked old containers detached; collection reported separately');
  assert.equal(errors.length, 0);
  assert.equal(blocked.length, 0, 'Start Vite with VITE_REVIEW_SUPABASE_URL= for local-only verification');
  result.pageErrors = errors.length;
  result.externalRequests = blocked.length;
  if (output) await writeFile(`${output}/result.json`, JSON.stringify(result, null, 2));
  console.log(JSON.stringify(result, null, 2));
} finally { await browser.close(); }

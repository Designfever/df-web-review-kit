import { afterEach, beforeEach, describe, expect, it, vi, type Mock } from 'vitest';
import { createDesignInspector, type DesignInspectorMode, type DesignInspectorSession } from './index';

const rect = (left: number, top: number, width: number, height: number) => ({
  left, top, width, height, right: left + width, bottom: top + height, x: left, y: top,
  toJSON: () => ({}),
});
let queued: Map<number, FrameRequestCallback>;
let session: DesignInspectorSession | undefined;
let sequence = 0;
let frame: HTMLIFrameElement;
let container: HTMLElement;
let first: HTMLButtonElement;
let second: HTMLButtonElement;
let onModeChange: Mock<(mode: DesignInspectorMode) => void>;

const panel = () => container.querySelector('[data-df-review-design-inspector]')!.shadowRoot!;
const geometry = () => document.querySelector('[data-df-review-design-geometry]')!.shadowRoot!;
const node = <T extends HTMLElement = HTMLButtonElement>(selector: string) => panel().querySelector<T>(selector)!;
const press = (selector: string) => node(selector).click();
const select = (element: Element, options: MouseEventInit = {}) =>
  element.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, composed: true, ...options }));
async function render() {
  await Promise.resolve();
  for (let i = 0; queued.size && i < 8; i++) {
    const callbacks = [...queued.values()];
    queued.clear();
    callbacks.forEach((callback) => callback(0));
    await Promise.resolve();
  }
}
function start(options: Partial<Parameters<typeof createDesignInspector>[0]> = {}) {
  session = createDesignInspector({ container, frame, onModeChange, ...options });
  return session;
}

beforeEach(() => {
  queued = new Map();
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
    const id = ++sequence;
    queued.set(id, callback);
    return id;
  });
  vi.stubGlobal('cancelAnimationFrame', (id: number) => queued.delete(id));
  onModeChange = vi.fn();
  container = document.createElement('aside');
  frame = document.createElement('iframe');
  document.body.append(container, frame);
  for (const [key, value] of Object.entries({ offsetWidth: 1000, offsetHeight: 800, clientWidth: 1000, clientHeight: 800 })) {
    Object.defineProperty(frame, key, { value, configurable: true });
  }
  vi.spyOn(frame, 'getBoundingClientRect').mockReturnValue(rect(100, 50, 500, 400));
  const target = frame.contentDocument!;
  target.body.innerHTML = '<section><button class="first" style="font-size:16px;color:rgb(30, 40, 50)">Private page text</button><button class="second">Second</button></section>';
  first = target.querySelector('.first')!;
  second = target.querySelector('.second')!;
  vi.spyOn(first, 'getBoundingClientRect').mockReturnValue(rect(20, 40, 200, 80));
  vi.spyOn(second, 'getBoundingClientRect').mockReturnValue(rect(20, 180, 200, 80));
});

afterEach(() => {
  session?.destroy();
  session = undefined;
  document.body.replaceChildren();
  vi.unstubAllGlobals();
});

describe('embedded design inspector', () => {
  it('uses the supplied frame only and keeps the panel inside its supplied container', async () => {
    start();
    expect(onModeChange).toHaveBeenCalledExactlyOnceWith('pick');
    await render();
    expect(document.querySelectorAll('iframe')).toHaveLength(1);
    expect(panel().querySelector('iframe')).toBeNull();
    expect(panel().querySelector('.viewport-controls, .figma-controls, .move')).toBeNull();
    expect(geometry().querySelector('.canvas')).not.toBeNull();
    expect(panel().querySelector('.close')).toBeNull();
    expect(node('.identity').textContent).toBe('body');
    expect(node('.empty').hidden).toBe(true);
    expect(node('.selection').hidden).toBe(false);
  });

  it('starts in restored browse mode without intercepting the next site click', async () => {
    start({ initialMode: 'browse' });
    await render();
    expect(onModeChange).toHaveBeenLastCalledWith('browse');
    expect(node('.browse').getAttribute('aria-pressed')).toBe('true');
    expect(node('.identity').textContent).toBe('body');
    expect(select(first)).toBe(true);
    frame.dispatchEvent(new Event('load'));
    expect(select(second)).toBe(true);
    expect(onModeChange).toHaveBeenLastCalledWith('browse');
  });

  it('inspects cross-window elements, projects outlines and preserves original CSS pixel dimensions', async () => {
    start();
    const siteClick = vi.fn();
    first.addEventListener('click', siteClick);
    expect(select(first)).toBe(false);
    await render();
    expect(siteClick).not.toHaveBeenCalled();
    expect(node('.identity').textContent).toBe('button.first');
    expect(node('.width').textContent).toBe('200 px');
    expect(node('.details').textContent).toContain('16px');
    const outline = geometry().querySelector<HTMLElement>('.outline')!;
    expect(outline.style.left).toBe('110px');
    expect(outline.style.top).toBe('70px');
    expect(outline.style.width).toBe('100px');
    press('.browse');
    expect(select(first)).toBe(true);
    expect(siteClick).toHaveBeenCalledOnce();
    expect(onModeChange).toHaveBeenLastCalledWith('browse');
  });

  it('can mount geometry inside the enclosing review shell stacking context', () => {
    const shell = document.createElement('div');
    shell.style.position = 'fixed';
    shell.style.zIndex = '2147483647';
    document.body.append(shell);
    start({ overlayContainer: shell });
    const host = shell.querySelector<HTMLElement>('[data-df-review-design-geometry]')!;
    expect(host).not.toBeNull();
    expect(host.style.position).toBe('fixed');
    expect(host.style.pointerEvents).toBe('none');
  });

  it('supports A/B distance selection and Alt hover without replacing A', async () => {
    start();
    select(first);
    press('.compare');
    select(second);
    await render();
    expect(node('.identity').textContent).toBe('button.first');
    expect(node('.measure-info').textContent).toContain('60 px');
    expect(geometry().querySelectorAll('.outline')).toHaveLength(2);
    press('.pick');
    second.dispatchEvent(new MouseEvent('pointermove', { bubbles: true, composed: true, altKey: true }));
    await render();
    expect(node('.measure-info').textContent).toContain('60 px');
    expect(node('.identity').textContent).toBe('button.first');
  });

  it('keeps touch scrolling native and only consumes the completed tap', () => {
    start();
    const down = new Event('pointerdown', { bubbles: true, cancelable: true });
    Object.defineProperty(down, 'pointerType', { value: 'touch' });
    expect(first.dispatchEvent(down)).toBe(true);
    expect(select(first)).toBe(false);
  });

  it('navigates parent, child and sibling DOM elements', async () => {
    start();
    select(first);
    press('.next');
    await render();
    expect(node('.identity').textContent).toBe('button.second');
    press('.previous');
    press('.parent');
    await render();
    expect(node('.identity').textContent).toBe('section');
    press('.child');
    await render();
    expect(node('.identity').textContent).toBe('button.first');
  });

  it('filters computed CSS and requests the selected pseudo element', async () => {
    const view = frame.contentWindow!;
    const computed = view.getComputedStyle.bind(view);
    const read = vi.spyOn(view, 'getComputedStyle').mockImplementation((element) => computed(element));
    start();
    select(first);
    await render();
    press('.css-tab');
    expect(node('.css-tab').getAttribute('aria-pressed')).toBe('true');
    const search = node<HTMLInputElement>('.search');
    search.value = 'font-size';
    search.dispatchEvent(new Event('input'));
    const pseudo = node<HTMLSelectElement>('.pseudo');
    expect(Array.from(pseudo.options, (option) => option.value)).toContain('::before');
    pseudo.value = '::before';
    expect(pseudo.value).toBe('::before');
    pseudo.dispatchEvent(new Event('change'));
    await render();
    expect(read).toHaveBeenCalledWith(first, '::before');
    expect(node('.details').querySelectorAll('.row')).toHaveLength(1);
    expect(node('.details').textContent).toContain('font-size16px');
  });

  it('copies a safe CSS report without page text, input values or URL secrets', async () => {
    start();
    first.style.backgroundImage = 'url("https://example.test/image?token=private-token")';
    select(first);
    await render();
    press('.copy');
    const report = node<HTMLTextAreaElement>('.report');
    expect(report.hidden).toBe(false);
    expect(report.value).toContain('font-size: 16px');
    expect(report.value).not.toContain('private-token');
    expect(report.value).not.toContain('Private page text');
  });

  it('rebinds on iframe load, resets A/B and reapplies the current mode synchronously', async () => {
    start();
    select(first);
    await render();
    frame.dispatchEvent(new Event('load'));
    expect(onModeChange).toHaveBeenLastCalledWith('pick');
    expect(onModeChange).toHaveBeenCalledTimes(2);
    await render();
    expect(node('.selection').hidden).toBe(false);
    expect(node('.identity').textContent).toBe('body');
    select(second);
    await render();
    expect(node('.identity').textContent).toBe('button.second');
    press('.browse');
    frame.dispatchEvent(new Event('load'));
    expect(onModeChange).toHaveBeenLastCalledWith('browse');
    expect(select(second)).toBe(true);
  });

  it('gracefully handles an unavailable frame and recovers after a same-origin load', async () => {
    const target = frame.contentDocument;
    Object.defineProperty(frame, 'contentDocument', { configurable: true, get: () => null });
    start();
    await render();
    expect(node('.status').textContent).toContain('접근할 수 없습니다');
    Object.defineProperty(frame, 'contentDocument', { configurable: true, get: () => target });
    frame.dispatchEvent(new Event('load'));
    select(first);
    await render();
    expect(node('.identity').textContent).toBe('button.first');
  });

  it('releases listeners on the previous iframe document when a new document loads', async () => {
    start();
    select(first);
    await render();
    const oldClick = vi.fn();
    first.addEventListener('click', oldClick);
    // A second test fixture provides a genuinely distinct Document and Window.
    const replacement = document.createElement('iframe');
    document.body.append(replacement);
    const nextDoc = replacement.contentDocument!;
    nextDoc.body.innerHTML = '<button class="replacement">New document</button>';
    const nextButton = nextDoc.querySelector('button')!;
    vi.spyOn(nextButton, 'getBoundingClientRect').mockReturnValue(rect(0, 0, 100, 40));
    Object.defineProperty(frame, 'contentDocument', { configurable: true, get: () => nextDoc });
    frame.dispatchEvent(new Event('load'));
    expect(select(first)).toBe(true);
    expect(oldClick).toHaveBeenCalledOnce();
    expect(select(nextButton)).toBe(false);
    await render();
    expect(node('.identity').textContent).toBe('button.replacement');
  });

  it('clears disconnected selections after a target DOM update', async () => {
    start();
    select(first);
    await render();
    first.remove();
    await render();
    expect(node('.selection').hidden).toBe(true);
    expect(geometry().querySelector('.outline')).toBeNull();
  });

  it('updates projected geometry when the host frame scrolls or changes scale', async () => {
    start();
    select(first);
    await render();
    vi.mocked(frame.getBoundingClientRect).mockReturnValue(rect(10, -10, 250, 200));
    document.dispatchEvent(new Event('scroll'));
    await render();
    expect(geometry().querySelector<HTMLElement>('.outline')!.style.left).toBe('15px');
    expect(geometry().querySelector<HTMLElement>('.outline')!.style.width).toBe('50px');
    expect(node('.width').textContent).toBe('200 px');
  });

  it('resolves default and clicked selections but only opens source explicitly', async () => {
    const location = { file: '/src/button.tsx', displayPath: 'button.tsx', line: 12, column: 3 };
    const resolve = vi.fn(() => location);
    const open = vi.fn();
    start({ source: { resolve, open } });
    await render();
    expect(resolve).toHaveBeenCalledExactlyOnceWith(frame.contentDocument!.body);
    select(first);
    await render();
    expect(resolve).toHaveBeenLastCalledWith(first);
    expect(resolve).toHaveBeenCalledTimes(2);
    expect(open).not.toHaveBeenCalled();
    press('.open-source');
    await render();
    expect(open).toHaveBeenCalledExactlyOnceWith(location);
  });

  it('catches a failing optional source resolver without breaking CSS inspection', async () => {
    start({ source: { resolve: () => { throw new Error('not available'); }, open: vi.fn() } });
    select(first);
    await render();
    await render();
    expect(node('.source-path').textContent).toContain('찾지 못했습니다');
    expect(node('.width').textContent).toBe('200 px');
  });

  it('ignores late source resolution after the session has been destroyed', async () => {
    let resolve!: (value: { file: string; displayPath: string; line: number; column: number }) => void;
    const pending = new Promise<{ file: string; displayPath: string; line: number; column: number }>((done) => { resolve = done; });
    const open = vi.fn();
    const inspector = start({ source: { resolve: () => pending, open } });
    select(first);
    await render();
    inspector.destroy();
    resolve({ file: '/src/late.tsx', displayPath: 'late.tsx', line: 1, column: 1 });
    await render();
    expect(open).not.toHaveBeenCalled();
    expect(container.children).toHaveLength(0);
    expect(queued.size).toBe(0);
  });

  it('ignores a pending source-open request after iframe rebind', async () => {
    const location = { file: '/src/late.tsx', displayPath: 'late.tsx', line: 1, column: 1 };
    let resolve!: (value: typeof location) => void;
    const pending = new Promise<typeof location>(done => { resolve = done; });
    const open = vi.fn();
    start({ source: { resolve: element => element === first ? pending : null, open } });
    select(first);
    await render();
    first.dispatchEvent(new MouseEvent('dblclick', { bubbles: true, cancelable: true }));
    frame.dispatchEvent(new Event('load'));
    resolve(location);
    await render();
    expect(open).not.toHaveBeenCalled();
    expect(node('.identity').textContent).toBe('body');
    expect(node('.source-path').textContent).not.toContain('late.tsx');
  });

  it('destroy disconnects observers and ignores late input from the old target', async () => {
    const disconnect = vi.spyOn(MutationObserver.prototype, 'disconnect');
    const inspector = start();
    select(first);
    await render();
    disconnect.mockClear();
    inspector.destroy();
    expect(disconnect).toHaveBeenCalledTimes(2);
    first.setAttribute('data-after-destroy', 'true');
    first.dispatchEvent(new Event('input', { bubbles: true }));
    frame.contentDocument!.dispatchEvent(new Event('scroll'));
    await render();
    expect(queued.size).toBe(0);
    expect(container.children).toHaveLength(0);
  });

  it('destroy removes all owned DOM, cancels redraws and releases site events and frame-load handlers', async () => {
    const inspector = start();
    select(first);
    await render();
    const siteClick = vi.fn();
    first.addEventListener('click', siteClick);
    document.dispatchEvent(new Event('scroll'));
    expect(queued.size).toBe(1);
    inspector.destroy();
    inspector.destroy();
    expect(queued.size).toBe(0);
    expect(container.children).toHaveLength(0);
    expect(document.querySelector('[data-df-review-design-geometry]')).toBeNull();
    expect(select(first)).toBe(true);
    expect(siteClick).toHaveBeenCalledOnce();
    const calls = onModeChange.mock.calls.length;
    frame.dispatchEvent(new Event('load'));
    window.dispatchEvent(new Event('resize'));
    expect(queued.size).toBe(0);
    expect(onModeChange).toHaveBeenCalledTimes(calls);
    expect(document.querySelectorAll('iframe')).toHaveLength(1);
  });
});

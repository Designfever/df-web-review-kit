import { afterEach, describe, expect, it, vi } from 'vitest';
import { bindSourceSelectionEvents } from './source.selection.events';
import { getSourceCandidates } from './source.open';

const disposers: Array<() => void> = [];
afterEach(() => {
  disposers.splice(0).forEach((dispose) => dispose());
  document.body.replaceChildren();
  vi.restoreAllMocks();
});

function fixture() {
  const frame = document.createElement('iframe');
  document.body.append(frame);
  const doc = frame.contentDocument!;
  doc.body.innerHTML = '<section data-wrk-source-file="src/Card.tsx" data-font=" Inter "><p data-font="Bold">Text</p><p data-font="Bold">Same font</p></section><div class="helper-figma-root">Figma</div>';
  const target = doc.querySelector('section')!;
  const commands = {
    clearSourceInspector: vi.fn(),
    onCancelReviewMode: vi.fn(() => true),
    selectSourceOutlineForElement: vi.fn(),
    onRequestSourceTreeFocus: vi.fn(),
    showToast: vi.fn(),
    showSourceOutlineForTarget: vi.fn((value: EventTarget | null) => getSourceCandidates(value)[0] ?? null),
  };
  const cleanup = bindSourceSelectionEvents({frameDocument: doc, hostWindow: window, sourceCandidateOptions: {}, ...commands})!;
  disposers.push(cleanup);
  const key = (type: string, init: KeyboardEventInit, receiver: EventTarget = window) => receiver.dispatchEvent(new KeyboardEvent(type, init));
  const selecting = () => doc.documentElement.hasAttribute('data-dfwr-source-option');
  return { doc, target, commands, cleanup, key, selecting };
}

describe('source selection iframe binding', () => {
  it('tracks Alt/Option, deduplicates font hints and clears on keyup, Escape and blur', () => {
    const { doc, target, key, selecting, commands } = fixture();
    target.dispatchEvent(new MouseEvent('mousemove', { bubbles: true }));
    key('keydown', { key: 'Alt', code: 'AltLeft', altKey: true });
    expect(selecting()).toBe(true);
    const overlay = doc.querySelector<HTMLElement>('[data-dfwr-source-fonts]')!;
    expect(overlay.hidden).toBe(false);
    expect(overlay.textContent).toBe('sectionInterpBold');
    expect(overlay.children).toHaveLength(2);
    key('keyup', { key: 'Alt', code: 'AltLeft' });
    expect(selecting()).toBe(false);
    expect(overlay.hidden).toBe(true);
    key('keydown', { key: 'Unidentified', code: 'AltRight' }, doc);
    expect(selecting()).toBe(true);
    key('keydown', { key: 'Escape' }, doc);
    expect(selecting()).toBe(false);
    key('keydown', { key: 'Alt' });
    window.dispatchEvent(new Event('blur'));
    expect(selecting()).toBe(false);
    expect(commands.onCancelReviewMode).toHaveBeenCalledTimes(4);
  });

  it('locks Figma before the first Alt-click hit-test and focuses the actual source', () => {
    const { doc, target, commands, selecting } = fixture();
    const overlay = doc.querySelector('.helper-figma-root')!;
    Object.defineProperty(doc, 'elementFromPoint', { configurable: true, value: vi.fn(() => {
      expect([...doc.querySelectorAll('style')].some(style => style.textContent?.includes('pointer-events: none') && style.id)).toBe(true);
      return target;
    }) });
    const event = new MouseEvent('click', { bubbles: true, cancelable: true, altKey: true, clientX: 30, clientY: 50 });
    overlay.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
    expect(commands.selectSourceOutlineForElement).toHaveBeenCalledWith(target);
    expect(commands.onRequestSourceTreeFocus).toHaveBeenCalledWith(target);
    expect(commands.showToast).not.toHaveBeenCalled();
    expect(selecting()).toBe(false);
  });

  it('leaves Design Inspector interactions alone and handles a missing source', () => {
    const { doc, target, commands, key, selecting } = fixture();
    doc.documentElement.setAttribute('data-df-review-design-inspecting', '');
    key('keydown', { key: 'Alt' });
    target.dispatchEvent(new MouseEvent('pointermove', { bubbles: true, altKey: true }));
    const click = new MouseEvent('click', { bubbles: true, cancelable: true, altKey: true });
    target.dispatchEvent(click);
    expect(click.defaultPrevented).toBe(false);
    expect(selecting()).toBe(false);
    expect(commands.onCancelReviewMode).not.toHaveBeenCalled();
    doc.documentElement.removeAttribute('data-df-review-design-inspecting');
    Object.defineProperty(doc, 'elementFromPoint', { value: () => doc.body });
    doc.body.dispatchEvent(new MouseEvent('click', { bubbles: true, altKey: true }));
    expect(commands.showToast).toHaveBeenCalledWith('Source hint not found');
    expect(selecting()).toBe(false);
  });

  it('preserves DOM-select focus for composer clicks but cancels outside clicks', () => {
    const { commands } = fixture();
    const button = document.createElement('button');
    button.className = 'df-review-section-outline-link is-dom-select';
    const composer = document.createElement('div');
    composer.className = 'dfwr-dom-popover';
    document.body.append(button, composer);
    button.focus();
    composer.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true }));
    expect(document.activeElement).toBe(button);
    expect(commands.onCancelReviewMode).not.toHaveBeenCalled();
    document.body.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true }));
    expect(document.activeElement).not.toBe(button);
    expect(commands.onCancelReviewMode).toHaveBeenCalledOnce();
  });

  it('disposes old document/host listeners, styles and lock before another document binds', () => {
    const old = fixture();
    old.key('keydown', { key: 'Alt' });
    old.cleanup();
    old.commands.onCancelReviewMode.mockClear();
    const next = fixture();
    old.key('keydown', { key: 'Alt' }, old.doc);
    expect(old.selecting()).toBe(false);
    expect(old.commands.onCancelReviewMode).not.toHaveBeenCalled();
    expect(old.doc.querySelector('style')).toBeNull();
    expect(old.doc.querySelector('[data-dfwr-source-fonts]')).toBeNull();
    next.key('keydown', { key: 'Alt' });
    expect(next.selecting()).toBe(true);
    expect(old.selecting()).toBe(false);
    next.cleanup();
    next.commands.onCancelReviewMode.mockClear();
    next.key('keydown', { key: 'Alt' });
    expect(next.selecting()).toBe(false);
    expect(next.commands.onCancelReviewMode).not.toHaveBeenCalled();
  });
});

import { afterEach, describe, expect, it, vi } from 'vitest';
import { bindDesignInspectorTargetEvents } from './target.events';

const cleanups: (() => void)[] = [];
afterEach(() => {
  cleanups.splice(0).forEach(cleanup => cleanup());
  document.body.replaceChildren();
});

function fixture() {
  const frame = document.createElement('iframe');
  document.body.append(frame);
  const doc = frame.contentDocument!;
  const win = doc.defaultView!;
  const button = doc.createElement('button');
  doc.body.append(button);
  let picking = true;
  const actions = {
    isPicking: () => picking,
    isInside: () => false,
    getSelected: () => button,
    sourceEnabled: true,
    onHover: vi.fn(), onSelect: vi.fn(), onOpenSource: vi.fn(),
    onAltChange: vi.fn(), onLeave: vi.fn(), onPageHide: vi.fn(),
    onViewportChange: vi.fn(), schedule: vi.fn(), invalidate: vi.fn(),
  };
  return { doc, win, button, actions, browse: () => { picking = false; } };
}

describe('target document event binding', () => {
  it('reads current mode and preserves pick, touch and browse event policy', () => {
    const { doc, button, actions, browse } = fixture();
    cleanups.push(bindDesignInspectorTargetEvents(doc, actions));
    const pointer = (pointerType: string) => {
      const event = new Event('pointerdown', { bubbles: true, cancelable: true });
      Object.defineProperty(event, 'pointerType', { value: pointerType });
      return button.dispatchEvent(event);
    };
    expect(pointer('touch')).toBe(true);
    expect(pointer('mouse')).toBe(false);
    expect(button.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, altKey: true }))).toBe(false);
    expect(actions.onSelect).toHaveBeenCalledExactlyOnceWith(button, true);
    button.dispatchEvent(new MouseEvent('dblclick', { bubbles: true, cancelable: true }));
    expect(actions.onOpenSource).toHaveBeenCalledOnce();
    browse();
    expect(pointer('mouse')).toBe(true);
    expect(button.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))).toBe(true);
    expect(actions.onSelect).toHaveBeenCalledOnce();
  });

  it('removes document, window, visual viewport and font listeners exactly once', () => {
    const { doc, win, button, actions } = fixture();
    const viewport = new EventTarget(), fonts = new EventTarget();
    Object.defineProperty(win, 'visualViewport', { value: viewport, configurable: true });
    Object.defineProperty(doc, 'fonts', { value: fonts, configurable: true });
    const spies = [doc, win, viewport, fonts].map(target => ({
      add: vi.spyOn(target, 'addEventListener'), remove: vi.spyOn(target, 'removeEventListener'),
    }));
    const cleanup = bindDesignInspectorTargetEvents(doc, actions);
    cleanups.push(cleanup);
    doc.dispatchEvent(new Event('scroll'));
    win.dispatchEvent(new Event('resize'));
    viewport.dispatchEvent(new Event('resize'));
    fonts.dispatchEvent(new Event('loadingdone'));
    expect(actions.onViewportChange.mock.calls).toEqual([[false], [true]]);
    expect(actions.invalidate).toHaveBeenCalledTimes(2);
    cleanup(); cleanup();
    for (const { add, remove } of spies) expect(remove.mock.calls).toEqual(add.mock.calls);
    Object.values(actions).forEach(value => { if (vi.isMockFunction(value)) value.mockClear(); });
    button.click();
    doc.dispatchEvent(new Event('scroll'));
    win.dispatchEvent(new Event('resize'));
    win.dispatchEvent(new Event('pagehide'));
    viewport.dispatchEvent(new Event('resize'));
    fonts.dispatchEvent(new Event('loadingdone'));
    expect(actions.onSelect).not.toHaveBeenCalled();
    expect(actions.onViewportChange).not.toHaveBeenCalled();
    expect(actions.onPageHide).not.toHaveBeenCalled();
    expect(actions.invalidate).not.toHaveBeenCalled();
  });
});

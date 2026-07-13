import { afterEach, describe, expect, it, vi } from 'vitest';
import { DomAdjustmentLayerManager } from './dom-adjustment.layer';

afterEach(() => {
  document.body.replaceChildren();
  document.head.querySelectorAll('style').forEach((style) => style.remove());
  document
    .querySelectorAll('[data-dfwr-move-layer-root]')
    .forEach((root) => root.remove());
});

const createElement = (left: number, top: number) => {
  const element = document.createElement('section');
  vi.spyOn(element, 'getBoundingClientRect').mockReturnValue({
    left,
    top,
    width: 120,
    height: 60,
  } as DOMRect);
  document.body.appendChild(element);
  return element;
};

const renderElement = vi.fn(async () => document.createElement('canvas'));

describe('DomAdjustmentLayerManager', () => {
  it('keeps the source styles intact and moves a canvas layer', async () => {
    const element = createElement(10, 20);
    element.style.opacity = '0.7';
    const manager = new DomAdjustmentLayerManager({
      document,
      onClear: vi.fn(),
      renderElement,
    });

    await manager.create('entry', 'Section', element, { x: 4, y: -2 }, 0.5);

    const layer = document.querySelector<HTMLElement>(
      '[data-dfwr-move-entry-id="entry"]'
    );
    expect(element.style.opacity).toBe('0.7');
    expect(element.getAttribute('data-dfwr-move-source-hidden')).toBe('true');
    expect(layer?.style.left).toBe('10px');
    expect(layer?.style.top).toBe('20px');
    expect(layer?.style.transform).toBe('translate(2px, -1px)');

    expect(manager.adjust('entry', { x: 6, y: 2 }, 0.5)).toEqual({
      x: 10,
      y: 0,
    });
    expect(layer?.style.transform).toBe('translate(5px, 0px)');
    manager.destroy();
  });

  it('keeps multiple layers until each one is cleared', async () => {
    const first = createElement(0, 0);
    const second = createElement(100, 200);
    const onClear = vi.fn();
    const manager = new DomAdjustmentLayerManager({
      document,
      onClear,
      renderElement,
    });

    await manager.create('first', 'First', first, { x: 0, y: 0 }, 1);
    await manager.create('second', 'Second', second, { x: 0, y: 0 }, 1);
    expect(document.querySelectorAll('[data-dfwr-move-entry-id]')).toHaveLength(
      2
    );

    manager.clear('first');
    expect(first.hasAttribute('data-dfwr-move-source-hidden')).toBe(false);
    expect(second.getAttribute('data-dfwr-move-source-hidden')).toBe('true');
    expect(document.querySelectorAll('[data-dfwr-move-entry-id]')).toHaveLength(
      1
    );
    expect(onClear).toHaveBeenCalledWith('first');

    manager.destroy();
    expect(second.hasAttribute('data-dfwr-move-source-hidden')).toBe(false);
  });

  it('clears a layer from its canvas close button', async () => {
    const element = createElement(0, 0);
    const onClear = vi.fn();
    const manager = new DomAdjustmentLayerManager({
      document,
      onClear,
      renderElement,
    });

    await manager.create('entry', 'Section', element, { x: 0, y: 0 }, 1);
    document
      .querySelector<HTMLButtonElement>('[data-dfwr-move-entry-id] button')
      ?.click();

    expect(document.querySelector('[data-dfwr-move-entry-id]')).toBeNull();
    expect(element.hasAttribute('data-dfwr-move-source-hidden')).toBe(false);
    expect(onClear).toHaveBeenCalledWith('entry');
    manager.destroy();
  });
});

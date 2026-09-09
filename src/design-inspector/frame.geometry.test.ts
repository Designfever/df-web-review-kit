import { afterEach, describe, expect, it, vi } from 'vitest';
import { fitLabelInViewport, getFrameDocument, getFrameGeometry, projectMeasure, projectRect } from './frame.geometry';

const box = (left: number, top: number, width: number, height: number) => ({
  left, top, width, height, right: left + width, bottom: top + height, x: left, y: top,
  toJSON: () => ({}),
});

function dimensions(element: HTMLElement, width: number, height: number, border = 0) {
  for (const [key, value] of Object.entries({
    offsetWidth: width, offsetHeight: height,
    clientWidth: width - border * 2, clientHeight: height - border * 2,
    clientLeft: border, clientTop: border,
  })) Object.defineProperty(element, key, { value, configurable: true });
}

afterEach(() => document.body.replaceChildren());

describe('existing iframe coordinate mapping', () => {
  it('projects through actual frame scale and border, without scaling CSS measurements', () => {
    const frame = document.createElement('iframe');
    document.body.append(frame);
    dimensions(frame, 1000, 800, 2);
    vi.spyOn(frame, 'getBoundingClientRect').mockReturnValue(box(100, 50, 500, 400));
    const origin = getFrameGeometry(frame);
    expect(origin).toMatchObject({ left: 101, top: 51, scaleX: 0.5, scaleY: 0.5 });
    expect(projectRect(box(20, 40, 200, 80), origin)).toMatchObject({ left: 111, top: 71, width: 100, height: 40 });
    expect(projectMeasure({ axis: 'y', start: 20, end: 80, lane: 40, kind: 'gap', label: '세로 간격' }, origin))
      .toMatchObject({ start: 61, end: 91, lane: 121 });
  });

  it('supports separate horizontal and vertical scale and clips outer scroll containers', () => {
    const parent = document.createElement('div');
    parent.style.overflowX = parent.style.overflowY = 'auto';
    const frame = document.createElement('iframe');
    parent.append(frame);
    document.body.append(parent);
    dimensions(parent, 400, 300);
    dimensions(frame, 1000, 800);
    vi.spyOn(parent, 'getBoundingClientRect').mockReturnValue(box(120, 60, 400, 300));
    vi.spyOn(frame, 'getBoundingClientRect').mockReturnValue(box(100, 50, 500, 600));
    const origin = getFrameGeometry(frame);
    expect(origin).toMatchObject({ scaleX: 0.5, scaleY: 0.75 });
    expect(origin.bounds).toMatchObject({ left: 120, top: 60, right: 520, bottom: 360 });
  });

  it('keeps labels inside the parent viewport instead of clipping them to the iframe', () => {
    expect(fitLabelInViewport({ left: 980, top: -20, width: 180, height: 22 }, 1000, 800))
      .toEqual({ left: 812, top: 8 });
  });

  it('treats cross-origin and inaccessible documents as an unavailable target', () => {
    const frame = document.createElement('iframe');
    document.body.append(frame);
    expect(getFrameDocument(frame)).toBe(frame.contentDocument);
    Object.defineProperty(frame, 'contentDocument', { configurable: true, get() { throw new DOMException('Blocked', 'SecurityError'); } });
    expect(getFrameDocument(frame)).toBeNull();
  });
});

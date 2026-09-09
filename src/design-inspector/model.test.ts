import { describe, expect, it } from 'vitest';
import { filterStyles, measureRects, plainRect, px, reportValue, type Rect } from './model';
import { createReport, type StyleSnapshot } from './snapshot';

const rect = (left: number, top: number, width: number, height: number): Rect => ({
  left,
  top,
  width,
  height,
  right: left + width,
  bottom: top + height
});

describe('rendered border-box measurements', () => {
  it('measures a 60px vertical gap independently of DOM order', () => {
    const a = rect(10, 10, 200, 40),
      b = rect(30, 110, 160, 100);
    for (const boxes of [
      [a, b],
      [b, a]
    ]) {
      const result = measureRects(boxes[0], boxes[1]);
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({ axis: 'y', start: 50, end: 110, kind: 'gap' });
    }
  });
  it('measures horizontal and diagonal gaps', () => {
    expect(measureRects(rect(0, 0, 40, 40), rect(56, 0, 40, 40))[0]).toMatchObject({
      axis: 'x',
      start: 40,
      end: 56
    });
    expect(
      measureRects(rect(0, 0, 40, 40), rect(60, 80, 40, 40)).map((g) => g.end - g.start)
    ).toEqual([20, 40]);
  });
  it('shows four edge distances for nested boxes, not a fake CSS padding', () => {
    const guides = measureRects(rect(0, 0, 300, 200), rect(10, 20, 260, 140));
    expect(guides.map((g) => g.end - g.start)).toEqual([10, 30, 20, 40]);
    expect(guides.every((g) => g.kind === 'inset')).toBe(true);
  });
  it('labels overlapping geometry distinctly', () => {
    const guides = measureRects(rect(0, 0, 100, 100), rect(70, 60, 100, 100));
    expect(guides.map((g) => [g.kind, g.end - g.start])).toEqual([
      ['overlap', 30],
      ['overlap', 40]
    ]);
  });
  it('handles touching, fractional, offscreen and identical rectangles', () => {
    expect(measureRects(rect(-100, -50, 100, 30), rect(-100, -20, 100, 30))[0].end).toBe(-20);
    expect(px(15.555)).toBe('15.56 px');
    expect(measureRects(rect(0, 0, 0, 0), rect(0, 0, 0, 0)).every((g) => g.start === g.end)).toBe(
      true
    );
    expect(plainRect(rect(1, 2, 3, 4))).toEqual(rect(1, 2, 3, 4));
  });
});

describe('style search and safe reports', () => {
  it('filters names and values, including custom properties', () => {
    const styles = { 'font-size': '16px', color: 'rgb(0, 0, 0)', '--space': '16px' };
    expect(filterStyles(styles, '16PX')).toHaveLength(2);
    expect(filterStyles(styles, 'font')).toEqual([['font-size', '16px']]);
    expect(filterStyles(styles, '')).toHaveLength(3);
  });
  it('redacts URL values and generated content', () => {
    expect(
      reportValue('background-image', 'url("https://example.com/?token=secret")')
    ).not.toContain('secret');
    expect(reportValue('content', 'private text')).not.toContain('private');
    expect(
      reportValue('background-image', 'url("https://example.com/a)b?token=secret")')
    ).not.toContain('secret');
    expect(reportValue('background-image', 'image-set("/asset?token=secret" 1x)')).not.toContain(
      'secret'
    );
  });
  it('exports structural identity and never label, URLs or arbitrary custom variable values', () => {
    const snapshot: StyleSnapshot = {
      rect: rect(0, 0, 20, 30),
      label: 'private-class',
      selector: 'button:nth-of-type(1)',
      pseudo: '',
      warnings: [],
      styles: { color: 'red', '--customer': 'private-value', content: 'private-text' }
    };
    const report = createReport(snapshot, { width: 390, height: 844 });
    expect(report).toContain('390 × 844');
    expect(report).toContain('color: red');
    expect(report).not.toContain('private');
  });
});

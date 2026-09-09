import { afterEach, describe, expect, it } from 'vitest';
import {
  DEFAULT_REVIEW_VIEWPORT_PRESETS,
  findViewportPreset,
  getInitialSize,
  getViewportPresetKind,
  toReviewViewportPresets,
} from './viewport';

const originalUrl = window.location.href;

afterEach(() => {
  window.history.replaceState(null, '', originalUrl);
});

describe('review viewport presets', () => {
  it('uses 1920 by 1280 for Desktop without classifying it as Wide', () => {
    const desktop = findViewportPreset(DEFAULT_REVIEW_VIEWPORT_PRESETS, 1920, 1280);
    expect(desktop).toEqual({
      label: 'Desktop', width: 1920, height: 1280, kind: 'desktop',
    });
    expect(getViewportPresetKind(desktop)).toBe('desktop');
    expect(toReviewViewportPresets([desktop])[0].scope).toBe('desktop');
  });

  it('restores the Desktop preset from the URL', () => {
    window.history.replaceState(null, '', '/review?w=1920&h=1280');
    expect(getInitialSize(DEFAULT_REVIEW_VIEWPORT_PRESETS)).toMatchObject({
      kind: 'desktop', width: 1920, height: 1280,
    });
  });

  it('restores previous PC URLs and nearby captured sizes as Desktop', () => {
    window.history.replaceState(null, '', '/review?w=1440&h=900');
    expect(getInitialSize(DEFAULT_REVIEW_VIEWPORT_PRESETS)).toMatchObject({
      kind: 'desktop', width: 1920, height: 1280,
    });
    expect(findViewportPreset(DEFAULT_REVIEW_VIEWPORT_PRESETS, 1500, 900).kind)
      .toBe('desktop');
  });

  it('keeps the other presets and initial fallback unchanged', () => {
    window.history.replaceState(null, '', '/review');
    expect(getInitialSize(DEFAULT_REVIEW_VIEWPORT_PRESETS)).toMatchObject({
      kind: 'mobile', width: 390, height: 720,
    });
    expect(DEFAULT_REVIEW_VIEWPORT_PRESETS.filter(({ kind }) => kind !== 'desktop'))
      .toEqual([
        { label: 'Mobile', width: 390, height: 720, kind: 'mobile' },
        { label: 'Tablet', width: 768, height: 1024, kind: 'tablet' },
        { label: 'Wide', width: 1980, height: 1080, kind: 'wide' },
      ]);
  });

  it('preserves project-specific preset overrides', () => {
    const custom = { label: 'PC', width: 1440, height: 900, kind: 'desktop' as const };
    expect(findViewportPreset([custom], 1920, 1280)).toBe(custom);
  });
});

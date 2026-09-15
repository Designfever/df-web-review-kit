import { getStoredCaptureMethod, writeStoredCaptureMethod } from './settings';
import {
  beforeEach,
  describe,
  expect,
  it,
} from 'vitest';
import { REVIEW_TOOLTIP_STORAGE_KEY } from './constants';
import {
  getStoredReviewTooltipsEnabled,
  writeStoredReviewTooltipsEnabled,
  getStoredReviewSidePanel,
  writeStoredReviewSidePanel,
} from './settings';

function createMemoryStorage(): Storage {
  const store = new Map<string, string>();

  return {
    get length() {
      return store.size;
    },
    clear() {
      store.clear();
    },
    getItem(key) {
      return store.get(key) ?? null;
    },
    key(index) {
      return Array.from(store.keys())[index] ?? null;
    },
    removeItem(key) {
      store.delete(key);
    },
    setItem(key, value) {
      store.set(key, value);
    },
  };
}

describe('review settings storage', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'localStorage', {
      value: createMemoryStorage(),
      configurable: true,
    });
  });

  it('keeps tooltips enabled by default', () => {
    expect(getStoredReviewTooltipsEnabled()).toBe(true);
  });

  it('persists the design inspector independently of QA write permissions', () => {
    writeStoredReviewSidePanel('design-inspector');
    expect(getStoredReviewSidePanel()).toBe('design-inspector');
  });

  it('persists disabled tooltips', () => {
    writeStoredReviewTooltipsEnabled(false);

    expect(window.localStorage.getItem(REVIEW_TOOLTIP_STORAGE_KEY)).toBe(
      'false'
    );
    expect(getStoredReviewTooltipsEnabled()).toBe(false);
  });

  it('removes the setting when tooltips are restored to default', () => {
    writeStoredReviewTooltipsEnabled(false);
    writeStoredReviewTooltipsEnabled(true);

    expect(window.localStorage.getItem(REVIEW_TOOLTIP_STORAGE_KEY)).toBeNull();
    expect(getStoredReviewTooltipsEnabled()).toBe(true);
  });
});


it('defaults to browser capture and persists the html2canvas choice', () => {
  writeStoredCaptureMethod('browser');
  expect(getStoredCaptureMethod()).toBe('browser');
  writeStoredCaptureMethod('html2canvas');
  expect(getStoredCaptureMethod()).toBe('html2canvas');
  writeStoredCaptureMethod('browser');
  expect(getStoredCaptureMethod()).toBe('browser');
});

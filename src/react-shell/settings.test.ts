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
} from './settings';

describe('review settings storage', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('keeps tooltips enabled by default', () => {
    expect(getStoredReviewTooltipsEnabled()).toBe(true);
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

import { afterEach, describe, expect, it } from 'vitest';
import { getTargetOverlayState } from './target';

afterEach(() => {
  document.body.replaceChildren();
  document.body.className = '';
  document.documentElement.className = '';
  localStorage.clear();
  sessionStorage.clear();
  document.cookie = 'isHelp=; Max-Age=0; path=/';
});

describe('grid overlay state', () => {
  it('follows a mounted helper through on/off despite stale stored flags', () => {
    document.body.innerHTML = '<div class="helper"></div>';
    document.cookie = 'isHelp=true; path=/';
    localStorage.setItem('df-review-grid-overlay', 'true');
    sessionStorage.setItem('dfReviewGridOverlay', '1');
    expect(getTargetOverlayState(document).grid).toBe(false);
    document.body.classList.add('is-help');
    expect(getTargetOverlayState(document).grid).toBe(true);
    document.body.classList.remove('is-help');
    expect(getTargetOverlayState(document).grid).toBe(false);
  });

  it('recognizes html state and the helper onShow class', () => {
    document.documentElement.classList.add('is-help');
    expect(getTargetOverlayState(document).grid).toBe(true);
    document.documentElement.classList.remove('is-help');
    document.body.innerHTML = '<div class="helper onShow"></div>';
    expect(getTargetOverlayState(document).grid).toBe(true);
    document.querySelector('.helper')!.classList.remove('onShow');
    expect(getTargetOverlayState(document).grid).toBe(false);
  });

  it('retains storage fallback for hosts without a recognized helper', () => {
    localStorage.setItem('isHelp', '1');
    expect(getTargetOverlayState(document).grid).toBe(true);
    localStorage.setItem('isHelp', '0');
    expect(getTargetOverlayState(document).grid).toBe(false);
    expect(getTargetOverlayState(undefined).grid).toBe(false);
  });
});

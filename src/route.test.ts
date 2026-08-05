import { describe, expect, it } from 'vitest';
import { getItemRouteKey, normalizeRoutePath } from './route';

describe('normalizeRoutePath', () => {
  it('strips query strings and hashes', () => {
    expect(normalizeRoutePath('/about?tab=1')).toBe('/about');
    expect(normalizeRoutePath('/en/?ttt-tttt')).toBe('/en/');
    expect(normalizeRoutePath('/about#section')).toBe('/about');
  });

  it('normalizes index.html to the directory route', () => {
    // 정적 배포에서 /foo/index.html 과 /foo/ 는 같은 페이지로 묶여야 한다.
    expect(normalizeRoutePath('/docs/index.html')).toBe('/docs/');
    expect(normalizeRoutePath('/index.html')).toBe('/');
  });

  it('ensures a leading slash and a non-empty path', () => {
    expect(normalizeRoutePath('about')).toBe('/about');
    expect(normalizeRoutePath('')).toBe('/');
  });
});

describe('getItemRouteKey', () => {
  it('prefers and normalizes the stored route key', () => {
    expect(
      getItemRouteKey({ routeKey: '/stored', normalizedPath: '/other' })
    ).toBe('/stored');
    expect(
      getItemRouteKey({
        routeKey: '/en/?ttt-tttt',
        normalizedPath: '/other',
      })
    ).toBe('/en/');
  });

  it('falls back to normalizing the persisted path', () => {
    // 구버전 데이터에는 routeKey 가 없어서 normalizedPath 로 복원한다.
    expect(
      getItemRouteKey({ routeKey: '', normalizedPath: '/legacy/index.html' })
    ).toBe('/legacy/');
  });
});

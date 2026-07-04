import { describe, expect, it } from 'vitest';
import type { ReviewEnvironment } from './geometry';
import { getPageUrl, getRouteKey } from './location';

// location 만 필요한 테스트라 URL 객체를 Location 대용으로 쓴다.
function createEnvironment(href: string): ReviewEnvironment {
  return {
    window: { location: new URL(href) } as unknown as Window,
    document: {} as Document,
    viewportRect: { left: 0, top: 0, width: 0, height: 0 },
    overlayRect: { left: 0, top: 0, width: 0, height: 0 },
  };
}

describe('getPageUrl', () => {
  it('keeps public query params and the hash', () => {
    const environment = createEnvironment(
      'http://localhost/products?tab=specs#reviews'
    );
    expect(getPageUrl(environment)).toBe(
      'http://localhost/products?tab=specs#reviews'
    );
  });

  it('strips review-internal query params from the stored URL', () => {
    // __dfwr_target 은 리뷰 셸이 붙이는 내부 파라미터라 저장 URL 에서 제외한다.
    const environment = createEnvironment(
      'http://localhost/products?__dfwr_target=%2Ffoo&tab=specs'
    );
    expect(getPageUrl(environment)).toBe('http://localhost/products?tab=specs');
  });

  it('drops the question mark when no public params remain', () => {
    const environment = createEnvironment(
      'http://localhost/products?__dfwr_target=%2Ffoo'
    );
    expect(getPageUrl(environment)).toBe('http://localhost/products');
  });
});

describe('getRouteKey', () => {
  it('normalizes the pathname into a route key', () => {
    expect(
      getRouteKey(createEnvironment('http://localhost/docs/index.html?x=1'))
    ).toBe('/docs/');
  });
});

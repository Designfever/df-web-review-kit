import { describe, expect, it } from 'vitest';
import { getReviewPageToggleUrl } from './review.page.shortcut';

describe('review page toggle URL', () => {
  it('opens the current path, query and hash at the current viewport size', () => {
    const result = getReviewPageToggleUrl('https://example.com/products/?sort=new#details', '/review', undefined, { width: 1280, height: 800 });
    const url = new URL(result!, 'https://example.com');
    expect(url.pathname).toBe('/review/');
    expect(url.searchParams.get('target')).toBe('/products/?sort=new#details');
    expect(url.searchParams.get('w')).toBe('1280');
    expect(url.searchParams.get('h')).toBe('800');
  });
  it('returns to the latest iframe route and strips only the internal marker', () => {
    expect(getReviewPageToggleUrl('https://example.com/review/?target=/', '/review', 'https://example.com/new/?q=hello&__dfwr_target=1#section')).toBe('/new/?q=hello#section');
  });
  it('supports custom review routes and falls back to the shell target', () => {
    expect(getReviewPageToggleUrl('https://example.com/tools/review/?target=%2Fproducts%3Fx%3D1%23info', '/tools/review/')).toBe('/products?x=1#info');
  });
  it('does not navigate to a foreign origin', () => {
    expect(getReviewPageToggleUrl('https://example.com/review/?target=https://other.example/')).toBeNull();
  });
});

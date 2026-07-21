import { describe, expect, it } from 'vitest';
import { isReviewImageUrl } from './image.import';

describe('isReviewImageUrl', () => {
  it.each([
    'https://example.com/frame.png',
    'https://example.com/frame.webp?version=2',
    'https://example.com/frame.jpg#preview',
    'https://example.com/frame.jpeg',
  ])('accepts a supported image URL: %s', (url) => {
    expect(isReviewImageUrl(url)).toBe(true);
  });

  it.each([
    'https://www.figma.com/design/file/frame?node-id=1-2',
    'https://example.com/frame.svg',
    'frame.png',
  ])('rejects a non-image URL: %s', (url) => {
    expect(isReviewImageUrl(url)).toBe(false);
  });
});

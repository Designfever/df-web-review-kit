import { describe, expect, it } from 'vitest';
import { getReviewFigmaAssetStorageKeyFromPathname } from './figma-asset';

describe('getReviewFigmaAssetStorageKeyFromPathname', () => {
  const endpoint = '/__review/figma-images/assets';

  it('extracts and validates the storage key', () => {
    expect(
      getReviewFigmaAssetStorageKeyFromPathname(
        `${endpoint}/figma_abc.png`,
        endpoint
      )
    ).toBe('figma_abc.png');
  });

  it('rejects encoded traversal attempts', () => {
    // %2e%2e%2f 는 decodeURIComponent 후 ../ 가 되므로 여기서 걸러져야 한다.
    expect(
      getReviewFigmaAssetStorageKeyFromPathname(
        `${endpoint}/%2e%2e%2fsecret.png`,
        endpoint
      )
    ).toBeNull();
    expect(
      getReviewFigmaAssetStorageKeyFromPathname(
        `${endpoint}/figma_a%2fb.png`,
        endpoint
      )
    ).toBeNull();
  });

  it('returns null for malformed percent encoding', () => {
    expect(
      getReviewFigmaAssetStorageKeyFromPathname(`${endpoint}/%zz.png`, endpoint)
    ).toBeNull();
  });
});

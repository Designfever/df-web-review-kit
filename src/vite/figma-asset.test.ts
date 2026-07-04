import { describe, expect, it } from 'vitest';
import {
  createReviewFigmaAssetStorageKey,
  getReviewFigmaAssetMimeType,
  getReviewFigmaAssetStorageKeyFromPathname,
  getStoreRenderFormat,
  isSafeReviewFigmaAssetStorageKey,
  normalizeImageMimeType,
} from './figma-asset';

describe('isSafeReviewFigmaAssetStorageKey', () => {
  it('accepts generated storage keys', () => {
    expect(isSafeReviewFigmaAssetStorageKey('figma_abc123.png')).toBe(true);
    expect(isSafeReviewFigmaAssetStorageKey('figma_a_b_c.webp')).toBe(true);
  });

  it('rejects path traversal and unexpected names', () => {
    // 이 검증이 dev 서버 자산 서빙의 유일한 방어선이므로 우회 입력을 폭넓게 확인한다.
    expect(isSafeReviewFigmaAssetStorageKey('../secrets.png')).toBe(false);
    expect(isSafeReviewFigmaAssetStorageKey('figma_../x.png')).toBe(false);
    expect(isSafeReviewFigmaAssetStorageKey('figma_a/b.png')).toBe(false);
    expect(isSafeReviewFigmaAssetStorageKey('figma_abc.svg')).toBe(false);
    expect(isSafeReviewFigmaAssetStorageKey('figma_ABC.png')).toBe(false);
    expect(isSafeReviewFigmaAssetStorageKey('')).toBe(false);
  });
});

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

describe('storage key and mime helpers', () => {
  it('creates keys with the format extension', () => {
    expect(createReviewFigmaAssetStorageKey('figma_x', 'jpg')).toBe(
      'figma_x.jpg'
    );
    expect(createReviewFigmaAssetStorageKey('figma_x', 'webp')).toBe(
      'figma_x.webp'
    );
  });

  it('maps storage keys back to mime types', () => {
    expect(getReviewFigmaAssetMimeType('a.jpg')).toBe('image/jpeg');
    expect(getReviewFigmaAssetMimeType('a.webp')).toBe('image/webp');
    expect(getReviewFigmaAssetMimeType('a.png')).toBe('image/png');
  });
});

describe('normalizeImageMimeType', () => {
  it('normalizes parameters, casing, and the jpg alias', () => {
    expect(normalizeImageMimeType('image/PNG')).toBe('image/png');
    expect(normalizeImageMimeType('image/jpg')).toBe('image/jpeg');
    expect(normalizeImageMimeType('image/webp; charset=utf-8')).toBe(
      'image/webp'
    );
  });

  it('rejects non-image and unsupported types', () => {
    expect(normalizeImageMimeType('text/html')).toBeNull();
    expect(normalizeImageMimeType('image/svg+xml')).toBeNull();
    expect(normalizeImageMimeType(undefined)).toBeNull();
  });
});

describe('getStoreRenderFormat', () => {
  it('prefers an explicit raster render format', () => {
    expect(getStoreRenderFormat('jpg', 'webp')).toBe('jpg');
  });

  it('falls back to the stored image format, defaulting to png', () => {
    // webp 는 Figma 렌더 API 가 지원하지 않으므로 png 로 렌더한 뒤 변환한다.
    expect(getStoreRenderFormat(undefined, 'jpg')).toBe('jpg');
    expect(getStoreRenderFormat(undefined, 'webp')).toBe('png');
    expect(getStoreRenderFormat('svg', undefined)).toBe('png');
  });
});

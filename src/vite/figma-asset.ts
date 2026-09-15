import { isSafeReviewFigmaAssetStorageKey } from '../figma/image.asset';

export function getReviewFigmaAssetStorageKeyFromPathname(
  pathname: string,
  assetEndpoint: string
) {
  try {
    const storageKey = decodeURIComponent(
      pathname.slice(assetEndpoint.length + 1)
    );
    return isSafeReviewFigmaAssetStorageKey(storageKey) ? storageKey : null;
  } catch {
    return null;
  }
}

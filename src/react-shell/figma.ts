import type { ReviewShellFigmaImagesOptions } from './types';

export type ReviewFigmaFrameConfig = {
  desktopNodeId?: string;
  mobileNodeId?: string;
};

type ReviewFigmaWindow = Window & {
  __figma?: ReviewFigmaFrameConfig;
};

export function getReviewFigmaImageStore(
  options: ReviewShellFigmaImagesOptions | null | undefined
) {
  if (!options || options.enabled === false) return null;
  return options.store ?? null;
}

export function getTargetFigmaFrameConfig(
  targetWindow: Window | null | undefined
): ReviewFigmaFrameConfig | null {
  try {
    const config = (targetWindow as ReviewFigmaWindow | null)?.__figma;
    if (!config || typeof config !== 'object') return null;

    const desktopNodeId = normalizeFigmaNodeValue(config.desktopNodeId);
    const mobileNodeId = normalizeFigmaNodeValue(config.mobileNodeId);

    if (!desktopNodeId && !mobileNodeId) return null;

    return {
      desktopNodeId,
      mobileNodeId,
    };
  } catch {
    return null;
  }
}

function normalizeFigmaNodeValue(value: unknown) {
  return typeof value === 'string' ? value.trim() || undefined : undefined;
}

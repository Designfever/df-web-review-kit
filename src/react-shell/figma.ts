import type {
  ReviewShellFigmaImagesOptions,
  ReviewShellViewportPreset,
} from './types';
import { createReviewFigmaFrameUrl } from '../figma/parse';
import { getViewportPresetKind } from './viewport';

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

export function isReviewFigmaImageManagementEnabled(
  options: ReviewShellFigmaImagesOptions | null | undefined
) {
  return Boolean(getReviewFigmaImageStore(options));
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

export function getFigmaFrameUrl(
  config: ReviewFigmaFrameConfig | null | undefined,
  preset: ReviewShellViewportPreset
) {
  if (!config) return null;

  const kind = getViewportPresetKind(preset);
  const value =
    kind === 'mobile' ? config.mobileNodeId : config.desktopNodeId;

  return value ? createReviewFigmaFrameUrl(value) : null;
}

function normalizeFigmaNodeValue(value: unknown) {
  return typeof value === 'string' ? value.trim() || undefined : undefined;
}

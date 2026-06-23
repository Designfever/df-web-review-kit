import type { ReviewShellViewportPreset } from './types';
import { getViewportPresetKind } from './viewport';

export type ReviewFigmaFrameConfig = {
  desktopNodeId?: string;
  mobileNodeId?: string;
};

type ReviewFigmaWindow = Window & {
  __figma?: ReviewFigmaFrameConfig;
};

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

  return value ? createFigmaFrameUrl(value) : null;
}

function normalizeFigmaNodeValue(value: unknown) {
  return typeof value === 'string' ? value.trim() || undefined : undefined;
}

function createFigmaFrameUrl(value: string) {
  const [fileKey, nodeId] = value.split('->').map((part) => part.trim());
  if (!fileKey || !nodeId) return null;

  const urlNodeId = encodeURIComponent(nodeId.replace(/:/g, '-'));
  return `https://www.figma.com/design/${encodeURIComponent(
    fileKey
  )}?node-id=${urlNodeId}`;
}

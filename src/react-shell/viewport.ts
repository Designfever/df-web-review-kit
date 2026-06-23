import type { ReviewItem, ReviewViewportPreset } from '../types';
import type { ReviewShellViewportKind, ReviewShellViewportPreset } from './types';

export const DEFAULT_REVIEW_VIEWPORT_PRESETS: ReviewShellViewportPreset[] = [
  { label: 'Mobile', width: 390, height: 720, kind: 'mobile' },
  { label: 'Tablet', width: 768, height: 1024, kind: 'tablet' },
  { label: 'Desktop', width: 1440, height: 900, kind: 'desktop' },
  { label: 'Wide', width: 1980, height: 1080, kind: 'wide' }
];

export const getFallbackPreset = (presets: ReviewShellViewportPreset[]) =>
  presets[0] ?? DEFAULT_REVIEW_VIEWPORT_PRESETS[0];

export const getViewportPresetDistance = (
  preset: ReviewShellViewportPreset,
  width: number,
  height: number
) => Math.abs(preset.width - width) + Math.abs(preset.height - height);

export const findViewportPreset = (
  presets: ReviewShellViewportPreset[],
  width: number,
  height: number
) => {
  const fallback = getFallbackPreset(presets);
  const exact = presets.find(
    (preset) => preset.width === width && preset.height === height
  );

  if (exact) return exact;

  return presets.reduce((closest, preset) => {
    const closestDistance = getViewportPresetDistance(closest, width, height);
    const presetDistance = getViewportPresetDistance(preset, width, height);
    return presetDistance < closestDistance ? preset : closest;
  }, fallback);
};

export const getInitialSize = (
  presets: ReviewShellViewportPreset[]
): ReviewShellViewportPreset => {
  if (typeof window === 'undefined') return getFallbackPreset(presets);

  const params = new URLSearchParams(window.location.search);
  const width = Number(params.get('w'));
  const height = Number(params.get('h'));

  if (
    Number.isFinite(width) &&
    Number.isFinite(height) &&
    width > 0 &&
    height > 0
  ) {
    return findViewportPreset(presets, width, height);
  }

  return getFallbackPreset(presets);
};

export const getRestoredSize = (
  item: ReviewItem,
  presets: ReviewShellViewportPreset[]
): ReviewShellViewportPreset =>
  findViewportPreset(
    presets,
    Math.max(
      240,
      Math.round(item.viewport?.width ?? getFallbackPreset(presets).width)
    ),
    Math.max(
      320,
      Math.round(item.viewport?.height ?? getFallbackPreset(presets).height)
    )
  );

export const getViewportPresetKind = (
  preset: ReviewShellViewportPreset
): ReviewShellViewportKind => {
  if (preset.kind) return preset.kind;

  const label = preset.label.toLowerCase();

  if (label.includes('mobile') || label.includes('phone')) return 'mobile';
  if (label.includes('tablet') || label.includes('pad')) return 'tablet';
  if (
    label.includes('wide') ||
    label.includes('1980') ||
    label.includes('1940') ||
    label.includes('1920')
  ) {
    return 'wide';
  }
  if (label.includes('desktop')) return 'desktop';
  if (preset.width >= 1800) return 'wide';
  if (preset.width >= 1000) return 'desktop';
  if (preset.width >= 700) return 'tablet';
  return 'mobile';
};

export const toReviewViewportPresets = (
  presets: ReviewShellViewportPreset[]
): ReviewViewportPreset[] =>
  presets.map((preset) => ({
    label: preset.label,
    width: preset.width,
    height: preset.height,
    scope: getViewportPresetKind(preset),
    designWidth: preset.designWidth,
    designHeight: preset.designHeight
  }));

export const getIsFigmaOverlayAvailable = (preset: ReviewShellViewportPreset) => {
  const kind = getViewportPresetKind(preset);
  return kind === 'mobile' || kind === 'wide';
};

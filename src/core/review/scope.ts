import type {
  NumberedReviewItem,
  ReviewItem,
  ReviewItemScope,
  ReviewViewportPreset,
  ViewportSize,
} from '../../types';

/** Default viewport presets used when a host project does not provide its own. */
export const DEFAULT_REVIEW_VIEWPORTS: ReviewViewportPreset[] = [
  { label: 'Mobile', width: 390, height: 720, scope: 'mobile' },
  { label: 'Tablet', width: 768, height: 1024, scope: 'tablet' },
  { label: 'Desktop', width: 1440, height: 900, scope: 'desktop' },
  { label: 'Wide', width: 1980, height: 1080, scope: 'wide' },
];

const REVIEW_SCOPE_LABELS: Record<ReviewItemScope, string> = {
  mobile: 'Mobile',
  tablet: 'Tablet',
  desktop: 'Desktop',
  wide: 'Wide',
  dom: 'Element',
};

const normalizeReviewItemScope = (value: unknown): ReviewItemScope | undefined => {
  if (value === 'element') return 'dom';
  if (
    value === 'mobile' ||
    value === 'tablet' ||
    value === 'desktop' ||
    value === 'wide' ||
    value === 'dom'
  ) {
    return value;
  }

  return undefined;
};

const getViewportPresetDistance = (
  preset: ReviewViewportPreset,
  viewport: ViewportSize
) =>
  Math.abs(preset.width - viewport.width) +
  Math.abs(preset.height - viewport.height);

const inferViewportScope = (
  preset: ReviewViewportPreset
): Exclude<ReviewItemScope, 'dom'> => {
  if (preset.scope) return preset.scope;

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

/** Finds the nearest configured preset for a viewport size. */
export function findReviewViewportPreset(
  viewport: ViewportSize,
  presets: ReviewViewportPreset[] = DEFAULT_REVIEW_VIEWPORTS
) {
  const fallback = presets[0] ?? DEFAULT_REVIEW_VIEWPORTS[0];
  const exact = presets.find(
    (preset) =>
      preset.width === viewport.width && preset.height === viewport.height
  );

  if (exact) return exact;

  return presets.reduce((closest, preset) => {
    const closestDistance = getViewportPresetDistance(closest, viewport);
    const presetDistance = getViewportPresetDistance(preset, viewport);
    return presetDistance < closestDistance ? preset : closest;
  }, fallback);
}

/** Resolves a viewport size to the review scope used for item grouping. */
export function getReviewViewportScope(
  viewport: ViewportSize,
  presets: ReviewViewportPreset[] = DEFAULT_REVIEW_VIEWPORTS
): Exclude<ReviewItemScope, 'dom'> {
  return inferViewportScope(findReviewViewportPreset(viewport, presets));
}

/** Resolves an item's persisted scope, falling back to its captured viewport. */
export function getReviewItemScope(
  item: ReviewItem,
  presets: ReviewViewportPreset[] = DEFAULT_REVIEW_VIEWPORTS
): ReviewItemScope {
  const scope = normalizeReviewItemScope(item.scope);
  if (scope && scope !== 'dom') return scope;
  return getReviewViewportScope(item.viewport, presets);
}

/** Returns the display label for an item's resolved review scope. */
export function getReviewItemScopeLabel(
  item: ReviewItem,
  presets: ReviewViewportPreset[] = DEFAULT_REVIEW_VIEWPORTS
) {
  const scope = getReviewItemScope(item, presets);
  if (scope === 'dom') return REVIEW_SCOPE_LABELS.dom;

  const preset = findReviewViewportPreset(item.viewport, presets);
  return preset.label || REVIEW_SCOPE_LABELS[scope];
}

/** Adds scope-aware display labels to review items without mutating them. */
export function getNumberedReviewItems(
  items: ReviewItem[],
  presets: ReviewViewportPreset[] = DEFAULT_REVIEW_VIEWPORTS
): NumberedReviewItem[] {
  const draftLabels = new Map<string, string>();
  let nextDraftNumber = 1;

  [...items]
    .sort((a, b) => {
      const createdOrder = a.createdAt.localeCompare(b.createdAt);
      if (createdOrder !== 0) return createdOrder;
      return a.id.localeCompare(b.id);
    })
    .forEach((item) => {
      if (!getReviewItemNumber(item)) {
        draftLabels.set(item.id, `draft-${nextDraftNumber++}`);
      }
    });

  return items.map((item) => {
    const scope = getReviewItemScope(item, presets);
    const label = getReviewItemScopeLabel(item, presets);
    const number = getReviewItemNumber(item);

    return {
      item,
      scope,
      label,
      number,
      displayLabel: number ? `#${number}` : draftLabels.get(item.id) ?? 'draft',
    };
  });
}

/** Reads a persisted review number when present. */
function getReviewItemNumber(item: Pick<ReviewItem, 'reviewNumber'>) {
  return normalizeReviewNumber(item.reviewNumber);
}


function normalizeReviewNumber(value: unknown) {
  if (typeof value !== 'number') return undefined;
  if (!Number.isInteger(value) || value < 1) return undefined;
  return value;
}

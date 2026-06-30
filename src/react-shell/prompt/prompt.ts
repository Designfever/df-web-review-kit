import type { NumberedReviewItem, ReviewItem } from '../../types';
import { getItemTarget } from '../route';

export const getItemTitle = (item: ReviewItem) =>
  item.title || item.comment.split('\n')[0] || item.kind;

const getItemAssigneeLabel = (item: ReviewItem) =>
  item.assigneeName || item.assigneeId || '(none)';

const formatPromptViewport = (item: ReviewItem) =>
  `${Math.round(item.viewport?.width ?? 0)}x${Math.round(
    item.viewport?.height ?? 0
  )}`;

const formatPromptPoint = (point: { x: number; y: number } | undefined) =>
  point ? `x=${Math.round(point.x)}, y=${Math.round(point.y)}` : '(none)';

const formatPromptSelection = (
  selection:
    | {
        x?: number;
        y?: number;
        left?: number;
        top?: number;
        width: number;
        height: number;
      }
    | undefined
) => {
  if (!selection) return '(none)';

  const x = 'x' in selection ? selection.x : selection.left;
  const y = 'y' in selection ? selection.y : selection.top;
  return `x=${Math.round(x ?? 0)}, y=${Math.round(y ?? 0)}, width=${Math.round(
    selection.width
  )}, height=${Math.round(selection.height)}`;
};

const decodePromptHtmlEntities = (value: string) =>
  value.replace(
    /&(#\d+|#x[\da-f]+|lt|gt|quot|apos|amp);/gi,
    (match, entity: string) => {
      const normalized = entity.toLowerCase();

      if (normalized === 'lt') return '<';
      if (normalized === 'gt') return '>';
      if (normalized === 'quot') return '"';
      if (normalized === 'apos') return "'";
      if (normalized === 'amp') return '&';

      const codePoint = normalized.startsWith('#x')
        ? Number.parseInt(normalized.slice(2), 16)
        : Number.parseInt(normalized.slice(1), 10);

      return Number.isFinite(codePoint)
        ? String.fromCodePoint(codePoint)
        : match;
    }
  );

const getPromptAnchorCandidates = (item: ReviewItem) => {
  const anchor = item.anchor;
  if (!anchor) return [];

  const seen = new Set<string>();
  return [anchor, ...(anchor.candidates ?? [])].filter((candidate) => {
    const key = `${candidate.strategy}:${candidate.selector}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const formatPromptSourceHint = (item: ReviewItem) => {
  const source = item.anchor?.source;
  if (!source) return '(none)';

  return [
    `Component: ${source.component ?? '(unknown)'}`,
    `File: ${source.file ?? '(unknown)'}`,
    `Line: ${source.line ?? '(unknown)'}`,
    `Column: ${source.column ?? '(unknown)'}`,
    `Section index: ${source.sectionIndex ?? '(unknown)'}`,
    `Section id: ${source.sectionId ?? '(none)'}`,
  ].join('\n');
};

export const buildReviewItemPrompt = (
  numberedItem: NumberedReviewItem,
  reviewPathPrefix: string
) => {
  const { item } = numberedItem;
  const anchor = item.anchor;
  const candidates = getPromptAnchorCandidates(item);
  const candidateLines =
    candidates.length > 0
      ? candidates
          .map((candidate, index) => {
            const confidence =
              typeof candidate.confidence === 'number'
                ? `, confidence=${Math.round(candidate.confidence * 100)}%`
                : '';
            const fingerprint = candidate.textFingerprint
              ? `, text="${candidate.textFingerprint}"`
              : '';
            return `${index + 1}. ${candidate.selector} (${candidate.strategy}${confidence}${fingerprint})`;
          })
          .join('\n')
      : '(none)';

  return [
    'Fix this df-web-review-kit QA issue.',
    '',
    `Page: ${getItemTarget(item, reviewPathPrefix)}`,
    `URL: ${item.originalUrl ?? item.pageUrl}`,
    `QA item: ${numberedItem.displayLabel}`,
    `Title: ${item.title?.trim() || '(none)'}`,
    `Assignee: ${getItemAssigneeLabel(item)}`,
    `Viewport: ${numberedItem.label} ${formatPromptViewport(item)}`,
    `Scroll: ${formatPromptPoint(item.scroll)}`,
    '',
    'Target:',
    `Primary selector: ${anchor?.selector ?? '(missing)'}`,
    `Primary strategy: ${anchor?.strategy ?? '(missing)'}`,
    `Text fingerprint: ${anchor?.textFingerprint ?? '(none)'}`,
    'Selector candidates:',
    candidateLines,
    '',
    'Source hint:',
    formatPromptSourceHint(item),
    '',
    `Marker: ${formatPromptPoint(item.marker?.viewport)}`,
    `Marker relative: ${formatPromptPoint(item.marker?.relative)}`,
    `Selection: ${formatPromptSelection(item.selection?.viewport)}`,
    `Selection relative: ${formatPromptSelection(item.selection?.relative)}`,
    '',
    'Element HTML snippet:',
    '```html',
    anchor?.htmlSnippet
      ? decodePromptHtmlEntities(anchor.htmlSnippet)
      : '(not available)',
    '```',
    '',
    'Issue comment:',
    item.comment,
    '',
    'Request:',
    'Find the target element with the selector candidates above and apply the smallest UI/CSS/code change that fixes this QA issue. If the selector is missing because CSR or hydration has not finished, wait for the page to load and use the Source hint first. Preserve unrelated layout and behavior.'
  ].join('\n');
};

export const getPromptLengthLabel = (value: string) => {
  const length = value.length;
  if (length <= 2000) return `${length} chars / Discord 2,000 OK`;
  if (length <= 4000) return `${length} chars / Nitro 4,000 OK`;
  return `${length} chars / attach as file`;
};

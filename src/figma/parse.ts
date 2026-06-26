export type ReviewFigmaNodeRef = {
  fileKey: string;
  nodeId: string;
  sourceUrl?: string;
};

export const FIGMA_NODE_REF_SEPARATOR = '->';

export function parseReviewFigmaNodeRef(
  value: string | ReviewFigmaNodeRef
): ReviewFigmaNodeRef | null {
  if (typeof value !== 'string') return normalizeReviewFigmaNodeRef(value);

  const input = value.trim();
  if (!input) return null;

  return parseReviewFigmaNodeRefValue(input) ?? parseReviewFigmaUrl(input);
}

export function requireReviewFigmaNodeRef(
  value: string | ReviewFigmaNodeRef
): ReviewFigmaNodeRef {
  const ref = parseReviewFigmaNodeRef(value);
  if (!ref) {
    throw new Error('A Figma node link or fileKey->nodeId value is required.');
  }
  return ref;
}

export function createReviewFigmaNodeValue(ref: ReviewFigmaNodeRef) {
  return `${ref.fileKey}${FIGMA_NODE_REF_SEPARATOR}${ref.nodeId}`;
}

export function createReviewFigmaFrameUrl(
  value: string | ReviewFigmaNodeRef
) {
  const ref = parseReviewFigmaNodeRef(value);
  if (!ref) return null;

  return `https://www.figma.com/design/${encodeURIComponent(
    ref.fileKey
  )}?node-id=${encodeURIComponent(ref.nodeId.replace(/:/g, '-'))}`;
}

function parseReviewFigmaNodeRefValue(value: string) {
  const [fileKey, nodeId, extra] = value
    .split(FIGMA_NODE_REF_SEPARATOR)
    .map((part) => part.trim());

  if (!fileKey || !nodeId || extra !== undefined) return null;

  return normalizeReviewFigmaNodeRef({ fileKey, nodeId });
}

function parseReviewFigmaUrl(value: string) {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return null;
  }

  const fileKey = getFigmaFileKey(url);
  const nodeId = normalizeFigmaNodeId(url.searchParams.get('node-id'));
  if (!fileKey || !nodeId) return null;

  return { fileKey, nodeId, sourceUrl: value };
}

function getFigmaFileKey(url: URL) {
  if (!/(^|\.)figma\.com$/i.test(url.hostname)) return null;

  const parts = url.pathname.split('/').filter(Boolean);
  const fileKeyIndex = parts.findIndex((part) =>
    ['design', 'file', 'proto', 'board'].includes(part)
  );
  const fileKey = fileKeyIndex >= 0 ? parts[fileKeyIndex + 1] : null;

  return normalizeFigmaFileKey(fileKey);
}

function normalizeReviewFigmaNodeRef(
  value: ReviewFigmaNodeRef | null | undefined
) {
  const fileKey = normalizeFigmaFileKey(value?.fileKey);
  const nodeId = normalizeFigmaNodeId(value?.nodeId);
  if (!fileKey || !nodeId) return null;
  const sourceUrl = normalizeOptionalString(value?.sourceUrl);

  return sourceUrl ? { fileKey, nodeId, sourceUrl } : { fileKey, nodeId };
}

function normalizeFigmaFileKey(value: string | null | undefined) {
  return normalizeOptionalString(value)?.replace(/[?#].*$/, '') ?? null;
}

function normalizeFigmaNodeId(value: string | null | undefined) {
  const nodeId = normalizeOptionalString(value);
  if (!nodeId) return null;
  if (nodeId.includes(':')) return nodeId;
  return nodeId.replace(/-/g, ':');
}

function normalizeOptionalString(value: string | null | undefined) {
  if (typeof value !== 'string') return null;
  return value.trim() || null;
}

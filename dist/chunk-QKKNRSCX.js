// src/figma/parse.ts
var FIGMA_NODE_REF_SEPARATOR = "->";
function parseReviewFigmaNodeRef(value) {
  if (typeof value !== "string") return normalizeReviewFigmaNodeRef(value);
  const input = value.trim();
  if (!input) return null;
  return parseReviewFigmaNodeRefValue(input) ?? parseReviewFigmaUrl(input);
}
function requireReviewFigmaNodeRef(value) {
  const ref = parseReviewFigmaNodeRef(value);
  if (!ref) {
    throw new Error("A Figma node link or fileKey->nodeId value is required.");
  }
  return ref;
}
function createReviewFigmaNodeValue(ref) {
  return `${ref.fileKey}${FIGMA_NODE_REF_SEPARATOR}${ref.nodeId}`;
}
function createReviewFigmaFrameUrl(value) {
  const ref = parseReviewFigmaNodeRef(value);
  if (!ref) return null;
  return `https://www.figma.com/design/${encodeURIComponent(
    ref.fileKey
  )}?node-id=${encodeURIComponent(ref.nodeId.replace(/:/g, "-"))}`;
}
function parseReviewFigmaNodeRefValue(value) {
  const [fileKey, nodeId, extra] = value.split(FIGMA_NODE_REF_SEPARATOR).map((part) => part.trim());
  if (!fileKey || !nodeId || extra !== void 0) return null;
  return normalizeReviewFigmaNodeRef({ fileKey, nodeId });
}
function parseReviewFigmaUrl(value) {
  let url;
  try {
    url = new URL(value);
  } catch {
    return null;
  }
  const fileKey = getFigmaFileKey(url);
  const nodeId = normalizeFigmaNodeId(url.searchParams.get("node-id"));
  if (!fileKey || !nodeId) return null;
  return { fileKey, nodeId, sourceUrl: value };
}
function getFigmaFileKey(url) {
  if (!/(^|\.)figma\.com$/i.test(url.hostname)) return null;
  const parts = url.pathname.split("/").filter(Boolean);
  const fileKeyIndex = parts.findIndex(
    (part) => ["design", "file", "proto", "board"].includes(part)
  );
  const fileKey = fileKeyIndex >= 0 ? parts[fileKeyIndex + 1] : null;
  return normalizeFigmaFileKey(fileKey);
}
function normalizeReviewFigmaNodeRef(value) {
  const fileKey = normalizeFigmaFileKey(value?.fileKey);
  const nodeId = normalizeFigmaNodeId(value?.nodeId);
  if (!fileKey || !nodeId) return null;
  const sourceUrl = normalizeOptionalString(value?.sourceUrl);
  return sourceUrl ? { fileKey, nodeId, sourceUrl } : { fileKey, nodeId };
}
function normalizeFigmaFileKey(value) {
  return normalizeOptionalString(value)?.replace(/[?#].*$/, "") ?? null;
}
function normalizeFigmaNodeId(value) {
  const nodeId = normalizeOptionalString(value);
  if (!nodeId) return null;
  if (nodeId.includes(":")) return nodeId;
  return nodeId.replace(/-/g, ":");
}
function normalizeOptionalString(value) {
  if (typeof value !== "string") return null;
  return value.trim() || null;
}

export {
  FIGMA_NODE_REF_SEPARATOR,
  parseReviewFigmaNodeRef,
  requireReviewFigmaNodeRef,
  createReviewFigmaNodeValue,
  createReviewFigmaFrameUrl
};
//# sourceMappingURL=chunk-QKKNRSCX.js.map
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

// src/figma/token.ts
var DEFAULT_REVIEW_FIGMA_TOKEN_ENV_KEY = "FIGMA_TOKEN";
var REVIEW_FIGMA_TOKEN_MISSING_CODE = "DFWR_FIGMA_TOKEN_MISSING";
var ReviewFigmaTokenError = class extends Error {
  constructor(envKey = DEFAULT_REVIEW_FIGMA_TOKEN_ENV_KEY) {
    super(
      `Figma image rendering requires server env ${envKey}. Set ${envKey} in the dev/server environment; do not expose it as VITE_${envKey}.`
    );
    this.code = REVIEW_FIGMA_TOKEN_MISSING_CODE;
    this.name = "ReviewFigmaTokenError";
    this.envKey = envKey;
  }
};
function readReviewFigmaToken(options = {}) {
  if (options.enabled === false) return null;
  const envKey = options.envKey ?? DEFAULT_REVIEW_FIGMA_TOKEN_ENV_KEY;
  return normalizeReviewFigmaToken(options.token ?? options.env?.[envKey]);
}
function requireReviewFigmaToken(options = {}) {
  const envKey = options.envKey ?? DEFAULT_REVIEW_FIGMA_TOKEN_ENV_KEY;
  const token = readReviewFigmaToken(options);
  if (!token) throw new ReviewFigmaTokenError(envKey);
  return token;
}
function isReviewFigmaTokenError(error) {
  if (!error || typeof error !== "object") return false;
  return error instanceof ReviewFigmaTokenError || "code" in error && error.code === REVIEW_FIGMA_TOKEN_MISSING_CODE;
}
function normalizeReviewFigmaToken(value) {
  if (typeof value !== "string") return null;
  return value.trim() || null;
}

// src/figma/render.ts
var DEFAULT_FIGMA_API_BASE_URL = "https://api.figma.com";
async function renderReviewFigmaImage(options) {
  const token = requireReviewFigmaToken({ token: options.token });
  const ref = requireReviewFigmaNodeRef(options.figmaUrl);
  const renderFormat = options.format ?? "png";
  const requestUrl = createReviewFigmaImageApiUrl({
    apiBaseUrl: options.apiBaseUrl,
    fileKey: ref.fileKey,
    nodeId: ref.nodeId,
    format: renderFormat,
    scale: options.scale,
    useAbsoluteBounds: options.useAbsoluteBounds
  });
  const fetchImage = options.fetch ?? globalThis.fetch;
  if (!fetchImage) throw new Error("Figma image rendering requires fetch.");
  const response = await fetchImage(requestUrl, {
    headers: {
      "X-Figma-Token": token
    },
    signal: options.signal
  });
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(
      body?.err || `Figma image render failed with ${response.status}`
    );
  }
  const imageUrl = body?.images?.[ref.nodeId];
  if (!imageUrl) {
    throw new Error(`Figma image render returned no URL for ${ref.nodeId}.`);
  }
  return {
    fileKey: ref.fileKey,
    nodeId: ref.nodeId,
    figmaUrl: typeof options.figmaUrl === "string" ? options.figmaUrl : options.figmaUrl.sourceUrl,
    imageUrl,
    renderFormat
  };
}
function createReviewFigmaImageApiUrl({
  apiBaseUrl = DEFAULT_FIGMA_API_BASE_URL,
  fileKey,
  nodeId,
  format = "png",
  scale,
  useAbsoluteBounds
}) {
  const url = new URL(`/v1/images/${encodeURIComponent(fileKey)}`, apiBaseUrl);
  url.searchParams.set("ids", nodeId);
  url.searchParams.set("format", format);
  if (typeof scale === "number" && Number.isFinite(scale) && scale > 0) {
    url.searchParams.set("scale", String(scale));
  }
  if (useAbsoluteBounds !== void 0) {
    url.searchParams.set("use_absolute_bounds", String(useAbsoluteBounds));
  }
  return url.toString();
}

// src/vite/figma-asset.ts
function parseReviewFigmaImageFormat(value) {
  return value === "webp" || value === "png" || value === "jpg" ? value : void 0;
}
function getStoreRenderFormat(renderFormat, imageFormat) {
  if (renderFormat === "jpg" || renderFormat === "png") return renderFormat;
  if (imageFormat === "jpg") return "jpg";
  return "png";
}
function getReviewFigmaImageFormatFromMimeType(mimeType) {
  if (mimeType === "image/webp") return "webp";
  if (mimeType === "image/png") return "png";
  if (mimeType === "image/jpeg") return "jpg";
  return null;
}
function normalizeImageMimeType(value) {
  const mimeType = value?.split(";")[0]?.trim().toLowerCase();
  if (mimeType === "image/jpg") return "image/jpeg";
  if (mimeType === "image/jpeg" || mimeType === "image/png" || mimeType === "image/webp") {
    return mimeType;
  }
  return null;
}
function createReviewFigmaAssetStorageKey(id, imageFormat) {
  return `${id}.${getReviewFigmaAssetExtension(imageFormat)}`;
}
function createReviewFigmaAssetUrl(assetEndpoint, storageKey) {
  return `${assetEndpoint}/${encodeURIComponent(storageKey)}`;
}
function getReviewFigmaAssetStorageKeyFromPathname(pathname, assetEndpoint) {
  try {
    const storageKey = decodeURIComponent(
      pathname.slice(assetEndpoint.length + 1)
    );
    return isSafeReviewFigmaAssetStorageKey(storageKey) ? storageKey : null;
  } catch {
    return null;
  }
}
function isSafeReviewFigmaAssetStorageKey(value) {
  return /^figma_[a-z0-9_]+\.(webp|png|jpg)$/.test(value);
}
function getReviewFigmaAssetExtension(format) {
  return format === "jpg" ? "jpg" : format;
}
function getReviewFigmaAssetMimeType(storageKey) {
  if (storageKey.endsWith(".jpg")) return "image/jpeg";
  if (storageKey.endsWith(".webp")) return "image/webp";
  return "image/png";
}

// src/figma/image.store.ts
var DEFAULT_REVIEW_FIGMA_IMAGE_STORE_ENDPOINT = "/__dfwr/figma-images";
function createReviewFigmaImageStoreClient(options = {}) {
  const endpoint = options.endpoint ?? DEFAULT_REVIEW_FIGMA_IMAGE_STORE_ENDPOINT;
  const request = createReviewFigmaImageStoreRequest(endpoint, options.fetch);
  return {
    listImages(target) {
      const url = `${endpoint}?target=${encodeURIComponent(
        JSON.stringify(target)
      )}`;
      return request(url);
    },
    async addImage(input) {
      const nextInput = await createClientRenderedAddImageInput(
        input,
        options.clientRender,
        options.fetch
      );
      return request(endpoint, {
        method: "POST",
        body: JSON.stringify(nextInput),
        figmaToken: readReviewFigmaImageToken(
          options.token ?? getStoredReviewFigmaImageToken
        )
      });
    },
    updateImage(id, patch) {
      return request(`${endpoint}/${encodeURIComponent(id)}`, {
        method: "PATCH",
        body: JSON.stringify(patch)
      });
    },
    reorderImages(input) {
      return request(`${endpoint}/reorder`, {
        method: "PATCH",
        body: JSON.stringify(input)
      });
    },
    deleteImage(id) {
      return request(`${endpoint}/${encodeURIComponent(id)}`, {
        method: "DELETE"
      });
    }
  };
}
async function createClientRenderedAddImageInput(input, clientRender, fetchOption) {
  const options = normalizeClientRenderOptions(clientRender);
  if (!options) return input;
  const token = readClientRenderToken(options);
  if (!token) return input;
  try {
    const asset = await createReviewFigmaClientRenderedAsset({
      ...options,
      fetch: fetchOption,
      figmaUrl: input.figmaUrl,
      token
    });
    return {
      ...input,
      imageFormat: asset.imageFormat,
      asset
    };
  } catch {
    return input;
  }
}
function normalizeClientRenderOptions(clientRender) {
  if (!clientRender) return null;
  if (clientRender === true) return {};
  return clientRender;
}
function readClientRenderToken(options) {
  const token = typeof options.token === "function" ? options.token() : options.token;
  return typeof token === "string" ? token.trim() : "";
}
async function createClientRenderedFigmaAsset(figmaUrl, token, options, fetchOption) {
  const ref = parseReviewFigmaNodeRef(figmaUrl);
  if (!ref) throw new Error("A Figma node link is required.");
  const requestFetch = fetchOption ?? globalThis.fetch;
  if (!requestFetch) throw new Error("Figma client rendering requires fetch.");
  const renderFormat = options.renderFormat ?? "png";
  const response = await requestFetch(
    createReviewFigmaImageApiUrl({
      apiBaseUrl: options.apiBaseUrl,
      fileKey: ref.fileKey,
      nodeId: ref.nodeId,
      format: renderFormat,
      scale: options.renderScale,
      useAbsoluteBounds: options.useAbsoluteBounds
    }),
    {
      headers: {
        "X-Figma-Token": token
      }
    }
  );
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(body?.err || `Figma image render failed with ${response.status}`);
  }
  const imageUrl = body?.images?.[ref.nodeId];
  if (!imageUrl) throw new Error(`Figma image render returned no URL for ${ref.nodeId}.`);
  const imageResponse = await requestFetch(imageUrl);
  if (!imageResponse.ok) {
    throw new Error(`Figma image download failed with ${imageResponse.status}`);
  }
  const originalBlob = await imageResponse.blob();
  const originalMimeType = normalizeClientImageMimeType(originalBlob.type) ?? getReviewFigmaImageMimeType(renderFormat === "jpg" ? "jpg" : "png");
  const originalFormat = getReviewFigmaImageFormatFromMimeType(originalMimeType) ?? (renderFormat === "jpg" ? "jpg" : "png");
  const dimensions = await readImageBlobDimensions(originalBlob);
  const shouldConvertToWebp = options.convertToWebp ?? true;
  const convertedBlob = shouldConvertToWebp ? await convertImageBlobToWebp(
    originalBlob,
    options.webpQuality ?? 0.9,
    dimensions
  ).catch(() => null) : null;
  const finalBlob = convertedBlob?.type === "image/webp" ? convertedBlob : originalBlob;
  const finalMimeType = normalizeClientImageMimeType(finalBlob.type) ?? originalMimeType;
  const finalFormat = getReviewFigmaImageFormatFromMimeType(finalMimeType) ?? originalFormat;
  return {
    dataUrl: await blobToDataUrl(finalBlob),
    imageFormat: finalFormat,
    mimeType: finalMimeType,
    byteSize: finalBlob.size,
    width: dimensions.width,
    height: dimensions.height
  };
}
function createReviewFigmaClientRenderedAsset({
  fetch: fetchOption,
  figmaUrl,
  token,
  ...options
}) {
  return withTimeout(
    createClientRenderedFigmaAsset(figmaUrl, token, options, fetchOption),
    options.timeoutMs ?? 1e4
  );
}
async function readImageBlobDimensions(blob) {
  const image = await loadImageBlob(blob);
  return {
    width: image.naturalWidth || image.width,
    height: image.naturalHeight || image.height
  };
}
async function convertImageBlobToWebp(blob, quality, dimensions) {
  if (typeof document === "undefined") return null;
  if (!dimensions.width || !dimensions.height) return null;
  const image = await loadImageBlob(blob);
  const canvas = document.createElement("canvas");
  canvas.width = dimensions.width;
  canvas.height = dimensions.height;
  const context = canvas.getContext("2d");
  if (!context) return null;
  context.drawImage(image, 0, 0);
  return new Promise((resolve) => {
    canvas.toBlob(resolve, "image/webp", quality);
  });
}
function loadImageBlob(blob) {
  return new Promise((resolve, reject) => {
    if (typeof Image === "undefined" || typeof URL === "undefined") {
      reject(new Error("Image decoding is unavailable."));
      return;
    }
    const image = new Image();
    const objectUrl = URL.createObjectURL(blob);
    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Image decoding failed."));
    };
    image.src = objectUrl;
  });
}
function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }
      reject(new Error("Blob encoding failed."));
    };
    reader.onerror = () => reject(reader.error ?? new Error("Blob encoding failed."));
    reader.readAsDataURL(blob);
  });
}
function normalizeClientImageMimeType(value) {
  const mimeType = value?.split(";")[0]?.trim().toLowerCase();
  if (mimeType === "image/jpg") return "image/jpeg";
  if (mimeType === "image/jpeg" || mimeType === "image/png" || mimeType === "image/webp") {
    return mimeType;
  }
  return null;
}
async function withTimeout(promise, timeoutMs) {
  let timeoutId;
  try {
    return await Promise.race([
      promise,
      new Promise((_, reject) => {
        timeoutId = setTimeout(
          () => reject(new Error("Figma client rendering timed out.")),
          timeoutMs
        );
      })
    ]);
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}
function getReviewFigmaImageTargetKey(target) {
  return JSON.stringify(normalizeReviewFigmaImageTarget(target));
}
function getReviewFigmaImageMimeType(format) {
  if (format === "jpg") return "image/jpeg";
  if (format === "png") return "image/png";
  return "image/webp";
}
function createReviewFigmaImageStoreRequest(endpoint, fetchOption) {
  return async (input, init = {}) => {
    const requestFetch = fetchOption ?? globalThis.fetch;
    if (!requestFetch) throw new Error("Figma image store requires fetch.");
    const figmaToken = init.figmaToken ?? "";
    const { figmaToken: _figmaToken, ...requestInit } = init;
    const response = await requestFetch(input, {
      ...requestInit,
      headers: {
        "Content-Type": "application/json",
        ...figmaToken ? { "X-Figma-Token": figmaToken } : {},
        ...requestInit.headers ?? {}
      }
    });
    const text = await response.text();
    const body = text ? JSON.parse(text) : null;
    if (!response.ok) {
      const message = typeof body?.error === "string" ? body.error : `Figma image store request failed: ${response.status}`;
      throw new Error(message);
    }
    return body;
  };
}
function readReviewFigmaImageToken(provider) {
  const token = typeof provider === "function" ? provider() : provider;
  return typeof token === "string" ? token.trim() : "";
}
function getStoredReviewFigmaImageToken() {
  if (typeof window === "undefined") return "";
  try {
    return window.localStorage.getItem("figma-token") ?? "";
  } catch {
    return "";
  }
}
function normalizeReviewFigmaImageTarget(target) {
  if (target.type === "figma-node") {
    return {
      type: target.type,
      projectId: target.projectId,
      fileKey: target.fileKey,
      nodeId: target.nodeId
    };
  }
  return {
    type: target.type,
    projectId: target.projectId,
    pageUrl: target.pageUrl,
    slot: target.slot ?? "",
    viewport: target.viewport ? {
      label: target.viewport.label ?? "",
      width: target.viewport.width ?? null,
      height: target.viewport.height ?? null,
      scope: target.viewport.scope ?? ""
    } : null
  };
}

// src/figma/image.snapshot.ts
function createReviewFigmaImagesSnapshot(images, options = {}) {
  const targetKeys = options.targets?.length ? new Set(options.targets.map(getReviewFigmaImageTargetKey)) : null;
  return images.filter((image) => {
    if (options.projectId && image.projectId !== options.projectId) {
      return false;
    }
    if (targetKeys && !targetKeys.has(getReviewFigmaImageTargetKey(image.target))) {
      return false;
    }
    return true;
  }).map(cloneReviewFigmaImage).sort(compareReviewFigmaSnapshotImages);
}
function createReviewFigmaReleaseSnapshot({
  images,
  projectId,
  releaseId,
  label,
  createdAt,
  targets
}) {
  return {
    version: 1,
    projectId,
    ...releaseId ? { releaseId } : null,
    ...label ? { label } : null,
    createdAt: createdAt ?? (/* @__PURE__ */ new Date()).toISOString(),
    figmaImagesSnapshot: createReviewFigmaImagesSnapshot(images, {
      projectId,
      targets
    })
  };
}
async function collectReviewFigmaReleaseSnapshot({
  store,
  targets,
  ...snapshotOptions
}) {
  const imagesByTarget = await Promise.all(
    targets.map((target) => store.listImages(target))
  );
  return createReviewFigmaReleaseSnapshot({
    ...snapshotOptions,
    targets,
    images: dedupeReviewFigmaImages(imagesByTarget.flat())
  });
}
function dedupeReviewFigmaImages(images) {
  return Array.from(new Map(images.map((image) => [image.id, image])).values());
}
function cloneReviewFigmaImage(image) {
  return {
    ...image,
    target: cloneReviewFigmaImageTarget(image.target)
  };
}
function cloneReviewFigmaImageTarget(target) {
  if (target.type === "figma-node") {
    return {
      type: target.type,
      projectId: target.projectId,
      fileKey: target.fileKey,
      nodeId: target.nodeId
    };
  }
  return {
    type: target.type,
    projectId: target.projectId,
    pageUrl: target.pageUrl,
    slot: target.slot,
    viewport: target.viewport ? {
      label: target.viewport.label,
      width: target.viewport.width,
      height: target.viewport.height,
      scope: target.viewport.scope
    } : void 0
  };
}
function compareReviewFigmaSnapshotImages(a, b) {
  return a.projectId.localeCompare(b.projectId) || getReviewFigmaImageTargetKey(a.target).localeCompare(
    getReviewFigmaImageTargetKey(b.target)
  ) || a.order - b.order || a.createdAt.localeCompare(b.createdAt) || a.id.localeCompare(b.id);
}

export {
  parseReviewFigmaImageFormat,
  getStoreRenderFormat,
  getReviewFigmaImageFormatFromMimeType,
  normalizeImageMimeType,
  createReviewFigmaAssetStorageKey,
  createReviewFigmaAssetUrl,
  getReviewFigmaAssetStorageKeyFromPathname,
  isSafeReviewFigmaAssetStorageKey,
  getReviewFigmaAssetMimeType,
  FIGMA_NODE_REF_SEPARATOR,
  parseReviewFigmaNodeRef,
  requireReviewFigmaNodeRef,
  createReviewFigmaNodeValue,
  createReviewFigmaFrameUrl,
  DEFAULT_REVIEW_FIGMA_TOKEN_ENV_KEY,
  REVIEW_FIGMA_TOKEN_MISSING_CODE,
  ReviewFigmaTokenError,
  readReviewFigmaToken,
  requireReviewFigmaToken,
  isReviewFigmaTokenError,
  renderReviewFigmaImage,
  createReviewFigmaImageApiUrl,
  DEFAULT_REVIEW_FIGMA_IMAGE_STORE_ENDPOINT,
  createReviewFigmaImageStoreClient,
  createReviewFigmaClientRenderedAsset,
  getReviewFigmaImageTargetKey,
  getReviewFigmaImageMimeType,
  createReviewFigmaImagesSnapshot,
  createReviewFigmaReleaseSnapshot,
  collectReviewFigmaReleaseSnapshot
};
//# sourceMappingURL=chunk-K26WLRRP.js.map
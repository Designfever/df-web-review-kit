import {
  DEFAULT_REVIEW_FIGMA_IMAGE_STORE_ENDPOINT,
  DEFAULT_REVIEW_FIGMA_TOKEN_ENV_KEY,
  ReviewFigmaTokenError,
  collectReviewFigmaReleaseSnapshot,
  createReviewFigmaAssetStorageKey,
  createReviewFigmaAssetUrl,
  createReviewFigmaImageApiUrl,
  createReviewFigmaImagesSnapshot,
  createReviewFigmaReleaseSnapshot,
  getReviewFigmaAssetMimeType,
  getReviewFigmaAssetStorageKeyFromPathname,
  getReviewFigmaImageFormatFromMimeType,
  getReviewFigmaImageMimeType,
  getReviewFigmaImageTargetKey,
  getStoreRenderFormat,
  isSafeReviewFigmaAssetStorageKey,
  normalizeImageMimeType,
  parseReviewFigmaImageFormat,
  parseReviewFigmaNodeRef,
  readReviewFigmaToken,
  renderReviewFigmaImage,
  requireReviewFigmaToken
} from "./chunk-K26WLRRP.js";

// src/vite/figma-image-store.ts
import path3 from "path";
import { loadEnv } from "vite";

// src/vite/figma-image-store.server.ts
import { readFile as readFile2 } from "fs/promises";
import path2 from "path";

// src/vite/figma-image-store.image.ts
import { mkdir, readFile, rm, writeFile } from "fs/promises";
import path from "path";
function requireReviewFigmaRequestToken({
  enabled,
  env,
  envKey,
  requestToken,
  token
}) {
  const tokenEnvKey = envKey ?? DEFAULT_REVIEW_FIGMA_TOKEN_ENV_KEY;
  const figmaToken = readReviewFigmaToken({ token, env, envKey: tokenEnvKey, enabled }) || readReviewFigmaToken({
    token: requestToken,
    env: {},
    envKey: tokenEnvKey,
    enabled
  });
  if (!figmaToken) throw new ReviewFigmaTokenError(tokenEnvKey);
  return figmaToken;
}
async function readReviewFigmaNodeName({
  apiBaseUrl,
  enabled,
  env,
  envKey,
  fetchOption,
  fileKey,
  nodeId,
  token,
  requestToken
}) {
  const figmaToken = requireReviewFigmaRequestToken({
    enabled,
    env,
    envKey,
    requestToken,
    token
  });
  const fetchNode = fetchOption ?? globalThis.fetch;
  if (!fetchNode) throw new Error("Figma node name lookup requires fetch.");
  const response = await fetchNode(
    createReviewFigmaNodeApiUrl({ apiBaseUrl, fileKey, nodeId }),
    {
      headers: {
        "X-Figma-Token": figmaToken
      }
    }
  );
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(body?.err || `Figma node lookup failed with ${response.status}`);
  }
  const nodes = body?.nodes;
  const node = nodes?.[nodeId] ?? Object.values(nodes ?? {})[0];
  return normalizeOptionalText(node?.document?.name);
}
function createReviewFigmaNodeApiUrl({
  apiBaseUrl = "https://api.figma.com",
  fileKey,
  nodeId
}) {
  const url = new URL(
    `/v1/files/${encodeURIComponent(fileKey)}/nodes`,
    apiBaseUrl
  );
  url.searchParams.set("ids", nodeId);
  return url.toString();
}
async function createReviewFigmaImage({
  assetDir,
  assetEndpoint,
  currentImages,
  env,
  input,
  options,
  requestToken
}) {
  const ref = parseReviewFigmaNodeRef(input.figmaUrl);
  if (!ref) {
    throw new Error("A Figma node copy link or fileKey->nodeId value is required.");
  }
  const id = createReviewFigmaImageId();
  const explicitLabel = normalizeOptionalText(input.label);
  if (input.asset) {
    const cachedAsset2 = await cacheReviewFigmaProvidedImageAsset({
      assetDir,
      assetEndpoint,
      id,
      asset: input.asset,
      options
    });
    const now2 = (/* @__PURE__ */ new Date()).toISOString();
    const order2 = typeof input.order === "number" && Number.isFinite(input.order) ? input.order : getNextImageOrder(currentImages, input.target);
    return {
      id,
      projectId: input.target.projectId,
      target: input.target,
      figmaUrl: input.figmaUrl,
      fileKey: ref.fileKey,
      nodeId: ref.nodeId,
      imageUrl: cachedAsset2.imageUrl,
      imageFormat: cachedAsset2.imageFormat,
      mimeType: cachedAsset2.mimeType,
      label: explicitLabel,
      order: order2,
      storageKey: cachedAsset2.storageKey,
      width: input.asset.width,
      height: input.asset.height,
      byteSize: cachedAsset2.byteSize,
      createdAt: now2,
      updatedAt: now2
    };
  }
  const nodeLabelPromise = explicitLabel ? Promise.resolve(void 0) : readReviewFigmaNodeName({
    apiBaseUrl: options.apiBaseUrl,
    enabled: options.enabled,
    env,
    envKey: options.envKey,
    fetchOption: options.fetch,
    fileKey: ref.fileKey,
    nodeId: ref.nodeId,
    token: options.token,
    requestToken
  }).catch(() => void 0);
  const targetImageFormat = input.imageFormat ?? options.imageFormat ?? "webp";
  const renderFormat = getStoreRenderFormat(options.renderFormat, targetImageFormat);
  const rendered = await renderReviewFigmaImage({
    figmaUrl: input.figmaUrl,
    format: renderFormat,
    scale: options.renderScale,
    useAbsoluteBounds: options.useAbsoluteBounds,
    apiBaseUrl: options.apiBaseUrl,
    fetch: options.fetch,
    token: requireReviewFigmaRequestToken({
      enabled: options.enabled,
      env,
      envKey: options.envKey,
      requestToken,
      token: options.token
    })
  });
  const cachedAsset = await cacheReviewFigmaImageAsset({
    assetDir,
    assetEndpoint,
    id,
    imageUrl: rendered.imageUrl,
    options,
    renderFormat,
    targetImageFormat
  });
  const imageFormat = cachedAsset?.imageFormat ?? (renderFormat === "jpg" ? "jpg" : "png");
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const order = typeof input.order === "number" && Number.isFinite(input.order) ? input.order : getNextImageOrder(currentImages, input.target);
  const nodeLabel = await nodeLabelPromise;
  return {
    id,
    projectId: input.target.projectId,
    target: input.target,
    figmaUrl: input.figmaUrl,
    fileKey: rendered.fileKey,
    nodeId: rendered.nodeId,
    imageUrl: cachedAsset?.imageUrl ?? rendered.imageUrl,
    imageFormat,
    mimeType: cachedAsset?.mimeType ?? getReviewFigmaImageMimeType(imageFormat),
    label: explicitLabel ?? nodeLabel,
    order,
    storageKey: cachedAsset?.storageKey,
    byteSize: cachedAsset?.byteSize,
    createdAt: now,
    updatedAt: now
  };
}
async function cacheReviewFigmaProvidedImageAsset({
  assetDir,
  assetEndpoint,
  id,
  asset,
  options
}) {
  const decodedAsset = decodeReviewFigmaImageAsset(asset);
  const storageKey = createReviewFigmaAssetStorageKey(
    id,
    decodedAsset.imageFormat
  );
  await mkdir(assetDir, { recursive: true });
  await writeFile(path.join(assetDir, storageKey), decodedAsset.data);
  return {
    imageUrl: createReviewFigmaAssetUrl(assetEndpoint, storageKey),
    imageFormat: decodedAsset.imageFormat,
    mimeType: decodedAsset.mimeType,
    storageKey,
    byteSize: decodedAsset.data.byteLength
  };
}
function decodeReviewFigmaImageAsset(asset) {
  const mimeType = normalizeImageMimeType(asset.mimeType);
  if (!mimeType) throw new Error("Unsupported Figma image asset MIME type.");
  const imageFormat = getReviewFigmaImageFormatFromMimeType(mimeType) ?? asset.imageFormat;
  const match = /^data:([^;,]+);base64,([a-zA-Z0-9+/=\s]+)$/.exec(
    asset.dataUrl
  );
  if (!match) throw new Error("Valid Figma image asset data URL is required.");
  const dataUrlMimeType = normalizeImageMimeType(match[1]);
  if (dataUrlMimeType && dataUrlMimeType !== mimeType) {
    throw new Error("Figma image asset MIME type mismatch.");
  }
  return {
    data: Buffer.from(match[2].replace(/\s/g, ""), "base64"),
    imageFormat,
    mimeType
  };
}
async function cacheReviewFigmaImageAsset({
  assetDir,
  assetEndpoint,
  id,
  imageUrl,
  options,
  renderFormat,
  targetImageFormat
}) {
  if (options.cacheAssets === false) return null;
  const asset = await downloadReviewFigmaImageAsset({
    fetchOption: options.fetch,
    imageUrl,
    renderFormat,
    targetImageFormat,
    transformAsset: options.transformAsset
  });
  const storageKey = createReviewFigmaAssetStorageKey(id, asset.imageFormat);
  await mkdir(assetDir, { recursive: true });
  await writeFile(path.join(assetDir, storageKey), asset.data);
  return {
    imageUrl: createReviewFigmaAssetUrl(assetEndpoint, storageKey),
    imageFormat: asset.imageFormat,
    mimeType: asset.mimeType,
    storageKey,
    byteSize: asset.data.byteLength
  };
}
async function downloadReviewFigmaImageAsset({
  fetchOption,
  imageUrl,
  renderFormat,
  targetImageFormat,
  transformAsset
}) {
  const fetchImage = fetchOption ?? globalThis.fetch;
  if (!fetchImage) throw new Error("Figma image caching requires fetch.");
  const response = await fetchImage(imageUrl);
  if (!response.ok) {
    throw new Error(`Figma image download failed with ${response.status}`);
  }
  const sourceMimeType = normalizeImageMimeType(response.headers.get("content-type")) ?? getReviewFigmaImageMimeType(renderFormat === "jpg" ? "jpg" : "png");
  const sourceImageFormat = getReviewFigmaImageFormatFromMimeType(sourceMimeType) ?? (renderFormat === "jpg" ? "jpg" : "png");
  const sourceData = new Uint8Array(await response.arrayBuffer());
  const transformed = transformAsset ? await transformAsset({
    data: sourceData,
    imageFormat: sourceImageFormat,
    mimeType: sourceMimeType,
    targetFormat: targetImageFormat
  }) : null;
  const imageFormat = transformed?.imageFormat ?? sourceImageFormat;
  const mimeType = normalizeImageMimeType(transformed?.mimeType) ?? getReviewFigmaImageMimeType(imageFormat);
  const data = createBufferFromImageData(transformed?.data ?? sourceData);
  return { data, imageFormat, mimeType };
}
async function deleteReviewFigmaImageAsset(assetDir, storageKey) {
  if (!storageKey) return;
  if (!isSafeReviewFigmaAssetStorageKey(storageKey)) return;
  await rm(path.join(assetDir, storageKey), { force: true }).catch(() => null);
}
function createBufferFromImageData(data) {
  return data instanceof ArrayBuffer ? Buffer.from(new Uint8Array(data)) : Buffer.from(data);
}
function listImagesForTarget(images, target) {
  const targetKey = getReviewFigmaImageTargetKey(target);
  return images.filter((image) => getReviewFigmaImageTargetKey(image.target) === targetKey).sort(compareReviewFigmaImages);
}
function reorderReviewFigmaImages(images, input) {
  const targetKey = getReviewFigmaImageTargetKey(input.target);
  const orderById = new Map(input.imageIds.map((id, index) => [id, index]));
  const targetImages = listImagesForTarget(images, input.target);
  const nextTargetImages = targetImages.map((image) => ({
    ...image,
    order: orderById.get(image.id) ?? input.imageIds.length + image.order,
    updatedAt: orderById.has(image.id) ? (/* @__PURE__ */ new Date()).toISOString() : image.updatedAt
  })).sort(compareReviewFigmaImages);
  const nextTargetImageById = new Map(
    nextTargetImages.map((image, index) => [image.id, { ...image, order: index }])
  );
  const allImages = images.map(
    (image) => getReviewFigmaImageTargetKey(image.target) === targetKey ? nextTargetImageById.get(image.id) ?? image : image
  );
  return {
    allImages,
    targetImages: listImagesForTarget(allImages, input.target)
  };
}
function updateReviewFigmaImage(images, id, patch) {
  const index = images.findIndex((image) => image.id === id);
  if (index < 0) return null;
  const nextImage = {
    ...images[index],
    label: patch.label === void 0 ? images[index].label : normalizeOptionalText(patch.label),
    order: typeof patch.order === "number" && Number.isFinite(patch.order) ? patch.order : images[index].order,
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  const nextImages = [...images];
  nextImages[index] = nextImage;
  return { image: nextImage, images: nextImages };
}
async function readReviewFigmaImageStoreFile(dataFile) {
  try {
    const raw = await readFile(dataFile, "utf8");
    const parsed = JSON.parse(raw);
    return {
      version: 1,
      images: Array.isArray(parsed.images) ? parsed.images.flatMap((image) => isReviewFigmaImage(image) ? [image] : []) : []
    };
  } catch (error) {
    if (isNodeError(error) && error.code === "ENOENT") {
      return { version: 1, images: [] };
    }
    throw error;
  }
}
async function writeReviewFigmaImageStoreFile(dataFile, data) {
  await mkdir(path.dirname(dataFile), { recursive: true });
  await writeFile(
    dataFile,
    `${JSON.stringify({ version: 1, images: data.images }, null, 2)}
`,
    "utf8"
  );
}
function getNextImageOrder(images, target) {
  const targetImages = listImagesForTarget(images, target);
  return targetImages.length ? Math.max(...targetImages.map((image) => image.order)) + 1 : 0;
}
function compareReviewFigmaImages(a, b) {
  return a.order - b.order || a.createdAt.localeCompare(b.createdAt);
}
function createReviewFigmaImageId() {
  return `figma_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}
function isReviewFigmaImage(value) {
  if (!value || typeof value !== "object") return false;
  const image = value;
  return typeof image.id === "string" && typeof image.projectId === "string" && typeof image.figmaUrl === "string" && typeof image.fileKey === "string" && typeof image.nodeId === "string" && typeof image.imageUrl === "string" && typeof image.order === "number" && typeof image.createdAt === "string" && typeof image.updatedAt === "string";
}
function isNodeError(error) {
  if (!error || typeof error !== "object") return false;
  return "code" in error;
}
function normalizeOptionalText(value) {
  if (typeof value !== "string") return void 0;
  return value.trim() || void 0;
}

// src/vite/figma-image-store.server.ts
async function handleReviewFigmaImageStoreRequest({
  dataFile,
  assetDir,
  assetEndpoint,
  endpoint,
  method,
  options,
  pathname,
  requestUrl,
  body,
  env,
  requestToken
}) {
  if (method === "OPTIONS") return { status: 204, body: null };
  if ((method === "GET" || method === "POST") && pathname === `${endpoint}/snapshot`) {
    const input = parseReleaseSnapshotInput(body, requestUrl, options.projectId);
    if (!input) return jsonError(400, "valid snapshot input is required.");
    if (options.projectId && input.projectId !== options.projectId) {
      return jsonError(403, "snapshot project is not allowed.");
    }
    if (input.targets.some((target) => !isAllowedProjectTarget(target, options.projectId))) {
      return jsonError(403, "snapshot target project is not allowed.");
    }
    const data = await readReviewFigmaImageStoreFile(dataFile);
    return {
      status: 200,
      body: createReviewFigmaReleaseSnapshot({
        images: data.images,
        projectId: input.projectId,
        releaseId: input.releaseId,
        label: input.label,
        targets: input.targets.length > 0 ? input.targets : void 0
      })
    };
  }
  if (method === "GET" && pathname === endpoint) {
    const target = parseTargetParam(requestUrl.searchParams.get("target"));
    if (!target) return jsonError(400, "target query is required.");
    if (!isAllowedProjectTarget(target, options.projectId)) {
      return { status: 200, body: [] };
    }
    const data = await readReviewFigmaImageStoreFile(dataFile);
    return { status: 200, body: listImagesForTarget(data.images, target) };
  }
  if (method === "POST" && pathname === endpoint) {
    const input = parseAddImageInput(body);
    if (!input) return jsonError(400, "valid add image input is required.");
    if (!isAllowedProjectTarget(input.target, options.projectId)) {
      return jsonError(403, "target project is not allowed.");
    }
    const data = await readReviewFigmaImageStoreFile(dataFile);
    const image = await createReviewFigmaImage({
      assetDir,
      assetEndpoint,
      currentImages: data.images,
      env,
      input,
      options,
      requestToken
    });
    data.images = [image, ...data.images];
    await writeReviewFigmaImageStoreFile(dataFile, data);
    return { status: 201, body: image };
  }
  if (method === "PATCH" && pathname === `${endpoint}/reorder`) {
    const input = parseReorderImagesInput(body);
    if (!input) return jsonError(400, "valid reorder input is required.");
    if (!isAllowedProjectTarget(input.target, options.projectId)) {
      return jsonError(403, "target project is not allowed.");
    }
    const data = await readReviewFigmaImageStoreFile(dataFile);
    const images = reorderReviewFigmaImages(data.images, input);
    data.images = images.allImages;
    await writeReviewFigmaImageStoreFile(dataFile, data);
    return { status: 200, body: images.targetImages };
  }
  const id = getEndpointItemId(pathname, endpoint);
  if (id && method === "PATCH") {
    const patch = parseUpdateImageInput(body);
    if (!patch) return jsonError(400, "valid update patch is required.");
    const data = await readReviewFigmaImageStoreFile(dataFile);
    const result = updateReviewFigmaImage(data.images, id, patch);
    if (!result) return jsonError(404, `Figma image not found: ${id}`);
    if (!isAllowedProjectTarget(result.image.target, options.projectId)) {
      return jsonError(403, "target project is not allowed.");
    }
    data.images = result.images;
    await writeReviewFigmaImageStoreFile(dataFile, data);
    return { status: 200, body: result.image };
  }
  if (id && method === "DELETE") {
    const data = await readReviewFigmaImageStoreFile(dataFile);
    const image = data.images.find((item) => item.id === id);
    if (!image) return jsonError(404, `Figma image not found: ${id}`);
    if (!isAllowedProjectTarget(image.target, options.projectId)) {
      return jsonError(403, "target project is not allowed.");
    }
    data.images = data.images.filter((item) => item.id !== id);
    await writeReviewFigmaImageStoreFile(dataFile, data);
    await deleteReviewFigmaImageAsset(assetDir, image.storageKey);
    return { status: 200, body: { ok: true } };
  }
  return jsonError(405, "method not allowed.");
}
async function readJsonRequestBody(req) {
  if (req.method === "GET" || req.method === "DELETE") return null;
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }
  const raw = Buffer.concat(chunks).toString("utf8").trim();
  if (!raw) return null;
  return JSON.parse(raw);
}
function sendJson(res, status, body) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  if (status === 204) {
    res.end();
    return;
  }
  res.end(JSON.stringify(body ?? null));
}
async function sendReviewFigmaAsset(res, assetDir, assetEndpoint, pathname) {
  const storageKey = getReviewFigmaAssetStorageKeyFromPathname(pathname, assetEndpoint);
  if (!storageKey) {
    sendPlainText(res, 400, "Invalid Figma image asset path.");
    return;
  }
  try {
    const data = await readFile2(path2.join(assetDir, storageKey));
    res.statusCode = 200;
    res.setHeader("Content-Type", getReviewFigmaAssetMimeType(storageKey));
    res.setHeader("Cache-Control", "private, max-age=31536000, immutable");
    res.end(data);
  } catch (error) {
    if (isNodeError(error) && error.code === "ENOENT") {
      sendPlainText(res, 404, "Figma image asset not found.");
      return;
    }
    sendPlainText(
      res,
      500,
      error instanceof Error ? error.message : "Figma image asset request failed."
    );
  }
}
function sendPlainText(res, status, body) {
  res.statusCode = status;
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.end(body);
}
function parseTargetParam(value) {
  if (!value) return null;
  try {
    return parseReviewFigmaImageTarget(JSON.parse(value));
  } catch {
    return null;
  }
}
function parseAddImageInput(value) {
  if (!value || typeof value !== "object") return null;
  const input = value;
  const target = parseReviewFigmaImageTarget(input.target);
  if (!target || typeof input.figmaUrl !== "string") return null;
  return {
    target,
    figmaUrl: input.figmaUrl,
    label: typeof input.label === "string" ? input.label : void 0,
    order: typeof input.order === "number" ? input.order : void 0,
    imageFormat: parseReviewFigmaImageFormat(input.imageFormat),
    asset: parseAddImageAssetInput(input.asset)
  };
}
function parseAddImageAssetInput(value) {
  if (!value || typeof value !== "object") return void 0;
  const input = value;
  const imageFormat = parseReviewFigmaImageFormat(input.imageFormat);
  if (!imageFormat || typeof input.dataUrl !== "string" || typeof input.mimeType !== "string") {
    return void 0;
  }
  return {
    dataUrl: input.dataUrl,
    imageFormat,
    mimeType: input.mimeType,
    byteSize: typeof input.byteSize === "number" ? input.byteSize : void 0,
    width: typeof input.width === "number" ? input.width : void 0,
    height: typeof input.height === "number" ? input.height : void 0
  };
}
function parseUpdateImageInput(value) {
  if (!value || typeof value !== "object") return null;
  const input = value;
  return {
    label: typeof input.label === "string" ? input.label : void 0,
    order: typeof input.order === "number" ? input.order : void 0
  };
}
function parseReorderImagesInput(value) {
  if (!value || typeof value !== "object") return null;
  const input = value;
  const target = parseReviewFigmaImageTarget(input.target);
  if (!target || !Array.isArray(input.imageIds)) return null;
  return {
    target,
    imageIds: input.imageIds.filter((id) => typeof id === "string")
  };
}
function parseReleaseSnapshotInput(value, requestUrl, fallbackProjectId) {
  const input = value && typeof value === "object" ? value : null;
  const projectId = normalizeOptionalText(
    typeof input?.projectId === "string" ? input.projectId : requestUrl.searchParams.get("projectId") ?? fallbackProjectId
  );
  if (!projectId) return null;
  return {
    projectId,
    releaseId: normalizeOptionalText(
      typeof input?.releaseId === "string" ? input.releaseId : requestUrl.searchParams.get("releaseId")
    ),
    label: normalizeOptionalText(
      typeof input?.label === "string" ? input.label : requestUrl.searchParams.get("label")
    ),
    targets: parseReleaseSnapshotTargets(input?.targets, requestUrl)
  };
}
function parseReleaseSnapshotTargets(value, requestUrl) {
  const bodyTargets = Array.isArray(value) ? value.flatMap((target) => {
    const parsed = parseReviewFigmaImageTarget(target);
    return parsed ? [parsed] : [];
  }) : [];
  const queryTargets = requestUrl.searchParams.getAll("target").flatMap((target) => {
    const parsed = parseTargetParam(target);
    return parsed ? [parsed] : [];
  });
  const targetByKey = new Map(
    [...bodyTargets, ...queryTargets].map((target) => [
      getReviewFigmaImageTargetKey(target),
      target
    ])
  );
  return Array.from(targetByKey.values());
}
function parseReviewFigmaImageTarget(value) {
  if (!value || typeof value !== "object") return null;
  const target = value;
  if (target.type === "route") {
    if (typeof target.projectId !== "string" || typeof target.pageUrl !== "string") {
      return null;
    }
    return {
      type: "route",
      projectId: target.projectId,
      pageUrl: target.pageUrl,
      viewport: target.viewport && typeof target.viewport === "object" ? target.viewport : void 0,
      slot: typeof target.slot === "string" ? target.slot : void 0
    };
  }
  if (target.type === "figma-node") {
    if (typeof target.projectId !== "string" || typeof target.fileKey !== "string" || typeof target.nodeId !== "string") {
      return null;
    }
    return {
      type: "figma-node",
      projectId: target.projectId,
      fileKey: target.fileKey,
      nodeId: target.nodeId
    };
  }
  return null;
}
function normalizeEndpoint(endpoint) {
  const normalized = endpoint.trim().replace(/\/+$/, "");
  return normalized.startsWith("/") ? normalized : `/${normalized}`;
}
function getEndpointItemId(pathname, endpoint) {
  if (!pathname.startsWith(`${endpoint}/`)) return null;
  const value = pathname.slice(endpoint.length + 1);
  if (!value || value.includes("/")) return null;
  return decodeURIComponent(value);
}
function isAllowedProjectTarget(target, projectId) {
  return !projectId || target.projectId === projectId;
}
function jsonError(status, error) {
  return { status, body: { error } };
}

// src/vite/figma-image-store.ts
var readReviewFigmaServerToken = (options = {}) => readReviewFigmaToken({
  token: options.token,
  env: options.env ?? getServerEnv(),
  envKey: options.envKey ?? DEFAULT_REVIEW_FIGMA_TOKEN_ENV_KEY,
  enabled: options.enabled
});
var requireReviewFigmaServerToken = (options = {}) => requireReviewFigmaToken({
  token: options.token,
  env: options.env ?? getServerEnv(),
  envKey: options.envKey ?? DEFAULT_REVIEW_FIGMA_TOKEN_ENV_KEY,
  enabled: options.enabled
});
var renderReviewFigmaServerImage = (options) => {
  const { token, env, envKey, enabled, ...renderOptions } = options;
  const explicitToken = typeof token === "string" ? token.trim() : token;
  return renderReviewFigmaImage({
    ...renderOptions,
    token: explicitToken || requireReviewFigmaServerToken({ env, envKey, enabled })
  });
};
var reviewFigmaImageStore = (options = {}) => {
  let root = "";
  let dataFile = "";
  let assetDir = "";
  let env = {};
  const enabled = options.enabled ?? true;
  const endpoint = normalizeEndpoint(
    options.endpoint ?? DEFAULT_REVIEW_FIGMA_IMAGE_STORE_ENDPOINT
  );
  const assetEndpoint = normalizeEndpoint(
    options.assetEndpoint ?? `${endpoint}/assets`
  );
  return {
    name: "df-web-review-kit-figma-image-store",
    apply: "serve",
    configResolved(config) {
      root = config.root;
      dataFile = path3.resolve(
        root,
        options.dataFile ?? ".df-review/figma-images.json"
      );
      assetDir = options.assetDir ? path3.resolve(root, options.assetDir) : path3.join(path3.dirname(dataFile), "figma-assets");
      env = {
        ...loadEnv(config.mode, config.envDir, ""),
        ...getServerEnv(),
        ...options.env ?? {}
      };
    },
    configureServer(server) {
      if (!enabled) return;
      server.middlewares.use(async (req, res, next) => {
        const requestUrl = new URL(req.url ?? "/", "http://localhost");
        const pathname = requestUrl.pathname;
        if (pathname.startsWith(`${assetEndpoint}/`)) {
          await sendReviewFigmaAsset(res, assetDir, assetEndpoint, pathname);
          return;
        }
        if (pathname !== endpoint && !pathname.startsWith(`${endpoint}/`)) {
          next();
          return;
        }
        try {
          const response = await handleReviewFigmaImageStoreRequest({
            dataFile,
            assetDir,
            assetEndpoint,
            endpoint,
            options,
            env,
            pathname,
            requestUrl,
            method: req.method ?? "GET",
            body: await readJsonRequestBody(req),
            requestToken: readRequestFigmaToken(req)
          });
          sendJson(res, response.status, response.body);
        } catch (error) {
          sendJson(res, 500, {
            error: error instanceof Error ? error.message : "Figma image store request failed."
          });
        }
      });
    }
  };
};
function readRequestFigmaToken(req) {
  const value = req.headers?.["x-figma-token"];
  const token = Array.isArray(value) ? value[0] : value;
  return typeof token === "string" ? token.trim() || null : null;
}
function getServerEnv() {
  const runtime = globalThis;
  return runtime.process?.env ?? {};
}

// src/vite.ts
var VIRTUAL_JSX_DEV_RUNTIME_ID = "\0@designfever/web-review-kit/source-locator/jsx-dev-runtime";
var REVIEW_SOURCE_ENV_DEFINE_KEYS = [
  ["__DF_WRK_REVIEW_SOURCE_ROOT__", "VITE_REVIEW_SOURCE_ROOT"],
  ["__DF_WRK_REVIEW_SOURCE_EDITOR__", "VITE_REVIEW_SOURCE_EDITOR"],
  [
    "__DF_WRK_REVIEW_SOURCE_URL_TEMPLATE__",
    "VITE_REVIEW_SOURCE_URL_TEMPLATE"
  ]
];
var createReviewSourceEnvReplacements = (env = {}) => {
  return Object.fromEntries(
    REVIEW_SOURCE_ENV_DEFINE_KEYS.map(([defineKey, envKey]) => [
      defineKey,
      JSON.stringify(env[envKey] ?? "")
    ])
  );
};
var injectReviewSourceEnv = (code, replacements) => {
  let nextCode = code;
  for (const [defineKey, value] of Object.entries(replacements)) {
    nextCode = nextCode.split(`typeof ${defineKey}`).join(`typeof ${value}`).split(`: ${defineKey}`).join(`: ${value}`);
  }
  return nextCode === code ? null : nextCode;
};
var reviewSourceLocator = (options = {}) => {
  let runtimeOptions = createRuntimeOptions(options);
  let sourceEnvReplacements = createReviewSourceEnvReplacements();
  return {
    name: "df-web-review-kit-source-locator",
    enforce: "pre",
    configResolved(config) {
      runtimeOptions = createRuntimeOptions(options, config);
      sourceEnvReplacements = createReviewSourceEnvReplacements(config.env);
    },
    resolveId(id, importer) {
      if (!runtimeOptions.enabled) return null;
      if (id !== "react/jsx-dev-runtime") return null;
      if (importer === VIRTUAL_JSX_DEV_RUNTIME_ID) return null;
      return VIRTUAL_JSX_DEV_RUNTIME_ID;
    },
    load(id) {
      if (id !== VIRTUAL_JSX_DEV_RUNTIME_ID) return null;
      return createJsxDevRuntime(runtimeOptions);
    },
    transform(code) {
      const injectedCode = injectReviewSourceEnv(code, sourceEnvReplacements);
      return injectedCode ? { code: injectedCode, map: null } : null;
    }
  };
};
var reviewDataLocator = (options = {}) => {
  let root = normalizePath(options.root ?? "");
  let enabled = options.enabled ?? false;
  let sourceEnvReplacements = createReviewSourceEnvReplacements();
  const include = (options.include ?? []).map(createRuntimeMatcher);
  const exclude = (options.exclude ?? ["node_modules", "dist"]).map(
    createRuntimeMatcher
  );
  const componentPattern = options.componentPattern ?? /Section[A-Za-z0-9_]*/;
  const fileKey = options.fileAttribute ?? "__wrkDataFile";
  const lineKey = options.lineAttribute ?? "__wrkDataLine";
  const componentSource = `(^|[\\n,{(\\[]\\s*)(component:\\s*)(['"\`])(${componentPattern.source})\\3`;
  return {
    name: "df-web-review-kit-data-locator",
    enforce: "pre",
    configResolved(config) {
      root = normalizePath(options.root ?? config.root ?? "");
      enabled = options.enabled ?? config.command === "serve";
      sourceEnvReplacements = createReviewSourceEnvReplacements(config.env);
    },
    transform(code, id) {
      const envInjectedCode = injectReviewSourceEnv(
        code,
        sourceEnvReplacements
      );
      const inputCode = envInjectedCode ?? code;
      if (!enabled) return null;
      const file = normalizePath(id.split("?")[0]);
      const relativeFile = root && file.startsWith(root + "/") ? file.slice(root.length + 1) : file;
      if (include.length > 0 && !include.some((m) => matchesPath(m, file, relativeFile)))
        return envInjectedCode ? { code: envInjectedCode, map: null } : null;
      if (exclude.some((m) => matchesPath(m, file, relativeFile))) {
        return envInjectedCode ? { code: envInjectedCode, map: null } : null;
      }
      const sourceFile = (options.filePath ?? "relative") === "absolute" ? file : relativeFile;
      const regex = new RegExp(componentSource, "g");
      let changed = false;
      const out = inputCode.replace(
        regex,
        (_match, pre, comp, quote, name, offset) => {
          const line = inputCode.slice(0, offset + pre.length).split("\n").length;
          changed = true;
          return `${pre}${JSON.stringify(fileKey)}: ${JSON.stringify(sourceFile)}, ${JSON.stringify(lineKey)}: ${line}, ${comp}${quote}${name}${quote}`;
        }
      );
      return changed || envInjectedCode ? { code: out, map: null } : null;
    }
  };
};
function matchesPath(matcher, absoluteFile, relativeFile) {
  if (matcher.type === "regex") {
    const regex = new RegExp(matcher.value, matcher.flags);
    return regex.test(absoluteFile) || regex.test(relativeFile);
  }
  const target = matcher.value.startsWith("/") ? absoluteFile : relativeFile;
  return target === matcher.value || target.startsWith(matcher.value + "/") || target.includes("/" + matcher.value);
}
function createRuntimeOptions(options, config) {
  const attributePrefix = (options.attributePrefix ?? "data-wrk-source").replace(
    /-+$/,
    ""
  );
  const root = normalizePath(options.root ?? config?.root ?? "");
  const enabled = options.enabled ?? config?.command === "serve";
  return {
    enabled,
    root,
    include: (options.include ?? []).map(createRuntimeMatcher),
    exclude: (options.exclude ?? ["node_modules", "dist"]).map(
      createRuntimeMatcher
    ),
    filePath: options.filePath ?? "relative",
    line: options.line ?? true,
    column: options.column ?? true,
    fileAttribute: `${attributePrefix}-file`,
    lineAttribute: `${attributePrefix}-line`,
    columnAttribute: `${attributePrefix}-column`
  };
}
function createRuntimeMatcher(pattern) {
  if (pattern instanceof RegExp) {
    return { type: "regex", value: pattern.source, flags: pattern.flags };
  }
  return { type: "path", value: normalizePath(pattern).replace(/^\.\//, "") };
}
function normalizePath(value) {
  return value.replace(/\\/g, "/").replace(/\/+$/, "");
}
function createJsxDevRuntime(options) {
  return `
import { Fragment, jsxDEV as baseJsxDEV } from 'react/jsx-dev-runtime';

const OPTIONS = ${JSON.stringify(options)};

export { Fragment };

export function jsxDEV(type, props, key, isStaticChildren, source, self) {
  return baseJsxDEV(
    type,
    injectSourceProps(type, props, source),
    key,
    isStaticChildren,
    source,
    self
  );
}

function injectSourceProps(type, props, source) {
  if (typeof type !== 'string') return props;
  if (!source || typeof source.fileName !== 'string') return props;

  const sourceFile = getSourceFile(source.fileName);
  if (!sourceFile) return props;

  const nextProps = props ? { ...props } : {};
  if (nextProps[OPTIONS.fileAttribute] == null) {
    nextProps[OPTIONS.fileAttribute] = sourceFile;
  }
  if (OPTIONS.line && source.lineNumber != null && nextProps[OPTIONS.lineAttribute] == null) {
    nextProps[OPTIONS.lineAttribute] = String(source.lineNumber);
  }
  if (OPTIONS.column && source.columnNumber != null && nextProps[OPTIONS.columnAttribute] == null) {
    nextProps[OPTIONS.columnAttribute] = String(source.columnNumber);
  }

  return nextProps;
}

function getSourceFile(fileName) {
  const absoluteFile = normalizePath(fileName);
  const relativeFile = getRelativeFile(absoluteFile);

  if (OPTIONS.include.length > 0 && !matchesAny(OPTIONS.include, absoluteFile, relativeFile)) {
    return null;
  }
  if (matchesAny(OPTIONS.exclude, absoluteFile, relativeFile)) return null;

  return OPTIONS.filePath === 'absolute' ? absoluteFile : relativeFile;
}

function getRelativeFile(absoluteFile) {
  if (!OPTIONS.root) return absoluteFile;
  if (absoluteFile === OPTIONS.root) return '';
  if (absoluteFile.startsWith(OPTIONS.root + '/')) {
    return absoluteFile.slice(OPTIONS.root.length + 1);
  }

  return absoluteFile;
}

function matchesAny(patterns, absoluteFile, relativeFile) {
  return patterns.some((pattern) =>
    matchesPattern(pattern, absoluteFile, relativeFile)
  );
}

function matchesPattern(pattern, absoluteFile, relativeFile) {
  if (pattern.type === 'regex') {
    const regex = new RegExp(pattern.value, pattern.flags);
    return regex.test(absoluteFile) || regex.test(relativeFile);
  }

  const value = pattern.value;
  const target = isAbsolutePattern(value) ? absoluteFile : relativeFile;
  if (!value.includes('*')) {
    return target === value || target.startsWith(value + '/');
  }

  return globToRegExp(value).test(target);
}

function isAbsolutePattern(value) {
  return value.startsWith('/') || /^[a-zA-Z]:\\//.test(value);
}

function globToRegExp(value) {
  const source = escapeRegExp(value)
    .replace(/\\\\\\*\\\\\\*/g, '.*')
    .replace(/\\\\\\*/g, '[^/]*');

  return new RegExp('^' + source + '$');
}

function escapeRegExp(value) {
  return value.replace(/[|\\\\{}()[\\]^$+*?.]/g, '\\\\$&');
}

function normalizePath(value) {
  return value.replace(/\\\\/g, '/').replace(/\\/+$/, '');
}
`;
}
export {
  collectReviewFigmaReleaseSnapshot,
  createReviewFigmaImageApiUrl,
  createReviewFigmaImagesSnapshot,
  createReviewFigmaReleaseSnapshot,
  readReviewFigmaServerToken,
  renderReviewFigmaImage,
  renderReviewFigmaServerImage,
  requireReviewFigmaServerToken,
  reviewDataLocator,
  reviewFigmaImageStore,
  reviewSourceLocator
};
//# sourceMappingURL=vite.js.map
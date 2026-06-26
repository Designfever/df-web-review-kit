"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/vite.ts
var vite_exports = {};
__export(vite_exports, {
  collectReviewFigmaReleaseSnapshot: () => collectReviewFigmaReleaseSnapshot,
  createReviewFigmaImageApiUrl: () => createReviewFigmaImageApiUrl,
  createReviewFigmaImagesSnapshot: () => createReviewFigmaImagesSnapshot,
  createReviewFigmaReleaseSnapshot: () => createReviewFigmaReleaseSnapshot,
  readReviewFigmaServerToken: () => readReviewFigmaServerToken,
  renderReviewFigmaImage: () => renderReviewFigmaImage,
  renderReviewFigmaServerImage: () => renderReviewFigmaServerImage,
  requireReviewFigmaServerToken: () => requireReviewFigmaServerToken,
  reviewDataLocator: () => reviewDataLocator,
  reviewFigmaImageStore: () => reviewFigmaImageStore,
  reviewSourceLocator: () => reviewSourceLocator
});
module.exports = __toCommonJS(vite_exports);
var import_promises = require("fs/promises");
var import_node_path = __toESM(require("path"), 1);
var import_vite = require("vite");

// src/figma/image.store.ts
var DEFAULT_REVIEW_FIGMA_IMAGE_STORE_ENDPOINT = "/__dfwr/figma-images";
function getReviewFigmaImageTargetKey(target) {
  return JSON.stringify(normalizeReviewFigmaImageTarget(target));
}
function getReviewFigmaImageMimeType(format) {
  if (format === "jpg") return "image/jpeg";
  if (format === "png") return "image/png";
  return "image/webp";
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
    token: explicitToken || requireReviewFigmaServerToken({
      env,
      envKey,
      enabled
    })
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
      dataFile = import_node_path.default.resolve(
        root,
        options.dataFile ?? ".df-review/figma-images.json"
      );
      assetDir = options.assetDir ? import_node_path.default.resolve(root, options.assetDir) : import_node_path.default.join(import_node_path.default.dirname(dataFile), "figma-assets");
      env = {
        ...(0, import_vite.loadEnv)(config.mode, config.envDir, ""),
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
            body: await readJsonRequestBody(req)
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
  env
}) {
  if (method === "OPTIONS") return { status: 204, body: null };
  if ((method === "GET" || method === "POST") && pathname === `${endpoint}/snapshot`) {
    const input = parseReleaseSnapshotInput(body, requestUrl, options.projectId);
    if (!input) return jsonError(400, "valid snapshot input is required.");
    if (options.projectId && input.projectId !== options.projectId) {
      return jsonError(403, "snapshot project is not allowed.");
    }
    if (input.targets.some(
      (target) => !isAllowedProjectTarget(target, options.projectId)
    )) {
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
    return {
      status: 200,
      body: listImagesForTarget(data.images, target)
    };
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
      options
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
async function createReviewFigmaImage({
  assetDir,
  assetEndpoint,
  currentImages,
  env,
  input,
  options
}) {
  const ref = parseReviewFigmaNodeRef(input.figmaUrl);
  if (!ref) {
    throw new Error("A Figma node copy link or fileKey->nodeId value is required.");
  }
  const id = createReviewFigmaImageId();
  const targetImageFormat = input.imageFormat ?? options.imageFormat ?? "webp";
  const renderFormat = getStoreRenderFormat(
    options.renderFormat,
    targetImageFormat
  );
  const rendered = await renderReviewFigmaServerImage({
    figmaUrl: input.figmaUrl,
    token: options.token,
    env,
    envKey: options.envKey,
    enabled: options.enabled,
    format: renderFormat,
    scale: options.renderScale,
    useAbsoluteBounds: options.useAbsoluteBounds,
    apiBaseUrl: options.apiBaseUrl,
    fetch: options.fetch
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
    label: normalizeOptionalText(input.label),
    order,
    storageKey: cachedAsset?.storageKey,
    byteSize: cachedAsset?.byteSize,
    createdAt: now,
    updatedAt: now
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
  await (0, import_promises.mkdir)(assetDir, { recursive: true });
  await (0, import_promises.writeFile)(import_node_path.default.join(assetDir, storageKey), asset.data);
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
  return {
    data,
    imageFormat,
    mimeType
  };
}
async function deleteReviewFigmaImageAsset(assetDir, storageKey) {
  if (!storageKey || !isSafeReviewFigmaAssetStorageKey(storageKey)) return;
  await (0, import_promises.rm)(import_node_path.default.join(assetDir, storageKey), { force: true }).catch(() => null);
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
    nextTargetImages.map((image, index) => [
      image.id,
      { ...image, order: index }
    ])
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
  return {
    image: nextImage,
    images: nextImages
  };
}
async function readReviewFigmaImageStoreFile(dataFile) {
  try {
    const raw = await (0, import_promises.readFile)(dataFile, "utf8");
    const parsed = JSON.parse(raw);
    return {
      version: 1,
      images: Array.isArray(parsed.images) ? parsed.images.flatMap(
        (image) => isReviewFigmaImage(image) ? [image] : []
      ) : []
    };
  } catch (error) {
    if (isNodeError(error) && error.code === "ENOENT") {
      return { version: 1, images: [] };
    }
    throw error;
  }
}
async function writeReviewFigmaImageStoreFile(dataFile, data) {
  await (0, import_promises.mkdir)(import_node_path.default.dirname(dataFile), { recursive: true });
  await (0, import_promises.writeFile)(
    dataFile,
    `${JSON.stringify({ version: 1, images: data.images }, null, 2)}
`,
    "utf8"
  );
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
  const storageKey = getReviewFigmaAssetStorageKeyFromPathname(
    pathname,
    assetEndpoint
  );
  if (!storageKey) {
    sendPlainText(res, 400, "Invalid Figma image asset path.");
    return;
  }
  try {
    const data = await (0, import_promises.readFile)(import_node_path.default.join(assetDir, storageKey));
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
    imageFormat: parseReviewFigmaImageFormat(input.imageFormat)
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
function getNextImageOrder(images, target) {
  const targetImages = listImagesForTarget(images, target);
  return targetImages.length ? Math.max(...targetImages.map((image) => image.order)) + 1 : 0;
}
function compareReviewFigmaImages(a, b) {
  return a.order - b.order || a.createdAt.localeCompare(b.createdAt);
}
function getEndpointItemId(pathname, endpoint) {
  if (!pathname.startsWith(`${endpoint}/`)) return null;
  const value = pathname.slice(endpoint.length + 1);
  if (!value || value.includes("/")) return null;
  return decodeURIComponent(value);
}
function normalizeEndpoint(endpoint) {
  const normalized = endpoint.trim().replace(/\/+$/, "");
  return normalized.startsWith("/") ? normalized : `/${normalized}`;
}
function normalizeOptionalText(value) {
  if (typeof value !== "string") return void 0;
  return value.trim() || void 0;
}
function createReviewFigmaImageId() {
  return `figma_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}
function isAllowedProjectTarget(target, projectId) {
  return !projectId || target.projectId === projectId;
}
function isReviewFigmaImage(value) {
  if (!value || typeof value !== "object") return false;
  const image = value;
  return typeof image.id === "string" && typeof image.projectId === "string" && parseReviewFigmaImageTarget(image.target) !== null && typeof image.figmaUrl === "string" && typeof image.fileKey === "string" && typeof image.nodeId === "string" && typeof image.imageUrl === "string" && typeof image.order === "number" && typeof image.createdAt === "string" && typeof image.updatedAt === "string";
}
function jsonError(status, error) {
  return { status, body: { error } };
}
function isNodeError(error) {
  if (!error || typeof error !== "object") return false;
  return "code" in error;
}
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
function getServerEnv() {
  const runtime = globalThis;
  return runtime.process?.env ?? {};
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
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
});
//# sourceMappingURL=vite.cjs.map
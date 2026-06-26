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
    addImage(input) {
      return request(endpoint, {
        method: "POST",
        body: JSON.stringify(input)
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
    const response = await requestFetch(input, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...init.headers ?? {}
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

export {
  DEFAULT_REVIEW_FIGMA_IMAGE_STORE_ENDPOINT,
  createReviewFigmaImageStoreClient,
  getReviewFigmaImageTargetKey,
  getReviewFigmaImageMimeType,
  createReviewFigmaImagesSnapshot,
  createReviewFigmaReleaseSnapshot,
  collectReviewFigmaReleaseSnapshot,
  DEFAULT_REVIEW_FIGMA_TOKEN_ENV_KEY,
  REVIEW_FIGMA_TOKEN_MISSING_CODE,
  ReviewFigmaTokenError,
  readReviewFigmaToken,
  requireReviewFigmaToken,
  isReviewFigmaTokenError
};
//# sourceMappingURL=chunk-JTDOE6QO.js.map
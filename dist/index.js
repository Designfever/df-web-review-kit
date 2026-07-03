import {
  DEFAULT_REVIEW_FIGMA_IMAGE_FORMAT,
  DEFAULT_REVIEW_VIEWPORTS,
  REVIEW_WORKFLOW_STATUS_OPTIONS,
  createWebReviewKit,
  findReviewViewportPreset,
  getNumberedReviewItems,
  getReviewItemScope,
  getReviewItemScopeLabel,
  getReviewViewportScope,
  localAdapter,
  normalizeReviewItemStatus
} from "./chunk-FYHEARCH.js";
import {
  DEFAULT_REVIEW_FIGMA_IMAGE_STORE_ENDPOINT,
  DEFAULT_REVIEW_FIGMA_TOKEN_ENV_KEY,
  FIGMA_NODE_REF_SEPARATOR,
  REVIEW_FIGMA_TOKEN_MISSING_CODE,
  ReviewFigmaTokenError,
  collectReviewFigmaReleaseSnapshot,
  createEndpointReviewFigmaImageStore,
  createReviewFigmaClientRenderedAsset,
  createReviewFigmaFrameUrl,
  createReviewFigmaImageStoreClient,
  createReviewFigmaImagesSnapshot,
  createReviewFigmaNodeValue,
  createReviewFigmaReleaseSnapshot,
  getReviewFigmaImageMimeType,
  getReviewFigmaImageTargetKey,
  isReviewFigmaTokenError,
  parseReviewFigmaNodeRef,
  readReviewFigmaToken,
  requireReviewFigmaNodeRef,
  requireReviewFigmaToken
} from "./chunk-UNDQZ4Y2.js";

// src/adapters/supabase.ts
var DEFAULT_SUPABASE_REVIEW_TABLE = "review_items";
var DEFAULT_SUPABASE_REVIEW_SOURCE = "supabase";
var DEFAULT_SUPABASE_CREATE_REVIEW_ITEM_RPC = "create_review_item";
function supabaseAdapter(options) {
  const tableName = options.table ?? DEFAULT_SUPABASE_REVIEW_TABLE;
  const source = options.source ?? DEFAULT_SUPABASE_REVIEW_SOURCE;
  const fromTable = () => options.client.from(tableName);
  return {
    async get(id) {
      const row = await unwrapResponse(
        fromTable().select("*").eq("id", id).maybeSingle(),
        "supabase get review item"
      );
      return row ? rowToReviewItem(row, options) : null;
    },
    async list(query) {
      let request = fromTable().select("*").eq("project_id", query.projectId).eq("source", query.source ?? source);
      const routeKey = query.routeKey ?? query.normalizedPath;
      if (routeKey) {
        request = request.eq("route_key", routeKey);
      }
      if (query.status) {
        request = request.eq(
          "status",
          normalizeReviewItemStatus(query.status)
        );
      }
      const rows = await unwrapResponse(
        request.order("created_at", { ascending: false }),
        "supabase list review items"
      );
      return (rows ?? []).flatMap((row) => {
        const item = rowToReviewItem(row, options);
        return item ? [item] : [];
      });
    },
    async create(item) {
      const nextItem = normalizeItemForSupabaseCreate(item, source, options);
      if (options.unsafeClientReviewNumberFallback) {
        throw new Error(
          "supabase create review item: unsafeClientReviewNumberFallback is no longer supported. Use create_review_item RPC with database-backed review_number sequence."
        );
      }
      return createItemWithRpc(nextItem, source, options);
    },
    async update(id, patch) {
      const current = await this.get(id);
      if (!current) throw new Error(`Review item not found: ${id}`);
      const nextStatus = patch.status ? normalizeReviewItemStatus(patch.status) : current.status;
      const nextItem = {
        ...current,
        ...patch,
        id,
        status: nextStatus,
        createdAt: current.createdAt,
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      const patchRow = itemToRowPatch(nextItem, source, options);
      const updated = await unwrapResponse(
        fromTable().update(patchRow).eq("id", id).select("*").single(),
        "supabase update review item"
      );
      return rowToReviewItem(updated, options) ?? nextItem;
    },
    async remove(id) {
      await unwrapResponse(
        fromTable().delete().eq("id", id),
        "supabase delete review item"
      );
    }
  };
}
function normalizeItemForSupabaseCreate(item, source, options) {
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const id = createSupabaseReviewItemId();
  const normalizedStatus = normalizeReviewItemStatus(item.status);
  const routeKey = item.routeKey || item.normalizedPath || "/";
  const viewport = item.viewport ?? { width: 390, height: 720 };
  const nextItem = {
    ...item,
    id,
    reviewNumber: void 0,
    projectId: options.projectId,
    routeKey,
    normalizedPath: item.normalizedPath || routeKey,
    viewport,
    status: normalizedStatus,
    externalIssueId: id,
    externalIssueUrl: buildSupabaseReviewUrl(
      { routeKey, normalizedPath: item.normalizedPath || routeKey, viewport },
      source,
      options,
      id
    ),
    submittedAt: item.submittedAt ?? now,
    submitStatus: item.submitStatus ?? "submitted",
    createdAt: now,
    updatedAt: now
  };
  return {
    ...nextItem,
    externalIssueUrl: nextItem.externalIssueUrl ?? buildSupabaseReviewUrl(nextItem, source, options)
  };
}
async function createItemWithRpc(item, source, options) {
  const rpcName = options.createRpc ?? DEFAULT_SUPABASE_CREATE_REVIEW_ITEM_RPC;
  if (!options.client.rpc) {
    throw new Error(
      `supabase create review item: ${rpcName} rpc is required`
    );
  }
  const row = await unwrapResponse(
    options.client.rpc(rpcName, {
      p_id: item.id,
      p_project_id: options.projectId,
      p_route_key: item.routeKey || item.normalizedPath || "/",
      p_source: source,
      p_status: normalizeReviewItemStatus(item.status),
      p_item: item
    }),
    `supabase create review item rpc ${rpcName}`
  );
  return rowToReviewItem(row, options) ?? item;
}
function itemToRow(item, source, options) {
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const updatedAt = item.updatedAt || now;
  return {
    id: item.id,
    project_id: options.projectId,
    route_key: item.routeKey || item.normalizedPath || "/",
    source,
    review_number: item.reviewNumber ?? null,
    status: normalizeReviewItemStatus(item.status),
    item: {
      ...item,
      projectId: options.projectId,
      status: normalizeReviewItemStatus(item.status),
      updatedAt
    },
    created_at: item.createdAt || now,
    updated_at: updatedAt
  };
}
function itemToRowPatch(item, source, options) {
  const row = itemToRow(item, source, options);
  return {
    route_key: row.route_key,
    review_number: row.review_number,
    status: row.status,
    item: row.item,
    updated_at: row.updated_at
  };
}
function rowToReviewItem(row, options) {
  if (!row.item || typeof row.item !== "object") return null;
  const item = row.item;
  const status = normalizeReviewItemStatus(
    row.status || item.status || "todo"
  );
  const routeKey = row.route_key || item.routeKey || item.normalizedPath || "/";
  const viewport = item.viewport ?? { width: 390, height: 720 };
  const now = (/* @__PURE__ */ new Date()).toISOString();
  return {
    ...item,
    id: row.id,
    reviewNumber: row.review_number ?? item.reviewNumber,
    projectId: row.project_id || item.projectId || options.projectId,
    routeKey,
    pageUrl: item.pageUrl || toAbsoluteReviewUrl(routeKey),
    normalizedPath: item.normalizedPath || routeKey,
    kind: item.kind === "area" ? "area" : "note",
    comment: item.comment || "",
    status,
    viewport,
    externalIssueId: item.externalIssueId ?? row.id,
    externalIssueUrl: item.externalIssueUrl ?? buildSupabaseReviewUrl(
      { routeKey, normalizedPath: routeKey, viewport },
      row.source,
      options,
      row.id
    ),
    submittedAt: item.submittedAt ?? row.created_at,
    submitStatus: item.submitStatus ?? "submitted",
    createdAt: item.createdAt ?? row.created_at ?? now,
    updatedAt: row.updated_at ?? item.updatedAt ?? now
  };
}
async function unwrapResponse(request, label) {
  const { data, error } = await request;
  if (error) {
    throw new Error(`${label}: ${error.message ?? error.code ?? "failed"}`);
  }
  return data;
}
function buildSupabaseReviewUrl(item, source, options, itemId) {
  if (typeof window === "undefined") return void 0;
  const url = new URL(
    normalizeReviewUrlPath(options.reviewPathPrefix),
    window.location.origin
  );
  url.searchParams.set("source", source);
  url.searchParams.set("target", item.routeKey || item.normalizedPath || "/");
  url.searchParams.set("w", String(Math.round(item.viewport.width)));
  url.searchParams.set("h", String(Math.round(item.viewport.height)));
  if (itemId) url.searchParams.set("item", itemId);
  return url.toString();
}
function normalizeReviewUrlPath(value = "/review") {
  const raw = value.trim() || "/review";
  const path = raw.startsWith("/") ? raw : `/${raw}`;
  return path.endsWith("/") ? path : `${path}/`;
}
function toAbsoluteReviewUrl(path) {
  if (typeof window === "undefined") return path;
  return new URL(path, window.location.origin).toString();
}
function createSupabaseReviewItemId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `review-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

// src/figma/remote.image.store.ts
var DEFAULT_REVIEW_FIGMA_REMOTE_IMAGES_TABLE = "review_figma_images";
var DEFAULT_REVIEW_FIGMA_REMOTE_UPLOAD_TIMEOUT_MS = 3e4;
var FIGMA_TOKEN_STORAGE_KEY = "figma-token";
function createRemoteReviewFigmaImageStore({
  client,
  uploadEndpoint,
  table = DEFAULT_REVIEW_FIGMA_REMOTE_IMAGES_TABLE,
  fetch: fetchOption,
  token,
  clientRender = true,
  uploadTimeoutMs = DEFAULT_REVIEW_FIGMA_REMOTE_UPLOAD_TIMEOUT_MS
}) {
  const listImages = async (target) => {
    const targetKey = getReviewFigmaImageTargetKey(target);
    const { data, error } = await client.from(table).select("*").eq("project_id", target.projectId).eq("target_key", targetKey).order("sort_order", { ascending: true }).order("created_at", { ascending: true });
    if (error) throwRemoteStoreError(error, "list Figma images");
    return (data ?? []).map(rowToFigmaImage);
  };
  return {
    listImages,
    async addImage(input) {
      const ref = parseReviewFigmaNodeRef(input.figmaUrl);
      if (!ref) {
        throw new Error("A Figma node link or fileKey->nodeId value is required.");
      }
      const id = createFigmaImageId();
      const asset = await resolveFigmaImageAsset({
        input,
        token,
        clientRender,
        fetch: fetchOption
      });
      const uploaded = await uploadFigmaAsset({
        asset,
        endpoint: uploadEndpoint,
        fetch: fetchOption,
        imageId: id,
        projectId: input.target.projectId,
        timeoutMs: uploadTimeoutMs
      });
      const order = typeof input.order === "number" && Number.isFinite(input.order) ? input.order : await getNextImageOrder(listImages, input.target);
      const now = (/* @__PURE__ */ new Date()).toISOString();
      const row = createImageRow({
        asset,
        fileKey: ref.fileKey,
        id,
        imageUrl: uploaded.imageUrl,
        input,
        nodeId: ref.nodeId,
        now,
        order,
        storageKey: uploaded.storageKey
      });
      const { data, error } = await client.from(table).insert(row).select("*").single();
      if (error) throwRemoteStoreError(error, "insert Figma image");
      return rowToFigmaImage(data);
    },
    async updateImage(id, patch) {
      const { data, error } = await client.from(table).update(createUpdatePatch(patch)).eq("id", id).select("*").single();
      if (error) throwRemoteStoreError(error, "update Figma image");
      return rowToFigmaImage(data);
    },
    async reorderImages(input) {
      const current = await listImages(input.target);
      const currentIds = new Set(current.map((image) => image.id));
      const nextIds = [
        ...input.imageIds.filter((id) => currentIds.has(id)),
        ...current.map((image) => image.id).filter((id) => !input.imageIds.includes(id))
      ];
      const targetKey = getReviewFigmaImageTargetKey(input.target);
      const updatedAt = (/* @__PURE__ */ new Date()).toISOString();
      const results = await Promise.all(
        nextIds.map(
          (id, index) => client.from(table).update({ sort_order: index, updated_at: updatedAt }).eq("id", id).eq("project_id", input.target.projectId).eq("target_key", targetKey)
        )
      );
      const failed = results.find((result) => result.error);
      if (failed?.error) throwRemoteStoreError(failed.error, "reorder Figma images");
      return listImages(input.target);
    },
    async deleteImage(id) {
      const { error } = await client.from(table).delete().eq("id", id);
      if (error) throwRemoteStoreError(error, "delete Figma image");
    }
  };
}
async function resolveFigmaImageAsset({
  input,
  token,
  clientRender,
  fetch
}) {
  if (input.asset) return input.asset;
  if (!clientRender) {
    throw new Error("Figma image asset is required when clientRender is disabled.");
  }
  const renderOptions = clientRender === true ? {} : clientRender;
  const figmaToken = readRemoteFigmaToken(renderOptions.token ?? token);
  if (!figmaToken) throw new Error("Figma token is required.");
  return createReviewFigmaClientRenderedAsset({
    ...renderOptions,
    fetch,
    figmaUrl: input.figmaUrl,
    token: figmaToken
  });
}
async function uploadFigmaAsset({
  asset,
  endpoint,
  fetch: fetchOption,
  imageId,
  projectId,
  timeoutMs
}) {
  const requestFetch = fetchOption ?? globalThis.fetch;
  if (!requestFetch) throw new Error("Figma asset upload requires fetch.");
  const { blob, mimeType } = decodeAssetDataUrl(asset);
  const response = await withTimeout(
    requestFetch(
      createAssetUploadUrl(endpoint, {
        imageFormat: asset.imageFormat,
        imageId,
        projectId
      }),
      {
        method: "POST",
        headers: {
          "Content-Type": mimeType
        },
        body: blob
      }
    ),
    timeoutMs,
    "Figma asset upload timed out."
  );
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(
      readString(data?.error) || `Figma asset upload failed with ${response.status}`
    );
  }
  const storageKey = readString(data?.storageKey) ?? readString(data?.r2Key);
  const imageUrl = readString(data?.imageUrl) ?? readString(data?.publicUrl);
  if (!storageKey || !imageUrl) {
    throw new Error("Figma asset upload response is missing image URL.");
  }
  return { storageKey, imageUrl };
}
function createAssetUploadUrl(endpoint, params) {
  const base = typeof window !== "undefined" ? window.location.origin : "http://localhost";
  const url = new URL(endpoint, base);
  url.searchParams.set("projectId", params.projectId);
  url.searchParams.set("imageId", params.imageId);
  url.searchParams.set("imageFormat", params.imageFormat);
  return url.toString();
}
function createImageRow({
  asset,
  fileKey,
  id,
  imageUrl,
  input,
  nodeId,
  now,
  order,
  storageKey
}) {
  const target = input.target;
  const targetKey = getReviewFigmaImageTargetKey(target);
  return {
    id,
    project_id: target.projectId,
    target_key: targetKey,
    target,
    target_type: target.type,
    page_url: target.type === "route" ? target.pageUrl : null,
    viewport_label: target.type === "route" ? target.viewport?.label ?? null : null,
    viewport_width: target.type === "route" ? target.viewport?.width ?? null : null,
    viewport_height: target.type === "route" ? target.viewport?.height ?? null : null,
    viewport_scope: target.type === "route" ? target.viewport?.scope ?? null : null,
    slot: target.type === "route" ? target.slot ?? null : null,
    figma_url: input.figmaUrl,
    file_key: fileKey,
    node_id: nodeId,
    image_url: imageUrl,
    image_format: asset.imageFormat,
    mime_type: asset.mimeType,
    storage_key: storageKey,
    label: normalizeOptionalText(input.label) ?? null,
    sort_order: order,
    width: asset.width ?? null,
    height: asset.height ?? null,
    byte_size: asset.byteSize ?? null,
    created_at: now,
    updated_at: now
  };
}
function createUpdatePatch(patch) {
  return {
    ...patch.label !== void 0 ? { label: normalizeOptionalText(patch.label) ?? null } : {},
    ...typeof patch.order === "number" && Number.isFinite(patch.order) ? { sort_order: patch.order } : {},
    updated_at: (/* @__PURE__ */ new Date()).toISOString()
  };
}
async function getNextImageOrder(listImages, target) {
  const images = await listImages(target);
  return images.length ? Math.max(...images.map((image) => image.order)) + 1 : 0;
}
function rowToFigmaImage(row) {
  return {
    id: row.id,
    projectId: row.project_id,
    target: row.target,
    figmaUrl: row.figma_url,
    fileKey: row.file_key,
    nodeId: row.node_id,
    imageUrl: row.image_url,
    imageFormat: row.image_format,
    mimeType: row.mime_type,
    label: row.label ?? void 0,
    order: row.sort_order,
    storageKey: row.storage_key,
    width: row.width ?? void 0,
    height: row.height ?? void 0,
    byteSize: row.byte_size ?? void 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}
function decodeAssetDataUrl(asset) {
  const match = asset.dataUrl.match(/^data:([^;,]+);base64,(.*)$/);
  if (!match) throw new Error("Valid Figma image asset data URL is required.");
  const mimeType = match[1]?.trim();
  if (!mimeType || mimeType !== asset.mimeType) {
    throw new Error("Figma image asset MIME type mismatch.");
  }
  const binary = globalThis.atob(match[2] ?? "");
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return {
    blob: new Blob([bytes], { type: mimeType }),
    mimeType
  };
}
async function withTimeout(promise, timeoutMs, message) {
  let timeoutId;
  try {
    return await Promise.race([
      promise,
      new Promise((_, reject) => {
        timeoutId = setTimeout(() => reject(new Error(message)), timeoutMs);
      })
    ]);
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}
function readRemoteFigmaToken(provider) {
  const token = typeof provider === "function" ? provider() : provider;
  if (typeof token === "string" && token.trim()) return token.trim();
  return readStoredFigmaToken();
}
function readStoredFigmaToken() {
  if (typeof window === "undefined") return "";
  try {
    return window.localStorage.getItem(FIGMA_TOKEN_STORAGE_KEY)?.trim() || "";
  } catch {
    return "";
  }
}
function createFigmaImageId() {
  const id = globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2);
  return `figma_${id.replace(/[^A-Za-z0-9_-]+/g, "-")}`;
}
function normalizeOptionalText(value) {
  if (typeof value !== "string") return void 0;
  return value.trim() || void 0;
}
function readString(value) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}
function throwRemoteStoreError(error, action) {
  const source = error;
  const message = readString(source.message) ?? `Remote Figma image ${action} failed.`;
  const code = readString(source.code);
  const details = readString(source.details);
  const hint = readString(source.hint);
  const suffix = [code, details, hint].filter(Boolean).join(" / ");
  throw new Error(suffix ? `${message} (${suffix})` : message);
}
export {
  DEFAULT_REVIEW_FIGMA_IMAGE_FORMAT,
  DEFAULT_REVIEW_FIGMA_IMAGE_STORE_ENDPOINT,
  DEFAULT_REVIEW_FIGMA_REMOTE_IMAGES_TABLE,
  DEFAULT_REVIEW_FIGMA_TOKEN_ENV_KEY,
  DEFAULT_REVIEW_VIEWPORTS,
  FIGMA_NODE_REF_SEPARATOR,
  REVIEW_FIGMA_TOKEN_MISSING_CODE,
  REVIEW_WORKFLOW_STATUS_OPTIONS,
  ReviewFigmaTokenError,
  collectReviewFigmaReleaseSnapshot,
  createEndpointReviewFigmaImageStore,
  createRemoteReviewFigmaImageStore,
  createReviewFigmaFrameUrl,
  createReviewFigmaImageStoreClient,
  createReviewFigmaImagesSnapshot,
  createReviewFigmaNodeValue,
  createReviewFigmaReleaseSnapshot,
  createWebReviewKit,
  findReviewViewportPreset,
  getNumberedReviewItems,
  getReviewFigmaImageMimeType,
  getReviewFigmaImageTargetKey,
  getReviewItemScope,
  getReviewItemScopeLabel,
  getReviewViewportScope,
  isReviewFigmaTokenError,
  localAdapter,
  normalizeReviewItemStatus,
  parseReviewFigmaNodeRef,
  readReviewFigmaToken,
  requireReviewFigmaNodeRef,
  requireReviewFigmaToken,
  supabaseAdapter
};
//# sourceMappingURL=index.js.map
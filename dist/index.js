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
} from "./chunk-RL6NLI7N.js";
import {
  DEFAULT_REVIEW_FIGMA_IMAGE_STORE_ENDPOINT,
  DEFAULT_REVIEW_FIGMA_TOKEN_ENV_KEY,
  FIGMA_NODE_REF_SEPARATOR,
  REVIEW_FIGMA_TOKEN_MISSING_CODE,
  ReviewFigmaTokenError,
  collectReviewFigmaReleaseSnapshot,
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
} from "./chunk-AB5B6O77.js";

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
export {
  DEFAULT_REVIEW_FIGMA_IMAGE_FORMAT,
  DEFAULT_REVIEW_FIGMA_IMAGE_STORE_ENDPOINT,
  DEFAULT_REVIEW_FIGMA_TOKEN_ENV_KEY,
  DEFAULT_REVIEW_VIEWPORTS,
  FIGMA_NODE_REF_SEPARATOR,
  REVIEW_FIGMA_TOKEN_MISSING_CODE,
  REVIEW_WORKFLOW_STATUS_OPTIONS,
  ReviewFigmaTokenError,
  collectReviewFigmaReleaseSnapshot,
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
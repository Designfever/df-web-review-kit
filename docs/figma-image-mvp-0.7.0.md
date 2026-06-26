# Figma Image MVP 0.7.0 Structure Note

This is the investigation note for Todo 802, `Figma 이미지 MVP 구조 조사`.
It records the minimum 0.7.0 scope before implementation.

## Goal

0.7.0 should add a dev/local Figma image management MVP without breaking the
current host-helper flow.

- If a Figma image store is configured, the review shell uses the new image
  management flow.
- If no Figma image store is configured, the shell keeps the current Figma
  helper fallback: dispatch the host keyboard shortcut and detect the host
  overlay.
- `FIGMA_TOKEN` is required only by the Figma image server/dev endpoint when it
  renders or adds an image. It must not become a package-wide or browser env
  requirement.
- Rendered images should be stored as webp by default. Keep the original
  `figmaUrl`, `fileKey`, and `nodeId` so the image can be regenerated later.
- Removing keyboard shortcut helpers from host projects belongs after the MVP
  has stabilized.

## Current State

### Existing Review Adapters

`WebReviewKitAdapter` is a QA item persistence contract:

- `get`
- `list`
- `create`
- `update`
- `remove`

`ReviewShellAdapter` wraps that contract for shell sources, status handling,
submission sync, and write-mode checks. It is intentionally centered on
`ReviewItem`.

Do not overload this adapter for Figma image bindings in 0.7.0. Figma images
need their own small store contract so QA item source switching, status updates,
and submission sync do not become coupled to image management.

### Current Figma Integration

The current Figma integration is only a host-helper toggle:

- `docs/figma-overlay.md` states that the package does not fetch Figma data or
  own a server-side token.
- `src/react-shell/figma.ts` reads `window.__figma` and builds a Figma frame
  link from `fileKey->nodeId`.
- `src/react-shell/hooks/use.review.target.overlay.ts` dispatches `KeyF` into
  the iframe target when the Figma overlay is toggled.
- `src/react-shell/settings.ts` and `use.review.settings.ts` store the current
  `figma-token` setting in browser `localStorage`.
- `dev/src/main.tsx` currently provides a dev `window.__figma` fixture.

This flow should remain as the fallback for projects that have no image store.

### Dev Server Gap

`src/vite.ts` currently exports source/data locator plugins only. There is no
middleware endpoint yet.

A local `fileAdapter` cannot be browser-only, because browser code cannot write
a JSON file. The local MVP should add a Vite/dev-server endpoint and expose a
browser store client that calls that endpoint.

## Proposed 0.7.0 Shape

### Public/Shell Option

Add an optional shell-level Figma image config. Keep it absent by default.

```ts
type ReviewShellFigmaImagesOptions = {
  store?: ReviewFigmaImageStore;
  enabled?: boolean;
};

interface ReviewShellProps {
  // existing props...
  figmaImages?: ReviewShellFigmaImagesOptions;
}
```

Fallback rule:

- `figmaImages?.store` exists: show/use Figma image management UI.
- `figmaImages?.store` is missing: keep the current host-helper overlay button
  and keyboard shortcut behavior.

### Store Contract

The 0.7.0 contract should be separate from `WebReviewKitAdapter`.

```ts
type ReviewFigmaImageTarget =
  | { type: 'route'; projectId: string; pageUrl: string; slot?: string }
  | { type: 'figma-node'; projectId: string; fileKey: string; nodeId: string };

type ReviewFigmaImage = {
  id: string;
  projectId: string;
  target: ReviewFigmaImageTarget;
  figmaUrl: string;
  fileKey: string;
  nodeId: string;
  imageUrl: string;
  imageFormat: 'webp' | 'png' | 'jpg';
  mimeType: string;
  label?: string;
  order: number;
  storageKey?: string;
  width?: number;
  height?: number;
  byteSize?: number;
  createdAt: string;
  updatedAt: string;
};

type ReviewFigmaImageStore = {
  listImages(target: ReviewFigmaImageTarget): Promise<ReviewFigmaImage[]>;
  addImage(input: {
    target: ReviewFigmaImageTarget;
    figmaUrl: string;
    imageFormat?: 'webp' | 'png' | 'jpg';
  }): Promise<ReviewFigmaImage>;
  deleteImage(id: string): Promise<void>;
  reorderImages(input: {
    target: ReviewFigmaImageTarget;
    imageIds: string[];
  }): Promise<ReviewFigmaImage[]>;
  updateImage(
    id: string,
    patch: Partial<Pick<ReviewFigmaImage, 'label' | 'order'>>
  ): Promise<ReviewFigmaImage>;
};
```

`addImage` owns the internal image rendering/upload/cache step. The UI should
not know whether the returned `imageUrl` came from a local dev server,
OpenClaw-hosted upload, or a future Cloudflare-backed uploader.

Default output should be `image/webp` with a quality setting around 90-95 for
review/reference overlays. Keep `png` available as an implementation option for
future pixel-precise comparison cases.

### Module Layout

Use the architecture doc's existing direction, but convert the current single
`src/react-shell/figma.ts` file into a small module when implementation begins.

```txt
src/figma/
  image.types.ts
  parse.ts

src/react-shell/figma/
  image.client.ts
  image.panel.tsx
  image.state.ts
  frame.ts

src/vite.ts
  reviewFigmaImageStore()
```

Suggested responsibilities:

- `src/figma/parse.ts`: parse Figma node copy links into `fileKey` and `nodeId`.
- `src/react-shell/figma/image.client.ts`: browser client for the dev endpoint
  or any host-provided store.
- `src/react-shell/figma/image.panel.tsx`: list/add/delete/reorder UI.
- `src/vite.ts`: dev middleware for local JSON metadata and Figma rendering.

### Local MVP Endpoint

Add a dev plugin instead of trying to write files from browser code.

```ts
reviewFigmaImageStore({
  enabled: true,
  projectId: 'df-web-review-kit',
  dataFile: '.df-review/figma-images.json',
});
```

Endpoint shape can stay internal for 0.7.0, but should map directly to the
store contract:

- `GET /__dfwr/figma-images`
- `POST /__dfwr/figma-images`
- `PATCH /__dfwr/figma-images/:id`
- `DELETE /__dfwr/figma-images/:id`

The dev endpoint reads `FIGMA_TOKEN` from server env only when it needs to call
Figma. Do not expose `VITE_FIGMA_TOKEN`.

Token validation is intentionally lazy:

- Store missing or disabled: no token check, keep the current host-helper
  fallback.
- Store enabled but no image render/add request has happened: no token check.
- Image render/add request: require `FIGMA_TOKEN` from the dev/server
  environment and return `DFWR_FIGMA_TOKEN_MISSING` when it is absent.

## Impact Files

Expected package-side implementation files:

- `.env.sample`: document server-only `FIGMA_TOKEN` separately from browser
  `VITE_*` values.
- `src/types.ts` or `src/figma/image.types.ts`: shared Figma image types.
- `src/index.ts`: export public Figma image types/parser only if needed by host
  projects.
- `src/react-shell/types.ts`: add optional `figmaImages`.
- `src/react-shell/review/shell.tsx`: pass state/actions into the panel and
  preserve existing fallback behavior.
- `src/react-shell/topbar.tsx`: keep the existing overlay toggle available when
  no image store exists.
- `src/react-shell/review/settings.modal.tsx` and
  `src/react-shell/hooks/use.review.settings.ts`: stop treating browser
  `figma-token` as the new API token. Keep it only for legacy host helpers if
  needed.
- `src/vite.ts`: add the dev local metadata endpoint.
- `dev/vite.config.ts` and `dev/src/main.tsx`: wire the local MVP for dogfood.

Token helpers already added for the implementation steps:

- `readReviewFigmaToken()` / `requireReviewFigmaToken()` validate an explicit
  token/env object without reading browser globals.
- `readReviewFigmaServerToken()` / `requireReviewFigmaServerToken()` are
  exported from `@designfever/web-review-kit/vite` for dev/server-only code.
- `ReviewFigmaTokenError` carries `DFWR_FIGMA_TOKEN_MISSING` so UI/API callers
  can show a clear setup error.

Parser/render helpers already added for the implementation steps:

- `parseReviewFigmaNodeRef()` accepts either a Figma copy link or existing
  `fileKey->nodeId` value.
- URL `node-id` values are normalized from Figma web form like `4-228` to API
  form like `4:228`.
- `createReviewFigmaFrameUrl()` centralizes Figma frame link generation.
- `renderReviewFigmaServerImage()` is exported from
  `@designfever/web-review-kit/vite` and calls Figma `/v1/images/:fileKey` with
  a server-side token.
- The Figma API render URL is still a temporary source URL. The webp cache and
  JSON metadata write belong to the local file adapter work.

Local metadata store helpers already added for the implementation steps:

- `createReviewFigmaImageStoreClient()` creates a browser-side
  `ReviewFigmaImageStore` that calls the dev endpoint.
- `reviewFigmaImageStore()` is exported from
  `@designfever/web-review-kit/vite` and adds the local dev middleware.
- The default endpoint is `/__dfwr/figma-images`.
- The dev fixture stores metadata at `.df-review/figma-images.json`; the
  `.df-review` folder is gitignored.
- For now the local middleware stores the Figma API render URL as `imageUrl`.
  It does not yet convert/cache the binary to webp; that can be added behind
  the same `addImage()` path without changing the shell UI contract.

Review page multi-image UI already added for the implementation steps:

- When `figmaImages.store` is configured, the shell shows a Figma Images side
  panel.
- The panel supports list, add, delete, reorder, select, and overlay opacity
  controls for the current route + viewport target.
- When no store is configured, the legacy host-helper Figma overlay fallback is
  still used.

Release snapshot helpers already added for the implementation steps:

- `createReviewFigmaImagesSnapshot()` clones and sorts image metadata for JSON
  persistence.
- `createReviewFigmaReleaseSnapshot()` returns a release-shaped JSON object
  with `figmaImagesSnapshot`.
- `collectReviewFigmaReleaseSnapshot()` can collect images through any
  `ReviewFigmaImageStore` for a set of targets.
- The local Vite middleware exposes
  `GET/POST /__dfwr/figma-images/snapshot` for dev release JSON snapshots.

Expected host-project follow-up files after stabilization:

- `lexus_official_v2026/src/helper/helper.review-kit.ts`: remove per-project
  helper wiring only after 0.7.0 fallback has been verified.
- Host review route files: pass the image store config only for projects that
  opt into the new flow.

## Release Boundary

There is no runtime "review release" model in the current package code. The
existing release files are package release notes.

For 0.7.0, do not introduce a release table or separate release image store.
Todo 808 can keep this simple by snapshotting the current image list as JSON on
whatever release object gets introduced:

```ts
figmaImagesSnapshot: ReviewFigmaImage[];
```

That is enough to ensure old review releases do not change when the current
project/page Figma bindings are edited later.

## Verification Plan

For Todo 802, this document is the artifact.

For the following implementation todos:

- Adapter missing: `/review` still works with current keyboard shortcut/Figma
  helper fallback.
- Adapter configured and `FIGMA_TOKEN` missing: adding/rendering a Figma image
  returns a clear error without breaking the rest of the review shell.
- Adapter configured and `FIGMA_TOKEN` present: a Figma node copy link can be
  added, listed, deleted, reordered, and survives dev server restart.
- Existing QA adapters still pass `pnpm typecheck` and `pnpm build`.

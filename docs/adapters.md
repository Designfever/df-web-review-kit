# Adapter Boundaries

`df-web-review-kit` has two integration surfaces that look similar but should stay separate:

- QA adapter: persists review items such as note, area, DOM QA, status, title, and assignee.
- Figma image store: persists Figma reference image metadata and cached image assets.

Use `adapter` for both concepts in conversation only when the context is clear. In code/docs, prefer the explicit names `ReviewShellAdapter` and `ReviewFigmaImageStore`.

> Note: `docs/adaptor.sample.ts` keeps the old filename spelling for compatibility with existing links. The public API name is still `adapter`.

## Responsibility Matrix

| Concern | QA adapter | Figma image store |
| --- | --- | --- |
| Public type | `ReviewShellAdapter`, `WebReviewKitAdapter` | `ReviewFigmaImageStore` |
| Mount option | `mountReviewShell({ adapters })` | `mountReviewShell({ figmaImages: { store } })` |
| Vite plugin | Not required | `reviewFigmaImageStore()` for dev/local cache |
| Data | `ReviewItem` records and QA attachment metadata | `ReviewFigmaImage` records and image assets |
| Main actions | `get`, `list`, `create`, `update`, `remove`, optional `uploadAttachment` | `listImages`, `addImage`, `updateImage`, `reorderImages`, `deleteImage` |
| UI fields | `fields.title`, `statusOptions`, `assigneeOptions` | image label, order, opacity/layer controls |
| Token/secrets | Host backend decides | `FIGMA_TOKEN` server env first, Settings `figma-token` request fallback |
| Typical storage | localStorage, Supabase, df-sheet, custom QA API, host-owned attachment bucket | `.df-review/figma-images.json`, `.df-review/figma-assets/`, future asset backend |

## QA Adapter

QA adapters own review item persistence. They should answer one question:

> Where do QA items for this project/page live?

The shell reads and writes QA through `adapters`.

```tsx
mountReviewShell({
  projectId,
  pages,
  adapters: [
    {
      label: 'df-sheet',
      get: (id) => dfSheet.get(id),
      list: (query) => dfSheet.list(query),
      create: (item) => dfSheet.create(item),
      fields: { title: true },
      statusOptions,
      updateStatus: ({ id, status }) => dfSheet.updateStatus(id, status),
      assigneeTitle: '담당자',
      assigneeOptions,
      updateAssignee: ({ id, assigneeId, assigneeName }) =>
        dfSheet.updateAssignee(id, { assigneeId, assigneeName }),
      uploadAttachment: (input) => dfSheet.uploadAttachment(input),
      remove: (id) => dfSheet.remove(id),
    },
  ],
});
```

Guidelines:

- Keep backend-specific mapping inside the host adapter.
- `fields.title` only controls whether title UI appears. Omit it for comment-only QA.
- Use `ReviewItem.externalLinks` for one or more external issue/sheet buttons. The shell renders them under the QA body and falls back to `externalIssueUrl` when the array is omitted.
- Use `ReviewShellAdapter.uploadAttachment` for comment paste and iframe capture files. Iframe captures usually arrive as WebP and only fall back to SVG when raster capture is unavailable. It receives a browser `File | Blob` plus optional metadata and must return a `ReviewAttachment` with `url`, `name`, `mime`, `size`, and optional `metadata`.
- `assigneeOptions` and `updateAssignee` are optional. If omitted, assignee UI should not become a required workflow.
- `statusOptions` can be project-specific, but status remains a QA item field.
- Slow remote adapters should return promises normally; the shell owns loading and pending UI.
- Upload failures should reject with a useful message. If the backend can classify the failure, set `reason` to values such as `quota-exceeded`, `storage-full`, `unsupported-type`, `permission-denied`, or `upload-failed` so the UI can show a concrete reason instead of silently submitting without a URL.

## Figma Image Store

Figma image stores own reference image metadata and assets. They should answer one question:

> Which Figma reference images are attached to this route/viewport?

The shell reads and writes Figma image data through `figmaImages.store`.

```tsx
import { createReviewFigmaImageStoreClient } from '@designfever/web-review-kit';

const figmaImageStore = createReviewFigmaImageStoreClient();

mountReviewShell({
  projectId,
  pages,
  adapters,
  figmaImages: {
    store: figmaImageStore,
    imageFormat: 'webp',
  },
});
```

For local/dev caching, the host Vite config wires the server endpoint:

```ts
import { defineConfig } from 'vite';
import { reviewFigmaImageStore } from '@designfever/web-review-kit/vite';

export default defineConfig({
  plugins: [
    reviewFigmaImageStore({
      projectId: 'my-project',
      dataFile: '.df-review/figma-images.json',
    }),
  ],
});
```

For host-owned storage where a server API owns both file persistence and
metadata, use the endpoint factory. Calling it without options uses the same
default dev endpoint as `createReviewFigmaImageStoreClient()`.

```tsx
import { createEndpointReviewFigmaImageStore } from '@designfever/web-review-kit';

const figmaImageStore = createEndpointReviewFigmaImageStore({
  endpoint: import.meta.env.VITE_REVIEW_FIGMA_IMAGE_ENDPOINT,
  headers: () => ({
    'X-Review-Project': projectId,
  }),
});

mountReviewShell({
  projectId,
  pages,
  adapters,
  figmaImages: {
    store: figmaImageStore,
  },
});
```

For shared browser-side storage backed by a Supabase-like table and an asset
upload endpoint, use the remote factory:

```tsx
import {
  createRemoteReviewFigmaImageStore,
  type ReviewFigmaRemoteDbClient,
} from '@designfever/web-review-kit';

const figmaImageStore = createRemoteReviewFigmaImageStore({
  client: supabaseClient as unknown as ReviewFigmaRemoteDbClient,
  uploadEndpoint: import.meta.env.VITE_FIGMA_ASSET_UPLOAD_ENDPOINT,
  token: () => import.meta.env.VITE_FIGMA_TOKEN,
});

mountReviewShell({
  projectId,
  pages,
  adapters,
  figmaImages: {
    store: figmaImageStore,
  },
});
```

Guidelines:

- Do not put Figma image metadata into QA adapter metadata.
- Do not use `VITE_FIGMA_TOKEN` for server rendering. Keep shared tokens in
  `FIGMA_TOKEN`; use Settings `figma-token` only as a browser-local review
  fallback.
- For remote browser-side stores, project env can provide a token via the
  factory `token` option. If it is empty, Settings `figma-token` is used as the
  fallback.
- If no `figmaImages.store` is configured, QA should still work.
- Prefer `createEndpointReviewFigmaImageStore()` when browser-side DB
  credentials, row-level policies, or asset cleanup make direct remote writes
  awkward. The endpoint should expose the `ReviewFigmaImageStore` CRUD shape.
- Only pass browser-safe auth headers to the endpoint. Server-side secrets stay
  on the endpoint implementation.
- Keep remote Figma image storage separate from `ReviewShellAdapter`.

## Host Wiring Rule

Host projects can use both surfaces together, but they should be configured independently.

```tsx
mountReviewShell({
  projectId,
  pages,
  adapters, // QA item persistence
  figmaImages: {
    store: figmaImageStore, // Figma reference image persistence
  },
});
```

This keeps QA workflows, release notes, and future backend migrations from coupling unrelated data models.

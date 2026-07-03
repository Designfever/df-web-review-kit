# Installation

Install `df-web-review-kit` in a host project and mount the review shell on a `/review` route.

The default setup is local-only. Remote DB and presence are optional adapters.
For the QA adapter and Figma image store split, see [Adapter boundaries](adapters.md).

## Package Install

```bash
pnpm add @designfever/web-review-kit react react-dom
```

Supabase is optional. Install it only in host projects that use the Supabase adapter.

```bash
pnpm add @supabase/supabase-js
```

## Environment

Copy the repository [.env.sample](../.env.sample) into the host project as `.env.local`.

```bash
cp node_modules/@designfever/web-review-kit/.env.sample .env.local
```

For a local-only setup, set only the project id:

```env
VITE_REVIEW_PROJECT_ID=my-project
```

Supabase and source-opening values are optional. Leave Supabase URL/key empty when the review shell should use local browser storage only.

## Vite Route

Create a review entry such as:

```txt
page/review/index.html
page/review/index.tsx
```

Minimal `index.html`:

```html
<div id="root"></div>
<script type="module" src="./index.tsx"></script>
```

Minimal local-only `index.tsx`:

```tsx
import {
  createReviewPagesFromGlob,
  mountReviewShell,
} from '@designfever/web-review-kit/react-shell';
import {
  REVIEW_WORKFLOW_STATUS_OPTIONS,
  localAdapter,
} from '@designfever/web-review-kit';

const REVIEW_PROJECT_ID = import.meta.env.VITE_REVIEW_PROJECT_ID || 'my-project';
const REVIEW_PATH_PREFIX = '/review';
const REVIEW_USER_ID = import.meta.env.VITE_REVIEW_USER_ID || '';

const local = localAdapter({
  storageKey: `${REVIEW_PROJECT_ID}-review-items`,
});

const pages = createReviewPagesFromGlob(import.meta.glob('/**/index.tsx'), {
  exclude: (href) => href === '/review/',
});

mountReviewShell({
  projectId: REVIEW_PROJECT_ID,
  pages,
  adapters: [
    {
      label: 'local',
      get: (id) => local.get(id),
      list: (query) => local.list(query),
      create: (item) => local.create(item),
      update: (id, patch) => local.update(id, patch),
      statusOptions: REVIEW_WORKFLOW_STATUS_OPTIONS,
      updateStatus: ({ id, status }) => local.update(id, { status }),
      syncSubmission: ({ id, patch }) => local.update(id, patch),
      remove: (id) => local.remove(id),
    },
  ],
  reviewPathPrefix: REVIEW_PATH_PREFIX,
});
```

## Adjustment Label

DOM adjust mode appends adjustment metrics to the saved QA comment. Use `adjustmentLabel` when a host project wants that prompt line to match its own responsive CSS workflow.

```tsx
mountReviewShell({
  projectId: REVIEW_PROJECT_ID,
  pages,
  adapters,
  adjustmentLabel: 'Responsive CSS px adjustments',
  reviewPathPrefix: REVIEW_PATH_PREFIX,
});
```

If omitted, the default label is `Responsive CSS px adjustments`. This option only changes the label before the generated `x`, `y`, and `scale` values.

## Supabase Adapter

Host projects that choose Supabase create the client themselves and pass it into the package adapter.

```tsx
import {
  createFallbackPresenceAdapter,
  createLocalPresenceAdapter,
  createSupabasePresenceAdapter,
  type ReviewShellAdapter,
  type SupabasePresenceClient,
} from '@designfever/web-review-kit/react-shell';
import {
  REVIEW_WORKFLOW_STATUS_OPTIONS,
  localAdapter,
  supabaseAdapter,
  type SupabaseReviewClient,
} from '@designfever/web-review-kit';
import { createClient } from '@supabase/supabase-js';

const REVIEW_PROJECT_ID = import.meta.env.VITE_REVIEW_PROJECT_ID || 'my-project';
const REVIEW_PATH_PREFIX = '/review';

const local = localAdapter({
  storageKey: `${REVIEW_PROJECT_ID}-review-items`,
});

const supabaseClient = import.meta.env.VITE_REVIEW_SUPABASE_ANON_KEY
  ? createClient(
      import.meta.env.VITE_REVIEW_SUPABASE_URL,
      import.meta.env.VITE_REVIEW_SUPABASE_ANON_KEY
    )
  : null;

const remote = supabaseClient
  ? supabaseAdapter({
      client: supabaseClient as unknown as SupabaseReviewClient,
      table: import.meta.env.VITE_REVIEW_SUPABASE_TABLE || 'review_items',
      projectId: REVIEW_PROJECT_ID,
      source: 'supabase',
      reviewPathPrefix: REVIEW_PATH_PREFIX,
    })
  : null;

const adapters = [
  {
    label: 'local',
    defaultUserId: REVIEW_USER_ID,
    get: (id) => local.get(id),
    list: (query) => local.list(query),
    create: (item) => local.create(item),
    update: (id, patch) => local.update(id, patch),
    statusOptions: REVIEW_WORKFLOW_STATUS_OPTIONS,
    updateStatus: ({ id, status }) => local.update(id, { status }),
    syncSubmission: ({ id, patch }) => local.update(id, patch),
    remove: (id) => local.remove(id),
  },
  ...(remote
    ? [
        {
          label: 'supabase',
          defaultUserId: REVIEW_USER_ID,
          get: (id) => remote.get(id),
          list: (query) => remote.list(query),
          create: (item) => remote.create(item),
          update: (id, patch) => remote.update(id, patch),
          statusOptions: REVIEW_WORKFLOW_STATUS_OPTIONS,
          updateStatus: ({ id, status }) => remote.update(id, { status }),
          remove: (id) => remote.remove(id),
        } satisfies ReviewShellAdapter,
      ]
    : []),
] satisfies ReviewShellAdapter[];

const localPresence = createLocalPresenceAdapter({
  channelName: `${REVIEW_PROJECT_ID}:review-presence`,
});

const presence = supabaseClient
  ? createFallbackPresenceAdapter(
      createSupabasePresenceAdapter({
        client: supabaseClient as unknown as SupabasePresenceClient,
        channelPrefix: 'review-presence',
        private: import.meta.env.VITE_REVIEW_SUPABASE_PRESENCE_PRIVATE === 'true',
      }),
      localPresence
    )
  : localPresence;

mountReviewShell({
  projectId: REVIEW_PROJECT_ID,
  pages,
  adapters,
  presence,
  reviewPathPrefix: REVIEW_PATH_PREFIX,
});
```

See [DB setup](db-setup.md) before enabling Supabase in a shared environment.

## Source Locator

Host projects can opt into source file hints for local QA. The Vite plugin wraps React's dev JSX runtime and writes source attributes to rendered DOM nodes.

```ts
import { defineConfig } from 'vite';
import {
  reviewDataLocator,
  reviewSourceLocator,
} from '@designfever/web-review-kit/vite';

export default defineConfig({
  plugins: [
    reviewSourceLocator({
      enabled: true,
      include: ['src'],
      filePath: 'absolute',
    }),
    reviewDataLocator({
      enabled: true,
      include: ['src/data'],
      filePath: 'absolute',
    }),
  ],
});
```

Captured DOM nodes will include `data-wrk-source-file`, `data-wrk-source-line`, and `data-wrk-source-column`. When TypeScript is available in the host toolchain, the source locator parses TSX/JSX and also adds `data-wrk-source-component` to intrinsic JSX nodes. Data locator injects `__wrkDataFile` and `__wrkDataLine` props into page data section objects so the shell can expose matching `data-wrk-data-*` hints when host components forward those props to section wrappers.

In the review shell, hold `Option` over the target iframe to show source candidates from the DOM ancestry. Click the target to pin the candidate list, then choose which file to open. The side rail Source Tree panel lists section/source/data candidates and can scroll to a section or open its source/data file. It can also show live box metrics, text/font metadata, media URLs, and class tags for each node. If the file path is absolute, it opens directly. If the plugin stores relative paths, pass `sourceRoot` when mounting the shell.

Source opening reads these optional host env values from `.env.local`:

```env
VITE_REVIEW_SOURCE_ROOT=/absolute/path/to/project
VITE_REVIEW_SOURCE_EDITOR=cursor
VITE_REVIEW_SOURCE_URL_TEMPLATE=
```

`VITE_REVIEW_SOURCE_ROOT` is needed when the locator stores relative paths. Absolute source paths can open without it. `VITE_REVIEW_SOURCE_EDITOR` supports `vscode`, `cursor`, `webstorm`, and `custom`. Use `VITE_REVIEW_SOURCE_URL_TEMPLATE` only with `custom`; the template supports `{path}`, `{encodedPath}`, `{line}`, and `{column}`.

In Vite/ESM hosts, env values override matching `sourceRoot`, `sourceInspector.editor`, and `sourceInspector.urlTemplate` init values. Init values still work as a fallback for existing projects and CommonJS consumers.

```tsx
mountReviewShell({
  projectId: REVIEW_PROJECT_ID,
  pages,
  adapters,
  reviewPathPrefix: REVIEW_PATH_PREFIX,
  sourceInspector: {
    maxDepth: 9,
    hoverOutline: true,
    includePlacer: false,
    ignore: ['core.section', 'control.render'],
    // urlTemplate: 'my-editor://open?file={encodedPath}&line={line}&column={column}',
  },
});
```

Set `sourceInspector.enabled` to `false` when source code opening should be unavailable. Use `sourceInspector.ignore` to hide infrastructure files from source candidates and the Source Tree. Use `sourceInspector.maxDepth` to cap Source Tree traversal depth. Set `sourceInspector.hoverOutline` to `false` to disable iframe target outlines while hovering Source Tree items. Set `sourceInspector.includePlacer` to `true` when primitive Placer nodes should appear in Source Tree or source candidate lists. The `data-font` overlay still belongs to the target project markup and is not required for source opening.

Use this only in dev/review builds. Source paths are written into the browser DOM and can be persisted with QA items.

Source Tree filter/options, side panel state, and QA status filter are browser-local UI preferences. They are stored in localStorage and are not sent through the adapter.

In React shell mode, DOM/area draft composers dock into the QA panel when the shell provides a composer host. This keeps mobile Safari keyboard/viewport resize from moving a floating composer layer over the target frame.

## Custom Adapter

If a team or host project owns its own QA backend, keep that adapter in the host project or in a separate package. Start from [adaptor.sample.ts](adaptor.sample.ts) and map its `WebReviewKitAdapter` methods to your backend API. Do not put Figma image storage into the QA adapter; use a separate `ReviewFigmaImageStore`.

The sample explains the main interfaces:

- `ReviewItem`: the full QA payload to persist as structured JSON.
- `ReviewItemQuery`: filters used by page lists and sitemap counts.
- `WebReviewKitAdapter`: core CRUD contract.
- `ReviewShellAdapter`: React shell wiring for source labels, write modes, status updates, and delete actions.

### External Links

`ReviewItem.externalLinks` can carry multiple external issue/sheet links. Each link should include `label` and `url`, with optional `title` and `icon`.

If `externalLinks` is omitted, the shell still falls back to `externalIssueUrl` and renders it as a single `Remote` action. Use `externalLinks` when a host needs separate sheet, issue, preview, or admin links for the same QA item.

### Attachments and Capture

`ReviewItem.attachments` stores uploaded QA attachment metadata. Use `ReviewShellAdapter.uploadAttachment` to upload pasted files or iframe captures before adding the returned `ReviewAttachment` to an item.

The upload method receives a browser `File | Blob` plus optional `kind`, `name`, `mime`, `item`, and `metadata`, then returns `url`, `name`, `mime`, `size`, and optional storage metadata. If `uploadAttachment` is omitted and a draft contains attachments, submit fails with adapter feedback instead of silently dropping files.

Iframe captures are emitted as WebP when the DOM renderer succeeds and fall back to SVG only when raster capture is unavailable. Capture is based on same-origin iframe DOM access; it works on `localhost` and same-origin review hosts and is not HTTPS-only.

Private keys, admin credentials, canonical numbering, and permission checks should stay in your backend, not in browser code.

## Environment

The full copyable template is [.env.sample](../.env.sample).

```env
VITE_REVIEW_PROJECT_ID=my-project
VITE_REVIEW_SUPABASE_URL=
VITE_REVIEW_SUPABASE_ANON_KEY=
VITE_REVIEW_SUPABASE_TABLE=review_items
VITE_REVIEW_SUPABASE_PRESENCE_PRIVATE=false
VITE_REVIEW_SOURCE_ROOT=/absolute/path/to/project
VITE_REVIEW_SOURCE_EDITOR=cursor
VITE_REVIEW_SOURCE_URL_TEMPLATE=
```

Rules:

- Browser env uses a Supabase `anon` key only.
- Never expose `service_role` in browser env.
- OpenClaw/operator secrets stay outside the host browser and outside this package.

## Viewport Presets

Pass `presets` when a project has custom design widths.

```tsx
mountReviewShell({
  projectId: REVIEW_PROJECT_ID,
  pages,
  adapters,
  presets: [
    { label: 'Mobile', kind: 'mobile', width: 540, height: 1080, designWidth: 540 },
    { label: 'Tablet', kind: 'tablet', width: 768, height: 1024, designWidth: 768 },
    { label: 'Desktop', kind: 'desktop', width: 1440, height: 900, designWidth: 1440 },
    { label: 'Wide', kind: 'wide', width: 1980, height: 1080, designWidth: 1980 },
  ],
});
```

## Local Dev Harness

```bash
pnpm dev:review
```

Open `http://127.0.0.1:5177/review/`.

Fixture pages:

- `/`: note, area, and DOM marker creation
- `/components/`: controls and panel spacing
- `/long-form/`: scroll and anchor restore

## Checks

Package repo:

```bash
pnpm typecheck
pnpm build
pnpm typecheck:dev
pnpm build:dev
```

Host repo:

```bash
pnpm typecheck
pnpm build
```

Manual smoke:

1. Open `/review`.
2. Create local note, DOM marker, and area marker.
3. If Supabase is enabled, submit a local item to remote.
4. Confirm local draft removal, remote list display, status update, delete, and deep-link restore.

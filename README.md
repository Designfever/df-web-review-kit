# df-web-review-kit

Designfever web page review overlay toolkit.

`@designfever/web-review-kit` adds a `/review` shell to a host project. The shell opens real project pages in an iframe, creates QA notes/area/DOM markers, restores deep links, and lets each project choose its own storage adapter.

## Package Role

This package owns:

- review shell UI
- local draft storage
- marker creation and restore logic
- adapter contracts
- custom adapter sample
- optional Supabase adapter samples
- grid/Figma overlay controls for host pages that already support them

This package does not own internal operator tools, private admin keys, or production QA administration. OpenClaw tools such as `kuku` and future QA admin services stay outside the public npm package.

## Docs

- [Installation](docs/installation.md): install the package and mount `/review`.
- [Custom adapter sample](docs/adaptor.sample.ts): starting point for host-owned remote adapters.
- [DB setup](docs/db-setup.md): optional Supabase `review_items` setup, RLS, presence notes, and validation.
- [Architecture and runtime logic](docs/architecture.md): core runtime, React shell, coordinate, anchor, and extension boundaries.
- [Figma overlay](docs/figma-overlay.md): how the shell toggles a host Figma overlay.
- [Grid overlay](docs/grid-overlay.md): how the shell toggles a host grid/helper overlay.

## Quick Start

```bash
pnpm add @designfever/web-review-kit react react-dom
```

Minimal Vite route:

```tsx
import {
  createReviewPagesFromGlob,
  mountReviewShell,
} from '@designfever/web-review-kit/react-shell';
import {
  REVIEW_WORKFLOW_STATUS_OPTIONS,
  localAdapter,
} from '@designfever/web-review-kit';

const projectId = 'my-project';
const local = localAdapter({
  storageKey: `${projectId}-review-items`,
});

mountReviewShell({
  projectId,
  pages: createReviewPagesFromGlob(import.meta.glob('/**/index.tsx'), {
    exclude: (href) => href === '/review/',
  }),
  adapters: [
    {
      label: 'local',
      get: (id) => local.get(id),
      list: (query) => local.list(query),
      create: (item) => local.create(item),
      statusOptions: REVIEW_WORKFLOW_STATUS_OPTIONS,
      updateStatus: ({ id, status }) => local.update(id, { status }),
      syncSubmission: ({ id, patch }) => local.update(id, patch),
      remove: (id) => local.remove(id),
    },
  ],
  reviewPathPrefix: '/review',
});
```

See [Installation](docs/installation.md) for route files, Supabase adapter wiring, viewport presets, and verification commands.

## Optional Supabase Env

Only host projects that choose the Supabase adapter need these values.

```env
VITE_REVIEW_PROJECT_ID=df-web-review-kit
VITE_REVIEW_SUPABASE_URL=https://your-project.supabase.co
VITE_REVIEW_SUPABASE_ANON_KEY=
VITE_REVIEW_SUPABASE_TABLE=review_items
VITE_REVIEW_SUPABASE_PRESENCE_PRIVATE=false
```

Browser env must use a Supabase `anon` key only. Do not put `service_role` or OpenClaw operator secrets in a host browser env or in this package.

## Public Imports

```ts
import { createWebReviewKit, localAdapter } from '@designfever/web-review-kit';
import { mountReviewShell } from '@designfever/web-review-kit/react-shell';
import { reviewSourceLocator } from '@designfever/web-review-kit/vite';
```

- `@designfever/web-review-kit`: core API, adapters, shared types.
- `@designfever/web-review-kit/react-shell`: review shell UI, presence adapters, page glob helper.
- `@designfever/web-review-kit/vite`: dev-only JSX source locator for source file hints.
- `src/*` is not a public import path.

## Optional Source Locator

For local QA, add the Vite plugin to inject source hints into rendered DOM nodes.

```ts
import { defineConfig } from 'vite';
import { reviewSourceLocator } from '@designfever/web-review-kit/vite';

export default defineConfig({
  plugins: [
    reviewSourceLocator({
      enabled: true,
      include: ['src'],
      filePath: 'absolute',
    }),
  ],
});
```

When source hints are available, hold `Option` over the review target to inspect source candidates from the DOM ancestry. Click the target to pin the candidate list, then choose a file to open. DOM QA cards also show a source action when the saved item has source hints. Keep this plugin disabled for production builds because it writes source paths into the DOM.

```tsx
mountReviewShell({
  projectId: REVIEW_PROJECT_ID,
  pages,
  adapters,
  sourceRoot: import.meta.env.VITE_REVIEW_SOURCE_ROOT,
  sourceInspector: {
    editor: 'cursor', // 'vscode' | 'cursor' | 'webstorm' | 'custom'
    // urlTemplate: 'my-editor://open?file={encodedPath}&line={line}&column={column}',
  },
});
```

## Local Dev Harness

```bash
pnpm dev:review
```

Open `http://127.0.0.1:5177/review/`.

Useful checks:

```bash
pnpm typecheck
pnpm build
pnpm typecheck:dev
pnpm build:dev
```

## License

Apache-2.0. Copyright 2026 Designfever.

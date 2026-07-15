# df-web-review-kit

Designfever web page review overlay toolkit.

`@designfever/web-review-kit` adds a `/review` shell to a host project. The shell opens real project pages in an iframe, creates DOM/area QA markers, restores deep links, and lets each project choose its own storage adapter.

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

- [Docs index](docs/README.md): reading order, document roles, and release history.
- [Installation](docs/installation.md): install the package and mount `/review`.
- [.env.sample](.env.sample): copyable host project env template for local, Supabase, and source opening.
- [Adapter boundaries](docs/adapters.md): QA adapter vs Figma image store responsibilities.
- [Testing](docs/testing.md): Vitest adapter contract tests and local verification commands.
- [Custom adapter sample](docs/adaptor.sample.ts): starting point for host-owned remote adapters.
- [DB setup](docs/db-setup.md): optional Supabase `review_items` setup, RLS, presence notes, and validation.
- [Architecture and runtime logic](docs/architecture.md): core runtime, React shell, coordinate, anchor, sitemap, and feature ownership boundaries.
- [Figma overlay](docs/figma-overlay.md): host helper behavior and package-managed image overlay state.
- [Grid overlay](docs/grid-overlay.md): how the shell toggles a host grid/helper overlay.
- [Release notes 0.8.3](docs/release-notes-0.8.3.md): code-review bug fixes, sitemap state persistence and status filtering.

## Quick Start

```bash
pnpm add @designfever/web-review-kit react react-dom zustand
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

const projectId = import.meta.env.VITE_REVIEW_PROJECT_ID || 'my-project';
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
      fields: { title: true },
      statusOptions: REVIEW_WORKFLOW_STATUS_OPTIONS,
      updateStatus: ({ id, status }) => local.update(id, { status }),
      assigneeTitle: 'Assignee',
      assigneeOptions: [
        { value: 'planning', label: 'Planning' },
        { value: 'frontend', label: 'Frontend' },
      ],
      updateAssignee: ({ id, assigneeId, assigneeName }) =>
        local.update(id, { assigneeId, assigneeName }),
      syncSubmission: ({ id, patch }) => local.update(id, patch),
      remove: (id) => local.remove(id),
    },
  ],
  qaPrompt: 'Follow this project coding style before fixing the copied QA item.',
  reviewPathPrefix: '/review',
});
```

See [Installation](docs/installation.md) for route files, `.env.sample`, Supabase adapter wiring, viewport presets, and verification commands.

## Environment

Copy [.env.sample](.env.sample) into the host project as `.env.local`, then fill only the values that project needs.

Local-only review needs only `VITE_REVIEW_PROJECT_ID`.

```env
VITE_REVIEW_PROJECT_ID=my-project
```

Only host projects that choose the Supabase adapter need Supabase values.

```env
VITE_REVIEW_SUPABASE_URL=
VITE_REVIEW_SUPABASE_ANON_KEY=
VITE_REVIEW_SUPABASE_TABLE=review_items
VITE_REVIEW_SUPABASE_PRESENCE_PRIVATE=false
```

Source opening / Source Tree can also be configured from env.

```env
VITE_REVIEW_SOURCE_ROOT=/absolute/path/to/project
VITE_REVIEW_SOURCE_EDITOR=cursor
VITE_REVIEW_SOURCE_URL_TEMPLATE=
```

Browser env must use a Supabase `anon` key only. Do not put `service_role`, OpenClaw operator secrets, or private admin keys in a host browser env or in this package.

## Public Imports

```ts
import { createWebReviewKit, localAdapter } from '@designfever/web-review-kit';
import { mountReviewShell } from '@designfever/web-review-kit/react-shell';
import {
  reviewDataLocator,
  reviewSourceLocator,
} from '@designfever/web-review-kit/vite';
```

- `@designfever/web-review-kit`: core API, adapters, shared types.
- `@designfever/web-review-kit/react-shell`: review shell UI, presence adapters, page glob helper.
- `@designfever/web-review-kit/vite`: dev-only source/data locators for review hints.
- `src/*` is not a public import path.

## Optional Source Locator

For local QA, add the Vite plugin to inject source hints into rendered DOM nodes.

```ts
import { defineConfig } from 'vite';
import {
  reviewDataLocator,
  reviewSourceLocator,
} from '@designfever/web-review-kit/vite';

export default defineConfig({
  plugins: [
    reviewSourceLocator({
      include: ['src'],
      filePath: 'absolute',
    }),
    reviewDataLocator({
      include: ['src/data'],
      filePath: 'absolute',
    }),
  ],
});
```

The locator plugins run automatically on the Vite dev server and stay disabled in production builds. Source Tree and the `Option` shortcut stay available without `sourceRoot` or an `enabled` option; `sourceRoot` is only needed to open relative source paths. When source hints are available, hold `Option` over the review target to inspect its source outline, then click the target to open the closest component in Source Tree. The source locator also reads TSX/JSX with the TypeScript parser when available and writes `data-wrk-source-component` for intrinsic JSX nodes, which helps the inspector prefer real component candidates over repeated wrapper primitives. For function component render paths, it also records the parent JSX call site so Source Tree can show where a component was used. The side rail can open a Source Tree panel with section/source/data links, parent usage links, live box metrics, text/font/media metadata, and class tags. DOM QA cards show a source action when the saved item has source hints. Source Tree filter/options, QA panel mode, and QA status filter are stored in browser localStorage.

In Vite/ESM hosts, source opening reads `VITE_REVIEW_SOURCE_ROOT`, `VITE_REVIEW_SOURCE_EDITOR`, and `VITE_REVIEW_SOURCE_URL_TEMPLATE` from the host env. Env values override matching `sourceRoot`, `sourceInspector.editor`, and `sourceInspector.urlTemplate` init values; init values still work as a fallback for existing projects and CommonJS consumers. Use `VITE_REVIEW_SOURCE_URL_TEMPLATE` only with `VITE_REVIEW_SOURCE_EDITOR=custom`; the template supports `{path}`, `{encodedPath}`, `{line}`, and `{column}`.

```tsx
mountReviewShell({
  projectId: REVIEW_PROJECT_ID,
  pages,
  adapters,
  sourceInspector: {
    maxDepth: 9,
    hoverOutline: true,
    includePlacer: false,
    ignore: ['core.section', 'control.render'],
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
pnpm test
pnpm build
pnpm typecheck:dev
pnpm build:dev
```

## License

Apache-2.0. Copyright 2026 Designfever.

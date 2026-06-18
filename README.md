# df-web-review-kit

Web page review overlay toolkit for Designfever projects.

```ts
import { createWebReviewKit, localAdapter } from '@designfever/web-review-kit';

createWebReviewKit({
  projectId: 'lexus-official-v2026',
  adapter: localAdapter({
    storageKey: 'lexus-official-v2026-review-items',
  }),
  hotkeys: {
    qa: 'Shift+Q',
  },
});
```

## Docs

- [Initial plan](docs/initial-plan.md)
- [df-sheet adapter implementation plan](docs/df-sheet-adapter.md)

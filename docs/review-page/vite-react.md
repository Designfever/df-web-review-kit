# Vite + React `/review`

Create the route using the host's existing router or multi-page entry. The CLI must not edit `vite.config.*`, router files, or HTML entries.

```tsx
import { useEffect } from 'react';
import { localAdapter } from '@designfever/web-review-kit';
import {
  createReviewPagesFromGlob,
  mountReviewShell,
} from '@designfever/web-review-kit/react-shell';
import { REVIEW_PROJECT_ID } from '../../df';

const pages = createReviewPagesFromGlob(
  import.meta.glob('/src/**/*.{jsx,tsx}'),
  { exclude: (href) => href === '/review/' }
);

export function ReviewPage() {
  useEffect(() => {
    return mountReviewShell({
      rootId: 'review-root',
      projectId: REVIEW_PROJECT_ID,
      pages,
      adapters: [
        localAdapter({ storageKey: `${REVIEW_PROJECT_ID}-review-items` }),
      ],
      reviewPathPrefix: '/review',
    });
  }, []);

  return <div id="review-root" style={{ width: '100vw', height: '100vh' }} />;
}
```

Standard Designfever hosts should replace the local adapter with the [df-sheet login/session flow](../df-sheet.md). If the host uses a separate HTML entry instead of a router, mount the same component from that entry and keep its HTML/Vite changes host-owned.

Add `reviewSourceLocator()` and other Vite plugins manually only when the project needs them. Use the host's current Vite configuration style.

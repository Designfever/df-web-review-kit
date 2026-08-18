# Custom framework `/review`

The host must create the route and a container element. Mount after the container exists and keep the returned cleanup callback.

```ts
import { localAdapter } from '@designfever/web-review-kit';
import { mountReviewShell } from '@designfever/web-review-kit/react-shell';
import { REVIEW_PROJECT_ID } from '../../df';

export function mountReviewPage() {
  return mountReviewShell({
    rootId: 'review-root',
    projectId: REVIEW_PROJECT_ID,
    pages: [{ href: '/' }],
    adapters: [
      localAdapter({ storageKey: `${REVIEW_PROJECT_ID}-review-items` }),
    ],
    reviewPathPrefix: '/review',
  });
}

// const unmount = mountReviewPage();
// Later, when the host destroys or replaces the route: unmount?.();
```

Review Shell uses React internally. Install `react`, `react-dom`, and `zustand` when the host does not already provide them. Standard Designfever hosts should replace the local adapter with the [df-sheet login/session flow](../df-sheet.md).

For Jira, Mantis, Trac, FTP, a custom database, or a custom Figma bridge, keep the adapter inside the host repository and document its own authentication and deployment steps. Do not add that integration as a CLI option.

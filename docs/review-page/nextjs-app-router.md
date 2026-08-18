# Next.js App Router `/review`

Create a server route wrapper and a client component. Adjust the relative `df.ts` import when the host uses `src/app`.

```tsx
// app/review/page.tsx
import type { Metadata } from 'next';
import { ReviewClient } from './review-client';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function ReviewPage() {
  return <ReviewClient />;
}
```

```tsx
// app/review/review-client.tsx
'use client';

import { useEffect } from 'react';
import { localAdapter } from '@designfever/web-review-kit';
import { mountReviewShell } from '@designfever/web-review-kit/react-shell';
import { REVIEW_PROJECT_ID } from '../../df';

const pages = [
  { href: '/' },
  { href: '/about' },
];

export function ReviewClient() {
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

Next.js does not provide Vite's `import.meta.glob`, so keep the page list in host code or derive it from the host's existing sitemap data. Do not scan `.next` output. Standard Designfever hosts should replace the local adapter with the [df-sheet login/session flow](../df-sheet.md); keep page selection in this host-owned component.

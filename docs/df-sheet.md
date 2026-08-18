# df-sheet connection

The standard Designfever setup uses df-login. The browser receives a short review session after PKCE login; it never receives a permanent df-sheet token or the user's raw Figma token.

Only the public df-sheet project UUID is checked into the host:

```ts
// df.ts
export const REVIEW_PROJECT_ID = 'f82b8ad5-7289-43d4-b175-bd5ecf1d4dba';
```

Connect from the host-owned `/review` page:

```ts
import { connectDfSheetReview } from '@designfever/web-review-kit/df-sheet';
import { mountReviewShell } from '@designfever/web-review-kit/react-shell';
import { REVIEW_PROJECT_ID } from '../../df';

const session = await connectDfSheetReview({ projectId: REVIEW_PROJECT_ID });
if (!session) return; // The browser is going to df-login.

const reviewPages = await session.listPages();
const selectedPage = reviewPages[0];
if (!selectedPage) throw new Error('This df-sheet project has no pages.');

const unmount = mountReviewShell({
  rootId: 'review-root',
  projectId: REVIEW_PROJECT_ID,
  pages: [{ href: '/' }, { href: '/about' }],
  adapters: [session.createAdapter({ pageId: selectedPage.id })],
  figmaImages: { store: session.figmaImageStore },
  reviewPathPrefix: '/review',
});
```

If the df-sheet project has more than one page, the host must choose one safely. A small page selector is usually enough. Do not silently send QA to an arbitrary page when page meaning matters.

## Deployment values

No review secret is required in the host or Vercel:

- df-sheet URL: package default (`https://df-sheet.vercel.app`)
- df-sheet token: short session issued after df-login
- Figma token: read server-side from the authenticated df-sheet user
- Figma image endpoint and asset storage: owned by df-sheet and df-asset-hub
- host value: `REVIEW_PROJECT_ID` in checked-in `df.ts`

The session is stored only in browser `sessionStorage` and expires quickly. Reload the review page to sign in again after expiration. `baseUrl` exists only for local df-sheet development.

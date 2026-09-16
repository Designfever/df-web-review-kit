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

The df-sheet adapter also enables the `개선사항` rail button automatically.
It opens an in-context form for title, category, related area, description, and
image attachments. A submission is stored in the same df-sheet improvements
list, includes the current Review Kit URL in its description, and uses the
existing df-sheet administrator notification flow.

If the df-sheet project has more than one page, the host must choose one safely. A small page selector is usually enough. Do not silently send QA to an arbitrary page when page meaning matters.

## Deployment values

No review secret is required in the host or Vercel:

- df-sheet URL: package default (`https://df-sheet.vercel.app`)
- df-sheet token: short session issued after df-login
- Figma token: read server-side from the authenticated df-sheet user
- Figma image endpoint and asset storage: owned by df-sheet and df-asset-hub
- host value: `REVIEW_PROJECT_ID` in checked-in `df.ts`

The authenticated session is stored only in browser `sessionStorage` and expires
quickly. The optional remembered page preference is non-sensitive and uses
`localStorage`. Reload the review page to sign in again after expiration.
`baseUrl` exists only for local df-sheet development.

## Shared page selection (0.12.0)

Use `connectDfSheetReview({ projectId, selectPage: true })` to select a QA page
in df-sheet after login. The returned session exposes `selectedPageId`, which
can be passed to `session.createAdapter({ pageId: session.selectedPageId! })`.
Projects with one page continue automatically. The host URL's original query
parameters are restored when login finishes.

Page selection is opt-in; omit it for Figma-only helpers or hosts that provide
their own selector. The selection is a UI preference within the authenticated
project, not a new authorization scope. The kit verifies the callback page
against the project's authenticated page list and caches it with the session.

Deploy df-sheet's `/review/select-page` and updated SSO authorize route before
enabling this option in hosts. Existing login-only callers remain supported.

## Remembering a host page selection (0.13.2)

Hosts that render their own page selector can remember the last validated page
with the session helpers. The preference is scoped to the authenticated project
and user, while the access token remains in `sessionStorage`.

```ts
const reviewPages = await session.listPages();
const rememberedPageId = session.resolveSelectedPageId(reviewPages);

if (rememberedPageId) openReview(rememberedPageId);

function selectReviewPage(pageId: string) {
  session.rememberSelectedPageId(pageId, reviewPages);
  openReview(pageId);
}
```

Always pass the authenticated `listPages()` result to both helpers. A stored
page that was deleted or is no longer accessible is removed automatically, so
the host can show its selector again. Logging out clears the short review
session but keeps this non-sensitive preference for the next login.

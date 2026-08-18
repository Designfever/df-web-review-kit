# Release Notes: 0.10.0

0.10.0 makes easy install smaller and makes df-sheet the standard secure connection for Designfever projects.

## Easy install boundary

- `init` asks only for the df-sheet project ID and project name.
- The CLI installs the exact package version and creates only checked-in `df.ts`.
- The CLI detects Next.js App Router, Vite + React, Vue Router, or a custom host and prints a version-pinned guide.
- The CLI never creates `/review`, edits a router, patches Vite, generates provider code, or accepts a hardcoded provider option.
- Legacy automatic route migration is blocked; doctor gives manual guidance without changing the host.

This is intentionally breaking from the experimental 0.9 installer. Remove any expectation that `init` owns the review page or custom adapter.

## df-login and df-sheet

The new `@designfever/web-review-kit/df-sheet` entry provides:

- df-login authorization with PKCE;
- a short browser review session stored in `sessionStorage`;
- authenticated df-sheet page listing and QA create/read/update/delete;
- authenticated attachment upload;
- a df-sheet-backed Figma image store using the server-side user token and df-asset-hub storage.

The host needs only `REVIEW_PROJECT_ID` in `df.ts`. It does not need a permanent df-sheet token, raw Figma token, image endpoint, asset-hub URL, or asset-hub key.

## Host-owned review pages

Review routes remain case-by-case because host routing and page discovery differ. New guides cover Next.js App Router, Vite + React, Vue Router, and custom hosts. `mountReviewShell()` now returns an unmount callback for route cleanup.

The first Next.js dogfood host is `ikaos-content-studio-v2026`. Its route uses df-login, explicit df-sheet page selection when needed, the df-sheet QA adapter, and the authenticated Figma image proxy.

## Compatibility

- Existing core, React Shell, Vite, profile, and init imports remain available.
- Legacy df-sheet review tokens remain a df-sheet server compatibility path, but the new standard host flow does not use them.
- Hardcoded Jira, Mantis, Trac, FTP, custom database, or custom Figma bridges stay in each host repository and should not run `init`.

## Verification

- TypeScript typecheck
- full Vitest suite
- library and CLI build
- packed tarball install E2E
- npm pack file review
- iKAOS typecheck, focused ESLint, and production build
- live df-sheet authorize endpoint redirects to df-login for the configured project

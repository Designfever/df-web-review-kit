# Host-owned `/review` page

The CLI never creates or patches `/review`. Routing, page discovery, and lifecycle behavior belong to the host because Next.js, Vite, Vue, and custom applications use different entry points.

Choose the detected host guide:

- [Next.js App Router](nextjs-app-router.md)
- [Vite + React](vite-react.md)
- [Vue Router](vue-router.md)
- [Custom framework](custom.md)

## Review page contract

Every host implementation must:

1. create a client-only `/review` route;
2. import `REVIEW_PROJECT_ID` from the checked-in root `df.ts`;
3. provide the host page list and exclude `/review` itself;
4. provide the selected review adapters and optional Figma image store;
5. mount Review Shell after the route container exists;
6. unmount Review Shell when the host route is destroyed;
7. mark the route `noindex` and protect it with the host's normal access policy when needed.

The CLI does not generate provider code. Standard Designfever hosts use the package's [df-sheet connection](../df-sheet.md). A hardcoded Jira, Mantis, Trac, FTP, custom database, or custom Figma bridge remains host-owned and should not run the installer.

## Verification

Verify the complete flow, not only that the route renders:

1. Open `/review` directly and through client navigation.
2. Complete df-login when df-sheet is enabled.
3. Confirm the host page list and make sure `/review` is absent.
4. Open a target page inside the review frame.
5. Confirm the Figma overlay when configured.
6. Submit QA and confirm it appears in the selected backend.
7. Run `npx @designfever/web-review-kit doctor` and the host build.

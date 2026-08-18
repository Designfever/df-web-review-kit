# Easy install

The installer prepares shared configuration. It never creates or patches `/review`, router files, framework entries, or provider adapters.

## Standard or personal project

Preview first:

```bash
npx @designfever/web-review-kit@0.10 init --dry-run
```

Apply after checking the small diff:

```bash
npx @designfever/web-review-kit@0.10 init --yes
```

The installer creates the checked-in root config:

```ts
// df.ts
export const REVIEW_PROJECT_ID = 'f82b8ad5-7289-43d4-b175-bd5ecf1d4dba';
```

`REVIEW_PROJECT_ID` is the df-sheet project UUID from the project URL. It is public identification, not authentication.

For the standard Designfever setup, the host route uses [df-sheet connection](df-sheet.md). df-login supplies a short review session, and df-sheet proxies Figma image work with the logged-in user's server-side token. The host and Vercel need no review token, Figma token, image endpoint, or asset-hub secret.

After approval, the CLI uses the detected npm, pnpm, or Yarn owner to install the exact review-kit version. A `file:`, `link:`, or `workspace:` dependency is preserved for local dogfooding.

After setup, the CLI detects the framework and prints a version-pinned guide URL. Follow that guide to create the host-owned `/review` route:

- [Next.js App Router](review-page/nextjs-app-router.md)
- [Vite + React](review-page/vite-react.md)
- [Vue Router](review-page/vue-router.md)
- [Custom framework](review-page/custom.md)

## Custom or hardcoded integration

Do not run the installer for a project that needs a one-off Jira, Mantis, Trac, FTP, custom database, or custom Figma bridge adapter. Build and document that adapter in the host repository, then follow only the relevant [review page contract](review-page/README.md).

Custom provider code is intentionally not a CLI option.

## Diagnosis

`doctor` is read-only unless `--fix --yes` is passed:

```bash
npx @designfever/web-review-kit@0.10 doctor
npx @designfever/web-review-kit@0.10 doctor --json
```

The doctor checks the package, `df.ts`, the host-owned `/review` route, Review Shell mounting, adapter wiring, and optional Figma/source capabilities. It does not generate a missing route. Legacy route migrations are reported as manual work because the CLI cannot safely choose a framework structure.

## Verification

```bash
npx @designfever/web-review-kit@0.10 doctor
```

Then run the host build and verify the complete `/review` flow described in [Host-owned `/review` page](review-page/README.md).

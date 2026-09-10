# Custom panels — step 4 review evidence

Baseline: `ba1babf` (step 3); initial working tree clean. Repository/parent AGENTS.md
checks found no additional project instructions. No subagents, HMG changes,
version bump, external QA writes, push, or publication.

## Deliverables

- `docs/custom-panels.md`: public API, readiness, same-origin/document boundary,
  styles/fonts, visibility versus unmount, cleanup, and persistence responsibilities.
- `docs/examples/custom-panel.tsx`: complete browser-only local review mount and
  target editor with standalone right-side fallback; separately type-checked.
- `docs/release-notes-custom-panels-draft.md`: explicitly unreleased, version unassigned.
- `docs/testing.md` and `scripts/e2e/custom-panel.mjs`: reproducible browser checks.
- Minimal internal type cleanup: CustomPanelEntry no longer an unused export;
  useCustomPanelRegistry explicitly returns CustomPanelRegistry so declaration
  generation can name the return type. No runtime behavior fix was needed.

## Local-only browser run

A separate Vite server was launched with
`VITE_REVIEW_SUPABASE_URL= pnpm dev:review --port 5179` to disable remote adapters
and presence. The ordinary dev server was not stopped. Puppeteer used installed
Google Chrome, a fresh headless profile, and a 1440×1000 shell viewport.

```sh
PUPPETEER_MODULE=/opt/homebrew/lib/node_modules/puppeteer/lib/esm/puppeteer/puppeteer.js \
CHROME_BIN='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' \
REVIEW_BASE_URL=http://127.0.0.1:5179 \
REVIEW_EVIDENCE_DIR=~/Shared/AgentFiles/df-web-review-kit/custom-panel-regression \
node scripts/e2e/custom-panel.mjs
```

Passed functional assertions:

- Standalone right-side text/color controls update the preview immediately.
- In Review Kit, input focus, Tab-to-color, text/color, and parent-document CSS work.
- Close/open and switching to Design, Figma, QA, and Component List preserve the
  same input DOM and value; Shift+1–4 still select built-in tools.
- Duplicate public registration returns `duplicate-id`, leaving the original intact.
- Only the review document hosts the editor, never a second editor in the target.
- Three toolbar reloads each replace the old editor once and reset unsaved target
  values to defaults; no persistence is claimed.
- Shell path navigation and target-owned SPA navigation remove and reconnect one
  editor with no visible stale or duplicate editor.
- No pageerror events and **zero external HTTP requests**; no QA records modified.

| Target width | Preview bounds width | Responsive heading font | max-width:620px |
| --- | --- | --- | --- |
| 390 | 364 | 24px | true |
| 620 | 594 | 24.8px | true |
| 768 | 718 | 30.72px | false |
| 1920 | 1118 | 40px | false |

At every preset, closing/opening the panel left these measurements unchanged.

## Memory observation — NOT signed off

All three weakly tracked previous containers were detached (`isConnected=false`).
After forced collection they were still observable: **0/3 collected**. Initial
heap inspection found DevTools roots; an isolated probe also exposed browser
native/weak-map retention paths. Releasing automation sessions and console entries
did not establish collection. This does **not** prove the package is leak-free,
and it does not identify a confirmed package-owned leak either.

The browser script therefore hard-asserts functional detachment/registration
counts but records collection separately as `inconclusive`; it does not silently
report a GC pass. Further heap ownership analysis and cross-browser memory checks
remain a review/release caveat. No speculative lifecycle change was made solely
to force garbage collection.

Evidence files:

- `~/Shared/AgentFiles/df-web-review-kit/custom-panel-regression/result.json`
- `~/Shared/AgentFiles/df-web-review-kit/custom-panel-regression/standalone.png`
- `~/Shared/AgentFiles/df-web-review-kit/custom-panel-regression/review.png`

## Package and dev checks

- `pnpm typecheck`: passed.
- `NODE_OPTIONS=--no-experimental-webstorage pnpm test`: 59 files / 301 tests passed.
- `pnpm lint:dead-code`: passed after internal type cleanup.
- `pnpm build`: ESM/CJS/declarations/CLI passed after explicitly naming the hook return type.
- `pnpm typecheck:dev` and `pnpm build:dev`: passed; existing >500 kB chunk warning only.
- Standalone strict TSX check of `docs/examples/custom-panel.tsx`: passed with
  `tsc --ignoreConfig --noEmit --module ESNext --moduleResolution Bundler --jsx react-jsx --target ES2020 --skipLibCheck --strict`.
- `npm pack --dry-run --ignore-scripts --json`: 113 files, 1,439,595 bytes; new public
  documents/example included, internal design folder excluded. Build was already
  verified separately; no tarball publication performed.
- `git diff --check`: passed.

Review-ready functional implementation and integration docs; not release approval.

# Release Notes: 0.10.1

0.10.1 fixes review-shell interaction layers that could become unclickable in
some host pages.

## Fixed viewport host

- The review-kit root now uses a fixed, full-viewport host instead of
  `display: contents`.
- The host keeps `pointer-events: none`; interactive child layers continue to
  opt in to pointer events.
- The root uses the package's top-level z-index so QA controls remain above the
  reviewed page.

This fixes cases where the QA composer or other review controls were visible
but could not receive pointer input. There are no public API or setup changes.

## Verification

- Regression coverage for the fixed viewport root
- TypeScript typecheck
- Full Vitest suite
- Library and CLI build

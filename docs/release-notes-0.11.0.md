# Release Notes: 0.11.0

0.11.0 adds a Design Inspector to the Review Shell for inspecting DOM elements,
computed CSS, box models, and distances inside the existing preview iframe.

## Design Inspector

- Inspect typography, colors, dimensions, spacing, and computed CSS.
- Navigate between parent, child, and sibling elements, open available source
  locations, and copy CSS reports.
- Select `body` by default when opening the inspector or loading a new preview
  document, so page styles are immediately available.
- Switch between element selection, normal site browsing, and distance measurement.
- Preserve Browse mode when navigation replaces the preview iframe, so the next
  site click is not intercepted by element selection.
- Use a cursor-in-a-square rail icon and a compact header consistent with QA.
- Close through the rail toggle; there is no separate close button or inspector-only
  Escape behavior.

## Shortcut changes

Shift+Q now toggles between the normal page and the Review Shell. Entering review
uses the current path, query, and hash; leaving review uses the iframe's current
page and removes the internal preview marker. The shortcut ignores text inputs,
repeated key events, and blocking shell dialogs. Normal pages must mount
`mountFigmaDevOverlay`; pages without this integration do not register the shortcut.
This replaces the Review Shell's previous Shift+Q QA-runtime toggle.

Rail shortcuts now follow the visible panel order:

| Shortcut | Panel |
| --- | --- |
| Shift+1 | Design Inspector |
| Shift+2 | Figma Images |
| Shift+3 | QA tasks |
| Shift+4 | Component List |

Figma Images, QA, and Component List previously used Shift+1, Shift+2, and
Shift+3 respectively. Shift+D is replaced by Shift+1; the R / ㄱ inspector alias is removed. Tooltips and shortcut help reflect the new mapping.

## Preview defaults

- The default PC viewport is now 1920 × 1280.

## Limits

The inspector requires an accessible same-origin preview document. CSS values
are browser-computed values, not original stylesheet rules or cascade priorities.
Source opening requires source metadata from the host.

## Verification

- 277 tests across 56 Vitest files passed.
- Package and dev TypeScript checks and Knip passed.
- Library, CLI, and dev builds passed.
- npm pack dry run and packed-install E2E passed, including a Vite host build,
  Next.js detection, and legacy/custom installer checks.
- Browser verification confirmed default body selection, compact header controls,
  and Browse mode across Home → Components → Long-form navigation.
- Dev and packed-host builds report a non-blocking chunk-size warning.

# Portal editor demo — step 3

## Run

```sh
pnpm dev:review
```

- Standalone: <http://127.0.0.1:5177/components/>
- Review: <http://127.0.0.1:5177/review/?target=/components/&w=768&h=1024>

On the standalone page, use the controls to the right of the Live preview card.
In Review Kit, click **Preview editor** (sliders icon) in the right rail. The panel
registers without opening automatically, so it does not replace an active QA tool.

Type in **Preview text**, select **Accent color**, and watch the target heading
update. **Reset preview** restores `Make it yours` and `#60a5fa`. An empty text
field displays the `Your text here` placeholder. Nothing is persisted or saved.

## Implementation

- `dev/src/fixtures/components/portal-editor-demo.tsx`: one PreviewEditor component;
  text/color state belongs to PortalEditorDemo in the target React tree. Both
  routes portal the same editor into their respective containers.
- Standalone owns an adjacent right-side `aside`. A framed fixture uses
  `connectReviewCustomPanel` and its ready container, never a queried DOM ID.
  Waiting/unavailable frames do not create a second local editor.
- `dev/src/fixtures/components/portal-editor.css`: scoped, explicit editor colors,
  font, inputs, and focus styling. `dev/src/main.tsx` imports this sheet into both
  the review document and target document; iframe CSS does not follow a portal.
- The Components fixture includes the card. The dev review mount opts in with
  `customPanels: true`. No package runtime changes or HMG code were needed.
- Frame identity, rather than the removable target URL query flag, selects the
  host. Effect cleanup unregisters the editor when the fixture unmounts.

## Verified in step 3

`pnpm typecheck:dev` and `pnpm build:dev` passed. Vite emitted its existing
non-fatal >500 kB chunk warning. `git diff --check` passed.

Browser assertions ran through Puppeteer against installed Google Chrome in a
fresh headless profile, with a 1440×1000 shell viewport:

| Check | Observed result |
| --- | --- |
| Standalone text/color edit | `Standalone edit`, computed color `rgb(255, 136, 68)` |
| Standalone placement | Editor bounds to the right of the preview; exactly one editor |
| Review text/color edit | Parent-panel input updates iframe heading to `Portal edit`, computed color `rgb(34, 204, 136)` |
| CSS in both documents | Editor background `rgb(17, 24, 39)` in both hosts; screenshots visually inspected |
| Portal location | One editor in review document, none in target document |
| QA → editor switch | Same input DOM node and `Portal edit` value survive |
| Viewport | Target innerWidth remains 768px after panel switching |
| Actual iframe reload | A single editor reconnects with default `Make it yours`; no persistence claimed |
| Browser errors | No pageerror events |

Screenshots are available in the shared AgentFiles folder:

- `~/Shared/AgentFiles/df-web-review-kit/custom-panel-demo/standalone.png`
- `~/Shared/AgentFiles/df-web-review-kit/custom-panel-demo/review.png`

This proves the working demo, not the full release acceptance matrix. Broader
viewport/navigation/accessibility/memory regression checks and public integration
documentation remain in the next verification step. No push or release performed.

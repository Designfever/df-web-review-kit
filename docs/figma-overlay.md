# Figma Overlay

The Figma overlay button in the review shell toggles a host-page helper. The
Figma image manager can also call the review-kit image store when the host wires
one.

## User Flow

- Open `/review`.
- Click the settings button.
- Enter a Figma token if the host helper or image store fallback requires one.
- Click the Figma overlay button or press `f`.

The token is stored in browser localStorage with this key:

```txt
figma-token
```

For Figma image add/render requests, the server/dev process uses `FIGMA_TOKEN`
first. If that env token is missing, the browser sends this Settings token to
the same-origin image store request as a fallback.

Treat this as a review/debug convenience. Do not expose `VITE_FIGMA_TOKEN`.

### Security note: browser-stored token

The Settings token lives in plain `localStorage`. A Figma personal access token
grants read access to every file the account can see, so any XSS on the host
origin can read this key and exfiltrate it. Reduce the blast radius:

- Prefer the server-side `FIGMA_TOKEN` env path. Only fall back to the Settings
  token when a dev/reviewer genuinely cannot set server env.
- When you must use the Settings token, use a short-lived or narrowly scoped
  token and clear it from Settings when you are done.
- Never commit or share the token, and never expose it as `VITE_FIGMA_TOKEN`
  (that ships it to every browser bundle).

The token is only sent to the same-origin image store endpoint via the
`X-Figma-Token` header; it is not sent to `api.figma.com` from the browser.

## Dev Server Image Store Hardening

The `reviewFigmaImageStore()` Vite plugin runs only under `vite dev` (`apply:
'serve'`); it is not part of `vite build` output, so production/Vercel deploys
are unaffected. Because the dev endpoint is unauthenticated, its middleware
applies minimal request checks:

- **Cross-origin block**: browser requests whose `Origin` does not match the
  request `Host` (and is not loopback) are rejected with `403`. Requests without
  an `Origin` header (curl, scripts) and same-origin requests — including LAN IP
  access for mobile testing — are allowed.
- **JSON content type**: request bodies must be `application/json`. This blocks
  `text/plain` "simple" cross-site POSTs that would otherwise skip a CORS
  preflight. Rejected with `415`.
- **Body size limit**: JSON bodies are capped (default 25 MB, configurable via
  the `maxRequestBytes` plugin option). Oversized bodies are rejected with `413`.

These guards protect the developer's local `FIGMA_TOKEN` and `.df-review`
working files from CSRF-style requests made by other pages open in the browser.

## Availability

The shell currently enables the Figma overlay on viewport presets whose `kind` is:

- `mobile`
- `wide`

Other viewport kinds show the unavailable message.

## Host Requirements

The target page inside the iframe must already support the Figma helper.

Expected behavior:

- The target page reacts to a `KeyboardEvent` with `code: 'KeyF'`.
- The target page mounts a visible Figma helper layer.
- The helper root uses one of these selectors:
  - `.helper-figma-root`
  - `.helper-figma-loading-backdrop`

The review shell uses those selectors only to detect whether the overlay is active.

When the package-managed Figma image store is configured, the shell renders image
overlays into the iframe instead. Those overlays use:

- `#df-review-figma-image-target-root`
- `.df-review-figma-image-target-overlay`

The image overlay hit layer is interactive only when the image can be dragged.
During element review mode or `Option` source selection, the shell temporarily
locks both host helper layers and package image overlays with
`pointer-events: none` so target selection is not blocked. Releasing `Option`
restores the image overlay hit area.

## Troubleshooting

If the button does nothing:

- Confirm the iframe target page is same-origin and can receive dispatched keyboard events.
- Confirm the host helper listens for `KeyF`.
- Confirm the helper renders `.helper-figma-root` or `.helper-figma-loading-backdrop`.
- Confirm the current viewport preset is `mobile` or `wide`.
- If `Option` source selection cannot pick an element under a Figma image
  overlay, confirm the overlay root uses the package selectors above or the host
  helper selectors listed in Host Requirements.

If the overlay needs a private shared Figma integration, move that work to a
backend/admin service and expose only browser-safe state to the host page.

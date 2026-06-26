/**
 * Single source of truth for review-kit typography tokens.
 *
 * Edit font sizes / weights here once; both the React shell chrome
 * (style/base.ts → body) and the in-page overlay (overlay.style.ts → :host)
 * consume the same declarations. This is a debug surface, so sizes stay small.
 * Weights are intentionally flat: `normal` for everything, `emphasis` for the
 * few elements that must stand out.
 */
export const reviewTypographyTokens = `
    --df-review-font-sans: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    --df-review-font-mono: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
    --df-review-font-size-3xs: 9px;
    --df-review-font-size-2xs: 10px;
    --df-review-font-size-xs: 11px;
    --df-review-font-size-sm: 12px;
    --df-review-font-size-md: 13px;
    --df-review-font-size-lg: 14px;
    --df-review-font-size-xl: 15px;
    --df-review-font-size-2xl: 18px;
    --df-review-font-weight-normal: 400;
    --df-review-font-weight-emphasis: 500;
    --df-review-line-height-tight: 1.25;
    --df-review-line-height-base: 1.42;
    --df-review-line-height-relaxed: 1.55;
`;

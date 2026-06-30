"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/react-shell.tsx
var react_shell_exports = {};
__export(react_shell_exports, {
  DEFAULT_REVIEW_VIEWPORT_PRESETS: () => DEFAULT_REVIEW_VIEWPORT_PRESETS,
  ReviewShell: () => ReviewShell,
  createFallbackPresenceAdapter: () => createFallbackPresenceAdapter,
  createLocalPresenceAdapter: () => createLocalPresenceAdapter,
  createReviewPagesFromGlob: () => createReviewPagesFromGlob,
  createSupabasePresenceAdapter: () => createSupabasePresenceAdapter,
  mountFigmaDevOverlay: () => mountFigmaDevOverlay,
  mountReviewShell: () => mountReviewShell
});
module.exports = __toCommonJS(react_shell_exports);
var import_react26 = __toESM(require("react"), 1);
var import_client2 = require("react-dom/client");

// src/core/typography.tokens.ts
var reviewTypographyTokens = `
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

// src/react-shell/style/base.ts
var reviewShellBaseStyle = `
	  * {
	    box-sizing: border-box;
	    scrollbar-color: var(--df-review-scrollbar-thumb, rgba(237, 243, 251, 0.2)) var(--df-review-scrollbar-track, rgba(237, 243, 251, 0.04));
	    scrollbar-width: thin;
	  }

	  *::-webkit-scrollbar {
	    width: 10px;
	    height: 10px;
	  }

	  *::-webkit-scrollbar-track {
	    background: var(--df-review-scrollbar-track, rgba(237, 243, 251, 0.04));
	  }

	  *::-webkit-scrollbar-thumb {
	    border: 2px solid var(--df-review-scrollbar-border, rgba(15, 18, 24, 0.92));
	    border-radius: var(--df-review-radius-pill);
	    background: var(--df-review-scrollbar-thumb, rgba(237, 243, 251, 0.18));
	  }

	  *::-webkit-scrollbar-thumb:hover {
	    background: var(--df-review-scrollbar-thumb-hover, rgba(237, 243, 251, 0.28));
	  }

	  *::-webkit-scrollbar-corner {
	    background: transparent;
	  }

  .df-review-spinner {
    display: inline-block;
    width: 22px;
    min-width: 22px;
    height: 22px;
    min-height: 22px;
    box-sizing: border-box;
    border: 3px solid color-mix(in srgb, var(--df-review-accent) 28%, transparent);
    border-top-color: var(--df-review-accent);
    border-radius: 50%;
    animation: df-review-spinner-spin 760ms linear infinite;
    will-change: transform;
  }

  @keyframes df-review-spinner-spin {
    to {
      transform: rotate(1turn);
    }
  }

  html,
  body,
  #root {
    width: 100%;
    height: 100%;
    margin: 0;
  }

	  body {
	    overflow: hidden;
	    color-scheme: dark;

	    /* df-review-token layer. Keep these names internal to review-kit. */
	    ${reviewTypographyTokens}
	    --df-review-space-0: 0;
	    --df-review-space-1: 4px;
	    --df-review-space-1-5: 6px;
	    --df-review-space-2: 8px;
	    --df-review-space-2-5: 10px;
	    --df-review-space-3: 12px;
	    --df-review-space-3-5: 14px;
	    --df-review-space-4: 16px;
	    --df-review-space-5: 20px;
	    --df-review-space-6: 24px;
	    --df-review-space-8: 32px;
	    --df-review-control-height-sm: 32px;
	    --df-review-control-height-md: 34px;
	    --df-review-control-height-lg: 34px;
	    --df-review-radius-xs: 3px;
	    --df-review-radius-sm: 6px;
	    --df-review-radius-md: 8px;
	    --df-review-radius-lg: 12px;
	    --df-review-radius-pill: 999px;
	    --df-review-color-canvas: #0f1218;
	    --df-review-color-surface: #171c24;
	    --df-review-color-panel: #131821;
	    --df-review-color-panel-strong: #1b2430;
	    --df-review-color-card: rgba(237, 243, 251, 0.035);
	    --df-review-color-card-hover: rgba(237, 243, 251, 0.065);
	    --df-review-color-control: #202938;
	    --df-review-color-control-hover: #273345;
	    --df-review-color-border: rgba(226, 233, 245, 0.14);
	    --df-review-color-border-soft: rgba(226, 233, 245, 0.08);
	    --df-review-color-text: #edf3fb;
	    --df-review-color-text-muted: rgba(237, 243, 251, 0.58);
	    --df-review-color-text-subtle: rgba(237, 243, 251, 0.42);
	    --df-review-color-accent: #7cc7ff;
	    --df-review-color-accent-contrast: #0f1218;
	    --df-review-color-accent-soft: rgba(124, 199, 255, 0.12);
	    --df-review-color-accent-hover: rgba(124, 199, 255, 0.2);
	    --df-review-color-danger: #ff8f61;
	    --df-review-color-danger-soft: rgba(255, 143, 97, 0.12);
	    --df-review-color-purple: #b395ff;
	    --df-review-color-purple-soft: rgba(179, 149, 255, 0.16);
	    --df-review-color-note: #f3b75f;
	    --df-review-color-note-soft: rgba(243, 183, 95, 0.14);
	    --df-review-color-area: #63d7c7;
	    --df-review-color-area-soft: rgba(99, 215, 199, 0.14);
	    --df-review-color-side-rail: #111722;
	    --df-review-color-mode-bar: rgba(15, 18, 24, 0.86);
	    --df-review-color-chip: rgba(237, 243, 251, 0.06);
	    --df-review-color-scrollbar-track: rgba(237, 243, 251, 0.04);
	    --df-review-color-scrollbar-thumb: rgba(237, 243, 251, 0.18);
	    --df-review-color-scrollbar-thumb-hover: rgba(237, 243, 251, 0.28);
	    --df-review-color-scrollbar-border: rgba(15, 18, 24, 0.92);
	    --df-review-color-backdrop: rgba(2, 6, 12, 0.62);
	    --df-review-color-ruler-surface: transparent;
	    --df-review-color-ruler-label: rgba(15, 18, 24, 0.9);
	    --df-review-color-ruler-label-text: #f4efff;
	    --df-review-color-ruler-tick-major: rgba(201, 184, 255, 0.9);
	    --df-review-color-ruler-tick-minor: rgba(237, 243, 251, 0.2);
	    --df-review-color-ruler-guide: rgba(255, 255, 255, 0.86);
	    --df-review-color-ruler-measure-border: #c9b8ff;
	    --df-review-color-ruler-measure-bg: rgba(179, 149, 255, 0.18);
	    --df-review-color-ruler-measure-shadow: rgba(20, 12, 40, 0.52);
	    --df-review-color-ruler-popover-border: rgba(255, 255, 255, 0.34);
	    --df-review-color-ruler-popover-bg: rgba(15, 18, 24, 0.94);
	    --df-review-color-ruler-popover-text: #ffffff;
	    --df-review-color-ruler-popover-shadow: rgba(0, 0, 0, 0.42);
	    --df-review-color-ruler-coord-bg: #d7c9ff;
	    --df-review-color-ruler-coord-text: #14111f;
	    --df-review-focus-ring: rgba(124, 199, 255, 0.58);
	    --df-review-shadow-card: 0 14px 36px rgba(0, 0, 0, 0.34);
	    --df-review-shadow-control: inset 0 1px 0 rgba(255, 255, 255, 0.04);
	    --df-review-shadow-device: 0 24px 60px rgba(0, 0, 0, 0.38);
	    --df-review-shadow-panel: 0 18px 48px rgba(0, 0, 0, 0.38);
	    --df-review-shadow-modal: 0 24px 70px rgba(0, 0, 0, 0.48);
	    --df-review-select-chevron: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23d7e0ec' stroke-width='2.2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");

	    /* Semantic aliases consumed by the existing shell chrome. */
	    --df-review-bg: var(--df-review-color-canvas);
	    --df-review-surface: var(--df-review-color-surface);
	    --df-review-topbar: var(--df-review-color-surface);
	    --df-review-panel: var(--df-review-color-panel);
	    --df-review-panel-strong: var(--df-review-color-panel-strong);
	    --df-review-card: var(--df-review-color-card);
	    --df-review-card-hover: var(--df-review-color-card-hover);
	    --df-review-control: var(--df-review-color-control);
	    --df-review-control-hover: var(--df-review-color-control-hover);
	    --df-review-line: var(--df-review-color-border);
	    --df-review-line-soft: var(--df-review-color-border-soft);
	    --df-review-text: var(--df-review-color-text);
	    --df-review-muted: var(--df-review-color-text-muted);
	    --df-review-subtle: var(--df-review-color-text-subtle);
	    --df-review-accent: var(--df-review-color-accent);
	    --df-review-accent-contrast: var(--df-review-color-accent-contrast);
	    --df-review-accent-soft: var(--df-review-color-accent-soft);
	    --df-review-accent-hover: var(--df-review-color-accent-hover);
	    --df-review-danger: var(--df-review-color-danger);
	    --df-review-danger-soft: var(--df-review-color-danger-soft);
	    --df-review-purple: var(--df-review-color-purple);
	    --df-review-purple-soft: var(--df-review-color-purple-soft);
	    --df-review-note: var(--df-review-color-note);
	    --df-review-note-soft: var(--df-review-color-note-soft);
	    --df-review-area: var(--df-review-color-area);
	    --df-review-area-soft: var(--df-review-color-area-soft);
	    --df-review-side-rail: var(--df-review-color-side-rail);
	    --df-review-mode-bar: var(--df-review-color-mode-bar);
	    --df-review-chip-bg: var(--df-review-color-chip);
	    --df-review-scrollbar-track: var(--df-review-color-scrollbar-track);
	    --df-review-scrollbar-thumb: var(--df-review-color-scrollbar-thumb);
	    --df-review-scrollbar-thumb-hover: var(--df-review-color-scrollbar-thumb-hover);
	    --df-review-scrollbar-border: var(--df-review-color-scrollbar-border);
	    background: var(--df-review-bg);
	    color: var(--df-review-text);
	    font-family: var(--df-review-font-sans);
	  }

	  body.df-review-theme-light {
	    color-scheme: light;
	    --df-review-color-canvas: #f4f6f9;
	    --df-review-color-surface: #ffffff;
	    --df-review-color-panel: #ffffff;
	    --df-review-color-panel-strong: #edf1f6;
	    --df-review-color-card: rgba(23, 32, 44, 0.035);
	    --df-review-color-card-hover: rgba(23, 32, 44, 0.065);
	    --df-review-color-control: #eef2f7;
	    --df-review-color-control-hover: #e3e9f1;
	    --df-review-color-border: rgba(16, 24, 40, 0.14);
	    --df-review-color-border-soft: rgba(16, 24, 40, 0.08);
	    --df-review-color-text: #17202c;
	    --df-review-color-text-muted: rgba(23, 32, 44, 0.62);
	    --df-review-color-text-subtle: rgba(23, 32, 44, 0.44);
	    --df-review-color-accent: #1769aa;
	    --df-review-color-accent-contrast: #ffffff;
	    --df-review-color-accent-soft: rgba(23, 105, 170, 0.1);
	    --df-review-color-accent-hover: rgba(23, 105, 170, 0.16);
	    --df-review-color-danger: #b94418;
	    --df-review-color-danger-soft: rgba(185, 68, 24, 0.1);
	    --df-review-color-purple: #6543b8;
	    --df-review-color-purple-soft: rgba(101, 67, 184, 0.12);
	    --df-review-color-note: #a76617;
	    --df-review-color-note-soft: rgba(167, 102, 23, 0.12);
	    --df-review-color-area: #087f73;
	    --df-review-color-area-soft: rgba(8, 127, 115, 0.12);
	    --df-review-color-side-rail: #edf1f6;
	    --df-review-color-mode-bar: rgba(255, 255, 255, 0.9);
	    --df-review-color-chip: rgba(23, 32, 44, 0.06);
	    --df-review-color-scrollbar-track: rgba(23, 32, 44, 0.06);
	    --df-review-color-scrollbar-thumb: rgba(23, 32, 44, 0.24);
	    --df-review-color-scrollbar-thumb-hover: rgba(23, 32, 44, 0.34);
	    --df-review-color-scrollbar-border: rgba(244, 246, 249, 0.92);
	    --df-review-color-backdrop: rgba(15, 23, 42, 0.32);
	    --df-review-color-ruler-surface: transparent;
	    --df-review-color-ruler-label: rgba(255, 255, 255, 0.94);
	    --df-review-color-ruler-label-text: #3b247e;
	    --df-review-color-ruler-tick-major: rgba(0, 95, 204, 0.92);
	    --df-review-color-ruler-tick-minor: rgba(23, 32, 44, 0.3);
	    --df-review-color-ruler-guide: rgba(0, 102, 255, 0.96);
	    --df-review-color-ruler-measure-border: #0066ff;
	    --df-review-color-ruler-measure-bg: rgba(0, 102, 255, 0.16);
	    --df-review-color-ruler-measure-shadow: rgba(0, 43, 120, 0.56);
	    --df-review-color-ruler-popover-border: rgba(255, 255, 255, 0.34);
	    --df-review-color-ruler-popover-bg: rgba(15, 18, 24, 0.94);
	    --df-review-color-ruler-popover-text: #ffffff;
	    --df-review-color-ruler-popover-shadow: rgba(0, 0, 0, 0.42);
	    --df-review-color-ruler-coord-bg: #005be8;
	    --df-review-color-ruler-coord-text: #ffffff;
	    --df-review-focus-ring: rgba(23, 105, 170, 0.42);
	    --df-review-shadow-card: 0 14px 36px rgba(15, 23, 42, 0.14);
	    --df-review-shadow-control: inset 0 1px 0 rgba(255, 255, 255, 0.72);
	    --df-review-shadow-device: 0 24px 60px rgba(15, 23, 42, 0.18);
	    --df-review-shadow-panel: 0 18px 48px rgba(15, 23, 42, 0.18);
	    --df-review-shadow-modal: 0 24px 70px rgba(15, 23, 42, 0.2);
	    --df-review-select-chevron: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2317202c' stroke-width='2.2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
	  }

	  button,
	  input,
	  select,
	  textarea {
	    font: inherit;
	  }

  button {
    cursor: pointer;
  }

  .df-review-shell {
    --df-review-frame-gutter-x: var(--df-review-space-4);
    position: relative;
    display: grid;
    grid-template-columns: minmax(0, 1fr) 0 48px;
    grid-template-rows: auto auto minmax(0, 1fr);
    width: 100%;
    height: 100%;
    overflow: hidden;
    transition: grid-template-columns 160ms ease;
  }

  .df-review-shell.is-list-visible {
    grid-template-columns: minmax(0, 1fr) clamp(320px, 28vw, 420px) 48px;
  }

	  .df-review-topbar {
	    grid-column: 1;
	    grid-row: 1;
	    position: relative;
	    z-index: 600;
	    display: grid;
	    gap: var(--df-review-space-2);
	    container-type: inline-size;
	    min-width: 0;
	    padding: var(--df-review-space-3) var(--df-review-frame-gutter-x);
	    border-bottom: 1px solid var(--df-review-line-soft);
	    background:
	      linear-gradient(180deg, var(--df-review-topbar), var(--df-review-panel));
	    box-shadow: inset 0 -1px 0 rgba(255, 255, 255, 0.025);
	  }

		  .df-review-address {
		    display: grid;
		    grid-template-columns: auto minmax(160px, 1fr) auto;
		    align-items: stretch;
		    gap: var(--df-review-space-2);
		    width: 100%;
		    max-width: 1440px;
		    margin: 0 auto;
		  }

  .df-review-address-actions {
    display: flex;
    align-items: stretch;
    gap: 4px;
    min-width: 0;
  }

  .df-review-address input {
	    width: 100%;
	    height: var(--df-review-control-height-md);
	    min-height: var(--df-review-control-height-md);
	    border: 1px solid var(--df-review-line);
	    border-radius: var(--df-review-radius-sm);
	    padding: 0 11px;
	    color: var(--df-review-text);
	    background: var(--df-review-bg);
	    box-shadow: var(--df-review-shadow-control);
	    font-size: var(--df-review-font-size-md);
	    transition: border-color 140ms ease, box-shadow 140ms ease, background 140ms ease;
	  }

	  .df-review-address input:focus {
	    outline: 2px solid var(--df-review-focus-ring);
	    outline-offset: 1px;
	  }

		  .df-review-address button,
		  .df-review-address a,
		  .df-review-presets button,
		  .df-review-overlay-button,
			  .df-review-mode-button,
			  .df-review-settings-header button,
			  .df-review-prompt-header button,
			  .df-review-settings-actions button,
			  .df-review-prompt-block-header button,
			  .df-review-item-actions button {
		    height: var(--df-review-control-height-md);
		    min-height: var(--df-review-control-height-md);
		    border: 1px solid var(--df-review-line);
		    border-radius: var(--df-review-radius-sm);
		    background: var(--df-review-control);
	    box-shadow: var(--df-review-shadow-control);
	    color: var(--df-review-text);
	    font-size: var(--df-review-font-size-sm);
	    font-weight: var(--df-review-font-weight-normal);
	    transition: border-color 140ms ease, background 140ms ease, color 140ms ease, box-shadow 140ms ease, opacity 140ms ease;
	  }

		  .df-review-address button:hover,
		  .df-review-address a:hover,
		  .df-review-presets button:hover,
		  .df-review-overlay-button:hover,
		  .df-review-mode-button:hover,
		  .df-review-settings-header button:hover,
		  .df-review-prompt-header button:hover,
		  .df-review-settings-actions button:hover,
		  .df-review-prompt-block-header button:hover,
			  .df-review-item-actions button:hover,
		  .df-review-item-visibility:hover,
		  .df-review-item-link-copy:hover,
		  .df-review-item-prompt-copy:hover,
		  .df-review-item-delete:hover,
		  .df-review-presets button.is-active,
			  .df-review-overlay-button.is-active,
			  .df-review-mode-button.is-active {
		    border-color: var(--df-review-accent);
		    background: var(--df-review-control-hover);
		  }

	  .df-review-overlay-button.is-active,
  .df-review-mode-button.is-active {
    border-color: var(--df-review-accent);
    background: var(--df-review-accent-soft);
    box-shadow: inset 0 0 0 1px var(--df-review-accent-hover);
    color: var(--df-review-accent);
  }

  .df-review-sitemap-button {
    position: relative;
    display: inline-grid;
    place-items: center;
	    width: 38px;
	    min-width: 38px;
	    padding: 0;
	    color: var(--df-review-accent);
	  }

  .df-review-address-icon-button {
    display: inline-grid;
    place-items: center;
    width: var(--df-review-control-height-md);
    min-width: var(--df-review-control-height-md);
    padding: 0;
    text-decoration: none;
  }

  .df-review-address-icon-button svg {
    width: 16px;
    height: 16px;
    fill: none;
    stroke: currentColor;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-width: 1.9;
  }

  .df-review-sitemap-button svg,
  .df-review-sitemap-header button svg {
    width: 18px;
    height: 18px;
    fill: none;
    stroke: currentColor;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-width: 1.8;
  }

`;

// src/react-shell/style/sitemap.ts
var reviewShellSitemapStyle = `
  .df-review-sitemap-modal {
    position: fixed;
    inset: 0;
    z-index: 1000;
    display: grid;
    place-items: center;
				    padding: 18px;
  }

	  .df-review-sitemap-backdrop {
	    position: absolute;
	    inset: 0;
	    min-height: 0;
	    border: 0;
	    border-radius: 0;
	    padding: 0;
	    background: var(--df-review-color-backdrop);
	  }

  .df-review-sitemap-dialog {
    position: relative;
    z-index: 1;
    display: grid;
    grid-template-rows: auto auto minmax(0, 1fr);
	    width: min(940px, calc(100vw - 48px));
	    max-height: min(720px, calc(100vh - 48px));
	    overflow: hidden;
	    border: 1px solid var(--df-review-line);
	    border-radius: var(--df-review-radius-lg);
	    background: var(--df-review-panel);
	    box-shadow: var(--df-review-shadow-modal);
	  }

  .df-review-sitemap-header {
    display: flex;
    align-items: center;
	    justify-content: space-between;
	    gap: 12px;
	    min-height: 54px;
	    padding: 0 14px 0 16px;
	    border-bottom: 1px solid var(--df-review-line);
	  }

  .df-review-sitemap-header div {
    display: flex;
    align-items: baseline;
    gap: 10px;
    min-width: 0;
  }

  .df-review-sitemap-header strong {
    font-size: var(--df-review-font-size-lg);
    font-weight: var(--df-review-font-weight-emphasis);
  }

	  .df-review-sitemap-header span {
	    color: var(--df-review-muted);
	    font-size: var(--df-review-font-size-sm);
	    font-weight: var(--df-review-font-weight-normal);
	  }

  .df-review-sitemap-header button {
    display: grid;
    place-items: center;
	    width: 34px;
	    min-width: 34px;
	    min-height: var(--df-review-control-height-md);
	    border: 1px solid var(--df-review-line);
	    border-radius: var(--df-review-radius-sm);
	    background: var(--df-review-control);
	    color: var(--df-review-text);
	    font-size: var(--df-review-font-size-md);
	    font-weight: var(--df-review-font-weight-normal);
	  }

	  .df-review-sitemap-header button:hover {
	    border-color: var(--df-review-accent);
	    background: var(--df-review-control-hover);
	  }

  .df-review-sitemap-controls {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
    padding: 10px 12px;
    border-bottom: 1px solid var(--df-review-line-soft);
    background: var(--df-review-panel);
  }

  .df-review-sitemap-search {
    display: flex;
    align-items: center;
    gap: 8px;
    flex: 1 1 auto;
    min-width: 0;
    min-height: 34px;
    border: 1px solid var(--df-review-line-soft);
    border-radius: var(--df-review-radius-sm);
    padding: 0 10px;
    background: var(--df-review-control);
    box-shadow: var(--df-review-shadow-control);
    color: var(--df-review-muted);
  }

  .df-review-sitemap-search:focus-within {
    border-color: var(--df-review-accent);
    color: var(--df-review-text);
  }

  .df-review-sitemap-search svg {
    width: 15px;
    min-width: 15px;
    height: 15px;
  }

  .df-review-sitemap-search input {
    flex: 1 1 auto;
    min-width: 0;
    min-height: 30px;
    border: 0;
    padding: 0;
    outline: none;
    color: var(--df-review-text);
    background: transparent;
    appearance: none;
    font: inherit;
    font-size: var(--df-review-font-size-sm);
  }

  .df-review-sitemap-search input::-webkit-search-cancel-button {
    appearance: none;
  }

  .df-review-sitemap-search input::placeholder {
    color: var(--df-review-muted);
  }

  .df-review-sitemap-search-clear {
    display: grid;
    place-items: center;
    width: 34px;
    min-width: 34px;
    min-height: 34px;
    border: 1px solid var(--df-review-line-soft);
    border-radius: var(--df-review-radius-sm);
    padding: 0;
    background: var(--df-review-control);
    color: var(--df-review-muted);
  }

  .df-review-sitemap-search-clear:hover {
    border-color: var(--df-review-accent);
    color: var(--df-review-text);
    background: var(--df-review-control-hover);
  }

  .df-review-sitemap-search-clear svg {
    width: 15px;
    height: 15px;
  }

  .df-review-sitemap-search-count {
    flex: 0 0 auto;
    color: var(--df-review-muted);
    font-size: var(--df-review-font-size-xs);
    font-weight: var(--df-review-font-weight-normal);
    white-space: nowrap;
  }

  .df-review-sitemap-controls select {
    min-width: 138px;
    min-height: 32px;
    border: 1px solid var(--df-review-line-soft);
    border-radius: var(--df-review-radius-sm);
    padding: 0 26px 0 10px;
    color: var(--df-review-text);
    background: var(--df-review-control);
    box-shadow: var(--df-review-shadow-control);
    font-size: var(--df-review-font-size-xs);
    font-weight: var(--df-review-font-weight-emphasis);
  }

  .df-review-sitemap-list {
    --df-review-sitemap-grid-template: minmax(190px, 1fr) 74px 78px 64px minmax(108px, 160px);
    position: relative;
    display: grid;
    align-content: start;
    min-height: 0;
    overflow-x: hidden;
    overflow-y: auto;
    overscroll-behavior: contain;
    padding: 8px;
  }

  .df-review-sitemap-table-head,
  .df-review-sitemap-row {
    display: grid;
    grid-template-columns: var(--df-review-sitemap-grid-template);
    align-items: center;
    column-gap: 0;
  }

  .df-review-sitemap-table-head {
    position: sticky;
    top: 0;
    z-index: 3;
    min-height: 32px;
    border-bottom: 1px solid var(--df-review-line);
    padding: 0 10px;
    background: var(--df-review-panel);
    box-shadow:
      0 -8px 0 0 var(--df-review-panel),
      0 1px 0 var(--df-review-line);
    color: var(--df-review-muted);
    font-size: var(--df-review-font-size-xs);
    font-weight: var(--df-review-font-weight-normal);
    letter-spacing: 0.03em;
    text-transform: uppercase;
  }

  .df-review-sitemap-sort {
    display: inline-flex;
    align-items: center;
    justify-content: flex-end;
    gap: 4px;
    min-width: 0;
    min-height: 28px;
    border: 0;
    border-radius: 0;
    padding: 0 0 0 8px;
    color: inherit;
    background: transparent;
    box-shadow: none;
    font: inherit;
    letter-spacing: inherit;
    text-align: right;
    text-transform: inherit;
    cursor: pointer;
  }

  .df-review-sitemap-sort.is-page {
    justify-content: flex-start;
    padding-left: 0;
    text-align: left;
  }

  .df-review-sitemap-sort-indicator {
    width: 8px;
    min-width: 8px;
    color: var(--df-review-accent);
    text-align: center;
  }

  .df-review-sitemap-sort-label {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .df-review-sitemap-sort:hover,
  .df-review-sitemap-sort.is-active {
    color: var(--df-review-text);
  }

  .df-review-sitemap-row {
    min-height: 42px;
    border: 0;
    border-bottom: 1px solid var(--df-review-line-soft);
    border-radius: 0;
    padding: 0 10px;
    background: transparent;
    color: var(--df-review-text);
    text-align: left;
  }

  button.df-review-sitemap-row {
    cursor: pointer;
  }

  .df-review-sitemap-row.is-summary {
    position: sticky;
    bottom: 0;
    z-index: 3;
    border-top: 1px solid var(--df-review-line);
    border-bottom: 0;
    background: var(--df-review-panel);
    box-shadow:
      0 8px 0 0 var(--df-review-panel),
      0 -1px 0 var(--df-review-line);
  }

  .df-review-sitemap-row.is-folder {
    cursor: default;
  }

  .df-review-sitemap-empty {
    display: flex;
    grid-column: 1 / -1;
    align-items: center;
    min-height: 74px;
    padding: 0 10px;
    border-bottom: 1px solid var(--df-review-line-soft);
    color: var(--df-review-muted);
    font-size: var(--df-review-font-size-sm);
  }

  .df-review-sitemap-row:last-child {
    border-bottom: 0;
  }

  button.df-review-sitemap-row:hover,
  .df-review-sitemap-row.is-active {
    background: var(--df-review-accent-soft);
  }

  .df-review-sitemap-path {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    min-width: 0;
    overflow-wrap: anywhere;
    color: var(--df-review-text);
    font-size: var(--df-review-font-size-md);
    font-weight: var(--df-review-font-weight-normal);
    line-height: 1.35;
  }

  .df-review-sitemap-row.is-folder .df-review-sitemap-path {
    color: var(--df-review-muted);
  }

  .df-review-sitemap-tree-prefix {
    flex: 0 0 auto;
    color: var(--df-review-muted);
    font-family: var(--df-review-font-mono);
    font-weight: var(--df-review-font-weight-normal);
    white-space: pre;
  }

  .df-review-sitemap-label {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .df-review-sitemap-cell {
    min-width: 0;
    color: var(--df-review-muted);
    font-size: var(--df-review-font-size-sm);
    font-variant-numeric: tabular-nums;
    font-weight: var(--df-review-font-weight-normal);
    line-height: 1;
    text-align: right;
  }

  .df-review-sitemap-cell.is-total {
    color: var(--df-review-accent);
    font-weight: var(--df-review-font-weight-normal);
  }

  .df-review-sitemap-cell.is-total strong {
    font: inherit;
  }

  .df-review-sitemap-cell.is-online {
    display: flex;
    justify-content: flex-end;
    color: var(--df-review-text);
  }

  .df-review-sitemap-users {
    display: inline-flex;
    align-items: center;
    justify-content: flex-end;
    gap: 4px;
    min-width: 0;
    flex-wrap: wrap;
  }

  .df-review-sitemap-user {
    --df-review-presence-color: var(--df-review-accent);
    display: inline-flex;
    align-items: center;
    min-height: 22px;
    border: 1px solid var(--df-review-presence-color);
    border-radius: var(--df-review-radius-pill);
    padding: 0 7px;
    background: var(--df-review-chip-bg);
    color: var(--df-review-text);
    font-size: var(--df-review-font-size-xs);
    font-weight: var(--df-review-font-weight-emphasis);
    line-height: 1.1;
    white-space: nowrap;
  }

  .df-review-sitemap-online-empty {
    color: var(--df-review-muted);
  }

  button.df-review-sitemap-row:hover .df-review-sitemap-path,
  .df-review-sitemap-row.is-active .df-review-sitemap-path {
    color: var(--df-review-text);
  }

`;

// src/react-shell/style/modals.ts
var reviewShellModalStyle = `
		  .df-review-settings-modal {
		    position: fixed;
		    inset: 0;
		    z-index: 1001;
		    display: grid;
		    place-items: center;
		    padding: 24px;
		  }

		  .df-review-settings-backdrop {
		    position: absolute;
		    inset: 0;
		    min-height: 0;
		    border: 0;
		    border-radius: 0;
		    padding: 0;
		    background: var(--df-review-color-backdrop);
		  }

		  .df-review-settings-dialog {
		    position: relative;
		    z-index: 1;
		    display: grid;
		    width: min(460px, calc(100vw - 48px));
		    overflow: hidden;
		    border: 1px solid var(--df-review-line);
		    border-radius: var(--df-review-radius-lg);
		    background: var(--df-review-panel);
		    box-shadow: var(--df-review-shadow-modal);
		  }

		  .df-review-settings-header {
		    display: flex;
		    align-items: center;
		    justify-content: space-between;
		    gap: 12px;
		    min-height: 54px;
		    padding: 0 14px 0 16px;
		    border-bottom: 1px solid var(--df-review-line);
		  }

		  .df-review-settings-title {
		    display: grid;
		    gap: 2px;
		    min-width: 0;
		  }

		  .df-review-settings-header-actions {
		    display: inline-flex;
		    align-items: center;
		    justify-content: flex-end;
		    gap: 8px;
		    min-width: 0;
		  }

		  .df-review-settings-header strong {
		    color: var(--df-review-text);
		    font-size: var(--df-review-font-size-lg);
        font-weight: var(--df-review-font-weight-emphasis);
		  }

		  .df-review-settings-header span {
		    color: var(--df-review-muted);
		    font-size: var(--df-review-font-size-xs);
		    font-weight: var(--df-review-font-weight-normal);
		  }

		  .df-review-settings-header button {
		    display: grid;
		    place-items: center;
		    width: 34px;
		    min-width: 34px;
		    padding: 0;
		    font-size: var(--df-review-font-size-md);
		    font-weight: var(--df-review-font-weight-normal);
		  }

		  .df-review-settings-body {
		    display: grid;
		    gap: 12px;
		    padding: 16px;
		  }

		  .df-review-settings-field {
		    display: grid;
		    gap: 7px;
		  }

		  .df-review-settings-row {
		    display: grid;
		    grid-template-columns: minmax(0, 1fr) auto;
		    align-items: center;
		    gap: 12px;
		  }

		  .df-review-settings-field span,
		  .df-review-settings-row > span,
		  .df-review-settings-label-row label {
		    color: var(--df-review-muted);
		    font-size: var(--df-review-font-size-sm);
		    font-weight: var(--df-review-font-weight-normal);
		  }

		  .df-review-settings-theme-options {
		    display: inline-flex;
		    justify-content: flex-end;
		    gap: 6px;
		    min-width: 0;
		    flex-wrap: wrap;
		  }

		  .df-review-settings-theme-option {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 7px;
		    min-height: 30px;
		    border: 1px solid var(--df-review-line);
		    border-radius: var(--df-review-radius-sm);
		    padding: 0 11px;
		    color: var(--df-review-muted);
		    background: var(--df-review-control);
		    box-shadow: var(--df-review-shadow-control);
		    font-size: var(--df-review-font-size-sm);
		    font-weight: var(--df-review-font-weight-normal);
		  }

      .df-review-settings-theme-option svg {
        width: 15px;
        height: 15px;
        flex: 0 0 auto;
        stroke-width: 2.2;
      }

      .df-review-settings-theme-option span {
        color: inherit;
      }

		  .df-review-settings-theme-option:hover {
		    border-color: var(--df-review-accent);
		    background: var(--df-review-control-hover);
		    color: var(--df-review-text);
		  }

		  .df-review-settings-theme-option.is-active {
		    border-color: var(--df-review-accent);
		    background: var(--df-review-accent-soft);
		    color: var(--df-review-accent);
		  }

		  .df-review-settings-theme-option:focus-visible {
		    outline: 2px solid var(--df-review-focus-ring);
		    outline-offset: 1px;
		  }

		  .df-review-settings-label-row {
		    display: flex;
		    align-items: center;
		    gap: 6px;
		  }

		  .df-review-settings-help-button {
		    display: inline-grid;
		    place-items: center;
		    width: 20px;
		    min-width: 20px;
		    min-height: 20px;
		    border: 1px solid var(--df-review-line-soft);
		    border-radius: 50%;
		    padding: 0;
		    background: transparent;
		    color: var(--df-review-muted);
		  }

		  .df-review-settings-help-button:hover,
		  .df-review-settings-help-button.is-active {
		    border-color: var(--df-review-accent);
		    background: var(--df-review-accent-soft);
		    color: var(--df-review-accent);
		  }

		  .df-review-settings-help-button svg {
		    width: 13px;
		    height: 13px;
		    fill: none;
		    stroke: currentColor;
		    stroke-linecap: round;
		    stroke-linejoin: round;
		    stroke-width: 2.1;
		  }

			  .df-review-settings-token-input,
			  .df-review-settings-text-input,
			  .df-review-settings-select-input {
			    display: grid;
			    align-items: stretch;
			    overflow: hidden;
			    border: 1px solid var(--df-review-line);
		    border-radius: var(--df-review-radius-sm);
			    background: var(--df-review-bg);
			  }

			  .df-review-settings-token-input {
			    grid-template-columns: minmax(0, 1fr) 38px;
			  }

			  .df-review-settings-text-input,
			  .df-review-settings-select-input {
			    grid-template-columns: minmax(0, 1fr);
			  }

			  .df-review-settings-token-input:focus-within,
			  .df-review-settings-text-input:focus-within,
			  .df-review-settings-select-input:focus-within {
			    outline: 2px solid var(--df-review-focus-ring);
			    outline-offset: 1px;
			  }

			  .df-review-settings-token-input input,
			  .df-review-settings-text-input input,
			  .df-review-settings-select-input select {
			    min-width: 0;
			    min-height: var(--df-review-control-height-lg);
			    border: 0;
		    padding: 0 10px;
		    background: transparent;
		    color: var(--df-review-text);
			    font-size: var(--df-review-font-size-md);
			  }

			  .df-review-settings-token-input input:focus,
			  .df-review-settings-text-input input:focus,
			  .df-review-settings-select-input select:focus {
			    outline: 0;
			  }

			  .df-review-settings-token-input input.is-token-masked {
			    -webkit-text-security: disc;
			  }

			  .df-review-settings-select-input select {
			    appearance: none;
			    cursor: pointer;
			  }

		  .df-review-settings-token-toggle {
		    display: grid;
		    place-items: center;
		    width: 38px;
		    min-width: 38px;
		    min-height: var(--df-review-control-height-lg);
		    border: 0;
		    border-left: 1px solid var(--df-review-line-soft);
		    border-radius: 0;
		    padding: 0;
		    background: transparent;
		    color: var(--df-review-muted);
		  }

		  .df-review-settings-token-toggle:hover {
		    background: var(--df-review-chip-bg);
		    color: var(--df-review-text);
		  }

		  .df-review-settings-token-toggle svg {
		    width: 16px;
		    height: 16px;
		    fill: none;
		    stroke: currentColor;
		    stroke-linecap: round;
		    stroke-linejoin: round;
		    stroke-width: 2;
		  }

		  .df-review-settings-guide {
		    margin-top: -2px;
		    border: 1px solid var(--df-review-line-soft);
		    border-radius: var(--df-review-radius-sm);
		    padding: 9px 11px;
		    background: var(--df-review-chip-bg);
		    color: var(--df-review-muted);
		    font-size: var(--df-review-font-size-xs);
		    font-weight: var(--df-review-font-weight-normal);
		    line-height: 1.55;
		  }

		  .df-review-settings-guide ol {
		    display: grid;
		    gap: 3px;
		    margin: 0;
		    padding-left: 17px;
		  }

		  .df-review-settings-status {
		    min-height: 20px;
		    margin: 0;
		    color: var(--df-review-accent);
		    font-size: var(--df-review-font-size-sm);
		    font-weight: var(--df-review-font-weight-normal);
		  }

		  .df-review-settings-actions {
		    display: grid;
		    grid-template-columns: auto minmax(0, 1fr) auto auto;
		    gap: 8px;
		    align-items: center;
		  }

		  .df-review-settings-actions button {
		    padding: 0 12px;
		  }

			  .df-review-settings-actions button[type='submit'] {
			    border-color: var(--df-review-accent);
			    background: var(--df-review-accent-soft);
			    color: var(--df-review-accent);
			  }

  .df-review-edit-modal {
    position: fixed;
    inset: 0;
    z-index: 1003;
    display: grid;
    place-items: center;
    padding: 24px;
  }

  .df-review-edit-dialog {
    position: relative;
    z-index: 1;
    display: grid;
    width: min(460px, calc(100vw - 48px));
    overflow: hidden;
    border: 1px solid var(--df-review-line);
    border-radius: var(--df-review-radius-lg);
    background: var(--df-review-panel);
    box-shadow: var(--df-review-shadow-modal);
  }

  .df-review-edit-textarea {
    min-height: 160px;
  }

  .df-review-edit-textarea textarea {
    width: 100%;
    min-height: 160px;
    border: 0;
    padding: 10px;
    outline: 0;
    background: transparent;
    color: var(--df-review-text);
    resize: vertical;
    font-size: var(--df-review-font-size-md);
    line-height: 1.5;
  }

  .df-review-edit-textarea textarea:focus {
    outline: 0;
  }

  .df-review-edit-error {
    margin: 0;
    color: var(--df-review-danger);
    font-size: var(--df-review-font-size-sm);
    font-weight: var(--df-review-font-weight-normal);
  }

  .df-review-edit-actions {
    grid-template-columns: minmax(0, 1fr) auto auto;
  }

			  .df-review-prompt-modal {
			    position: fixed;
			    inset: 0;
			    z-index: 1002;
			    display: grid;
			    place-items: center;
			    padding: 24px;
			  }

			  .df-review-prompt-backdrop {
			    position: absolute;
			    inset: 0;
			    min-height: 0;
			    border: 0;
			    border-radius: 0;
			    padding: 0;
			    background: var(--df-review-color-backdrop);
			  }

			  .df-review-prompt-dialog {
			    position: relative;
			    z-index: 1;
			    display: grid;
			    grid-template-rows: auto minmax(0, 1fr);
				    width: min(1040px, calc(100vw - 36px));
				    max-height: min(900px, calc(100vh - 36px));
			    overflow: hidden;
			    border: 1px solid var(--df-review-line);
			    border-radius: var(--df-review-radius-lg);
			    background: var(--df-review-panel);
			    box-shadow: var(--df-review-shadow-modal);
			  }

			  .df-review-prompt-dialog-narrow {
			    width: min(440px, calc(100vw - 36px));
			  }

			  .df-review-prompt-dialog-narrow .df-review-prompt-block textarea {
			    height: min(58vh, 540px);
			    max-height: none;
			  }

  .df-review-copy-toast {
    position: fixed;
    right: 52px;
    bottom: 24px;
    z-index: 1003;
    max-width: min(320px, calc(100vw - 32px));
    padding: 10px 13px;
    border: 1px solid var(--df-review-accent-hover);
    border-radius: var(--df-review-radius-md);
    background: var(--df-review-panel);
    box-shadow: var(--df-review-shadow-modal);
    color: var(--df-review-text);
    font-size: var(--df-review-font-size-sm);
    font-weight: var(--df-review-font-weight-normal);
    line-height: 1.25;
    pointer-events: none;
  }

			  .df-review-prompt-header {
			    display: flex;
			    align-items: center;
			    justify-content: space-between;
			    gap: 12px;
			    min-height: 54px;
			    padding: 0 14px 0 16px;
			    border-bottom: 1px solid var(--df-review-line);
			  }

			  .df-review-prompt-header div {
			    display: grid;
			    gap: 2px;
			    min-width: 0;
			  }

			  .df-review-prompt-header strong {
			    color: var(--df-review-text);
			    font-size: var(--df-review-font-size-lg);
          font-weight: var(--df-review-font-weight-emphasis);
			  }

			  .df-review-prompt-header span {
			    overflow: hidden;
			    color: var(--df-review-muted);
			    font-size: var(--df-review-font-size-xs);
			    font-weight: var(--df-review-font-weight-normal);
			    text-overflow: ellipsis;
			    white-space: nowrap;
			  }

			  .df-review-prompt-header button {
			    display: grid;
			    place-items: center;
			    width: 34px;
			    min-width: 34px;
			    padding: 0;
			    font-size: var(--df-review-font-size-md);
			    font-weight: var(--df-review-font-weight-normal);
			  }

			  .df-review-prompt-header button svg {
			    width: 15px;
			    height: 15px;
			    fill: none;
			    stroke: currentColor;
			    stroke-linecap: round;
			    stroke-linejoin: round;
			    stroke-width: 2;
			  }

			  .df-review-prompt-body {
			    display: grid;
			    gap: 14px;
			    min-height: 0;
			    overflow: auto;
			    padding: 16px;
			  }

			  .df-review-prompt-block {
			    display: grid;
			    gap: 8px;
			    min-width: 0;
			  }

			  .df-review-prompt-block-header {
			    display: flex;
			    align-items: center;
			    justify-content: space-between;
			    gap: 12px;
			    min-width: 0;
			  }

			  .df-review-prompt-block-header div {
			    display: grid;
			    gap: 2px;
			    min-width: 0;
			  }

			  .df-review-prompt-block-header strong {
			    color: var(--df-review-text);
			    font-size: var(--df-review-font-size-sm);
			    font-weight: var(--df-review-font-weight-emphasis);
			  }

			  .df-review-prompt-block-header span {
			    color: var(--df-review-muted);
			    font-size: var(--df-review-font-size-xs);
			    font-weight: var(--df-review-font-weight-normal);
			  }

			  .df-review-prompt-block-header button {
			    display: inline-flex;
			    align-items: center;
			    gap: 6px;
			    min-height: 30px;
			    padding: 0 10px;
			  }

			  .df-review-prompt-block-header button:disabled {
			    cursor: not-allowed;
			    opacity: 0.5;
			  }

			  .df-review-prompt-block-header svg {
			    width: 13px;
			    height: 13px;
			    fill: none;
			    stroke: currentColor;
			    stroke-linecap: round;
			    stroke-linejoin: round;
			    stroke-width: 2;
			  }

				  .df-review-prompt-block textarea {
				    width: 100%;
				    height: clamp(170px, calc(100vh - 520px), 260px);
				    min-height: 170px;
				    max-height: 320px;
			    resize: vertical;
			    border: 1px solid var(--df-review-line);
			    border-radius: var(--df-review-radius-sm);
			    padding: 10px;
			    background: var(--df-review-bg);
			    color: var(--df-review-text);
			    font-family: var(--df-review-font-mono);
			    font-size: var(--df-review-font-size-xs);
			    font-weight: var(--df-review-font-weight-normal);
			    line-height: 1.5;
			    white-space: pre-wrap;
			    overflow-wrap: anywhere;
			  }

			  .df-review-prompt-block textarea:focus {
			    outline: 2px solid var(--df-review-focus-ring);
			    outline-offset: 1px;
			  }

			  .df-review-prompt-section-header {
			    display: grid;
			    gap: 2px;
			    min-width: 0;
			  }

			  .df-review-prompt-section-header strong {
			    color: var(--df-review-text);
			    font-size: var(--df-review-font-size-md);
			    font-weight: var(--df-review-font-weight-emphasis);
			  }

			  .df-review-prompt-section-header span {
			    color: var(--df-review-muted);
			    font-size: var(--df-review-font-size-xs);
			    font-weight: var(--df-review-font-weight-normal);
			  }

			  .df-review-about-dialog {
			    grid-template-rows: minmax(0, 1fr);
			    width: min(600px, calc(100vw - 36px));
			  }

			  .df-review-about-close {
			    position: absolute;
			    top: 14px;
			    right: 14px;
			    z-index: 2;
			    display: grid;
			    place-items: center;
			    width: 32px;
			    height: 32px;
			    border: 1px solid var(--df-review-line);
			    border-radius: var(--df-review-radius-sm);
			    background: var(--df-review-control);
			    color: var(--df-review-text);
			  }

			  .df-review-about-close svg {
			    width: 15px;
			    height: 15px;
			    fill: none;
			    stroke: currentColor;
			    stroke-linecap: round;
			    stroke-linejoin: round;
			    stroke-width: 2;
			  }

			  .df-review-about-body {
			    display: grid;
			    align-content: start;
			    gap: 22px;
			    min-height: 0;
			    overflow: auto;
			    padding: 34px 32px;
			  }

			  .df-review-about-intro {
			    display: grid;
			    justify-items: start;
			    gap: 8px;
			  }

			  .df-review-about-logo {
			    display: grid;
			    place-items: center;
			    color: var(--df-review-text);
			  }

			  .df-review-about-logo svg {
			    width: auto;
			    height: 26px;
			    fill: currentColor;
			  }

			  .df-review-about-intro strong {
			    color: var(--df-review-text);
			    font-size: var(--df-review-font-size-lg);
			    font-weight: var(--df-review-font-weight-emphasis);
			  }

			  .df-review-about-intro span {
			    color: var(--df-review-muted);
			    font-size: var(--df-review-font-size-sm);
			    font-weight: var(--df-review-font-weight-normal);
			  }

			  .df-review-about-item {
			    display: grid;
			    gap: 5px;
			  }

			  .df-review-about-item strong {
			    color: var(--df-review-text);
			    font-size: var(--df-review-font-size-sm);
			    font-weight: var(--df-review-font-weight-emphasis);
			  }

			  .df-review-about-item p {
			    margin: 0;
			    color: var(--df-review-muted);
			    font-size: var(--df-review-font-size-sm);
			    font-weight: var(--df-review-font-weight-normal);
			    line-height: 1.6;
			  }


`;

// src/react-shell/style/toolbar.ts
var reviewShellToolbarStyle = `
				  .df-review-tools {
			    display: flex;
			    align-items: center;
		    justify-content: space-between;
		    gap: 12px;
		    width: 100%;
		    max-width: 1440px;
		    min-width: 0;
		    margin: 0 auto;
		  }

		  .df-review-tool-controls {
		    display: flex;
		    align-items: center;
		    justify-content: flex-start;
		    gap: 12px;
		    min-width: 0;
		    flex-wrap: wrap;
	  }

		  .df-review-presets,
		  .df-review-mode {
	    display: flex;
	    align-items: center;
	    gap: var(--df-review-space-1-5);
	    height: var(--df-review-control-height-md);
	    min-height: var(--df-review-control-height-md);
	    padding: 0;
	    border: 1px solid var(--df-review-line-soft);
	    border-radius: var(--df-review-radius-md);
	    background: var(--df-review-card);
	  }

  .df-review-overlays {
    display: flex;
    align-items: center;
    gap: 4px;
    height: var(--df-review-control-height-md);
    min-height: var(--df-review-control-height-md);
    padding: 0;
    border: 0;
    border-radius: 0;
    background: transparent;
    box-shadow: none;
  }

  .df-review-mode {
    gap: 3px;
    padding: 3px;
  }

		  .df-review-tool-divider,
		  .df-review-mode-divider {
		    display: inline-flex;
		    align-items: center;
		    color: var(--df-review-line);
		    font-size: var(--df-review-font-size-2xl);
		    font-weight: var(--df-review-font-weight-normal);
	    line-height: 1;
		    user-select: none;
	  }

  .df-review-active-size {
		    flex: 0 0 auto;
		    display: inline-flex;
		    align-items: center;
		    min-height: var(--df-review-control-height-md);
		    color: var(--df-review-muted);
		    font-size: var(--df-review-font-size-sm);
		    font-variant-numeric: tabular-nums;
	    font-weight: var(--df-review-font-weight-normal);
	    line-height: 1;
	  }

  .df-review-preset-select {
    -webkit-appearance: none;
    appearance: none;
    display: none;
    height: var(--df-review-control-height-md);
    min-height: var(--df-review-control-height-md);
    min-width: 154px;
    border: 1px solid var(--df-review-line-soft);
    border-radius: var(--df-review-radius-md);
    padding: 0 42px 0 14px;
    color: var(--df-review-text);
    background-color: var(--df-review-control);
    background-image: url("data:image/svg+xml,%3Csvg width='18' height='18' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='m6 9 6 6 6-6' stroke='%23d7deea' stroke-width='2.2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
    background-position: right 14px center;
    background-repeat: no-repeat;
    background-size: 18px 18px;
    box-shadow: var(--df-review-shadow-control);
    font-size: var(--df-review-font-size-sm);
    font-weight: var(--df-review-font-weight-normal);
  }

	  .df-review-presets button {
	    display: inline-flex;
	    align-items: center;
    gap: 7px;
    height: var(--df-review-control-height-md);
    min-height: var(--df-review-control-height-md);
    padding: 0 11px 0 9px;
    border-color: transparent;
    background: transparent;
    box-shadow: none;
  }

  .df-review-presets button svg {
    width: 16px;
    height: 16px;
    flex: 0 0 auto;
    fill: none;
    stroke: currentColor;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-width: 1.9;
  }

  .df-review-preset-count {
    min-width: 16px;
    padding: 0 5px;
    border-radius: var(--df-review-radius-pill);
    background: var(--df-review-line-soft);
    color: var(--df-review-muted);
    font-size: var(--df-review-font-size-2xs);
    font-weight: var(--df-review-font-weight-normal);
    line-height: 16px;
    text-align: center;
  }

  .df-review-presets button.is-active .df-review-preset-count {
    background: var(--df-review-accent-hover);
    color: var(--df-review-accent);
  }

  .df-review-presets button.is-active {
    color: var(--df-review-accent);
    box-shadow: inset 0 0 0 1px var(--df-review-accent-hover);
  }

  .df-review-preset-copy {
    display: grid;
    gap: 1px;
    min-width: 0;
    text-align: left;
    line-height: 1.05;
  }

  .df-review-preset-copy strong {
    color: var(--df-review-text);
    font-size: var(--df-review-font-size-sm);
    font-weight: var(--df-review-font-weight-normal);
  }

	  .df-review-overlay-button,
	  .df-review-mode-button {
    position: relative;
    display: inline-grid;
    place-items: center;
	    width: var(--df-review-control-height-md);
	    min-width: var(--df-review-control-height-md);
	    height: var(--df-review-control-height-md);
	    min-height: var(--df-review-control-height-md);
	    padding: 0;
	    border-color: transparent;
	    background: transparent;
	    box-shadow: none;
	    color: var(--df-review-muted);
	  }

  .df-review-overlay-button {
    border: 1px solid var(--df-review-line-soft);
    border-radius: var(--df-review-radius-sm);
    background: var(--df-review-control);
    box-shadow: var(--df-review-shadow-control);
  }

  .df-review-overlay-button:hover,
  .df-review-overlay-button:focus-visible {
    border-color: var(--df-review-accent);
    background: var(--df-review-control-hover);
    color: var(--df-review-text);
    outline: 0;
  }

  .df-review-overlay-button.is-active {
    border-color: var(--df-review-accent);
    background: var(--df-review-accent-soft);
    box-shadow: inset 0 0 0 1px var(--df-review-accent-hover);
    color: var(--df-review-accent);
  }

  .df-review-mode-button {
    width: calc(var(--df-review-control-height-md) - 6px);
    min-width: calc(var(--df-review-control-height-md) - 6px);
    height: calc(var(--df-review-control-height-md) - 6px);
    min-height: calc(var(--df-review-control-height-md) - 6px);
  }

  .df-review-overlays-menu {
    position: relative;
    display: none;
    flex: 0 0 auto;
  }

  .df-review-overlays-menu summary {
    display: grid;
    place-items: center;
    width: var(--df-review-control-height-md);
    min-width: var(--df-review-control-height-md);
    height: var(--df-review-control-height-md);
    border: 1px solid var(--df-review-line-soft);
    border-radius: var(--df-review-radius-md);
    padding: 0;
    color: var(--df-review-muted);
    background: var(--df-review-card);
    box-shadow: var(--df-review-shadow-control);
    cursor: pointer;
  }

  .df-review-overlays-menu summary::-webkit-details-marker {
    display: none;
  }

  .df-review-overlays-menu summary::marker {
    content: '';
  }

  .df-review-overlays-menu summary:hover,
  .df-review-overlays-menu[open] summary {
    border-color: var(--df-review-accent);
    background: var(--df-review-control-hover);
    color: var(--df-review-accent);
  }

  .df-review-overlays-menu summary svg {
    width: 20px;
    height: 20px;
    fill: none;
    stroke: currentColor;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-width: 1.9;
  }

  .df-review-overlays-popover {
    position: absolute;
    top: calc(100% + 6px);
    right: 0;
    z-index: 700;
    display: none;
    align-items: center;
    gap: var(--df-review-space-1-5);
    min-height: var(--df-review-control-height-md);
    padding: 0;
    border: 1px solid var(--df-review-line-soft);
    border-radius: var(--df-review-radius-md);
    background: var(--df-review-card);
    box-shadow: var(--df-review-shadow-modal);
  }

  .df-review-overlays-menu[open] .df-review-overlays-popover {
    display: flex;
  }

  .df-review-overlay-button svg,
  .df-review-mode-button svg {
    width: 18px;
    height: 18px;
    fill: none;
    stroke: currentColor;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-width: 1.9;
	  }

  .df-review-overlay-button .df-review-figma-mark-icon {
    fill: currentColor;
    stroke: none;
  }







		  .df-review-overlay-button.is-settings {
		    color: var(--df-review-muted);
		  }

		  .df-review-overlay-button.is-settings:hover {
		    color: var(--df-review-text);
		  }

	  .df-review-overlay-button.is-disabled,
	  .df-review-overlay-button.is-disabled:hover {
	    cursor: not-allowed;
	    border-color: var(--df-review-line);
	    background: var(--df-review-line-soft);
	    color: var(--df-review-subtle);
	  }

	  @container (max-width: 1040px) {
	    .df-review-tools {
	      flex-direction: row;
	      align-items: center;
	      justify-content: space-between;
	    }

	    .df-review-tool-controls {
	      flex: 1 1 auto;
	      width: auto;
        min-width: 0;
        flex-wrap: nowrap;
	    }

	    .df-review-presets {
	      display: none;
	    }

      .df-review-preset-select {
        display: block;
        flex: 0 1 150px;
        min-width: 128px;
        width: clamp(128px, 20vw, 150px);
	    }

      .df-review-tool-divider,
      .df-review-active-size {
        display: none;
      }

		  }

		  .df-review-side-rail {
	    grid-column: 3;
	    grid-row: 1 / span 3;
	    position: relative;
	    z-index: 640;
	    display: flex;
	    flex-direction: column;
	    align-items: stretch;
	    justify-content: flex-start;
	    min-width: 0;
	    min-height: 0;
	    border-left: 1px solid var(--df-review-line);
	    background: var(--df-review-side-rail);
	  }

  .df-review-side-toggle {
    position: relative;
    flex: 0 0 48px;
    display: grid;
    place-items: center;
    width: 100%;
    min-height: 48px;
    border: 0;
	    border-radius: 0;
	    padding: 0;
	    background: transparent;
	    color: var(--df-review-muted);
    transition: color 140ms ease, background 140ms ease;
	  }

	  .df-review-side-toggle:hover {
	    color: var(--df-review-text);
	  }

  .df-review-side-toggle.is-active {
    color: var(--df-review-accent);
  }

  .df-review-side-toggle.is-active::after {
    position: absolute;
    top: 9px;
    right: 0;
    bottom: 9px;
    width: 3px;
    border-radius: 3px 0 0 3px;
    background: var(--df-review-accent);
    content: '';
  }

  .df-review-side-toggle:focus-visible {
    outline: 0;
    color: var(--df-review-text);
  }

  .df-review-side-toggle:focus-visible span {
    border-radius: 6px;
    outline: 2px solid var(--df-review-focus-ring);
    outline-offset: 3px;
  }

  .df-review-side-toggle span {
    display: grid;
    place-items: center;
	    width: 30px;
	    height: 30px;
	    line-height: 1;
	  }

	  .df-review-side-toggle svg {
	    width: 22px;
	    height: 22px;
	    fill: none;
	    stroke: currentColor;
	    stroke-linecap: round;
	    stroke-width: 1.55;
	  }

  .df-review-side-toggle svg.df-review-brand-icon {
    width: auto;
    height: 16px;
    stroke: none;
    fill: currentColor;
  }

  .df-review-side-actions {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    width: 100%;
    margin-top: auto;
  }

  .df-review-side-divider {
    height: 1px;
    margin: 4px 12px;
    background: var(--df-review-line);
  }

  .df-review-presence-overlay {
    position: relative;
    margin-top: auto;
  }

  .df-review-side-actions .df-review-presence-overlay {
    margin-top: 0;
  }

  .df-review-presence-button {
    position: relative;
    display: grid;
    place-items: center;
    width: 100%;
    min-height: 48px;
    border: 0;
    border-radius: 0;
    padding: 0;
    color: var(--df-review-muted);
    background: transparent;
  }

  .df-review-presence-button:hover,
  .df-review-presence-button[aria-expanded="true"] {
    color: var(--df-review-text);
  }

  .df-review-presence-button:focus-visible {
    outline: 0;
  }

  .df-review-presence-button:focus-visible svg {
    border-radius: 6px;
    outline: 2px solid var(--df-review-focus-ring);
    outline-offset: 3px;
  }

  .df-review-presence-button svg {
    width: 22px;
    height: 22px;
    fill: none;
    stroke: currentColor;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-width: 1.55;
  }

  .df-review-presence-badge {
    position: absolute;
    top: 6px;
    right: 6px;
    display: grid;
    place-items: center;
    min-width: 17px;
    height: 17px;
    border: 1px solid var(--df-review-side-rail);
    border-radius: var(--df-review-radius-pill);
    padding: 0 4px;
    color: #17202c;
    background: var(--df-review-accent);
    font-size: var(--df-review-font-size-3xs);
    font-weight: var(--df-review-font-weight-emphasis);
    line-height: 1;
    pointer-events: none;
  }

  .df-review-presence-list {
    position: absolute;
    right: calc(100% + 8px);
    bottom: 8px;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 5px;
    width: max-content;
    min-width: 0;
    max-width: 220px;
  }

  .df-review-presence-chip {
    --df-review-presence-color: var(--df-review-accent);
    display: inline-flex;
    align-items: center;
    width: fit-content;
    max-width: 180px;
    min-width: 0;
    min-height: 22px;
    justify-content: flex-end;
    border: 1px solid var(--df-review-line-soft);
    border-radius: var(--df-review-radius-pill);
    padding: 0 9px;
    color: var(--df-review-text);
    background: var(--df-review-control);
    font-size: var(--df-review-font-size-xs);
    font-weight: var(--df-review-font-weight-normal);
    line-height: 1.1;
    white-space: nowrap;
  }

  .df-review-presence-chip span {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    text-align: right;
    white-space: nowrap;
  }

  .df-review-presence-chip.is-self {
    color: var(--df-review-accent);
    border-color: var(--df-review-accent-hover);
    background: linear-gradient(
        var(--df-review-accent-soft),
        var(--df-review-accent-soft)
      ),
      var(--df-review-control);
  }

`;

// src/react-shell/style/qa-panel.ts
var reviewShellQaPanelStyle = `
	  .df-review-qa-panel {
	    grid-column: 2;
	    grid-row: 1 / span 3;
	    position: relative;
	    z-index: 600;
	    display: grid;
	    grid-template-rows: minmax(0, 1fr) auto;
	    min-width: 0;
	    min-height: 0;
	    overflow: hidden;
	    border-left: 1px solid var(--df-review-line-soft);
	    background:
	      linear-gradient(180deg, var(--df-review-panel), var(--df-review-bg));
	  }

  .df-review-qa-draft-host {
    position: relative;
    z-index: 2;
    display: none;
    justify-self: end;
    width: calc(100% - var(--df-review-space-4));
    margin: 0 var(--df-review-space-2) var(--df-review-space-2) auto;
    min-width: 0;
  }

  .df-review-qa-draft-host[data-has-draft-composer="true"] {
    display: block;
  }

  .df-review-qa-panel[data-has-draft-composer="true"] .df-review-panel-body {
    opacity: 0.36;
    pointer-events: none;
  }

	  .df-review-shell:not(.is-list-visible) .df-review-qa-panel,
  .df-review-qa-panel[aria-hidden="true"] {
	    visibility: hidden;
	    border-left: 0;
    pointer-events: none;
	  }

  .df-review-source-tree-panel {
    grid-column: 2;
    grid-row: 1 / span 3;
    position: relative;
    z-index: 600;
    display: grid;
    min-width: 0;
    min-height: 0;
    overflow: hidden;
    border-left: 1px solid var(--df-review-line-soft);
    background:
      linear-gradient(180deg, var(--df-review-panel), var(--df-review-bg));
  }

  .df-review-shell:not(.is-list-visible) .df-review-source-tree-panel,
  .df-review-source-tree-panel[aria-hidden="true"] {
    visibility: hidden;
    border-left: 0;
    pointer-events: none;
  }

	  .df-review-panel-body {
	    display: grid;
	    min-width: 0;
	    min-height: 0;
	    overflow: hidden;
	  }

  .df-review-item-list {
    display: grid;
    grid-template-rows: auto minmax(0, 1fr);
    min-width: 0;
    min-height: 0;
  }

			  .df-review-list-header {
			    display: grid;
			    grid-template-rows:
      var(--df-review-control-height-md)
      var(--df-review-control-height-md);
			    gap: var(--df-review-space-2);
			    padding: var(--df-review-space-3) var(--df-review-frame-gutter-x);
			    border-bottom: 1px solid var(--df-review-line-soft);
			    background: var(--df-review-card);
			    color: var(--df-review-muted);
			    font-size: var(--df-review-font-size-sm);
			    font-weight: var(--df-review-font-weight-normal);
			  }

			  .df-review-list-toolbar {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
    gap: 8px;
    min-height: var(--df-review-control-height-md);
    min-width: 0;
  }

			  .df-review-list-title {
			    display: grid;
          grid-template-columns: minmax(0, 1fr) auto;
			    align-items: center;
			    gap: 8px;
          min-height: var(--df-review-control-height-md);
		    min-width: 0;
		  }

  .df-review-list-meta {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
  }

		  .df-review-list-meta span {
		    min-width: 0;
		    overflow: hidden;
		    color: #fff;
		    text-overflow: ellipsis;
		    white-space: nowrap;
		  }

			  .df-review-list-meta strong {
			    flex: 0 0 auto;
			    color: #fff;
			    font-size: var(--df-review-font-size-xs);
			    font-variant-numeric: tabular-nums;
          font-weight: var(--df-review-font-weight-normal);
			  }

  .df-review-list-controls {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .df-review-source-select,
  .df-review-status-filter-select {
    height: var(--df-review-control-height-md);
    min-height: var(--df-review-control-height-md);
    border: 1px solid var(--df-review-line-soft);
    border-radius: var(--df-review-radius-sm);
    padding: 0 24px 0 8px;
    color: var(--df-review-text);
    background: var(--df-review-control);
    box-shadow: var(--df-review-shadow-control);
    font-size: var(--df-review-font-size-xs);
    font-weight: var(--df-review-font-weight-normal);
  }

  .df-review-source-select {
    width: 104px;
  }

  .df-review-status-filter-select {
    width: 124px;
  }

  .df-review-source-refresh {
    position: relative;
		    display: inline-grid;
		    place-items: center;
		    width: var(--df-review-control-height-md);
		    min-width: var(--df-review-control-height-md);
		    height: var(--df-review-control-height-md);
		    border: 1px solid var(--df-review-line-soft);
		    border-radius: var(--df-review-radius-sm);
		    padding: 0;
		    color: var(--df-review-muted);
		    background: var(--df-review-control);
		    box-shadow: var(--df-review-shadow-control);
		  }

		  .df-review-source-refresh svg {
		    width: 16px;
		    height: 16px;
		  }

			  .df-review-filter-tabs {
    display: flex;
    align-items: center;
    justify-self: end;
    gap: 2px;
    height: 26px;
    min-height: 26px;
    padding: 0;
    border: 0;
    border-radius: 0;
    background: transparent;
    box-shadow: none;
  }

				  .df-review-filter-tab {
    position: relative;
    display: grid;
    place-items: center;
    width: 26px;
    min-width: 26px;
    height: 26px;
    border: 0;
    border-radius: 0;
    background: transparent;
    color: var(--df-review-subtle);
    opacity: 0.3;
  }

				  .df-review-filter-icon {
    display: grid;
    place-items: center;
    width: 100%;
    height: 100%;
  }

				  .df-review-filter-separator {
				    display: block;
				    width: 18px;
				    height: 1px;
				    border-radius: var(--df-review-radius-pill);
				    background: currentColor;
				    opacity: 0.42;
				  }

		  .df-review-filter-tab:hover,
		  .df-review-filter-tab.is-active {
		    color: var(--df-review-text);
        opacity: 1;
		  }

		  .df-review-filter-tab.is-active {
		    box-shadow: none;
		    color: var(--df-review-accent);
		  }

				  .df-review-filter-icon svg {
				    width: 14px;
				    height: 14px;
		    fill: none;
		    stroke: currentColor;
		    stroke-linecap: round;
		    stroke-linejoin: round;
			    stroke-width: 1.9;
			  }

			  .df-review-filter-count {
			    color: currentColor;
			    font-size: var(--df-review-font-size-3xs);
			    font-weight: var(--df-review-font-weight-emphasis);
			    font-variant-numeric: tabular-nums;
			    line-height: 1;
			  }

  .df-review-list-scroll {
    display: grid;
    align-content: start;
    gap: var(--df-review-space-2);
    min-height: 0;
    overflow: auto;
    padding: var(--df-review-space-2);
  }

		  .df-review-empty {
		    display: flex;
		    align-items: center;
		    gap: var(--df-review-space-2);
		    margin: 0;
		    padding: var(--df-review-space-5) var(--df-review-space-4);
		    border: 1px dashed var(--df-review-line);
	    border-radius: var(--df-review-radius-lg);
	    background: var(--df-review-card);
	    color: var(--df-review-subtle);
	    font-size: var(--df-review-font-size-sm);
		    line-height: 1.45;
		  }

  .df-review-empty.is-loading {
    border-style: solid;
    color: var(--df-review-text);
  }

  .df-review-empty .df-review-spinner,
  .df-review-item-saving .df-review-spinner,
  .df-review-edit-actions .df-review-spinner {
    flex: none;
    width: 12px;
    min-width: 12px;
    height: 12px;
    min-height: 12px;
    border-width: 2px;
  }

  .df-review-item-card.is-dim {
    opacity: 0.4;
  }

	  .df-review-item-card.is-dim:hover {
	    opacity: 0.72;
	  }

  .df-review-item-card.is-mutating {
    pointer-events: auto;
  }

	  .df-review-item-card {
		    position: relative;
		    display: grid;
		    gap: var(--df-review-space-2-5);
		    padding: var(--df-review-space-3-5);
		    border: 1px solid var(--df-review-line-soft);
		    border-radius: var(--df-review-radius-lg);
		    background: var(--df-review-card);
		    cursor: pointer;
		    transition: border-color 140ms ease, background 140ms ease, box-shadow 140ms ease, opacity 140ms ease;
		  }

  .df-review-item-card:not(.is-dim):hover {
    border-color: var(--df-review-line);
  }

  .df-review-item-card.is-active {
	    border-color: var(--df-review-accent);
	    background: var(--df-review-card);
	    box-shadow: inset 0 0 0 1px var(--df-review-accent-hover), 0 0 0 3px rgba(124, 199, 255, 0.12);
	  }

  .df-review-item-card.is-overlay-hidden .df-review-item-main {
    opacity: 0.68;
  }

  .df-review-item-header {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: start;
    gap: 8px;
    min-width: 0;
  }

  .df-review-item-main {
    display: grid;
    gap: 4px;
    min-width: 0;
	    border: 0;
	    padding: 0;
	    text-align: left;
	    background: transparent;
	    color: var(--df-review-text);
	  }

  .df-review-item-main strong,
  .df-review-item-main p {
    margin: 0;
  }

  .df-review-item-main strong {
    overflow-wrap: anywhere;
    font-size: var(--df-review-font-size-md);
    font-weight: var(--df-review-font-weight-normal);
    line-height: 1.35;
  }

  .df-review-item-title {
    padding-top: 4px;
  }

  .df-review-item-comment {
    padding: 0;
    color: var(--df-review-muted);
    overflow-wrap: anywhere;
    font-size: var(--df-review-font-size-sm);
    line-height: 1.45;
    white-space: pre-wrap;
  }

  .df-review-item-comment.is-primary {
    padding: 5px 0;
    color: var(--df-review-text);
    font-size: var(--df-review-font-size-md);
    line-height: 1.35;
  }

	  .df-review-item-main small {
	    color: var(--df-review-subtle);
	    font-size: var(--df-review-font-size-xs);
	  }

  .df-review-item-meta {
    display: block;
    overflow-wrap: anywhere;
    line-height: 1.35;
  }

	  .df-review-item-error {
	    color: var(--df-review-danger) !important;
	    overflow-wrap: anywhere;
	  }

  .df-review-item-saving {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    color: var(--df-review-accent);
    font-size: var(--df-review-font-size-xs);
    line-height: 1.35;
  }

  .df-review-item-badges {
    display: flex;
    align-items: center;
    gap: 6px;
    min-width: 0;
    flex-wrap: wrap;
  }

  .df-review-item-id,
  .df-review-item-scope,
  .df-review-item-mode,
  .df-review-item-assignee-badge,
  .df-review-item-assignee-select,
  .df-review-item-status-badge,
  .df-review-item-status-select {
    --df-review-scope: var(--df-review-accent);
    --df-review-scope-rgb: 124, 199, 255;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    min-height: 20px;
    border: 1px solid var(--df-review-line);
    border-radius: var(--df-review-radius-pill);
    padding: 0 7px;
    font-size: var(--df-review-font-size-2xs);
    font-weight: var(--df-review-font-weight-emphasis);
    line-height: 1;
    text-transform: uppercase;
  }

  .df-review-item-id {
    appearance: none;
    border-color: var(--df-review-line);
    background: rgba(255, 255, 255, 0.03);
    color: var(--df-review-text);
    cursor: copy;
    font-family: inherit;
  }

  .df-review-item-id:hover,
  .df-review-item-id:focus-visible,
  .df-review-item-id.is-copied {
    border-color: var(--df-review-accent);
    background: var(--df-review-accent-soft);
    color: var(--df-review-accent);
    outline: none;
  }

  .df-review-item-scope {
    border-color: rgba(var(--df-review-scope-rgb), 0.36);
    background: rgba(var(--df-review-scope-rgb), 0.12);
    color: var(--df-review-scope);
  }

  .df-review-item-scope.is-scope-tablet {
    --df-review-scope: var(--df-review-area);
    --df-review-scope-rgb: 99, 215, 199;
  }

  .df-review-item-scope.is-scope-desktop {
    --df-review-scope: var(--df-review-note);
    --df-review-scope-rgb: 243, 183, 95;
  }

  .df-review-item-scope.is-scope-wide {
    --df-review-scope: var(--df-review-purple);
    --df-review-scope-rgb: 201, 156, 255;
  }

  .df-review-item-scope.is-scope-dom {
    --df-review-scope: var(--df-review-danger);
    --df-review-scope-rgb: 255, 143, 97;
  }

  .df-review-item-scope svg,
  .df-review-item-mode svg {
    width: 12px;
    height: 12px;
    flex: 0 0 auto;
    fill: none;
    stroke: currentColor;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-width: 2;
  }

	  .df-review-item-mode {
	    color: var(--df-review-muted);
    background: var(--df-review-line-soft);
  }

  .df-review-item-mode.is-mode-area {
    color: var(--df-review-area);
  }

  .df-review-item-mode.is-mode-dom {
    color: var(--df-review-danger);
  }

  .df-review-item-status-badge {
    min-height: 30px;
    border-radius: var(--df-review-radius-sm);
    padding: 0 11px;
    font-size: var(--df-review-font-size-xs);
    font-weight: var(--df-review-font-weight-normal);
    text-transform: none;
  }

  .df-review-item-assignee-badge,
  .df-review-item-assignee-select {
    min-height: 30px;
    min-width: 96px;
    max-width: 132px;
    border-radius: var(--df-review-radius-sm);
    border-color: rgba(255, 255, 255, 0.16);
    padding: 0 10px;
    color: var(--df-review-text);
    background: var(--df-review-control);
    font-size: var(--df-review-font-size-xs);
    font-weight: var(--df-review-font-weight-normal);
    text-transform: none;
  }

  .df-review-item-assignee-select {
    cursor: pointer;
    outline: 0;
  }

	  .df-review-item-assignee-select:focus-visible {
	    border-color: var(--df-review-accent);
	    box-shadow: 0 0 0 2px var(--df-review-accent-soft);
	  }

  .df-review-item-assignee-select:disabled {
    cursor: wait;
    opacity: 0.62;
  }

  .df-review-item-status-select {
    min-height: 30px;
    min-width: 92px;
    max-width: 118px;
    border-radius: var(--df-review-radius-sm);
    padding: 0 10px;
    cursor: pointer;
    outline: 0;
    font-size: var(--df-review-font-size-xs);
    font-weight: var(--df-review-font-weight-normal);
    text-transform: none;
  }

	  .df-review-item-status-select:focus-visible {
	    border-color: var(--df-review-accent);
	    box-shadow: 0 0 0 2px var(--df-review-accent-soft);
	  }

  .df-review-item-status-select:disabled {
    cursor: wait;
    opacity: 0.62;
  }

  .df-review-item-status-badge.is-status-todo,
  .df-review-item-status-select.is-status-todo {
    border-color: var(--df-review-line);
    color: var(--df-review-muted);
    background: var(--df-review-line-soft);
  }

  .df-review-item-status-badge.is-status-doing,
  .df-review-item-status-select.is-status-doing {
    border-color: rgba(124, 199, 255, 0.34);
    color: var(--df-review-accent);
    background: var(--df-review-accent-soft);
  }

  .df-review-item-status-badge.is-status-review,
  .df-review-item-status-select.is-status-review {
    border-color: rgba(243, 183, 95, 0.34);
    color: var(--df-review-note);
    background: var(--df-review-note-soft);
  }

  .df-review-item-status-badge.is-status-hold,
  .df-review-item-status-select.is-status-hold {
    border-color: rgba(179, 149, 255, 0.32);
    color: var(--df-review-purple);
    background: var(--df-review-purple-soft);
  }

  .df-review-item-status-badge.is-status-done,
  .df-review-item-status-select.is-status-done {
    border-color: rgba(99, 215, 199, 0.34);
    color: var(--df-review-area);
    background: var(--df-review-area-soft);
  }

  .df-review-source-select,
  .df-review-status-filter-select,
  .df-review-item-assignee-select,
  .df-review-item-status-select,
  .df-review-item-status-select.is-status-todo,
  .df-review-item-status-select.is-status-doing,
  .df-review-item-status-select.is-status-review,
  .df-review-item-status-select.is-status-hold,
  .df-review-item-status-select.is-status-done,
  .df-review-sitemap-controls select {
    --df-review-select-padding-x: 12px;
    --df-review-select-chevron-size: 14px;
    --df-review-select-chevron-gap: 8px;
    appearance: none;
    -webkit-appearance: none;
    background-image: var(--df-review-select-chevron);
    background-repeat: no-repeat;
    background-position: right var(--df-review-select-padding-x) center;
    background-size:
      var(--df-review-select-chevron-size)
      var(--df-review-select-chevron-size);
    padding-right: calc(
      var(--df-review-select-padding-x) +
      var(--df-review-select-chevron-size) +
      var(--df-review-select-chevron-gap)
    );
    padding-left: var(--df-review-select-padding-x);
  }

  .df-review-item-status-badge.is-error {
    border-color: rgba(255, 143, 97, 0.36);
    color: var(--df-review-danger);
    background: var(--df-review-danger-soft);
  }

	  .df-review-item-main img {
	    width: 100%;
	    max-height: 110px;
	    border: 1px solid var(--df-review-line);
	    border-radius: var(--df-review-radius-sm);
	    object-fit: cover;
	    background: var(--df-review-control);
  }

	  .df-review-item-header-actions {
	    display: inline-flex;
	    align-items: center;
	    justify-content: flex-end;
	    gap: 2px;
	    cursor: auto;
	  }

  .df-review-item-delete,
  .df-review-item-edit,
  .df-review-item-link-copy,
  .df-review-item-prompt-copy,
  .df-review-item-visibility {
    display: inline-grid;
    place-items: center;
    width: 26px;
    height: 26px;
    border: 1px solid transparent;
    border-radius: var(--df-review-radius-sm);
    padding: 0;
    color: var(--df-review-muted);
    background: transparent;
    text-decoration: none;
    transition: border-color 140ms ease, background 140ms ease, color 140ms ease;
  }

  .df-review-item-visibility:hover,
  .df-review-item-edit:hover,
  .df-review-item-link-copy:hover,
  .df-review-item-prompt-copy:hover {
    border-color: rgba(124, 199, 255, 0.34);
    color: var(--df-review-accent);
    background: var(--df-review-accent-soft);
  }

  .df-review-item-delete:hover {
    border-color: rgba(255, 143, 97, 0.34);
    color: var(--df-review-danger);
    background: var(--df-review-danger-soft);
  }

  .df-review-item-visibility.is-visible {
    color: var(--df-review-accent);
  }

  .df-review-item-visibility.is-hidden {
    opacity: 0.7;
    color: var(--df-review-subtle);
  }

  .df-review-item-link-copy.is-copied,
  .df-review-item-prompt-copy.is-copied {
    color: var(--df-review-accent);
  }

  .df-review-item-delete svg,
  .df-review-item-edit svg,
  .df-review-item-link-copy svg,
  .df-review-item-prompt-copy svg,
  .df-review-item-visibility svg {
    width: 14px;
    height: 14px;
  }

				  .df-review-item-actions {
				    display: grid;
				    grid-template-columns: auto minmax(0, 1fr) auto;
			    align-items: center;
			    gap: 6px;
			    min-width: 0;
			    margin-top: 2px;
			  }

				  .df-review-item-workflow-actions {
				    display: inline-flex;
				    grid-column: 1;
				    align-items: center;
				    gap: 6px;
				    min-width: 0;
				    flex-wrap: wrap;
			    cursor: auto;
				  }

				  .df-review-item-status-actions,
				  .df-review-item-assignee-actions {
				    display: inline-flex;
				    align-items: center;
				    min-width: 0;
			    cursor: auto;
			  }

			  .df-review-item-prompt-actions {
			    display: inline-flex;
			    grid-column: 2;
			    align-items: center;
			    justify-self: end;
			    min-width: 0;
		    cursor: auto;
			  }

			  .df-review-item-remote-actions {
			    display: inline-flex;
			    grid-column: 3;
			    align-items: center;
			    justify-content: flex-end;
			    justify-self: end;
			    gap: 6px;
			    min-width: 0;
		    cursor: auto;
			  }

  .df-review-item-action-button {
    position: relative;
    display: inline-grid;
    place-items: center;
    width: 32px;
    min-width: 32px;
    height: 30px;
    border: 1px solid var(--df-review-line);
    border-radius: var(--df-review-radius-sm);
    padding: 0;
    color: var(--df-review-muted);
    background: var(--df-review-control);
  }

	  .df-review-item-action-button:hover:not(:disabled) {
	    border-color: rgba(124, 199, 255, 0.42);
	    color: var(--df-review-text);
	    background: var(--df-review-control-hover);
	  }

  .df-review-item-action-button.is-copied {
    border-color: rgba(124, 199, 255, 0.42);
    color: var(--df-review-accent);
    background: var(--df-review-accent-soft);
  }

			  .df-review-item-actions .df-review-item-submit-button {
			    display: inline-flex;
			    align-items: center;
			    gap: 6px;
			    min-height: 30px;
			    height: 30px;
			    width: auto;
			    min-width: 0;
			    border-radius: var(--df-review-radius-sm);
			    padding: 0 11px;
		    border-color: var(--df-review-line);
		    background: var(--df-review-control);
		    color: var(--df-review-text);
		  }

		  .df-review-item-submit-button span {
		    font-size: var(--df-review-font-size-xs);
		    font-weight: var(--df-review-font-weight-normal);
		    line-height: 1;
		    text-transform: none;
		    white-space: nowrap;
		  }

	  .df-review-item-actions .df-review-item-submit-button:hover:not(:disabled) {
	    border-color: var(--df-review-accent);
	    background: var(--df-review-accent-hover);
	    color: var(--df-review-text);
	  }

	  .df-review-item-action-button:disabled {
	    cursor: default;
	    opacity: 0.45;
	  }

  .df-review-source-refresh.is-loading svg {
    animation: df-review-spinner-spin 760ms linear infinite;
  }

  .df-review-source-refresh:disabled {
    cursor: wait;
    opacity: 0.7;
  }

  .df-review-item-action-button svg {
    width: 14px;
    height: 14px;
    fill: none;
    stroke: currentColor;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-width: 2;
  }

`;

// src/react-shell/style/figma-images.ts
var reviewShellFigmaImagesStyle = `
  .df-review-figma-images-panel {
    grid-column: 2;
    grid-row: 1 / span 3;
    position: relative;
    z-index: 600;
    display: grid;
    grid-template-rows: auto auto auto auto auto minmax(0, 1fr);
    min-width: 0;
    min-height: 0;
    overflow: hidden;
    border-left: 1px solid var(--df-review-line-soft);
    background:
      linear-gradient(180deg, var(--df-review-panel), var(--df-review-bg));
  }

  .df-review-shell:not(.is-list-visible) .df-review-figma-images-panel,
  .df-review-figma-images-panel[aria-hidden="true"] {
    visibility: hidden;
    border-left: 0;
    pointer-events: none;
  }

  .df-review-figma-images-header {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
    gap: 8px;
    min-height: var(--df-review-control-height-md);
    min-width: 0;
  }

  .df-review-figma-images-title {
    display: grid;
    min-width: 0;
  }

  .df-review-figma-images-title strong {
    overflow: hidden;
    color: var(--df-review-text);
    font-size: inherit;
    font-weight: var(--df-review-font-weight-emphasis);
    line-height: 1;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .df-review-figma-image-form {
    display: grid;
    grid-template-rows:
      var(--df-review-control-height-md)
      var(--df-review-control-height-md);
    align-items: center;
    gap: var(--df-review-space-2);
    padding: var(--df-review-space-3) var(--df-review-frame-gutter-x);
    border-bottom: 1px solid var(--df-review-line-soft);
    background: var(--df-review-card);
    color: var(--df-review-muted);
    font-size: var(--df-review-font-size-sm);
    font-weight: var(--df-review-font-weight-normal);
  }

  .df-review-figma-image-form input {
    width: 100%;
    height: var(--df-review-control-height-md);
    min-height: var(--df-review-control-height-md);
    min-width: 0;
    border: 1px solid var(--df-review-line);
    border-radius: var(--df-review-radius-sm);
    padding: 0 10px;
    color: var(--df-review-text);
    background: var(--df-review-bg);
    box-shadow: var(--df-review-shadow-control);
    font-size: var(--df-review-font-size-sm);
  }

  .df-review-figma-image-form input:focus {
    border-color: var(--df-review-accent);
    outline: 2px solid var(--df-review-focus-ring);
    outline-offset: 1px;
  }

  .df-review-figma-image-url-row {
    display: grid;
    grid-template-columns: minmax(0, 1fr) var(--df-review-control-height-md);
    align-items: center;
    gap: var(--df-review-space-1-5);
    min-width: 0;
  }

  .df-review-figma-image-header-button {
    display: inline-grid;
    place-items: center;
    justify-self: end;
    width: 26px;
    min-width: 26px;
    height: 26px;
    min-height: 26px;
    border: 0;
    border-radius: 0;
    padding: 0;
    color: var(--df-review-muted);
    background: transparent;
    box-shadow: none;
    cursor: pointer;
  }

  .df-review-figma-image-header-button:hover,
  .df-review-figma-image-header-button:focus-visible {
    color: var(--df-review-text);
    opacity: 1;
    outline: 0;
  }

  .df-review-figma-image-header-button:disabled {
    cursor: default;
    opacity: 0.36;
  }

  .df-review-figma-image-header-button svg {
    width: 14px;
    height: 14px;
    fill: none;
    stroke: currentColor;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-width: 2;
  }

  .df-review-figma-image-url-row button,
  .df-review-figma-image-icon-button {
    display: inline-grid;
    place-items: center;
    width: var(--df-review-control-height-md);
    min-width: var(--df-review-control-height-md);
    height: var(--df-review-control-height-md);
    min-height: var(--df-review-control-height-md);
    border: 1px solid var(--df-review-line);
    border-radius: var(--df-review-radius-sm);
    padding: 0;
    color: var(--df-review-muted);
    background: var(--df-review-control);
    box-shadow: var(--df-review-shadow-control);
    text-decoration: none;
  }

  .df-review-figma-image-url-row button:hover,
  .df-review-figma-image-icon-button:hover {
    border-color: var(--df-review-accent);
    color: var(--df-review-text);
    background: var(--df-review-control-hover);
  }

  .df-review-figma-image-url-row button:disabled,
  .df-review-figma-image-icon-button:disabled {
    cursor: default;
    opacity: 0.42;
  }

  .df-review-figma-image-url-row button svg,
  .df-review-figma-image-icon-button svg {
    width: 15px;
    height: 15px;
  }

  .df-review-figma-image-icon-button.is-danger:hover {
    border-color: rgba(255, 143, 97, 0.34);
    color: var(--df-review-danger);
    background: var(--df-review-danger-soft);
  }

  .df-review-figma-image-icon-button.is-active {
    border-color: var(--df-review-accent);
    color: var(--df-review-accent);
    background: var(--df-review-accent-soft);
    box-shadow: inset 0 0 0 1px var(--df-review-accent-hover);
  }

  .df-review-figma-image-selected-controls {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    align-items: center;
    gap: var(--df-review-space-1);
    padding: var(--df-review-space-2) var(--df-review-frame-gutter-x);
    border-bottom: 1px solid var(--df-review-line-soft);
    background: color-mix(in srgb, var(--df-review-card) 82%, transparent);
  }

  .df-review-figma-image-selected-numbers {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(54px, 64px) var(--df-review-control-height-sm);
    justify-self: stretch;
    gap: var(--df-review-space-1);
    min-width: 0;
  }

  .df-review-figma-image-selected-link {
    display: inline-grid;
    place-items: center;
    width: var(--df-review-control-height-sm);
    min-width: var(--df-review-control-height-sm);
    height: var(--df-review-control-height-sm);
    min-height: var(--df-review-control-height-sm);
    border: 1px solid var(--df-review-line);
    border-radius: var(--df-review-radius-sm);
    padding: 0;
    color: var(--df-review-muted);
    background: var(--df-review-control);
    box-shadow: var(--df-review-shadow-control);
    text-decoration: none;
  }

  .df-review-figma-image-selected-link:hover,
  .df-review-figma-image-selected-link:focus-visible {
    border-color: var(--df-review-accent);
    color: var(--df-review-text);
    background: var(--df-review-control-hover);
    outline: none;
  }

  .df-review-figma-image-selected-link:disabled {
    cursor: default;
    opacity: 0.42;
  }

  .df-review-figma-image-selected-link svg {
    width: 13px;
    height: 13px;
  }

  .df-review-figma-image-number-control {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    align-items: center;
    gap: 4px;
    min-width: 0;
    height: var(--df-review-control-height-sm);
    border: 1px solid var(--df-review-line);
    border-radius: var(--df-review-radius-sm);
    padding: 0 5px;
    color: var(--df-review-muted);
    background: var(--df-review-control);
    box-shadow: var(--df-review-shadow-control);
    font-size: var(--df-review-font-size-xs);
    font-variant-numeric: tabular-nums;
  }

  .df-review-figma-image-number-control svg {
    width: 13px;
    height: 13px;
    color: var(--df-review-subtle);
  }

  .df-review-figma-image-number-control span {
    color: var(--df-review-subtle);
    font-size: var(--df-review-font-size-2xs);
    line-height: 1;
  }

  .df-review-figma-image-number-control input {
    width: 100%;
    min-width: 0;
    border: 0;
    padding: 0;
    color: var(--df-review-text);
    background: transparent;
    font-size: var(--df-review-font-size-xs);
    font-variant-numeric: tabular-nums;
    outline: none;
  }

  .df-review-figma-image-number-control input:disabled {
    color: var(--df-review-subtle);
  }

  .df-review-figma-image-number-control:focus-within {
    border-color: var(--df-review-accent);
    outline: 2px solid var(--df-review-focus-ring);
    outline-offset: 1px;
  }

  .df-review-figma-image-opacity-control {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) 26px;
    align-items: center;
    gap: 6px;
    min-width: 0;
    height: var(--df-review-control-height-sm);
    border: 1px solid var(--df-review-line);
    border-radius: var(--df-review-radius-sm);
    padding: 0 6px;
    color: var(--df-review-muted);
    background: var(--df-review-control);
    box-shadow: var(--df-review-shadow-control);
    font-size: var(--df-review-font-size-xs);
    font-variant-numeric: tabular-nums;
  }

  .df-review-figma-image-opacity-control span {
    color: var(--df-review-subtle);
    font-size: var(--df-review-font-size-2xs);
    line-height: 1;
  }

  .df-review-figma-image-opacity-control strong {
    color: var(--df-review-text);
    font-size: var(--df-review-font-size-xs);
    font-weight: 500;
    line-height: 1;
    text-align: right;
  }

  .df-review-figma-image-opacity-slider {
    --df-review-figma-opacity-thumb-size: 12px;
    --df-review-figma-opacity-thumb-radius: 6px;
    position: relative;
    display: grid;
    align-items: center;
    min-width: 0;
    height: 20px;
    cursor: pointer;
    touch-action: none;
  }

  .df-review-figma-image-opacity-slider::before {
    content: "";
    position: absolute;
    top: 50%;
    right: var(--df-review-figma-opacity-thumb-radius);
    left: var(--df-review-figma-opacity-thumb-radius);
    height: 4px;
    border-radius: 999px;
    background: linear-gradient(
      90deg,
      var(--df-review-accent) 0 var(--df-review-figma-opacity-value),
      var(--df-review-line) var(--df-review-figma-opacity-value) 100%
    );
    transform: translateY(-50%);
    pointer-events: none;
  }

  .df-review-figma-image-opacity-slider::after {
    content: "";
    position: absolute;
    top: 50%;
    left: clamp(
      var(--df-review-figma-opacity-thumb-radius),
      var(--df-review-figma-opacity-left, var(--df-review-figma-opacity-value)),
      calc(100% - var(--df-review-figma-opacity-thumb-radius))
    );
    z-index: 2;
    box-sizing: border-box;
    width: var(--df-review-figma-opacity-thumb-size);
    height: var(--df-review-figma-opacity-thumb-size);
    border: 1px solid var(--df-review-accent);
    border-radius: 50%;
    background: var(--df-review-text);
    box-shadow: 0 0 0 2px var(--df-review-bg);
    transform: translate(-50%, -50%);
    pointer-events: none;
  }

  .df-review-figma-image-opacity-slider input[type="range"] {
    -webkit-appearance: none;
    appearance: none;
    position: absolute;
    inset: 0;
    z-index: 3;
    width: 100%;
    min-width: 0;
    height: 100%;
    border: 0;
    margin: 0;
    padding: 0;
    background: transparent;
    outline: none;
    opacity: 0;
    cursor: pointer;
  }

  .df-review-figma-image-opacity-slider input[type="range"]::-webkit-slider-runnable-track {
    height: 4px;
    border-radius: 999px;
    background: transparent;
  }

  .df-review-figma-image-opacity-slider input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: var(--df-review-figma-opacity-thumb-size);
    height: var(--df-review-figma-opacity-thumb-size);
    margin-top: -4px;
    border: 0;
    border-radius: 50%;
    background: transparent;
    box-shadow: none;
  }

  .df-review-figma-image-opacity-slider input[type="range"]::-moz-range-track {
    height: 4px;
    border-radius: 999px;
    background: transparent;
  }

  .df-review-figma-image-opacity-slider input[type="range"]::-moz-range-thumb {
    width: var(--df-review-figma-opacity-thumb-size);
    height: var(--df-review-figma-opacity-thumb-size);
    border: 0;
    border-radius: 50%;
    background: transparent;
    box-shadow: none;
  }

  .df-review-figma-image-opacity-slider input[type="range"]:disabled {
    cursor: default;
  }

  .df-review-figma-image-opacity-control:focus-within {
    border-color: var(--df-review-accent);
    outline: 2px solid var(--df-review-focus-ring);
    outline-offset: 1px;
  }

  .df-review-figma-image-status {
    margin: 0;
    padding: var(--df-review-space-2) var(--df-review-frame-gutter-x);
    border-bottom: 1px solid var(--df-review-line-soft);
    color: var(--df-review-muted);
    font-size: var(--df-review-font-size-xs);
    line-height: 1.35;
    overflow-wrap: anywhere;
  }

  .df-review-figma-image-status.is-error {
    color: var(--df-review-danger);
  }

  .df-review-figma-image-list {
    display: grid;
    align-content: start;
    gap: var(--df-review-space-2);
    min-height: 0;
    overflow: auto;
    padding: var(--df-review-space-2);
  }

  .df-review-figma-image-card {
    position: relative;
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    grid-template-areas: "state main actions";
    align-items: center;
    gap: var(--df-review-space-1-5);
    min-height: 76px;
    min-width: 0;
    border: 1px solid var(--df-review-line-soft);
    border-radius: var(--df-review-radius-sm);
    padding: var(--df-review-space-4) var(--df-review-space-2);
    background: var(--df-review-card);
    cursor: pointer;
    transition: border-color 140ms ease, box-shadow 140ms ease;
  }

  .df-review-figma-image-card:hover {
    border-color: var(--df-review-line);
  }

  .df-review-figma-image-card.is-dragging {
    opacity: 0.58;
  }

  .df-review-figma-image-card.is-drop-target {
    border-color: var(--df-review-line-soft);
    box-shadow: none;
  }

  .df-review-figma-image-card.is-drop-before::before,
  .df-review-figma-image-card.is-drop-after::after {
    content: "";
    position: absolute;
    z-index: 2;
    right: 6px;
    left: 6px;
    height: 2px;
    border-radius: 999px;
    background: var(--df-review-accent);
    box-shadow: 0 0 0 2px rgba(124, 199, 255, 0.16);
    pointer-events: none;
  }

  .df-review-figma-image-card.is-drop-before::before {
    top: -6px;
  }

  .df-review-figma-image-card.is-drop-after::after {
    bottom: -6px;
  }

  .df-review-figma-image-card.is-active {
    border-color: var(--df-review-accent);
    box-shadow: inset 0 0 0 1px var(--df-review-accent-hover), 0 0 0 3px rgba(124, 199, 255, 0.12);
  }

  .df-review-figma-image-card.is-editing {
    grid-template-columns: auto minmax(0, 1fr);
    grid-template-areas: "state main";
  }

  .df-review-figma-image-card.is-status {
    grid-template-columns: auto minmax(0, 1fr);
    grid-template-areas: "state main";
    cursor: default;
  }

  .df-review-figma-image-spinner {
    grid-area: state;
  }

  .df-review-figma-image-layer-state {
    grid-area: state;
    display: grid;
    grid-template-columns: repeat(3, 22px);
    align-items: center;
    gap: 2px;
    min-width: 0;
    height: var(--df-review-control-height-sm);
  }

  .df-review-figma-image-state-button {
    display: inline-grid;
    place-items: center;
    width: 22px;
    min-width: 22px;
    height: 22px;
    min-height: 22px;
    border: 0;
    border-radius: 0;
    padding: 0;
    color: var(--df-review-subtle);
    background: transparent;
    box-shadow: none;
    opacity: 0.62;
  }

  .df-review-figma-image-state-button:hover,
  .df-review-figma-image-state-button:focus-visible {
    color: var(--df-review-text);
    opacity: 1;
    outline: none;
  }

  .df-review-figma-image-state-button.is-active {
    color: var(--df-review-accent);
    opacity: 1;
  }

  .df-review-figma-image-state-button svg {
    width: 13px;
    height: 13px;
  }

  .df-review-figma-image-card-main {
    grid-area: main;
    display: grid;
    gap: 3px;
    min-width: 0;
  }

  .df-review-figma-image-label-input {
    width: 100%;
    min-width: 0;
    height: 24px;
    border: 1px solid transparent;
    border-radius: 2px;
    padding: 0 4px;
    color: var(--df-review-text);
    background: transparent;
    box-shadow: none;
    font-size: var(--df-review-font-size-sm);
    font-weight: 500;
    line-height: 1.28;
  }

  .df-review-figma-image-label-input:focus {
    border-color: var(--df-review-accent);
    outline: 2px solid var(--df-review-focus-ring);
    outline-offset: 1px;
  }

  .df-review-figma-image-label-input:disabled {
    color: var(--df-review-subtle);
  }

  .df-review-figma-image-card-main small {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .df-review-figma-image-card-main strong,
  .df-review-figma-image-card-main small {
    user-drag: none;
    user-select: none;
    -moz-user-select: none;
    -webkit-user-drag: none;
    -webkit-user-select: none;
    -ms-user-select: none;
  }

  .df-review-figma-image-card-main strong {
    min-width: 0;
    color: var(--df-review-text);
    font-size: var(--df-review-font-size-sm);
    font-weight: 500;
    line-height: 1.28;
    overflow-wrap: anywhere;
    white-space: normal;
  }

  .df-review-figma-image-card-main small {
    color: var(--df-review-subtle);
    font-size: var(--df-review-font-size-2xs);
    line-height: 1.2;
  }

  .df-review-figma-image-card-actions {
    grid-area: actions;
    display: grid;
    grid-template-columns: repeat(2, 22px);
    gap: 2px;
  }

  .df-review-figma-image-card-actions .df-review-figma-image-icon-button {
    width: 22px;
    min-width: 22px;
    height: 22px;
    min-height: 22px;
    border: 0;
    border-radius: 0;
    color: var(--df-review-subtle);
    background: transparent;
    box-shadow: none;
    opacity: 0;
    pointer-events: none;
    transition: opacity 120ms ease, color 120ms ease;
  }

  .df-review-figma-image-card:hover .df-review-figma-image-card-actions .df-review-figma-image-icon-button,
  .df-review-figma-image-card:focus-within .df-review-figma-image-card-actions .df-review-figma-image-icon-button {
    opacity: 0.62;
    pointer-events: auto;
  }

  .df-review-figma-image-card-actions .df-review-figma-image-icon-button:hover,
  .df-review-figma-image-card-actions .df-review-figma-image-icon-button:focus-visible {
    color: var(--df-review-text);
    background: transparent;
    opacity: 1;
    outline: none;
  }

  .df-review-figma-image-card.is-editing .df-review-figma-image-card-actions {
    display: none;
  }

  .df-review-figma-image-preview-dialog {
    grid-template-rows: auto minmax(0, 1fr);
    width: min(600px, calc(100vw - 36px));
    max-height: min(760px, calc(100vh - 36px));
  }

  .df-review-figma-image-preview-header {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto var(--df-review-control-height-md);
    align-items: center;
    gap: var(--df-review-space-2);
    min-width: 0;
    padding: 16px 18px 14px;
    border-bottom: 1px solid var(--df-review-line-soft);
    background: var(--df-review-card);
  }

  .df-review-figma-image-preview-header input {
    width: 100%;
    height: var(--df-review-control-height-md);
    min-width: 0;
    border: 1px solid var(--df-review-line);
    border-radius: var(--df-review-radius-sm);
    padding: 0 10px;
    color: var(--df-review-text);
    background: var(--df-review-bg);
    box-shadow: var(--df-review-shadow-control);
    font-size: var(--df-review-font-size-sm);
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .df-review-figma-image-preview-link {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    height: var(--df-review-control-height-md);
    min-width: 0;
    border: 1px solid var(--df-review-line);
    border-radius: var(--df-review-radius-sm);
    padding: 0 10px;
    color: var(--df-review-text);
    background: var(--df-review-control);
    box-shadow: var(--df-review-shadow-control);
    font-size: var(--df-review-font-size-sm);
    font-weight: 500;
    line-height: 1;
    text-decoration: none;
    white-space: nowrap;
  }

  .df-review-figma-image-preview-link:hover,
  .df-review-figma-image-preview-link:focus-visible {
    border-color: var(--df-review-accent);
    background: var(--df-review-control-hover);
    outline: none;
  }

  .df-review-figma-image-preview-link svg {
    width: 14px;
    height: 14px;
    flex: 0 0 auto;
  }

  .df-review-figma-image-preview-close {
    display: inline-grid;
    place-items: center;
    width: var(--df-review-control-height-md);
    min-width: var(--df-review-control-height-md);
    height: var(--df-review-control-height-md);
    min-height: var(--df-review-control-height-md);
    border: 1px solid var(--df-review-line);
    border-radius: var(--df-review-radius-sm);
    padding: 0;
    color: var(--df-review-text);
    background: var(--df-review-control);
    box-shadow: var(--df-review-shadow-control);
  }

  .df-review-figma-image-preview-close:hover,
  .df-review-figma-image-preview-close:focus-visible {
    border-color: var(--df-review-accent);
    background: var(--df-review-control-hover);
    outline: none;
  }

  .df-review-figma-image-preview-close svg {
    width: 15px;
    height: 15px;
  }

  .df-review-figma-image-preview-scroll {
    min-height: 0;
    overflow: auto;
    padding: 16px;
    background: var(--df-review-bg);
  }

  .df-review-figma-image-preview-scroll img {
    display: block;
    width: auto;
    max-width: 100%;
    height: auto;
    margin: 0 auto;
    object-fit: contain;
    object-position: top center;
  }

  @media (max-width: 460px) {
    .df-review-figma-image-preview-header {
      grid-template-columns:
        minmax(0, 1fr)
        var(--df-review-control-height-md)
        var(--df-review-control-height-md);
      gap: var(--df-review-space-1-5);
      padding-left: 14px;
      padding-right: 14px;
    }

    .df-review-figma-image-preview-link {
      width: var(--df-review-control-height-md);
      padding: 0;
    }

    .df-review-figma-image-preview-link span {
      display: none;
    }
  }

  @media (hover: none) {
    .df-review-figma-image-card.is-active .df-review-figma-image-card-actions .df-review-figma-image-icon-button {
      opacity: 0.62;
      pointer-events: auto;
    }
  }
`;

// src/react-shell/style/stage.ts
var reviewShellStageStyle = `
	  .df-review-stage {
	    grid-column: 1;
	    grid-row: 3;
	    display: grid;
	    min-width: 0;
	    min-height: 0;
	    overflow: hidden;
	  }

  .df-review-frame {
    display: grid;
    grid-template-rows: minmax(0, 1fr) auto;
    min-width: 0;
    min-height: 0;
  }

  .df-review-frame-actions {
    position: relative;
    z-index: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 56px;
    padding: 8px 40px 10px;
    border-top: 1px solid var(--df-review-line-soft);
    background: var(--df-review-mode-bar);
  }

	  .df-review-frame-scroll {
	    min-width: 0;
	    min-height: 0;
	    overflow: auto;
	  }

	  .df-review-frame-canvas {
	    display: grid;
	    place-items: center;
	    width: max-content;
	    height: max-content;
	    min-width: 100%;
	    min-height: 100%;
	    padding: 34px 58px 12px 40px;
	  }

  .df-review-target-stack {
    display: grid;
    justify-items: start;
    gap: 8px;
    width: max-content;
    max-width: 100%;
  }

  .df-review-device {
	    box-sizing: border-box;
	    flex: 0 0 auto;
	    position: relative;
	    margin: 0;
	    overflow: hidden;
	    border: 1px solid var(--df-review-line);
	    border-radius: var(--df-review-radius-lg);
	    background: #fff;
	    box-shadow: var(--df-review-shadow-device);
  }

  .df-review-device iframe {
    display: block;
    width: inherit;
    height: inherit;
    min-width: inherit;
    min-height: inherit;
    border: 0;
    background: #fff;
  }

`;

// src/react-shell/style/source-inspector.ts
var reviewShellSourceInspectorStyle = `
  .df-review-source-outline {
    position: fixed;
    z-index: 880;
    pointer-events: none;
    border: 2px solid rgba(124, 199, 255, 0.96);
    border-radius: 4px;
    box-shadow:
      0 0 0 1px rgba(15, 18, 24, 0.58),
      0 0 0 5px rgba(124, 199, 255, 0.16);
  }

  .df-review-source-outline.is-pinned {
    border-color: var(--df-review-note);
    box-shadow:
      0 0 0 1px rgba(15, 18, 24, 0.58),
      0 0 0 5px rgba(243, 183, 95, 0.16);
  }

  .df-review-source-popover {
    --df-review-source-popover-line: rgba(226, 233, 245, 0.16);
    --df-review-source-popover-text: #edf3fb;
    --df-review-source-popover-muted: rgba(237, 243, 251, 0.68);
    --df-review-source-popover-subtle: rgba(237, 243, 251, 0.5);
    --df-review-source-popover-data: #f3b75f;
    --df-review-source-popover-data-muted: rgba(243, 183, 95, 0.78);
    --df-review-source-popover-data-subtle: rgba(243, 183, 95, 0.62);
    --df-review-source-popover-hover: rgba(124, 199, 255, 0.14);
    position: fixed;
    z-index: 890;
    display: grid;
    width: fit-content;
    min-width: min(240px, calc(100vw - 24px));
    max-width: min(440px, calc(100vw - 24px));
    max-height: 260px;
    overflow: hidden;
    border: 1px solid var(--df-review-source-popover-line);
    border-radius: var(--df-review-radius-md);
    padding: 6px;
    color: var(--df-review-source-popover-text);
    color-scheme: dark;
    background: rgba(19, 24, 33, 0.96);
    box-shadow: var(--df-review-shadow-panel);
    backdrop-filter: blur(10px);
  }

  .df-review-source-popover-close {
    position: absolute;
    top: 5px;
    right: 5px;
    z-index: 1;
  }

  .df-review-source-popover-close button {
    display: grid;
    place-items: center;
    width: 24px;
    height: 24px;
    border: 1px solid transparent;
    border-radius: var(--df-review-radius-sm);
    padding: 0;
    color: var(--df-review-source-popover-subtle);
    background: transparent;
    font-size: var(--df-review-font-size-xl);
    font-weight: var(--df-review-font-weight-normal);
    line-height: 1;
  }

  .df-review-source-popover-close button:hover {
    border-color: var(--df-review-source-popover-line);
    color: var(--df-review-source-popover-text);
    background: var(--df-review-source-popover-hover);
  }

  .df-review-source-candidate-list {
    display: grid;
    gap: 0;
    max-height: min(220px, calc(100vh - 96px));
    min-height: 0;
    overflow-x: hidden;
    overflow-y: auto;
    padding-right: 2px;
    scrollbar-gutter: stable;
  }

  .df-review-source-candidate {
    display: grid;
    width: 100%;
    border: 0;
    border-top: 1px solid transparent;
    border-radius: var(--df-review-radius-sm);
    padding: 9px 30px 9px 8px;
    color: var(--df-review-source-popover-text);
    background: transparent;
    text-align: left;
  }

  .df-review-source-candidate + .df-review-source-candidate {
    border-top-color: var(--df-review-source-popover-line);
  }

  .df-review-source-candidate:hover {
    background: var(--df-review-source-popover-hover);
  }

  .df-review-source-candidate-main {
    display: grid;
    gap: 1px;
    min-width: 0;
  }

  .df-review-source-candidate-main strong,
  .df-review-source-candidate-main small {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .df-review-source-candidate-main strong {
    font-size: var(--df-review-font-size-xs);
    font-weight: var(--df-review-font-weight-emphasis);
    line-height: 1.2;
  }

  .df-review-source-candidate-main span {
    overflow-wrap: anywhere;
    color: var(--df-review-source-popover-muted);
    font-family: var(--df-review-font-mono);
    font-size: var(--df-review-font-size-2xs);
    line-height: 1.24;
    white-space: normal;
  }

  .df-review-source-candidate-main small {
    color: var(--df-review-source-popover-subtle);
    font-family: var(--df-review-font-mono);
    font-size: var(--df-review-font-size-2xs);
    line-height: 1.2;
  }

  .df-review-source-candidate.is-data .df-review-source-candidate-main strong {
    color: var(--df-review-source-popover-data);
  }

  .df-review-source-candidate.is-data .df-review-source-candidate-main span {
    color: var(--df-review-source-popover-data-muted);
  }

  .df-review-source-candidate.is-data .df-review-source-candidate-main small {
    color: var(--df-review-source-popover-data-subtle);
  }

`;

// src/react-shell/style/section-outline.ts
var reviewShellSectionOutlineStyle = `
  .df-review-section-outline {
    position: relative;
    z-index: 1;
    display: grid;
    grid-template-rows: auto minmax(0, 1fr);
    width: 100%;
    height: 100%;
    min-width: 0;
    min-height: 0;
    border: 0;
    border-radius: 0;
    color: var(--df-review-text);
    background: transparent;
    box-shadow: none;
    overflow: hidden;
  }

  .df-review-section-outline-head {
    display: grid;
    grid-template-rows:
      var(--df-review-control-height-md)
      var(--df-review-control-height-md);
    align-items: center;
    gap: var(--df-review-space-2);
    min-width: 0;
    padding: var(--df-review-space-3) var(--df-review-frame-gutter-x);
    border-bottom: 1px solid var(--df-review-line-soft);
    background: var(--df-review-card);
    color: var(--df-review-muted);
    font-size: var(--df-review-font-size-sm);
    font-weight: var(--df-review-font-weight-normal);
  }

  .df-review-section-outline-summary {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
    gap: 8px;
    min-height: var(--df-review-control-height-md);
    min-width: 0;
  }

  .df-review-section-outline-summary span {
    display: inline-flex;
    align-items: baseline;
    gap: 6px;
    min-width: 0;
  }

  .df-review-section-outline-head strong {
    overflow: hidden;
    color: var(--df-review-text);
    font-size: inherit;
    font-weight: var(--df-review-font-weight-emphasis);
    line-height: 1;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .df-review-section-outline-head small {
    flex: 0 0 auto;
    overflow: hidden;
    color: var(--df-review-muted);
    font-size: var(--df-review-font-size-xs);
    font-weight: var(--df-review-font-weight-normal);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .df-review-section-outline-meta-controls {
    display: inline-flex;
    align-items: center;
    justify-content: flex-end;
    gap: 2px;
    height: 26px;
    min-height: 26px;
    min-width: 0;
    border: 0;
    border-radius: 0;
    padding: 0;
    background: transparent;
    box-shadow: none;
  }

  .df-review-section-outline-meta-toggle {
    display: inline-grid;
    place-items: center;
    width: 26px;
    min-width: 26px;
    height: 26px;
    border: 0;
    border-radius: 0;
    padding: 0;
    color: var(--df-review-subtle);
    background: transparent;
    box-shadow: none;
    cursor: pointer;
    opacity: 0.3;
  }

  .df-review-section-outline-meta-toggle:hover,
  .df-review-section-outline-meta-toggle:focus-visible,
  .df-review-section-outline-meta-toggle.is-active {
    color: var(--df-review-text);
    opacity: 1;
    outline: 0;
  }

  .df-review-section-outline-meta-toggle.is-active {
    box-shadow: none;
    color: var(--df-review-accent);
  }

  .df-review-section-outline-meta-toggle svg {
    width: 14px;
    height: 14px;
    fill: none;
    stroke: currentColor;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-width: 2;
  }

  .df-review-section-outline-filter {
    display: grid;
    grid-template-columns: 18px minmax(0, 1fr) auto;
    align-items: center;
    align-self: stretch;
    gap: 8px;
    min-width: 0;
    height: var(--df-review-control-height-md);
    min-height: var(--df-review-control-height-md);
    border: 1px solid var(--df-review-line-soft);
    border-radius: var(--df-review-radius-sm);
    padding: 0 7px 0 11px;
    color: var(--df-review-muted);
    background: var(--df-review-control);
    box-shadow: var(--df-review-shadow-control);
  }

  .df-review-section-outline-filter:focus-within {
    border-color: var(--df-review-accent);
    box-shadow: inset 0 0 0 1px var(--df-review-accent-hover);
  }

  .df-review-section-outline-filter svg {
    width: 18px;
    height: 18px;
    fill: none;
    stroke: currentColor;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-width: 1.9;
  }

  .df-review-section-outline-filter input {
    width: 100%;
    min-width: 0;
    height: 100%;
    border: 0;
    padding: 0;
    color: var(--df-review-text);
    background: transparent;
    font-size: var(--df-review-font-size-xs);
    font-weight: var(--df-review-font-weight-normal);
    outline: 0;
    -webkit-appearance: none;
    appearance: none;
  }

  .df-review-section-outline-filter input::placeholder {
    color: var(--df-review-subtle);
  }

  .df-review-section-outline-filter input::-webkit-search-cancel-button,
  .df-review-section-outline-filter input::-webkit-search-decoration {
    display: none;
    -webkit-appearance: none;
    appearance: none;
  }

  .df-review-section-outline-filter-clear {
    display: inline-grid;
    place-items: center;
    width: var(--df-review-control-height-md);
    height: var(--df-review-control-height-md);
    border: 0;
    border-radius: var(--df-review-radius-sm);
    padding: 0;
    color: var(--df-review-muted);
    background: transparent;
    cursor: pointer;
  }

  .df-review-section-outline-filter-clear:hover,
  .df-review-section-outline-filter-clear:focus-visible {
    color: var(--df-review-text);
    background: var(--df-review-accent-soft);
    outline: 0;
  }

  .df-review-section-outline-list {
    display: grid;
    align-content: start;
    gap: var(--df-review-space-2);
    min-height: 0;
    overflow-y: auto;
    padding: var(--df-review-space-2) var(--df-review-space-2) var(--df-review-space-3);
    scrollbar-gutter: stable;
  }

  .df-review-section-outline-item {
    display: grid;
    --df-review-section-outline-name-color: var(--df-review-text);
  }

  /* Each root renders as a card so the tree scans like the QA list. */
  .df-review-section-outline-item.is-depth-1 {
    padding: var(--df-review-space-1);
    border: 1px solid var(--df-review-line-soft);
    border-radius: var(--df-review-radius-lg);
    background: var(--df-review-card);
  }

  .df-review-section-outline-entry-body {
    display: grid;
    border: 1px solid transparent;
    border-radius: var(--df-review-radius-sm);
    transition: border-color 140ms ease, background 140ms ease;
  }

  .df-review-section-outline-entry-body:hover {
    border-color: rgba(124, 199, 255, 0.2);
    background: var(--df-review-accent-soft);
  }


  .df-review-section-outline-row {
    display: grid;
    grid-template-columns: 18px minmax(0, 1fr) auto;
    align-items: center;
    gap: 7px;
    border-radius: var(--df-review-radius-sm);
    min-height: 42px;
    padding: 6px 7px 6px 6px;
  }

  .df-review-section-outline-toggle {
    display: grid;
    place-items: center;
    width: 18px;
    height: 18px;
    border: 0;
    border-radius: var(--df-review-radius-sm);
    padding: 0;
    color: var(--df-review-muted);
    background: transparent;
  }

  .df-review-section-outline-toggle:hover {
    color: var(--df-review-text);
    background: var(--df-review-accent-soft);
  }

  .df-review-section-outline-toggle svg {
    width: 13px;
    height: 13px;
    fill: none;
    stroke: currentColor;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-width: 2.4;
    transition: transform 120ms ease;
  }

  .df-review-section-outline-toggle.is-collapsed svg {
    transform: rotate(-90deg);
  }

  .df-review-section-outline-toggle.is-placeholder {
    pointer-events: none;
  }

  .df-review-section-outline-name {
    display: grid;
    gap: 2px;
    min-width: 0;
    overflow: hidden;
    border: 0;
    padding: 0;
    color: var(--df-review-text);
    background: transparent;
    font-size: var(--df-review-font-size-sm);
    font-weight: var(--df-review-font-weight-normal);
    text-align: left;
    white-space: normal;
    cursor: pointer;
  }

  .df-review-section-outline-name span,
  .df-review-section-outline-name small {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .df-review-section-outline-name span {
    color: var(--df-review-section-outline-name-color);
  }

  .df-review-section-outline-name small {
    color: var(--df-review-muted);
    font-family: var(--df-review-font-mono);
    font-size: var(--df-review-font-size-2xs);
    font-weight: var(--df-review-font-weight-normal);
  }

  .df-review-section-outline-name:hover {
    color: var(--df-review-accent);
  }

  .df-review-section-outline-meta {
    position: relative;
    display: grid;
    gap: 3px;
    min-width: 0;
    padding: 8px 6px 7px;
  }

  .df-review-section-outline-meta::before {
    position: absolute;
    top: 0;
    left: 29px;
    right: 8px;
    height: 1px;
    background: var(--df-review-line-soft);
    content: '';
  }

  .df-review-section-outline-meta-row {
    display: grid;
    grid-template-columns: 52px minmax(0, 1fr);
    align-items: start;
    gap: 6px;
    min-width: 0;
    color: var(--df-review-muted);
    font-family: var(--df-review-font-mono);
    font-size: var(--df-review-font-size-2xs);
    line-height: 1.35;
  }

  .df-review-section-outline-meta-row b {
    color: var(--df-review-subtle);
    font-weight: var(--df-review-font-weight-emphasis);
  }

  .df-review-section-outline-meta-row code {
    min-width: 0;
    overflow-wrap: anywhere;
    color: var(--df-review-muted);
    font-family: inherit;
  }

  .df-review-section-outline-meta-row.is-text code {
    color: var(--df-review-text);
  }

  .df-review-section-outline-meta-row.is-media code {
    color: var(--df-review-accent);
  }

  .df-review-section-outline-media-link {
    display: block;
    min-width: 0;
    color: var(--df-review-accent);
    text-decoration: none;
  }

  .df-review-section-outline-media-link:hover,
  .df-review-section-outline-media-link:focus-visible {
    color: var(--df-review-text);
    outline: 0;
  }

  .df-review-section-outline-meta-row.is-class code {
    color: var(--df-review-source-popover-data-subtle);
  }

  .df-review-section-outline-meta-row.is-class {
    align-items: center;
  }

  .df-review-section-outline-class-tags {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 3px;
    min-width: 0;
  }

  .df-review-section-outline-class-tags code {
    display: inline-flex;
    align-items: center;
    max-width: 100%;
    min-height: 20px;
    border: 1px solid var(--df-review-line-soft);
    border-radius: var(--df-review-radius-pill);
    padding: 0 6px;
    background: var(--df-review-control);
    line-height: 1;
  }

  .df-review-section-outline-links {
    display: inline-flex;
    align-items: center;
    justify-content: flex-end;
    gap: 1px;
  }

  .df-review-section-outline-divider {
    display: block;
    width: 1px;
    height: 14px;
    margin: 0 2px;
    overflow: hidden;
    background: var(--df-review-line-soft);
    color: var(--df-review-subtle);
    font-size: var(--df-review-font-size-xs);
    line-height: 1;
    text-indent: -999px;
    user-select: none;
  }

  .df-review-section-outline-link {
    display: inline-grid;
    place-items: center;
    width: 24px;
    height: 24px;
    border: 1px solid transparent;
    border-radius: var(--df-review-radius-sm);
    padding: 0;
    color: var(--df-review-muted);
    background: transparent;
    cursor: pointer;
    transition: border-color 140ms ease, background 140ms ease,
      color 140ms ease, opacity 140ms ease;
  }

  .df-review-section-outline-link.is-dom-select {
    width: 24px;
    min-width: 24px;
    padding: 0;
  }

  .df-review-section-outline-link.is-dom-select svg {
    width: 16px;
    height: 16px;
  }

  .df-review-section-outline-link:hover {
    border-color: rgba(124, 199, 255, 0.34);
    color: var(--df-review-accent);
    background: var(--df-review-accent-soft);
  }

  .df-review-section-outline-link svg {
    width: 14px;
    height: 14px;
    fill: none;
    stroke: currentColor;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-width: 2;
  }

  .df-review-section-outline-link:disabled {
    color: var(--df-review-subtle);
    cursor: not-allowed;
    opacity: 0.42;
  }

  .df-review-section-outline-link:disabled:hover {
    border-color: transparent;
    color: var(--df-review-subtle);
    background: transparent;
  }

  .df-review-section-outline-children {
    display: grid;
    margin-left: 16px;
    border-left: 1px solid var(--df-review-line-soft);
  }

  .df-review-section-outline-item.is-depth-1
    > .df-review-section-outline-children {
    border-left-color: var(--df-review-accent);
  }

  .df-review-section-outline-item.is-depth-2 {
    --df-review-section-outline-name-color: var(--df-review-accent);
  }

  .df-review-section-outline-item.is-depth-2
    > .df-review-section-outline-children {
    border-left-color: var(--df-review-area);
  }

  .df-review-section-outline-item.is-depth-3 {
    --df-review-section-outline-name-color: var(--df-review-area);
  }

  .df-review-section-outline-item.is-depth-3
    > .df-review-section-outline-children {
    border-left-color: var(--df-review-note);
  }

  .df-review-section-outline-item.is-depth-4 {
    --df-review-section-outline-name-color: var(--df-review-note);
  }

  .df-review-section-outline-item.is-depth-4
    > .df-review-section-outline-children {
    border-left-color: var(--df-review-purple);
  }

  .df-review-section-outline-item.is-depth-5 {
    --df-review-section-outline-name-color: var(--df-review-purple);
  }

  .df-review-section-outline-empty {
    padding: 14px 12px 16px;
    color: var(--df-review-muted);
    font-size: var(--df-review-font-size-xs);
    font-weight: var(--df-review-font-weight-normal);
  }

`;

// src/react-shell/style/ruler.ts
var reviewShellRulerStyle = `
  .df-review-device-frame {
    position: relative;
    box-sizing: border-box;
    flex: 0 0 auto;
  }

  .df-review-ruler-corner {
    position: absolute;
    left: -26px;
    top: -26px;
    width: 26px;
    height: 26px;
    z-index: 6;
    border-right: 1px solid var(--df-review-line-soft);
    border-bottom: 1px solid var(--df-review-line-soft);
    background: var(--df-review-color-ruler-surface);
  }

  .df-review-ruler-gutter {
    position: absolute;
    z-index: 6;
    background: var(--df-review-color-ruler-surface);
    color: var(--df-review-muted);
    user-select: none;
  }

  .df-review-ruler-gutter.is-x {
    left: 0;
    right: 0;
    top: -26px;
    height: 26px;
    border-bottom: 1px solid var(--df-review-line-soft);
    background-image:
      linear-gradient(
        to right,
        var(--df-review-color-ruler-tick-major) 1px,
        transparent 1px
      ),
      linear-gradient(
        to right,
        var(--df-review-color-ruler-tick-minor) 1px,
        transparent 1px
      );
    background-size:
      calc(var(--df-review-ruler-step-x) * 5) 11px,
      var(--df-review-ruler-step-x) 6px;
    background-position: left bottom;
    background-repeat: repeat-x;
  }

  .df-review-ruler-gutter.is-y {
    left: -26px;
    top: 0;
    bottom: 0;
    width: 26px;
    border-right: 1px solid var(--df-review-line-soft);
    background-image:
      linear-gradient(
        to bottom,
        var(--df-review-color-ruler-tick-major) 1px,
        transparent 1px
      ),
      linear-gradient(
        to bottom,
        var(--df-review-color-ruler-tick-minor) 1px,
        transparent 1px
      );
    background-size:
      11px calc(var(--df-review-ruler-step-y) * 5),
      6px var(--df-review-ruler-step-y);
    background-position: right top;
    background-repeat: repeat-y;
  }

  .df-review-ruler-frame-label {
    position: absolute;
    right: 6px;
    top: 50%;
    transform: translateY(-50%);
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 4px 8px;
    border: 1px solid var(--df-review-color-ruler-popover-border);
    border-radius: var(--df-review-radius-sm);
    background: var(--df-review-color-ruler-label);
    line-height: 1;
    white-space: nowrap;
    box-shadow: 0 6px 18px var(--df-review-color-ruler-popover-shadow);
  }

  .df-review-ruler-frame-label strong {
    color: var(--df-review-color-ruler-label-text);
    font-size: var(--df-review-font-size-xs);
    font-weight: var(--df-review-font-weight-emphasis);
  }

  .df-review-ruler-frame-label span {
    color: var(--df-review-color-ruler-label-text);
    font-size: var(--df-review-font-size-xs);
    font-weight: var(--df-review-font-weight-emphasis);
    opacity: 0.78;
  }

  .df-review-ruler-coord {
    position: absolute;
    z-index: 7;
    padding: 4px 6px;
    border: 1px solid var(--df-review-color-ruler-popover-border);
    border-radius: var(--df-review-radius-xs);
    background: var(--df-review-color-ruler-coord-bg);
    color: var(--df-review-color-ruler-coord-text);
    font-size: var(--df-review-font-size-xs);
    font-weight: var(--df-review-font-weight-emphasis);
    line-height: 1;
    white-space: nowrap;
    pointer-events: none;
    box-shadow: 0 6px 18px var(--df-review-color-ruler-popover-shadow);
  }

  .df-review-ruler-coord.is-x {
    top: 50%;
    transform: translate(-50%, -50%);
  }

  .df-review-ruler-coord.is-y {
    left: 50%;
    transform: translate(-50%, -50%);
  }

  .df-review-ruler-overlay {
    position: absolute;
    left: 0;
    top: 0;
    width: inherit;
    height: inherit;
    z-index: 5;
    cursor: crosshair;
    overflow: hidden;
    touch-action: none;
    user-select: none;
  }

  .df-review-ruler-overlay.is-dragging {
    cursor: crosshair;
  }

  .df-review-ruler-guide {
    position: absolute;
    z-index: 2;
    pointer-events: none;
    background: var(--df-review-color-ruler-guide);
    box-shadow: 0 0 0 1px var(--df-review-color-ruler-measure-shadow);
  }

  .df-review-ruler-guide.is-x {
    left: 0;
    right: 0;
    height: 2px;
  }

  .df-review-ruler-guide.is-y {
    top: 0;
    bottom: 0;
    width: 2px;
  }

  .df-review-ruler-selection {
    position: absolute;
    z-index: 3;
    pointer-events: none;
    border: 3px solid var(--df-review-color-ruler-measure-border);
    background: var(--df-review-color-ruler-measure-bg);
    box-shadow:
      inset 0 0 0 1px var(--df-review-color-ruler-measure-shadow),
      0 0 0 1px rgba(255, 255, 255, 0.96),
      0 0 0 4px var(--df-review-color-ruler-measure-shadow);
  }

  .df-review-ruler-label {
    position: absolute;
    z-index: 4;
    pointer-events: none;
    min-width: 124px;
    padding: 9px 11px;
    border: 1px solid var(--df-review-color-ruler-popover-border);
    border-radius: var(--df-review-radius-md);
    background: var(--df-review-color-ruler-popover-bg);
    color: var(--df-review-color-ruler-popover-text);
    font-family: var(--df-review-font-mono);
    font-size: var(--df-review-font-size-lg);
    font-weight: var(--df-review-font-weight-emphasis);
    line-height: 1;
    white-space: nowrap;
    letter-spacing: -0.02em;
    text-align: center;
    box-shadow:
      0 10px 26px var(--df-review-color-ruler-popover-shadow),
      inset 0 1px 0 rgba(255, 255, 255, 0.18);
  }

	  @media (max-width: 860px) {
	    .df-review-shell,
	    .df-review-shell.is-list-visible {
	      grid-template-columns: minmax(0, 1fr) 0 48px;
	      grid-template-rows: auto auto minmax(0, 1fr);
	    }

	    .df-review-shell.is-list-visible {
	      grid-template-columns: minmax(0, 1fr) minmax(260px, 70vw) 48px;
	    }

	    .df-review-qa-panel {
	      border-left: 1px solid var(--df-review-line);
	      border-bottom: 0;
	    }

	    .df-review-tools {
	      flex-wrap: nowrap;
	    }

	    .df-review-tool-controls {
	      justify-content: flex-start;
	    }

    .df-review-frame-actions {
      padding: 8px 20px 10px;
    }

	    .df-review-frame-canvas {
	      padding: 34px 28px 12px;
	    }

		    .df-review-prompt-modal {
		      padding: 12px;
		    }

		    .df-review-prompt-dialog {
		      width: calc(100vw - 24px);
		      max-height: calc(100vh - 24px);
		    }

		    .df-review-prompt-block textarea {
		      height: min(360px, calc(100vh - 270px));
		      min-height: 240px;
		      max-height: calc(100vh - 270px);
		    }

		    .df-review-panel-body {
		      min-height: 0;
		    }
	  }

    @media (hover: none) and (pointer: coarse) {
      .df-review-edit-textarea textarea,
      .df-review-preset-select,
      .df-review-prompt-block textarea {
        font-size: var(--df-review-font-size-xl);
      }
    }
`;

// src/react-shell/style.ts
var REVIEW_SHELL_STYLE_ID = "df-review-shell-style";
function ensureReviewShellStyle() {
  if (!document.getElementById(REVIEW_SHELL_STYLE_ID)) {
    const style = document.createElement("style");
    style.id = REVIEW_SHELL_STYLE_ID;
    style.textContent = [
      reviewShellBaseStyle,
      reviewShellSitemapStyle,
      reviewShellModalStyle,
      reviewShellToolbarStyle,
      reviewShellQaPanelStyle,
      reviewShellFigmaImagesStyle,
      reviewShellStageStyle,
      reviewShellSourceInspectorStyle,
      reviewShellSectionOutlineStyle,
      reviewShellRulerStyle
    ].join("\n\n");
    document.head.append(style);
  }
}

// src/react-shell/review/shell.tsx
var import_react24 = require("react");

// node_modules/.pnpm/lucide-react@1.20.0_react@19.2.7/node_modules/lucide-react/dist/esm/createLucideIcon.mjs
var import_react3 = require("react");

// node_modules/.pnpm/lucide-react@1.20.0_react@19.2.7/node_modules/lucide-react/dist/esm/shared/src/utils/mergeClasses.mjs
var mergeClasses = (...classes) => classes.filter((className, index, array) => {
  return Boolean(className) && className.trim() !== "" && array.indexOf(className) === index;
}).join(" ").trim();

// node_modules/.pnpm/lucide-react@1.20.0_react@19.2.7/node_modules/lucide-react/dist/esm/shared/src/utils/toKebabCase.mjs
var toKebabCase = (string) => string.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();

// node_modules/.pnpm/lucide-react@1.20.0_react@19.2.7/node_modules/lucide-react/dist/esm/shared/src/utils/toCamelCase.mjs
var toCamelCase = (string) => string.replace(
  /^([A-Z])|[\s-_]+(\w)/g,
  (match, p1, p2) => p2 ? p2.toUpperCase() : p1.toLowerCase()
);

// node_modules/.pnpm/lucide-react@1.20.0_react@19.2.7/node_modules/lucide-react/dist/esm/shared/src/utils/toPascalCase.mjs
var toPascalCase = (string) => {
  const camelCase = toCamelCase(string);
  return camelCase.charAt(0).toUpperCase() + camelCase.slice(1);
};

// node_modules/.pnpm/lucide-react@1.20.0_react@19.2.7/node_modules/lucide-react/dist/esm/Icon.mjs
var import_react2 = require("react");

// node_modules/.pnpm/lucide-react@1.20.0_react@19.2.7/node_modules/lucide-react/dist/esm/defaultAttributes.mjs
var defaultAttributes = {
  xmlns: "http://www.w3.org/2000/svg",
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round"
};

// node_modules/.pnpm/lucide-react@1.20.0_react@19.2.7/node_modules/lucide-react/dist/esm/shared/src/utils/hasA11yProp.mjs
var hasA11yProp = (props) => {
  for (const prop in props) {
    if (prop.startsWith("aria-") || prop === "role" || prop === "title") {
      return true;
    }
  }
  return false;
};

// node_modules/.pnpm/lucide-react@1.20.0_react@19.2.7/node_modules/lucide-react/dist/esm/context.mjs
var import_react = require("react");
var LucideContext = (0, import_react.createContext)({});
var useLucideContext = () => (0, import_react.useContext)(LucideContext);

// node_modules/.pnpm/lucide-react@1.20.0_react@19.2.7/node_modules/lucide-react/dist/esm/Icon.mjs
var Icon = (0, import_react2.forwardRef)(
  ({ color, size, strokeWidth, absoluteStrokeWidth, className = "", children, iconNode, ...rest }, ref) => {
    const {
      size: contextSize = 24,
      strokeWidth: contextStrokeWidth = 2,
      absoluteStrokeWidth: contextAbsoluteStrokeWidth = false,
      color: contextColor = "currentColor",
      className: contextClass = ""
    } = useLucideContext() ?? {};
    const calculatedStrokeWidth = absoluteStrokeWidth ?? contextAbsoluteStrokeWidth ? Number(strokeWidth ?? contextStrokeWidth) * 24 / Number(size ?? contextSize) : strokeWidth ?? contextStrokeWidth;
    return (0, import_react2.createElement)(
      "svg",
      {
        ref,
        ...defaultAttributes,
        width: size ?? contextSize ?? defaultAttributes.width,
        height: size ?? contextSize ?? defaultAttributes.height,
        stroke: color ?? contextColor,
        strokeWidth: calculatedStrokeWidth,
        className: mergeClasses("lucide", contextClass, className),
        ...!children && !hasA11yProp(rest) && { "aria-hidden": "true" },
        ...rest
      },
      [
        ...iconNode.map(([tag, attrs]) => (0, import_react2.createElement)(tag, attrs)),
        ...Array.isArray(children) ? children : [children]
      ]
    );
  }
);

// node_modules/.pnpm/lucide-react@1.20.0_react@19.2.7/node_modules/lucide-react/dist/esm/createLucideIcon.mjs
var createLucideIcon = (iconName, iconNode) => {
  const Component = (0, import_react3.forwardRef)(
    ({ className, ...props }, ref) => (0, import_react3.createElement)(Icon, {
      ref,
      iconNode,
      className: mergeClasses(
        `lucide-${toKebabCase(toPascalCase(iconName))}`,
        `lucide-${iconName}`,
        className
      ),
      ...props
    })
  );
  Component.displayName = toPascalCase(iconName);
  return Component;
};

// node_modules/.pnpm/lucide-react@1.20.0_react@19.2.7/node_modules/lucide-react/dist/esm/icons/bot.mjs
var __iconNode = [
  ["path", { d: "M12 8V4H8", key: "hb8ula" }],
  ["rect", { width: "16", height: "12", x: "4", y: "8", rx: "2", key: "enze0r" }],
  ["path", { d: "M2 14h2", key: "vft8re" }],
  ["path", { d: "M20 14h2", key: "4cs60a" }],
  ["path", { d: "M15 13v2", key: "1xurst" }],
  ["path", { d: "M9 13v2", key: "rq6x2g" }]
];
var Bot = createLucideIcon("bot", __iconNode);

// node_modules/.pnpm/lucide-react@1.20.0_react@19.2.7/node_modules/lucide-react/dist/esm/icons/chevron-down.mjs
var __iconNode2 = [["path", { d: "m6 9 6 6 6-6", key: "qrunsl" }]];
var ChevronDown = createLucideIcon("chevron-down", __iconNode2);

// node_modules/.pnpm/lucide-react@1.20.0_react@19.2.7/node_modules/lucide-react/dist/esm/icons/circle-question-mark.mjs
var __iconNode3 = [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["path", { d: "M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3", key: "1u773s" }],
  ["path", { d: "M12 17h.01", key: "p32p05" }]
];
var CircleQuestionMark = createLucideIcon("circle-question-mark", __iconNode3);

// node_modules/.pnpm/lucide-react@1.20.0_react@19.2.7/node_modules/lucide-react/dist/esm/icons/code-xml.mjs
var __iconNode4 = [
  ["path", { d: "m18 16 4-4-4-4", key: "1inbqp" }],
  ["path", { d: "m6 8-4 4 4 4", key: "15zrgr" }],
  ["path", { d: "m14.5 4-5 16", key: "e7oirm" }]
];
var CodeXml = createLucideIcon("code-xml", __iconNode4);

// node_modules/.pnpm/lucide-react@1.20.0_react@19.2.7/node_modules/lucide-react/dist/esm/icons/contrast.mjs
var __iconNode5 = [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["path", { d: "M12 18a6 6 0 0 0 0-12v12z", key: "j4l70d" }]
];
var Contrast = createLucideIcon("contrast", __iconNode5);

// node_modules/.pnpm/lucide-react@1.20.0_react@19.2.7/node_modules/lucide-react/dist/esm/icons/copy.mjs
var __iconNode6 = [
  ["rect", { width: "14", height: "14", x: "8", y: "8", rx: "2", ry: "2", key: "17jyea" }],
  ["path", { d: "M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2", key: "zix9uf" }]
];
var Copy = createLucideIcon("copy", __iconNode6);

// node_modules/.pnpm/lucide-react@1.20.0_react@19.2.7/node_modules/lucide-react/dist/esm/icons/database.mjs
var __iconNode7 = [
  ["ellipse", { cx: "12", cy: "5", rx: "9", ry: "3", key: "msslwz" }],
  ["path", { d: "M3 5V19A9 3 0 0 0 21 19V5", key: "1wlel7" }],
  ["path", { d: "M3 12A9 3 0 0 0 21 12", key: "mv7ke4" }]
];
var Database = createLucideIcon("database", __iconNode7);

// node_modules/.pnpm/lucide-react@1.20.0_react@19.2.7/node_modules/lucide-react/dist/esm/icons/external-link.mjs
var __iconNode8 = [
  ["path", { d: "M15 3h6v6", key: "1q9fwt" }],
  ["path", { d: "M10 14 21 3", key: "gplh6r" }],
  ["path", { d: "M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6", key: "a6xqqp" }]
];
var ExternalLink = createLucideIcon("external-link", __iconNode8);

// node_modules/.pnpm/lucide-react@1.20.0_react@19.2.7/node_modules/lucide-react/dist/esm/icons/eye-off.mjs
var __iconNode9 = [
  [
    "path",
    {
      d: "M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49",
      key: "ct8e1f"
    }
  ],
  ["path", { d: "M14.084 14.158a3 3 0 0 1-4.242-4.242", key: "151rxh" }],
  [
    "path",
    {
      d: "M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143",
      key: "13bj9a"
    }
  ],
  ["path", { d: "m2 2 20 20", key: "1ooewy" }]
];
var EyeOff = createLucideIcon("eye-off", __iconNode9);

// node_modules/.pnpm/lucide-react@1.20.0_react@19.2.7/node_modules/lucide-react/dist/esm/icons/eye.mjs
var __iconNode10 = [
  [
    "path",
    {
      d: "M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0",
      key: "1nclc0"
    }
  ],
  ["circle", { cx: "12", cy: "12", r: "3", key: "1v7zrd" }]
];
var Eye = createLucideIcon("eye", __iconNode10);

// node_modules/.pnpm/lucide-react@1.20.0_react@19.2.7/node_modules/lucide-react/dist/esm/icons/image.mjs
var __iconNode11 = [
  ["rect", { width: "18", height: "18", x: "3", y: "3", rx: "2", ry: "2", key: "1m3agn" }],
  ["circle", { cx: "9", cy: "9", r: "2", key: "af1f0g" }],
  ["path", { d: "m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21", key: "1xmnt7" }]
];
var Image = createLucideIcon("image", __iconNode11);

// node_modules/.pnpm/lucide-react@1.20.0_react@19.2.7/node_modules/lucide-react/dist/esm/icons/images.mjs
var __iconNode12 = [
  ["path", { d: "m22 11-1.296-1.296a2.4 2.4 0 0 0-3.408 0L11 16", key: "9kzy35" }],
  ["path", { d: "M4 8a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2", key: "1t0f0t" }],
  ["circle", { cx: "13", cy: "7", r: "1", fill: "currentColor", key: "1obus6" }],
  ["rect", { x: "8", y: "2", width: "14", height: "14", rx: "2", key: "1gvhby" }]
];
var Images = createLucideIcon("images", __iconNode12);

// node_modules/.pnpm/lucide-react@1.20.0_react@19.2.7/node_modules/lucide-react/dist/esm/icons/layout-grid.mjs
var __iconNode13 = [
  ["rect", { width: "7", height: "7", x: "3", y: "3", rx: "1", key: "1g98yp" }],
  ["rect", { width: "7", height: "7", x: "14", y: "3", rx: "1", key: "6d4xhi" }],
  ["rect", { width: "7", height: "7", x: "14", y: "14", rx: "1", key: "nxv5o0" }],
  ["rect", { width: "7", height: "7", x: "3", y: "14", rx: "1", key: "1bb6yr" }]
];
var LayoutGrid = createLucideIcon("layout-grid", __iconNode13);

// node_modules/.pnpm/lucide-react@1.20.0_react@19.2.7/node_modules/lucide-react/dist/esm/icons/link-2.mjs
var __iconNode14 = [
  ["path", { d: "M9 17H7A5 5 0 0 1 7 7h2", key: "8i5ue5" }],
  ["path", { d: "M15 7h2a5 5 0 1 1 0 10h-2", key: "1b9ql8" }],
  ["line", { x1: "8", x2: "16", y1: "12", y2: "12", key: "1jonct" }]
];
var Link2 = createLucideIcon("link-2", __iconNode14);

// node_modules/.pnpm/lucide-react@1.20.0_react@19.2.7/node_modules/lucide-react/dist/esm/icons/list-filter.mjs
var __iconNode15 = [
  ["path", { d: "M2 5h20", key: "1fs1ex" }],
  ["path", { d: "M6 12h12", key: "8npq4p" }],
  ["path", { d: "M9 19h6", key: "456am0" }]
];
var ListFilter = createLucideIcon("list-filter", __iconNode15);

// node_modules/.pnpm/lucide-react@1.20.0_react@19.2.7/node_modules/lucide-react/dist/esm/icons/lock-open.mjs
var __iconNode16 = [
  ["rect", { width: "18", height: "11", x: "3", y: "11", rx: "2", ry: "2", key: "1w4ew1" }],
  ["path", { d: "M7 11V7a5 5 0 0 1 9.9-1", key: "1mm8w8" }]
];
var LockOpen = createLucideIcon("lock-open", __iconNode16);

// node_modules/.pnpm/lucide-react@1.20.0_react@19.2.7/node_modules/lucide-react/dist/esm/icons/lock.mjs
var __iconNode17 = [
  ["rect", { width: "18", height: "11", x: "3", y: "11", rx: "2", ry: "2", key: "1w4ew1" }],
  ["path", { d: "M7 11V7a5 5 0 0 1 10 0v4", key: "fwvmzm" }]
];
var Lock = createLucideIcon("lock", __iconNode17);

// node_modules/.pnpm/lucide-react@1.20.0_react@19.2.7/node_modules/lucide-react/dist/esm/icons/map.mjs
var __iconNode18 = [
  [
    "path",
    {
      d: "M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0z",
      key: "169xi5"
    }
  ],
  ["path", { d: "M15 5.764v15", key: "1pn4in" }],
  ["path", { d: "M9 3.236v15", key: "1uimfh" }]
];
var Map2 = createLucideIcon("map", __iconNode18);

// node_modules/.pnpm/lucide-react@1.20.0_react@19.2.7/node_modules/lucide-react/dist/esm/icons/maximize-2.mjs
var __iconNode19 = [
  ["path", { d: "M15 3h6v6", key: "1q9fwt" }],
  ["path", { d: "m21 3-7 7", key: "1l2asr" }],
  ["path", { d: "m3 21 7-7", key: "tjx5ai" }],
  ["path", { d: "M9 21H3v-6", key: "wtvkvv" }]
];
var Maximize2 = createLucideIcon("maximize-2", __iconNode19);

// node_modules/.pnpm/lucide-react@1.20.0_react@19.2.7/node_modules/lucide-react/dist/esm/icons/monitor.mjs
var __iconNode20 = [
  ["rect", { width: "20", height: "14", x: "2", y: "3", rx: "2", key: "48i651" }],
  ["line", { x1: "8", x2: "16", y1: "21", y2: "21", key: "1svkeh" }],
  ["line", { x1: "12", x2: "12", y1: "17", y2: "21", key: "vw1qmm" }]
];
var Monitor = createLucideIcon("monitor", __iconNode20);

// node_modules/.pnpm/lucide-react@1.20.0_react@19.2.7/node_modules/lucide-react/dist/esm/icons/moon.mjs
var __iconNode21 = [
  [
    "path",
    {
      d: "M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401",
      key: "kfwtm"
    }
  ]
];
var Moon = createLucideIcon("moon", __iconNode21);

// node_modules/.pnpm/lucide-react@1.20.0_react@19.2.7/node_modules/lucide-react/dist/esm/icons/move-vertical.mjs
var __iconNode22 = [
  ["path", { d: "M12 2v20", key: "t6zp3m" }],
  ["path", { d: "m8 18 4 4 4-4", key: "bh5tu3" }],
  ["path", { d: "m8 6 4-4 4 4", key: "ybng9g" }]
];
var MoveVertical = createLucideIcon("move-vertical", __iconNode22);

// node_modules/.pnpm/lucide-react@1.20.0_react@19.2.7/node_modules/lucide-react/dist/esm/icons/pencil.mjs
var __iconNode23 = [
  [
    "path",
    {
      d: "M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z",
      key: "1a8usu"
    }
  ],
  ["path", { d: "m15 5 4 4", key: "1mk7zo" }]
];
var Pencil = createLucideIcon("pencil", __iconNode23);

// node_modules/.pnpm/lucide-react@1.20.0_react@19.2.7/node_modules/lucide-react/dist/esm/icons/plus.mjs
var __iconNode24 = [
  ["path", { d: "M5 12h14", key: "1ays0h" }],
  ["path", { d: "M12 5v14", key: "s699le" }]
];
var Plus = createLucideIcon("plus", __iconNode24);

// node_modules/.pnpm/lucide-react@1.20.0_react@19.2.7/node_modules/lucide-react/dist/esm/icons/rectangle-horizontal.mjs
var __iconNode25 = [
  ["rect", { width: "20", height: "12", x: "2", y: "6", rx: "2", key: "9lu3g6" }]
];
var RectangleHorizontal = createLucideIcon("rectangle-horizontal", __iconNode25);

// node_modules/.pnpm/lucide-react@1.20.0_react@19.2.7/node_modules/lucide-react/dist/esm/icons/refresh-cw.mjs
var __iconNode26 = [
  ["path", { d: "M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8", key: "v9h5vc" }],
  ["path", { d: "M21 3v5h-5", key: "1q7to0" }],
  ["path", { d: "M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16", key: "3uifl3" }],
  ["path", { d: "M8 16H3v5", key: "1cv678" }]
];
var RefreshCw = createLucideIcon("refresh-cw", __iconNode26);

// node_modules/.pnpm/lucide-react@1.20.0_react@19.2.7/node_modules/lucide-react/dist/esm/icons/ruler.mjs
var __iconNode27 = [
  [
    "path",
    {
      d: "M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.41 2.41 0 0 1 0-3.4l2.6-2.6a2.41 2.41 0 0 1 3.4 0Z",
      key: "icamh8"
    }
  ],
  ["path", { d: "m14.5 12.5 2-2", key: "inckbg" }],
  ["path", { d: "m11.5 9.5 2-2", key: "fmmyf7" }],
  ["path", { d: "m8.5 6.5 2-2", key: "vc6u1g" }],
  ["path", { d: "m17.5 15.5 2-2", key: "wo5hmg" }]
];
var Ruler = createLucideIcon("ruler", __iconNode27);

// node_modules/.pnpm/lucide-react@1.20.0_react@19.2.7/node_modules/lucide-react/dist/esm/icons/scan.mjs
var __iconNode28 = [
  ["path", { d: "M3 7V5a2 2 0 0 1 2-2h2", key: "aa7l1z" }],
  ["path", { d: "M17 3h2a2 2 0 0 1 2 2v2", key: "4qcy5o" }],
  ["path", { d: "M21 17v2a2 2 0 0 1-2 2h-2", key: "6vwrx8" }],
  ["path", { d: "M7 21H5a2 2 0 0 1-2-2v-2", key: "ioqczr" }]
];
var Scan = createLucideIcon("scan", __iconNode28);

// node_modules/.pnpm/lucide-react@1.20.0_react@19.2.7/node_modules/lucide-react/dist/esm/icons/search.mjs
var __iconNode29 = [
  ["path", { d: "m21 21-4.34-4.34", key: "14j7rj" }],
  ["circle", { cx: "11", cy: "11", r: "8", key: "4ej97u" }]
];
var Search = createLucideIcon("search", __iconNode29);

// node_modules/.pnpm/lucide-react@1.20.0_react@19.2.7/node_modules/lucide-react/dist/esm/icons/settings.mjs
var __iconNode30 = [
  [
    "path",
    {
      d: "M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915",
      key: "1i5ecw"
    }
  ],
  ["circle", { cx: "12", cy: "12", r: "3", key: "1v7zrd" }]
];
var Settings = createLucideIcon("settings", __iconNode30);

// node_modules/.pnpm/lucide-react@1.20.0_react@19.2.7/node_modules/lucide-react/dist/esm/icons/smartphone.mjs
var __iconNode31 = [
  ["rect", { width: "14", height: "20", x: "5", y: "2", rx: "2", ry: "2", key: "1yt0o3" }],
  ["path", { d: "M12 18h.01", key: "mhygvu" }]
];
var Smartphone = createLucideIcon("smartphone", __iconNode31);

// node_modules/.pnpm/lucide-react@1.20.0_react@19.2.7/node_modules/lucide-react/dist/esm/icons/square-check-big.mjs
var __iconNode32 = [
  [
    "path",
    { d: "M21 10.656V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h12.344", key: "2acyp4" }
  ],
  ["path", { d: "m9 11 3 3L22 4", key: "1pflzl" }]
];
var SquareCheckBig = createLucideIcon("square-check-big", __iconNode32);

// node_modules/.pnpm/lucide-react@1.20.0_react@19.2.7/node_modules/lucide-react/dist/esm/icons/square-dashed.mjs
var __iconNode33 = [
  ["path", { d: "M5 3a2 2 0 0 0-2 2", key: "y57alp" }],
  ["path", { d: "M19 3a2 2 0 0 1 2 2", key: "18rm91" }],
  ["path", { d: "M21 19a2 2 0 0 1-2 2", key: "1j7049" }],
  ["path", { d: "M5 21a2 2 0 0 1-2-2", key: "sbafld" }],
  ["path", { d: "M9 3h1", key: "1yesri" }],
  ["path", { d: "M9 21h1", key: "15o7lz" }],
  ["path", { d: "M14 3h1", key: "1ec4yj" }],
  ["path", { d: "M14 21h1", key: "v9vybs" }],
  ["path", { d: "M3 9v1", key: "1r0deq" }],
  ["path", { d: "M21 9v1", key: "mxsmne" }],
  ["path", { d: "M3 14v1", key: "vnatye" }],
  ["path", { d: "M21 14v1", key: "169vum" }]
];
var SquareDashed = createLucideIcon("square-dashed", __iconNode33);

// node_modules/.pnpm/lucide-react@1.20.0_react@19.2.7/node_modules/lucide-react/dist/esm/icons/square-mouse-pointer.mjs
var __iconNode34 = [
  [
    "path",
    {
      d: "M12.034 12.681a.498.498 0 0 1 .647-.647l9 3.5a.5.5 0 0 1-.033.943l-3.444 1.068a1 1 0 0 0-.66.66l-1.067 3.443a.5.5 0 0 1-.943.033z",
      key: "xwnzip"
    }
  ],
  ["path", { d: "M21 11V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h6", key: "14rsvq" }]
];
var SquareMousePointer = createLucideIcon("square-mouse-pointer", __iconNode34);

// node_modules/.pnpm/lucide-react@1.20.0_react@19.2.7/node_modules/lucide-react/dist/esm/icons/sticky-note.mjs
var __iconNode35 = [
  [
    "path",
    {
      d: "M21 9a2.4 2.4 0 0 0-.706-1.706l-3.588-3.588A2.4 2.4 0 0 0 15 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2z",
      key: "1dfntj"
    }
  ],
  ["path", { d: "M15 3v5a1 1 0 0 0 1 1h5", key: "6s6qgf" }]
];
var StickyNote = createLucideIcon("sticky-note", __iconNode35);

// node_modules/.pnpm/lucide-react@1.20.0_react@19.2.7/node_modules/lucide-react/dist/esm/icons/sun.mjs
var __iconNode36 = [
  ["circle", { cx: "12", cy: "12", r: "4", key: "4exip2" }],
  ["path", { d: "M12 2v2", key: "tus03m" }],
  ["path", { d: "M12 20v2", key: "1lh1kg" }],
  ["path", { d: "m4.93 4.93 1.41 1.41", key: "149t6j" }],
  ["path", { d: "m17.66 17.66 1.41 1.41", key: "ptbguv" }],
  ["path", { d: "M2 12h2", key: "1t8f8n" }],
  ["path", { d: "M20 12h2", key: "1q8mjw" }],
  ["path", { d: "m6.34 17.66-1.41 1.41", key: "1m8zz5" }],
  ["path", { d: "m19.07 4.93-1.41 1.41", key: "1shlcs" }]
];
var Sun = createLucideIcon("sun", __iconNode36);

// node_modules/.pnpm/lucide-react@1.20.0_react@19.2.7/node_modules/lucide-react/dist/esm/icons/trash-2.mjs
var __iconNode37 = [
  ["path", { d: "M10 11v6", key: "nco0om" }],
  ["path", { d: "M14 11v6", key: "outv1u" }],
  ["path", { d: "M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6", key: "miytrc" }],
  ["path", { d: "M3 6h18", key: "d0wm0j" }],
  ["path", { d: "M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2", key: "e791ji" }]
];
var Trash2 = createLucideIcon("trash-2", __iconNode37);

// node_modules/.pnpm/lucide-react@1.20.0_react@19.2.7/node_modules/lucide-react/dist/esm/icons/type.mjs
var __iconNode38 = [
  ["path", { d: "M12 4v16", key: "1654pz" }],
  ["path", { d: "M4 7V5a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v2", key: "e0r10z" }],
  ["path", { d: "M9 20h6", key: "s66wpe" }]
];
var Type = createLucideIcon("type", __iconNode38);

// node_modules/.pnpm/lucide-react@1.20.0_react@19.2.7/node_modules/lucide-react/dist/esm/icons/upload.mjs
var __iconNode39 = [
  ["path", { d: "M12 3v12", key: "1x0j5s" }],
  ["path", { d: "m17 8-5-5-5 5", key: "7q97r8" }],
  ["path", { d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4", key: "ih7n3h" }]
];
var Upload = createLucideIcon("upload", __iconNode39);

// node_modules/.pnpm/lucide-react@1.20.0_react@19.2.7/node_modules/lucide-react/dist/esm/icons/x.mjs
var __iconNode40 = [
  ["path", { d: "M18 6 6 18", key: "1bl5f8" }],
  ["path", { d: "m6 6 12 12", key: "d8bk6v" }]
];
var X = createLucideIcon("x", __iconNode40);

// src/react-shell/review/df.logo.tsx
var import_jsx_runtime = require("react/jsx-runtime");
var DfLogoIcon = () => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
  "svg",
  {
    className: "df-review-brand-icon",
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 54.062 38.381",
    "aria-hidden": "true",
    focusable: "false",
    children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "rect",
        {
          width: "4.787",
          height: "4.787",
          transform: "translate(49.276)",
          fill: "currentColor"
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "path",
        {
          d: "M25.337,12.329a15.036,15.036,0,1,0,0,21.866v4.186h4.787V0H25.337V12.329ZM15.033,33.5A10.236,10.236,0,1,1,25.27,23.265,10.249,10.249,0,0,1,15.033,33.5Z",
          fill: "currentColor"
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "path",
        {
          d: "M72.092,0H67.3V38.314h4.792V23.939H86.5V19.152H72.092Z",
          transform: "translate(-32.436)",
          fill: "currentColor"
        }
      )
    ]
  }
);

// src/react-shell/env.ts
var REVIEW_SOURCE_EDITORS = [
  "vscode",
  "cursor",
  "webstorm",
  "custom"
];
var getInjectedSourceRoot = () => typeof __DF_WRK_REVIEW_SOURCE_ROOT__ === "undefined" ? void 0 : __DF_WRK_REVIEW_SOURCE_ROOT__;
var getInjectedSourceEditor = () => typeof __DF_WRK_REVIEW_SOURCE_EDITOR__ === "undefined" ? void 0 : __DF_WRK_REVIEW_SOURCE_EDITOR__;
var getInjectedSourceUrlTemplate = () => typeof __DF_WRK_REVIEW_SOURCE_URL_TEMPLATE__ === "undefined" ? void 0 : __DF_WRK_REVIEW_SOURCE_URL_TEMPLATE__;
var getRuntimeEnv = () => ({
  VITE_REVIEW_SOURCE_EDITOR: getInjectedSourceEditor(),
  VITE_REVIEW_SOURCE_ROOT: getInjectedSourceRoot(),
  VITE_REVIEW_SOURCE_URL_TEMPLATE: getInjectedSourceUrlTemplate()
});
var getEnvString = (env, key) => {
  const value = env[key];
  return typeof value === "string" && value.trim() ? value.trim() : void 0;
};
var getEnvSourceEditor = (env) => {
  const value = getEnvString(env, "VITE_REVIEW_SOURCE_EDITOR");
  return REVIEW_SOURCE_EDITORS.includes(value) ? value : void 0;
};
var resolveReviewSourceOptions = ({
  sourceInspector,
  sourceRoot
}) => {
  const env = getRuntimeEnv();
  const envSourceRoot = getEnvString(env, "VITE_REVIEW_SOURCE_ROOT");
  const envSourceEditor = getEnvSourceEditor(env);
  const envUrlTemplate = getEnvString(env, "VITE_REVIEW_SOURCE_URL_TEMPLATE");
  const resolvedSourceInspector = sourceInspector || envSourceEditor || envUrlTemplate ? {
    ...sourceInspector,
    ...envSourceEditor ? { editor: envSourceEditor } : {},
    ...envUrlTemplate ? { urlTemplate: envUrlTemplate } : {}
  } : sourceInspector;
  return {
    sourceInspector: resolvedSourceInspector,
    sourceRoot: envSourceRoot ?? sourceRoot
  };
};

// src/figma/image.types.ts
var DEFAULT_REVIEW_FIGMA_IMAGE_FORMAT = "webp";

// src/react-shell/constants.ts
var REVIEW_QA_FILTERS = [
  { key: "all", label: "All" },
  { key: "mobile", label: "Mobile", scope: "mobile" },
  { key: "tablet", label: "Tablet", scope: "tablet" },
  { key: "desktop", label: "Desktop", scope: "desktop" },
  { key: "wide", label: "Wide", scope: "wide" }
];
var FIGMA_OVERLAY_UNAVAILABLE_MESSAGE = "\uD53C\uADF8\uB9C8 \uC624\uBC84\uB808\uC774 \uB514\uBC84\uAE45\uC774 \uC548\uB418\uB294 \uD574\uC0C1\uB3C4";
var FIGMA_TOKEN_STORAGE_KEY = "figma-token";
var REVIEW_USER_ID_STORAGE_KEY = "user-id";
var REVIEW_THEME_STORAGE_KEY = "df-review-theme";
var REVIEW_SIDE_PANEL_STORAGE_KEY = "df-review-side-panel";
var REVIEW_SIDE_PANEL_VISIBLE_STORAGE_KEY = "df-review-side-panel-visible";
var REVIEW_SOURCE_TREE_FILTER_STORAGE_KEY = "df-review-source-tree-filter";
var REVIEW_SOURCE_TREE_META_STORAGE_KEY = "df-review-source-tree-meta-visibility";
var REVIEW_QA_STATUS_FILTER_STORAGE_KEY = "df-review-qa-status-filter";
var DEFAULT_REVIEW_THEME = "dark";
var FIGMA_TOKEN_GUIDE_ID = "df-review-figma-token-guide";
var DEFAULT_INITIAL_REVIEW_PROMPT = "You are fixing QA issues collected with df-web-review-kit. Use the copied QA prompt as the source of truth for page, viewport, selector, DOM metadata, coordinates, and user comment. Make the smallest code or CSS change that fixes the issue, preserve unrelated behavior, then verify the target viewport again.";
var REVIEW_THEME_OPTIONS = [
  { value: "dark", label: "Dark" },
  { value: "light", label: "Light" },
  { value: "system", label: "System" }
];

// src/react-shell/route.ts
var DEFAULT_REVIEW_PATH_PREFIX = "/review";
var normalizeReviewPathPrefix = (value) => {
  const raw = value.trim() || DEFAULT_REVIEW_PATH_PREFIX;
  const prefix = raw.startsWith("/") ? raw : `/${raw}`;
  return prefix.length > 1 && prefix.endsWith("/") ? prefix.slice(0, -1) : prefix;
};
var normalizeTarget = (value, reviewPathPrefix = DEFAULT_REVIEW_PATH_PREFIX) => {
  const raw = value.trim() || "/";
  const { hash, path, search } = splitTarget(raw);
  const normalized = path.startsWith("/") ? path : `/${path}`;
  const reviewPrefix = normalizeReviewPathPrefix(reviewPathPrefix);
  const normalizedPath = normalized === reviewPrefix || normalized.startsWith(`${reviewPrefix}/`) ? "/" : normalized;
  return `${normalizedPath}${search}${hash}`;
};
var getTargetRouteKey = (value, reviewPathPrefix = DEFAULT_REVIEW_PATH_PREFIX) => {
  const { path } = splitTarget(normalizeTarget(value, reviewPathPrefix));
  return path || "/";
};
var parseReviewAddressInput = (value, reviewPathPrefix = DEFAULT_REVIEW_PATH_PREFIX) => {
  const raw = value.trim();
  if (!raw) return { target: "/" };
  const parsedUrl = parseSameOriginUrl(raw);
  if (!parsedUrl) {
    return { target: normalizeTarget(raw, reviewPathPrefix) };
  }
  const reviewPrefix = normalizeReviewPathPrefix(reviewPathPrefix);
  const isReviewUrl = parsedUrl.pathname === reviewPrefix || parsedUrl.pathname.startsWith(`${reviewPrefix}/`);
  if (!isReviewUrl) {
    return {
      target: normalizeTarget(
        `${parsedUrl.pathname}${parsedUrl.search}${parsedUrl.hash}`,
        reviewPathPrefix
      )
    };
  }
  const source = parsedUrl.searchParams.get("source")?.trim();
  return {
    height: getPositiveParamNumber(parsedUrl.searchParams, "h"),
    itemId: parsedUrl.searchParams.get("item"),
    source: source ? source : void 0,
    target: normalizeTarget(
      parsedUrl.searchParams.get("target") ?? "/",
      reviewPathPrefix
    ),
    width: getPositiveParamNumber(parsedUrl.searchParams, "w")
  };
};
function parseSameOriginUrl(value) {
  if (typeof window === "undefined") return null;
  try {
    const url = new URL(value, window.location.origin);
    return url.origin === window.location.origin ? url : null;
  } catch {
    return null;
  }
}
function getPositiveParamNumber(params, name) {
  const value = Number(params.get(name));
  return Number.isFinite(value) && value > 0 ? value : void 0;
}
var getInitialTarget = (reviewPathPrefix = DEFAULT_REVIEW_PATH_PREFIX) => {
  if (typeof window === "undefined") return "/";
  const target = new URLSearchParams(window.location.search).get("target");
  return target ? normalizeTarget(target, reviewPathPrefix) : "/";
};
var buildTargetSrc = (target) => {
  const url = new URL(target || "/", window.location.origin);
  url.searchParams.set("__dfwr_target", "1");
  return `${url.pathname}${url.search}${url.hash}`;
};
var getFrameRouteTarget = (targetWindow, reviewPathPrefix) => {
  return normalizeTarget(targetWindow.location.pathname, reviewPathPrefix);
};
var updateShellUrl = (target, size, source) => {
  const url = new URL(window.location.href);
  url.searchParams.set("target", target);
  url.searchParams.set("w", String(size.width));
  url.searchParams.set("h", String(size.height));
  if (source !== "local") {
    url.searchParams.set("source", source);
  } else {
    url.searchParams.delete("source");
  }
  url.searchParams.delete("item");
  url.searchParams.delete("panel");
  window.history.replaceState(null, "", `${url.pathname}${url.search}`);
};
var updateShellUrlForItem = (target, size, itemId, source) => {
  const url = getShellUrlForItem(target, size, itemId, source);
  window.history.replaceState(null, "", `${url.pathname}${url.search}`);
};
var getShellUrlForItem = (target, size, itemId, source) => {
  const url = new URL(window.location.href);
  url.searchParams.set("target", target);
  url.searchParams.set("w", String(size.width));
  url.searchParams.set("h", String(size.height));
  url.searchParams.set("item", itemId);
  url.searchParams.set("panel", "qa");
  if (source !== "local") {
    url.searchParams.set("source", source);
  } else {
    url.searchParams.delete("source");
  }
  return url;
};
var getInitialItemId = () => {
  if (typeof window === "undefined") return null;
  return new URLSearchParams(window.location.search).get("item");
};
var getInitialSource = (remoteSource) => {
  if (typeof window === "undefined" || !remoteSource) return "local";
  return new URLSearchParams(window.location.search).get("source") === remoteSource ? remoteSource : "local";
};
var getItemTarget = (item, reviewPathPrefix = DEFAULT_REVIEW_PATH_PREFIX) => {
  if (item.routeKey) return getTargetRouteKey(item.routeKey, reviewPathPrefix);
  if (item.normalizedPath) {
    return getTargetRouteKey(item.normalizedPath, reviewPathPrefix);
  }
  try {
    return getTargetRouteKey(new URL(item.pageUrl).pathname, reviewPathPrefix);
  } catch {
    return "/";
  }
};
var getItemFrameTarget = (item, reviewPathPrefix = DEFAULT_REVIEW_PATH_PREFIX) => {
  const routeTarget = getItemTarget(item, reviewPathPrefix);
  const originalTarget = getItemUrlTarget(item.originalUrl, reviewPathPrefix);
  if (originalTarget && getTargetRouteKey(originalTarget, reviewPathPrefix) === routeTarget) {
    return originalTarget;
  }
  const pageTarget = getItemUrlTarget(item.pageUrl, reviewPathPrefix);
  if (pageTarget && getTargetRouteKey(pageTarget, reviewPathPrefix) === routeTarget) {
    return pageTarget;
  }
  return routeTarget;
};
function splitTarget(value) {
  const hashIndex = value.indexOf("#");
  const beforeHash = hashIndex >= 0 ? value.slice(0, hashIndex) : value;
  const hash = hashIndex >= 0 ? value.slice(hashIndex) : "";
  const searchIndex = beforeHash.indexOf("?");
  const path = searchIndex >= 0 ? beforeHash.slice(0, searchIndex) : beforeHash;
  const search = searchIndex >= 0 ? beforeHash.slice(searchIndex) : "";
  return {
    hash,
    path: path || "/",
    search
  };
}
function getItemUrlTarget(value, reviewPathPrefix) {
  if (!value) return null;
  if (typeof window === "undefined") return null;
  try {
    const url = new URL(value, window.location.origin);
    if (url.origin !== window.location.origin) return null;
    return normalizeTarget(
      `${url.pathname}${url.search}${url.hash}`,
      reviewPathPrefix
    );
  } catch {
    return null;
  }
}

// src/react-shell/viewport.ts
var DEFAULT_REVIEW_VIEWPORT_PRESETS = [
  { label: "Mobile", width: 390, height: 720, kind: "mobile" },
  { label: "Tablet", width: 768, height: 1024, kind: "tablet" },
  { label: "Desktop", width: 1440, height: 900, kind: "desktop" },
  { label: "Wide", width: 1980, height: 1080, kind: "wide" }
];
var getFallbackPreset = (presets) => presets[0] ?? DEFAULT_REVIEW_VIEWPORT_PRESETS[0];
var getViewportPresetDistance = (preset, width, height) => Math.abs(preset.width - width) + Math.abs(preset.height - height);
var findViewportPreset = (presets, width, height) => {
  const fallback = getFallbackPreset(presets);
  const exact = presets.find(
    (preset) => preset.width === width && preset.height === height
  );
  if (exact) return exact;
  return presets.reduce((closest, preset) => {
    const closestDistance = getViewportPresetDistance(closest, width, height);
    const presetDistance = getViewportPresetDistance(preset, width, height);
    return presetDistance < closestDistance ? preset : closest;
  }, fallback);
};
var getInitialSize = (presets) => {
  if (typeof window === "undefined") return getFallbackPreset(presets);
  const params = new URLSearchParams(window.location.search);
  const width = Number(params.get("w"));
  const height = Number(params.get("h"));
  if (Number.isFinite(width) && Number.isFinite(height) && width > 0 && height > 0) {
    return findViewportPreset(presets, width, height);
  }
  return getFallbackPreset(presets);
};
var getRestoredSize = (item, presets) => findViewportPreset(
  presets,
  Math.max(
    240,
    Math.round(item.viewport?.width ?? getFallbackPreset(presets).width)
  ),
  Math.max(
    320,
    Math.round(item.viewport?.height ?? getFallbackPreset(presets).height)
  )
);
var getViewportPresetKind = (preset) => {
  if (preset.kind) return preset.kind;
  const label = preset.label.toLowerCase();
  if (label.includes("mobile") || label.includes("phone")) return "mobile";
  if (label.includes("tablet") || label.includes("pad")) return "tablet";
  if (label.includes("wide") || label.includes("1980") || label.includes("1940") || label.includes("1920")) {
    return "wide";
  }
  if (label.includes("desktop")) return "desktop";
  if (preset.width >= 1800) return "wide";
  if (preset.width >= 1e3) return "desktop";
  if (preset.width >= 700) return "tablet";
  return "mobile";
};
var toReviewViewportPresets = (presets) => presets.map((preset) => ({
  label: preset.label,
  width: preset.width,
  height: preset.height,
  scope: getViewportPresetKind(preset),
  designWidth: preset.designWidth,
  designHeight: preset.designHeight
}));
var getIsFigmaOverlayAvailable = (preset) => {
  const kind = getViewportPresetKind(preset);
  return kind === "mobile" || kind === "wide";
};

// src/react-shell/prompt/modal.tsx
var import_jsx_runtime2 = require("react/jsx-runtime");
var ABOUT_SECTIONS = [
  {
    title: "What this is",
    body: "df-web-review-kit is a project-embedded review shell. It mounts a /review page, opens real host pages in an iframe, and lets reviewers create QA notes, area markers, and DOM markers against the actual implementation instead of a separate screenshot tool."
  },
  {
    title: "How to setup",
    body: "Install the package, mount the review route in the host project, and choose the storage adapters for that project. Local drafts work by default; shared remote QA and realtime presence depend on the host project configuration."
  },
  {
    title: "Figma token",
    body: "Add a browser-safe Figma token in Settings only when the host page already supports the Figma overlay helper. The package stores it in localStorage as figma-token and does not own a server-side Figma integration."
  },
  {
    title: "User ID",
    body: "Set your User ID in Settings before reviewing. It is used for presence, online user pills, and author context so teammates can tell who is looking at the same project or route."
  },
  {
    title: "Remote",
    body: "Remote QA is optional and project-specific. If you need shared canonical items, Supabase, or realtime presence, ask the project owner or \uB2F4\uB2F9 \uAC1C\uBC1C\uC790 which remote adapter and browser-safe env values are connected. Never put service_role or operator secrets in the browser."
  }
];
var PromptModal = ({ onClose }) => {
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(
    "div",
    {
      "aria-label": "Review help",
      "aria-modal": "true",
      className: "df-review-prompt-modal",
      role: "dialog",
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
          "button",
          {
            "aria-label": "Close help",
            className: "df-review-prompt-backdrop",
            type: "button",
            onClick: onClose
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "df-review-prompt-dialog df-review-about-dialog", children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
            "button",
            {
              "aria-label": "Close help",
              className: "df-review-about-close",
              type: "button",
              onClick: onClose,
              children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(X, { "aria-hidden": "true" })
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "df-review-about-body", children: [
            /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "df-review-about-intro", children: [
              /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "df-review-about-logo", "aria-hidden": "true", children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(DfLogoIcon, {}) }),
              /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("strong", { children: "Review shell help" }),
              /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { children: "Program overview and setup notes" })
            ] }),
            ABOUT_SECTIONS.map((section) => /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "df-review-about-item", children: [
              /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("strong", { children: section.title }),
              /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("p", { children: section.body })
            ] }, section.title))
          ] })
        ] })
      ]
    }
  );
};

// src/react-shell/prompt/prompt.ts
var getItemTitle = (item) => item.title || item.comment.split("\n")[0] || item.kind;
var getItemAssigneeLabel = (item) => item.assigneeName || item.assigneeId || "(none)";
var formatPromptViewport = (item) => `${Math.round(item.viewport?.width ?? 0)}x${Math.round(
  item.viewport?.height ?? 0
)}`;
var formatPromptPoint = (point) => point ? `x=${Math.round(point.x)}, y=${Math.round(point.y)}` : "(none)";
var formatPromptSelection = (selection) => {
  if (!selection) return "(none)";
  const x = "x" in selection ? selection.x : selection.left;
  const y = "y" in selection ? selection.y : selection.top;
  return `x=${Math.round(x ?? 0)}, y=${Math.round(y ?? 0)}, width=${Math.round(
    selection.width
  )}, height=${Math.round(selection.height)}`;
};
var decodePromptHtmlEntities = (value) => value.replace(
  /&(#\d+|#x[\da-f]+|lt|gt|quot|apos|amp);/gi,
  (match, entity) => {
    const normalized = entity.toLowerCase();
    if (normalized === "lt") return "<";
    if (normalized === "gt") return ">";
    if (normalized === "quot") return '"';
    if (normalized === "apos") return "'";
    if (normalized === "amp") return "&";
    const codePoint = normalized.startsWith("#x") ? Number.parseInt(normalized.slice(2), 16) : Number.parseInt(normalized.slice(1), 10);
    return Number.isFinite(codePoint) ? String.fromCodePoint(codePoint) : match;
  }
);
var getPromptAnchorCandidates = (item) => {
  const anchor = item.anchor;
  if (!anchor) return [];
  const seen = /* @__PURE__ */ new Set();
  return [anchor, ...anchor.candidates ?? []].filter((candidate) => {
    const key = `${candidate.strategy}:${candidate.selector}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};
var formatPromptSourceHint = (item) => {
  const source = item.anchor?.source;
  if (!source) return "(none)";
  return [
    `Component: ${source.component ?? "(unknown)"}`,
    `File: ${source.file ?? "(unknown)"}`,
    `Line: ${source.line ?? "(unknown)"}`,
    `Column: ${source.column ?? "(unknown)"}`,
    `Section index: ${source.sectionIndex ?? "(unknown)"}`,
    `Section id: ${source.sectionId ?? "(none)"}`
  ].join("\n");
};
var buildReviewItemPrompt = (numberedItem, reviewPathPrefix) => {
  const { item } = numberedItem;
  const anchor = item.anchor;
  const candidates = getPromptAnchorCandidates(item);
  const candidateLines = candidates.length > 0 ? candidates.map((candidate, index) => {
    const confidence = typeof candidate.confidence === "number" ? `, confidence=${Math.round(candidate.confidence * 100)}%` : "";
    const fingerprint = candidate.textFingerprint ? `, text="${candidate.textFingerprint}"` : "";
    return `${index + 1}. ${candidate.selector} (${candidate.strategy}${confidence}${fingerprint})`;
  }).join("\n") : "(none)";
  return [
    "Fix this df-web-review-kit QA issue.",
    "",
    `Page: ${getItemTarget(item, reviewPathPrefix)}`,
    `URL: ${item.originalUrl ?? item.pageUrl}`,
    `QA item: ${numberedItem.displayLabel}`,
    `Title: ${item.title?.trim() || "(none)"}`,
    `Assignee: ${getItemAssigneeLabel(item)}`,
    `Viewport: ${numberedItem.label} ${formatPromptViewport(item)}`,
    `Scroll: ${formatPromptPoint(item.scroll)}`,
    "",
    "Target:",
    `Primary selector: ${anchor?.selector ?? "(missing)"}`,
    `Primary strategy: ${anchor?.strategy ?? "(missing)"}`,
    `Text fingerprint: ${anchor?.textFingerprint ?? "(none)"}`,
    "Selector candidates:",
    candidateLines,
    "",
    "Source hint:",
    formatPromptSourceHint(item),
    "",
    `Marker: ${formatPromptPoint(item.marker?.viewport)}`,
    `Marker relative: ${formatPromptPoint(item.marker?.relative)}`,
    `Selection: ${formatPromptSelection(item.selection?.viewport)}`,
    `Selection relative: ${formatPromptSelection(item.selection?.relative)}`,
    "",
    "Element HTML snippet:",
    "```html",
    anchor?.htmlSnippet ? decodePromptHtmlEntities(anchor.htmlSnippet) : "(not available)",
    "```",
    "",
    "Issue comment:",
    item.comment,
    "",
    "Request:",
    "Find the target element with the selector candidates above and apply the smallest UI/CSS/code change that fixes this QA issue. If the selector is missing because CSR or hydration has not finished, wait for the page to load and use the Source hint first. Preserve unrelated layout and behavior."
  ].join("\n");
};
var getPromptLengthLabel = (value) => {
  const length = value.length;
  if (length <= 2e3) return `${length} chars / Discord 2,000 OK`;
  if (length <= 4e3) return `${length} chars / Nitro 4,000 OK`;
  return `${length} chars / attach as file`;
};

// src/react-shell/prompt/initial.modal.tsx
var import_jsx_runtime3 = require("react/jsx-runtime");
var InitialPromptModal = ({
  initialPromptText,
  copiedPromptKey,
  onClose,
  onCopyPrompt
}) => {
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
    "div",
    {
      "aria-label": "Initial prompt",
      "aria-modal": "true",
      className: "df-review-prompt-modal",
      role: "dialog",
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
          "button",
          {
            "aria-label": "Close initial prompt",
            className: "df-review-prompt-backdrop",
            type: "button",
            onClick: onClose
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "df-review-prompt-dialog df-review-prompt-dialog-narrow", children: [
          /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "df-review-prompt-header", children: [
            /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { children: [
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("strong", { children: "Initial Prompt" }),
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { children: "AI handoff script for coding agents" })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
              "button",
              {
                "aria-label": "Close initial prompt",
                type: "button",
                onClick: onClose,
                children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(X, { "aria-hidden": "true" })
              }
            )
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "df-review-prompt-body", children: /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
            "section",
            {
              className: "df-review-prompt-block",
              "aria-labelledby": "df-review-initial-prompt-title",
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "df-review-prompt-block-header", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { children: [
                    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("strong", { id: "df-review-initial-prompt-title", children: "QA handoff prompt" }),
                    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { children: getPromptLengthLabel(initialPromptText) })
                  ] }),
                  /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
                    "button",
                    {
                      disabled: !initialPromptText,
                      type: "button",
                      onClick: () => onCopyPrompt(initialPromptText, "initial"),
                      children: [
                        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Copy, { "aria-hidden": "true" }),
                        copiedPromptKey === "initial" ? "Copied" : "Copy"
                      ]
                    }
                  )
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
                  "textarea",
                  {
                    readOnly: true,
                    "aria-label": "Initial Prompt content",
                    value: initialPromptText || "Initial prompt is not configured."
                  }
                )
              ]
            }
          ) })
        ] })
      ]
    }
  );
};

// src/react-shell/settings.ts
var DEFAULT_SOURCE_TREE_META_VISIBILITY = {
  box: true,
  font: true,
  media: true,
  className: false
};
var REVIEW_QA_STATUS_FILTER_VALUES = /* @__PURE__ */ new Set([
  "all",
  "todo",
  "doing",
  "review",
  "hold",
  "done"
]);
var normalizeReviewTheme = (value) => value === "light" || value === "system" || value === "dark" ? value : DEFAULT_REVIEW_THEME;
var normalizeReviewSidePanel = (value) => {
  if (value === "qa" || value === "source" || value === "figma-images") {
    return value;
  }
  return null;
};
var normalizeStoredReviewSidePanel = (value) => normalizeReviewSidePanel(value) ?? "qa";
var normalizeStoredReviewQaStatusFilter = (value) => value && REVIEW_QA_STATUS_FILTER_VALUES.has(value) ? value : "all";
var normalizeStoredSourceTreeMetaVisibility = (value) => {
  if (!value || typeof value !== "object") {
    return DEFAULT_SOURCE_TREE_META_VISIBILITY;
  }
  const metaVisibility = value;
  return {
    box: typeof metaVisibility.box === "boolean" ? metaVisibility.box : DEFAULT_SOURCE_TREE_META_VISIBILITY.box,
    font: typeof metaVisibility.font === "boolean" ? metaVisibility.font : DEFAULT_SOURCE_TREE_META_VISIBILITY.font,
    media: typeof metaVisibility.media === "boolean" ? metaVisibility.media : DEFAULT_SOURCE_TREE_META_VISIBILITY.media,
    className: typeof metaVisibility.className === "boolean" ? metaVisibility.className : DEFAULT_SOURCE_TREE_META_VISIBILITY.className
  };
};
var getStoredFigmaToken = () => {
  if (typeof window === "undefined") return "";
  try {
    return window.localStorage.getItem(FIGMA_TOKEN_STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
};
var writeStoredFigmaToken = (token) => {
  if (typeof window === "undefined") return;
  try {
    if (token) {
      window.localStorage.setItem(FIGMA_TOKEN_STORAGE_KEY, token);
    } else {
      window.localStorage.removeItem(FIGMA_TOKEN_STORAGE_KEY);
    }
  } catch {
    return;
  }
};
var getStoredReviewUserId = () => {
  if (typeof window === "undefined") return "";
  try {
    return window.localStorage.getItem(REVIEW_USER_ID_STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
};
var writeStoredReviewUserId = (userId) => {
  if (typeof window === "undefined") return;
  try {
    if (userId) {
      window.localStorage.setItem(REVIEW_USER_ID_STORAGE_KEY, userId);
    } else {
      window.localStorage.removeItem(REVIEW_USER_ID_STORAGE_KEY);
    }
  } catch {
    return;
  }
};
var getStoredReviewTheme = () => {
  if (typeof window === "undefined") return DEFAULT_REVIEW_THEME;
  try {
    return normalizeReviewTheme(
      window.localStorage.getItem(REVIEW_THEME_STORAGE_KEY)
    );
  } catch {
    return DEFAULT_REVIEW_THEME;
  }
};
var writeStoredReviewTheme = (theme) => {
  if (typeof window === "undefined") return;
  try {
    if (theme === DEFAULT_REVIEW_THEME) {
      window.localStorage.removeItem(REVIEW_THEME_STORAGE_KEY);
    } else {
      window.localStorage.setItem(REVIEW_THEME_STORAGE_KEY, theme);
    }
  } catch {
    return;
  }
};
var getStoredReviewSidePanel = () => {
  if (typeof window === "undefined") return "qa";
  try {
    return normalizeStoredReviewSidePanel(
      window.localStorage.getItem(REVIEW_SIDE_PANEL_STORAGE_KEY)
    );
  } catch {
    return "qa";
  }
};
var getInitialReviewSidePanel = () => {
  if (typeof window === "undefined") return null;
  try {
    return normalizeReviewSidePanel(
      new URLSearchParams(window.location.search).get("panel")
    );
  } catch {
    return null;
  }
};
var writeStoredReviewSidePanel = (sidePanel) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      REVIEW_SIDE_PANEL_STORAGE_KEY,
      normalizeStoredReviewSidePanel(sidePanel)
    );
  } catch {
    return;
  }
};
var getStoredReviewSidePanelVisible = () => {
  if (typeof window === "undefined") return true;
  try {
    const value = window.localStorage.getItem(
      REVIEW_SIDE_PANEL_VISIBLE_STORAGE_KEY
    );
    return value === null ? true : value === "true";
  } catch {
    return true;
  }
};
var writeStoredReviewSidePanelVisible = (isVisible) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      REVIEW_SIDE_PANEL_VISIBLE_STORAGE_KEY,
      isVisible ? "true" : "false"
    );
  } catch {
    return;
  }
};
var getStoredReviewQaStatusFilter = () => {
  if (typeof window === "undefined") return "all";
  try {
    return normalizeStoredReviewQaStatusFilter(
      window.localStorage.getItem(REVIEW_QA_STATUS_FILTER_STORAGE_KEY)
    );
  } catch {
    return "all";
  }
};
var writeStoredReviewQaStatusFilter = (filter) => {
  if (typeof window === "undefined") return;
  try {
    const normalizedFilter = normalizeStoredReviewQaStatusFilter(filter);
    if (normalizedFilter === "all") {
      window.localStorage.removeItem(REVIEW_QA_STATUS_FILTER_STORAGE_KEY);
    } else {
      window.localStorage.setItem(
        REVIEW_QA_STATUS_FILTER_STORAGE_KEY,
        normalizedFilter
      );
    }
  } catch {
    return;
  }
};
var getStoredSourceTreeFilter = () => {
  if (typeof window === "undefined") return "";
  try {
    return window.localStorage.getItem(REVIEW_SOURCE_TREE_FILTER_STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
};
var writeStoredSourceTreeFilter = (filter) => {
  if (typeof window === "undefined") return;
  try {
    if (filter) {
      window.localStorage.setItem(REVIEW_SOURCE_TREE_FILTER_STORAGE_KEY, filter);
    } else {
      window.localStorage.removeItem(REVIEW_SOURCE_TREE_FILTER_STORAGE_KEY);
    }
  } catch {
    return;
  }
};
var getStoredSourceTreeMetaVisibility = () => {
  if (typeof window === "undefined") return DEFAULT_SOURCE_TREE_META_VISIBILITY;
  try {
    const value = window.localStorage.getItem(
      REVIEW_SOURCE_TREE_META_STORAGE_KEY
    );
    if (!value) return DEFAULT_SOURCE_TREE_META_VISIBILITY;
    return normalizeStoredSourceTreeMetaVisibility(JSON.parse(value));
  } catch {
    return DEFAULT_SOURCE_TREE_META_VISIBILITY;
  }
};
var writeStoredSourceTreeMetaVisibility = (metaVisibility) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      REVIEW_SOURCE_TREE_META_STORAGE_KEY,
      JSON.stringify(normalizeStoredSourceTreeMetaVisibility(metaVisibility))
    );
  } catch {
    return;
  }
};
var getSystemReviewTheme = () => {
  if (typeof window === "undefined" || !window.matchMedia) return "dark";
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
};

// src/react-shell/review/settings.modal.tsx
var import_jsx_runtime4 = require("react/jsx-runtime");
var getReviewThemeIcon = (theme) => {
  if (theme === "light") return Sun;
  if (theme === "system") return Monitor;
  return Moon;
};
var ReviewSettingsModal = ({
  figmaTokenDraft,
  reviewUserIdDraft,
  reviewThemeDraft,
  figmaSettingsStatus,
  isFigmaTokenVisible,
  isFigmaTokenGuideOpen,
  onClose,
  onFigmaTokenDraftChange,
  onReviewUserIdDraftChange,
  onReviewThemeDraftChange,
  onClearStatus,
  onToggleFigmaTokenVisible,
  onToggleFigmaTokenGuide,
  onSave
}) => {
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(
    "div",
    {
      "aria-label": "Review settings",
      "aria-modal": "true",
      className: "df-review-settings-modal",
      role: "dialog",
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
          "button",
          {
            "aria-label": "Close settings",
            className: "df-review-settings-backdrop",
            type: "button",
            onClick: onClose
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(
          "form",
          {
            className: "df-review-settings-dialog",
            onSubmit: (event) => {
              event.preventDefault();
              onSave(figmaTokenDraft, reviewUserIdDraft, reviewThemeDraft);
            },
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "df-review-settings-header", children: [
                /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "df-review-settings-title", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("strong", { children: "Settings" }),
                  /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("span", { children: [
                    FIGMA_TOKEN_STORAGE_KEY,
                    " / ",
                    REVIEW_USER_ID_STORAGE_KEY,
                    " /",
                    " ",
                    REVIEW_THEME_STORAGE_KEY
                  ] })
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "df-review-settings-header-actions", children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("button", { "aria-label": "Close settings", type: "button", onClick: onClose, children: "x" }) })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "df-review-settings-body", children: [
                /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "df-review-settings-row", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { children: "Theme" }),
                  /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "df-review-settings-theme-options", children: REVIEW_THEME_OPTIONS.map((option) => {
                    const ThemeIcon = getReviewThemeIcon(option.value);
                    return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(
                      "button",
                      {
                        "aria-pressed": reviewThemeDraft === option.value,
                        className: `df-review-settings-theme-option${reviewThemeDraft === option.value ? " is-active" : ""}`,
                        type: "button",
                        onClick: () => {
                          onReviewThemeDraftChange(
                            normalizeReviewTheme(option.value)
                          );
                          onClearStatus();
                        },
                        children: [
                          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(ThemeIcon, { "aria-hidden": "true" }),
                          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { children: option.label })
                        ]
                      },
                      option.value
                    );
                  }) })
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "df-review-settings-field", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "df-review-settings-label-row", children: [
                    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("label", { htmlFor: "df-review-figma-token", children: "Figma token" }),
                    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
                      "button",
                      {
                        "aria-controls": FIGMA_TOKEN_GUIDE_ID,
                        "aria-expanded": isFigmaTokenGuideOpen,
                        "aria-label": "Show Figma token guide",
                        className: `df-review-settings-help-button${isFigmaTokenGuideOpen ? " is-active" : ""}`,
                        type: "button",
                        onClick: onToggleFigmaTokenGuide,
                        children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(CircleQuestionMark, { "aria-hidden": "true" })
                      }
                    )
                  ] }),
                  /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "df-review-settings-token-input", children: [
                    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
                      "input",
                      {
                        id: "df-review-figma-token",
                        "aria-label": "Figma token",
                        "aria-describedby": isFigmaTokenGuideOpen ? FIGMA_TOKEN_GUIDE_ID : void 0,
                        autoCapitalize: "off",
                        autoComplete: "off",
                        autoCorrect: "off",
                        className: isFigmaTokenVisible ? void 0 : "is-token-masked",
                        "data-1p-ignore": "true",
                        "data-lpignore": "true",
                        inputMode: "text",
                        name: "df-review-figma-access-key",
                        spellCheck: false,
                        type: "text",
                        value: figmaTokenDraft,
                        onChange: (event) => {
                          onFigmaTokenDraftChange(event.target.value);
                          onClearStatus();
                        }
                      }
                    ),
                    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
                      "button",
                      {
                        "aria-label": isFigmaTokenVisible ? "Hide Figma token" : "Show Figma token",
                        className: "df-review-settings-token-toggle",
                        type: "button",
                        onClick: onToggleFigmaTokenVisible,
                        children: isFigmaTokenVisible ? /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(EyeOff, { "aria-hidden": "true" }) : /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Eye, { "aria-hidden": "true" })
                      }
                    )
                  ] }),
                  isFigmaTokenGuideOpen && /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
                    "div",
                    {
                      className: "df-review-settings-guide",
                      id: FIGMA_TOKEN_GUIDE_ID,
                      children: /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("ol", { children: [
                        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("li", { children: "Figma file browser\uC5D0\uC11C account menu\uB97C \uC5F4\uACE0 Settings\uB85C \uC774\uB3D9" }),
                        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("li", { children: "Security \uD0ED\uC758 Personal access tokens\uB85C \uC774\uB3D9" }),
                        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("li", { children: "Generate new token\uC5D0\uC11C \uC774\uB984\uACFC scope\uB97C \uC815\uD55C \uB4A4 \uC0DD\uC131" }),
                        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("li", { children: "\uC0DD\uC131\uB41C token\uC744 \uBCF5\uC0AC\uD574\uC11C \uC5EC\uAE30\uC5D0 \uBD99\uC5EC\uB123\uAE30" })
                      ] })
                    }
                  )
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("label", { className: "df-review-settings-field", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { children: "User ID" }),
                  /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "df-review-settings-text-input", children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
                    "input",
                    {
                      "aria-label": "Review user ID",
                      autoComplete: "off",
                      spellCheck: false,
                      type: "text",
                      value: reviewUserIdDraft,
                      onChange: (event) => {
                        onReviewUserIdDraftChange(event.target.value);
                        onClearStatus();
                      }
                    }
                  ) })
                ] }),
                figmaSettingsStatus && /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("p", { className: "df-review-settings-status", children: figmaSettingsStatus }),
                /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "df-review-settings-actions", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
                    "button",
                    {
                      type: "button",
                      onClick: () => onSave("", "", DEFAULT_REVIEW_THEME),
                      children: "Clear"
                    }
                  ),
                  /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", {}),
                  /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("button", { type: "button", onClick: onClose, children: "Cancel" }),
                  /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("button", { type: "submit", children: "Save" })
                ] })
              ] })
            ]
          }
        )
      ]
    }
  );
};

// src/react-shell/sitemap/modal.tsx
var import_react4 = require("react");

// src/react-shell/sitemap/tree.ts
var WORKFLOW_STATUSES = [
  "todo",
  "doing",
  "review",
  "hold",
  "done"
];
var createEmptySitemapQaCount = () => ({
  total: 0,
  remaining: 0,
  local: 0,
  remote: 0,
  status: {
    todo: 0,
    doing: 0,
    review: 0,
    hold: 0,
    done: 0
  },
  scope: {},
  viewport: {}
});
var createSitemapViewportColumn = (preset, index) => ({
  key: `${index}:${preset.width}x${preset.height}`,
  label: preset.label,
  title: `${preset.label} ${preset.width}x${preset.height}`
});
var normalizeSitemapHref = (href) => {
  const [path = "/"] = href.split(/[?#]/);
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return normalizedPath || "/";
};
var getSitemapSegments = (href) => normalizeSitemapHref(href).split("/").map((segment) => segment.trim()).filter(Boolean);
var createSitemapNode = (href, label, isPage = false) => ({
  href,
  label,
  isPage,
  children: /* @__PURE__ */ new Map()
});
var mergeSitemapUsers = (users) => {
  const userByKey = /* @__PURE__ */ new Map();
  users.forEach((user) => {
    const key = user.sessionId || user.userId;
    const currentUser = userByKey.get(key);
    if (!currentUser || Date.parse(user.updatedAt) >= Date.parse(currentUser.updatedAt)) {
      userByKey.set(key, user);
    }
  });
  return Array.from(userByKey.values());
};
var addSitemapQaCounts = (first, second) => ({
  total: first.total + second.total,
  remaining: first.remaining + second.remaining,
  local: first.local + second.local,
  remote: first.remote + second.remote,
  status: WORKFLOW_STATUSES.reduce(
    (statusCounts, status) => ({
      ...statusCounts,
      [status]: first.status[status] + second.status[status]
    }),
    {}
  ),
  scope: Array.from(
    /* @__PURE__ */ new Set([
      ...Object.keys(first.scope),
      ...Object.keys(second.scope)
    ])
  ).reduce(
    (scopeCounts, scope) => ({
      ...scopeCounts,
      [scope]: (first.scope[scope] ?? 0) + (second.scope[scope] ?? 0)
    }),
    {}
  ),
  viewport: Array.from(
    /* @__PURE__ */ new Set([...Object.keys(first.viewport), ...Object.keys(second.viewport)])
  ).reduce(
    (viewportCounts, viewportKey) => ({
      ...viewportCounts,
      [viewportKey]: {
        total: (first.viewport[viewportKey]?.total ?? 0) + (second.viewport[viewportKey]?.total ?? 0),
        remaining: (first.viewport[viewportKey]?.remaining ?? 0) + (second.viewport[viewportKey]?.remaining ?? 0)
      }
    }),
    {}
  )
});
var createSitemapRows = (pages, activeRoute, pageQaCounts, pagePresenceUsers, getPageTarget, options = {}) => {
  const searchQuery = normalizeSitemapSearchQuery(options.searchQuery);
  const sortKey = options.sortKey ?? "page";
  const sortDirection = options.sortDirection ?? "asc";
  const root = createSitemapNode("/", "/", false);
  pages.forEach((page) => {
    const pageHref = page.href.startsWith("/") ? page.href : `/${page.href}`;
    const pathHref = normalizeSitemapHref(pageHref);
    const segments = getSitemapSegments(pathHref);
    if (segments.length === 0) {
      root.href = pageHref;
      root.isPage = true;
      return;
    }
    let parent = root;
    segments.forEach((segment, segmentIndex) => {
      const isLastSegment = segmentIndex === segments.length - 1;
      const segmentPath = `/${segments.slice(0, segmentIndex + 1).join("/")}`;
      const segmentHref = isLastSegment ? pageHref : `${segmentPath}/`;
      const segmentLabel = `${segment}${!isLastSegment || pathHref.endsWith("/") ? "/" : ""}`;
      const existingNode = parent.children.get(segment);
      const node = existingNode ?? createSitemapNode(segmentHref, segmentLabel, false);
      node.href = isLastSegment ? pageHref : node.href;
      node.label = isLastSegment ? segmentLabel : node.label;
      node.isPage = node.isPage || isLastSegment;
      parent.children.set(segment, node);
      parent = node;
    });
  });
  const getDirectCount = (node) => {
    if (!node.isPage) return createEmptySitemapQaCount();
    return pageQaCounts.get(getPageTarget(node.href)) ?? createEmptySitemapQaCount();
  };
  const getDirectUsers = (node) => {
    if (!node.isPage) return [];
    return pagePresenceUsers.get(getPageTarget(node.href)) ?? [];
  };
  const createNodeSummary = (node) => {
    const directCount = getDirectCount(node);
    const directUsers = getDirectUsers(node);
    const children = Array.from(node.children.values()).map(createNodeSummary);
    const childAggregate = children.reduce(
      (aggregate, child) => ({
        count: addSitemapQaCounts(aggregate.count, child.count),
        users: mergeSitemapUsers([...aggregate.users, ...child.users])
      }),
      {
        count: createEmptySitemapQaCount(),
        users: []
      }
    );
    return {
      node,
      directCount,
      directUsers,
      count: node.isPage ? addSitemapQaCounts(directCount, childAggregate.count) : childAggregate.count,
      users: mergeSitemapUsers([...directUsers, ...childAggregate.users]),
      children
    };
  };
  const getSortValue = (summary) => {
    if (sortKey === "page") return summary.node.label;
    if (sortKey === "total") return summary.count.remaining;
    if (sortKey === "review") return summary.count.status.review;
    if (sortKey === "hold") return summary.count.status.hold;
    if (sortKey === "online") return summary.users.length;
    if (sortKey.startsWith("viewport:")) {
      const viewportKey = sortKey.slice("viewport:".length);
      return summary.count.viewport[viewportKey]?.remaining ?? 0;
    }
    return 0;
  };
  const sortSummaries = (summaries) => {
    return [...summaries].sort((a, b) => {
      const firstValue = getSortValue(a);
      const secondValue = getSortValue(b);
      const valueDiff = typeof firstValue === "string" && typeof secondValue === "string" ? firstValue.localeCompare(secondValue) : Number(firstValue) - Number(secondValue);
      if (valueDiff !== 0) {
        return sortDirection === "asc" ? valueDiff : -valueDiff;
      }
      const totalDiff = b.count.remaining - a.count.remaining;
      if (totalDiff !== 0) return totalDiff;
      return a.node.label.localeCompare(b.node.label);
    });
  };
  const summaryMatchesSearch = (summary) => {
    if (!searchQuery) return true;
    if (sitemapNodeMatchesSearch(summary.node, searchQuery, getPageTarget)) {
      return true;
    }
    return summary.children.some(summaryMatchesSearch);
  };
  const rows = [];
  const appendSummaryRows = (summary, depth, ancestorLastList, isLastNode) => {
    const { node } = summary;
    const rowCount = node.isPage ? summary.directCount : summary.count;
    const rowUsers = node.isPage ? summary.directUsers : summary.users;
    if (node.isPage || depth > 0) {
      const prefix = depth === 0 ? "" : `${ancestorLastList.map((isLast) => isLast ? "   " : "\u2502  ").join("")}${isLastNode ? "\u2514\u2500 " : "\u251C\u2500 "}`;
      const pageTarget = node.isPage ? getPageTarget(node.href) : null;
      rows.push({
        href: node.href,
        label: node.label,
        prefix,
        isPage: node.isPage,
        isActive: pageTarget === activeRoute,
        qaCount: rowCount,
        users: rowUsers
      });
    }
    const visibleChildren = sortSummaries(
      summary.children.filter(summaryMatchesSearch)
    );
    visibleChildren.forEach((child, childIndex) => {
      appendSummaryRows(
        child,
        depth + 1,
        depth === 0 ? [] : [...ancestorLastList, isLastNode],
        childIndex === visibleChildren.length - 1
      );
    });
  };
  if (root.isPage && (!searchQuery || sitemapNodeMatchesSearch(root, searchQuery, getPageTarget))) {
    const directCount = getDirectCount(root);
    const directUsers = getDirectUsers(root);
    rows.push({
      href: root.href,
      label: root.label,
      prefix: "",
      isPage: true,
      isActive: getPageTarget(root.href) === activeRoute,
      qaCount: directCount,
      users: directUsers
    });
  }
  const rootSummaries = sortSummaries(
    Array.from(root.children.values()).map(createNodeSummary).filter(summaryMatchesSearch)
  );
  rootSummaries.forEach((summary, index, siblings) => {
    appendSummaryRows(summary, 1, [], index === siblings.length - 1);
  });
  return rows;
};
function normalizeSitemapSearchQuery(value) {
  return value?.trim().toLowerCase() ?? "";
}
function sitemapNodeMatchesSearch(node, searchQuery, getPageTarget) {
  return [
    node.href,
    node.label,
    normalizeSitemapHref(node.href),
    node.isPage ? getPageTarget(node.href) : ""
  ].join(" ").toLowerCase().includes(searchQuery);
}

// src/react-shell/sitemap/modal.tsx
var import_jsx_runtime5 = require("react/jsx-runtime");
var getNextSortDirection = (current, key) => {
  if (current.key !== key) return key === "page" ? "asc" : "desc";
  return current.direction === "desc" ? "asc" : "desc";
};
var getSortIndicator = (sort, key) => {
  if (sort.key !== key) return "";
  return sort.direction === "desc" ? "\u2193" : "\u2191";
};
var mergePresenceUsers = (users) => {
  const userByKey = /* @__PURE__ */ new Map();
  users.forEach((user) => {
    const key = user.sessionId || user.userId;
    const currentUser = userByKey.get(key);
    if (!currentUser || Date.parse(user.updatedAt) >= Date.parse(currentUser.updatedAt)) {
      userByKey.set(key, user);
    }
  });
  return Array.from(userByKey.values());
};
var SitemapModal = ({
  pages,
  activeRoute,
  allQaCount,
  isAllQaVisible,
  pageQaCounts,
  pagePresenceUsers,
  getPageTarget,
  onClose,
  onSelectAllQa,
  onSelectPage
}) => {
  const [sort, setSort] = (0, import_react4.useState)({
    key: "total",
    direction: "desc"
  });
  const [searchQuery, setSearchQuery] = (0, import_react4.useState)("");
  const trimmedSearchQuery = searchQuery.trim();
  const allQaUsers = (0, import_react4.useMemo)(
    () => mergePresenceUsers(Array.from(pagePresenceUsers.values()).flat()),
    [pagePresenceUsers]
  );
  const sitemapRows = createSitemapRows(
    pages,
    activeRoute,
    pageQaCounts,
    pagePresenceUsers,
    getPageTarget,
    {
      searchQuery: trimmedSearchQuery,
      sortKey: sort.key,
      sortDirection: sort.direction
    }
  );
  const gridStyle = {
    "--df-review-sitemap-grid-template": "minmax(190px, 1fr) 74px 78px 64px minmax(108px, 160px)"
  };
  const sortHeaders = [
    { key: "page", label: "", title: "Page", className: "is-page" },
    { key: "total", label: "Total", title: "Remaining total" },
    { key: "review", label: "Review" },
    { key: "hold", label: "Hold" },
    { key: "online", label: "Online", className: "is-online" }
  ];
  const setSortKey = (key) => {
    setSort((current) => ({
      key,
      direction: getNextSortDirection(current, key)
    }));
  };
  return /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)(
    "div",
    {
      "aria-label": "Sitemap",
      "aria-modal": "true",
      className: "df-review-sitemap-modal",
      role: "dialog",
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
          "button",
          {
            "aria-label": "Close sitemap",
            className: "df-review-sitemap-backdrop",
            type: "button",
            onClick: onClose
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "df-review-sitemap-dialog", children: [
          /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "df-review-sitemap-header", children: [
            /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { children: [
              /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("strong", { children: "Sitemap" }),
              /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("span", { children: [
                pages.length,
                " pages \xB7 ",
                allQaCount.remaining,
                " remaining \xB7",
                " ",
                allQaCount.status.review,
                " review \xB7 ",
                allQaCount.status.hold,
                " hold"
              ] })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("button", { "aria-label": "Close sitemap", type: "button", onClick: onClose, children: "x" })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "df-review-sitemap-controls", children: [
            /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("label", { className: "df-review-sitemap-search", children: [
              /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(Search, { "aria-hidden": "true" }),
              /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
                "input",
                {
                  "aria-label": "Search sitemap",
                  autoComplete: "off",
                  placeholder: "Search pages",
                  type: "search",
                  value: searchQuery,
                  onChange: (event) => setSearchQuery(event.currentTarget.value)
                }
              )
            ] }),
            trimmedSearchQuery && /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
              "button",
              {
                "aria-label": "Clear sitemap search",
                className: "df-review-sitemap-search-clear",
                type: "button",
                onClick: () => setSearchQuery(""),
                children: /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(X, { "aria-hidden": "true" })
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { className: "df-review-sitemap-search-count", children: trimmedSearchQuery ? `${sitemapRows.length} matches` : `${pages.length} pages` })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "df-review-sitemap-list", style: gridStyle, children: [
            /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { className: "df-review-sitemap-table-head", role: "row", children: sortHeaders.map((header) => /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)(
              "button",
              {
                "aria-label": `Sort sitemap by ${header.title ?? header.label}`,
                className: [
                  "df-review-sitemap-sort",
                  header.className ?? "",
                  sort.key === header.key ? "is-active" : ""
                ].filter(Boolean).join(" "),
                title: header.title ?? header.label,
                type: "button",
                onClick: () => setSortKey(header.key),
                children: [
                  /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
                    "span",
                    {
                      "aria-hidden": "true",
                      className: "df-review-sitemap-sort-indicator",
                      children: getSortIndicator(sort, header.key)
                    }
                  ),
                  /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { className: "df-review-sitemap-sort-label", children: header.label })
                ]
              },
              header.key
            )) }),
            sitemapRows.map((row) => {
              const rowClassName = [
                "df-review-sitemap-row",
                row.isPage ? "is-page" : "is-folder",
                row.isActive ? "is-active" : ""
              ].filter(Boolean).join(" ");
              const rowContent = /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
                SitemapRowContent,
                {
                  label: row.label,
                  prefix: row.prefix,
                  qaCount: row.qaCount,
                  users: row.users
                }
              );
              if (!row.isPage) {
                return /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
                  "div",
                  {
                    "aria-label": `${row.href} group / ${row.qaCount.remaining} remaining / ${row.qaCount.status.review} review / ${row.qaCount.status.hold} hold / ${row.users.length} online`,
                    className: rowClassName,
                    role: "row",
                    children: rowContent
                  },
                  row.href
                );
              }
              return /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
                "button",
                {
                  "aria-label": `${row.href} / ${row.qaCount.remaining} remaining / ${row.qaCount.status.review} review / ${row.qaCount.status.hold} hold / ${row.users.length} online`,
                  className: rowClassName,
                  type: "button",
                  onClick: () => onSelectPage(row.href),
                  children: rowContent
                },
                row.href
              );
            }),
            sitemapRows.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { className: "df-review-sitemap-empty", role: "status", children: "No matching pages" }),
            /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
              "button",
              {
                "aria-label": `All QA / ${allQaCount.remaining} remaining / ${allQaCount.status.review} review / ${allQaCount.status.hold} hold`,
                className: `df-review-sitemap-row is-summary${isAllQaVisible ? " is-active" : ""}`,
                type: "button",
                onClick: onSelectAllQa,
                children: /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
                  SitemapRowContent,
                  {
                    label: "",
                    prefix: "",
                    qaCount: allQaCount,
                    users: allQaUsers
                  }
                )
              }
            )
          ] })
        ] })
      ]
    }
  );
};
var SitemapRowContent = ({
  label,
  prefix,
  qaCount,
  users
}) => /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)(import_jsx_runtime5.Fragment, { children: [
  /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("span", { className: "df-review-sitemap-path", children: [
    /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { className: "df-review-sitemap-tree-prefix", children: prefix }),
    /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { className: "df-review-sitemap-label", children: label })
  ] }),
  /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { className: "df-review-sitemap-cell is-total", children: /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("strong", { children: qaCount.remaining }) }),
  /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { className: "df-review-sitemap-cell is-review", children: qaCount.status.review }),
  /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { className: "df-review-sitemap-cell is-hold", children: qaCount.status.hold }),
  /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { className: "df-review-sitemap-cell is-online", children: users.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { className: "df-review-sitemap-users", children: users.map((user) => /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
    "span",
    {
      className: "df-review-sitemap-user",
      style: {
        "--df-review-presence-color": user.color
      },
      children: user.userId
    },
    user.sessionId
  )) }) : null })
] });

// src/react-shell/figma.ts
function getReviewFigmaImageStore(options) {
  if (!options || options.enabled === false) return null;
  return options.store ?? null;
}
function getTargetFigmaFrameConfig(targetWindow) {
  try {
    const config = targetWindow?.__figma;
    if (!config || typeof config !== "object") return null;
    const desktopNodeId = normalizeFigmaNodeValue(config.desktopNodeId);
    const mobileNodeId = normalizeFigmaNodeValue(config.mobileNodeId);
    if (!desktopNodeId && !mobileNodeId) return null;
    return {
      desktopNodeId,
      mobileNodeId
    };
  } catch {
    return null;
  }
}
function normalizeFigmaNodeValue(value) {
  return typeof value === "string" ? value.trim() || void 0 : void 0;
}

// src/react-shell/figma/figma-mark-icon.tsx
var import_jsx_runtime6 = require("react/jsx-runtime");
function FigmaMarkIcon() {
  return /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
    "svg",
    {
      "aria-hidden": "true",
      className: "df-review-figma-mark-icon",
      viewBox: "0 0 24 24",
      children: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("path", { d: "M15.852 8.981h-4.588V0h4.588c2.476 0 4.49 2.014 4.49 4.49s-2.014 4.491-4.49 4.491zM12.735 7.51h3.117c1.665 0 3.019-1.355 3.019-3.019s-1.355-3.019-3.019-3.019h-3.117V7.51zm0 1.471H8.148c-2.476 0-4.49-2.014-4.49-4.49S5.672 0 8.148 0h4.588v8.981zm-4.587-7.51c-1.665 0-3.019 1.355-3.019 3.019s1.354 3.02 3.019 3.02h3.117V1.471H8.148zm4.587 15.019H8.148c-2.476 0-4.49-2.014-4.49-4.49s2.014-4.49 4.49-4.49h4.588v8.98zM8.148 8.981c-1.665 0-3.019 1.355-3.019 3.019s1.355 3.019 3.019 3.019h3.117V8.981H8.148zM8.172 24c-2.489 0-4.515-2.014-4.515-4.49s2.014-4.49 4.49-4.49h4.588v4.441C12.735 21.964 10.688 24 8.172 24zm-.024-7.51a3.023 3.023 0 0 0-3.019 3.019c0 1.665 1.365 3.019 3.044 3.019 1.705 0 3.093-1.376 3.093-3.068v-2.97H8.148zm7.704 0h-.098c-2.476 0-4.49-2.014-4.49-4.49s2.014-4.49 4.49-4.49h.098c2.476 0 4.49 2.014 4.49 4.49s-2.014 4.49-4.49 4.49zm-.097-7.509c-1.665 0-3.019 1.355-3.019 3.019s1.355 3.019 3.019 3.019h.098c1.665 0 3.019-1.355 3.019-3.019s-1.355-3.019-3.019-3.019h-.098z" })
    }
  );
}
function FigmaRailIcon() {
  return /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)(
    "svg",
    {
      "aria-hidden": "true",
      className: "df-review-figma-rail-icon",
      fill: "none",
      stroke: "currentColor",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      viewBox: "0 0 24 24",
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("path", { d: "M12 8H8.5a3 3 0 1 1 0-6H12v6Z" }),
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("path", { d: "M12 14H8.5a3 3 0 1 1 0-6H12v6Z" }),
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("path", { d: "M12 17.5A3.5 3.5 0 1 1 8.5 14H12v3.5Z" }),
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("path", { d: "M12 2h3.5a3 3 0 1 1 0 6H12V2Z" }),
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("circle", { cx: "15.5", cy: "11", r: "3" })
      ]
    }
  );
}

// src/react-shell/figma/images.panel.tsx
var import_react7 = require("react");

// src/react-shell/figma/image.overlay.controller.ts
var import_react6 = require("react");

// src/react-shell/figma/image.controller.ts
var import_react5 = require("react");
var createReviewFigmaRouteTarget = ({
  pageUrl,
  projectId,
  viewport
}) => ({
  type: "route",
  projectId,
  pageUrl,
  viewport: {
    label: viewport.label,
    width: viewport.width,
    height: viewport.height,
    scope: getViewportPresetKind(viewport)
  }
});
var useReviewFigmaImageStoreController = ({
  imageFormat = DEFAULT_REVIEW_FIGMA_IMAGE_FORMAT,
  store,
  target
}) => {
  const targetKey = (0, import_react5.useMemo)(
    () => createReviewFigmaImageTargetKey(target),
    [target]
  );
  const requestIdRef = (0, import_react5.useRef)(0);
  const [imageList, setImageList] = (0, import_react5.useState)(() => ({
    images: [],
    targetKey
  }));
  const [isLoading, setIsLoading] = (0, import_react5.useState)(Boolean(store));
  const [isMutating, setIsMutating] = (0, import_react5.useState)(false);
  const [error, setError] = (0, import_react5.useState)("");
  const images = imageList.targetKey === targetKey ? imageList.images : [];
  const refreshImages = (0, import_react5.useCallback)(async () => {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    if (!store) {
      setImageList({ images: [], targetKey });
      setIsLoading(false);
      setError("");
      return [];
    }
    setIsLoading(true);
    try {
      const nextImages = sortReviewFigmaImages(await store.listImages(target));
      if (requestId !== requestIdRef.current) return nextImages;
      setImageList({ images: nextImages, targetKey });
      setError("");
      return nextImages;
    } catch (refreshError) {
      if (requestId === requestIdRef.current) {
        setError(getReviewFigmaImageErrorMessage(refreshError));
      }
      return [];
    } finally {
      if (requestId === requestIdRef.current) setIsLoading(false);
    }
  }, [store, target, targetKey]);
  (0, import_react5.useEffect)(() => {
    void refreshImages();
  }, [refreshImages]);
  const addImage = (0, import_react5.useCallback)(
    async (figmaUrl, label) => {
      const trimmedUrl = figmaUrl.trim();
      if (!store || !trimmedUrl) return null;
      setIsMutating(true);
      try {
        let image = await store.addImage({
          target,
          figmaUrl: trimmedUrl,
          imageFormat,
          label: label?.trim() || void 0,
          order: getNewReviewFigmaImageOrder(images)
        });
        const uniqueLabel = getUniqueReviewFigmaImageLabel(
          getReviewFigmaImageComparableLabel(image),
          images
        );
        if (uniqueLabel !== getReviewFigmaImageComparableLabel(image)) {
          image = await store.updateImage(image.id, { label: uniqueLabel });
        }
        setImageList((currentList) => ({
          images: sortReviewFigmaImages([
            ...(currentList.targetKey === targetKey ? currentList.images : []).filter((currentImage) => currentImage.id !== image.id),
            image
          ]),
          targetKey
        }));
        setError("");
        return image;
      } catch (addError) {
        setError(getReviewFigmaImageErrorMessage(addError));
        return null;
      } finally {
        setIsMutating(false);
      }
    },
    [imageFormat, images, store, target, targetKey]
  );
  const deleteImage = (0, import_react5.useCallback)(
    async (id) => {
      if (!store) return;
      const previousImageList = imageList;
      setImageList({
        images: images.filter((image) => image.id !== id),
        targetKey
      });
      setIsMutating(true);
      try {
        await store.deleteImage(id);
        setError("");
      } catch (deleteError) {
        setImageList(previousImageList);
        setError(getReviewFigmaImageErrorMessage(deleteError));
      } finally {
        setIsMutating(false);
      }
    },
    [imageList, images, store, targetKey]
  );
  const updateImage = (0, import_react5.useCallback)(
    async (id, patch) => {
      if (!store) return null;
      const previousImageList = imageList;
      setIsMutating(true);
      try {
        const image = await store.updateImage(id, patch);
        setImageList((currentList) => ({
          images: sortReviewFigmaImages([
            ...(currentList.targetKey === targetKey ? currentList.images : images).filter((currentImage) => currentImage.id !== image.id),
            image
          ]),
          targetKey
        }));
        setError("");
        return image;
      } catch (updateError) {
        setImageList(previousImageList);
        setError(getReviewFigmaImageErrorMessage(updateError));
        return null;
      } finally {
        setIsMutating(false);
      }
    },
    [imageList, images, store, targetKey]
  );
  const reorderImages = (0, import_react5.useCallback)(
    async (imageIds) => {
      if (!store) return;
      const currentImageIds = images.map((image) => image.id);
      const nextImageIdSet = new Set(imageIds);
      const hasSameIds = imageIds.length === currentImageIds.length && nextImageIdSet.size === currentImageIds.length && currentImageIds.every((imageId) => nextImageIdSet.has(imageId));
      const hasSameOrder = hasSameIds && imageIds.every((imageId, index) => imageId === currentImageIds[index]);
      if (!hasSameIds || hasSameOrder) return;
      const previousImages = images;
      const imageById = new Map(images.map((image) => [image.id, image]));
      const optimisticImages = imageIds.flatMap((imageId, order) => {
        const image = imageById.get(imageId);
        return image ? [{ ...image, order }] : [];
      });
      setImageList({ images: optimisticImages, targetKey });
      setIsMutating(true);
      try {
        const savedImages = await store.reorderImages({
          target,
          imageIds
        });
        setImageList({ images: sortReviewFigmaImages(savedImages), targetKey });
        setError("");
      } catch (reorderError) {
        setImageList({ images: previousImages, targetKey });
        setError(getReviewFigmaImageErrorMessage(reorderError));
      } finally {
        setIsMutating(false);
      }
    },
    [images, store, target, targetKey]
  );
  const moveImage = (0, import_react5.useCallback)(
    async (id, direction) => {
      const currentIndex = images.findIndex((image2) => image2.id === id);
      const nextIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
      if (currentIndex < 0 || nextIndex < 0 || nextIndex >= images.length) {
        return;
      }
      const reorderedImages = [...images];
      const [image] = reorderedImages.splice(currentIndex, 1);
      reorderedImages.splice(nextIndex, 0, image);
      await reorderImages(reorderedImages.map((nextImage) => nextImage.id));
    },
    [images, reorderImages]
  );
  return {
    addImage,
    deleteImage,
    error,
    images,
    isLoading: isLoading || imageList.targetKey !== targetKey,
    isMutating,
    moveImage,
    refreshImages,
    reorderImages,
    updateImage
  };
};
function sortReviewFigmaImages(images) {
  return [...images].sort((a, b) => {
    if (a.order !== b.order) return a.order - b.order;
    return a.createdAt.localeCompare(b.createdAt);
  });
}
function getNewReviewFigmaImageOrder(images) {
  return images.length ? Math.min(...images.map((image) => image.order)) - 1 : 0;
}
function createReviewFigmaImageTargetKey(target) {
  return [
    target.projectId,
    target.pageUrl,
    target.viewport?.scope ?? "",
    target.viewport?.label ?? "",
    target.viewport?.width ?? "",
    target.viewport?.height ?? "",
    target.slot ?? ""
  ].join("|");
}
function getReviewFigmaImageComparableLabel(image) {
  return image.label?.trim() || image.nodeId;
}
function getUniqueReviewFigmaImageLabel(label, images) {
  const trimmedLabel = label.trim();
  if (!trimmedLabel) return trimmedLabel;
  const existingLabels = new Set(
    images.map(getReviewFigmaImageComparableLabel).filter(Boolean)
  );
  if (!existingLabels.has(trimmedLabel)) return trimmedLabel;
  for (let index = 2; index < Number.MAX_SAFE_INTEGER; index += 1) {
    const candidate = `${trimmedLabel}-${index}`;
    if (!existingLabels.has(candidate)) return candidate;
  }
  return trimmedLabel;
}
function getReviewFigmaImageErrorMessage(error) {
  return error instanceof Error ? error.message : "Figma image request failed.";
}

// src/react-shell/figma/image.overlay.controller.ts
var DEFAULT_REVIEW_FIGMA_IMAGE_OVERLAY_OPACITY = 0.48;
var REVIEW_FIGMA_IMAGE_OVERLAY_STORAGE_KEY_PREFIX = "df-review-figma-image-overlay-state:";
var REVIEW_FIGMA_IMAGE_OVERLAY_STORAGE_VERSION = 2;
var DEFAULT_REVIEW_FIGMA_IMAGE_OVERLAY_MODE = "normal";
var useReviewFigmaImageOverlayController = ({
  images,
  isLoading,
  target
}) => {
  const storageKey = (0, import_react6.useMemo)(
    () => createReviewFigmaImageOverlayStorageKey(target),
    [target]
  );
  const [stateContainer, setStateContainer] = (0, import_react6.useState)(() => ({
    state: readStoredReviewFigmaImageOverlayState(storageKey),
    storageKey
  }));
  const state = stateContainer.storageKey === storageKey ? stateContainer.state : DEFAULT_REVIEW_FIGMA_IMAGE_OVERLAY_STATE;
  const updateState = (0, import_react6.useCallback)(
    (updater) => {
      setStateContainer((currentContainer) => {
        const currentState = currentContainer.storageKey === storageKey ? currentContainer.state : readStoredReviewFigmaImageOverlayState(storageKey);
        return {
          state: updater(currentState),
          storageKey
        };
      });
    },
    [storageKey]
  );
  (0, import_react6.useEffect)(() => {
    setStateContainer({
      state: readStoredReviewFigmaImageOverlayState(storageKey),
      storageKey
    });
  }, [storageKey]);
  (0, import_react6.useEffect)(() => {
    if (typeof window === "undefined") return;
    const handleStorage = (event) => {
      if (event.storageArea !== window.localStorage || event.key !== storageKey && event.key !== null) {
        return;
      }
      setStateContainer({
        state: readStoredReviewFigmaImageOverlayState(storageKey),
        storageKey
      });
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [storageKey]);
  (0, import_react6.useEffect)(() => {
    if (isLoading) return;
    updateState((currentState) => {
      const nextImageIds = new Set(images.map((image) => image.id));
      const selectedImageId = currentState.selectedImageId && nextImageIds.has(currentState.selectedImageId) ? currentState.selectedImageId : images[0]?.id ?? null;
      const imageStates = Object.fromEntries(
        Object.entries(currentState.imageStates).filter(
          ([imageId]) => nextImageIds.has(imageId)
        )
      );
      const lastVisibleImageIds = currentState.lastVisibleImageIds.filter(
        (imageId) => nextImageIds.has(imageId)
      );
      if (selectedImageId === currentState.selectedImageId && imageStates === currentState.imageStates && lastVisibleImageIds.length === currentState.lastVisibleImageIds.length) {
        return currentState;
      }
      return {
        ...currentState,
        selectedImageId,
        imageStates,
        lastVisibleImageIds
      };
    });
  }, [images, isLoading, updateState]);
  (0, import_react6.useEffect)(() => {
    if (stateContainer.storageKey !== storageKey) return;
    writeStoredReviewFigmaImageOverlayState(storageKey, stateContainer.state);
  }, [stateContainer, storageKey]);
  const selectedImage = (0, import_react6.useMemo)(
    () => images.find((image) => image.id === state.selectedImageId) ?? null,
    [images, state.selectedImageId]
  );
  const selectedImageOverlayState = getReviewFigmaImageOverlayItemState(
    state,
    state.selectedImageId
  );
  const imageOverlayStates = (0, import_react6.useMemo)(
    () => Object.fromEntries(
      images.map((image) => [
        image.id,
        getReviewFigmaImageOverlayItemState(state, image.id)
      ])
    ),
    [images, state]
  );
  const isAnyImageOverlayVisible = (0, import_react6.useMemo)(
    () => images.some(
      (image) => imageOverlayStates[image.id]?.isVisible === true
    ),
    [imageOverlayStates, images]
  );
  const setSelectedImageId = (0, import_react6.useCallback)((selectedImageId) => {
    updateState((currentState) => ({
      ...currentState,
      selectedImageId
    }));
  }, [updateState]);
  const updateImageOverlayState = (0, import_react6.useCallback)(
    (imageId, updater) => {
      updateState((currentState) => ({
        ...currentState,
        selectedImageId: imageId,
        imageStates: updateReviewFigmaImageOverlayItemState(
          currentState.imageStates,
          imageId,
          updater
        )
      }));
    },
    [updateState]
  );
  const showImage = (0, import_react6.useCallback)((selectedImageId) => {
    updateState((currentState) => ({
      ...currentState,
      selectedImageId,
      imageStates: updateReviewFigmaImageOverlayItemState(
        currentState.imageStates,
        selectedImageId,
        (itemState) => ({
          ...itemState,
          isVisible: true
        })
      )
    }));
  }, [updateState]);
  const toggleImageOverlayVisible = (0, import_react6.useCallback)(
    (imageId) => {
      updateImageOverlayState(imageId, (itemState) => ({
        ...itemState,
        isVisible: !itemState.isVisible
      }));
    },
    [updateImageOverlayState]
  );
  const toggleAllImageOverlayVisible = (0, import_react6.useCallback)(() => {
    updateState((currentState) => {
      if (images.length === 0) return currentState;
      const imageIds = images.map((image) => image.id);
      const imageIdSet = new Set(imageIds);
      const visibleImageIds = imageIds.filter(
        (imageId) => getReviewFigmaImageOverlayItemState(currentState, imageId).isVisible
      );
      let imageStates = currentState.imageStates;
      if (visibleImageIds.length > 0) {
        imageIds.forEach((imageId) => {
          imageStates = updateReviewFigmaImageOverlayItemState(
            imageStates,
            imageId,
            (itemState) => ({
              ...itemState,
              isVisible: false
            })
          );
        });
        return {
          ...currentState,
          imageStates,
          lastVisibleImageIds: visibleImageIds
        };
      }
      const restoreImageIds = currentState.lastVisibleImageIds.filter(
        (imageId) => imageIdSet.has(imageId)
      );
      const fallbackImageId = currentState.selectedImageId && imageIdSet.has(currentState.selectedImageId) ? currentState.selectedImageId : images[0]?.id ?? null;
      const nextVisibleImageIds = restoreImageIds.length > 0 ? restoreImageIds : fallbackImageId ? [fallbackImageId] : [];
      const nextVisibleImageIdSet = new Set(nextVisibleImageIds);
      imageIds.forEach((imageId) => {
        imageStates = updateReviewFigmaImageOverlayItemState(
          imageStates,
          imageId,
          (itemState) => ({
            ...itemState,
            isVisible: nextVisibleImageIdSet.has(imageId)
          })
        );
      });
      return {
        ...currentState,
        selectedImageId: currentState.selectedImageId ?? nextVisibleImageIds[0] ?? null,
        imageStates,
        lastVisibleImageIds: nextVisibleImageIds
      };
    });
  }, [images, updateState]);
  const setImageOverlayOpacity = (0, import_react6.useCallback)(
    (imageId, opacity) => {
      updateImageOverlayState(imageId, (itemState) => ({
        ...itemState,
        opacity: clampReviewFigmaImageOverlayOpacity(opacity)
      }));
    },
    [updateImageOverlayState]
  );
  const toggleImageOverlayLocked = (0, import_react6.useCallback)(
    (imageId) => {
      updateImageOverlayState(imageId, (itemState) => ({
        ...itemState,
        isLocked: !itemState.isLocked
      }));
    },
    [updateImageOverlayState]
  );
  const toggleImageOverlayMode = (0, import_react6.useCallback)(
    (imageId) => {
      updateImageOverlayState(imageId, (itemState) => ({
        ...itemState,
        mode: itemState.mode === "invert" ? "normal" : "invert"
      }));
    },
    [updateImageOverlayState]
  );
  const setImageOverlayOffsetY = (0, import_react6.useCallback)(
    (imageId, offsetY) => {
      updateImageOverlayState(imageId, (itemState) => ({
        ...itemState,
        offsetY: normalizeReviewFigmaImageOverlayOffsetY(offsetY)
      }));
    },
    [updateImageOverlayState]
  );
  const toggleOverlayVisible = (0, import_react6.useCallback)(() => {
    updateState((currentState) => {
      if (!currentState.selectedImageId && images[0]) {
        return {
          ...currentState,
          selectedImageId: images[0].id,
          imageStates: updateReviewFigmaImageOverlayItemState(
            currentState.imageStates,
            images[0].id,
            (itemState) => ({
              ...itemState,
              isVisible: true
            })
          )
        };
      }
      if (!currentState.selectedImageId) return currentState;
      return {
        ...currentState,
        imageStates: updateReviewFigmaImageOverlayItemState(
          currentState.imageStates,
          currentState.selectedImageId,
          (itemState) => ({
            ...itemState,
            isVisible: !itemState.isVisible
          })
        )
      };
    });
  }, [images, updateState]);
  const setOverlayOpacity = (0, import_react6.useCallback)((opacity) => {
    updateState((currentState) => ({
      ...currentState,
      imageStates: updateSelectedReviewFigmaImageOverlayItemState(
        currentState,
        (itemState) => ({
          ...itemState,
          opacity: clampReviewFigmaImageOverlayOpacity(opacity)
        })
      )
    }));
  }, [updateState]);
  const setOverlayLocked = (0, import_react6.useCallback)((isLocked) => {
    updateState((currentState) => ({
      ...currentState,
      imageStates: updateSelectedReviewFigmaImageOverlayItemState(
        currentState,
        (itemState) => ({
          ...itemState,
          isLocked
        })
      )
    }));
  }, [updateState]);
  const toggleOverlayLocked = (0, import_react6.useCallback)(() => {
    updateState((currentState) => ({
      ...currentState,
      imageStates: updateSelectedReviewFigmaImageOverlayItemState(
        currentState,
        (itemState) => ({
          ...itemState,
          isLocked: !itemState.isLocked
        })
      )
    }));
  }, [updateState]);
  const setOverlayMode = (0, import_react6.useCallback)((mode) => {
    updateState((currentState) => ({
      ...currentState,
      imageStates: updateSelectedReviewFigmaImageOverlayItemState(
        currentState,
        (itemState) => ({
          ...itemState,
          mode: normalizeReviewFigmaImageOverlayMode(mode)
        })
      )
    }));
  }, [updateState]);
  const toggleOverlayMode = (0, import_react6.useCallback)(() => {
    updateState((currentState) => ({
      ...currentState,
      imageStates: updateSelectedReviewFigmaImageOverlayItemState(
        currentState,
        (itemState) => ({
          ...itemState,
          mode: itemState.mode === "invert" ? "normal" : "invert"
        })
      )
    }));
  }, [updateState]);
  const setOverlayOffsetY = (0, import_react6.useCallback)((offsetY) => {
    updateState((currentState) => ({
      ...currentState,
      imageStates: updateSelectedReviewFigmaImageOverlayItemState(
        currentState,
        (itemState) => ({
          ...itemState,
          offsetY: normalizeReviewFigmaImageOverlayOffsetY(offsetY)
        })
      )
    }));
  }, [updateState]);
  const resetOverlay = (0, import_react6.useCallback)(() => {
    updateState((currentState) => ({
      ...currentState,
      imageStates: currentState.selectedImageId ? updateReviewFigmaImageOverlayItemState(
        currentState.imageStates,
        currentState.selectedImageId,
        () => DEFAULT_REVIEW_FIGMA_IMAGE_OVERLAY_ITEM_STATE
      ) : currentState.imageStates
    }));
  }, [updateState]);
  return {
    imageOverlayStates,
    isAnyImageOverlayVisible,
    isOverlayVisible: selectedImageOverlayState.isVisible,
    overlayMode: selectedImageOverlayState.mode,
    overlayOffsetY: selectedImageOverlayState.offsetY,
    overlayOpacity: selectedImageOverlayState.opacity,
    isOverlayLocked: selectedImageOverlayState.isLocked,
    resetOverlay,
    selectedImage,
    selectedImageId: state.selectedImageId,
    setOverlayLocked,
    setOverlayMode,
    setOverlayOffsetY,
    setOverlayOpacity,
    setSelectedImageId,
    showImage,
    state,
    target,
    toggleImageOverlayLocked,
    toggleImageOverlayMode,
    toggleImageOverlayVisible,
    toggleAllImageOverlayVisible,
    setImageOverlayOffsetY,
    setImageOverlayOpacity,
    toggleOverlayLocked,
    toggleOverlayMode,
    toggleOverlayVisible
  };
};
function createReviewFigmaImageOverlayStorageKey(target) {
  return `${REVIEW_FIGMA_IMAGE_OVERLAY_STORAGE_KEY_PREFIX}${createReviewFigmaImageTargetKey(target)}`;
}
function readStoredReviewFigmaImageOverlayState(storageKey) {
  if (typeof window === "undefined") {
    return DEFAULT_REVIEW_FIGMA_IMAGE_OVERLAY_STATE;
  }
  try {
    const value = window.localStorage.getItem(storageKey);
    if (!value) return DEFAULT_REVIEW_FIGMA_IMAGE_OVERLAY_STATE;
    return normalizeReviewFigmaImageOverlayState(JSON.parse(value));
  } catch {
    return DEFAULT_REVIEW_FIGMA_IMAGE_OVERLAY_STATE;
  }
}
function writeStoredReviewFigmaImageOverlayState(storageKey, state) {
  if (typeof window === "undefined") return;
  if (isDefaultReviewFigmaImageOverlayState(state)) {
    try {
      window.localStorage.removeItem(storageKey);
    } catch {
      return;
    }
    return;
  }
  try {
    window.localStorage.setItem(
      storageKey,
      JSON.stringify({
        version: REVIEW_FIGMA_IMAGE_OVERLAY_STORAGE_VERSION,
        ...state
      })
    );
  } catch {
    return;
  }
}
var DEFAULT_REVIEW_FIGMA_IMAGE_OVERLAY_STATE = {
  selectedImageId: null,
  imageStates: {},
  lastVisibleImageIds: []
};
var DEFAULT_REVIEW_FIGMA_IMAGE_OVERLAY_ITEM_STATE = {
  isVisible: false,
  opacity: DEFAULT_REVIEW_FIGMA_IMAGE_OVERLAY_OPACITY,
  isLocked: false,
  mode: DEFAULT_REVIEW_FIGMA_IMAGE_OVERLAY_MODE,
  offsetY: 0
};
function normalizeReviewFigmaImageOverlayState(value) {
  if (!value || typeof value !== "object") {
    return DEFAULT_REVIEW_FIGMA_IMAGE_OVERLAY_STATE;
  }
  const state = value;
  const selectedImageId = typeof state.selectedImageId === "string" ? state.selectedImageId : null;
  const lastVisibleImageIds = Array.isArray(state.lastVisibleImageIds) ? state.lastVisibleImageIds.filter(
    (imageId) => typeof imageId === "string"
  ) : [];
  const imageStates = normalizeReviewFigmaImageOverlayItemStateRecord(
    state.imageStates
  );
  if (Object.keys(imageStates).length === 0 && selectedImageId) {
    imageStates[selectedImageId] = normalizeReviewFigmaImageOverlayItemState(
      state
    );
  }
  return {
    selectedImageId,
    imageStates,
    lastVisibleImageIds
  };
}
function normalizeReviewFigmaImageOverlayItemStateRecord(value) {
  if (!value || typeof value !== "object") return {};
  return Object.fromEntries(
    Object.entries(value).flatMap(([imageId, itemState]) => {
      if (!imageId || typeof itemState !== "object") return [];
      return [
        [
          imageId,
          normalizeReviewFigmaImageOverlayItemState(
            itemState
          )
        ]
      ];
    })
  );
}
function normalizeReviewFigmaImageOverlayItemState(value) {
  return {
    isVisible: value.isVisible === true,
    opacity: clampReviewFigmaImageOverlayOpacity(
      typeof value.opacity === "number" ? value.opacity : DEFAULT_REVIEW_FIGMA_IMAGE_OVERLAY_OPACITY
    ),
    isLocked: value.isLocked === true,
    mode: normalizeReviewFigmaImageOverlayMode(value.mode),
    offsetY: normalizeReviewFigmaImageOverlayOffsetY(value.offsetY)
  };
}
function normalizeReviewFigmaImageOverlayMode(value) {
  return value === "invert" ? "invert" : DEFAULT_REVIEW_FIGMA_IMAGE_OVERLAY_MODE;
}
function normalizeReviewFigmaImageOverlayOffsetY(value) {
  if (typeof value !== "number" || !Number.isFinite(value)) return 0;
  return Math.round(value);
}
function clampReviewFigmaImageOverlayOpacity(value) {
  if (!Number.isFinite(value)) return DEFAULT_REVIEW_FIGMA_IMAGE_OVERLAY_OPACITY;
  return Math.min(1, Math.max(0, value));
}
function isDefaultReviewFigmaImageOverlayState(state) {
  return state.selectedImageId === null && Object.keys(state.imageStates).length === 0 && state.lastVisibleImageIds.length === 0;
}
function getReviewFigmaImageOverlayItemState(state, imageId) {
  return imageId ? state.imageStates[imageId] ?? DEFAULT_REVIEW_FIGMA_IMAGE_OVERLAY_ITEM_STATE : DEFAULT_REVIEW_FIGMA_IMAGE_OVERLAY_ITEM_STATE;
}
function updateSelectedReviewFigmaImageOverlayItemState(state, updater) {
  return state.selectedImageId ? updateReviewFigmaImageOverlayItemState(
    state.imageStates,
    state.selectedImageId,
    updater
  ) : state.imageStates;
}
function updateReviewFigmaImageOverlayItemState(imageStates, imageId, updater) {
  return {
    ...imageStates,
    [imageId]: updater(
      imageStates[imageId] ?? DEFAULT_REVIEW_FIGMA_IMAGE_OVERLAY_ITEM_STATE
    )
  };
}

// src/react-shell/figma/image-panel.utils.ts
var DEFAULT_FIGMA_IMAGE_LAYER_STATE = {
  isLocked: false,
  isVisible: false,
  mode: "normal",
  offsetY: 0,
  opacity: DEFAULT_REVIEW_FIGMA_IMAGE_OVERLAY_OPACITY
};
function getFigmaImageLabel(image, index) {
  return image.label?.trim() || `Image ${index + 1}`;
}
function getSnappedOpacityPercent(opacity) {
  const opacityPercent = Math.round(opacity * 100);
  if (!Number.isFinite(opacityPercent)) return 0;
  return Math.max(0, Math.min(100, Math.round(opacityPercent / 10) * 10));
}
function getFigmaImageLayerStatusLabel(overlayState) {
  return [
    overlayState.isVisible ? "Visible" : "Hidden",
    overlayState.mode === "invert" ? "Invert" : "",
    overlayState.isLocked ? "Locked" : ""
  ].filter(Boolean).join(" / ");
}
function getReorderedFigmaImageIds(images, draggedImageId, dropTargetImageId) {
  const currentImageIds = images.map((image) => image.id);
  const draggedIndex = currentImageIds.indexOf(draggedImageId);
  const dropTargetIndex = currentImageIds.indexOf(dropTargetImageId);
  if (draggedIndex < 0 || dropTargetIndex < 0) return currentImageIds;
  const nextImageIds = [...currentImageIds];
  const [imageId] = nextImageIds.splice(draggedIndex, 1);
  nextImageIds.splice(dropTargetIndex, 0, imageId);
  return nextImageIds;
}
function isInteractiveFigmaImageTarget(target) {
  return target instanceof Element && Boolean(
    target.closest('button, a, input, textarea, select, [contenteditable="true"]')
  );
}
function getPointerFigmaImageTargetId(event) {
  const element = document.elementFromPoint(event.clientX, event.clientY);
  const targetCard = element?.closest(
    ".df-review-figma-image-card[data-figma-image-id]"
  );
  return targetCard?.dataset.figmaImageId ?? null;
}
function formatFigmaImageDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    month: "short"
  }).format(date);
}

// src/react-shell/figma/layer-state-buttons.tsx
var import_jsx_runtime7 = require("react/jsx-runtime");
var FigmaImageLayerStateButtons = ({
  imageLabel,
  overlayState,
  title,
  onSelect,
  onToggleLocked,
  onToggleMode,
  onToggleVisible
}) => {
  const handleAction = (action) => {
    onSelect?.();
    action();
  };
  return /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)(
    "div",
    {
      "aria-label": `${imageLabel} overlay state`,
      className: "df-review-figma-image-layer-state",
      title,
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
          "button",
          {
            "aria-label": overlayState.isVisible ? `Hide ${imageLabel} overlay` : `Show ${imageLabel} overlay`,
            "aria-pressed": overlayState.isVisible,
            className: `df-review-figma-image-state-button${overlayState.isVisible ? " is-active" : ""}`,
            title: overlayState.isVisible ? "Hide overlay" : "Show overlay",
            type: "button",
            onClick: (event) => {
              event.stopPropagation();
              handleAction(onToggleVisible);
            },
            children: overlayState.isVisible ? /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(Eye, { "aria-hidden": "true" }) : /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(EyeOff, { "aria-hidden": "true" })
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
          "button",
          {
            "aria-label": overlayState.isLocked ? `Unlock ${imageLabel} overlay` : `Lock ${imageLabel} overlay`,
            "aria-pressed": overlayState.isLocked,
            className: `df-review-figma-image-state-button${overlayState.isLocked ? " is-active" : ""}`,
            title: overlayState.isLocked ? "Unlock" : "Lock",
            type: "button",
            onClick: (event) => {
              event.stopPropagation();
              handleAction(onToggleLocked);
            },
            children: overlayState.isLocked ? /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(Lock, { "aria-hidden": "true" }) : /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(LockOpen, { "aria-hidden": "true" })
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
          "button",
          {
            "aria-label": overlayState.mode === "invert" ? `Disable ${imageLabel} invert` : `Enable ${imageLabel} invert`,
            "aria-pressed": overlayState.mode === "invert",
            className: `df-review-figma-image-state-button${overlayState.mode === "invert" ? " is-active" : ""}`,
            title: "Invert",
            type: "button",
            onClick: (event) => {
              event.stopPropagation();
              handleAction(onToggleMode);
            },
            children: /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(Contrast, { "aria-hidden": "true" })
          }
        )
      ]
    }
  );
};

// src/react-shell/review/spinner.tsx
var import_jsx_runtime8 = require("react/jsx-runtime");
var ReviewSpinner = ({ className, label }) => /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
  "span",
  {
    "aria-hidden": label ? void 0 : true,
    "aria-label": label,
    className: `df-review-spinner${className ? ` ${className}` : ""}`,
    role: label ? "status" : void 0
  }
);

// src/react-shell/figma/images.panel.tsx
var import_jsx_runtime9 = require("react/jsx-runtime");
var FIGMA_IMAGE_OPACITY_SLIDER_THUMB_RADIUS = 6;
var FigmaImagesPanel = ({
  error,
  images,
  imageOverlayStates,
  isListVisible,
  isLoading,
  isMutating,
  selectedImageId,
  onAddImage,
  onDeleteImage,
  onRefreshImages,
  onReorderImages,
  onSelectImage,
  onSetImageOverlayOffsetY,
  onSetImageOverlayOpacity,
  onToggleImageOverlayLocked,
  onToggleImageOverlayMode,
  onToggleImageOverlayVisible,
  onUpdateImage
}) => {
  const [figmaUrlDraft, setFigmaUrlDraft] = (0, import_react7.useState)("");
  const [editingImageId, setEditingImageId] = (0, import_react7.useState)(null);
  const [editingLabelDraft, setEditingLabelDraft] = (0, import_react7.useState)("");
  const [draggingImageId, setDraggingImageId] = (0, import_react7.useState)(null);
  const [dragOverImageId, setDragOverImageId] = (0, import_react7.useState)(null);
  const [previewImageId, setPreviewImageId] = (0, import_react7.useState)(null);
  const pointerDragImageIdRef = (0, import_react7.useRef)(null);
  const pointerDragTargetIdRef = (0, import_react7.useRef)(null);
  const pointerDragStartRef = (0, import_react7.useRef)(null);
  const pointerDragDidMoveRef = (0, import_react7.useRef)(false);
  const opacityDragPointerIdRef = (0, import_react7.useRef)(null);
  const labelEditCancelRef = (0, import_react7.useRef)(false);
  const labelInputFocusedImageIdRef = (0, import_react7.useRef)(null);
  const labelEditFinishedImageIdRef = (0, import_react7.useRef)(null);
  const [offsetYDraftByImageId, setOffsetYDraftByImageId] = (0, import_react7.useState)({});
  const selectedImageIndex = selectedImageId ? images.findIndex((image) => image.id === selectedImageId) : -1;
  const selectedImage = selectedImageIndex >= 0 ? images[selectedImageIndex] : null;
  const previewImage = previewImageId ? images.find((image) => image.id === previewImageId) ?? null : null;
  const selectedImageLabel = selectedImage ? getFigmaImageLabel(selectedImage, selectedImageIndex) : "Select layer";
  const selectedOverlayState = selectedImage ? imageOverlayStates[selectedImage.id] ?? DEFAULT_FIGMA_IMAGE_LAYER_STATE : DEFAULT_FIGMA_IMAGE_LAYER_STATE;
  const selectedOpacityPercent = selectedImage ? getSnappedOpacityPercent(selectedOverlayState.opacity) : 0;
  const selectedOpacityThumbOffset = FIGMA_IMAGE_OPACITY_SLIDER_THUMB_RADIUS * (1 - selectedOpacityPercent / 100 * 2);
  const selectedOffsetYDraft = selectedImage ? offsetYDraftByImageId[selectedImage.id] ?? String(selectedOverlayState.offsetY) : "";
  const statusText = error ? error : "";
  const progressText = isMutating ? "Saving..." : isLoading ? "Loading..." : "";
  const draggingImageIndex = draggingImageId ? images.findIndex((image) => image.id === draggingImageId) : -1;
  const finishEditingImageLabel = (imageId, currentLabel) => {
    if (labelEditFinishedImageIdRef.current === imageId) return;
    labelEditFinishedImageIdRef.current = imageId;
    labelInputFocusedImageIdRef.current = null;
    const nextLabel = editingLabelDraft;
    setEditingImageId(null);
    setEditingLabelDraft("");
    if (nextLabel === currentLabel) return;
    void onUpdateImage(imageId, {
      label: nextLabel
    });
  };
  const updateSelectedImageOpacity = (value) => {
    if (!selectedImage) return;
    const opacityPercent = Math.max(
      0,
      Math.min(100, Math.round(Number(value) / 10) * 10)
    );
    if (Number.isFinite(opacityPercent)) {
      onSetImageOverlayOpacity(selectedImage.id, opacityPercent / 100);
    }
  };
  const updateSelectedImageOpacityFromClientX = (clientX, sliderElement) => {
    if (!selectedImage) return;
    const rect = sliderElement.getBoundingClientRect();
    if (rect.width <= 0) return;
    const trackStart = rect.left + FIGMA_IMAGE_OPACITY_SLIDER_THUMB_RADIUS;
    const trackWidth = Math.max(
      1,
      rect.width - FIGMA_IMAGE_OPACITY_SLIDER_THUMB_RADIUS * 2
    );
    const endpointInset = FIGMA_IMAGE_OPACITY_SLIDER_THUMB_RADIUS * 2;
    const rawPercent = (clientX - trackStart) / trackWidth * 100;
    let opacityPercent = Math.max(
      0,
      Math.min(100, Math.round(rawPercent / 10) * 10)
    );
    if (clientX <= rect.left + endpointInset) {
      opacityPercent = 0;
    } else if (clientX >= rect.right - endpointInset) {
      opacityPercent = 100;
    }
    onSetImageOverlayOpacity(selectedImage.id, opacityPercent / 100);
  };
  const updateSelectedImageOpacityFromPointer = (event) => {
    updateSelectedImageOpacityFromClientX(event.clientX, event.currentTarget);
  };
  const updateSelectedImageOpacityFromMouse = (event) => {
    updateSelectedImageOpacityFromClientX(event.clientX, event.currentTarget);
  };
  return /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)(
    "aside",
    {
      className: "df-review-figma-images-panel",
      "aria-hidden": !isListVisible,
      onPointerDownCapture: (event) => {
        if (!editingImageId || event.target instanceof Element && event.target.closest(".df-review-figma-image-label-input")) {
          return;
        }
        const editingImage = images.find((image) => image.id === editingImageId);
        if (!editingImage) return;
        finishEditingImageLabel(editingImage.id, editingImage.label ?? "");
      },
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)(
          "form",
          {
            className: "df-review-figma-image-form",
            onSubmit: (event) => {
              event.preventDefault();
              void onAddImage(figmaUrlDraft).then((image) => {
                if (!image) return;
                setFigmaUrlDraft("");
              });
            },
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "df-review-figma-images-header", children: [
                /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("div", { className: "df-review-figma-images-title", children: /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("strong", { children: "Figma" }) }),
                /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
                  "button",
                  {
                    "aria-label": "Refresh Figma images",
                    className: "df-review-figma-image-header-button",
                    disabled: isLoading || isMutating,
                    title: "Refresh",
                    type: "button",
                    onClick: () => void onRefreshImages(),
                    children: /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(RefreshCw, { "aria-hidden": "true" })
                  }
                )
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "df-review-figma-image-url-row", children: [
                /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
                  "input",
                  {
                    "aria-label": "Figma URL",
                    autoComplete: "off",
                    placeholder: "Figma URL",
                    required: true,
                    spellCheck: false,
                    value: figmaUrlDraft,
                    onChange: (event) => setFigmaUrlDraft(event.currentTarget.value)
                  }
                ),
                /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
                  "button",
                  {
                    "aria-label": "Add Figma image",
                    disabled: isMutating || figmaUrlDraft.trim().length === 0,
                    type: "submit",
                    children: /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(Plus, { "aria-hidden": "true" })
                  }
                )
              ] })
            ]
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
          "div",
          {
            "aria-label": "Selected Figma image layer controls",
            className: "df-review-figma-image-selected-controls",
            children: /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "df-review-figma-image-selected-numbers", children: [
              /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("label", { className: "df-review-figma-image-opacity-control", children: [
                /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("span", { children: "Opacity" }),
                /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
                  "div",
                  {
                    className: "df-review-figma-image-opacity-slider",
                    style: {
                      "--df-review-figma-opacity-value": `${selectedOpacityPercent}%`,
                      "--df-review-figma-opacity-left": `calc(${selectedOpacityPercent}% + ${selectedOpacityThumbOffset}px)`
                    },
                    onPointerCancel: () => {
                      opacityDragPointerIdRef.current = null;
                    },
                    onPointerDown: (event) => {
                      if (!selectedImage) return;
                      opacityDragPointerIdRef.current = event.pointerId;
                      event.currentTarget.setPointerCapture(event.pointerId);
                      event.currentTarget.querySelector("input")?.focus();
                      updateSelectedImageOpacityFromPointer(event);
                    },
                    onPointerMove: (event) => {
                      if (opacityDragPointerIdRef.current !== event.pointerId) return;
                      updateSelectedImageOpacityFromPointer(event);
                    },
                    onPointerUp: (event) => {
                      if (opacityDragPointerIdRef.current !== event.pointerId) return;
                      updateSelectedImageOpacityFromPointer(event);
                      opacityDragPointerIdRef.current = null;
                      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
                        event.currentTarget.releasePointerCapture(event.pointerId);
                      }
                    },
                    onMouseDown: updateSelectedImageOpacityFromMouse,
                    onMouseMove: (event) => {
                      if (event.buttons !== 1) return;
                      updateSelectedImageOpacityFromMouse(event);
                    },
                    onMouseUp: updateSelectedImageOpacityFromMouse,
                    onClick: updateSelectedImageOpacityFromMouse,
                    children: /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
                      "input",
                      {
                        "aria-label": `${selectedImageLabel} overlay opacity`,
                        "aria-valuemax": 100,
                        "aria-valuemin": 0,
                        "aria-valuenow": selectedOpacityPercent,
                        disabled: !selectedImage,
                        max: "100",
                        min: "0",
                        step: "10",
                        type: "range",
                        value: selectedOpacityPercent,
                        onChange: (event) => updateSelectedImageOpacity(event.currentTarget.value),
                        onInput: (event) => updateSelectedImageOpacity(event.currentTarget.value)
                      }
                    )
                  }
                ),
                /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("strong", { children: selectedOpacityPercent })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("label", { className: "df-review-figma-image-number-control", children: [
                /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(MoveVertical, { "aria-hidden": "true" }),
                /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
                  "input",
                  {
                    "aria-label": `${selectedImageLabel} overlay Y offset`,
                    disabled: !selectedImage,
                    inputMode: "numeric",
                    step: "1",
                    type: "number",
                    value: selectedOffsetYDraft,
                    onBlur: () => {
                      if (!selectedImage) return;
                      setOffsetYDraftByImageId((currentDrafts) => {
                        const nextDrafts = { ...currentDrafts };
                        delete nextDrafts[selectedImage.id];
                        return nextDrafts;
                      });
                    },
                    onChange: (event) => {
                      if (!selectedImage) return;
                      const value = event.currentTarget.value;
                      const offsetY = Number(value);
                      setOffsetYDraftByImageId((currentDrafts) => ({
                        ...currentDrafts,
                        [selectedImage.id]: value
                      }));
                      if (value.trim() !== "" && Number.isFinite(offsetY)) {
                        onSetImageOverlayOffsetY(selectedImage.id, offsetY);
                      }
                    }
                  }
                )
              ] }),
              selectedImage ? /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
                "button",
                {
                  "aria-label": `Preview ${selectedImageLabel} Figma image`,
                  className: "df-review-figma-image-selected-link",
                  title: "Preview Figma image",
                  type: "button",
                  onClick: () => setPreviewImageId(selectedImage.id),
                  children: /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(ExternalLink, { "aria-hidden": "true" })
                }
              ) : /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
                "button",
                {
                  "aria-label": "Open Figma node",
                  className: "df-review-figma-image-selected-link",
                  disabled: true,
                  title: "Open Figma node",
                  type: "button",
                  children: /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(ExternalLink, { "aria-hidden": "true" })
                }
              )
            ] })
          }
        ),
        statusText && /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
          "p",
          {
            className: `df-review-figma-image-status${error ? " is-error" : ""}`,
            children: statusText
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "df-review-figma-image-list", children: [
          progressText && /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)(
            "div",
            {
              "aria-live": "polite",
              className: "df-review-figma-image-card is-status",
              role: "status",
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(ReviewSpinner, { className: "df-review-figma-image-spinner" }),
                /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("div", { className: "df-review-figma-image-card-main", children: /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("strong", { children: progressText }) })
              ]
            }
          ),
          images.length === 0 && !isLoading && !isMutating && /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("p", { className: "df-review-empty", children: "No Figma images on this viewport." }),
          images.map((image, index) => {
            const imageLabel = getFigmaImageLabel(image, index);
            const overlayState = imageOverlayStates[image.id] ?? DEFAULT_FIGMA_IMAGE_LAYER_STATE;
            const isDragging = draggingImageId === image.id;
            const isDropTarget = dragOverImageId === image.id && draggingImageId !== image.id;
            const isDropBefore = isDropTarget && draggingImageIndex > index;
            const isDropAfter = isDropTarget && draggingImageIndex >= 0 && draggingImageIndex < index;
            return /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)(
              "article",
              {
                "data-figma-image-id": image.id,
                className: `df-review-figma-image-card${image.id === selectedImageId ? " is-active" : ""}${editingImageId === image.id ? " is-editing" : ""}${isDragging ? " is-dragging" : ""}${isDropTarget ? " is-drop-target" : ""}${isDropBefore ? " is-drop-before" : ""}${isDropAfter ? " is-drop-after" : ""}`,
                onClick: () => {
                  if (pointerDragDidMoveRef.current) {
                    pointerDragDidMoveRef.current = false;
                    return;
                  }
                  onSelectImage(image.id);
                },
                onPointerCancel: () => {
                  pointerDragImageIdRef.current = null;
                  pointerDragTargetIdRef.current = null;
                  pointerDragStartRef.current = null;
                  setDraggingImageId(null);
                  setDragOverImageId(null);
                },
                onPointerDown: (event) => {
                  if (event.button !== 0 || isMutating || editingImageId === image.id || isInteractiveFigmaImageTarget(event.target)) {
                    return;
                  }
                  pointerDragImageIdRef.current = image.id;
                  pointerDragTargetIdRef.current = null;
                  pointerDragStartRef.current = {
                    x: event.clientX,
                    y: event.clientY
                  };
                  pointerDragDidMoveRef.current = false;
                  event.currentTarget.setPointerCapture(event.pointerId);
                },
                onPointerMove: (event) => {
                  const sourceImageId = pointerDragImageIdRef.current;
                  const dragStart = pointerDragStartRef.current;
                  if (!sourceImageId || !dragStart) return;
                  const hasMoved = Math.abs(event.clientX - dragStart.x) + Math.abs(event.clientY - dragStart.y) > 6;
                  if (!hasMoved) return;
                  pointerDragDidMoveRef.current = true;
                  setDraggingImageId(sourceImageId);
                  const targetImageId = getPointerFigmaImageTargetId(event);
                  pointerDragTargetIdRef.current = targetImageId && targetImageId !== sourceImageId ? targetImageId : null;
                  setDragOverImageId(pointerDragTargetIdRef.current);
                },
                onPointerUp: (event) => {
                  const sourceImageId = pointerDragImageIdRef.current;
                  const targetImageId = pointerDragTargetIdRef.current;
                  pointerDragImageIdRef.current = null;
                  pointerDragTargetIdRef.current = null;
                  pointerDragStartRef.current = null;
                  setDraggingImageId(null);
                  setDragOverImageId(null);
                  if (event.currentTarget.hasPointerCapture(event.pointerId)) {
                    event.currentTarget.releasePointerCapture(event.pointerId);
                  }
                  if (!sourceImageId || !targetImageId || sourceImageId === targetImageId) {
                    return;
                  }
                  const nextImageIds = getReorderedFigmaImageIds(
                    images,
                    sourceImageId,
                    targetImageId
                  );
                  void onReorderImages(nextImageIds);
                },
                children: [
                  /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
                    FigmaImageLayerStateButtons,
                    {
                      imageLabel,
                      overlayState,
                      title: getFigmaImageLayerStatusLabel(overlayState),
                      onSelect: () => onSelectImage(image.id),
                      onToggleLocked: () => onToggleImageOverlayLocked(image.id),
                      onToggleMode: () => onToggleImageOverlayMode(image.id),
                      onToggleVisible: () => onToggleImageOverlayVisible(image.id)
                    }
                  ),
                  /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "df-review-figma-image-card-main", children: [
                    editingImageId === image.id ? /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
                      "input",
                      {
                        "aria-label": "Selected Figma image label",
                        autoComplete: "off",
                        autoFocus: true,
                        className: "df-review-figma-image-label-input",
                        disabled: isMutating,
                        placeholder: "Label",
                        ref: (element) => {
                          if (!element || labelInputFocusedImageIdRef.current === image.id) {
                            return;
                          }
                          labelInputFocusedImageIdRef.current = image.id;
                          element.focus();
                          element.select();
                        },
                        spellCheck: false,
                        value: editingLabelDraft,
                        onBlur: () => {
                          if (labelEditCancelRef.current) {
                            labelEditCancelRef.current = false;
                            labelInputFocusedImageIdRef.current = null;
                            labelEditFinishedImageIdRef.current = image.id;
                            setEditingImageId(null);
                            setEditingLabelDraft("");
                            return;
                          }
                          finishEditingImageLabel(image.id, image.label ?? "");
                        },
                        onChange: (event) => setEditingLabelDraft(event.currentTarget.value),
                        onClick: (event) => event.stopPropagation(),
                        onKeyDown: (event) => {
                          if (event.key === "Enter") {
                            event.preventDefault();
                            event.currentTarget.blur();
                            return;
                          }
                          if (event.key === "Escape") {
                            labelEditCancelRef.current = true;
                            event.currentTarget.blur();
                          }
                        }
                      }
                    ) : /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("strong", { children: imageLabel }),
                    /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("small", { children: formatFigmaImageDate(image.updatedAt) })
                  ] }),
                  /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "df-review-figma-image-card-actions", children: [
                    /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
                      "button",
                      {
                        "aria-label": `Edit ${imageLabel} label`,
                        className: "df-review-figma-image-icon-button",
                        disabled: isMutating,
                        title: "Edit label",
                        type: "button",
                        onClick: (event) => {
                          event.stopPropagation();
                          onSelectImage(image.id);
                          labelEditCancelRef.current = false;
                          labelInputFocusedImageIdRef.current = null;
                          labelEditFinishedImageIdRef.current = null;
                          setEditingImageId(image.id);
                          setEditingLabelDraft(image.label ?? "");
                        },
                        children: /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(Pencil, { "aria-hidden": "true" })
                      }
                    ),
                    /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
                      "button",
                      {
                        "aria-label": "Delete Figma image",
                        className: "df-review-figma-image-icon-button is-danger",
                        disabled: isMutating,
                        type: "button",
                        onClick: (event) => {
                          event.stopPropagation();
                          void onDeleteImage(image.id);
                        },
                        children: /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(Trash2, { "aria-hidden": "true" })
                      }
                    )
                  ] })
                ]
              },
              image.id
            );
          })
        ] }),
        previewImage && /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
          FigmaImagePreviewModal,
          {
            image: previewImage,
            label: getFigmaImageLabel(previewImage, images.indexOf(previewImage)),
            onClose: () => setPreviewImageId(null)
          }
        )
      ]
    }
  );
};
var FigmaImagePreviewModal = ({
  image,
  label,
  onClose
}) => {
  return /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)(
    "div",
    {
      "aria-label": `${label} Figma image preview`,
      "aria-modal": "true",
      className: "df-review-prompt-modal",
      role: "dialog",
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
          "button",
          {
            "aria-label": "Close Figma image preview",
            className: "df-review-prompt-backdrop",
            type: "button",
            onClick: onClose
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "df-review-prompt-dialog df-review-figma-image-preview-dialog", children: [
          /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "df-review-figma-image-preview-header", children: [
            /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
              "input",
              {
                "aria-label": "Figma URL",
                readOnly: true,
                spellCheck: false,
                value: image.figmaUrl
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)(
              "a",
              {
                "aria-label": `Open ${label} Figma node`,
                className: "df-review-figma-image-preview-link",
                href: image.figmaUrl,
                rel: "noreferrer",
                target: "_blank",
                children: [
                  /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("span", { children: "Open Figma" }),
                  /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(ExternalLink, { "aria-hidden": "true" })
                ]
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
              "button",
              {
                "aria-label": "Close Figma image preview",
                className: "df-review-figma-image-preview-close",
                type: "button",
                onClick: onClose,
                children: /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(X, { "aria-hidden": "true" })
              }
            )
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("div", { className: "df-review-figma-image-preview-scroll", children: /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("img", { alt: label, src: image.imageUrl }) })
        ] })
      ]
    }
  );
};

// src/react-shell/qa/item.edit.modal.tsx
var import_react8 = require("react");
var import_jsx_runtime10 = require("react/jsx-runtime");
var QaItemEditModal = ({
  fields,
  item,
  onClose,
  onSave
}) => {
  const [titleDraft, setTitleDraft] = (0, import_react8.useState)(item.title ?? "");
  const [commentDraft, setCommentDraft] = (0, import_react8.useState)(item.comment);
  const [error, setError] = (0, import_react8.useState)("");
  const [isSaving, setIsSaving] = (0, import_react8.useState)(false);
  (0, import_react8.useEffect)(() => {
    setTitleDraft(item.title ?? "");
    setCommentDraft(item.comment);
    setError("");
    setIsSaving(false);
  }, [item.id, item.title, item.comment]);
  const saveDetails = async () => {
    const nextTitle = titleDraft.trim();
    const nextComment = commentDraft.trim();
    if (!nextComment) {
      setError("Comment is required.");
      return;
    }
    setError("");
    setIsSaving(true);
    try {
      await onSave(item, {
        ...fields.title ? { title: nextTitle || void 0 } : {},
        comment: nextComment
      });
    } catch (error2) {
      setError(
        error2 instanceof Error ? error2.message : "Failed to update QA."
      );
      setIsSaving(false);
    }
  };
  return /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)(
    "div",
    {
      "aria-modal": "true",
      className: "df-review-edit-modal",
      role: "dialog",
      "aria-labelledby": "df-review-edit-title",
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
          "button",
          {
            "aria-label": "Close edit dialog",
            className: "df-review-settings-backdrop",
            type: "button",
            onClick: onClose
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)(
          "form",
          {
            className: "df-review-edit-dialog",
            onSubmit: (event) => {
              event.preventDefault();
              void saveDetails();
            },
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("header", { className: "df-review-settings-header", children: [
                /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { className: "df-review-settings-title", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("strong", { id: "df-review-edit-title", children: "Edit QA" }),
                  /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("span", { children: fields.title ? "Update the title and comment." : "Update the comment." })
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("div", { className: "df-review-settings-header-actions", children: /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
                  "button",
                  {
                    "aria-label": "Close edit dialog",
                    type: "button",
                    onClick: onClose,
                    children: "x"
                  }
                ) })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { className: "df-review-settings-body df-review-edit-body", children: [
                fields.title && /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("label", { className: "df-review-settings-field", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("span", { children: "Title" }),
                  /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("div", { className: "df-review-settings-text-input", children: /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
                    "input",
                    {
                      autoFocus: true,
                      value: titleDraft,
                      onChange: (event) => {
                        setTitleDraft(event.target.value);
                        if (error) setError("");
                      },
                      onKeyDown: (event) => {
                        if (event.key === "Escape") {
                          event.preventDefault();
                          onClose();
                        }
                      }
                    }
                  ) })
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("label", { className: "df-review-settings-field", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("span", { children: "Comment" }),
                  /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("div", { className: "df-review-settings-text-input df-review-edit-textarea", children: /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
                    "textarea",
                    {
                      autoFocus: !fields.title,
                      value: commentDraft,
                      onChange: (event) => {
                        setCommentDraft(event.target.value);
                        if (error) setError("");
                      },
                      onKeyDown: (event) => {
                        if (event.key === "Escape") {
                          event.preventDefault();
                          onClose();
                        }
                        if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
                          event.preventDefault();
                          void saveDetails();
                        }
                      }
                    }
                  ) })
                ] }),
                error && /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("p", { className: "df-review-edit-error", children: error }),
                /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("footer", { className: "df-review-settings-actions df-review-edit-actions", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("span", {}),
                  /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("button", { disabled: isSaving, type: "button", onClick: onClose, children: "Cancel" }),
                  /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("button", { disabled: isSaving, type: "submit", children: [
                    isSaving && /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("span", { className: "df-review-spinner", "aria-hidden": "true" }),
                    isSaving ? "Saving..." : "Save"
                  ] })
                ] })
              ] })
            ]
          }
        )
      ]
    }
  );
};

// src/react-shell/qa/item.assignee.actions.tsx
var import_jsx_runtime11 = require("react/jsx-runtime");
var getAssigneeLabel = (item, assigneeOptions) => item.assigneeName || assigneeOptions.find(
  (assigneeOption) => assigneeOption.value === item.assigneeId
)?.label || item.assigneeId || "";
var QaItemAssigneeActions = ({
  assigneeOptions,
  assigneeTitle,
  canUpdateAssignee,
  isDisabled = false,
  item,
  onChangeItemAssignee
}) => {
  const assigneeId = item.assigneeId ?? "";
  const currentLabel = getAssigneeLabel(item, assigneeOptions);
  const hasUnknownAssignee = Boolean(assigneeId) && !assigneeOptions.some(
    (assigneeOption) => assigneeOption.value === assigneeId
  );
  if (!canUpdateAssignee && !currentLabel) return null;
  return /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(
    "div",
    {
      className: "df-review-item-assignee-actions",
      onClick: (event) => event.stopPropagation(),
      children: canUpdateAssignee ? /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)(
        "select",
        {
          "aria-label": `QA ${assigneeTitle}`,
          className: "df-review-item-assignee-select",
          disabled: isDisabled,
          value: assigneeId,
          onChange: (event) => void onChangeItemAssignee(item, event.currentTarget.value || null),
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("option", { value: "", children: assigneeTitle }),
            hasUnknownAssignee && /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("option", { value: assigneeId, children: currentLabel }),
            assigneeOptions.map((assigneeOption) => /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("option", { value: assigneeOption.value, children: assigneeOption.label }, assigneeOption.value))
          ]
        }
      ) : /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("span", { className: "df-review-item-assignee-badge", children: currentLabel })
    }
  );
};

// src/react-shell/qa/item.remote.actions.tsx
var import_jsx_runtime12 = require("react/jsx-runtime");
var QaItemRemoteActions = ({
  isRemoteSource,
  isSubmitted,
  isSubmitting,
  item,
  isRemoteIssueCopied,
  numberedItem,
  remoteAdapterEntry,
  onCopyRemoteIssuePath,
  onSubmitItem
}) => {
  const canSubmitToRemote = !isRemoteSource && Boolean(remoteAdapterEntry);
  const canOpenRemoteIssue = !isRemoteSource && Boolean(item.externalIssueUrl);
  const hasRemoteActions = canSubmitToRemote || canOpenRemoteIssue;
  if (!hasRemoteActions) return null;
  return /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)(
    "div",
    {
      className: "df-review-item-remote-actions",
      onClick: (event) => event.stopPropagation(),
      children: [
        canSubmitToRemote && remoteAdapterEntry && /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)(
          "button",
          {
            "aria-label": "Submit to remote",
            className: "df-review-item-action-button df-review-item-submit-button",
            disabled: isSubmitted || isSubmitting,
            type: "button",
            onClick: () => void onSubmitItem(numberedItem),
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(Upload, { "aria-hidden": "true" }),
              /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("span", { children: isSubmitted ? "Submitted" : isSubmitting ? "Submitting" : "Submit" })
            ]
          }
        ),
        canOpenRemoteIssue && /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)(import_jsx_runtime12.Fragment, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(
            "button",
            {
              "aria-label": isRemoteIssueCopied ? "Copied remote QA path" : "Copy remote QA path",
              className: `df-review-item-action-button df-review-item-remote-copy${isRemoteIssueCopied ? " is-copied" : ""}`,
              title: isRemoteIssueCopied ? "Copied remote QA path" : "Copy remote QA path",
              type: "button",
              onClick: () => void onCopyRemoteIssuePath(item),
              children: /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(Copy, { "aria-hidden": "true" })
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(
            "a",
            {
              "aria-label": "Open remote issue",
              className: "df-review-item-action-button",
              href: item.externalIssueUrl,
              rel: "noreferrer",
              target: "_blank",
              title: "Open remote issue",
              children: /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(ExternalLink, { "aria-hidden": "true" })
            }
          )
        ] })
      ]
    }
  );
};

// src/status.ts
var REVIEW_WORKFLOW_STATUS_OPTIONS = [
  { value: "todo", label: "Todo" },
  { value: "doing", label: "Doing" },
  { value: "review", label: "Review" },
  { value: "hold", label: "Hold" },
  { value: "done", label: "Done" }
];
function normalizeReviewItemStatus(status) {
  if (status === "resolved") return "done";
  if (status === "open" || !status) return "todo";
  return status;
}
function matchesReviewItemStatus(itemStatus, queryStatus) {
  return normalizeReviewItemStatus(itemStatus) === normalizeReviewItemStatus(queryStatus);
}

// src/react-shell/qa/item.status.actions.tsx
var import_jsx_runtime13 = require("react/jsx-runtime");
var getStatusOption = (status, statusOptions) => {
  const normalizedStatus = normalizeReviewItemStatus(status);
  return statusOptions.find((statusOption) => statusOption.value === status) ?? statusOptions.find(
    (statusOption) => statusOption.value === normalizedStatus
  ) ?? statusOptions[0];
};
var QaItemStatusActions = ({
  canUpdateStatus,
  isDisabled = false,
  item,
  statusOptions,
  onChangeItemStatus
}) => {
  const currentStatusOption = getStatusOption(item.status, statusOptions);
  if (!currentStatusOption) return null;
  const statusClassName = `is-status-${normalizeReviewItemStatus(
    currentStatusOption.value
  )}`;
  return /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(
    "div",
    {
      className: "df-review-item-status-actions",
      onClick: (event) => event.stopPropagation(),
      children: canUpdateStatus ? /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(
        "select",
        {
          "aria-label": "QA status",
          className: `df-review-item-status-select ${statusClassName}`,
          disabled: isDisabled,
          value: currentStatusOption.value,
          onChange: (event) => void onChangeItemStatus(
            item,
            event.currentTarget.value
          ),
          children: statusOptions.map((statusOption) => /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("option", { value: statusOption.value, children: statusOption.label }, statusOption.value))
        }
      ) : /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("span", { className: `df-review-item-status-badge ${statusClassName}`, children: currentStatusOption.label })
    }
  );
};

// src/react-shell/anchor.restore.ts
var isAnchorRestorableReviewItem = (item) => item.scope === "dom" || item.kind === "note" && Boolean(item.anchor && item.selection);
var queryReviewItemAnchorElement = (targetDocument, item) => {
  const anchor = item.anchor;
  if (!anchor || !isAnchorRestorableReviewItem(item)) return void 0;
  const expectedRect = getReviewItemExpectedDocumentRect(item);
  const candidates = [anchor, ...anchor.candidates ?? []].filter(
    (candidate) => Boolean(candidate.selector)
  );
  const matches = [];
  candidates.forEach((candidate, index) => {
    try {
      targetDocument.querySelectorAll(candidate.selector).forEach((element) => {
        if (!isScrollableReviewAnchorElement(element)) return;
        matches.push({
          element,
          score: getReviewAnchorMatchScore(
            element,
            expectedRect,
            candidate.textFingerprint ?? anchor.textFingerprint,
            index
          )
        });
      });
    } catch {
      return;
    }
  });
  return matches.sort((a, b) => a.score - b.score)[0]?.element;
};
var getReviewItemRestoreScrollPosition = (targetWindow, targetDocument, item, anchorElement) => {
  if (anchorElement) {
    const rect = anchorElement.getBoundingClientRect();
    return clampDocumentScrollPosition(targetDocument, {
      left: targetWindow.scrollX + rect.left - Math.max(0, (targetWindow.innerWidth - rect.width) / 2),
      top: targetWindow.scrollY + rect.top - Math.max(0, (targetWindow.innerHeight - rect.height) / 2)
    });
  }
  return clampDocumentScrollPosition(targetDocument, {
    left: item.scroll?.x ?? 0,
    top: item.scroll?.y ?? 0
  });
};
var setDocumentScrollInstantly = (targetWindow, targetDocument, position) => {
  const scrollElement = targetDocument.scrollingElement;
  if (scrollElement) {
    scrollElement.scrollLeft = position.left;
    scrollElement.scrollTop = position.top;
    return;
  }
  targetWindow.scrollTo(position.left, position.top);
};
var getReviewItemExpectedDocumentRect = (item) => {
  const scroll = item.scroll ?? { x: 0, y: 0 };
  const selection = item.selection?.viewport;
  if (selection && typeof selection.x === "number" && typeof selection.y === "number" && typeof selection.width === "number" && typeof selection.height === "number") {
    return {
      left: scroll.x + selection.x,
      top: scroll.y + selection.y,
      width: selection.width,
      height: selection.height
    };
  }
  const marker = item.marker?.viewport;
  if (marker && typeof marker.x === "number" && typeof marker.y === "number") {
    return {
      left: scroll.x + marker.x,
      top: scroll.y + marker.y,
      width: 1,
      height: 1
    };
  }
  return void 0;
};
var getReviewAnchorMatchScore = (element, expectedRect, textFingerprint, candidateIndex) => {
  const rect = getElementDocumentRect(element);
  let score = candidateIndex * 25;
  if (expectedRect) {
    score += Math.abs(rect.top - expectedRect.top);
    score += Math.abs(rect.left - expectedRect.left) * 0.25;
    score += Math.abs(rect.width - expectedRect.width) * 0.1;
    score += Math.abs(rect.height - expectedRect.height) * 0.1;
  }
  if (textFingerprint) {
    score += (1 - getReviewTextFingerprintScore(textFingerprint, element)) * 100;
  }
  return score;
};
var getElementDocumentRect = (element) => {
  const rect = element.getBoundingClientRect();
  const view = element.ownerDocument.defaultView;
  return {
    left: rect.left + (view?.scrollX ?? 0),
    top: rect.top + (view?.scrollY ?? 0),
    width: rect.width,
    height: rect.height
  };
};
var clampDocumentScrollPosition = (targetDocument, position) => {
  const scrollElement = targetDocument.scrollingElement;
  const view = targetDocument.defaultView;
  const maxLeft = Math.max(
    0,
    (scrollElement?.scrollWidth ?? 0) - (view?.innerWidth ?? 0)
  );
  const maxTop = Math.max(
    0,
    (scrollElement?.scrollHeight ?? 0) - (view?.innerHeight ?? 0)
  );
  return {
    left: Math.min(Math.max(0, Math.round(position.left)), maxLeft),
    top: Math.min(Math.max(0, Math.round(position.top)), maxTop)
  };
};
var getReviewTextFingerprintScore = (expected, element) => {
  const actual = element.textContent?.replace(/\s+/g, " ").trim();
  if (!actual) return 0.5;
  if (expected === actual) return 1;
  if (actual.includes(expected) || expected.includes(actual)) return 0.82;
  const expectedTokens = getReviewFingerprintTokens(expected);
  const actualTokens = new Set(getReviewFingerprintTokens(actual));
  if (expectedTokens.length === 0 || actualTokens.size === 0) return 0.5;
  const matches = expectedTokens.filter((token) => actualTokens.has(token));
  return Math.min(Math.max(matches.length / expectedTokens.length, 0.25), 0.76);
};
var getReviewFingerprintTokens = (value) => value.toLowerCase().split(/[\s/|,.:;()[\]{}"'`~!?<>]+/).map((token) => token.trim()).filter((token) => token.length > 1);
var isScrollableReviewAnchorElement = (element) => {
  const id = element.id.trim().toLowerCase();
  if (element === element.ownerDocument.body || element === element.ownerDocument.documentElement || ["app", "main", "page", "root", "__next", "__nuxt"].includes(id)) {
    return false;
  }
  const rect = element.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0) return false;
  const viewportHeight = element.ownerDocument.documentElement.clientHeight;
  const scrollHeight = element.ownerDocument.documentElement.scrollHeight;
  return !(scrollHeight > viewportHeight * 1.5 && rect.height > viewportHeight * 3);
};

// src/react-shell/review/item.icons.tsx
var import_jsx_runtime14 = require("react/jsx-runtime");
var ReviewScopeIcon = ({ scope }) => {
  if (scope === "mobile") return /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(Smartphone, { "aria-hidden": "true" });
  if (scope === "tablet") return /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(RectangleHorizontal, { "aria-hidden": "true" });
  if (scope === "wide") return /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(Maximize2, { "aria-hidden": "true" });
  if (scope === "dom") return /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(SquareMousePointer, { "aria-hidden": "true" });
  return /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(Monitor, { "aria-hidden": "true" });
};
var getReviewItemMode = (item) => isAnchorRestorableReviewItem(item) ? "dom" : item.kind;
var ReviewItemModeIcon = ({
  mode
}) => {
  if (mode === "area") return /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(Scan, { "aria-hidden": "true" });
  if (mode === "dom") return /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(SquareMousePointer, { "aria-hidden": "true" });
  return /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(StickyNote, { "aria-hidden": "true" });
};

// src/react-shell/qa/item.card.tsx
var import_jsx_runtime15 = require("react/jsx-runtime");
var formatItemCardDate = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    month: "short"
  }).format(date);
};
var QaItemCard = ({
  activeAdapterEntry,
  fields,
  assigneeTitle,
  currentPresetScope,
  getItemPresetScope,
  isOverlayVisible,
  isMutating,
  isRemoteSource,
  numberedItem,
  remoteAdapterEntry,
  copiedPromptKey,
  selectedItemId,
  onChangeItemStatus,
  onChangeItemAssignee,
  onClearSelectedItem,
  onRemoveItem,
  onCopyItemLabel,
  onCopyItemLink,
  onCopyItemPrompt,
  onCopyRemoteIssuePath,
  onEditItem,
  onRestoreReviewItem,
  onSubmitItem,
  onToggleItemOverlayVisibility
}) => {
  const { item } = numberedItem;
  const itemMode = getReviewItemMode(item);
  const isSubmitted = item.submitStatus === "submitted";
  const isSubmitting = item.submitStatus === "submitting";
  const canRemoveItem = activeAdapterEntry.canRemove && !isSubmitting && !isMutating && (isRemoteSource || !isSubmitted);
  const itemComment = item.comment.trim() || getItemTitle(item);
  const itemAuthor = item.createdBy?.trim();
  const promptCopyKey = `qa:${item.id}`;
  const labelCopyKey = `label:${item.id}`;
  const linkCopyKey = `link:${item.id}`;
  const remoteIssueCopyKey = `remote-link:${item.id}`;
  const isPromptCopied = copiedPromptKey === promptCopyKey;
  const isLabelCopied = copiedPromptKey === labelCopyKey;
  const isLinkCopied = copiedPromptKey === linkCopyKey;
  const isRemoteIssueCopied = copiedPromptKey === remoteIssueCopyKey;
  const statusOptions = activeAdapterEntry.statusOptions;
  const isActive = item.id === selectedItemId;
  const canUpdateStatus = Boolean(activeAdapterEntry.updateStatus) && statusOptions.length > 0 && !isSubmitting;
  const canUpdateAssignee = Boolean(activeAdapterEntry.updateAssignee) && activeAdapterEntry.assigneeOptions.length > 0 && !isSubmitting;
  const canEditItem = activeAdapterEntry.canUpdate && !isSubmitting && !isMutating;
  const itemTitle = fields.title ? item.title?.trim() : "";
  const itemMeta = [formatItemCardDate(item.createdAt), itemAuthor].filter(Boolean).join(" | ");
  return /* @__PURE__ */ (0, import_jsx_runtime15.jsxs)(
    "article",
    {
      "aria-busy": isMutating ? "true" : "false",
      className: `df-review-item-card${isActive ? " is-active" : ""}${getItemPresetScope(item) !== currentPresetScope ? " is-dim" : ""}${isOverlayVisible ? "" : " is-overlay-hidden"}${isMutating ? " is-mutating" : ""}`,
      onClick: () => {
        if (isActive) {
          onClearSelectedItem();
          return;
        }
        onRestoreReviewItem(item);
      },
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime15.jsxs)("div", { className: "df-review-item-header", children: [
          /* @__PURE__ */ (0, import_jsx_runtime15.jsxs)("div", { className: "df-review-item-main", children: [
            /* @__PURE__ */ (0, import_jsx_runtime15.jsxs)("span", { className: "df-review-item-badges", children: [
              /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(
                "button",
                {
                  "aria-label": isLabelCopied ? "Copied QA number" : "Copy QA number",
                  className: `df-review-item-id${isLabelCopied ? " is-copied" : ""}`,
                  title: isLabelCopied ? "Copied QA number" : "Copy QA number",
                  type: "button",
                  onClick: (event) => {
                    event.stopPropagation();
                    onCopyItemLabel(numberedItem);
                  },
                  children: numberedItem.displayLabel
                }
              ),
              /* @__PURE__ */ (0, import_jsx_runtime15.jsxs)(
                "span",
                {
                  className: `df-review-item-scope is-scope-${numberedItem.scope}`,
                  children: [
                    /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(ReviewScopeIcon, { scope: numberedItem.scope }),
                    numberedItem.label
                  ]
                }
              ),
              /* @__PURE__ */ (0, import_jsx_runtime15.jsxs)("span", { className: `df-review-item-mode is-mode-${itemMode}`, children: [
                /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(ReviewItemModeIcon, { mode: itemMode }),
                itemMode
              ] })
            ] }),
            itemTitle && /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("strong", { className: "df-review-item-title", children: itemTitle }),
            /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(
              "p",
              {
                className: `df-review-item-comment${itemTitle ? "" : " is-primary"}`,
                children: itemComment
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("small", { className: "df-review-item-meta", children: itemMeta }),
            isMutating && /* @__PURE__ */ (0, import_jsx_runtime15.jsxs)("small", { className: "df-review-item-saving", "aria-live": "polite", children: [
              /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("span", { className: "df-review-spinner", "aria-hidden": "true" }),
              "Saving QA..."
            ] }),
            item.submitError && /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("small", { className: "df-review-item-error", children: item.submitError })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime15.jsxs)(
            "div",
            {
              className: "df-review-item-header-actions",
              onClick: (event) => event.stopPropagation(),
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(
                  "button",
                  {
                    "aria-label": isOverlayVisible ? "Hide QA overlay" : "Show QA overlay",
                    className: `df-review-item-visibility${isOverlayVisible ? " is-visible" : " is-hidden"}`,
                    type: "button",
                    onClick: () => onToggleItemOverlayVisibility(item.id),
                    children: isOverlayVisible ? /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(Eye, { "aria-hidden": "true" }) : /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(EyeOff, { "aria-hidden": "true" })
                  }
                ),
                /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(
                  "button",
                  {
                    "aria-label": isLinkCopied ? "Copied QA link" : "Copy QA link",
                    className: `df-review-item-link-copy${isLinkCopied ? " is-copied" : ""}`,
                    title: isLinkCopied ? "Copied QA link" : "Copy QA link",
                    type: "button",
                    onClick: () => onCopyItemLink(numberedItem),
                    children: /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(Link2, { "aria-hidden": "true" })
                  }
                ),
                canEditItem && /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(
                  "button",
                  {
                    "aria-label": "Edit QA",
                    className: "df-review-item-edit",
                    title: "Edit QA",
                    type: "button",
                    onClick: () => onEditItem(item),
                    children: /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(Pencil, { "aria-hidden": "true" })
                  }
                ),
                canRemoveItem && /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(
                  "button",
                  {
                    "aria-label": "Delete QA",
                    className: "df-review-item-delete",
                    type: "button",
                    onClick: () => void onRemoveItem(item),
                    children: /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(X, { "aria-hidden": "true" })
                  }
                )
              ]
            }
          )
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime15.jsxs)("div", { className: "df-review-item-actions", children: [
          /* @__PURE__ */ (0, import_jsx_runtime15.jsxs)("div", { className: "df-review-item-workflow-actions", children: [
            /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(
              QaItemStatusActions,
              {
                canUpdateStatus,
                isDisabled: isMutating,
                item,
                statusOptions,
                onChangeItemStatus
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(
              QaItemAssigneeActions,
              {
                assigneeOptions: activeAdapterEntry.assigneeOptions,
                assigneeTitle,
                canUpdateAssignee,
                isDisabled: isMutating,
                item,
                onChangeItemAssignee
              }
            )
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(
            "div",
            {
              className: "df-review-item-prompt-actions",
              onClick: (event) => event.stopPropagation(),
              children: /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(
                "button",
                {
                  "aria-label": isPromptCopied ? "Copied QA prompt" : "Copy QA prompt",
                  className: `df-review-item-action-button df-review-item-prompt-copy${isPromptCopied ? " is-copied" : ""}`,
                  title: isPromptCopied ? "Copied QA prompt" : "Copy QA prompt",
                  type: "button",
                  onClick: () => onCopyItemPrompt(numberedItem),
                  children: isPromptCopied ? /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(Copy, { "aria-hidden": "true" }) : /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(Bot, { "aria-hidden": "true" })
                }
              )
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(
            QaItemRemoteActions,
            {
              isRemoteSource,
              isSubmitted,
              isSubmitting: isSubmitting || isMutating,
              item,
              isRemoteIssueCopied,
              numberedItem,
              remoteAdapterEntry,
              onCopyRemoteIssuePath,
              onSubmitItem
            }
          )
        ] })
      ]
    }
  );
};

// src/react-shell/qa/panel.header.tsx
var import_jsx_runtime16 = require("react/jsx-runtime");
var QaPanelHeader = ({
  activeItemCount,
  activeRemainingItemCount,
  filteredItemCount,
  isAllQaVisible,
  isLoading,
  label,
  qaFilter,
  qaFilterCounts,
  qaStatusFilter,
  qaStatusFilterCounts,
  showSourceSelect,
  source,
  sourceEntries,
  statusOptions,
  onChangeReviewSource,
  onQaFilterChange,
  onQaStatusFilterChange,
  onRefreshReviewData
}) => {
  const statusFilterOptions = getStatusFilterOptions(statusOptions);
  const hasActiveFilter = qaFilter !== "all" || qaStatusFilter !== "all";
  const displayLabel = getQaSourceDisplayLabel(label);
  return /* @__PURE__ */ (0, import_jsx_runtime16.jsxs)("div", { className: "df-review-list-header", children: [
    /* @__PURE__ */ (0, import_jsx_runtime16.jsxs)("div", { className: "df-review-list-title", children: [
      /* @__PURE__ */ (0, import_jsx_runtime16.jsxs)("span", { className: "df-review-list-meta", children: [
        /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("span", { children: isAllQaVisible ? `${displayLabel} QA \xB7 All pages` : `${displayLabel} QA` }),
        /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(
          "strong",
          {
            title: `${activeRemainingItemCount} remaining of ${activeItemCount}`,
            children: !hasActiveFilter ? `${activeRemainingItemCount}/${activeItemCount}` : `${filteredItemCount}/${activeItemCount}`
          }
        )
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("div", { className: "df-review-filter-tabs", "aria-label": "QA filters", children: REVIEW_QA_FILTERS.map((filter) => {
        const count = qaFilterCounts.get(filter.key) ?? 0;
        const isActive = qaFilter === filter.key;
        return /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(
          "button",
          {
            "aria-label": `${filter.label} QA (${count})`,
            "aria-pressed": isActive,
            className: `df-review-filter-tab${isActive ? " is-active" : ""}`,
            type: "button",
            onClick: () => onQaFilterChange(filter.key),
            children: /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("span", { className: "df-review-filter-icon", children: filter.scope ? /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(ReviewScopeIcon, { scope: filter.scope }) : /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(ListFilter, { "aria-hidden": "true" }) })
          },
          filter.key
        );
      }) })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime16.jsxs)("div", { className: "df-review-list-toolbar", children: [
      /* @__PURE__ */ (0, import_jsx_runtime16.jsxs)("div", { className: "df-review-list-controls", children: [
        showSourceSelect && /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(
          "select",
          {
            "aria-label": "QA source",
            className: "df-review-source-select",
            value: source,
            onChange: (event) => onChangeReviewSource(event.currentTarget.value),
            children: sourceEntries.map((entry) => /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("option", { value: entry.label, children: entry.label }, entry.label))
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(
          "button",
          {
            "aria-label": "Refresh QA",
            "aria-busy": isLoading ? "true" : "false",
            className: `df-review-source-refresh${isLoading ? " is-loading" : ""}`,
            disabled: isLoading,
            type: "button",
            onClick: () => void onRefreshReviewData(),
            children: /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(RefreshCw, { "aria-hidden": "true" })
          }
        )
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime16.jsxs)(
        "select",
        {
          "aria-label": "QA status filter",
          className: "df-review-status-filter-select",
          value: qaStatusFilter,
          onChange: (event) => onQaStatusFilterChange(
            event.currentTarget.value
          ),
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("option", { value: "all", children: `All status (${qaStatusFilterCounts.get("all") ?? 0})` }),
            statusFilterOptions.map((statusOption) => /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("option", { value: statusOption.value, children: `${statusOption.label} (${qaStatusFilterCounts.get(statusOption.value) ?? 0})` }, statusOption.value))
          ]
        }
      )
    ] })
  ] });
};
function getQaSourceDisplayLabel(label) {
  return label === "local" ? "Local" : label;
}
function getStatusFilterOptions(statusOptions) {
  const seen = /* @__PURE__ */ new Set();
  return statusOptions.flatMap((statusOption) => {
    const value = normalizeReviewItemStatus(statusOption.value);
    if (seen.has(value)) return [];
    seen.add(value);
    return [{
      value,
      label: statusOption.label
    }];
  });
}

// src/react-shell/qa/panel.tsx
var import_jsx_runtime17 = require("react/jsx-runtime");
var ReviewQaPanel = ({
  activeAdapterEntry,
  activeItems,
  activeRemainingItemCount,
  fields,
  assigneeTitle,
  currentPresetScope,
  filteredNumberedActiveItems,
  getItemPresetScope,
  hiddenOverlayItemIds,
  isAllQaVisible,
  isListVisible,
  isLoading,
  isRemoteSource,
  mutatingItemIds,
  copiedPromptKey,
  qaFilter,
  qaFilterCounts,
  qaStatusFilter,
  qaStatusFilterCounts,
  remoteAdapterEntry,
  selectedItemId,
  showSourceSelect,
  source,
  sourceEntries,
  onChangeItemStatus,
  onChangeItemAssignee,
  onClearSelectedItem,
  onChangeReviewSource,
  onCopyItemLabel,
  onCopyItemLink,
  onCopyItemPrompt,
  onCopyRemoteIssuePath,
  onEditItem,
  onQaFilterChange,
  onQaStatusFilterChange,
  onRefreshReviewData,
  onRemoveItem,
  onRestoreReviewItem,
  onSubmitItem,
  onToggleItemOverlayVisibility
}) => {
  const emptyMessage = isAllQaVisible ? `No ${activeAdapterEntry.label} QA.` : isRemoteSource ? `No ${activeAdapterEntry.label} QA on this page.` : "No QA on this page.";
  return /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)("aside", { className: "df-review-qa-panel", "aria-hidden": !isListVisible, children: [
    /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("div", { className: "df-review-panel-body", children: /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)("section", { className: "df-review-item-list", children: [
      /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(
        QaPanelHeader,
        {
          activeItemCount: activeItems.length,
          activeRemainingItemCount,
          filteredItemCount: filteredNumberedActiveItems.length,
          isAllQaVisible,
          isLoading,
          label: activeAdapterEntry.label,
          qaFilter,
          qaFilterCounts,
          qaStatusFilter,
          qaStatusFilterCounts,
          showSourceSelect,
          source,
          sourceEntries,
          statusOptions: activeAdapterEntry.statusOptions,
          onChangeReviewSource,
          onQaFilterChange,
          onQaStatusFilterChange,
          onRefreshReviewData
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)(
        "div",
        {
          className: "df-review-list-scroll",
          onClick: (event) => {
            if (event.target === event.currentTarget) {
              onClearSelectedItem();
            }
          },
          children: [
            activeItems.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)(
              "p",
              {
                className: `df-review-empty${isLoading ? " is-loading" : ""}`,
                children: [
                  isLoading && /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("span", { className: "df-review-spinner", "aria-hidden": "true" }),
                  /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("span", { children: isLoading ? `Loading ${activeAdapterEntry.label} QA...` : emptyMessage })
                ]
              }
            ),
            activeItems.length > 0 && filteredNumberedActiveItems.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("p", { className: "df-review-empty", children: "No QA in this filter." }),
            filteredNumberedActiveItems.map((numberedItem) => {
              const { item } = numberedItem;
              return /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(
                QaItemCard,
                {
                  activeAdapterEntry,
                  fields,
                  assigneeTitle,
                  currentPresetScope,
                  getItemPresetScope,
                  isOverlayVisible: !hiddenOverlayItemIds.has(item.id),
                  isMutating: mutatingItemIds.has(item.id),
                  isRemoteSource,
                  numberedItem,
                  remoteAdapterEntry,
                  copiedPromptKey,
                  selectedItemId,
                  onChangeItemAssignee,
                  onChangeItemStatus,
                  onClearSelectedItem,
                  onCopyItemLabel,
                  onCopyItemLink,
                  onCopyItemPrompt,
                  onCopyRemoteIssuePath,
                  onEditItem,
                  onRemoveItem,
                  onRestoreReviewItem,
                  onSubmitItem,
                  onToggleItemOverlayVisibility
                },
                item.id
              );
            })
          ]
        }
      )
    ] }) }),
    /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("div", { className: "df-review-qa-draft-host" })
  ] });
};

// src/react-shell/presence/overlay.tsx
var import_react9 = require("react");
var import_jsx_runtime18 = require("react/jsx-runtime");
var getPresenceName = (user) => user.displayName || user.userId;
var PresenceUserIcon = () => /* @__PURE__ */ (0, import_jsx_runtime18.jsxs)("svg", { "aria-hidden": "true", viewBox: "0 0 30 30", children: [
  /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(
    "circle",
    {
      cx: "15",
      cy: "15",
      r: "12.5",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2.6"
    }
  ),
  /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("circle", { cx: "15", cy: "10.5", r: "3.4", fill: "currentColor", stroke: "none" }),
  /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(
    "path",
    {
      d: "M7.8 22.1c.9-4.1 3.4-6.1 7.2-6.1s6.3 2 7.2 6.1c-1.7 1.5-4.1 2.4-7.2 2.4s-5.5-.9-7.2-2.4z",
      fill: "currentColor",
      stroke: "none"
    }
  )
] });
var PresenceOverlay = ({
  presenceSessionId,
  users
}) => {
  const [isExpanded, setIsExpanded] = (0, import_react9.useState)(false);
  if (users.length === 0) return null;
  return /* @__PURE__ */ (0, import_jsx_runtime18.jsxs)(
    "div",
    {
      "aria-label": `Review presence, ${users.length} online`,
      className: `df-review-presence-overlay${isExpanded ? " is-expanded" : ""}`,
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime18.jsxs)(
          "button",
          {
            "aria-label": `Show online reviewers, ${users.length} online`,
            "aria-expanded": isExpanded,
            className: "df-review-presence-button",
            type: "button",
            onClick: () => setIsExpanded((current) => !current),
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(PresenceUserIcon, {}),
              /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("span", { className: "df-review-presence-badge", children: users.length })
            ]
          }
        ),
        isExpanded && /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("div", { className: "df-review-presence-list", role: "list", children: users.map((user) => /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(
          "span",
          {
            className: `df-review-presence-chip${user.sessionId === presenceSessionId ? " is-self" : ""}`,
            role: "listitem",
            style: {
              "--df-review-presence-color": user.color
            },
            title: getPresenceName(user),
            children: /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("span", { children: getPresenceName(user) })
          },
          user.sessionId
        )) })
      ]
    }
  );
};

// src/react-shell/source.hint.ts
var matchesIgnore = (file, patterns) => {
  const normalized = file.replace(/\\/g, "/");
  return patterns.some(
    (pattern) => typeof pattern === "string" ? normalized.includes(pattern) : pattern.test(normalized)
  );
};
function getSourceAttribute(element, ...names) {
  for (const name of names) {
    const value = element.getAttribute(name)?.trim();
    if (value) return value;
  }
  return void 0;
}
function getDataHintFromElement(element) {
  const file = getSourceAttribute(element, "data-wrk-data-file");
  if (!file) return void 0;
  return {
    component: void 0,
    file,
    line: getSourceAttribute(element, "data-wrk-data-line"),
    column: void 0,
    sectionId: void 0,
    sectionIndex: void 0
  };
}
function getSourceHintFromElement(element) {
  const source = {
    component: getSourceAttribute(
      element,
      "data-wrk-source-component",
      "data-component"
    ),
    file: getSourceAttribute(element, "data-wrk-source-file", "data-file"),
    line: getSourceAttribute(element, "data-wrk-source-line"),
    column: getSourceAttribute(element, "data-wrk-source-column"),
    sectionId: getSourceAttribute(element, "data-section-id"),
    sectionIndex: getSourceAttribute(element, "data-section-index")
  };
  return Object.values(source).some(Boolean) ? source : void 0;
}
function getComponentNameFromSourceFile(file) {
  const normalizedFile = file?.trim().replace(/\\/g, "/");
  if (!normalizedFile) return void 0;
  const pathParts = normalizedFile.split("/").filter(Boolean);
  const fileName = pathParts[pathParts.length - 1];
  if (!fileName) return void 0;
  const stem = fileName.replace(/\.[^.]+$/, "");
  const sourceName = stem.toLowerCase() === "index" ? pathParts[pathParts.length - 2]?.replace(/\.[^.]+$/, "") : stem;
  return toPascalCase2(sourceName);
}
function toPascalCase2(value) {
  const words = value?.split(/[._\-\s]+/).map((part) => part.trim()).filter(Boolean);
  if (!words?.length) return void 0;
  return words.map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`).join("");
}
function getDisplaySourcePath(file) {
  const normalizedFile = file?.trim().replace(/\\/g, "/");
  if (!normalizedFile) return void 0;
  const sourceRootMatch = normalizedFile.match(
    /(?:^|\/)((?:dev\/)?src\/.+|app\/.+|pages?\/.+|components\/.+)$/
  );
  return sourceRootMatch?.[1] ?? normalizedFile;
}
function getSourceFileCompareKey(file) {
  return file?.trim().replace(/\\/g, "/") ?? "";
}
function addSourceFileCompareKey(seen, key) {
  if (!key || hasEquivalentSourceFileKey(seen, key)) return false;
  seen.add(key);
  return true;
}
function hasEquivalentSourceFileKey(seen, key) {
  for (const seenKey of seen) {
    if (isEquivalentSourceFileKey(seenKey, key)) return true;
  }
  return false;
}
function isEquivalentSourceFileKey(a, b) {
  return a === b || a.endsWith(`/${b}`) || b.endsWith(`/${a}`);
}
function isCoreOutlineNode(label, file) {
  const text = `${label} ${file ?? ""}`.toLowerCase();
  return text.includes("core.section") || text.includes("core.content") || text.includes("core.column") || ["coresection", "corecontent", "corecolumn"].includes(label.toLowerCase());
}

// src/react-shell/source.open.ts
var getSourceCandidates = (target, options) => {
  const startElement = getEventElement(target);
  if (!startElement) return [];
  const candidates = [];
  const seen = /* @__PURE__ */ new Set();
  const add = (element2, source, depth2, kind) => {
    if (!source?.file) return;
    const key = getSourceFileCompareKey(source.file);
    if (!addSourceFileCompareKey(seen, key)) return;
    candidates.push(createSourceCandidate(element2, source, depth2, kind));
  };
  let element = startElement;
  let depth = 0;
  while (element && element.nodeType === 1) {
    add(element, getSourceHintFromElement(element), depth, "source");
    add(element, getDataHintFromElement(element), 0, "data");
    if (element === element.ownerDocument.documentElement) break;
    element = element.parentElement;
    depth += 1;
  }
  const ignore = options?.ignore;
  const visible = candidates.filter(
    (candidate) => !isCoreOutlineNode(candidate.label, candidate.source.file) && !(ignore?.length && matchesIgnore(candidate.source.file ?? "", ignore))
  );
  return visible.slice(0, 8);
};
var getSourceOpenUrl = (source, options) => {
  const normalizedOptions = normalizeSourceOpenOptions(options);
  const file = source?.file?.trim();
  if (!file) return null;
  const sourcePath = getSourcePath(file, normalizedOptions.sourceRoot);
  if (!sourcePath) return null;
  const hasPosition = !normalizedOptions.omitPosition;
  const line = hasPosition ? getSourcePosition(source?.line) : null;
  const column = hasPosition ? getSourcePosition(source?.column) : null;
  const editor = normalizedOptions.editor ?? "vscode";
  if (normalizedOptions.urlTemplate) {
    return buildSourceUrlFromTemplate(normalizedOptions.urlTemplate, {
      column,
      file,
      line,
      sourcePath,
      sourceRoot: normalizedOptions.sourceRoot
    });
  }
  if (editor === "webstorm") {
    const params = new URLSearchParams({ file: sourcePath });
    if (line) params.set("line", String(line));
    if (column) params.set("column", String(column));
    return `webstorm://open?${params.toString()}`;
  }
  if (editor === "custom") return null;
  const encodedPath = encodePathForFileScheme(sourcePath);
  const scheme = editor === "cursor" ? "cursor" : "vscode";
  if (!line) return `${scheme}://file/${encodedPath}`;
  if (!column) return `${scheme}://file/${encodedPath}:${line}`;
  return `${scheme}://file/${encodedPath}:${line}:${column}`;
};
var openSourceInEditor = (source, options) => {
  const url = getSourceOpenUrl(source, options);
  if (!url) return false;
  window.open(url, "_blank", "noreferrer");
  return true;
};
function createSourceCandidate(element, source, depth, kind) {
  const confidence = getSourceConfidence(source, depth);
  const fileName = source.file?.split(/[\\/]/).pop() ?? source.file ?? "source";
  const component = source.component?.trim();
  const fallbackComponent = getComponentNameFromSourceFile(source.file);
  const tag = element.tagName.toLowerCase();
  const line = getSourcePosition(source.line);
  const column = getSourcePosition(source.column);
  const position = line ? `:${line}${column ? `:${column}` : ""}` : "";
  return {
    id: `${kind}:${getSourceCandidateKey(source)}`,
    depth,
    element,
    filePath: getDisplaySourcePath(source.file) ?? fileName,
    label: component || fallbackComponent || tag,
    detail: `${fileName}${position}`,
    positionLabel: line ? `${line}:${column ?? 1}` : "",
    confidence,
    confidenceLabel: confidence >= 0.82 ? "high" : confidence >= 0.58 ? "medium" : "low",
    kind,
    usesPosition: confidence >= 0.72 && Boolean(line),
    source
  };
}
function getSourceCandidateKey(source) {
  return [
    source.file,
    source.component,
    source.line,
    source.column,
    source.sectionId,
    source.sectionIndex
  ].filter(Boolean).join("|");
}
function getSourceConfidence(source, depth) {
  let score = source.file ? 0.54 : 0.12;
  if (source.component) score += 0.12;
  if (getSourcePosition(source.line)) score += 0.22;
  if (getSourcePosition(source.column)) score += 0.08;
  if (source.sectionId || source.sectionIndex) score += 0.04;
  score -= Math.min(depth, 5) * 0.045;
  return Math.max(0.1, Math.min(1, Number(score.toFixed(2))));
}
function normalizeSourceOpenOptions(options) {
  return typeof options === "string" ? { sourceRoot: options } : options ?? {};
}
function buildSourceUrlFromTemplate(template, values) {
  const replacements = {
    column: values.column ? String(values.column) : "",
    encodedPath: encodeURIComponent(values.sourcePath),
    file: values.file,
    line: values.line ? String(values.line) : "",
    path: values.sourcePath,
    sourceRoot: values.sourceRoot ?? "",
    uriPath: encodePathForFileScheme(values.sourcePath)
  };
  return template.replace(
    /\{([a-zA-Z]+)\}/g,
    (_, key) => replacements[key] ?? ""
  );
}
function getEventElement(target) {
  if (!target || typeof target !== "object") return null;
  const node = target;
  if (node.nodeType === 1 && typeof node.closest === "function") {
    return node;
  }
  if (node.parentElement && typeof node.parentElement.closest === "function") {
    return node.parentElement;
  }
  return null;
}
function getSourcePath(file, sourceRoot) {
  const normalizedFile = file.replace(/\\/g, "/");
  if (normalizedFile.startsWith("/") || /^[a-zA-Z]:\//.test(normalizedFile)) {
    return normalizedFile;
  }
  const normalizedRoot = sourceRoot?.trim().replace(/\\/g, "/").replace(/\/+$/, "");
  if (!normalizedRoot) return null;
  return `${normalizedRoot}/${normalizedFile.replace(/^\/+/, "")}`;
}
function getSourcePosition(value) {
  const position = Number(value);
  return Number.isInteger(position) && position > 0 ? position : null;
}
function encodePathForFileScheme(path) {
  return encodeURI(path).replace(
    /[#?]/g,
    (match) => match === "#" ? "%23" : "%3F"
  );
}

// src/react-shell/section.outline.ts
var SECTION_OUTLINE_ROOT_SELECTOR = [
  "[data-wrk-source-component]",
  "header[data-wrk-source-file]",
  "footer[data-wrk-source-file]",
  '[role="banner"][data-wrk-source-file]',
  '[role="contentinfo"][data-wrk-source-file]'
].join(", ");
var getSectionOutline = (root, options) => {
  const maxDepth = options?.maxDepth ?? 9;
  return getSectionOutlineRoots(root, options).map((element, index) => {
    const source = getSourceHintFromElement(element);
    const label = getOutlineLabel(element, source, "section");
    const seen = /* @__PURE__ */ new Set();
    if (source?.file) {
      addSourceFileCompareKey(seen, getOutlineSourceKey(source));
    }
    return createSectionOutlineEntry({
      id: `${label}-${index}`,
      label,
      depth: 1,
      filePath: getDisplaySourcePath(source?.file) ?? label,
      element,
      source,
      data: getDataHintFromElement(element),
      children: getSectionOutlineChildren(
        element,
        2,
        maxDepth,
        seen,
        options
      )
    });
  });
};
function getSectionOutlineRoots(root, options) {
  return Array.from(root.querySelectorAll(SECTION_OUTLINE_ROOT_SELECTOR)).filter(
    (element) => {
      const source = getSourceHintFromElement(element);
      const label = getOutlineLabel(element, source, "");
      return !isSkippedOutlineNode(label, source?.file, options);
    }
  );
}
function getSectionOutlineChildren(parent, depth, maxDepth, seen, options) {
  if (depth > maxDepth) return [];
  const entries = [];
  for (const child of Array.from(parent.children)) {
    const source = getSourceHintFromElement(child);
    const label = getOutlineLabel(child, source, child.tagName.toLowerCase());
    const sourceKey = source?.file ? getOutlineSourceKey(source) : "";
    const isNewSource = Boolean(sourceKey) && !hasEquivalentSourceFileKey(seen, sourceKey);
    if (shouldStopOutlineBranch(label, source?.file, options)) continue;
    if (isHiddenOutlineNode(label, source?.file, options)) {
      entries.push(
        ...getSectionOutlineChildren(child, depth, maxDepth, seen, options)
      );
      continue;
    }
    if (source?.file && isNewSource) {
      const childSeen = new Set(seen);
      addSourceFileCompareKey(childSeen, sourceKey);
      entries.push(createSectionOutlineEntry({
        id: `${sourceKey}-${getElementOutlinePath(child)}-${entries.length}`,
        label,
        depth,
        filePath: getDisplaySourcePath(source.file) ?? source.file,
        element: child,
        source,
        data: getDataHintFromElement(child),
        children: getSectionOutlineChildren(
          child,
          depth + 1,
          maxDepth,
          childSeen,
          options
        )
      }));
      continue;
    }
    entries.push(
      ...getSectionOutlineChildren(child, depth, maxDepth, seen, options)
    );
  }
  return entries;
}
function getElementOutlinePath(element) {
  const indices = [];
  let current = element;
  while (current?.parentElement) {
    indices.unshift(Array.from(current.parentElement.children).indexOf(current));
    current = current.parentElement;
  }
  return indices.join("-");
}
function createSectionOutlineEntry(entry) {
  return {
    ...entry,
    metadata: getSectionOutlineMetadata(entry.element, entry.label, entry.source)
  };
}
var truncateOutlineValue = (value, maxLength) => value.length > maxLength ? `${value.slice(0, maxLength - 1)}\u2026` : value;
var normalizeOutlineValue = (value) => value?.replace(/\s+/g, " ").trim() ?? "";
function getSectionOutlineMetadata(element, label, source) {
  const textElement = getPlacerTextElement(element, label, source?.file);
  return {
    rect: getSectionOutlineRect(element),
    textValue: textElement ? truncateOutlineValue(
      normalizeOutlineValue(textElement.textContent),
      180
    ) : void 0,
    fontLabel: textElement ? getFontLabel(textElement) : void 0,
    mediaItems: getPlacerMediaItems(element, label, source?.file),
    classNames: getElementClassNames(element)
  };
}
function getSectionOutlineRect(element) {
  const rect = element.getBoundingClientRect();
  return {
    top: Math.round(rect.top),
    left: Math.round(rect.left),
    width: Math.round(rect.width),
    height: Math.round(rect.height)
  };
}
function getElementClassNames(element) {
  const classNames = Array.from(element.classList).filter(Boolean);
  return classNames.length > 0 ? classNames : void 0;
}
function getPlacerTextElement(element, label, file) {
  if (!isPlacerTextOutlineNode(label, file) && !element.hasAttribute("data-font")) {
    return null;
  }
  return element.hasAttribute("data-font") ? element : element.querySelector("[data-font]");
}
function isPlacerTextOutlineNode(label, file) {
  return `${label} ${file ?? ""}`.toLowerCase().includes("placertext");
}
function getFontLabel(element) {
  const dataFont = element.getAttribute("data-font");
  if (dataFont) {
    return dataFont.replace(/\bs\b/g, "sb").replace(/\bsemibold\b/g, "sb").replace(/\bregular\b/g, "r");
  }
  const style = window.getComputedStyle(element);
  return `${Math.round(parseFloat(style.fontSize))}px ${style.fontWeight}`;
}
function getPlacerMediaItems(element, label, file) {
  if (!isPlacerMediaOutlineNode(label, file)) return void 0;
  const mediaItems = [];
  const seen = /* @__PURE__ */ new Set();
  const addMediaItem = (target, type, url) => {
    const normalizedUrl = normalizeOutlineValue(url);
    if (!normalizedUrl) return;
    const variant = getPlacerMediaVariant(target, element);
    const key = `${variant}:${type}:${normalizedUrl}`;
    if (seen.has(key)) return;
    seen.add(key);
    mediaItems.push({ type, url: normalizedUrl, variant });
  };
  if (element instanceof HTMLVideoElement) {
    addMediaItem(element, "video", getVideoElementUrl(element));
    addMediaItem(element, "image", element.getAttribute("poster"));
  }
  if (element instanceof HTMLImageElement) {
    addMediaItem(element, "image", getMediaElementUrl(element));
  }
  if (element instanceof HTMLSourceElement) {
    addMediaItem(element, "video", getSourceElementUrl(element));
  }
  Array.from(element.querySelectorAll("video")).forEach((video) => {
    addMediaItem(video, "video", getVideoElementUrl(video));
    addMediaItem(video, "image", video.getAttribute("poster"));
  });
  Array.from(element.querySelectorAll("source")).forEach((source) => {
    addMediaItem(source, "video", getSourceElementUrl(source));
  });
  Array.from(element.querySelectorAll("img")).forEach((img) => {
    addMediaItem(img, "image", getMediaElementUrl(img));
  });
  return mediaItems.length > 0 ? mediaItems : void 0;
}
function isPlacerMediaOutlineNode(label, file) {
  return `${label} ${file ?? ""}`.toLowerCase().includes("placermedia");
}
function getPlacerMediaVariant(target, root) {
  let current = target;
  while (current) {
    if (current.classList.contains("d-block-pc")) return "desktop";
    if (current.classList.contains("d-block-m")) return "mobile";
    if (current === root) break;
    current = current.parentElement;
  }
  return "media";
}
function getVideoElementUrl(video) {
  return video.currentSrc || video.getAttribute("src") || video.querySelector("source")?.getAttribute("src") || video.getAttribute("poster") || video.src;
}
function getSourceElementUrl(source) {
  return source.getAttribute("src") || source.src;
}
function getMediaElementUrl(img) {
  return img.currentSrc || img.getAttribute("src") || img.src;
}
function getOutlineSourceKey(source) {
  return getSourceFileCompareKey(source.file);
}
function getOutlineLabel(element, source, fallback) {
  return source?.component?.trim() || getComponentNameFromSourceFile(source?.file) || element.id.trim() || fallback;
}
function isHiddenOutlineNode(label, file, options) {
  const ignore = options?.ignore;
  const isIgnoredSource = file && ignore?.length ? matchesIgnore(file, ignore) : false;
  return isCoreOutlineNode(label, file) || isIgnoredSource;
}
function shouldStopOutlineBranch(label, file, options) {
  return !options?.includePlacer && isPlacerOutlineNode(label, file);
}
function isSkippedOutlineNode(label, file, options) {
  return shouldStopOutlineBranch(label, file, options) || isHiddenOutlineNode(label, file, options);
}
function isPlacerOutlineNode(label, file) {
  return `${label} ${file ?? ""}`.toLowerCase().includes("placer");
}

// src/core/geometry.ts
function rectanglesIntersect(a, b) {
  return a.left < b.left + b.width && a.left + a.width > b.left && a.top < b.top + b.height && a.top + a.height > b.top;
}
function getPointSelection(point) {
  return {
    left: point.x,
    top: point.y,
    width: 1,
    height: 1
  };
}
function toViewportSelection(selection) {
  return {
    left: selection.x,
    top: selection.y,
    width: selection.width,
    height: selection.height
  };
}
function toPublicSelection(selection) {
  return {
    x: Math.round(selection.left),
    y: Math.round(selection.top),
    width: Math.round(selection.width),
    height: Math.round(selection.height)
  };
}
function getSelectionCenter(selection) {
  if ("left" in selection) {
    return {
      x: selection.left + selection.width / 2,
      y: selection.top + selection.height / 2
    };
  }
  return {
    x: selection.x + selection.width / 2,
    y: selection.y + selection.height / 2
  };
}
function isRelativeSelection(value) {
  if (!value || typeof value !== "object") return false;
  const selection = value;
  return typeof selection.x === "number" && typeof selection.y === "number" && typeof selection.width === "number" && typeof selection.height === "number";
}
function getViewportSize(environment) {
  const targetWindow = environment?.window ?? window;
  return {
    width: targetWindow.innerWidth,
    height: targetWindow.innerHeight
  };
}
function isPointInViewport(point, environment) {
  const viewport = getViewportSize(environment);
  return point.x >= 0 && point.y >= 0 && point.x <= viewport.width && point.y <= viewport.height;
}
function isSelectionInViewport(selection, environment) {
  const viewport = getViewportSize(environment);
  return rectanglesIntersect(selection, {
    left: 0,
    top: 0,
    width: viewport.width,
    height: viewport.height
  });
}
function clampPoint(point, environment) {
  const viewport = getViewportSize(environment);
  return {
    x: clamp(point.x, 0, viewport.width),
    y: clamp(point.y, 0, viewport.height)
  };
}
function getPopoverPosition(point, environment, options) {
  const bounds = getPopoverBounds(environment);
  const margin = 12;
  const width = Math.min(
    options?.width ?? 320,
    Math.max(240, bounds.width - margin * 2)
  );
  const estimatedHeight = options?.estimatedHeight ?? 178;
  const offset = options?.offset ?? 12;
  return {
    left: clamp(
      point.x + offset,
      bounds.left + margin,
      bounds.left + bounds.width - width - margin
    ),
    top: clamp(
      point.y + offset,
      bounds.top + margin,
      bounds.top + bounds.height - estimatedHeight - margin
    )
  };
}
function getPopoverBounds(environment) {
  if (!environment) {
    return {
      left: 0,
      top: 0,
      width: window.innerWidth,
      height: window.innerHeight
    };
  }
  return environment.overlayRect;
}
function toHostPoint(point, environment) {
  if (!environment) return point;
  return {
    x: point.x + environment.viewportRect.left,
    y: point.y + environment.viewportRect.top
  };
}
function toHostSelection(selection, environment) {
  return {
    left: selection.left + environment.viewportRect.left,
    top: selection.top + environment.viewportRect.top,
    width: selection.width,
    height: selection.height
  };
}
function toTargetPoint(point, environment) {
  if (!environment) return point;
  return {
    x: point.x - environment.viewportRect.left,
    y: point.y - environment.viewportRect.top
  };
}
function toTargetPointFromHostEvent(event, environment) {
  return toTargetPoint(
    {
      x: event.clientX,
      y: event.clientY
    },
    environment
  );
}
function placeLayerOverTarget(layer, environment) {
  layer.style.left = `${environment.viewportRect.left}px`;
  layer.style.top = `${environment.viewportRect.top}px`;
  layer.style.width = `${environment.viewportRect.width}px`;
  layer.style.height = `${environment.viewportRect.height}px`;
  layer.style.right = "auto";
  layer.style.bottom = "auto";
}
function clamp(value, min, max) {
  return Math.min(Math.max(value, min), Math.max(min, max));
}
function roundRatio(value) {
  return Math.round(value * 1e4) / 1e4;
}
function roundPoint(point) {
  return {
    x: Math.round(point.x),
    y: Math.round(point.y)
  };
}

// src/core/scroll.ts
function waitForNextFrame(environment) {
  return new Promise((resolve) => {
    (environment?.window ?? window).requestAnimationFrame(() => resolve());
  });
}
function runWithAutoScrollBehavior(targetDocument, callback) {
  const elements = [
    targetDocument.documentElement,
    targetDocument.body
  ].filter((element) => Boolean(element));
  const previousValues = elements.map((element) => element.style.scrollBehavior);
  elements.forEach((element) => {
    element.style.scrollBehavior = "auto";
  });
  try {
    callback();
  } finally {
    elements.forEach((element, index) => {
      element.style.scrollBehavior = previousValues[index] ?? "";
    });
  }
}
function setDocumentScrollInstantly2(environment, position) {
  const scrollElement = environment.document.scrollingElement;
  if (scrollElement) {
    scrollElement.scrollLeft = Math.max(0, Math.round(position.x));
    scrollElement.scrollTop = Math.max(0, Math.round(position.y));
    return;
  }
  environment.window.scrollTo(
    Math.max(0, Math.round(position.x)),
    Math.max(0, Math.round(position.y))
  );
}

// src/react-shell/review/shell.helpers.ts
var getReviewModeWriteMode = (mode) => {
  if (mode === "element") return "dom";
  if (mode === "note" || mode === "area") return mode;
  return null;
};
var waitForFrame = (targetWindow) => new Promise((resolve) => {
  (targetWindow ?? window).requestAnimationFrame(() => resolve());
});
var waitForMs = (ms) => new Promise((resolve) => {
  window.setTimeout(resolve, ms);
});
var getScrollElement = (targetDocument) => targetDocument.scrollingElement;
var scrollElementInTarget = (element, block) => {
  const targetWindow = element.ownerDocument.defaultView;
  if (!targetWindow) return;
  const targetDocument = element.ownerDocument;
  const scrollElement = getScrollElement(targetDocument);
  const rect = element.getBoundingClientRect();
  const currentLeft = scrollElement?.scrollLeft ?? targetWindow.scrollX;
  const currentTop = scrollElement?.scrollTop ?? targetWindow.scrollY;
  const clientWidth = scrollElement?.clientWidth ?? targetWindow.innerWidth;
  const clientHeight = scrollElement?.clientHeight ?? targetWindow.innerHeight;
  const scrollWidth = scrollElement?.scrollWidth ?? targetDocument.documentElement.scrollWidth;
  const scrollHeight = scrollElement?.scrollHeight ?? targetDocument.documentElement.scrollHeight;
  const nextLeft = clamp(
    currentLeft + rect.left + rect.width / 2 - clientWidth / 2,
    0,
    Math.max(0, scrollWidth - clientWidth)
  );
  const nextTop = block === "center" ? clamp(
    currentTop + rect.top + rect.height / 2 - clientHeight / 2,
    0,
    Math.max(0, scrollHeight - clientHeight)
  ) : clamp(
    currentTop + rect.top,
    0,
    Math.max(0, scrollHeight - clientHeight)
  );
  runWithAutoScrollBehavior(targetDocument, () => {
    if (scrollElement) {
      scrollElement.scrollLeft = Math.round(nextLeft);
      scrollElement.scrollTop = Math.round(nextTop);
      return;
    }
    targetWindow.scrollTo(Math.round(nextLeft), Math.round(nextTop));
  });
};
var centerFrameScrollOnElement = (frameScroll, frame, element) => {
  if (!frameScroll || !frame) return;
  const frameScrollRect = frameScroll.getBoundingClientRect();
  const frameRect = frame.getBoundingClientRect();
  const elementRect = element.getBoundingClientRect();
  const elementHostCenterX = frameRect.left + elementRect.left + elementRect.width / 2;
  const elementHostCenterY = frameRect.top + elementRect.top + elementRect.height / 2;
  const visibleCenterX = frameScrollRect.left + frameScrollRect.width / 2;
  const visibleCenterY = frameScrollRect.top + frameScrollRect.height / 2;
  const nextLeft = clamp(
    frameScroll.scrollLeft + elementHostCenterX - visibleCenterX,
    0,
    Math.max(0, frameScroll.scrollWidth - frameScroll.clientWidth)
  );
  const nextTop = clamp(
    frameScroll.scrollTop + elementHostCenterY - visibleCenterY,
    0,
    Math.max(0, frameScroll.scrollHeight - frameScroll.clientHeight)
  );
  const previousScrollBehavior = frameScroll.style.scrollBehavior;
  frameScroll.style.scrollBehavior = "auto";
  frameScroll.scrollLeft = Math.round(nextLeft);
  frameScroll.scrollTop = Math.round(nextTop);
  frameScroll.style.scrollBehavior = previousScrollBehavior;
};
var getSectionOutlineFilterTerms = (value) => value.trim().toLowerCase().split(/\s+/).filter(Boolean);
var getSectionOutlineEntryCount = (entries) => entries.reduce(
  (count, entry) => count + 1 + getSectionOutlineEntryCount(entry.children),
  0
);
var getDefaultCollapsedSectionOutlineIds = (entries) => {
  const collapsedIds = /* @__PURE__ */ new Set();
  const visit = (entry) => {
    if (entry.children.length > 0) {
      collapsedIds.add(entry.id);
    }
    entry.children.forEach(visit);
  };
  entries.forEach(visit);
  return collapsedIds;
};
var getLiveSectionOutlineRect = (entry) => {
  if (!entry.element.isConnected) return entry.metadata.rect;
  const rect = entry.element.getBoundingClientRect();
  return {
    top: Math.round(rect.top),
    left: Math.round(rect.left),
    width: Math.round(rect.width),
    height: Math.round(rect.height)
  };
};
var matchesSectionOutlineFilter = (entry, terms) => {
  if (terms.length === 0) return true;
  const text = [
    entry.label,
    entry.filePath,
    entry.source?.file,
    entry.data?.file,
    entry.metadata.textValue,
    entry.metadata.fontLabel,
    entry.metadata.mediaItems?.map((mediaItem) => `${mediaItem.variant} ${mediaItem.type} ${mediaItem.url}`).join(" "),
    entry.metadata.classNames?.join(" ")
  ].filter(Boolean).join(" ").toLowerCase();
  return terms.every((term) => text.includes(term));
};
var filterSectionOutlineEntries = (entries, terms) => {
  if (terms.length === 0) return entries;
  return entries.flatMap((entry) => {
    const children = filterSectionOutlineEntries(entry.children, terms);
    if (!matchesSectionOutlineFilter(entry, terms) && children.length === 0) {
      return [];
    }
    return [{ ...entry, children }];
  });
};

// src/react-shell/review/section.outline.panel.tsx
var import_jsx_runtime19 = require("react/jsx-runtime");
var SectionOutlinePanel = ({
  isPanelVisible,
  isFiltering,
  filteredCount,
  totalCount,
  rootCount,
  filter,
  entries,
  collapsedIds,
  canWriteDom,
  isBoxMetaVisible,
  isFontMetaVisible,
  isMediaMetaVisible,
  isClassMetaVisible,
  onToggleMeta,
  onFilterChange,
  onToggleEntry,
  onScrollToSection,
  onOpenData,
  onOpenSource,
  onStartDomReview,
  onHoverElement,
  onClearHover
}) => {
  const renderMeta = (entry) => {
    const { metadata } = entry;
    const rows = [];
    const metaPaddingLeft = 29;
    const rect = getLiveSectionOutlineRect(entry);
    if (isBoxMetaVisible) {
      rows.push(
        /* @__PURE__ */ (0, import_jsx_runtime19.jsxs)("span", { className: "df-review-section-outline-meta-row", children: [
          /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("b", { children: "box" }),
          /* @__PURE__ */ (0, import_jsx_runtime19.jsxs)("code", { children: [
            "top ",
            rect.top,
            " / left ",
            rect.left,
            " / width ",
            rect.width,
            " / height",
            " ",
            rect.height
          ] })
        ] }, "box")
      );
    }
    if (metadata.textValue) {
      rows.push(
        /* @__PURE__ */ (0, import_jsx_runtime19.jsxs)(
          "span",
          {
            className: "df-review-section-outline-meta-row is-text",
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("b", { children: "text" }),
              /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("code", { children: metadata.textValue })
            ]
          },
          "text"
        )
      );
    }
    if (isFontMetaVisible && metadata.fontLabel) {
      rows.push(
        /* @__PURE__ */ (0, import_jsx_runtime19.jsxs)("span", { className: "df-review-section-outline-meta-row", children: [
          /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("b", { children: "font" }),
          /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("code", { children: metadata.fontLabel })
        ] }, "font")
      );
    }
    if (isMediaMetaVisible && metadata.mediaItems?.length) {
      metadata.mediaItems.forEach((mediaItem) => {
        const mediaKey = `${mediaItem.variant}:${mediaItem.type}:${mediaItem.url}`;
        const mediaLabel = mediaItem.variant === "media" ? mediaItem.type : mediaItem.variant;
        rows.push(
          /* @__PURE__ */ (0, import_jsx_runtime19.jsxs)(
            "span",
            {
              className: "df-review-section-outline-meta-row is-media",
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("b", { children: mediaLabel }),
                /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(
                  "a",
                  {
                    className: "df-review-section-outline-media-link",
                    href: mediaItem.url,
                    rel: "noopener noreferrer",
                    target: "_blank",
                    title: `${mediaLabel} ${mediaItem.type}`,
                    children: /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("code", { children: mediaItem.url })
                  }
                )
              ]
            },
            mediaKey
          )
        );
      });
    }
    if (isClassMetaVisible && metadata.classNames?.length) {
      rows.push(
        /* @__PURE__ */ (0, import_jsx_runtime19.jsxs)("span", { className: "df-review-section-outline-meta-row is-class", children: [
          /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("b", { children: "class" }),
          /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("span", { className: "df-review-section-outline-class-tags", children: metadata.classNames.map((className) => /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("code", { children: className }, className)) })
        ] }, "class")
      );
    }
    if (rows.length === 0) return null;
    return /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(
      "div",
      {
        className: "df-review-section-outline-meta",
        style: { paddingLeft: `${metaPaddingLeft}px` },
        children: rows
      }
    );
  };
  const renderEntry = (entry) => {
    const hasChildren = entry.children.length > 0;
    const isCollapsed = !isFiltering && collapsedIds.has(entry.id);
    const liveRect = getLiveSectionOutlineRect(entry);
    const isZeroArea = liveRect.width <= 0 || liveRect.height <= 0;
    return /* @__PURE__ */ (0, import_jsx_runtime19.jsxs)(
      "div",
      {
        className: `df-review-section-outline-item is-depth-${entry.depth}`,
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime19.jsxs)(
            "div",
            {
              className: "df-review-section-outline-entry-body",
              onMouseEnter: () => onHoverElement(entry.element),
              onMouseLeave: onClearHover,
              onMouseOver: () => onHoverElement(entry.element),
              onMouseOut: (event) => {
                if (event.relatedTarget instanceof Node && event.currentTarget.contains(event.relatedTarget)) {
                  return;
                }
                onClearHover();
              },
              onPointerEnter: () => onHoverElement(entry.element),
              onPointerLeave: onClearHover,
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime19.jsxs)(
                  "div",
                  {
                    className: "df-review-section-outline-row",
                    style: { paddingLeft: "6px" },
                    children: [
                      hasChildren ? /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(
                        "button",
                        {
                          "aria-label": isCollapsed ? `Expand ${entry.label}` : `Collapse ${entry.label}`,
                          "aria-expanded": !isCollapsed,
                          className: `df-review-section-outline-toggle${isCollapsed ? " is-collapsed" : ""}`,
                          type: "button",
                          onClick: () => onToggleEntry(entry.id),
                          children: /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(ChevronDown, { "aria-hidden": "true" })
                        }
                      ) : /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(
                        "span",
                        {
                          "aria-hidden": "true",
                          className: "df-review-section-outline-toggle is-placeholder"
                        }
                      ),
                      /* @__PURE__ */ (0, import_jsx_runtime19.jsxs)(
                        "button",
                        {
                          className: "df-review-section-outline-name",
                          title: entry.filePath,
                          type: "button",
                          onClick: () => onScrollToSection(entry),
                          children: [
                            /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("span", { children: entry.label }),
                            /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("small", { children: entry.filePath })
                          ]
                        }
                      ),
                      /* @__PURE__ */ (0, import_jsx_runtime19.jsxs)("span", { className: "df-review-section-outline-links", children: [
                        /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(
                          "button",
                          {
                            "aria-label": `Open ${entry.label} data`,
                            className: "df-review-section-outline-link",
                            title: "Open data",
                            type: "button",
                            disabled: !entry.data?.file,
                            onClick: () => onOpenData(entry),
                            children: /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(Database, { "aria-hidden": "true" })
                          }
                        ),
                        /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(
                          "button",
                          {
                            "aria-label": `Open ${entry.label} source`,
                            className: "df-review-section-outline-link",
                            title: "Open source",
                            type: "button",
                            disabled: !entry.source?.file,
                            onClick: () => onOpenSource(entry),
                            children: /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(CodeXml, { "aria-hidden": "true" })
                          }
                        ),
                        /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(
                          "span",
                          {
                            "aria-hidden": "true",
                            className: "df-review-section-outline-divider",
                            children: "|"
                          }
                        ),
                        /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(
                          "button",
                          {
                            "aria-label": `Start DOM QA for ${entry.label}`,
                            className: "df-review-section-outline-link is-dom-select",
                            title: isZeroArea ? "No visible area" : "DOM select",
                            type: "button",
                            disabled: !canWriteDom || isZeroArea,
                            onClick: () => onStartDomReview(entry),
                            children: /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(SquareMousePointer, { "aria-hidden": "true" })
                          }
                        )
                      ] })
                    ]
                  }
                ),
                renderMeta(entry)
              ]
            }
          ),
          hasChildren && !isCollapsed && /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("div", { className: "df-review-section-outline-children", children: entry.children.map(renderEntry) })
        ]
      },
      entry.id
    );
  };
  return /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(
    "aside",
    {
      className: "df-review-source-tree-panel",
      "aria-hidden": !isPanelVisible,
      children: /* @__PURE__ */ (0, import_jsx_runtime19.jsxs)("div", { id: "df-review-section-outline", className: "df-review-section-outline", children: [
        /* @__PURE__ */ (0, import_jsx_runtime19.jsxs)("div", { className: "df-review-section-outline-head", children: [
          /* @__PURE__ */ (0, import_jsx_runtime19.jsxs)("div", { className: "df-review-section-outline-summary", children: [
            /* @__PURE__ */ (0, import_jsx_runtime19.jsxs)("span", { children: [
              /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("strong", { children: "Component" }),
              /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("small", { children: isFiltering ? `${filteredCount} / ${totalCount} results` : `${rootCount} ${rootCount === 1 ? "root" : "roots"}` })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime19.jsxs)("div", { className: "df-review-section-outline-meta-controls", children: [
              /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(
                "button",
                {
                  "aria-label": "Toggle source tree box metadata",
                  "aria-pressed": isBoxMetaVisible,
                  className: `df-review-section-outline-meta-toggle${isBoxMetaVisible ? " is-active" : ""}`,
                  title: "top / left / width / height",
                  type: "button",
                  onClick: () => onToggleMeta("box"),
                  children: /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(SquareDashed, { "aria-hidden": "true" })
                }
              ),
              /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(
                "button",
                {
                  "aria-label": "Toggle source tree font metadata",
                  "aria-pressed": isFontMetaVisible,
                  className: `df-review-section-outline-meta-toggle${isFontMetaVisible ? " is-active" : ""}`,
                  title: "font size / weight",
                  type: "button",
                  onClick: () => onToggleMeta("font"),
                  children: /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(Type, { "aria-hidden": "true" })
                }
              ),
              /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(
                "button",
                {
                  "aria-label": "Toggle source tree media metadata",
                  "aria-pressed": isMediaMetaVisible,
                  className: `df-review-section-outline-meta-toggle${isMediaMetaVisible ? " is-active" : ""}`,
                  title: "media urls",
                  type: "button",
                  onClick: () => onToggleMeta("media"),
                  children: /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(Image, { "aria-hidden": "true" })
                }
              ),
              /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(
                "button",
                {
                  "aria-label": "Toggle source tree class metadata",
                  "aria-pressed": isClassMetaVisible,
                  className: `df-review-section-outline-meta-toggle${isClassMetaVisible ? " is-active" : ""}`,
                  title: "class names",
                  type: "button",
                  onClick: () => onToggleMeta("className"),
                  children: /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(CodeXml, { "aria-hidden": "true" })
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime19.jsxs)("div", { className: "df-review-section-outline-filter", children: [
            /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(Search, { "aria-hidden": "true" }),
            /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(
              "input",
              {
                "aria-label": "Filter source tree",
                type: "text",
                value: filter,
                placeholder: "Filter",
                autoComplete: "off",
                enterKeyHint: "search",
                spellCheck: false,
                onChange: (event) => onFilterChange(event.currentTarget.value)
              }
            ),
            filter && /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(
              "button",
              {
                "aria-label": "Clear source tree filter",
                className: "df-review-section-outline-filter-clear",
                type: "button",
                onMouseDown: (event) => event.preventDefault(),
                onClick: () => onFilterChange(""),
                children: /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(X, { "aria-hidden": "true" })
              }
            )
          ] })
        ] }),
        entries.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("div", { className: "df-review-section-outline-list", children: entries.map(renderEntry) }) : /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("div", { className: "df-review-section-outline-empty", children: isFiltering ? "No source matches" : "No sections found" })
      ] })
    }
  );
};

// src/react-shell/review/source.shortcut.style.ts
function createSourceShortcutStyle(optionAttribute, fontOverlayAttribute) {
  return `
      html[${optionAttribute}="true"],
      html[${optionAttribute}="true"] * {
        cursor: crosshair !important;
      }

      html[${optionAttribute}="true"] .helper-figma-root,
      html[${optionAttribute}="true"] .helper-figma-root *,
      html[${optionAttribute}="true"] .helper-figma-loading-backdrop,
      html[${optionAttribute}="true"] .helper-figma-loading-backdrop * {
        pointer-events: none !important;
      }

      html[${optionAttribute}="true"] body::before {
        position: fixed !important;
        z-index: 2147483647 !important;
        top: 10px !important;
        left: 50% !important;
        transform: translateX(-50%) !important;
        display: block !important;
        border: 1px solid rgba(124, 199, 255, 0.72) !important;
        border-radius: 999px !important;
        padding: 6px 10px !important;
        color: #ffffff !important;
        background: rgba(15, 23, 42, 0.86) !important;
        box-shadow: 0 10px 28px rgba(0, 0, 0, 0.24) !important;
        content: "Source select" !important;
        font: 500 12px/1 system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif !important;
        pointer-events: none !important;
      }

      [${fontOverlayAttribute}] {
        position: fixed !important;
        z-index: 2147483647 !important;
        display: flex !important;
        flex-direction: column !important;
        width: max-content !important;
        max-width: calc(100vw - 8px) !important;
        border: 1px solid rgba(124, 199, 255, 0.72) !important;
        border-radius: 6px !important;
        padding: 4px 6px !important;
        color: #ffffff !important;
        background: rgba(15, 23, 42, 0.9) !important;
        box-shadow: 0 8px 22px rgba(0, 0, 0, 0.28) !important;
        font: 500 11px/1.35 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace !important;
        overflow-wrap: anywhere !important;
        pointer-events: none !important;
        white-space: normal !important;
      }

      [${fontOverlayAttribute}] > span {
        display: grid !important;
        grid-template-columns: auto minmax(0, 1fr) !important;
        justify-content: space-between !important;
        gap: 10px !important;
      }

      [${fontOverlayAttribute}] > span > span:last-child {
        min-width: 0 !important;
        text-align: right !important;
      }

      [${fontOverlayAttribute}][hidden] {
        display: none !important;
      }
    `;
}

// src/react-shell/review/source.inspector.overlay.tsx
var import_jsx_runtime20 = require("react/jsx-runtime");
var SourceInspectorOverlay = ({
  state,
  interactionRef,
  onClear,
  onOpenCandidate
}) => {
  if (!state) return null;
  return /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)(import_jsx_runtime20.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(
      "div",
      {
        className: `df-review-source-outline${state.isPinned ? " is-pinned" : ""}`,
        style: {
          height: `${state.rect.height}px`,
          left: `${state.rect.left}px`,
          top: `${state.rect.top}px`,
          width: `${state.rect.width}px`
        }
      }
    ),
    state.candidates.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)(
      "div",
      {
        className: `df-review-source-popover${state.isPinned ? " is-pinned" : ""}`,
        style: {
          left: state.panelRight === null ? `${state.panelLeft}px` : void 0,
          maxWidth: `${state.panelMaxWidth}px`,
          right: state.panelRight === null ? void 0 : `${state.panelRight}px`,
          top: `${state.panelTop}px`
        },
        onPointerDown: () => {
          interactionRef.current = true;
        },
        onPointerEnter: () => {
          interactionRef.current = true;
        },
        onPointerLeave: () => {
          interactionRef.current = false;
        },
        onClick: (event) => event.stopPropagation(),
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("div", { className: "df-review-source-popover-close", children: /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(
            "button",
            {
              "aria-label": "Close source candidates",
              type: "button",
              onClick: onClear,
              children: "\xD7"
            }
          ) }),
          /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("div", { className: "df-review-source-candidate-list", children: state.candidates.map((candidate) => /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(
            "button",
            {
              className: `df-review-source-candidate is-${candidate.kind}`,
              type: "button",
              onClick: (event) => {
                event.preventDefault();
                event.stopPropagation();
                onOpenCandidate(candidate);
              },
              children: /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("span", { className: "df-review-source-candidate-main", children: [
                /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("strong", { children: candidate.label }),
                /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("span", { children: candidate.filePath }),
                /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("small", { children: candidate.positionLabel || "-:-" })
              ] })
            },
            candidate.id
          )) })
        ]
      }
    )
  ] });
};

// src/react-shell/review/mode.toolbar.tsx
var import_jsx_runtime21 = require("react/jsx-runtime");
var ReviewModeToolbar = ({
  canWriteArea,
  canWriteDom,
  mode,
  onSetReviewMode
}) => {
  if (!canWriteDom && !canWriteArea) return null;
  return /* @__PURE__ */ (0, import_jsx_runtime21.jsxs)("div", { className: "df-review-mode", "aria-label": "Add QA", children: [
    canWriteDom && /* @__PURE__ */ (0, import_jsx_runtime21.jsx)(
      "button",
      {
        "aria-label": "Element",
        className: `df-review-mode-button is-element${mode === "element" ? " is-active" : ""}`,
        type: "button",
        onClick: () => onSetReviewMode("element"),
        children: /* @__PURE__ */ (0, import_jsx_runtime21.jsx)(SquareMousePointer, { "aria-hidden": "true" })
      }
    ),
    canWriteDom && canWriteArea && /* @__PURE__ */ (0, import_jsx_runtime21.jsx)("span", { className: "df-review-mode-divider", "aria-hidden": "true", children: "|" }),
    canWriteArea && /* @__PURE__ */ (0, import_jsx_runtime21.jsx)(
      "button",
      {
        "aria-label": "Area",
        className: `df-review-mode-button is-area${mode === "area" ? " is-active" : ""}`,
        type: "button",
        onClick: () => onSetReviewMode("area"),
        children: /* @__PURE__ */ (0, import_jsx_runtime21.jsx)(Scan, { "aria-hidden": "true" })
      }
    )
  ] });
};

// src/react-shell/ruler/gutters.tsx
var import_jsx_runtime22 = require("react/jsx-runtime");
var RulerGutters = ({
  rulerHover,
  rulerScaleX,
  rulerScaleY,
  rulerUnit,
  size
}) => {
  return /* @__PURE__ */ (0, import_jsx_runtime22.jsxs)(import_jsx_runtime22.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime22.jsx)("div", { className: "df-review-ruler-corner", "aria-hidden": "true" }),
    /* @__PURE__ */ (0, import_jsx_runtime22.jsxs)(
      "div",
      {
        className: "df-review-ruler-gutter is-x",
        style: {
          "--df-review-ruler-step-x": `${rulerScaleX * 20}px`
        },
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime22.jsxs)("div", { className: "df-review-ruler-frame-label", children: [
            /* @__PURE__ */ (0, import_jsx_runtime22.jsx)("strong", { children: size.label }),
            /* @__PURE__ */ (0, import_jsx_runtime22.jsxs)("span", { children: [
              size.designWidth,
              size.designHeight ? `x${size.designHeight}` : "",
              rulerUnit
            ] })
          ] }),
          rulerHover && /* @__PURE__ */ (0, import_jsx_runtime22.jsx)(
            "div",
            {
              className: "df-review-ruler-coord is-x",
              style: { left: `${rulerHover.x}px` },
              children: Math.round(rulerHover.x / rulerScaleX)
            }
          )
        ]
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime22.jsx)(
      "div",
      {
        className: "df-review-ruler-gutter is-y",
        style: {
          "--df-review-ruler-step-y": `${rulerScaleY * 20}px`
        },
        children: rulerHover && /* @__PURE__ */ (0, import_jsx_runtime22.jsx)(
          "div",
          {
            className: "df-review-ruler-coord is-y",
            style: { top: `${rulerHover.y}px` },
            children: Math.round(rulerHover.y / rulerScaleY)
          }
        )
      }
    )
  ] });
};

// src/react-shell/ruler/overlay.tsx
var import_jsx_runtime23 = require("react/jsx-runtime");
var RulerOverlay = ({
  iframeRef,
  isRulerDragging,
  rulerHover,
  rulerMeasure,
  rulerMeasureLabel,
  rulerOverlayRef,
  size
}) => {
  return /* @__PURE__ */ (0, import_jsx_runtime23.jsxs)(
    "div",
    {
      ref: rulerOverlayRef,
      "aria-label": "Ruler",
      className: `df-review-ruler-overlay${isRulerDragging ? " is-dragging" : ""}`,
      role: "application",
      onWheel: (event) => {
        iframeRef.current?.contentWindow?.scrollBy(
          event.deltaX,
          event.deltaY
        );
      },
      children: [
        rulerHover && /* @__PURE__ */ (0, import_jsx_runtime23.jsxs)(import_jsx_runtime23.Fragment, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime23.jsx)(
            "div",
            {
              className: "df-review-ruler-guide is-x",
              "aria-hidden": "true",
              style: { top: `${rulerHover.y}px` }
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime23.jsx)(
            "div",
            {
              className: "df-review-ruler-guide is-y",
              "aria-hidden": "true",
              style: { left: `${rulerHover.x}px` }
            }
          )
        ] }),
        rulerMeasure && (rulerMeasure.width > 0 || rulerMeasure.height > 0) && /* @__PURE__ */ (0, import_jsx_runtime23.jsxs)(import_jsx_runtime23.Fragment, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime23.jsx)(
            "div",
            {
              className: "df-review-ruler-selection",
              "aria-hidden": "true",
              style: {
                left: `${rulerMeasure.left}px`,
                top: `${rulerMeasure.top}px`,
                width: `${rulerMeasure.width}px`,
                height: `${rulerMeasure.height}px`
              }
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime23.jsx)(
            "div",
            {
              className: "df-review-ruler-label",
              style: {
                left: `${Math.min(
                  Math.max(rulerMeasure.left + rulerMeasure.width + 8, 8),
                  Math.max(8, size.width - 164)
                )}px`,
                top: `${Math.min(
                  Math.max(rulerMeasure.top + rulerMeasure.height + 8, 8),
                  Math.max(8, size.height - 34)
                )}px`
              },
              children: rulerMeasureLabel
            }
          )
        ] })
      ]
    }
  );
};

// src/react-shell/target/figma.image.overlay.ts
var import_react10 = require("react");
var TARGET_FIGMA_IMAGE_ROOT_ID = "df-review-figma-image-target-root";
var TARGET_FIGMA_IMAGE_STYLE_ID = "df-review-figma-image-target-style";
var TARGET_FIGMA_IMAGE_ID_ATTRIBUTE = "data-df-review-figma-image-id";
var targetFigmaImageDragStates = /* @__PURE__ */ new WeakMap();
function createReviewTargetFigmaImageOverlays({
  imageOverlayStates,
  images
}) {
  return images.flatMap((image, index) => {
    const overlayState = imageOverlayStates[image.id];
    if (!overlayState?.isVisible) return [];
    return [
      {
        id: image.id,
        imageUrl: image.imageUrl,
        isLocked: overlayState.isLocked,
        label: image.label ?? image.nodeId,
        mode: overlayState.mode,
        offsetY: overlayState.offsetY,
        opacity: overlayState.opacity,
        zIndex: images.length - index
      }
    ];
  });
}
var useTargetFigmaImageOverlays = ({
  figmaImageOverlays,
  iframeRef,
  onSetOverlayOffsetY,
  size,
  targetSrc
}) => {
  const targetDocumentRef = (0, import_react10.useRef)(null);
  const overlaySignature = createTargetFigmaImageOverlaySignature(
    figmaImageOverlays
  );
  const syncTargetFigmaImageOverlays = (0, import_react10.useCallback)(() => {
    let targetDocument;
    try {
      targetDocument = iframeRef.current?.contentDocument;
    } catch {
      targetDocument = null;
    }
    if (!targetDocument?.body) return;
    if (targetDocumentRef.current && targetDocumentRef.current !== targetDocument) {
      removeTargetFigmaImageOverlays(targetDocumentRef.current);
    }
    targetDocumentRef.current = targetDocument;
    renderTargetFigmaImageOverlays({
      onSetOverlayOffsetY,
      overlays: figmaImageOverlays,
      size,
      targetDocument
    });
  }, [
    iframeRef,
    onSetOverlayOffsetY,
    overlaySignature,
    size,
    targetSrc
  ]);
  (0, import_react10.useEffect)(() => {
    syncTargetFigmaImageOverlays();
  }, [syncTargetFigmaImageOverlays]);
  (0, import_react10.useEffect)(() => {
    return () => {
      if (!targetDocumentRef.current) return;
      removeTargetFigmaImageOverlays(targetDocumentRef.current);
      targetDocumentRef.current = null;
    };
  }, []);
  return syncTargetFigmaImageOverlays;
};
function renderTargetFigmaImageOverlays({
  onSetOverlayOffsetY,
  overlays,
  size,
  targetDocument
}) {
  if (overlays.length === 0) {
    removeTargetFigmaImageOverlays(targetDocument);
    return;
  }
  const isMobileViewport = getViewportPresetKind(size) === "mobile";
  const fixedOverlayWidth = getTargetFigmaImageFixedWidth(size);
  const root = ensureTargetFigmaImageRoot(targetDocument);
  const existingElements = new Map(
    Array.from(
      root.querySelectorAll(
        `[${TARGET_FIGMA_IMAGE_ID_ATTRIBUTE}]`
      )
    ).flatMap((element) => {
      const id = element.getAttribute(TARGET_FIGMA_IMAGE_ID_ATTRIBUTE);
      return id ? [[id, element]] : [];
    })
  );
  const nextIds = new Set(overlays.map((overlay) => overlay.id));
  existingElements.forEach((element, id) => {
    if (!nextIds.has(id)) element.remove();
  });
  overlays.forEach((overlay) => {
    let element = existingElements.get(overlay.id);
    let image = element?.querySelector("img") ?? null;
    if (!element) {
      element = targetDocument.createElement("div");
      element.className = "df-review-figma-image-target-overlay";
      element.setAttribute(TARGET_FIGMA_IMAGE_ID_ATTRIBUTE, overlay.id);
      image = targetDocument.createElement("img");
      image.alt = "";
      image.draggable = false;
      element.appendChild(image);
    }
    if (image && image.getAttribute("src") !== overlay.imageUrl) {
      image.setAttribute("src", overlay.imageUrl);
    }
    element.setAttribute("aria-label", overlay.label ?? "Figma image overlay");
    element.setAttribute("role", "img");
    element.dataset.viewport = isMobileViewport ? "mobile" : "fixed";
    element.style.filter = overlay.mode === "invert" ? "invert(1)" : "";
    element.style.left = isMobileViewport ? "0" : "50%";
    element.style.opacity = String(overlay.opacity);
    element.style.pointerEvents = overlay.isLocked || !onSetOverlayOffsetY ? "none" : "auto";
    element.style.top = `${normalizeTargetFigmaImageOffsetY(
      overlay.offsetY
    )}px`;
    element.style.transform = isMobileViewport ? "none" : "translateX(-50%)";
    element.style.width = isMobileViewport ? "100%" : `${fixedOverlayWidth}px`;
    element.style.zIndex = String(overlay.zIndex);
    attachTargetFigmaImageDrag({
      element,
      onSetOverlayOffsetY,
      overlay
    });
    root.appendChild(element);
  });
}
function attachTargetFigmaImageDrag({
  element,
  onSetOverlayOffsetY,
  overlay
}) {
  if (overlay.isLocked || !onSetOverlayOffsetY) {
    targetFigmaImageDragStates.delete(element);
    element.classList.remove("is-dragging");
    element.onpointerdown = null;
    element.onpointermove = null;
    element.onpointerup = null;
    element.onpointercancel = null;
    return;
  }
  element.onpointerdown = (event) => {
    if (event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();
    element.setPointerCapture(event.pointerId);
    element.classList.add("is-dragging");
    targetFigmaImageDragStates.set(element, {
      overlayId: overlay.id,
      pointerId: event.pointerId,
      startClientY: event.clientY,
      startOffsetY: normalizeTargetFigmaImageOffsetY(overlay.offsetY)
    });
  };
  element.onpointermove = (event) => {
    const dragState = targetFigmaImageDragStates.get(element);
    if (!dragState || dragState.pointerId !== event.pointerId) return;
    event.preventDefault();
    event.stopPropagation();
    const nextOffsetY = Math.round(
      dragState.startOffsetY + event.clientY - dragState.startClientY
    );
    element.style.top = `${nextOffsetY}px`;
    onSetOverlayOffsetY(dragState.overlayId, nextOffsetY);
  };
  const stopDrag = (event) => {
    const dragState = targetFigmaImageDragStates.get(element);
    if (!dragState || dragState.pointerId !== event.pointerId) return;
    event.preventDefault();
    event.stopPropagation();
    if (element.hasPointerCapture(event.pointerId)) {
      element.releasePointerCapture(event.pointerId);
    }
    element.classList.remove("is-dragging");
    targetFigmaImageDragStates.delete(element);
  };
  element.onpointerup = stopDrag;
  element.onpointercancel = stopDrag;
}
function ensureTargetFigmaImageRoot(targetDocument) {
  ensureTargetFigmaImageStyle(targetDocument);
  const [existingRoot, ...duplicateRoots] = Array.from(
    targetDocument.querySelectorAll(
      `#${TARGET_FIGMA_IMAGE_ROOT_ID}`
    )
  );
  duplicateRoots.forEach((root2) => root2.remove());
  if (existingRoot) return existingRoot;
  const root = targetDocument.createElement("div");
  root.id = TARGET_FIGMA_IMAGE_ROOT_ID;
  root.setAttribute("aria-hidden", "true");
  targetDocument.body.appendChild(root);
  return root;
}
function ensureTargetFigmaImageStyle(targetDocument) {
  if (targetDocument.getElementById(TARGET_FIGMA_IMAGE_STYLE_ID)) return;
  const style = targetDocument.createElement("style");
  style.id = TARGET_FIGMA_IMAGE_STYLE_ID;
  style.textContent = `
    #${TARGET_FIGMA_IMAGE_ROOT_ID} {
      position: absolute;
      left: 0;
      top: 0;
      z-index: 2147483000;
      width: 100%;
      height: 0;
      overflow: visible;
      pointer-events: none;
    }

    #${TARGET_FIGMA_IMAGE_ROOT_ID} .df-review-figma-image-target-overlay {
      position: absolute;
      display: block;
      cursor: grab;
      user-select: none;
      -webkit-user-select: none;
      touch-action: none;
      will-change: opacity, top, transform;
    }

    #${TARGET_FIGMA_IMAGE_ROOT_ID} .df-review-figma-image-target-overlay.is-dragging {
      cursor: grabbing;
    }

    #${TARGET_FIGMA_IMAGE_ROOT_ID} .df-review-figma-image-target-overlay img {
      display: block;
      width: 100%;
      max-width: none;
      height: auto;
      pointer-events: none;
      user-select: none;
      -webkit-user-drag: none;
      -webkit-user-select: none;
    }
  `;
  targetDocument.head?.appendChild(style);
}
function removeTargetFigmaImageOverlays(targetDocument) {
  targetDocument.querySelectorAll(`#${TARGET_FIGMA_IMAGE_ROOT_ID}`).forEach((element) => element.remove());
  targetDocument.querySelectorAll(`#${TARGET_FIGMA_IMAGE_STYLE_ID}`).forEach((element) => element.remove());
}
function createTargetFigmaImageOverlaySignature(overlays) {
  return overlays.map(
    (overlay) => [
      overlay.id,
      overlay.imageUrl,
      overlay.label ?? "",
      overlay.isLocked ? "locked" : "unlocked",
      overlay.mode ?? "",
      overlay.offsetY ?? 0,
      overlay.opacity,
      overlay.zIndex
    ].join(":")
  ).join("|");
}
function getTargetFigmaImageFixedWidth(size) {
  const width = size.designWidth ?? size.width;
  return Math.max(1, Math.round(width));
}
function normalizeTargetFigmaImageOffsetY(value) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

// src/react-shell/target/frame.tsx
var import_jsx_runtime24 = require("react/jsx-runtime");
var ReviewTargetFrame = ({
  canWriteArea,
  canWriteDom,
  figmaImageOverlays,
  frameScrollRef,
  iframeRef,
  isRulerAvailable,
  isRulerDragging,
  isRulerVisible,
  mode,
  rulerHover,
  rulerMeasure,
  rulerMeasureLabel,
  rulerOverlayRef,
  rulerScaleX,
  rulerScaleY,
  rulerUnit,
  size,
  targetSrc,
  onLoadTarget,
  onSetFigmaImageOverlayOffsetY,
  onSetReviewMode
}) => {
  const showRuler = isRulerVisible && isRulerAvailable;
  const syncTargetFigmaImageOverlays = useTargetFigmaImageOverlays({
    figmaImageOverlays,
    iframeRef,
    onSetOverlayOffsetY: onSetFigmaImageOverlayOffsetY,
    size,
    targetSrc
  });
  const handleLoadTarget = () => {
    onLoadTarget();
    syncTargetFigmaImageOverlays();
    window.requestAnimationFrame(syncTargetFigmaImageOverlays);
  };
  return /* @__PURE__ */ (0, import_jsx_runtime24.jsx)("main", { className: "df-review-stage", children: /* @__PURE__ */ (0, import_jsx_runtime24.jsxs)("div", { className: "df-review-frame", children: [
    /* @__PURE__ */ (0, import_jsx_runtime24.jsx)("div", { className: "df-review-frame-scroll", ref: frameScrollRef, children: /* @__PURE__ */ (0, import_jsx_runtime24.jsx)("div", { className: "df-review-frame-canvas", children: /* @__PURE__ */ (0, import_jsx_runtime24.jsx)("div", { className: "df-review-target-stack", children: /* @__PURE__ */ (0, import_jsx_runtime24.jsxs)(
      "div",
      {
        className: `df-review-device-frame${showRuler ? " is-ruler" : ""}`,
        children: [
          showRuler && /* @__PURE__ */ (0, import_jsx_runtime24.jsx)(
            RulerGutters,
            {
              rulerHover,
              rulerScaleX,
              rulerScaleY,
              rulerUnit,
              size
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime24.jsxs)(
            "div",
            {
              className: "df-review-device",
              style: {
                width: `${size.width}px`,
                height: `${size.height}px`,
                minWidth: `${size.width}px`,
                minHeight: `${size.height}px`
              },
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime24.jsx)(
                  "iframe",
                  {
                    ref: iframeRef,
                    width: size.width,
                    height: size.height,
                    src: targetSrc,
                    title: "Review target",
                    onLoad: handleLoadTarget
                  },
                  targetSrc
                ),
                showRuler && /* @__PURE__ */ (0, import_jsx_runtime24.jsx)(
                  RulerOverlay,
                  {
                    iframeRef,
                    isRulerDragging,
                    rulerHover,
                    rulerMeasure,
                    rulerMeasureLabel,
                    rulerOverlayRef,
                    size
                  }
                )
              ]
            }
          )
        ]
      }
    ) }) }) }),
    /* @__PURE__ */ (0, import_jsx_runtime24.jsx)("div", { className: "df-review-frame-actions", children: /* @__PURE__ */ (0, import_jsx_runtime24.jsx)(
      ReviewModeToolbar,
      {
        canWriteArea,
        canWriteDom,
        mode,
        onSetReviewMode
      }
    ) })
  ] }) });
};

// src/react-shell/target/target.ts
var HIDE_SCROLLBAR_STYLE_ID = "df-review-hide-scrollbar";
var FIGMA_POINTER_LOCK_STYLE_ID = "df-review-figma-pointer-lock";
var setTargetScrollbarHidden = (targetDocument, hidden) => {
  if (!targetDocument) return;
  const existing = targetDocument.getElementById(HIDE_SCROLLBAR_STYLE_ID);
  if (hidden) {
    if (existing) return;
    const style = targetDocument.createElement("style");
    style.id = HIDE_SCROLLBAR_STYLE_ID;
    style.textContent = "html{scrollbar-width:none}html::-webkit-scrollbar,body::-webkit-scrollbar{width:0;height:0;display:none}";
    targetDocument.head?.appendChild(style);
  } else {
    existing?.remove();
  }
};
var setTargetFigmaOverlayLocked = (targetDocument, locked) => {
  if (!targetDocument) return;
  const existing = targetDocument.getElementById(FIGMA_POINTER_LOCK_STYLE_ID);
  if (locked) {
    if (existing) return;
    const style = targetDocument.createElement("style");
    style.id = FIGMA_POINTER_LOCK_STYLE_ID;
    style.textContent = [
      ".helper-figma-root,",
      ".helper-figma-root *,",
      ".helper-figma-loading-backdrop,",
      ".helper-figma-loading-backdrop * {",
      "pointer-events: none !important;",
      "}"
    ].join("\n");
    targetDocument.head?.appendChild(style);
  } else {
    existing?.remove();
  }
};
var isEditableEventTarget = (event) => {
  const path = event.composedPath?.() ?? [];
  const element = path[0] ?? event.target;
  if (!element || typeof element.tagName !== "string") return false;
  const tag = element.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || element.isContentEditable === true;
};
var TRUE_STORAGE_VALUES = /* @__PURE__ */ new Set([
  "1",
  "true",
  "on",
  "show",
  "shown",
  "visible",
  "enabled",
  "yes"
]);
var OVERLAY_STORAGE_KEYS = {
  grid: ["isHelp", "df-review-grid-overlay", "dfReviewGridOverlay"],
  figma: ["isFigmaHelp", "df-review-figma-overlay", "dfReviewFigmaOverlay"]
};
var isStoredOverlayEnabled = (value) => TRUE_STORAGE_VALUES.has(value?.trim().toLowerCase() ?? "");
var getCookieValue = (targetDocument, name) => {
  const cookies = targetDocument?.cookie ? targetDocument.cookie.split(";") : [];
  const prefix = `${name}=`;
  const match = cookies.map((cookie) => cookie.trim()).find((cookie) => cookie.startsWith(prefix));
  return match ? decodeURIComponent(match.slice(prefix.length)) : null;
};
var getStorageValue = (storage, key) => {
  try {
    return storage?.getItem(key) ?? null;
  } catch {
    return null;
  }
};
var getStoredOverlayState = (targetDocument, overlay) => {
  const targetWindow = targetDocument?.defaultView;
  return OVERLAY_STORAGE_KEYS[overlay].some((key) => {
    if (isStoredOverlayEnabled(getCookieValue(targetDocument, key))) {
      return true;
    }
    return isStoredOverlayEnabled(getStorageValue(targetWindow?.localStorage, key)) || isStoredOverlayEnabled(getStorageValue(targetWindow?.sessionStorage, key));
  });
};
var getTargetOverlayState = (targetDocument) => ({
  grid: Boolean(
    targetDocument?.body?.classList.contains("is-help") || targetDocument?.querySelector(".helper.onShow") || getStoredOverlayState(targetDocument, "grid")
  ),
  figma: Boolean(
    targetDocument?.querySelector(
      ".helper-figma-root, .helper-figma-loading-backdrop"
    ) || getStoredOverlayState(targetDocument, "figma")
  )
});

// src/react-shell/topbar.tsx
var import_jsx_runtime25 = require("react/jsx-runtime");
var ReviewScopeIcon2 = ({ scope }) => {
  if (scope === "mobile") return /* @__PURE__ */ (0, import_jsx_runtime25.jsx)(Smartphone, { "aria-hidden": "true" });
  if (scope === "tablet") return /* @__PURE__ */ (0, import_jsx_runtime25.jsx)(RectangleHorizontal, { "aria-hidden": "true" });
  if (scope === "wide") return /* @__PURE__ */ (0, import_jsx_runtime25.jsx)(Maximize2, { "aria-hidden": "true" });
  if (scope === "dom") return /* @__PURE__ */ (0, import_jsx_runtime25.jsx)(SquareMousePointer, { "aria-hidden": "true" });
  return /* @__PURE__ */ (0, import_jsx_runtime25.jsx)(Monitor, { "aria-hidden": "true" });
};
var ViewportPresetIcon = ({
  preset
}) => {
  return /* @__PURE__ */ (0, import_jsx_runtime25.jsx)(ReviewScopeIcon2, { scope: getViewportPresetKind(preset) });
};
var getPresetSelectValue = (preset) => `${preset.label}:${preset.width}x${preset.height}`;
function getTargetOpenHref(targetSrc) {
  const url = new URL(targetSrc, window.location.origin);
  url.searchParams.delete("__dfwr_target");
  return `${url.pathname}${url.search}${url.hash}`;
}
var ReviewTopbar = ({
  draftTarget,
  copyLabel,
  viewportPresets,
  size,
  presetScopeCounts,
  isRulerAvailable,
  isRulerVisible,
  targetOverlayState,
  figmaOverlayUnavailableMessage = FIGMA_OVERLAY_UNAVAILABLE_MESSAGE,
  isFigmaOverlayActive,
  isFigmaOverlayAvailable,
  onDraftTargetChange,
  onApplyTarget,
  onOpenSitemap,
  onCopyCurrentUrl,
  onSizeChange,
  onToggleRuler,
  onToggleFigmaOverlay,
  onToggleTargetOverlay
}) => {
  const selectedPresetValue = getPresetSelectValue(size);
  const targetHref = getTargetOpenHref(draftTarget);
  const handlePresetSelectChange = (event) => {
    const nextPreset = viewportPresets.find(
      (preset) => getPresetSelectValue(preset) === event.currentTarget.value
    );
    if (nextPreset) onSizeChange(nextPreset);
  };
  return /* @__PURE__ */ (0, import_jsx_runtime25.jsxs)("header", { className: "df-review-topbar", children: [
    /* @__PURE__ */ (0, import_jsx_runtime25.jsxs)(
      "form",
      {
        className: "df-review-address",
        onSubmit: (event) => {
          event.preventDefault();
          onApplyTarget();
        },
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime25.jsx)(
            "button",
            {
              "aria-label": "Open sitemap",
              className: "df-review-sitemap-button",
              type: "button",
              onClick: onOpenSitemap,
              children: /* @__PURE__ */ (0, import_jsx_runtime25.jsx)(Map2, { "aria-hidden": "true" })
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime25.jsx)(
            "input",
            {
              "aria-label": "Path",
              value: draftTarget,
              onChange: (event) => onDraftTargetChange(event.target.value)
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime25.jsxs)("div", { className: "df-review-address-actions", children: [
            /* @__PURE__ */ (0, import_jsx_runtime25.jsx)(
              "button",
              {
                "aria-label": "Refresh target",
                className: "df-review-address-icon-button",
                title: "Refresh target",
                type: "submit",
                children: /* @__PURE__ */ (0, import_jsx_runtime25.jsx)(RefreshCw, { "aria-hidden": "true" })
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime25.jsx)(
              "button",
              {
                "aria-label": copyLabel,
                className: "df-review-address-icon-button",
                title: copyLabel,
                type: "button",
                onClick: onCopyCurrentUrl,
                children: /* @__PURE__ */ (0, import_jsx_runtime25.jsx)(Copy, { "aria-hidden": "true" })
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime25.jsx)(
              "a",
              {
                "aria-label": "Open target page",
                className: "df-review-address-icon-button",
                href: targetHref,
                rel: "noreferrer",
                target: "_blank",
                title: "Open target page",
                children: /* @__PURE__ */ (0, import_jsx_runtime25.jsx)(ExternalLink, { "aria-hidden": "true" })
              }
            )
          ] })
        ]
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime25.jsxs)("div", { className: "df-review-tools", children: [
      /* @__PURE__ */ (0, import_jsx_runtime25.jsxs)("div", { className: "df-review-tool-controls", children: [
        /* @__PURE__ */ (0, import_jsx_runtime25.jsx)("div", { className: "df-review-presets", "aria-label": "Viewport presets", children: viewportPresets.map((preset) => /* @__PURE__ */ (0, import_jsx_runtime25.jsxs)(
          "button",
          {
            className: preset.label === size.label ? "is-active" : "",
            type: "button",
            onClick: () => onSizeChange(preset),
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime25.jsx)(ViewportPresetIcon, { preset }),
              /* @__PURE__ */ (0, import_jsx_runtime25.jsx)("span", { className: "df-review-preset-copy", children: /* @__PURE__ */ (0, import_jsx_runtime25.jsx)("strong", { children: preset.label }) }),
              /* @__PURE__ */ (0, import_jsx_runtime25.jsx)("span", { className: "df-review-preset-count", children: presetScopeCounts.get(getViewportPresetKind(preset)) ?? 0 })
            ]
          },
          preset.label
        )) }),
        /* @__PURE__ */ (0, import_jsx_runtime25.jsx)(
          "select",
          {
            "aria-label": "Viewport preset",
            className: "df-review-preset-select",
            value: selectedPresetValue,
            onChange: handlePresetSelectChange,
            children: viewportPresets.map((preset) => {
              const scope = getViewportPresetKind(preset);
              const count = presetScopeCounts.get(scope) ?? 0;
              return /* @__PURE__ */ (0, import_jsx_runtime25.jsx)(
                "option",
                {
                  value: getPresetSelectValue(preset),
                  children: `${preset.label} (${count})`
                },
                getPresetSelectValue(preset)
              );
            })
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime25.jsx)("span", { className: "df-review-tool-divider", "aria-hidden": "true", children: "|" }),
        /* @__PURE__ */ (0, import_jsx_runtime25.jsxs)("span", { className: "df-review-active-size", children: [
          size.width,
          "x",
          size.height
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime25.jsxs)("div", { className: "df-review-overlays", "aria-label": "Target overlays", children: [
        isRulerAvailable && /* @__PURE__ */ (0, import_jsx_runtime25.jsx)(
          "button",
          {
            "aria-label": "Toggle ruler",
            className: `df-review-overlay-button is-ruler${isRulerVisible ? " is-active" : ""}`,
            type: "button",
            onClick: onToggleRuler,
            children: /* @__PURE__ */ (0, import_jsx_runtime25.jsx)(Ruler, { "aria-hidden": "true" })
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime25.jsx)(
          "button",
          {
            "aria-label": "Toggle grid overlay",
            className: `df-review-overlay-button is-grid${targetOverlayState.grid ? " is-active" : ""}`,
            type: "button",
            onClick: () => onToggleTargetOverlay("grid"),
            children: /* @__PURE__ */ (0, import_jsx_runtime25.jsx)(LayoutGrid, { "aria-hidden": "true" })
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime25.jsx)(
          "button",
          {
            "aria-disabled": !isFigmaOverlayAvailable,
            "aria-label": isFigmaOverlayAvailable ? isFigmaOverlayActive ? "Hide Figma overlays" : "Show Figma overlays" : figmaOverlayUnavailableMessage,
            className: `df-review-overlay-button is-figma${isFigmaOverlayActive ? " is-active" : ""}${isFigmaOverlayAvailable ? "" : " is-disabled"}`,
            disabled: !isFigmaOverlayAvailable,
            type: "button",
            onClick: onToggleFigmaOverlay,
            children: /* @__PURE__ */ (0, import_jsx_runtime25.jsx)(FigmaMarkIcon, {})
          }
        )
      ] })
    ] })
  ] });
};

// src/react-shell/hooks/use.review.controller.ts
var import_react15 = require("react");

// src/react-shell/hooks/use.review.item.restore.ts
var import_react11 = require("react");
function runWithAutoScrollBehavior2(targetDocument, callback) {
  const elements = [
    targetDocument?.documentElement,
    targetDocument?.body
  ].filter((element) => Boolean(element));
  const previousValues = elements.map((element) => element.style.scrollBehavior);
  elements.forEach((element) => {
    element.style.scrollBehavior = "auto";
  });
  try {
    callback();
  } finally {
    elements.forEach((element, index) => {
      element.style.scrollBehavior = previousValues[index] ?? "";
    });
  }
}
var RESTORE_WAIT_MAX_MS = 2600;
var RESTORE_STABLE_FRAME_COUNT = 2;
var RESTORE_SCROLL_RECHECK_DELAYS_MS = [120, 360];
var waitForNextAnimationFrame = (targetWindow) => new Promise((resolve) => {
  targetWindow.requestAnimationFrame(() => resolve());
});
var waitForTargetTimeout = (targetWindow, ms) => new Promise((resolve) => {
  targetWindow.setTimeout(resolve, ms);
});
var getRestoreLayoutSnapshot = (targetDocument, anchorElement) => {
  const root = targetDocument.documentElement;
  const body = targetDocument.body;
  const anchorRect = anchorElement?.getBoundingClientRect();
  return [
    root.scrollWidth,
    root.scrollHeight,
    body?.scrollWidth ?? 0,
    body?.scrollHeight ?? 0,
    anchorRect ? Math.round(anchorRect.left) : -1,
    anchorRect ? Math.round(anchorRect.top) : -1,
    anchorRect ? Math.round(anchorRect.width) : -1,
    anchorRect ? Math.round(anchorRect.height) : -1
  ].join(":");
};
var waitForRestoreAnchor = async (targetWindow, targetDocument, item, isCurrent) => {
  const startedAt = targetWindow.performance.now();
  let previousSnapshot = "";
  let stableFrameCount = 0;
  while (isCurrent() && targetWindow.performance.now() - startedAt < RESTORE_WAIT_MAX_MS) {
    const anchorElement = queryReviewItemAnchorElement(targetDocument, item);
    const snapshot = getRestoreLayoutSnapshot(targetDocument, anchorElement);
    const canRestore = item.anchor ? Boolean(anchorElement) : true;
    if (snapshot === previousSnapshot) {
      stableFrameCount += 1;
    } else {
      stableFrameCount = 0;
    }
    if (canRestore && stableFrameCount >= RESTORE_STABLE_FRAME_COUNT) {
      return anchorElement;
    }
    previousSnapshot = snapshot;
    await waitForNextAnimationFrame(targetWindow);
  }
  return queryReviewItemAnchorElement(targetDocument, item);
};
var useReviewItemRestore = ({
  adapter,
  controllerRef,
  iframeRef,
  pendingInitialItemIdRef,
  pendingRestoreRef,
  reviewPathPrefix,
  selectedItemIdRef,
  source,
  targetRef,
  viewportPresets,
  onActiveRouteChange,
  onDraftTargetChange,
  onSelectedItemIdChange,
  onSizeChange,
  onSyncTargetViewport,
  onTargetChange
}) => {
  const clearSelectedItem = (0, import_react11.useCallback)(() => {
    pendingRestoreRef.current = null;
    selectedItemIdRef.current = null;
    onSelectedItemIdChange(null);
    controllerRef.current?.highlightItem(void 0);
  }, [
    controllerRef,
    onSelectedItemIdChange,
    pendingRestoreRef,
    selectedItemIdRef
  ]);
  const applyItemScroll = (0, import_react11.useCallback)(
    async (item) => {
      if (selectedItemIdRef.current !== item.id) return false;
      const targetWindow = iframeRef.current?.contentWindow;
      const targetDocument = iframeRef.current?.contentDocument;
      if (!targetWindow || !targetDocument) return false;
      const isCurrentRestore = () => selectedItemIdRef.current === item.id && iframeRef.current?.contentDocument === targetDocument;
      const anchorElement = await waitForRestoreAnchor(
        targetWindow,
        targetDocument,
        item,
        isCurrentRestore
      );
      if (!isCurrentRestore()) return false;
      const applyScrollPosition = () => {
        if (!isCurrentRestore()) return false;
        const currentAnchorElement = queryReviewItemAnchorElement(targetDocument, item) ?? anchorElement;
        runWithAutoScrollBehavior2(targetDocument, () => {
          setDocumentScrollInstantly(
            targetWindow,
            targetDocument,
            getReviewItemRestoreScrollPosition(
              targetWindow,
              targetDocument,
              item,
              currentAnchorElement
            )
          );
        });
        onSyncTargetViewport();
        return true;
      };
      if (!applyScrollPosition()) return false;
      controllerRef.current?.highlightItem(item.id);
      for (const delay of RESTORE_SCROLL_RECHECK_DELAYS_MS) {
        await waitForTargetTimeout(targetWindow, delay);
        if (!applyScrollPosition()) return false;
        controllerRef.current?.highlightItem(item.id);
      }
      return true;
    },
    [controllerRef, iframeRef, onSyncTargetViewport, selectedItemIdRef]
  );
  const applyPendingRestore = (0, import_react11.useCallback)(() => {
    const item = pendingRestoreRef.current;
    if (!item) return;
    void applyItemScroll(item).then((didApply) => {
      if (didApply && pendingRestoreRef.current?.id === item.id) {
        pendingRestoreRef.current = null;
      }
    });
  }, [applyItemScroll, pendingRestoreRef]);
  const restoreReviewItem = (0, import_react11.useCallback)(
    (item) => {
      const nextRoute = getItemTarget(item, reviewPathPrefix);
      const nextTarget = getItemFrameTarget(item, reviewPathPrefix);
      const nextSize = getRestoredSize(item, viewportPresets);
      pendingInitialItemIdRef.current = null;
      pendingRestoreRef.current = item;
      selectedItemIdRef.current = item.id;
      onSelectedItemIdChange(item.id);
      onActiveRouteChange(nextRoute);
      onDraftTargetChange(nextTarget);
      onSizeChange(nextSize);
      updateShellUrlForItem(nextTarget, nextSize, item.id, source);
      if (targetRef.current !== nextTarget) {
        onTargetChange(nextTarget);
        return;
      }
      applyPendingRestore();
    },
    [
      applyPendingRestore,
      onActiveRouteChange,
      onDraftTargetChange,
      onSelectedItemIdChange,
      onSizeChange,
      onTargetChange,
      pendingRestoreRef,
      pendingInitialItemIdRef,
      reviewPathPrefix,
      selectedItemIdRef,
      source,
      targetRef,
      viewportPresets
    ]
  );
  const restoreInitialItem = (0, import_react11.useCallback)(async () => {
    const itemId = pendingInitialItemIdRef.current;
    if (!itemId) return;
    try {
      const item = await adapter.get(itemId);
      if (item && pendingInitialItemIdRef.current === itemId) {
        restoreReviewItem(item);
      }
    } catch {
    }
  }, [adapter, pendingInitialItemIdRef, restoreReviewItem]);
  return {
    applyPendingRestore,
    clearSelectedItem,
    restoreInitialItem,
    restoreReviewItem
  };
};

// src/react-shell/hooks/use.review.kit.lifecycle.ts
var import_react12 = require("react");

// src/route.ts
function getItemRouteKey(item) {
  return item.routeKey || normalizeRoutePath(item.normalizedPath);
}
function normalizeRoutePath(pathname) {
  const [pathWithoutQuery] = pathname.split(/[?#]/);
  const path = (pathWithoutQuery || "/").replace(/\/index\.html$/, "/");
  return path.startsWith("/") ? path : `/${path}`;
}

// src/adapters/local.ts
var DEFAULT_STORAGE_KEY = "df-web-review-kit:items";
function localAdapter(options = {}) {
  const storageKey = options.storageKey ?? DEFAULT_STORAGE_KEY;
  const write = (items) => {
    window.localStorage.setItem(storageKey, JSON.stringify(items));
  };
  const read = () => {
    if (typeof window === "undefined") return [];
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return [];
    try {
      const value = JSON.parse(raw);
      if (!Array.isArray(value)) return [];
      let changed = false;
      const items = value.flatMap((item) => {
        const normalized = normalizeStoredReviewItem(item);
        if (!normalized || normalized !== item) changed = true;
        return normalized ? [normalized] : [];
      });
      if (changed) write(items);
      return items;
    } catch {
      return [];
    }
  };
  return {
    async get(id) {
      return read().find((item) => item.id === id) ?? null;
    },
    async list(query) {
      return read().filter((item) => {
        if (item.projectId !== query.projectId) return false;
        const queryRouteKey = query.routeKey ?? query.normalizedPath;
        if (queryRouteKey && getItemRouteKey(item) !== queryRouteKey) {
          return false;
        }
        if (query.status && !matchesReviewItemStatus(item.status, query.status)) {
          return false;
        }
        return true;
      });
    },
    async create(item) {
      const items = read();
      items.unshift(item);
      write(items);
      return item;
    },
    async update(id, patch) {
      const items = read();
      const index = items.findIndex((item) => item.id === id);
      if (index < 0) {
        throw new Error(`Review item not found: ${id}`);
      }
      const next = {
        ...items[index],
        ...patch,
        id,
        createdAt: items[index].createdAt,
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      items[index] = next;
      write(items);
      return next;
    },
    async remove(id) {
      write(read().filter((item) => item.id !== id));
    }
  };
}
function normalizeStoredReviewItem(value) {
  if (!value || typeof value !== "object") return void 0;
  const raw = value;
  const kind = raw.kind === "text" ? "note" : raw.kind === "capture" ? "area" : raw.kind;
  if (kind !== "note" && kind !== "area") return void 0;
  const { screenshot: _screenshot, reviewNumber: _reviewNumber, ...item } = raw;
  if (kind === raw.kind && _screenshot === void 0 && _reviewNumber === void 0) {
    return raw;
  }
  return {
    ...item,
    kind
  };
}

// src/core/dom.anchor.ts
var COMMON_ANCHOR_ATTRIBUTES = [
  "data-testid",
  "data-test-id",
  "data-cy",
  "data-test",
  "data-qa",
  "data-section-id",
  "data-component"
];
var SEMANTIC_ANCHOR_ATTRIBUTES = [
  "aria-label",
  "title",
  "name",
  "href"
];
function getDomAnchor(selection, configuredAttribute = "data-qa-id", environment) {
  const x = selection.left + selection.width / 2;
  const y = selection.top + selection.height / 2;
  return getDomAnchorFromPoint({ x, y }, configuredAttribute, environment);
}
function getDomAnchorFromPoint(point, configuredAttribute = "data-qa-id", environment) {
  const target = environment.document.elementFromPoint(point.x, point.y);
  if (!target) return void 0;
  const candidates = createAnchorCandidates(target, configuredAttribute);
  const primaryCandidate = candidates[0];
  if (!primaryCandidate) return void 0;
  return {
    ...primaryCandidate,
    candidates,
    htmlSnippet: getElementHtmlSnippet(
      getAnchorSourceElement(target, primaryCandidate, configuredAttribute) ?? target
    ),
    source: getDomSourceHint(target)
  };
}
function getDomAnchorFromElement(target, configuredAttribute = "data-qa-id", environment) {
  if (target.ownerDocument !== environment.document) return void 0;
  const candidates = createAnchorCandidates(target, configuredAttribute);
  const primaryCandidate = candidates[0];
  if (!primaryCandidate) return void 0;
  return {
    ...primaryCandidate,
    candidates,
    htmlSnippet: getElementHtmlSnippet(
      getAnchorSourceElement(target, primaryCandidate, configuredAttribute) ?? target
    ),
    source: getDomSourceHint(target)
  };
}
function getElementViewportSelection(anchor, environment, preferredSelection) {
  const element = getAnchorElement(anchor, environment, preferredSelection);
  if (!element) return void 0;
  const rect = element.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0) return void 0;
  return {
    left: rect.left,
    top: rect.top,
    width: rect.width,
    height: rect.height
  };
}
function getRelativeSelection(selection, anchor, environment) {
  const element = getAnchorElement(anchor, environment);
  if (!element) return void 0;
  const rect = element.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) return void 0;
  return {
    x: roundRatio((selection.left - rect.left) / rect.width),
    y: roundRatio((selection.top - rect.top) / rect.height),
    width: roundRatio(selection.width / rect.width),
    height: roundRatio(selection.height / rect.height)
  };
}
function getRelativePoint(point, anchor, environment) {
  const element = getAnchorElement(anchor, environment);
  if (!element) return void 0;
  const rect = element.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) return void 0;
  return {
    x: roundRatio((point.x - rect.left) / rect.width),
    y: roundRatio((point.y - rect.top) / rect.height)
  };
}
function getAnchorCandidates(anchor) {
  return dedupeAnchorCandidates([
    anchor,
    ...anchor.candidates ?? []
  ]);
}
function resolveAnchorElement(anchor, environment, preferredSelection) {
  const matches = getAnchorCandidates(anchor).flatMap((candidate) => {
    const textFingerprint = candidate.textFingerprint ?? anchor.textFingerprint;
    if (!preferredSelection) {
      const match = queryBestAnchorCandidate(
        candidate,
        textFingerprint,
        environment
      );
      if (!match) return [];
      const confidence = roundRatio(
        (candidate.confidence ?? 0.5) * match.score
      );
      return [{
        element: match.element,
        candidate,
        confidence
      }];
    }
    return queryAnchorElements(candidate.selector, environment).map((element) => {
      const confidence = roundRatio(
        (candidate.confidence ?? 0.5) * getTextFingerprintScore(textFingerprint, getTextFingerprint(element)) * getSelectionMatchScore(element, preferredSelection)
      );
      return {
        element,
        candidate,
        confidence
      };
    });
  });
  return matches.sort((a, b) => b.confidence - a.confidence)[0];
}
function cssEscape(value) {
  if ("CSS" in window && typeof window.CSS.escape === "function") {
    return window.CSS.escape(value);
  }
  return value.replace(/[^a-zA-Z0-9_-]/g, "\\$&");
}
function getAnchorElement(anchor, environment, preferredSelection) {
  return typeof anchor === "string" ? queryAnchorElement(anchor, environment) : resolveAnchorElement(anchor, environment, preferredSelection)?.element;
}
function createAnchorCandidates(target, configuredAttribute) {
  const targetCandidates = [];
  const configuredAnchor = getExactAttributeAnchorCandidate(
    target,
    configuredAttribute,
    0.98,
    "configured-attribute"
  );
  if (configuredAnchor) targetCandidates.push(configuredAnchor);
  const targetAttributeAnchor = getAttributeAnchorCandidate(
    target,
    COMMON_ANCHOR_ATTRIBUTES.filter((name) => name !== configuredAttribute),
    0.9
  );
  if (targetAttributeAnchor) targetCandidates.push(targetAttributeAnchor);
  if (isMeaningfulId(target.id)) {
    targetCandidates.push({
      selector: `#${cssEscape(target.id)}`,
      strategy: "id",
      confidence: 0.94,
      textFingerprint: getTextFingerprint(target)
    });
  }
  const semanticAnchor = getAttributeAnchorCandidate(
    target,
    SEMANTIC_ANCHOR_ATTRIBUTES,
    0.84
  );
  if (semanticAnchor) targetCandidates.push(semanticAnchor);
  const targetClassName = getMeaningfulClassName(target);
  if (targetClassName) {
    targetCandidates.push({
      selector: `${target.tagName.toLowerCase()}.${cssEscape(targetClassName)}`,
      strategy: "class",
      confidence: 0.82,
      textFingerprint: getTextFingerprint(target)
    });
  }
  const scopedPath = getScopedDomPathCandidate(target, configuredAttribute);
  if (scopedPath) targetCandidates.push(scopedPath);
  const targetDomPath = {
    selector: getDomPath(target),
    strategy: "dom-path",
    confidence: targetCandidates.length > 0 ? 0.8 : 0.5,
    textFingerprint: getTextFingerprint(target)
  };
  const parentCandidates = [];
  const parent = target.parentElement;
  const parentConfiguredAnchor = parent ? findClosestAttributeAnchor(parent, [configuredAttribute], 0.72, {
    strategy: "configured-attribute"
  }) : void 0;
  if (parentConfiguredAnchor) parentCandidates.push(parentConfiguredAnchor);
  const anchoredByAttribute = parent ? findClosestAttributeAnchor(
    parent,
    COMMON_ANCHOR_ATTRIBUTES.filter((name) => name !== configuredAttribute),
    0.7
  ) : void 0;
  if (anchoredByAttribute) parentCandidates.push(anchoredByAttribute);
  const anchoredById = parent ? findClosest(parent, (element) => isMeaningfulId(element.id)) : void 0;
  if (anchoredById?.id) {
    parentCandidates.push({
      selector: `#${cssEscape(anchoredById.id)}`,
      strategy: "id",
      confidence: 0.72,
      textFingerprint: getTextFingerprint(anchoredById)
    });
  }
  const anchoredByClass = parent ? findClosest(parent, (element) => Boolean(getMeaningfulClassName(element))) : void 0;
  const className = anchoredByClass ? getMeaningfulClassName(anchoredByClass) : void 0;
  if (anchoredByClass && className) {
    parentCandidates.push({
      selector: `${anchoredByClass.tagName.toLowerCase()}.${cssEscape(
        className
      )}`,
      strategy: "class",
      confidence: 0.58,
      textFingerprint: getTextFingerprint(anchoredByClass)
    });
  }
  const candidates = targetCandidates.length > 0 ? [...targetCandidates, targetDomPath, ...parentCandidates] : [...parentCandidates, targetDomPath];
  return dedupeAnchorCandidates(candidates);
}
function findClosestAttributeAnchor(target, attributeNames, confidence, options) {
  for (const attributeName of attributeNames) {
    const selector = `[${attributeName}]`;
    const element = tryClosest(target, selector);
    if (!element) continue;
    const value = getStableAttributeValue(element, attributeName);
    if (!value) continue;
    return {
      selector: `[${attributeName}="${cssEscape(value)}"]`,
      strategy: options?.strategy ?? "attribute",
      confidence,
      textFingerprint: getTextFingerprint(element)
    };
  }
  return void 0;
}
function getExactAttributeAnchorCandidate(element, attributeName, confidence, strategy) {
  const value = getStableAttributeValue(element, attributeName);
  if (!value) return void 0;
  return {
    selector: `[${attributeName}="${cssEscape(value)}"]`,
    strategy,
    confidence,
    textFingerprint: getTextFingerprint(element)
  };
}
function getAttributeAnchorCandidate(element, attributeNames, confidence) {
  for (const attributeName of attributeNames) {
    const value = getStableAttributeValue(element, attributeName);
    if (!value) continue;
    return {
      selector: `${element.tagName.toLowerCase()}[${attributeName}="${cssEscape(
        value
      )}"]`,
      strategy: "attribute",
      confidence,
      textFingerprint: getTextFingerprint(element)
    };
  }
  return void 0;
}
function getScopedDomPathCandidate(target, configuredAttribute) {
  const parent = target.parentElement;
  if (!parent) return void 0;
  const anchor = findStableAncestorSelector(parent, configuredAttribute);
  if (!anchor) return void 0;
  const selector = getDomPathBetween(anchor.element, target, anchor.selector);
  if (!selector) return void 0;
  return {
    selector,
    strategy: "dom-path",
    confidence: anchor.confidence,
    textFingerprint: getTextFingerprint(target)
  };
}
function findStableAncestorSelector(start, configuredAttribute) {
  let element = start;
  const root = start.ownerDocument.documentElement;
  while (element && element !== root) {
    const configuredValue = getStableAttributeValue(element, configuredAttribute);
    if (configuredValue) {
      return {
        element,
        selector: `[${configuredAttribute}="${cssEscape(configuredValue)}"]`,
        confidence: 0.88
      };
    }
    const attributeAnchor = getAttributeAnchorCandidate(
      element,
      COMMON_ANCHOR_ATTRIBUTES.filter((name) => name !== configuredAttribute),
      0.84
    );
    if (attributeAnchor) {
      return {
        element,
        selector: attributeAnchor.selector,
        confidence: 0.84
      };
    }
    if (isMeaningfulId(element.id)) {
      return {
        element,
        selector: `#${cssEscape(element.id)}`,
        confidence: 0.82
      };
    }
    const className = getMeaningfulClassName(element);
    if (className) {
      return {
        element,
        selector: `${element.tagName.toLowerCase()}.${cssEscape(className)}`,
        confidence: 0.76
      };
    }
    element = element.parentElement;
  }
  return void 0;
}
function getAnchorSourceElement(target, candidate, configuredAttribute) {
  if (candidate.strategy === "configured-attribute") {
    return target.closest(`[${configuredAttribute}]`);
  }
  if (candidate.strategy === "dom-path") return target;
  try {
    return target.closest(candidate.selector);
  } catch {
    return target;
  }
}
function tryClosest(element, selector) {
  try {
    return element.closest(selector);
  } catch {
    return null;
  }
}
function getElementHtmlSnippet(element, maxLength = 1e3) {
  const html = decodeHtmlEntities(element.outerHTML.replace(/\s+/g, " ").trim());
  if (html.length <= maxLength) return html;
  return `${html.slice(0, maxLength - 3)}...`;
}
function decodeHtmlEntities(value) {
  return value.replace(
    /&(#\d+|#x[\da-f]+|lt|gt|quot|apos|amp);/gi,
    (match, entity) => {
      const normalized = entity.toLowerCase();
      if (normalized === "lt") return "<";
      if (normalized === "gt") return ">";
      if (normalized === "quot") return '"';
      if (normalized === "apos") return "'";
      if (normalized === "amp") return "&";
      const codePoint = normalized.startsWith("#x") ? Number.parseInt(normalized.slice(2), 16) : Number.parseInt(normalized.slice(1), 10);
      return Number.isFinite(codePoint) ? String.fromCodePoint(codePoint) : match;
    }
  );
}
function getDomSourceHint(target) {
  const sourceElement = target.closest(
    [
      "[data-wrk-source-file]",
      "[data-wrk-source-component]",
      "[data-wrk-source-line]",
      "[data-wrk-source-column]",
      "[data-file]",
      "[data-component]",
      "[data-section-index]",
      "[data-section-id]"
    ].join(", ")
  );
  if (!sourceElement) return void 0;
  const source = {
    component: getSourceAttribute2(
      sourceElement,
      "data-wrk-source-component",
      "data-component"
    ),
    file: getSourceAttribute2(sourceElement, "data-wrk-source-file", "data-file"),
    line: getSourceAttribute2(sourceElement, "data-wrk-source-line"),
    column: getSourceAttribute2(sourceElement, "data-wrk-source-column"),
    sectionId: getSourceAttribute2(sourceElement, "data-section-id"),
    sectionIndex: getSourceAttribute2(sourceElement, "data-section-index")
  };
  return Object.values(source).some(Boolean) ? source : void 0;
}
function getSourceAttribute2(element, ...names) {
  for (const name of names) {
    const value = element.getAttribute(name)?.trim();
    if (value) return value;
  }
  return void 0;
}
function dedupeAnchorCandidates(candidates) {
  const seen = /* @__PURE__ */ new Set();
  return candidates.filter((candidate) => {
    const key = `${candidate.strategy}:${candidate.selector}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
function queryBestAnchorCandidate(candidate, textFingerprint, environment) {
  const elements = queryAnchorElements(candidate.selector, environment);
  if (elements.length === 0) return void 0;
  if (!textFingerprint) {
    return {
      element: elements[0],
      score: 1
    };
  }
  return elements.map((element) => ({
    element,
    score: getTextFingerprintScore(
      textFingerprint,
      getTextFingerprint(element)
    )
  })).sort((a, b) => b.score - a.score)[0];
}
function queryAnchorElement(selector, environment) {
  return queryAnchorElements(selector, environment)[0];
}
function queryAnchorElements(selector, environment) {
  try {
    return Array.from(environment.document.querySelectorAll(selector));
  } catch {
    return [];
  }
}
function findClosest(start, predicate) {
  let element = start;
  const root = start.ownerDocument.documentElement;
  while (element && element !== root) {
    if (predicate(element)) return element;
    element = element.parentElement;
  }
  return void 0;
}
function getDomPath(element) {
  const parts = [];
  let current = element;
  const ownerDocument = element.ownerDocument;
  while (current && current !== ownerDocument.body && current !== ownerDocument.documentElement) {
    const parent = current.parentElement;
    const tag = current.tagName.toLowerCase();
    if (!parent) {
      parts.unshift(tag);
      break;
    }
    const currentTagName = current.tagName;
    const siblings = Array.from(parent.children).filter(
      (child) => child.tagName === currentTagName
    );
    const index = siblings.indexOf(current) + 1;
    parts.unshift(`${tag}:nth-of-type(${index})`);
    current = parent;
  }
  return `body > ${parts.join(" > ")}`;
}
function getDomPathBetween(ancestor, target, ancestorSelector) {
  const parts = [];
  let current = target;
  while (current && current !== ancestor) {
    parts.unshift(getDomPathPart(current));
    current = current.parentElement;
  }
  if (current !== ancestor || parts.length === 0) return void 0;
  return `${ancestorSelector} > ${parts.join(" > ")}`;
}
function getDomPathPart(element) {
  const parent = element.parentElement;
  const tag = element.tagName.toLowerCase();
  if (!parent) return tag;
  const currentTagName = element.tagName;
  const siblings = Array.from(parent.children).filter(
    (child) => child.tagName === currentTagName
  );
  const index = siblings.indexOf(element) + 1;
  return `${tag}:nth-of-type(${index})`;
}
function getTextFingerprint(element) {
  const text = element.textContent?.replace(/\s+/g, " ").trim();
  return text ? text.slice(0, 120) : void 0;
}
function getStableAttributeValue(element, attributeName) {
  const value = element.getAttribute(attributeName)?.trim();
  if (!value || value.length > 160) return void 0;
  if (/^(true|false)$/i.test(value)) return void 0;
  if (/^\d+$/.test(value) && value.length < 3) return void 0;
  return value;
}
function getTextFingerprintScore(expected, actual) {
  if (!expected) return 1;
  if (!actual) return 0.5;
  if (expected === actual) return 1;
  if (actual.includes(expected) || expected.includes(actual)) return 0.82;
  const expectedTokens = getFingerprintTokens(expected);
  const actualTokens = new Set(getFingerprintTokens(actual));
  if (expectedTokens.length === 0 || actualTokens.size === 0) return 0.5;
  const matches = expectedTokens.filter((token) => actualTokens.has(token));
  return clamp(matches.length / expectedTokens.length, 0.25, 0.76);
}
function getSelectionMatchScore(element, selection) {
  const rect = element.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0) return 0.05;
  const overlapLeft = Math.max(rect.left, selection.left);
  const overlapTop = Math.max(rect.top, selection.top);
  const overlapRight = Math.min(rect.right, selection.left + selection.width);
  const overlapBottom = Math.min(rect.bottom, selection.top + selection.height);
  const overlapWidth = Math.max(0, overlapRight - overlapLeft);
  const overlapHeight = Math.max(0, overlapBottom - overlapTop);
  const overlapArea = overlapWidth * overlapHeight;
  if (overlapArea > 0) {
    const selectionArea = Math.max(1, selection.width * selection.height);
    const rectArea = Math.max(1, rect.width * rect.height);
    return 1 + overlapArea / Math.min(selectionArea, rectArea);
  }
  const rectCenterX = rect.left + rect.width / 2;
  const rectCenterY = rect.top + rect.height / 2;
  const selectionCenterX = selection.left + selection.width / 2;
  const selectionCenterY = selection.top + selection.height / 2;
  const distance = Math.hypot(
    rectCenterX - selectionCenterX,
    rectCenterY - selectionCenterY
  );
  const basis = Math.max(
    1,
    rect.width,
    rect.height,
    selection.width,
    selection.height
  );
  return clamp(1 / (1 + distance / basis), 0.05, 0.95);
}
function getFingerprintTokens(value) {
  return value.toLowerCase().split(/[\s/|,.:;()[\]{}"'`~!?<>]+/).map((token) => token.trim()).filter((token) => token.length > 1);
}
function isMeaningfulId(value) {
  const normalized = value.trim().toLowerCase();
  if (normalized.length <= 1) return false;
  return ![
    "app",
    "main",
    "page",
    "root",
    "__next",
    "__nuxt"
  ].includes(normalized);
}
function getMeaningfulClassName(element) {
  return Array.from(element.classList).find((name) => isMeaningfulClass(name));
}
function isMeaningfulClass(value) {
  const normalized = value.trim();
  if ([
    "absolute",
    "block",
    "contents",
    "fixed",
    "flex",
    "grid",
    "hidden",
    "relative",
    "sticky"
  ].includes(normalized)) {
    return false;
  }
  return normalized.length > 2 && !normalized.includes(":") && !/^(aspect|basis|bg|border|bottom|col|content|delay|duration|ease|font|from|gap|grow|h|inset|items|justify|leading|left|m|max-h|max-w|mb|ml|mr|mt|mx|my|min-h|min-w|object|opacity|order|origin|overflow|p|pb|pl|place|pointer|pr|pt|px|py|right|rotate|rounded|row|scale|self|shadow|shrink|text|to|top|tracking|transition|translate|via|w|z)-/.test(
    normalized
  ) && !normalized.startsWith("mq-");
}

// src/core/id.ts
function createId() {
  if ("randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

// src/core/hotkey.ts
function isHotkey(event, hotkey) {
  const parts = hotkey.split("+").map((part) => part.trim().toLowerCase()).filter(Boolean);
  const key = parts.find(
    (part) => !["shift", "ctrl", "control", "alt", "meta", "cmd"].includes(part)
  );
  if (!key) return false;
  if (parts.includes("shift") !== event.shiftKey) return false;
  if ((parts.includes("ctrl") || parts.includes("control")) !== event.ctrlKey) {
    return false;
  }
  if (parts.includes("alt") !== event.altKey) return false;
  if ((parts.includes("meta") || parts.includes("cmd")) !== event.metaKey) {
    return false;
  }
  return isHotkeyKey(event, key);
}
function isHotkeyKey(event, key) {
  const normalizedKey = key.toLowerCase();
  if (event.key.toLowerCase() === normalizedKey) return true;
  if (getHotkeyCode(normalizedKey) === event.code) return true;
  const aliases = {
    q: ["\u3142", "\u3143"]
  };
  return aliases[normalizedKey]?.includes(event.key) ?? false;
}
function getHotkeyCode(key) {
  if (/^[a-z]$/.test(key)) return `Key${key.toUpperCase()}`;
  if (/^[0-9]$/.test(key)) return `Digit${key}`;
  return void 0;
}

// src/core/location.ts
var INTERNAL_QUERY_PARAMS = ["__dfwr_target"];
function getPageUrl(environment) {
  const location = environment?.window.location ?? window.location;
  const search = getPublicSearch(location);
  return `${location.origin}${location.pathname}${search}${location.hash}`;
}
function getOriginalUrl(environment) {
  const location = environment?.window.location ?? window.location;
  const search = getPublicSearch(location);
  return `${location.origin}${location.pathname}${search}${location.hash}`;
}
function getRouteKey(environment) {
  const location = environment?.window.location ?? window.location;
  return normalizeRoutePath(location.pathname);
}
function getPublicSearch(location) {
  const params = new URLSearchParams(location.search);
  INTERNAL_QUERY_PARAMS.forEach((key) => params.delete(key));
  const value = params.toString();
  return value ? `?${value}` : "";
}

// src/core/review/scope.ts
var DEFAULT_REVIEW_VIEWPORTS = [
  { label: "Mobile", width: 390, height: 720, scope: "mobile" },
  { label: "Tablet", width: 768, height: 1024, scope: "tablet" },
  { label: "Desktop", width: 1440, height: 900, scope: "desktop" },
  { label: "Wide", width: 1980, height: 1080, scope: "wide" }
];
var REVIEW_SCOPE_LABELS = {
  mobile: "Mobile",
  tablet: "Tablet",
  desktop: "Desktop",
  wide: "Wide",
  dom: "Element"
};
var normalizeReviewItemScope = (value) => {
  if (value === "element") return "dom";
  if (value === "mobile" || value === "tablet" || value === "desktop" || value === "wide" || value === "dom") {
    return value;
  }
  return void 0;
};
var getViewportPresetDistance2 = (preset, viewport) => Math.abs(preset.width - viewport.width) + Math.abs(preset.height - viewport.height);
var inferViewportScope = (preset) => {
  if (preset.scope) return preset.scope;
  const label = preset.label.toLowerCase();
  if (label.includes("mobile") || label.includes("phone")) return "mobile";
  if (label.includes("tablet") || label.includes("pad")) return "tablet";
  if (label.includes("wide") || label.includes("1980") || label.includes("1940") || label.includes("1920")) {
    return "wide";
  }
  if (label.includes("desktop")) return "desktop";
  if (preset.width >= 1800) return "wide";
  if (preset.width >= 1e3) return "desktop";
  if (preset.width >= 700) return "tablet";
  return "mobile";
};
function findReviewViewportPreset(viewport, presets = DEFAULT_REVIEW_VIEWPORTS) {
  const fallback = presets[0] ?? DEFAULT_REVIEW_VIEWPORTS[0];
  const exact = presets.find(
    (preset) => preset.width === viewport.width && preset.height === viewport.height
  );
  if (exact) return exact;
  return presets.reduce((closest, preset) => {
    const closestDistance = getViewportPresetDistance2(closest, viewport);
    const presetDistance = getViewportPresetDistance2(preset, viewport);
    return presetDistance < closestDistance ? preset : closest;
  }, fallback);
}
function getReviewViewportScope(viewport, presets = DEFAULT_REVIEW_VIEWPORTS) {
  return inferViewportScope(findReviewViewportPreset(viewport, presets));
}
function getReviewItemScope(item, presets = DEFAULT_REVIEW_VIEWPORTS) {
  const scope = normalizeReviewItemScope(item.scope);
  if (scope && scope !== "dom") return scope;
  return getReviewViewportScope(item.viewport, presets);
}
function getReviewItemScopeLabel(item, presets = DEFAULT_REVIEW_VIEWPORTS) {
  const scope = getReviewItemScope(item, presets);
  if (scope === "dom") return REVIEW_SCOPE_LABELS.dom;
  const preset = findReviewViewportPreset(item.viewport, presets);
  return preset.label || REVIEW_SCOPE_LABELS[scope];
}
function getNumberedReviewItems(items, presets = DEFAULT_REVIEW_VIEWPORTS) {
  const draftLabels = /* @__PURE__ */ new Map();
  let nextDraftNumber = 1;
  [...items].sort((a, b) => {
    const createdOrder = a.createdAt.localeCompare(b.createdAt);
    if (createdOrder !== 0) return createdOrder;
    return a.id.localeCompare(b.id);
  }).forEach((item) => {
    if (!getReviewItemNumber(item)) {
      draftLabels.set(item.id, `draft-${nextDraftNumber++}`);
    }
  });
  return items.map((item) => {
    const scope = getReviewItemScope(item, presets);
    const label = getReviewItemScopeLabel(item, presets);
    const number = getReviewItemNumber(item);
    return {
      item,
      scope,
      label,
      number,
      displayLabel: number ? `#${number}` : draftLabels.get(item.id) ?? "draft"
    };
  });
}
function getReviewItemNumber(item) {
  return normalizeReviewNumber(item.reviewNumber);
}
function normalizeReviewNumber(value) {
  if (typeof value !== "number") return void 0;
  if (!Number.isInteger(value) || value < 1) return void 0;
  return value;
}

// src/core/review/item.ts
function getBoundMarkerPoint(item, environment) {
  const marker = getItemMarker(item);
  if (!marker) return void 0;
  if (item.kind !== "area" && item.anchor && marker.relative) {
    const resolved = resolveAnchorElement(item.anchor, environment);
    const element = resolved?.element;
    if (element) {
      const rect = element.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        return {
          viewport: roundPoint({
            x: rect.left + rect.width * marker.relative.x,
            y: rect.top + rect.height * marker.relative.y
          }),
          isBound: true,
          confidence: resolved.confidence,
          selector: resolved.candidate.selector
        };
      }
    }
  }
  const sourceScroll = item.scroll ?? { x: 0, y: 0 };
  return {
    viewport: roundPoint({
      x: marker.viewport.x + sourceScroll.x - environment.window.scrollX,
      y: marker.viewport.y + sourceScroll.y - environment.window.scrollY
    }),
    isBound: false,
    confidence: 0
  };
}
function getItemHighlightSelection(item, environment) {
  if (item.kind === "area") {
    return getVisibleHighlightSelection(
      [
        getBoundSelection(item, environment),
        getPointHighlightSelection(item, environment)
      ],
      environment
    );
  }
  if (isDomReviewItem(item)) {
    return getVisibleHighlightSelection(
      [
        getAnchorHighlightSelection(item, environment),
        getBoundSelection(item, environment),
        getPointHighlightSelection(item, environment)
      ],
      environment
    );
  }
  return getVisibleHighlightSelection(
    [
      getAnchorHighlightSelection(item, environment),
      getBoundSelection(item, environment),
      getPointHighlightSelection(item, environment)
    ],
    environment
  );
}
function getReviewItemHighlightMode(item) {
  if (isDomReviewItem(item)) return "dom";
  if (item.kind === "area") return "area";
  return "note";
}
function getItemMarker(item) {
  if (item.marker) return item.marker;
  const selection = getItemSelection(item);
  if (!selection?.viewport) return void 0;
  return {
    viewport: roundPoint(getSelectionCenter(selection.viewport)),
    relative: selection.relative ? roundPoint(getSelectionCenter(selection.relative)) : void 0
  };
}
function getItemSelection(item) {
  const value = item.selection;
  if (!value) return void 0;
  if ("viewport" in value && isRelativeSelection(value.viewport)) {
    return value;
  }
  if (isRelativeSelection(value)) {
    return {
      viewport: value
    };
  }
  return void 0;
}
function shouldShowMarkerForScope(scope, currentScope) {
  return scope === currentScope;
}
function createSelectionCenterMarker(selection, anchor, environment) {
  const centerPoint = getSelectionCenter(selection);
  return {
    viewport: roundPoint(centerPoint),
    relative: anchor ? getRelativePoint(centerPoint, anchor, environment) : void 0
  };
}
function getBoundSelection(item, environment) {
  const selection = getItemSelection(item);
  if (!selection?.viewport) return void 0;
  if (item.kind !== "area" && item.anchor && selection.relative) {
    const resolved = resolveAnchorElement(item.anchor, environment);
    const element = resolved?.element;
    if (element) {
      const rect = element.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        return {
          viewport: {
            left: rect.left + rect.width * selection.relative.x,
            top: rect.top + rect.height * selection.relative.y,
            width: rect.width * selection.relative.width,
            height: rect.height * selection.relative.height
          },
          isBound: true,
          confidence: resolved.confidence,
          selector: resolved.candidate.selector
        };
      }
    }
  }
  const sourceScroll = item.scroll ?? { x: 0, y: 0 };
  const viewportSelection = toViewportSelection(selection.viewport);
  return {
    viewport: {
      left: viewportSelection.left + sourceScroll.x - environment.window.scrollX,
      top: viewportSelection.top + sourceScroll.y - environment.window.scrollY,
      width: viewportSelection.width,
      height: viewportSelection.height
    },
    isBound: item.kind === "area",
    confidence: 0
  };
}
function getAnchorHighlightSelection(item, environment) {
  if (!item.anchor) return void 0;
  const viewport = getElementViewportSelection(item.anchor, environment);
  if (!viewport) return void 0;
  return {
    viewport,
    isBound: true
  };
}
function getPointHighlightSelection(item, environment) {
  const point = getBoundMarkerPoint(item, environment);
  if (!point) return void 0;
  const size = 16;
  return {
    viewport: {
      left: point.viewport.x - size / 2,
      top: point.viewport.y - size / 2,
      width: size,
      height: size
    },
    isBound: point.isBound
  };
}
function getVisibleHighlightSelection(candidates, environment) {
  return candidates.find(
    (candidate) => Boolean(candidate && isSelectionInViewport(candidate.viewport, environment))
  );
}
function isDomReviewItem(item) {
  return item.scope === "dom" || item.kind === "note" && Boolean(item.anchor && getItemSelection(item));
}

// src/core/draft.metrics.ts
function getDraftViewportScale(viewport, presets) {
  const preset = findReviewViewportPreset(viewport, presets);
  const designWidth = typeof preset.designWidth === "number" && preset.designWidth > 0 ? preset.designWidth : viewport.width;
  const scale = designWidth > 0 ? viewport.width / designWidth : 1;
  return { scale, designWidth, presetLabel: preset.label };
}
function getDraftAdjustmentMetrics(draft, presets) {
  const adjustment = draft.adjustment;
  const x = adjustment?.x ?? 0;
  const y = adjustment?.y ?? 0;
  const scale = adjustment?.scale ?? 0;
  const {
    scale: viewportScale,
    designWidth,
    presetLabel
  } = getDraftViewportScale(draft.viewport, presets);
  const selection = draft.selection ? toViewportSelection(draft.selection.viewport) : void 0;
  const scaleCssDelta = scale * viewportScale;
  const scaleFactor = selection && selection.width > 0 ? Math.max(
    1 / selection.width,
    (selection.width + scaleCssDelta) / selection.width
  ) : 1;
  return {
    x,
    y,
    scale,
    cssX: x * viewportScale,
    cssY: y * viewportScale,
    scaleFactor,
    viewportScale,
    designWidth,
    presetLabel,
    viewportWidth: draft.viewport.width
  };
}
function hasDraftAdjustment(draft, presets) {
  const metrics = getDraftAdjustmentMetrics(draft, presets);
  return metrics.x !== 0 || metrics.y !== 0 || metrics.scale !== 0;
}
function getAdjustedDraftPoint(point, draft, presets) {
  const metrics = getDraftAdjustmentMetrics(draft, presets);
  return {
    x: point.x + metrics.cssX,
    y: point.y + metrics.cssY
  };
}
function getAdjustedDraftSelection(selection, draft, presets) {
  const metrics = getDraftAdjustmentMetrics(draft, presets);
  return {
    ...selection,
    left: selection.left + metrics.cssX,
    top: selection.top + metrics.cssY,
    width: selection.width * metrics.scaleFactor,
    height: selection.height * metrics.scaleFactor
  };
}

// src/core/overlay.style.ts
function createStyleElement() {
  const style = document.createElement("style");
  style.textContent = `
    :host {
      color-scheme: dark;
      ${reviewTypographyTokens}
      --df-review-space-1: 4px;
      --df-review-space-1-5: 6px;
      --df-review-space-2: 8px;
      --df-review-space-2-5: 10px;
      --df-review-space-3: 12px;
      --df-review-space-3-5: 14px;
      --df-review-space-4: 16px;
      --df-review-control-height-sm: 32px;
      --df-review-control-height-md: 34px;
      --df-review-radius-xs: 3px;
      --df-review-radius-sm: 6px;
      --df-review-radius-md: 8px;
      --df-review-radius-pill: 999px;
      --df-review-color-canvas: #111820;
      --df-review-color-panel: #1f2428;
      --df-review-color-panel-strong: #15191d;
      --df-review-color-control: #2c3338;
      --df-review-color-control-hover: #3b444b;
      --df-review-color-border: rgba(255, 255, 255, 0.14);
      --df-review-color-border-strong: rgba(255, 255, 255, 0.18);
      --df-review-color-text: #f7f7f2;
      --df-review-color-text-muted: rgba(247, 247, 242, 0.62);
      --df-review-color-text-subtle: rgba(247, 247, 242, 0.46);
      --df-review-color-accent: #d7ff5f;
      --df-review-color-accent-contrast: #171b1e;
      --df-review-color-accent-soft: rgba(215, 255, 95, 0.16);
      --df-review-color-accent-ring: rgba(215, 255, 95, 0.6);
      --df-review-color-area: #63d7c7;
      --df-review-color-error: #ffb7a7;
      --df-review-shadow-panel: 0 18px 48px rgba(0, 0, 0, 0.34);
      --df-review-shadow-popover: 0 16px 38px rgba(0, 0, 0, 0.32);
      --df-review-shadow-highlight: 0 10px 30px rgba(0, 0, 0, 0.22);
      font-family: var(--df-review-font-sans);
    }

    * {
      box-sizing: border-box;
    }

    .dfwr-shell {
      display: none;
      position: fixed;
      inset: 0;
      z-index: 500;
      pointer-events: none;
    }

    .dfwr-shell.is-open {
      display: block;
    }

    .dfwr-shell.has-dismissible-draft {
      z-index: 900;
    }

    .dfwr-draft-cancel-layer {
      position: fixed;
      inset: 0;
      z-index: 2;
      pointer-events: auto;
      background: transparent;
      cursor: default;
    }

    .dfwr-shell.is-docked-composer {
      position: relative;
      inset: auto;
      z-index: auto;
      padding: 0;
      pointer-events: auto;
    }

    .dfwr-panel {
      position: fixed;
      right: 16px;
      top: 16px;
      z-index: 3;
      width: min(380px, calc(100vw - 32px));
      max-height: calc(100vh - 32px);
      overflow: auto;
      pointer-events: auto;
      color: var(--df-review-color-text);
      background: var(--df-review-color-panel);
      border: 1px solid var(--df-review-color-border);
      border-radius: var(--df-review-radius-md);
      box-shadow: var(--df-review-shadow-panel);
    }

    .dfwr-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 16px;
      padding: 14px 14px 10px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .dfwr-title {
      font-size: var(--df-review-font-size-xl);
      font-weight: var(--df-review-font-weight-emphasis);
      line-height: 1.25;
    }

    .dfwr-meta {
      max-width: 292px;
      margin-top: 4px;
      overflow: hidden;
      color: rgba(247, 247, 242, 0.56);
      font-size: var(--df-review-font-size-xs);
      line-height: 1.35;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .dfwr-toolbar,
    .dfwr-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      padding: 12px 14px;
    }

    .dfwr-body,
    .dfwr-list {
      padding: 0 14px 14px;
    }

    .dfwr-list {
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      padding-top: 12px;
    }

    .dfwr-button,
    .dfwr-icon-button {
      appearance: none;
      border: 1px solid var(--df-review-color-border-strong);
      background: var(--df-review-color-control);
      color: var(--df-review-color-text);
      cursor: pointer;
      font: inherit;
    }

    .dfwr-button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      min-height: var(--df-review-control-height-md);
      padding: 0 12px;
      border-radius: var(--df-review-radius-sm);
      font-size: var(--df-review-font-size-sm);
      font-weight: var(--df-review-font-weight-emphasis);
    }

    .dfwr-button:hover,
    .dfwr-icon-button:hover,
    .dfwr-button.is-active {
      border-color: rgba(255, 255, 255, 0.4);
      background: var(--df-review-color-control-hover);
    }

    .dfwr-button.is-primary {
      border-color: var(--df-review-color-accent);
      background: var(--df-review-color-accent);
      color: var(--df-review-color-accent-contrast);
    }

    .dfwr-button:disabled {
      cursor: default;
      opacity: 0.62;
    }

    .dfwr-spinner {
      display: inline-block;
      width: 12px;
      height: 12px;
      border: 2px solid currentColor;
      border-right-color: transparent;
      border-radius: 999px;
      animation: dfwr-spin 720ms linear infinite;
    }

    .dfwr-icon-button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 32px;
      height: var(--df-review-control-height-sm);
      padding: 0 8px;
      border-radius: var(--df-review-radius-sm);
      font-size: var(--df-review-font-size-xs);
      font-weight: var(--df-review-font-weight-emphasis);
      line-height: 1;
      text-transform: uppercase;
    }

    .dfwr-marker-layer {
      position: fixed;
      inset: 0;
      z-index: 1;
      pointer-events: none;
    }

    .dfwr-area-preview-layer {
      position: fixed;
      inset: 0;
      z-index: 3;
      pointer-events: none;
    }

    .dfwr-selection-highlight {
      position: fixed;
      z-index: 1;
      border: 2px solid #d7ff5f;
      border-radius: var(--df-review-radius-xs);
      background: rgba(215, 255, 95, 0.08);
      box-shadow:
        0 0 0 1px rgba(31, 36, 40, 0.72),
        0 0 0 9999px rgba(0, 0, 0, 0.12),
        0 10px 30px rgba(0, 0, 0, 0.22);
      animation: dfwr-selection-pulse 900ms ease 0s 2;
    }

    .dfwr-selection-highlight.is-draft {
      border-color: #63d7c7;
      background: rgba(99, 215, 199, 0.1);
      box-shadow:
        0 0 0 1px rgba(31, 36, 40, 0.72),
        0 0 0 9999px rgba(0, 0, 0, 0.08),
        0 10px 30px rgba(0, 0, 0, 0.2);
      animation: none;
    }

    .dfwr-dom-hover {
      position: fixed;
      z-index: 2;
      border: 1px solid #d7ff5f;
      border-radius: var(--df-review-radius-xs);
      background: rgba(215, 255, 95, 0.1);
      box-shadow:
        0 0 0 1px rgba(31, 36, 40, 0.72),
        0 0 0 9999px rgba(0, 0, 0, 0.08);
      pointer-events: none;
    }

    .dfwr-dom-hover[hidden] {
      display: none;
    }

    .dfwr-bound-marker,
    .dfwr-item-scope {
      --dfwr-scope: #7cc7ff;
      --dfwr-scope-rgb: 124, 199, 255;
    }

    .dfwr-bound-marker.is-scope-tablet,
    .dfwr-item-scope.is-scope-tablet {
      --dfwr-scope: #63d7c7;
      --dfwr-scope-rgb: 99, 215, 199;
    }

    .dfwr-bound-marker.is-scope-desktop,
    .dfwr-item-scope.is-scope-desktop {
      --dfwr-scope: #f3b75f;
      --dfwr-scope-rgb: 243, 183, 95;
    }

    .dfwr-bound-marker.is-scope-wide,
    .dfwr-item-scope.is-scope-wide {
      --dfwr-scope: #c99cff;
      --dfwr-scope-rgb: 201, 156, 255;
    }

    .dfwr-bound-marker.is-scope-dom,
    .dfwr-item-scope.is-scope-dom {
      --dfwr-scope: #ff8f61;
      --dfwr-scope-rgb: 255, 143, 97;
    }

    .dfwr-item-target-highlight,
    .dfwr-item-target-label {
      --dfwr-item-color: #7cc7ff;
      --dfwr-item-color-rgb: 124, 199, 255;
    }

    .dfwr-item-target-highlight.is-mode-area,
    .dfwr-item-target-label.is-mode-area {
      --dfwr-item-color: #63d7c7;
      --dfwr-item-color-rgb: 99, 215, 199;
    }

    .dfwr-item-target-highlight.is-mode-dom,
    .dfwr-item-target-label.is-mode-dom {
      --dfwr-item-color: #ff8f61;
      --dfwr-item-color-rgb: 255, 143, 97;
    }

    .dfwr-item-target-highlight {
      position: fixed;
      z-index: 2;
      border: 2px solid var(--dfwr-item-color);
      border-radius: 4px;
      background: rgba(var(--dfwr-item-color-rgb), 0.08);
      box-shadow:
        0 0 0 1px rgba(31, 36, 40, 0.78),
        0 0 0 9999px rgba(0, 0, 0, 0.08),
        0 12px 30px rgba(0, 0, 0, 0.24);
      pointer-events: none;
    }

    .dfwr-item-target-highlight.is-fallback {
      border-style: dashed;
    }

    .dfwr-item-target-highlight.is-highlighted {
      border-width: 3px;
      background: rgba(var(--dfwr-item-color-rgb), 0.12);
    }

    .dfwr-item-target-highlight.is-highlighted::after {
      content: "";
      position: absolute;
      inset: -6px;
      border: 2px solid var(--dfwr-item-color);
      border-radius: var(--df-review-radius-md);
      opacity: 0;
      animation: dfwr-target-ring-blink 1000ms ease-in-out infinite;
      pointer-events: none;
    }

    .dfwr-item-target-label {
      position: fixed;
      z-index: 3;
      display: inline-flex;
      align-items: center;
      min-width: 24px;
      height: 20px;
      padding: 0 7px;
      border: 1px solid var(--dfwr-item-color);
      border-radius: 4px;
      background: var(--dfwr-item-color);
      box-shadow:
        0 0 0 3px rgba(var(--dfwr-item-color-rgb), 0.2),
        0 8px 18px rgba(0, 0, 0, 0.28);
      color: #111820;
      font-size: var(--df-review-font-size-2xs);
      font-weight: var(--df-review-font-weight-emphasis);
      line-height: 1;
      pointer-events: none;
    }

    .dfwr-item-target-label.is-highlighted {
      animation: dfwr-selected-blink 1000ms ease-in-out infinite;
    }

    .dfwr-bound-marker {
      position: fixed;
      z-index: 2;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
      min-width: 28px;
      height: 22px;
      padding: 0 6px;
      transform: translate(-50%, -50%);
      border: 1px solid var(--dfwr-scope);
      border-radius: var(--df-review-radius-pill);
      background: var(--df-review-color-panel);
      box-shadow: 0 0 0 4px rgba(var(--dfwr-scope-rgb), 0.18);
      color: var(--dfwr-scope);
      font-size: var(--df-review-font-size-2xs);
      font-weight: var(--df-review-font-weight-emphasis);
    }

    .dfwr-bound-marker.is-highlighted {
      min-width: 32px;
      height: 26px;
      border-width: 2px;
      box-shadow:
        0 0 0 5px rgba(var(--dfwr-scope-rgb), 0.22),
        0 12px 26px rgba(0, 0, 0, 0.34);
      animation: dfwr-selected-blink 1000ms ease-in-out infinite;
    }

    .dfwr-bound-marker.is-fallback {
      border-style: dashed;
    }

    .dfwr-bound-marker.is-note-callout,
    .dfwr-bound-marker.is-note-callout.is-highlighted {
      --dfwr-scope: #7cc7ff;
      --dfwr-scope-rgb: 124, 199, 255;
      min-width: 0;
      width: 0;
      height: 0;
      padding: 0;
      transform: none;
      border: 0;
      border-radius: 0;
      background: transparent;
      box-shadow: none;
      color: var(--dfwr-scope);
      animation: none;
      overflow: visible;
    }

    .dfwr-bound-marker.is-note-callout::before {
      content: "";
      position: absolute;
      left: 0;
      top: 0;
      width: 8px;
      height: 8px;
      transform: translate(-50%, -50%);
      border: 2px solid #111820;
      border-radius: var(--df-review-radius-pill);
      background: var(--dfwr-scope);
      box-shadow:
        0 0 0 3px rgba(var(--dfwr-scope-rgb), 0.22),
        0 6px 16px rgba(0, 0, 0, 0.28);
    }

    .dfwr-bound-marker.is-note-callout.is-highlighted::before {
      animation: dfwr-note-dot-pulse 1000ms ease-in-out infinite;
    }

    .dfwr-bound-marker.is-note-callout .dfwr-bound-marker-icon {
      position: absolute;
      left: 0;
      top: 0;
      width: 31px;
      height: 2px;
      transform: rotate(-42deg);
      transform-origin: left center;
      border-radius: var(--df-review-radius-pill);
      background: currentColor;
      opacity: 1;
    }

    .dfwr-bound-marker.is-note-callout .dfwr-bound-marker-icon::before,
    .dfwr-bound-marker.is-note-callout .dfwr-bound-marker-icon::after {
      display: none;
    }

    .dfwr-bound-marker.is-note-callout .dfwr-bound-marker-number {
      position: absolute;
      left: 24px;
      top: -41px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 28px;
      height: 20px;
      padding: 0 7px;
      border: 1px solid var(--dfwr-scope);
      border-radius: 4px;
      background: var(--dfwr-scope);
      box-shadow:
        0 0 0 3px rgba(var(--dfwr-scope-rgb), 0.18),
        0 8px 18px rgba(0, 0, 0, 0.28);
      color: #111820;
      text-align: center;
      line-height: 1;
      white-space: nowrap;
    }

    .dfwr-bound-marker.is-note-callout.is-highlighted .dfwr-bound-marker-icon,
    .dfwr-bound-marker.is-note-callout.is-highlighted .dfwr-bound-marker-number {
      animation: dfwr-selected-blink 1000ms ease-in-out infinite;
    }

    .dfwr-area-preview-layer .dfwr-bound-marker {
      border-color: #63d7c7;
      background: var(--df-review-color-panel);
      box-shadow:
        0 0 0 5px rgba(99, 215, 199, 0.2),
        0 12px 26px rgba(0, 0, 0, 0.3);
      color: #63d7c7;
    }

    .dfwr-bound-marker-icon {
      position: relative;
      display: inline-block;
      width: 10px;
      height: 10px;
      flex: 0 0 auto;
    }

    .dfwr-bound-marker-icon::before,
    .dfwr-bound-marker-icon::after {
      content: "";
      position: absolute;
      display: block;
    }

    .dfwr-bound-marker-icon::before {
      inset: 1px 2px;
      border: 1.5px solid currentColor;
      border-radius: 2px;
    }

    .dfwr-bound-marker.is-scope-mobile .dfwr-bound-marker-icon::before {
      inset: 0 2.5px;
      border-radius: 2px;
    }

    .dfwr-bound-marker.is-scope-tablet .dfwr-bound-marker-icon::before {
      inset: 0.5px 1.5px;
      border-radius: 2px;
    }

    .dfwr-bound-marker.is-scope-desktop .dfwr-bound-marker-icon::before {
      inset: 1px 0 3px;
      border-radius: 1px;
    }

    .dfwr-bound-marker.is-scope-desktop .dfwr-bound-marker-icon::after {
      left: 3px;
      right: 3px;
      bottom: 0;
      height: 1.5px;
      background: currentColor;
    }

    .dfwr-bound-marker.is-scope-wide .dfwr-bound-marker-icon::before {
      inset: 2px 0;
      border-radius: 1px;
    }

    .dfwr-bound-marker.is-scope-dom .dfwr-bound-marker-icon::before {
      inset: 2px;
      border-radius: 1px;
      transform: rotate(45deg);
    }

    .dfwr-bound-marker-number {
      min-width: 6px;
      text-align: center;
      line-height: 1;
    }

    .dfwr-note-draft {
      position: fixed;
      inset: 0;
      z-index: 4;
      pointer-events: none;
    }

    .dfwr-note-pin {
      appearance: none;
      position: fixed;
      z-index: 5;
      width: 18px;
      height: 18px;
      padding: 0;
      transform: translate(-50%, -50%);
      border: 2px solid #1f2428;
      border-radius: var(--df-review-radius-pill);
      background: var(--df-review-color-accent);
      box-shadow:
        0 0 0 4px rgba(215, 255, 95, 0.22),
        0 8px 18px rgba(0, 0, 0, 0.28);
      cursor: grab;
      pointer-events: auto;
    }

    .dfwr-note-pin:active {
      cursor: grabbing;
    }

    .dfwr-note-popover {
      position: fixed;
      z-index: 4;
      width: min(320px, calc(100vw - 24px));
      padding: 12px;
      pointer-events: auto;
      color: var(--df-review-color-text);
      background: var(--df-review-color-panel);
      border: 1px solid rgba(215, 255, 95, 0.56);
      border-radius: var(--df-review-radius-md);
      box-shadow: var(--df-review-shadow-popover);
    }

    .dfwr-note-popover.is-composer,
    .dfwr-area-draft.is-composer {
      max-height: min(360px, calc(100vh - 32px));
      overflow: auto;
      border-color: rgba(99, 215, 199, 0.56);
    }

    .dfwr-shell.is-docked-composer .dfwr-note-popover.is-docked-composer,
    .dfwr-shell.is-docked-composer .dfwr-area-draft.is-docked-composer {
      position: relative;
      left: auto;
      right: auto;
      top: auto;
      z-index: auto;
      max-height: none;
    }

    .dfwr-shell.is-docked-composer .dfwr-textarea {
      min-height: 184px;
    }

    .dfwr-note-popover.is-dragging,
    .dfwr-area-draft.is-dragging {
      user-select: none;
    }

    .dfwr-draft-drag-handle {
      display: block;
      width: 42px;
      height: 6px;
      margin: 0 auto 10px;
      padding: 0;
      cursor: grab;
      pointer-events: auto;
      background: rgba(247, 247, 242, 0.28);
      border: 0;
      border-radius: 999px;
    }

    .dfwr-draft-drag-handle:hover,
    .dfwr-draft-drag-handle:focus-visible {
      background: rgba(215, 255, 95, 0.62);
    }

    .dfwr-draft-drag-handle:active {
      cursor: grabbing;
    }

    .dfwr-area-draft {
      position: fixed;
      right: 16px;
      top: 16px;
      z-index: 4;
      width: min(360px, calc(100vw - 32px));
      max-height: calc(100vh - 32px);
      overflow: auto;
      padding: 12px;
      pointer-events: auto;
      color: var(--df-review-color-text);
      background: var(--df-review-color-panel);
      border: 1px solid rgba(215, 255, 95, 0.56);
      border-radius: var(--df-review-radius-md);
      box-shadow: var(--df-review-shadow-popover);
    }

    .dfwr-note-popover .dfwr-actions {
      padding: 0;
    }

    .dfwr-actions.has-leading {
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }

    .dfwr-actions-leading,
    .dfwr-actions-primary {
      display: flex;
      align-items: center;
      gap: 8px;
      min-width: 0;
    }

    .dfwr-actions-primary {
      margin-left: auto;
    }

    .dfwr-shell.is-docked-composer .dfwr-actions.has-leading {
      align-items: stretch;
    }

    .dfwr-shell.is-docked-composer .dfwr-actions.has-leading .dfwr-button,
    .dfwr-shell.is-docked-composer .dfwr-actions.has-leading .dfwr-adjust-toggle {
      height: var(--df-review-control-height-md);
      min-height: var(--df-review-control-height-md);
      border-radius: var(--df-review-radius-sm);
    }

    .dfwr-shell.is-docked-composer .dfwr-actions.has-leading .dfwr-button {
      min-width: 96px;
      padding: 0 12px;
      font-size: var(--df-review-font-size-sm);
    }

    .dfwr-shell.is-docked-composer .dfwr-actions.has-leading .dfwr-adjust-toggle {
      width: var(--df-review-control-height-md);
    }

    .dfwr-shell.is-docked-composer .dfwr-actions.has-leading .dfwr-adjust-toggle svg {
      width: 18px;
      height: 18px;
    }

    .dfwr-note-actions {
      justify-content: flex-end;
    }

    .dfwr-note-actions .dfwr-button:first-child {
      margin-right: auto;
    }

    .dfwr-area-draft .dfwr-actions {
      padding: 0;
    }

    .dfwr-form {
      display: grid;
      gap: 10px;
    }

    .dfwr-form-error {
      margin: 0;
      color: #ff8f61;
      font-size: var(--df-review-font-size-sm);
      line-height: 1.4;
      overflow-wrap: anywhere;
    }

    .dfwr-input,
    .dfwr-select,
    .dfwr-textarea {
      width: 100%;
      border: 1px solid rgba(255, 255, 255, 0.16);
      border-radius: var(--df-review-radius-sm);
      padding: 10px;
      color: var(--df-review-color-text);
      background: var(--df-review-color-panel-strong);
      font: inherit;
      font-size: var(--df-review-font-size-md);
      line-height: 1.45;
    }

    .dfwr-input,
    .dfwr-select {
      min-height: 38px;
    }

    .dfwr-select {
      appearance: none;
      cursor: pointer;
    }

    .dfwr-textarea {
      min-height: 92px;
      resize: vertical;
    }

    .dfwr-input:focus,
    .dfwr-select:focus,
    .dfwr-textarea:focus {
      outline: 2px solid var(--df-review-color-accent-ring);
      outline-offset: 1px;
    }

    @media (hover: none) and (pointer: coarse) {
      .dfwr-input,
      .dfwr-select,
      .dfwr-textarea {
        font-size: var(--df-review-font-size-xl);
      }
    }

    @keyframes dfwr-spin {
      to {
        transform: rotate(360deg);
      }
    }

    .dfwr-adjust-panel {
      display: grid;
      gap: 4px;
      padding: 8px 10px;
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: var(--df-review-radius-sm);
      background: rgba(255, 255, 255, 0.04);
    }

    .dfwr-adjust-panel-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      min-width: 0;
    }

    .dfwr-adjust-panel-header .dfwr-adjust-help {
      flex: 1 1 auto;
      min-width: 0;
    }

    .dfwr-adjust-panel.is-active {
      border-color: rgba(215, 255, 95, 0.5);
      background: var(--df-review-color-accent-soft);
    }

    .dfwr-adjust-help,
    .dfwr-adjust-status {
      margin: 0;
      color: var(--df-review-color-text-muted);
      font-size: var(--df-review-font-size-xs);
      line-height: 1.35;
    }

    .dfwr-adjust-status {
      color: var(--df-review-color-text);
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
    }

    .dfwr-adjust-toggle {
      flex: 0 0 auto;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 34px;
      height: 30px;
      padding: 0;
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: var(--df-review-radius-sm);
      background: rgba(255, 255, 255, 0.04);
      color: var(--df-review-color-text);
      cursor: pointer;
      font: inherit;
      font-size: var(--df-review-font-size-lg);
      font-weight: var(--df-review-font-weight-emphasis);
      line-height: 1;
    }

    .dfwr-adjust-toggle:hover,
    .dfwr-adjust-toggle:focus-visible,
    .dfwr-adjust-toggle.is-active {
      border-color: rgba(215, 255, 95, 0.68);
      background: var(--df-review-color-accent-soft);
      outline: none;
    }

    .dfwr-adjust-toggle svg {
      width: 18px;
      height: 18px;
      pointer-events: none;
    }

    .dfwr-empty,
    .dfwr-error {
      margin: 0;
      color: rgba(247, 247, 242, 0.62);
      font-size: var(--df-review-font-size-sm);
      line-height: 1.45;
    }

    .dfwr-error {
      color: var(--df-review-color-error);
    }

    .dfwr-preview,
    .dfwr-thumb {
      display: block;
      width: 100%;
      border: 1px solid var(--df-review-color-border);
      border-radius: var(--df-review-radius-sm);
      object-fit: cover;
      background: var(--df-review-color-canvas);
    }

    .dfwr-preview {
      max-height: 180px;
    }

    .dfwr-thumb {
      max-height: 120px;
      margin-top: 10px;
    }

    .dfwr-list-heading {
      margin-bottom: 10px;
      color: rgba(247, 247, 242, 0.74);
      font-size: var(--df-review-font-size-sm);
      font-weight: var(--df-review-font-weight-emphasis);
    }

    .dfwr-item {
      display: flex;
      gap: 12px;
      justify-content: space-between;
      padding: 12px 0;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      cursor: pointer;
    }

    .dfwr-item:first-of-type {
      border-top: 0;
    }

    .dfwr-item:focus-visible {
      outline: 2px solid rgba(215, 255, 95, 0.72);
      outline-offset: 4px;
    }

    .dfwr-item-body {
      display: grid;
      gap: 4px;
      min-width: 0;
      flex: 1;
    }

    .dfwr-item-badges {
      display: flex;
      align-items: center;
      gap: 6px;
      flex-wrap: wrap;
    }

    .dfwr-item-scope,
    .dfwr-item-kind {
      display: inline-flex;
      align-items: center;
      min-height: 20px;
      border-radius: var(--df-review-radius-pill);
      padding: 0 7px;
      font-size: var(--df-review-font-size-2xs);
      font-weight: var(--df-review-font-weight-emphasis);
      line-height: 1;
      letter-spacing: 0;
      text-transform: uppercase;
    }

    .dfwr-item-scope {
      border: 1px solid rgba(var(--dfwr-scope-rgb), 0.38);
      background: rgba(var(--dfwr-scope-rgb), 0.12);
      color: var(--dfwr-scope);
    }

    .dfwr-item-kind {
      border: 1px solid rgba(255, 255, 255, 0.12);
      background: rgba(255, 255, 255, 0.05);
      color: rgba(247, 247, 242, 0.64);
    }

    .dfwr-item-title {
      margin: 4px 0 0;
      color: var(--df-review-color-text);
      font-size: var(--df-review-font-size-md);
      font-weight: var(--df-review-font-weight-normal);
      line-height: 1.35;
      overflow-wrap: anywhere;
    }

    .dfwr-item-comment {
      margin: 0;
      color: var(--df-review-color-text-muted);
      font-size: var(--df-review-font-size-sm);
      line-height: 1.45;
      overflow-wrap: anywhere;
      white-space: pre-wrap;
    }

    .dfwr-item-comment.is-primary {
      margin: 4px 0;
      color: var(--df-review-color-text);
      font-size: var(--df-review-font-size-md);
      line-height: 1.42;
    }

    .dfwr-item-date {
      color: rgba(247, 247, 242, 0.46);
      font-size: var(--df-review-font-size-xs);
    }

    .dfwr-item-actions {
      display: flex;
      flex-direction: column;
      gap: 6px;
      flex: 0 0 auto;
    }

    .dfwr-text-layer,
    .dfwr-element-layer,
    .dfwr-area-layer {
      position: fixed;
      inset: 0;
      z-index: 1;
      pointer-events: auto;
    }

    .dfwr-text-layer {
      cursor: crosshair;
      background: rgba(0, 0, 0, 0.06);
    }

    .dfwr-element-layer {
      cursor: cell;
      background: rgba(0, 0, 0, 0.06);
    }

    .dfwr-area-layer {
      cursor: crosshair;
      background: rgba(0, 0, 0, 0.22);
    }

    .dfwr-area-box {
      position: fixed;
      z-index: 2;
      width: 0;
      height: 0;
      border: 1px solid #d7ff5f;
      background: rgba(215, 255, 95, 0.16);
      box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.18);
    }

    @keyframes dfwr-marker-pulse {
      0% {
        transform: translate(-50%, -50%) scale(0.92);
      }
      45% {
        transform: translate(-50%, -50%) scale(1.1);
      }
      100% {
        transform: translate(-50%, -50%) scale(1);
      }
    }

    @keyframes dfwr-note-dot-pulse {
      0% {
        transform: translate(-50%, -50%) scale(0.88);
      }
      45% {
        transform: translate(-50%, -50%) scale(1.3);
      }
      100% {
        transform: translate(-50%, -50%) scale(1);
      }
    }

    @keyframes dfwr-selected-blink {
      0%,
      100% {
        opacity: 0.78;
      }
      50% {
        opacity: 1;
      }
    }

    @keyframes dfwr-target-ring-blink {
      0%,
      100% {
        opacity: 0;
        transform: scale(0.98);
      }
      50% {
        opacity: 0.82;
        transform: scale(1);
      }
    }

    @keyframes dfwr-selection-pulse {
      0% {
        opacity: 0.72;
      }
      45% {
        opacity: 1;
      }
      100% {
        opacity: 0.86;
      }
    }

    @media (max-width: 520px) {
      .dfwr-panel {
        left: 8px;
        right: 8px;
        top: auto;
        bottom: 8px;
        width: auto;
        max-height: min(70vh, calc(100vh - 16px));
      }
    }
  `;
  return style;
}

// src/core/review/format.ts
function formatNoteDraftMeta(draft) {
  const parts = [
    `viewport ${formatSize(draft.viewport)}`,
    `point ${formatPoint(draft.marker.viewport)}`
  ];
  if (draft.anchor) {
    parts.push(formatAnchorMeta(draft.anchor));
  }
  return parts.join(" / ");
}
function formatItemMeta(item) {
  const parts = [formatDate(item.createdAt)];
  const marker = getItemMarker(item);
  const selection = getItemSelection(item);
  if (item.viewport) {
    parts.push(`viewport ${formatSize(item.viewport)}`);
  }
  if (marker) {
    parts.push(`point ${formatPoint(marker.viewport)}`);
  }
  if (selection) {
    parts.push(`rect ${formatSelection(selection.viewport)}`);
  }
  if (item.anchor) {
    parts.push(formatAnchorMeta(item.anchor));
  }
  return parts.join(" / ");
}
function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString(void 0, {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
}
function formatSize(size) {
  return `${Math.round(size.width)}x${Math.round(size.height)}`;
}
function formatPoint(point) {
  return `${Math.round(point.x)},${Math.round(point.y)}`;
}
function formatSelection(selection) {
  return [
    Math.round(selection.x),
    Math.round(selection.y),
    Math.round(selection.width),
    Math.round(selection.height)
  ].join(",");
}
function formatAnchorMeta(anchor) {
  const parts = [`dom ${anchor.strategy}`];
  if (typeof anchor.confidence === "number") {
    parts.push(`${Math.round(anchor.confidence * 100)}%`);
  }
  const candidates = getAnchorCandidates(anchor);
  if (candidates.length > 1) {
    parts.push(`${candidates.length} candidates`);
  }
  return parts.join(" ");
}

// src/core/web.review.kit.view.ts
var DEFAULT_ADJUSTMENT_LABEL = "Responsive CSS px adjustments";
var WebReviewKitView = class {
  constructor(config) {
    this.config = config;
  }
  clearDraftPreview() {
    this.restoreDraftPreview();
    this.clearShellComposer();
  }
  render(shadow, hiddenItemsStyle) {
    const state = this.state;
    this.syncDraftPreview(
      state.isOpen && state.mode === "element" ? state.noteDraft : void 0
    );
    shadow.replaceChildren();
    shadow.append(createStyleElement());
    shadow.append(hiddenItemsStyle);
    const hasDismissableDraft = Boolean(state.noteDraft || state.areaDraft);
    const shouldDockComposer = this.config.options.ui?.panel === false && hasDismissableDraft && Boolean(this.getShellComposerHost());
    let dockedComposer;
    const shell = document.createElement("div");
    shell.className = [
      "dfwr-shell",
      state.isOpen ? "is-open" : "",
      hasDismissableDraft && !shouldDockComposer ? "has-dismissible-draft" : ""
    ].filter(Boolean).join(" ");
    shell.setAttribute("aria-hidden", state.isOpen ? "false" : "true");
    if (this.config.options.ui?.panel !== false) {
      const panel = document.createElement("div");
      panel.className = "dfwr-panel";
      panel.setAttribute("role", "dialog");
      panel.setAttribute("aria-label", "Web review kit");
      panel.append(
        this.createHeader(),
        this.createToolbar(),
        this.createBody(),
        this.createList()
      );
      shell.append(panel);
    }
    shell.append(this.createMarkerLayer());
    if (state.isOpen && hasDismissableDraft && !shouldDockComposer) {
      shell.append(this.createDraftCancelLayer());
    }
    if (state.isOpen && (state.mode === "note" || state.mode === "element")) {
      if (state.noteDraft) {
        const noteDraft = this.createNotePopover(state.noteDraft, {
          dockComposer: shouldDockComposer
        });
        shell.append(noteDraft.layer);
        dockedComposer = noteDraft.composer;
      } else {
        shell.append(
          state.mode === "element" ? this.createElementLayer() : this.createNoteLayer()
        );
      }
    }
    if (state.isOpen && state.mode === "area" && !state.areaDraft && !state.isSelectingArea) {
      shell.append(this.createAreaLayer());
    }
    if (state.isOpen && state.mode === "area" && state.areaDraft && this.config.options.ui?.panel === false) {
      if (state.areaDraft.selection) {
        shell.append(this.createAreaDraftOverlay(state.areaDraft));
      }
      const areaComposer = this.createAreaDraftPopover(state.areaDraft, {
        dockComposer: shouldDockComposer
      });
      if (shouldDockComposer) {
        dockedComposer = areaComposer;
      } else {
        shell.append(areaComposer);
      }
    }
    shadow.append(shell);
    this.renderShellComposer(dockedComposer);
  }
  get state() {
    return this.config.getState();
  }
  getShellComposerHost() {
    const environment = this.config.getEnvironment();
    if (this.config.options.ui?.panel !== false) return void 0;
    return environment?.composerHost ?? void 0;
  }
  renderShellComposer(composer) {
    const host = composer ? this.getShellComposerHost() : void 0;
    if (!host || !composer) {
      this.clearShellComposer();
      return;
    }
    if (this.shellComposerHost && this.shellComposerHost !== host) {
      this.clearShellComposer();
    }
    this.shellComposerHost = host;
    host.dataset.hasDraftComposer = "true";
    if (host.parentElement) {
      host.parentElement.dataset.hasDraftComposer = "true";
    }
    const shell = document.createElement("div");
    shell.className = "dfwr-shell is-open is-shell-draft is-docked-composer";
    shell.append(composer);
    host.replaceChildren(createStyleElement(), shell);
  }
  clearShellComposer() {
    const host = this.shellComposerHost;
    host?.replaceChildren();
    if (host) {
      delete host.dataset.hasDraftComposer;
      delete host.parentElement?.dataset.hasDraftComposer;
    }
    this.shellComposerHost = void 0;
  }
  createDraftCancelLayer() {
    const layer = document.createElement("div");
    layer.className = "dfwr-draft-cancel-layer";
    layer.setAttribute("aria-hidden", "true");
    layer.addEventListener("pointerdown", (event) => {
      if (event.button !== 0) return;
      this.cancelDraft(event);
    });
    return layer;
  }
  cancelDraft(event) {
    event?.preventDefault();
    event?.stopPropagation();
    event?.stopImmediatePropagation();
    this.config.actions.setModeState("idle");
    this.config.actions.clearDrafts();
    this.config.actions.setSelectingArea(false);
    this.config.actions.render();
  }
  // Draft adjustment geometry lives in draft.metrics.ts; these thin wrappers
  // supply the configured viewport presets so call sites stay unchanged.
  get viewportPresets() {
    return this.config.options.viewports?.presets;
  }
  getDraftAdjustmentMetrics(draft) {
    return getDraftAdjustmentMetrics(draft, this.viewportPresets);
  }
  hasDraftAdjustment(draft) {
    return hasDraftAdjustment(draft, this.viewportPresets);
  }
  getAdjustedDraftPoint(point, draft) {
    return getAdjustedDraftPoint(point, draft, this.viewportPresets);
  }
  getAdjustedDraftSelection(selection, draft) {
    return getAdjustedDraftSelection(
      selection,
      draft,
      this.viewportPresets
    );
  }
  getDraftViewportScale(viewport) {
    return getDraftViewportScale(viewport, this.viewportPresets);
  }
  getDraftComposerWidth(environment) {
    const bounds = environment.overlayRect;
    const margin = 12;
    return Math.min(360, Math.max(240, bounds.width - margin * 2));
  }
  getClampedComposerPosition(position, environment, size, bounds = environment.overlayRect) {
    const margin = 12;
    const width = size?.width ?? this.getDraftComposerWidth(environment);
    const height = size?.height ?? 236;
    return {
      x: clamp(
        position.x,
        bounds.left + margin,
        bounds.left + bounds.width - width - margin
      ),
      y: clamp(
        position.y,
        bounds.top + margin,
        bounds.top + bounds.height - height - margin
      )
    };
  }
  getHostComposerBounds() {
    const root = document.documentElement;
    return {
      left: 0,
      top: 0,
      width: root.clientWidth || window.innerWidth,
      height: root.clientHeight || window.innerHeight
    };
  }
  getInitialDraftComposerPosition(selection, environment, size) {
    const bounds = this.getHostComposerBounds();
    const margin = 12;
    const gap = 20;
    if (!selection) {
      return this.getClampedComposerPosition(
        {
          x: environment.overlayRect.left + margin,
          y: environment.overlayRect.top + margin
        },
        environment,
        size,
        bounds
      );
    }
    const preferredX = selection.left + selection.width + gap;
    const maxX = bounds.left + bounds.width - size.width - margin;
    const x = preferredX <= maxX ? preferredX : selection.left - size.width - gap;
    return this.getClampedComposerPosition(
      {
        x,
        y: selection.top
      },
      environment,
      size,
      bounds
    );
  }
  getDraftComposerPosition({
    selection,
    environment,
    composerPosition,
    estimatedHeight
  }) {
    const width = this.getDraftComposerWidth(environment);
    if (composerPosition) {
      const clamped = this.getClampedComposerPosition(
        composerPosition,
        environment,
        { width, height: estimatedHeight },
        this.getHostComposerBounds()
      );
      return { width, left: clamped.x, top: clamped.y };
    }
    const position = this.getInitialDraftComposerPosition(selection, environment, {
      width,
      height: estimatedHeight
    });
    return { width, left: position.x, top: position.y };
  }
  getSelectionMqMetrics(selection, viewport) {
    const { scale } = this.getDraftViewportScale(viewport);
    const ratio = scale > 0 ? 1 / scale : 1;
    return {
      x: selection.left * ratio,
      y: selection.top * ratio,
      width: selection.width * ratio,
      height: selection.height * ratio
    };
  }
  formatSignedPx(value) {
    if (value === 0) return "+0px";
    return `${value > 0 ? "+" : ""}${value}px`;
  }
  formatRoundedPx(value) {
    return `${Math.round(value)}px`;
  }
  getAdjustmentLabel() {
    return this.config.options.adjustmentLabel?.trim() || DEFAULT_ADJUSTMENT_LABEL;
  }
  getSelectionMetricLines(selection, viewport) {
    if (!selection) return ["area", "x none / y none", "w none / h none"];
    const metrics = this.getSelectionMqMetrics(selection, viewport);
    return [
      "area",
      `x ${this.formatRoundedPx(metrics.x)} / y ${this.formatRoundedPx(
        metrics.y
      )}`,
      `w ${this.formatRoundedPx(metrics.width)} / h ${this.formatRoundedPx(
        metrics.height
      )}`
    ];
  }
  getAreaDraftMetricSelection(draft) {
    if (!draft.selection) return void 0;
    return toViewportSelection(draft.selection.viewport);
  }
  getDraftAdjustmentMetricLines(draft) {
    const metrics = this.getDraftAdjustmentMetrics(draft);
    return [
      `x ${this.formatSignedPx(metrics.x)} / y ${this.formatSignedPx(
        metrics.y
      )}`,
      `scale ${this.formatSignedPx(metrics.scale)}`
    ];
  }
  withDraftAdjustmentComment(comment, draft) {
    if (!this.hasDraftAdjustment(draft)) return comment;
    const trimmedComment = comment.trim();
    const metrics = this.getDraftAdjustmentMetrics(draft);
    const adjustment = [
      `${this.getAdjustmentLabel()}: x ${this.formatSignedPx(
        metrics.x
      )}, y ${this.formatSignedPx(metrics.y)}, scale ${this.formatSignedPx(
        metrics.scale
      )}`,
      `(${metrics.presetLabel} viewport, ${Math.round(
        metrics.viewportWidth
      )}/design ${Math.round(metrics.designWidth)})`
    ].join(" ");
    return trimmedComment ? `${trimmedComment}
${adjustment}` : adjustment;
  }
  getAssigneeOption(assigneeId) {
    if (!assigneeId) return void 0;
    return this.config.options.assigneeOptions?.find(
      (option) => option.value === assigneeId
    );
  }
  getAssigneeName(assigneeId) {
    return this.getAssigneeOption(assigneeId)?.label;
  }
  createDraftTitleInput(value, onInput) {
    const input = document.createElement("input");
    input.className = "dfwr-input";
    input.placeholder = "Title";
    input.type = "text";
    input.value = value ?? "";
    input.addEventListener("input", () => onInput(input.value));
    return input;
  }
  isTitleFieldEnabled() {
    return this.config.options.fields?.title === true;
  }
  createDraftAssigneeSelect(value, fallbackLabel, onChange) {
    const assigneeOptions = this.config.options.assigneeOptions ?? [];
    if (assigneeOptions.length === 0) return void 0;
    const assigneeTitle = this.config.options.assigneeTitle?.trim() || "Assignee";
    const select = document.createElement("select");
    select.className = "dfwr-select";
    const emptyOption = document.createElement("option");
    emptyOption.value = "";
    emptyOption.textContent = assigneeTitle;
    select.append(emptyOption);
    const hasUnknownAssignee = Boolean(value) && !assigneeOptions.some((option) => option.value === value);
    if (hasUnknownAssignee && value) {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = fallbackLabel ?? value;
      select.append(option);
    }
    assigneeOptions.forEach((assigneeOption) => {
      const option = document.createElement("option");
      option.value = assigneeOption.value;
      option.textContent = assigneeOption.label;
      select.append(option);
    });
    select.value = value ?? "";
    select.addEventListener("change", () => {
      onChange(select.value || null, this.getAssigneeName(select.value));
    });
    return select;
  }
  getDraftFields(titleInput, textarea, assigneeSelect) {
    const title = titleInput?.value.trim();
    const comment = textarea.value.trim();
    const assigneeId = assigneeSelect?.value.trim() || void 0;
    return {
      title: title || void 0,
      comment,
      assigneeId,
      assigneeName: this.getAssigneeName(assigneeId)
    };
  }
  getStyleableDraftElement(draft, environment) {
    if (draft.previewElement && draft.previewElement.ownerDocument === environment.document && "style" in draft.previewElement) {
      return draft.previewElement;
    }
    if (!draft.anchor) return void 0;
    const preferredSelection = draft.selection ? toViewportSelection(draft.selection.viewport) : void 0;
    const element = resolveAnchorElement(
      draft.anchor,
      environment,
      preferredSelection
    )?.element;
    if (!element) return void 0;
    if ("style" in element) return element;
    return void 0;
  }
  syncDraftPreview(draft) {
    const environment = this.config.getEnvironment();
    if (!draft || !environment || !this.hasDraftAdjustment(draft)) {
      this.restoreDraftPreview();
      return;
    }
    const element = this.getStyleableDraftElement(draft, environment);
    if (!element) {
      this.restoreDraftPreview();
      return;
    }
    if (this.draftPreview?.element !== element) {
      this.restoreDraftPreview();
    }
    if (!this.draftPreview) {
      const computedStyle = environment.window.getComputedStyle(element);
      const clone = element.cloneNode(true);
      this.removeDuplicateIds(clone);
      this.copyComputedStyle(element, clone, environment);
      this.positionDraftPreviewClone(clone, element, computedStyle);
      environment.document.body?.appendChild(clone);
      this.draftPreview = {
        element,
        clone,
        visibility: element.style.visibility
      };
      element.style.visibility = "hidden";
    }
    const metrics = this.getDraftAdjustmentMetrics(draft);
    const translate = `translate(${this.toCssNumber(metrics.cssX)}px, ${this.toCssNumber(
      metrics.cssY
    )}px)`;
    const scale = metrics.scaleFactor === 1 ? "" : `scale(${this.toCssNumber(metrics.scaleFactor)})`;
    this.draftPreview.clone.style.transform = [translate, scale].filter(Boolean).join(" ");
  }
  restoreDraftPreview() {
    if (!this.draftPreview) return;
    const { element, clone, visibility } = this.draftPreview;
    clone.remove();
    element.style.visibility = visibility;
    this.draftPreview = void 0;
  }
  positionDraftPreviewClone(clone, element, computedStyle) {
    const rect = element.getBoundingClientRect();
    clone.setAttribute("data-dfwr-adjust-preview", "true");
    clone.setAttribute("aria-hidden", "true");
    clone.style.position = "fixed";
    clone.style.left = `${this.toCssNumber(rect.left)}px`;
    clone.style.top = `${this.toCssNumber(rect.top)}px`;
    clone.style.right = "auto";
    clone.style.bottom = "auto";
    clone.style.width = `${this.toCssNumber(rect.width)}px`;
    clone.style.height = `${this.toCssNumber(rect.height)}px`;
    clone.style.maxWidth = "none";
    clone.style.maxHeight = "none";
    clone.style.margin = "0";
    clone.style.boxSizing = "border-box";
    clone.style.display = this.getDraftPreviewDisplay(computedStyle.display);
    clone.style.zIndex = "2147483646";
    clone.style.pointerEvents = "none";
    clone.style.transition = "none";
    clone.style.willChange = "transform";
    clone.style.transformOrigin = "top left";
    clone.style.transform = "none";
  }
  getDraftPreviewDisplay(display) {
    if (display === "inline" || display === "contents") return "inline-block";
    return display || "block";
  }
  copyComputedStyle(element, clone, environment) {
    const computedStyle = environment.window.getComputedStyle(element);
    for (let index = 0; index < computedStyle.length; index += 1) {
      const property = computedStyle.item(index);
      clone.style.setProperty(
        property,
        computedStyle.getPropertyValue(property),
        computedStyle.getPropertyPriority(property)
      );
    }
  }
  removeDuplicateIds(element) {
    element.removeAttribute("id");
    element.querySelectorAll("[id]").forEach((child) => {
      child.removeAttribute("id");
    });
  }
  toCssNumber(value) {
    return Math.round(value * 1e3) / 1e3;
  }
  createHeader() {
    const header = document.createElement("div");
    header.className = "dfwr-header";
    const title = document.createElement("div");
    title.className = "dfwr-title";
    title.textContent = "Review Kit";
    const meta = document.createElement("div");
    meta.className = "dfwr-meta";
    meta.textContent = getRouteKey(this.config.getEnvironment());
    const titleGroup = document.createElement("div");
    titleGroup.append(title, meta);
    const close = document.createElement("button");
    close.className = "dfwr-icon-button";
    close.type = "button";
    close.textContent = "x";
    close.setAttribute("aria-label", "Close");
    close.addEventListener("click", () => this.config.actions.close());
    header.append(titleGroup, close);
    return header;
  }
  createToolbar() {
    const toolbar = document.createElement("div");
    toolbar.className = "dfwr-toolbar";
    toolbar.append(
      this.createToolbarButton("Note", this.state.mode === "note", () => {
        const mode = this.state.mode;
        this.config.actions.setModeState(mode === "note" ? "idle" : "note");
        this.config.actions.clearDrafts();
        this.config.actions.render();
      }),
      this.createToolbarButton("Element", this.state.mode === "element", () => {
        const mode = this.state.mode;
        this.config.actions.setModeState(
          mode === "element" ? "idle" : "element"
        );
        this.config.actions.clearDrafts();
        this.config.actions.render();
      }),
      this.createToolbarButton(
        this.state.isSelectingArea ? "Selecting" : "Area",
        this.state.mode === "area",
        () => {
          const mode = this.state.mode;
          this.config.actions.setModeState(mode === "area" ? "idle" : "area");
          this.config.actions.clearDrafts();
          this.config.actions.render();
        }
      ),
      this.createToolbarButton("Refresh", false, () => {
        void this.config.actions.reload();
      })
    );
    return toolbar;
  }
  createToolbarButton(label, active, onClick) {
    const button = document.createElement("button");
    button.className = `dfwr-button${active ? " is-active" : ""}`;
    button.type = "button";
    button.textContent = label;
    button.addEventListener("click", onClick);
    return button;
  }
  createBody() {
    const body = document.createElement("div");
    body.className = "dfwr-body";
    const state = this.state;
    if (state.mode === "idle") {
      const empty = document.createElement("p");
      empty.className = "dfwr-empty";
      empty.textContent = "Add a note or mark an area.";
      body.append(empty);
      return body;
    }
    if (state.mode === "note" || state.mode === "element") {
      body.append(this.createNoteBody());
      return body;
    }
    body.append(this.createAreaForm());
    return body;
  }
  createNoteBody() {
    const empty = document.createElement("p");
    empty.className = "dfwr-empty";
    empty.textContent = this.state.noteDraft ? "Write the note in the page box." : this.state.mode === "element" ? "Click an element to add QA." : "Click on the page to place a note.";
    return empty;
  }
  // Builds the note draft layer: the on-page marker/highlight plus its composer
  // popover. When dockComposer is set the composer renders into the side panel
  // instead of floating next to the marker (used for the docked review mode).
  createNotePopover(draft, options = {}) {
    const environment = this.config.getEnvironment();
    const group = document.createElement("div");
    group.className = "dfwr-note-draft";
    if (!environment) return { layer: group, composer: void 0 };
    const isElementDraft = this.state.mode === "element" && Boolean(draft.selection);
    const hostPoint = toHostPoint(
      isElementDraft ? this.getAdjustedDraftPoint(draft.marker.viewport, draft) : draft.marker.viewport,
      environment
    );
    let selectionHighlight;
    if (draft.selection) {
      const selection = toViewportSelection(draft.selection.viewport);
      selectionHighlight = this.createSelectionHighlight(
        isElementDraft ? this.getAdjustedDraftSelection(selection, draft) : selection,
        environment,
        true
      );
      group.append(selectionHighlight);
    }
    const pin = document.createElement("button");
    pin.className = "dfwr-note-pin";
    pin.type = "button";
    pin.setAttribute("aria-label", "Move note point");
    pin.style.left = `${hostPoint.x}px`;
    pin.style.top = `${hostPoint.y}px`;
    const popover = document.createElement("div");
    const position = getPopoverPosition(hostPoint, environment);
    popover.className = [
      "dfwr-note-popover",
      isElementDraft ? "is-composer" : "",
      options.dockComposer ? "is-docked-composer" : ""
    ].filter(Boolean).join(" ");
    if (options.dockComposer) {
      popover.style.width = "100%";
    } else if (isElementDraft) {
      const selection = draft.selection ? toHostSelection(
        this.getAdjustedDraftSelection(
          toViewportSelection(draft.selection.viewport),
          draft
        ),
        environment
      ) : void 0;
      const composer = this.getDraftComposerPosition({
        selection,
        environment,
        composerPosition: draft.composerPosition,
        estimatedHeight: 252
      });
      popover.style.left = `${composer.left}px`;
      popover.style.top = `${composer.top}px`;
      popover.style.width = `${composer.width}px`;
    } else {
      popover.style.left = `${position.left}px`;
      popover.style.top = `${position.top}px`;
    }
    const form = document.createElement("form");
    form.className = "dfwr-form";
    const meta = isElementDraft ? void 0 : document.createElement("div");
    if (meta) {
      meta.className = "dfwr-item-date";
      meta.textContent = formatNoteDraftMeta(draft);
    }
    const titleInput = this.isTitleFieldEnabled() ? this.createDraftTitleInput(draft.title, (title) => {
      const noteDraft = this.state.noteDraft;
      if (!noteDraft) return;
      this.config.actions.setNoteDraft({
        ...noteDraft,
        title
      });
    }) : void 0;
    const textarea = document.createElement("textarea");
    textarea.className = "dfwr-textarea";
    textarea.placeholder = "Review comment";
    textarea.rows = 4;
    textarea.value = draft.comment ?? "";
    textarea.addEventListener("input", () => {
      const noteDraft = this.state.noteDraft;
      if (!noteDraft) return;
      this.config.actions.setNoteDraft({
        ...noteDraft,
        comment: textarea.value
      });
    });
    const assigneeSelect = this.createDraftAssigneeSelect(
      draft.assigneeId,
      draft.assigneeName,
      (assigneeId, assigneeName) => {
        const noteDraft = this.state.noteDraft;
        if (!noteDraft) return;
        this.config.actions.setNoteDraft({
          ...noteDraft,
          assigneeId,
          assigneeName
        });
      }
    );
    const saveDraft = () => {
      const currentDraft = this.state.noteDraft ?? draft;
      const fields = this.getDraftFields(titleInput, textarea, assigneeSelect);
      const comment = fields.comment;
      if (!comment && !this.hasDraftAdjustment(currentDraft)) return;
      void this.config.actions.createItem({
        kind: "note",
        title: fields.title,
        comment: this.withDraftAdjustmentComment(comment, currentDraft),
        assigneeId: fields.assigneeId,
        assigneeName: fields.assigneeName,
        viewport: currentDraft.viewport,
        anchor: currentDraft.anchor,
        marker: currentDraft.marker,
        selection: currentDraft.selection
      });
    };
    const adjustmentControls = isElementDraft ? this.createAdjustmentControls({
      draft,
      pin,
      popover,
      selectionHighlight,
      textarea,
      dockToggle: options.dockComposer
    }) : void 0;
    const actions = this.createFormActions("Save note", saveDraft, {
      leading: adjustmentControls?.actionButton ? [adjustmentControls.actionButton] : void 0
    });
    const error = this.createDraftError();
    form.append(
      ...meta ? [meta] : [],
      ...adjustmentControls ? [adjustmentControls.panel] : [],
      ...titleInput ? [titleInput] : [],
      textarea,
      ...assigneeSelect ? [assigneeSelect] : [],
      ...error ? [error] : [],
      actions
    );
    const dragHandle = isElementDraft && !options.dockComposer ? this.createDraftDragHandle("Move DOM composer") : void 0;
    popover.append(
      ...dragHandle ? [dragHandle] : [],
      form
    );
    group.append(pin);
    if (!options.dockComposer) {
      group.append(popover);
    }
    if (dragHandle) {
      this.attachDraftComposerDrag(popover, dragHandle, (composerPosition) => {
        const noteDraft = this.state.noteDraft ?? draft;
        this.config.actions.setNoteDraft({
          ...noteDraft,
          composerPosition,
          comment: textarea.value
        });
      });
    }
    this.attachDraftPinDrag(
      pin,
      isElementDraft || options.dockComposer ? void 0 : popover,
      meta,
      textarea
    );
    if (!options.dockComposer) {
      window.setTimeout(() => {
        if (draft.adjustment?.isActive) {
          adjustmentControls?.focusTarget.focus();
          return;
        }
        textarea.focus();
      }, 0);
    }
    return {
      layer: group,
      composer: options.dockComposer ? popover : void 0
    };
  }
  createDraftDragHandle(label) {
    const handle = document.createElement("button");
    handle.className = "dfwr-draft-drag-handle";
    handle.type = "button";
    handle.setAttribute("aria-label", label);
    return handle;
  }
  createIcon(paths) {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("fill", "none");
    svg.setAttribute("stroke", "currentColor");
    svg.setAttribute("stroke-width", "2.4");
    svg.setAttribute("stroke-linecap", "round");
    svg.setAttribute("stroke-linejoin", "round");
    paths.forEach((d) => {
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("d", d);
      svg.append(path);
    });
    return svg;
  }
  setAdjustmentToggleIcon(button, isActive) {
    const paths = isActive ? ["M20 6 9 17l-5-5"] : [
      "M12 2v20",
      "M2 12h20",
      "m9 5 3-3 3 3",
      "m9 19 3 3 3-3",
      "m5 9-3 3 3 3",
      "m19 9 3 3-3 3"
    ];
    button.replaceChildren(this.createIcon(paths));
  }
  attachDraftComposerDrag(popover, handle, onMove) {
    let isDragging = false;
    let offsetX = 0;
    let offsetY = 0;
    const movePopover = (event) => {
      const environment = this.config.getEnvironment();
      if (!environment) return;
      const position = this.getClampedComposerPosition(
        {
          x: event.clientX - offsetX,
          y: event.clientY - offsetY
        },
        environment,
        {
          width: popover.offsetWidth,
          height: popover.offsetHeight
        },
        this.getHostComposerBounds()
      );
      popover.style.left = `${position.x}px`;
      popover.style.top = `${position.y}px`;
      onMove(position);
    };
    handle.addEventListener("pointerdown", (event) => {
      if (event.button !== 0) return;
      const rect = popover.getBoundingClientRect();
      offsetX = event.clientX - rect.left;
      offsetY = event.clientY - rect.top;
      isDragging = true;
      event.preventDefault();
      event.stopPropagation();
      handle.setPointerCapture(event.pointerId);
      popover.classList.add("is-dragging");
    });
    handle.addEventListener("pointermove", (event) => {
      if (!isDragging || !handle.hasPointerCapture(event.pointerId)) return;
      event.preventDefault();
      movePopover(event);
    });
    const stopDrag = (event) => {
      if (!isDragging || !handle.hasPointerCapture(event.pointerId)) return;
      event.preventDefault();
      event.stopPropagation();
      isDragging = false;
      handle.releasePointerCapture(event.pointerId);
      popover.classList.remove("is-dragging");
      movePopover(event);
    };
    handle.addEventListener("pointerup", stopDrag);
    handle.addEventListener("pointercancel", stopDrag);
  }
  // Builds the element-adjustment controls (nudge the previewed element via
  // arrow keys / buttons). Wires keyboard deltas to the draft transform and
  // keeps the pin, popover, highlight and textarea in sync as the value changes.
  createAdjustmentControls({
    draft,
    pin,
    popover,
    selectionHighlight,
    textarea,
    dockToggle
  }) {
    const panel = document.createElement("div");
    panel.className = "dfwr-adjust-panel is-dom-adjust-panel";
    const header = document.createElement("div");
    header.className = "dfwr-adjust-panel-header";
    const help = document.createElement("div");
    help.className = "dfwr-adjust-help";
    help.textContent = this.getAdjustmentLabel();
    const adjust = document.createElement("button");
    adjust.className = "dfwr-adjust-toggle";
    adjust.type = "button";
    adjust.title = "Adjust DOM element with keyboard arrows";
    adjust.setAttribute("aria-label", "Adjust DOM element with keyboard arrows");
    const xyStatus = document.createElement("div");
    xyStatus.className = "dfwr-adjust-status";
    const scaleStatus = document.createElement("div");
    scaleStatus.className = "dfwr-adjust-status";
    const syncControls = (nextDraft) => {
      const isActive = nextDraft.adjustment?.isActive === true;
      panel.classList.toggle("is-active", isActive);
      adjust.classList.toggle("is-active", isActive);
      adjust.setAttribute("aria-pressed", isActive ? "true" : "false");
      this.setAdjustmentToggleIcon(adjust, isActive);
      adjust.title = isActive ? "Finish DOM adjustment" : "Adjust DOM element with keyboard arrows";
      adjust.setAttribute(
        "aria-label",
        isActive ? "Finish DOM adjustment" : "Adjust DOM element with keyboard arrows"
      );
      const [xyLine, scaleLine] = this.getDraftAdjustmentMetricLines(nextDraft);
      xyStatus.textContent = xyLine;
      scaleStatus.textContent = scaleLine;
      this.syncDraftAdjustmentUi({
        draft: nextDraft,
        pin,
        selectionHighlight
      });
    };
    const updateDraft = (updater) => {
      const currentDraft = this.state.noteDraft ?? draft;
      const nextDraft = updater(currentDraft);
      this.config.actions.setNoteDraft({
        ...nextDraft,
        comment: textarea.value
      });
      syncControls(nextDraft);
    };
    adjust.addEventListener("click", () => {
      updateDraft((currentDraft) => ({
        ...currentDraft,
        adjustment: {
          x: currentDraft.adjustment?.x ?? 0,
          y: currentDraft.adjustment?.y ?? 0,
          scale: currentDraft.adjustment?.scale ?? 0,
          isActive: currentDraft.adjustment?.isActive !== true
        }
      }));
      adjust.focus();
    });
    popover.addEventListener("keydown", (event) => {
      const currentDraft = this.state.noteDraft ?? draft;
      if (currentDraft.adjustment?.isActive !== true) return;
      const keyDelta = this.getAdjustmentKeyDelta(event);
      if (!keyDelta) return;
      event.preventDefault();
      event.stopPropagation();
      updateDraft((activeDraft) => ({
        ...activeDraft,
        adjustment: {
          x: (activeDraft.adjustment?.x ?? 0) + keyDelta.x,
          y: (activeDraft.adjustment?.y ?? 0) + keyDelta.y,
          scale: (activeDraft.adjustment?.scale ?? 0) + keyDelta.scale,
          isActive: true
        }
      }));
    });
    header.append(help);
    if (!dockToggle) {
      header.append(adjust);
    }
    panel.append(header, xyStatus, scaleStatus);
    syncControls(draft);
    return {
      panel,
      focusTarget: adjust,
      actionButton: dockToggle ? adjust : void 0
    };
  }
  getAdjustmentKeyDelta(event) {
    const step = event.shiftKey ? 10 : 1;
    if (event.key === "ArrowLeft") return { x: -step, y: 0, scale: 0 };
    if (event.key === "ArrowRight") return { x: step, y: 0, scale: 0 };
    if (event.key === "ArrowUp") return { x: 0, y: -step, scale: 0 };
    if (event.key === "ArrowDown") return { x: 0, y: step, scale: 0 };
    if (event.key.toLowerCase() === "w") return { x: 0, y: 0, scale: step };
    if (event.key.toLowerCase() === "s") return { x: 0, y: 0, scale: -step };
    return void 0;
  }
  syncDraftAdjustmentUi({
    draft,
    pin,
    selectionHighlight
  }) {
    const environment = this.config.getEnvironment();
    if (!environment) return;
    const hostPoint = toHostPoint(
      this.getAdjustedDraftPoint(draft.marker.viewport, draft),
      environment
    );
    pin.style.left = `${hostPoint.x}px`;
    pin.style.top = `${hostPoint.y}px`;
    if (draft.selection && selectionHighlight) {
      const rect = toHostSelection(
        this.getAdjustedDraftSelection(
          toViewportSelection(draft.selection.viewport),
          draft
        ),
        environment
      );
      selectionHighlight.style.left = `${rect.left}px`;
      selectionHighlight.style.top = `${rect.top}px`;
      selectionHighlight.style.width = `${rect.width}px`;
      selectionHighlight.style.height = `${rect.height}px`;
    }
    this.syncDraftPreview(draft);
  }
  createAreaForm() {
    const form = document.createElement("form");
    form.className = "dfwr-form";
    const areaDraft = this.state.areaDraft;
    if (!areaDraft) {
      const empty = document.createElement("p");
      empty.className = "dfwr-empty";
      empty.textContent = "Drag on the page to select an area.";
      form.append(empty);
      return form;
    }
    form.append(this.createAreaMetricsPanel(areaDraft));
    const titleInput = this.isTitleFieldEnabled() ? this.createDraftTitleInput(areaDraft.title, (title) => {
      const draft = this.state.areaDraft;
      if (!draft) return;
      this.config.actions.setAreaDraft({
        ...draft,
        title
      });
    }) : void 0;
    const textarea = document.createElement("textarea");
    textarea.className = "dfwr-textarea";
    textarea.placeholder = "Area comment";
    textarea.rows = 4;
    textarea.value = areaDraft.comment ?? "";
    textarea.addEventListener("input", () => {
      const draft = this.state.areaDraft;
      if (!draft) return;
      this.config.actions.setAreaDraft({
        ...draft,
        comment: textarea.value
      });
    });
    const assigneeSelect = this.createDraftAssigneeSelect(
      areaDraft.assigneeId,
      areaDraft.assigneeName,
      (assigneeId, assigneeName) => {
        const draft = this.state.areaDraft;
        if (!draft) return;
        this.config.actions.setAreaDraft({
          ...draft,
          assigneeId,
          assigneeName
        });
      }
    );
    const actions = this.createFormActions("Save area", () => {
      const draft = this.state.areaDraft;
      const fields = this.getDraftFields(titleInput, textarea, assigneeSelect);
      const comment = fields.comment;
      if (!comment || !draft) return;
      void this.config.actions.createItem({
        kind: "area",
        title: fields.title,
        comment,
        assigneeId: fields.assigneeId,
        assigneeName: fields.assigneeName,
        viewport: draft.viewport,
        anchor: draft.anchor,
        marker: draft.marker,
        selection: draft.selection
      });
    });
    const error = this.createDraftError();
    form.append(
      ...titleInput ? [titleInput] : [],
      textarea,
      ...assigneeSelect ? [assigneeSelect] : [],
      ...error ? [error] : [],
      actions
    );
    return form;
  }
  createAreaMetricsPanel(draft) {
    const panel = document.createElement("div");
    panel.className = "dfwr-adjust-panel is-area-metrics-panel";
    const help = document.createElement("div");
    help.className = "dfwr-adjust-help";
    const [labelLine, xyLine, sizeLine] = this.getSelectionMetricLines(
      this.getAreaDraftMetricSelection(draft),
      draft.viewport
    );
    help.textContent = labelLine;
    const xyStatus = document.createElement("div");
    xyStatus.className = "dfwr-adjust-status";
    xyStatus.textContent = xyLine;
    const sizeStatus = document.createElement("div");
    sizeStatus.className = "dfwr-adjust-status";
    sizeStatus.textContent = sizeLine;
    panel.append(help, xyStatus, sizeStatus);
    return panel;
  }
  createAreaDraftOverlay(draft) {
    const layer = document.createElement("div");
    layer.className = "dfwr-area-preview-layer";
    const environment = this.config.getEnvironment();
    if (!environment || !draft.selection) return layer;
    const selection = toViewportSelection(draft.selection.viewport);
    layer.append(this.createSelectionHighlight(selection, environment, true));
    if (draft.marker) {
      const hostPoint = toHostPoint(draft.marker.viewport, environment);
      layer.append(
        this.createMarkerElement(
          void 0,
          hostPoint,
          "\u2022",
          getReviewViewportScope(
            draft.viewport,
            this.config.options.viewports?.presets
          ),
          true,
          true
        )
      );
    }
    return layer;
  }
  createAreaDraftPopover(draft, options = {}) {
    const environment = this.config.getEnvironment();
    const popover = document.createElement("div");
    popover.className = [
      "dfwr-area-draft",
      "is-composer",
      options.dockComposer ? "is-docked-composer" : ""
    ].filter(Boolean).join(" ");
    if (options.dockComposer) {
      popover.style.width = "100%";
    } else if (environment && draft.selection) {
      const selection = toHostSelection(
        toViewportSelection(draft.selection.viewport),
        environment
      );
      const composer = this.getDraftComposerPosition({
        selection,
        environment,
        composerPosition: draft.composerPosition,
        estimatedHeight: 220
      });
      popover.style.left = `${composer.left}px`;
      popover.style.top = `${composer.top}px`;
      popover.style.width = `${composer.width}px`;
      popover.style.right = "auto";
    }
    const dragHandle = options.dockComposer ? void 0 : this.createDraftDragHandle("Move area composer");
    popover.append(
      ...dragHandle ? [dragHandle] : [],
      this.createAreaForm()
    );
    if (dragHandle) {
      this.attachDraftComposerDrag(popover, dragHandle, (composerPosition) => {
        const areaDraft = this.state.areaDraft ?? draft;
        this.config.actions.setAreaDraft({
          ...areaDraft,
          composerPosition
        });
      });
    }
    return popover;
  }
  createFormActions(saveLabel, onSave, options) {
    const actions = document.createElement("div");
    actions.className = ["dfwr-actions", options?.className].filter(Boolean).join(" ");
    const isSaving = this.state.isCreatingItem;
    const save = document.createElement("button");
    save.className = "dfwr-button is-primary";
    save.type = "button";
    save.disabled = isSaving;
    save.setAttribute("aria-busy", isSaving ? "true" : "false");
    if (isSaving) {
      save.append(this.createSpinner("dfwr-spinner"), "Saving...");
    } else {
      save.textContent = saveLabel;
    }
    save.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (this.state.isCreatingItem) return;
      onSave();
    });
    const cancel = document.createElement("button");
    cancel.className = "dfwr-button";
    cancel.type = "button";
    cancel.disabled = isSaving;
    cancel.textContent = "Cancel";
    cancel.addEventListener("click", (event) => {
      this.cancelDraft(event);
    });
    if (options?.leading?.length) {
      actions.classList.add("has-leading");
      const leading = document.createElement("div");
      leading.className = "dfwr-actions-leading";
      leading.append(...options.leading);
      const primary = document.createElement("div");
      primary.className = "dfwr-actions-primary";
      primary.append(save, cancel);
      actions.append(leading, primary);
      return actions;
    }
    if (options?.beforeSave?.length || options?.className) {
      actions.append(cancel, ...options.beforeSave ?? [], save);
      return actions;
    }
    actions.append(save, cancel);
    return actions;
  }
  createSpinner(className) {
    const spinner = document.createElement("span");
    spinner.className = className;
    spinner.setAttribute("aria-hidden", "true");
    return spinner;
  }
  createDraftError() {
    if (!this.state.draftError) return void 0;
    const error = document.createElement("p");
    error.className = "dfwr-form-error";
    error.setAttribute("role", "alert");
    error.textContent = this.state.draftError;
    return error;
  }
  createList() {
    const section = document.createElement("div");
    section.className = "dfwr-list";
    const state = this.state;
    const heading = document.createElement("div");
    heading.className = "dfwr-list-heading";
    heading.textContent = `Review items (${state.items.length})`;
    section.append(heading);
    if (state.items.length === 0) {
      const empty = document.createElement("p");
      empty.className = "dfwr-empty";
      empty.textContent = "No review items on this page.";
      section.append(empty);
      return section;
    }
    for (const numberedItem of getNumberedReviewItems(
      state.items,
      this.config.options.viewports?.presets
    )) {
      section.append(this.createListItem(numberedItem));
    }
    return section;
  }
  createListItem(numberedItem) {
    const { item } = numberedItem;
    const row = document.createElement("article");
    row.className = "dfwr-item";
    row.tabIndex = 0;
    row.setAttribute("role", "button");
    row.setAttribute(
      "aria-label",
      `Restore review item: ${item.title ?? item.comment}`
    );
    row.addEventListener("click", () => {
      void this.config.actions.restoreItem(item);
    });
    row.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      void this.config.actions.restoreItem(item);
    });
    const body = document.createElement("div");
    body.className = "dfwr-item-body";
    const badges = document.createElement("div");
    badges.className = "dfwr-item-badges";
    const scope = document.createElement("div");
    scope.className = `dfwr-item-scope is-scope-${numberedItem.scope}`;
    scope.textContent = numberedItem.displayLabel;
    const kind = document.createElement("div");
    kind.className = "dfwr-item-kind";
    kind.textContent = item.kind;
    badges.append(scope, kind);
    const title = this.isTitleFieldEnabled() ? item.title?.trim() : "";
    const titleElement = title ? document.createElement("strong") : void 0;
    if (title && titleElement) {
      titleElement.className = "dfwr-item-title";
      titleElement.textContent = title;
    }
    const comment = document.createElement("p");
    comment.className = `dfwr-item-comment${title ? "" : " is-primary"}`;
    comment.textContent = item.comment;
    const date = document.createElement("time");
    date.className = "dfwr-item-date";
    date.dateTime = item.createdAt;
    date.textContent = formatItemMeta(item);
    body.append(badges, ...titleElement ? [titleElement] : [], comment, date);
    const actions = document.createElement("div");
    actions.className = "dfwr-item-actions";
    actions.addEventListener("click", (event) => event.stopPropagation());
    actions.addEventListener("keydown", (event) => event.stopPropagation());
    const remove = document.createElement("button");
    remove.className = "dfwr-icon-button";
    remove.type = "button";
    remove.textContent = "x";
    remove.setAttribute("aria-label", "Delete");
    remove.addEventListener("click", (event) => {
      event.stopPropagation();
      void this.config.actions.removeItem(item.id).then(() => this.config.actions.reload());
    });
    actions.append(remove);
    row.append(body, actions);
    return row;
  }
  createMarkerLayer() {
    const layer = document.createElement("div");
    layer.className = "dfwr-marker-layer";
    const environment = this.config.getEnvironment();
    if (!environment) return layer;
    const currentScope = getReviewViewportScope(
      getViewportSize(environment),
      this.config.options.viewports?.presets
    );
    getNumberedReviewItems(
      this.state.items,
      this.config.options.viewports?.presets
    ).forEach((numberedItem) => {
      const { item, scope, displayLabel } = numberedItem;
      if (!shouldShowMarkerForScope(scope, currentScope)) {
        return;
      }
      const isHighlighted = item.id === this.state.highlightedItemId;
      const highlightMode = getReviewItemHighlightMode(item);
      if (highlightMode !== "note" && (!this.state.highlightedItemId || isHighlighted)) {
        const selection = getItemHighlightSelection(item, environment);
        if (selection) {
          layer.append(
            ...this.createItemHighlightElements(
              selection.viewport,
              environment,
              item,
              displayLabel,
              selection.isBound,
              isHighlighted
            )
          );
          return;
        }
      }
      const point = getBoundMarkerPoint(item, environment);
      if (!point || !isPointInViewport(point.viewport, environment)) {
        return;
      }
      const hostPoint = toHostPoint(point.viewport, environment);
      const marker = this.createMarkerElement(
        item.id,
        hostPoint,
        displayLabel,
        scope,
        point.isBound,
        isHighlighted,
        highlightMode === "note" ? "note" : "default"
      );
      marker.title = `${displayLabel} / ${item.comment}
${formatItemMeta(item)}`;
      layer.append(marker);
    });
    return layer;
  }
  createItemHighlightElements(selection, environment, item, label, isBound, isHighlighted) {
    const rect = toHostSelection(selection, environment);
    const mode = getReviewItemHighlightMode(item);
    const highlight = document.createElement("div");
    highlight.className = [
      "dfwr-item-target-highlight",
      `is-mode-${mode}`,
      isBound ? "is-bound" : "is-fallback",
      isHighlighted ? "is-highlighted" : ""
    ].filter(Boolean).join(" ");
    highlight.style.left = `${rect.left}px`;
    highlight.style.top = `${rect.top}px`;
    highlight.style.width = `${rect.width}px`;
    highlight.style.height = `${rect.height}px`;
    highlight.dataset.reviewItemId = item.id;
    const labelElement = document.createElement("div");
    labelElement.className = [
      "dfwr-item-target-label",
      `is-mode-${mode}`,
      isHighlighted ? "is-highlighted" : ""
    ].filter(Boolean).join(" ");
    labelElement.textContent = label;
    labelElement.style.left = `${Math.max(4, rect.left)}px`;
    labelElement.style.top = `${Math.max(4, rect.top - 24)}px`;
    labelElement.dataset.reviewItemId = item.id;
    return [highlight, labelElement];
  }
  createSelectionHighlight(selection, environment, isDraft) {
    const rect = toHostSelection(selection, environment);
    const highlight = document.createElement("div");
    highlight.className = `dfwr-selection-highlight${isDraft ? " is-draft" : ""}`;
    highlight.style.left = `${rect.left}px`;
    highlight.style.top = `${rect.top}px`;
    highlight.style.width = `${rect.width}px`;
    highlight.style.height = `${rect.height}px`;
    return highlight;
  }
  createMarkerElement(itemId, hostPoint, label, scope, isBound, isHighlighted, variant = "default") {
    const isNoteCallout = variant === "note";
    const marker = document.createElement("div");
    marker.className = [
      "dfwr-bound-marker",
      isNoteCallout ? "is-note-callout" : "",
      `is-scope-${scope}`,
      isBound ? "is-bound" : "is-fallback",
      isHighlighted ? "is-highlighted" : ""
    ].filter(Boolean).join(" ");
    marker.style.left = `${hostPoint.x}px`;
    marker.style.top = `${hostPoint.y}px`;
    marker.dataset.scope = scope;
    if (itemId) {
      marker.dataset.reviewItemId = itemId;
    }
    const iconElement = document.createElement("span");
    iconElement.className = "dfwr-bound-marker-icon";
    iconElement.setAttribute("aria-hidden", "true");
    const labelElement = document.createElement("span");
    labelElement.className = "dfwr-bound-marker-number";
    labelElement.textContent = label;
    marker.append(iconElement, labelElement);
    return marker;
  }
  attachDraftPinDrag(pin, popover, meta, textarea) {
    let isDragging = false;
    const moveDraftUi = (hostPoint) => {
      const environment = this.config.getEnvironment();
      if (!environment) return;
      const nextPoint = clampPoint(toTargetPoint(hostPoint, environment), environment);
      const nextHostPoint = toHostPoint(nextPoint, environment);
      pin.style.left = `${nextHostPoint.x}px`;
      pin.style.top = `${nextHostPoint.y}px`;
      if (popover) {
        const position = getPopoverPosition(nextHostPoint, environment);
        popover.style.left = `${position.left}px`;
        popover.style.top = `${position.top}px`;
      }
      const noteDraft = this.state.noteDraft;
      if (!noteDraft) return;
      const nextDraft = {
        ...noteDraft,
        marker: {
          ...noteDraft.marker,
          viewport: roundPoint(nextPoint)
        },
        comment: textarea.value
      };
      this.config.actions.setNoteDraft(nextDraft);
      if (meta) {
        meta.textContent = formatNoteDraftMeta(nextDraft);
      }
    };
    pin.addEventListener("pointerdown", (event) => {
      if (event.button !== 0) return;
      event.preventDefault();
      event.stopPropagation();
      isDragging = true;
      pin.setPointerCapture(event.pointerId);
    });
    pin.addEventListener("pointermove", (event) => {
      if (!isDragging || !pin.hasPointerCapture(event.pointerId)) return;
      event.preventDefault();
      moveDraftUi({
        x: event.clientX,
        y: event.clientY
      });
    });
    pin.addEventListener("pointerup", (event) => {
      if (!isDragging || !pin.hasPointerCapture(event.pointerId)) return;
      event.preventDefault();
      event.stopPropagation();
      isDragging = false;
      pin.releasePointerCapture(event.pointerId);
      const nextPoint = toTargetPointFromHostEvent(
        event,
        this.config.getEnvironment()
      );
      const currentDraft = this.state.noteDraft;
      const fields = {
        title: currentDraft?.title,
        comment: textarea.value,
        assigneeId: currentDraft?.assigneeId,
        assigneeName: currentDraft?.assigneeName
      };
      void (this.state.mode === "element" ? this.config.actions.bindElementDraftToPoint(nextPoint, fields) : this.config.actions.bindNoteDraftToPoint(nextPoint, fields));
    });
  }
  createNoteLayer() {
    const layer = document.createElement("div");
    layer.className = "dfwr-text-layer";
    const environment = this.config.getEnvironment();
    if (environment) {
      placeLayerOverTarget(layer, environment);
    }
    layer.addEventListener("pointerdown", (event) => {
      if (event.button !== 0) return;
      event.preventDefault();
      void this.config.actions.bindNoteDraftToPoint(
        toTargetPointFromHostEvent(event, this.config.getEnvironment())
      );
    });
    return layer;
  }
  createElementLayer() {
    const layer = document.createElement("div");
    layer.className = "dfwr-element-layer";
    const environment = this.config.getEnvironment();
    const hover = document.createElement("div");
    hover.className = "dfwr-dom-hover";
    hover.hidden = true;
    layer.append(hover);
    if (environment) {
      placeLayerOverTarget(layer, environment);
    }
    const updateHover = (point) => {
      const nextEnvironment = this.config.getEnvironment();
      if (!nextEnvironment) return;
      const anchor = getDomAnchorFromPoint(
        clampPoint(point, nextEnvironment),
        this.config.options.anchors?.attribute,
        nextEnvironment
      );
      const selection = anchor ? getElementViewportSelection(anchor, nextEnvironment) : void 0;
      if (!selection) {
        hover.hidden = true;
        return;
      }
      const rect = toHostSelection(selection, nextEnvironment);
      hover.hidden = false;
      hover.style.left = `${rect.left}px`;
      hover.style.top = `${rect.top}px`;
      hover.style.width = `${rect.width}px`;
      hover.style.height = `${rect.height}px`;
    };
    layer.addEventListener("pointermove", (event) => {
      updateHover(toTargetPointFromHostEvent(event, this.config.getEnvironment()));
    });
    layer.addEventListener("pointerleave", () => {
      hover.hidden = true;
    });
    layer.addEventListener("pointerdown", (event) => {
      if (event.button !== 0) return;
      event.preventDefault();
      void this.config.actions.bindElementDraftToPoint(
        toTargetPointFromHostEvent(event, this.config.getEnvironment())
      );
    });
    return layer;
  }
  createAreaLayer() {
    const layer = document.createElement("div");
    layer.className = "dfwr-area-layer";
    const environment = this.config.getEnvironment();
    if (environment) {
      placeLayerOverTarget(layer, environment);
    }
    const box = document.createElement("div");
    box.className = "dfwr-area-box";
    layer.append(box);
    let startX = 0;
    let startY = 0;
    let selection;
    let activePointerId;
    let isDragging = false;
    const ownerWindow = layer.ownerDocument.defaultView ?? window;
    const updateBox = (event) => {
      const nextEnvironment = this.config.getEnvironment();
      const nextPoint = toTargetPointFromHostEvent(
        event,
        nextEnvironment
      );
      const left = Math.min(startX, nextPoint.x);
      const top = Math.min(startY, nextPoint.y);
      const width = Math.abs(nextPoint.x - startX);
      const height = Math.abs(nextPoint.y - startY);
      const hostPoint = toHostPoint(
        { x: left, y: top },
        nextEnvironment
      );
      selection = { left, top, width, height };
      box.style.left = `${hostPoint.x}px`;
      box.style.top = `${hostPoint.y}px`;
      box.style.width = `${width}px`;
      box.style.height = `${height}px`;
    };
    const addDragListeners = () => {
      ownerWindow.addEventListener("pointermove", handlePointerMove, true);
      ownerWindow.addEventListener("pointerup", handlePointerUp, true);
      ownerWindow.addEventListener("pointercancel", handlePointerCancel, true);
    };
    const removeDragListeners = () => {
      ownerWindow.removeEventListener("pointermove", handlePointerMove, true);
      ownerWindow.removeEventListener("pointerup", handlePointerUp, true);
      ownerWindow.removeEventListener(
        "pointercancel",
        handlePointerCancel,
        true
      );
    };
    const releasePointerCapture = (event) => {
      try {
        if (layer.hasPointerCapture(event.pointerId)) {
          layer.releasePointerCapture(event.pointerId);
        }
      } catch {
      }
    };
    function isActivePointer(event) {
      return isDragging && event.pointerId === activePointerId;
    }
    const finishAreaSelection = (event) => {
      if (!isActivePointer(event)) return;
      event.preventDefault();
      updateBox(event);
      releasePointerCapture(event);
      removeDragListeners();
      isDragging = false;
      activePointerId = void 0;
      if (!selection || selection.width < 8 || selection.height < 8) return;
      this.config.actions.setSelectingArea(true);
      this.config.actions.render();
      void this.config.actions.createAreaDraft(selection);
    };
    function handlePointerMove(event) {
      if (!isActivePointer(event)) return;
      event.preventDefault();
      updateBox(event);
    }
    const handlePointerUp = (event) => {
      finishAreaSelection(event);
    };
    const handlePointerCancel = (event) => {
      if (!isActivePointer(event)) return;
      releasePointerCapture(event);
      removeDragListeners();
      isDragging = false;
      activePointerId = void 0;
    };
    layer.addEventListener("pointerdown", (event) => {
      if (event.button !== 0) return;
      event.preventDefault();
      activePointerId = event.pointerId;
      isDragging = true;
      try {
        layer.setPointerCapture(event.pointerId);
      } catch {
      }
      const startPoint = toTargetPointFromHostEvent(
        event,
        this.config.getEnvironment()
      );
      startX = startPoint.x;
      startY = startPoint.y;
      updateBox(event);
      addDragListeners();
    });
    layer.addEventListener("pointermove", handlePointerMove);
    layer.addEventListener("pointerup", handlePointerUp);
    layer.addEventListener("pointercancel", handlePointerCancel);
    return layer;
  }
};

// src/core/web.review.kit.app.ts
var ROOT_ID = "df-web-review-kit-root";
function isEditableEventTarget2(event) {
  const path = event.composedPath?.() ?? [];
  const element = path[0] ?? event.target;
  if (!element || typeof element.tagName !== "string") return false;
  const tag = element.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || element.isContentEditable === true;
}
function createWebReviewKit(options) {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return createNoopController();
  }
  const app = new WebReviewKitApp(options);
  app.mount();
  return {
    open: () => app.open(),
    close: () => app.close(),
    toggle: () => app.toggle(),
    setMode: (mode) => app.setMode(mode),
    startElementReview: (element, comment) => app.startElementReview(element, comment),
    getMode: () => app.getMode(),
    highlightItem: (itemId) => app.highlightItem(itemId),
    setHiddenItemIds: (itemIds) => app.setHiddenItemIds(itemIds),
    reload: () => app.reload(),
    getItems: () => app.getItems(),
    destroy: () => app.destroy()
  };
}
var WebReviewKitApp = class {
  constructor(options) {
    this.options = options;
    this.isOpen = false;
    this.mode = "idle";
    this.items = [];
    this.draftError = "";
    this.isCreatingItem = false;
    this.isSelectingArea = false;
    this.handleKeyDown = (event) => {
      if (event.key === "Escape" && this.cancelMode()) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      if (isEditableEventTarget2(event) || !isHotkey(event, this.hotkey)) return;
      event.preventDefault();
      event.stopPropagation();
      this.toggle();
    };
    this.handleViewportChange = () => {
      if (!this.isOpen || this.renderFrame || this.isDraftComposerFocused()) return;
      this.renderFrame = window.requestAnimationFrame(() => {
        this.renderFrame = void 0;
        if (this.isDraftComposerFocused()) return;
        this.render();
      });
    };
    this.adapter = options.adapter ?? localAdapter();
    this.hotkey = options.hotkeys?.qa ?? "Shift+Q";
    this.view = new WebReviewKitView({
      options,
      getState: () => ({
        isOpen: this.isOpen,
        mode: this.mode,
        items: this.items,
        noteDraft: this.noteDraft,
        areaDraft: this.areaDraft,
        draftError: this.draftError,
        isCreatingItem: this.isCreatingItem,
        isSelectingArea: this.isSelectingArea,
        highlightedItemId: this.highlightedItemId
      }),
      getEnvironment: () => this.getEnvironment(),
      actions: {
        close: () => this.close(),
        render: () => this.render(),
        reload: () => this.reload(),
        restoreItem: (item) => this.restoreItem(item),
        removeItem: (itemId) => this.adapter.remove(itemId),
        setModeState: (mode) => this.setModeState(mode),
        clearDrafts: () => {
          this.noteDraft = void 0;
          this.areaDraft = void 0;
          this.draftError = "";
        },
        setNoteDraft: (draft) => {
          this.noteDraft = draft;
          this.draftError = "";
        },
        setAreaDraft: (draft) => {
          this.areaDraft = draft;
          this.draftError = "";
        },
        setSelectingArea: (isSelectingArea) => {
          this.isSelectingArea = isSelectingArea;
        },
        createItem: (input) => this.createItem(input),
        bindNoteDraftToPoint: (point, fields) => this.bindNoteDraftToPoint(point, fields),
        bindElementDraftToPoint: (point, fields) => this.bindElementDraftToPoint(point, fields),
        createAreaDraft: (selection) => this.createAreaDraft(selection)
      }
    });
  }
  mount() {
    if (this.root) return;
    const existing = document.getElementById(ROOT_ID);
    if (existing) existing.remove();
    this.root = document.createElement("div");
    this.root.id = ROOT_ID;
    this.root.style.display = "contents";
    this.shadow = this.root.attachShadow({ mode: "open" });
    document.body.appendChild(this.root);
    document.addEventListener("keydown", this.handleKeyDown, true);
    window.addEventListener("scroll", this.handleViewportChange, true);
    window.addEventListener("resize", this.handleViewportChange);
    this.render();
  }
  destroy() {
    this.view.clearDraftPreview();
    document.removeEventListener("keydown", this.handleKeyDown, true);
    window.removeEventListener("scroll", this.handleViewportChange, true);
    window.removeEventListener("resize", this.handleViewportChange);
    if (this.renderFrame) {
      window.cancelAnimationFrame(this.renderFrame);
      this.renderFrame = void 0;
    }
    this.root?.remove();
    this.root = void 0;
    this.shadow = void 0;
  }
  open() {
    if (this.isOpen) return;
    this.isOpen = true;
    void this.reload();
  }
  close() {
    this.isOpen = false;
    this.setModeState("idle");
    this.noteDraft = void 0;
    this.areaDraft = void 0;
    this.isSelectingArea = false;
    this.render();
  }
  toggle() {
    if (this.isOpen) {
      this.close();
      return;
    }
    this.open();
  }
  setMode(mode) {
    if (!this.isOpen) {
      this.isOpen = true;
    }
    this.setModeState(this.mode === mode ? "idle" : mode);
    this.noteDraft = void 0;
    this.areaDraft = void 0;
    this.render();
  }
  async startElementReview(element, comment) {
    if (!this.isOpen) {
      this.isOpen = true;
    }
    this.setModeState("element");
    this.noteDraft = void 0;
    this.areaDraft = void 0;
    this.isSelectingArea = false;
    await this.bindElementDraftToElement(element, { comment });
  }
  getMode() {
    return this.mode;
  }
  getItems() {
    return this.items;
  }
  highlightItem(itemId) {
    if (!itemId) {
      this.clearHighlightedItem();
      return;
    }
    if (!this.isOpen) {
      this.isOpen = true;
    }
    this.highlightedItemId = itemId;
    this.render();
  }
  setHiddenItemIds(itemIds) {
    this.hiddenItemIds = itemIds ? new Set(itemIds) : void 0;
    this.updateHiddenItemsStyle();
  }
  clearHighlightedItem() {
    if (!this.highlightedItemId) return;
    this.highlightedItemId = void 0;
    this.render();
  }
  createHiddenItemsStyleElement() {
    const style = document.createElement("style");
    style.dataset.dfwrHiddenItems = "true";
    style.textContent = this.getHiddenItemsCss();
    return style;
  }
  updateHiddenItemsStyle() {
    if (!this.shadow) return;
    let style = this.shadow.querySelector(
      'style[data-dfwr-hidden-items="true"]'
    );
    if (!style) {
      style = this.createHiddenItemsStyleElement();
      this.shadow.prepend(style);
      return;
    }
    style.textContent = this.getHiddenItemsCss();
  }
  getHiddenItemsCss() {
    if (!this.hiddenItemIds?.size) return "";
    return Array.from(this.hiddenItemIds).map(
      (itemId) => `[data-review-item-id="${cssEscape(itemId)}"] { display: none !important; }`
    ).join("\n");
  }
  setModeState(mode) {
    if (this.mode === mode) return;
    this.mode = mode;
    this.options.onModeChange?.(mode);
  }
  cancelMode() {
    if (this.mode === "idle" && !this.noteDraft && !this.areaDraft && !this.isSelectingArea) {
      return false;
    }
    this.setModeState("idle");
    this.noteDraft = void 0;
    this.areaDraft = void 0;
    this.isSelectingArea = false;
    this.render();
    return true;
  }
  isDraftComposerFocused() {
    if (!this.noteDraft && !this.areaDraft) return false;
    const composerHost = this.getEnvironment()?.composerHost;
    const activeElement = composerHost?.ownerDocument.activeElement;
    return Boolean(
      composerHost && activeElement && composerHost.contains(activeElement)
    );
  }
  getEnvironment() {
    const target = typeof this.options.target === "function" ? this.options.target() : this.options.target;
    if (!target) {
      return {
        window,
        document,
        viewportRect: {
          left: 0,
          top: 0,
          width: window.innerWidth,
          height: window.innerHeight
        },
        overlayRect: {
          left: 0,
          top: 0,
          width: window.innerWidth,
          height: window.innerHeight
        }
      };
    }
    try {
      const rect = target.getViewportRect?.() ?? {
        left: 0,
        top: 0,
        width: target.window.innerWidth,
        height: target.window.innerHeight
      };
      const overlayRect = target.getOverlayRect?.() ?? rect;
      const composerHost = target.getComposerHost?.();
      return {
        window: target.window,
        document: target.document,
        viewportRect: {
          left: rect.left,
          top: rect.top,
          width: rect.width,
          height: rect.height
        },
        overlayRect: {
          left: overlayRect.left,
          top: overlayRect.top,
          width: overlayRect.width,
          height: overlayRect.height
        },
        composerHost
      };
    } catch {
      return void 0;
    }
  }
  async reload() {
    const environment = this.getEnvironment();
    if (!environment) return this.items;
    this.items = await this.adapter.list({
      projectId: this.options.projectId,
      routeKey: getRouteKey(environment)
    });
    this.options.onItemsChange?.(this.items);
    if (this.isOpen) {
      this.render();
    }
    return this.items;
  }
  render() {
    if (!this.shadow) return;
    this.view.render(this.shadow, this.createHiddenItemsStyleElement());
  }
  async bindNoteDraftToPoint(point, fields = {}) {
    const environment = this.getEnvironment();
    if (!environment) return;
    const viewport = getViewportSize(environment);
    const nextPoint = clampPoint(point, environment);
    const draft = await this.withOverlayHidden(() => {
      const selection = getPointSelection(nextPoint);
      const anchor = getDomAnchor(
        selection,
        this.options.anchors?.attribute,
        environment
      );
      const marker = {
        viewport: roundPoint(nextPoint),
        relative: anchor ? getRelativePoint(nextPoint, anchor, environment) : void 0
      };
      return {
        viewport,
        anchor,
        marker,
        ...fields
      };
    });
    this.noteDraft = draft;
    this.render();
  }
  async bindElementDraftToPoint(point, fields = {}) {
    const environment = this.getEnvironment();
    if (!environment) return;
    const viewport = getViewportSize(environment);
    const nextPoint = clampPoint(point, environment);
    const draft = await this.withOverlayHidden(() => {
      const pointSelection = getPointSelection(nextPoint);
      const targetElement = environment.document.elementFromPoint(
        nextPoint.x,
        nextPoint.y
      );
      const previewElement = targetElement && "style" in targetElement ? targetElement : void 0;
      const targetRect = targetElement?.getBoundingClientRect();
      const clickedSelection = targetRect && targetRect.width > 0 && targetRect.height > 0 ? {
        left: targetRect.left,
        top: targetRect.top,
        width: targetRect.width,
        height: targetRect.height
      } : void 0;
      const anchor = getDomAnchorFromPoint(
        nextPoint,
        this.options.anchors?.attribute,
        environment
      );
      const elementSelection = anchor ? clickedSelection ?? getElementViewportSelection(anchor, environment, pointSelection) : void 0;
      const selection = elementSelection ?? pointSelection;
      const markerPoint = elementSelection ? { x: selection.left, y: selection.top } : getSelectionCenter(selection);
      const reviewSelection = elementSelection ? {
        viewport: toPublicSelection(elementSelection),
        relative: getRelativeSelection(
          elementSelection,
          anchor,
          environment
        )
      } : void 0;
      const marker = {
        viewport: roundPoint(markerPoint),
        relative: anchor ? getRelativePoint(markerPoint, anchor, environment) : void 0
      };
      return {
        viewport,
        anchor,
        marker,
        selection: reviewSelection,
        ...fields,
        previewElement
      };
    });
    this.noteDraft = draft;
    this.render();
  }
  async bindElementDraftToElement(element, fields = {}) {
    const environment = this.getEnvironment();
    if (!environment || element.ownerDocument !== environment.document) return;
    const viewport = getViewportSize(environment);
    const draft = await this.withOverlayHidden(() => {
      const rect = element.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return void 0;
      const selection = {
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height
      };
      const anchor = getDomAnchorFromElement(
        element,
        this.options.anchors?.attribute,
        environment
      );
      const markerPoint = { x: selection.left, y: selection.top };
      const marker = {
        viewport: roundPoint(markerPoint),
        relative: anchor ? getRelativePoint(markerPoint, anchor, environment) : void 0
      };
      const reviewSelection = {
        viewport: toPublicSelection(selection),
        relative: anchor ? getRelativeSelection(selection, anchor, environment) : void 0
      };
      const previewElement = "style" in element ? element : void 0;
      return {
        viewport,
        anchor,
        marker,
        selection: reviewSelection,
        ...fields,
        previewElement
      };
    });
    if (!draft) return;
    this.noteDraft = draft;
    this.render();
  }
  async createAreaDraft(selection) {
    const environment = this.getEnvironment();
    if (!environment) {
      this.isSelectingArea = false;
      this.render();
      return;
    }
    try {
      const viewport = getViewportSize(environment);
      this.areaDraft = await this.withOverlayHidden(() => {
        const marker = createSelectionCenterMarker(
          selection,
          void 0,
          environment
        );
        const reviewSelection = {
          viewport: toPublicSelection(selection)
        };
        return {
          viewport,
          marker,
          selection: reviewSelection
        };
      });
      this.setModeState("area");
    } finally {
      this.isSelectingArea = false;
      this.render();
    }
  }
  async withOverlayHidden(callback) {
    if (!this.root) return callback();
    const previousDisplay = this.root.style.display;
    this.root.style.display = "none";
    try {
      return await callback();
    } finally {
      this.root.style.display = previousDisplay;
    }
  }
  async createItem(input) {
    const environment = this.getEnvironment();
    if (!environment || this.isCreatingItem) return;
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const routeKey = getRouteKey(environment);
    const viewport = input.viewport ?? getViewportSize(environment);
    const createdBy = this.options.userId?.trim();
    const title = input.title?.trim();
    const assigneeId = input.assigneeId?.trim() || void 0;
    const assigneeOption = this.options.assigneeOptions?.find(
      (option) => option.value === assigneeId
    );
    const item = {
      id: createId(),
      projectId: this.options.projectId,
      routeKey,
      pageUrl: getPageUrl(environment),
      originalUrl: getOriginalUrl(environment),
      normalizedPath: routeKey,
      scope: input.scope ?? getReviewViewportScope(viewport, this.options.viewports?.presets),
      kind: input.kind,
      title: title || void 0,
      comment: input.comment,
      assigneeId,
      assigneeName: input.assigneeName ?? assigneeOption?.label,
      createdBy: createdBy || void 0,
      status: "todo",
      viewport,
      devicePixelRatio: environment.window.devicePixelRatio || 1,
      scroll: {
        x: environment.window.scrollX,
        y: environment.window.scrollY
      },
      anchor: input.anchor,
      marker: input.marker,
      selection: input.selection,
      createdAt: now,
      updatedAt: now
    };
    this.draftError = "";
    this.isCreatingItem = true;
    this.render();
    try {
      const createdItem = await this.adapter.create(item);
      this.setModeState("idle");
      this.noteDraft = void 0;
      this.areaDraft = void 0;
      this.highlightItem(createdItem.id);
      await this.reload();
      await this.options.onCreateItem?.(createdItem);
    } catch (error) {
      this.draftError = error instanceof Error ? error.message : "Failed to save QA.";
    } finally {
      this.isCreatingItem = false;
      this.render();
    }
  }
  async restoreItem(item) {
    this.setModeState("idle");
    this.noteDraft = void 0;
    this.areaDraft = void 0;
    if (this.options.onRestoreItem) {
      await this.options.onRestoreItem(item);
      return;
    }
    const environment = this.getEnvironment();
    if (!environment) return;
    const scroll = item.scroll;
    if (scroll) {
      runWithAutoScrollBehavior(environment.document, () => {
        setDocumentScrollInstantly2(environment, scroll);
      });
      await waitForNextFrame(environment);
    }
    this.highlightItem(item.id);
    this.render();
  }
};
function createNoopController() {
  return {
    open() {
    },
    close() {
    },
    toggle() {
    },
    setMode() {
    },
    async startElementReview() {
    },
    getMode() {
      return "idle";
    },
    highlightItem() {
    },
    setHiddenItemIds() {
    },
    async reload() {
      return [];
    },
    getItems() {
      return [];
    },
    destroy() {
    }
  };
}

// src/react-shell/hooks/review.frame.navigation.ts
var bindReviewFrameNavigation = ({
  pageTargets,
  reviewPathPrefix,
  targetDocument,
  targetRef,
  targetWindow,
  onCancelReviewMode,
  onCloseRuler,
  onSyncShellTarget,
  onSyncTargetViewport
}) => {
  const syncRouteFromFrame = () => {
    const nextTarget = getFrameRouteTarget(targetWindow, reviewPathPrefix);
    const nextRouteKey = getTargetRouteKey(nextTarget, reviewPathPrefix);
    const currentRouteKey = getTargetRouteKey(
      targetRef.current,
      reviewPathPrefix
    );
    if (nextRouteKey === currentRouteKey) return;
    if (!pageTargets.has(nextRouteKey)) {
      return;
    }
    onSyncShellTarget(nextTarget);
  };
  const handleClick = (event) => {
    if (event.defaultPrevented || event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }
    const targetElement = event.target;
    if (!targetElement || !("closest" in targetElement)) return;
    const link = targetElement.closest("a[href]");
    const href = link?.getAttribute("href");
    const linkTarget = link?.getAttribute("target");
    if (!href || linkTarget && linkTarget !== "_self") return;
    const url = new URL(href, targetWindow.location.href);
    if (url.origin !== targetWindow.location.origin) return;
    const nextTarget = normalizeTarget(
      `${url.pathname}${url.search}${url.hash}`,
      reviewPathPrefix
    );
    const nextRouteKey = getTargetRouteKey(nextTarget, reviewPathPrefix);
    const currentRouteKey = getTargetRouteKey(
      targetRef.current,
      reviewPathPrefix
    );
    if (nextRouteKey === currentRouteKey) return;
    if (!pageTargets.has(nextRouteKey)) return;
    event.preventDefault();
    onSyncShellTarget(nextTarget);
  };
  const handleFrameKeyDown = (event) => {
    if (event.key !== "Escape") return;
    if (!onCancelReviewMode() && !onCloseRuler()) return;
    event.preventDefault();
    event.stopPropagation();
  };
  const history = targetWindow.history;
  const originalPushState = history.pushState.bind(history);
  const originalReplaceState = history.replaceState.bind(history);
  history.pushState = (...args) => {
    originalPushState(...args);
    syncRouteFromFrame();
  };
  history.replaceState = (...args) => {
    originalReplaceState(...args);
    syncRouteFromFrame();
  };
  syncRouteFromFrame();
  targetWindow.addEventListener("popstate", syncRouteFromFrame);
  targetWindow.addEventListener("hashchange", syncRouteFromFrame);
  targetWindow.addEventListener("keydown", handleFrameKeyDown, true);
  targetDocument.addEventListener("click", handleClick, true);
  targetWindow.addEventListener("scroll", onSyncTargetViewport, true);
  targetWindow.addEventListener("resize", onSyncTargetViewport);
  return () => {
    history.pushState = originalPushState;
    history.replaceState = originalReplaceState;
    targetWindow.removeEventListener("popstate", syncRouteFromFrame);
    targetWindow.removeEventListener("hashchange", syncRouteFromFrame);
    targetWindow.removeEventListener("keydown", handleFrameKeyDown, true);
    targetDocument.removeEventListener("click", handleClick, true);
    targetWindow.removeEventListener("scroll", onSyncTargetViewport, true);
    targetWindow.removeEventListener("resize", onSyncTargetViewport);
  };
};

// src/react-shell/hooks/review.kit.target.ts
var getReviewKitTarget = ({
  frameScrollRef,
  iframeRef
}) => {
  const frame = iframeRef.current;
  const frameWindow = frame?.contentWindow;
  const frameDocument = frame?.contentDocument;
  if (!frame || !frameWindow || !frameDocument) return void 0;
  return {
    window: frameWindow,
    document: frameDocument,
    getViewportRect: () => frame.getBoundingClientRect(),
    getOverlayRect: () => {
      const frameRect = frame.getBoundingClientRect();
      const scrollRect = frameScrollRef.current?.getBoundingClientRect();
      if (!scrollRect) return frameRect;
      const left = Math.max(frameRect.left, scrollRect.left);
      const top = Math.max(frameRect.top, scrollRect.top);
      const right = Math.min(
        frameRect.left + frameRect.width,
        scrollRect.left + scrollRect.width
      );
      const bottom = Math.min(
        frameRect.top + frameRect.height,
        scrollRect.top + scrollRect.height
      );
      return {
        left,
        top,
        width: Math.max(0, right - left),
        height: Math.max(0, bottom - top)
      };
    },
    getComposerHost: () => document.querySelector(".df-review-qa-draft-host")
  };
};

// src/react-shell/hooks/use.review.kit.lifecycle.ts
var useReviewKitLifecycle = ({
  adapter,
  fields,
  assigneeTitle,
  assigneeOptions,
  cleanupTargetRef,
  controllerRef,
  frameScrollRef,
  hiddenOverlayItemIdList,
  hiddenOverlayItemIdListRef,
  iframeRef,
  pageTargets,
  projectId,
  reviewPathPrefix,
  reviewUserId,
  reviewViewportPresets,
  ruler,
  adjustmentLabel,
  sizeRef,
  targetRef,
  onApplyPendingRestore,
  onCancelReviewMode,
  onCloseRuler,
  onItemsRefresh,
  onModeChange,
  onCreateItem,
  onRefreshTargetOverlayState,
  onRestoreInitialItem,
  onRestoreReviewItem,
  onSyncShellTarget,
  onSyncTargetViewport
}) => {
  const destroyReviewKit = (0, import_react12.useCallback)(() => {
    cleanupTargetRef.current?.();
    cleanupTargetRef.current = null;
    controllerRef.current?.destroy();
    controllerRef.current = null;
  }, [cleanupTargetRef, controllerRef]);
  const initReviewKit = (0, import_react12.useCallback)(() => {
    destroyReviewKit();
    const iframe = iframeRef.current;
    const targetWindow = iframe?.contentWindow;
    const targetDocument = iframe?.contentDocument;
    if (!iframe || !targetWindow || !targetDocument) return;
    cleanupTargetRef.current = bindReviewFrameNavigation({
      pageTargets,
      reviewPathPrefix,
      targetDocument,
      targetRef,
      targetWindow,
      onCancelReviewMode,
      onCloseRuler,
      onSyncShellTarget,
      onSyncTargetViewport
    });
    controllerRef.current = createWebReviewKit({
      projectId,
      userId: reviewUserId.trim() || void 0,
      adapter,
      fields,
      assigneeTitle,
      assigneeOptions,
      target: () => getReviewKitTarget({ frameScrollRef, iframeRef }),
      hotkeys: {
        qa: "Shift+Q"
      },
      anchors: {
        attribute: "data-qa-id"
      },
      viewports: {
        presets: reviewViewportPresets
      },
      ruler,
      adjustmentLabel,
      onCreateItem,
      onRestoreItem: onRestoreReviewItem,
      onItemsChange: () => {
        void onItemsRefresh();
      },
      onModeChange,
      ui: {
        panel: false
      },
      modules: {
        qa: true,
        grid: false,
        figma: false
      }
    });
    controllerRef.current.open();
    controllerRef.current.setHiddenItemIds(hiddenOverlayItemIdListRef.current);
    onModeChange(controllerRef.current.getMode());
    void onItemsRefresh();
    void onRestoreInitialItem().then(onApplyPendingRestore);
    onRefreshTargetOverlayState();
    setTargetScrollbarHidden(
      targetDocument,
      getViewportPresetKind(sizeRef.current) === "mobile"
    );
  }, [
    adapter,
    fields,
    assigneeTitle,
    assigneeOptions,
    cleanupTargetRef,
    controllerRef,
    destroyReviewKit,
    frameScrollRef,
    hiddenOverlayItemIdListRef,
    iframeRef,
    onApplyPendingRestore,
    onCancelReviewMode,
    onCloseRuler,
    onCreateItem,
    onItemsRefresh,
    onModeChange,
    onRefreshTargetOverlayState,
    onRestoreInitialItem,
    onRestoreReviewItem,
    onSyncShellTarget,
    onSyncTargetViewport,
    pageTargets,
    projectId,
    reviewPathPrefix,
    reviewUserId,
    reviewViewportPresets,
    ruler,
    adjustmentLabel,
    sizeRef,
    targetRef
  ]);
  const reloadReviewKit = (0, import_react12.useCallback)(async () => {
    await controllerRef.current?.reload();
  }, [controllerRef]);
  const setControllerReviewMode = (0, import_react12.useCallback)(
    (nextMode) => {
      controllerRef.current?.setMode(nextMode);
      onModeChange(controllerRef.current?.getMode() ?? "idle");
    },
    [controllerRef, onModeChange]
  );
  (0, import_react12.useEffect)(() => destroyReviewKit, [destroyReviewKit]);
  (0, import_react12.useEffect)(() => {
    const frameDocument = iframeRef.current?.contentDocument;
    if (!frameDocument || frameDocument.readyState !== "complete") return;
    initReviewKit();
  }, [iframeRef, initReviewKit]);
  (0, import_react12.useEffect)(() => {
    hiddenOverlayItemIdListRef.current = hiddenOverlayItemIdList;
    controllerRef.current?.setHiddenItemIds(hiddenOverlayItemIdList);
  }, [controllerRef, hiddenOverlayItemIdList, hiddenOverlayItemIdListRef]);
  return {
    destroyReviewKit,
    initReviewKit,
    reloadReviewKit,
    setControllerReviewMode
  };
};

// src/react-shell/hooks/use.review.target.overlay.ts
var import_react13 = require("react");
var TARGET_OVERLAY_REFRESH_DELAYS = [80, 240, 600];
var useReviewTargetOverlay = ({
  iframeRef,
  isFigmaOverlayAvailable,
  targetOverlayState,
  onTargetOverlayStateChange
}) => {
  const refreshTimersRef = (0, import_react13.useRef)([]);
  const clearRefreshTimers = (0, import_react13.useCallback)(() => {
    refreshTimersRef.current.forEach((timer) => window.clearTimeout(timer));
    refreshTimersRef.current = [];
  }, []);
  const updateTargetOverlayState = (0, import_react13.useCallback)(() => {
    const state = getTargetOverlayState(
      iframeRef.current?.contentDocument ?? void 0
    );
    onTargetOverlayStateChange(state);
    return state;
  }, [iframeRef, onTargetOverlayStateChange]);
  const refreshTargetOverlayState = (0, import_react13.useCallback)(() => {
    clearRefreshTimers();
    updateTargetOverlayState();
    refreshTimersRef.current = TARGET_OVERLAY_REFRESH_DELAYS.map(
      (delay) => window.setTimeout(updateTargetOverlayState, delay)
    );
  }, [clearRefreshTimers, updateTargetOverlayState]);
  const dispatchTargetOverlayHotkey = (0, import_react13.useCallback)(
    (overlay) => {
      const targetWindow = iframeRef.current?.contentWindow;
      if (!targetWindow) return false;
      const code = overlay === "grid" ? "KeyG" : "KeyF";
      targetWindow.dispatchEvent(
        new KeyboardEvent("keydown", {
          bubbles: true,
          cancelable: true,
          code,
          key: code.replace("Key", "").toLowerCase(),
          shiftKey: true
        })
      );
      window.setTimeout(refreshTargetOverlayState, 80);
      return true;
    },
    [iframeRef, refreshTargetOverlayState]
  );
  const toggleTargetOverlay = (0, import_react13.useCallback)(
    (overlay) => {
      if (overlay === "figma" && !isFigmaOverlayAvailable) {
        refreshTargetOverlayState();
        return;
      }
      dispatchTargetOverlayHotkey(overlay);
    },
    [
      dispatchTargetOverlayHotkey,
      isFigmaOverlayAvailable,
      refreshTargetOverlayState
    ]
  );
  const closeTargetOverlay = (0, import_react13.useCallback)(
    (overlay) => {
      const currentState = updateTargetOverlayState();
      if (!currentState[overlay]) return false;
      return dispatchTargetOverlayHotkey(overlay);
    },
    [dispatchTargetOverlayHotkey, updateTargetOverlayState]
  );
  (0, import_react13.useEffect)(() => {
    if (isFigmaOverlayAvailable || !targetOverlayState.figma) return;
    closeTargetOverlay("figma");
  }, [closeTargetOverlay, isFigmaOverlayAvailable, targetOverlayState.figma]);
  (0, import_react13.useEffect)(() => clearRefreshTimers, [clearRefreshTimers]);
  return {
    closeTargetOverlay,
    refreshTargetOverlayState,
    toggleTargetOverlay
  };
};

// src/react-shell/hooks/use.review.target.sync.ts
var import_react14 = require("react");
var useReviewTargetSync = ({
  iframeRef,
  reviewPathPrefix,
  selectedItemIdRef,
  size,
  sizeRef,
  source,
  target,
  targetRef,
  onActiveRouteChange,
  onClearSelectedItem,
  onDraftTargetChange,
  onSyncTargetViewport,
  onTargetChange
}) => {
  const syncShellTarget = (0, import_react14.useCallback)(
    (nextTarget) => {
      const normalizedTarget = normalizeTarget(nextTarget, reviewPathPrefix);
      const nextRouteKey = getTargetRouteKey(
        normalizedTarget,
        reviewPathPrefix
      );
      if (normalizedTarget !== targetRef.current) {
        onClearSelectedItem();
        targetRef.current = normalizedTarget;
        onTargetChange(normalizedTarget);
        onDraftTargetChange(normalizedTarget);
        onActiveRouteChange(nextRouteKey);
      }
      if (selectedItemIdRef.current) {
        updateShellUrlForItem(
          normalizedTarget,
          sizeRef.current,
          selectedItemIdRef.current,
          source
        );
      } else {
        updateShellUrl(normalizedTarget, sizeRef.current, source);
      }
    },
    [
      onActiveRouteChange,
      onClearSelectedItem,
      onDraftTargetChange,
      onTargetChange,
      reviewPathPrefix,
      selectedItemIdRef,
      sizeRef,
      source,
      targetRef
    ]
  );
  (0, import_react14.useEffect)(() => {
    targetRef.current = target;
    onActiveRouteChange(getTargetRouteKey(target, reviewPathPrefix));
  }, [onActiveRouteChange, reviewPathPrefix, target, targetRef]);
  (0, import_react14.useEffect)(() => {
    sizeRef.current = size;
    if (selectedItemIdRef.current) {
      updateShellUrlForItem(
        targetRef.current,
        size,
        selectedItemIdRef.current,
        source
      );
    } else {
      updateShellUrl(targetRef.current, size, source);
    }
    onSyncTargetViewport();
    setTargetScrollbarHidden(
      iframeRef.current?.contentDocument,
      getViewportPresetKind(size) === "mobile"
    );
  }, [
    iframeRef,
    onSyncTargetViewport,
    selectedItemIdRef,
    size,
    sizeRef,
    source,
    targetRef
  ]);
  return {
    syncShellTarget
  };
};

// src/react-shell/hooks/use.review.controller.ts
var useReviewController = ({
  adapter,
  fields,
  assigneeTitle,
  assigneeOptions,
  cleanupTargetRef,
  controllerRef,
  frameScrollRef,
  hiddenOverlayItemIdList,
  hiddenOverlayItemIdListRef,
  iframeRef,
  isFigmaOverlayAvailable,
  pageTargets,
  pendingInitialItemIdRef,
  pendingRestoreRef,
  projectId,
  reviewPathPrefix,
  reviewUserId,
  reviewViewportPresets,
  ruler,
  adjustmentLabel,
  selectedItemIdRef,
  size,
  sizeRef,
  source,
  target,
  targetOverlayState,
  targetRef,
  viewportPresets,
  onActiveRouteChange,
  onCancelReviewMode,
  onDraftTargetChange,
  onItemsRefresh,
  onModeChange,
  onSelectedItemIdChange,
  onSizeChange,
  onTargetChange,
  onTargetOverlayStateChange,
  onCloseRuler
}) => {
  const syncTargetViewport = (0, import_react15.useCallback)(() => {
    window.dispatchEvent(new Event("resize"));
  }, []);
  const {
    closeTargetOverlay,
    refreshTargetOverlayState,
    toggleTargetOverlay
  } = useReviewTargetOverlay({
    iframeRef,
    isFigmaOverlayAvailable,
    targetOverlayState,
    onTargetOverlayStateChange
  });
  const {
    applyPendingRestore,
    clearSelectedItem,
    restoreInitialItem,
    restoreReviewItem
  } = useReviewItemRestore({
    adapter,
    controllerRef,
    iframeRef,
    pendingInitialItemIdRef,
    pendingRestoreRef,
    reviewPathPrefix,
    selectedItemIdRef,
    source,
    targetRef,
    viewportPresets,
    onActiveRouteChange,
    onDraftTargetChange,
    onSelectedItemIdChange,
    onSizeChange,
    onSyncTargetViewport: syncTargetViewport,
    onTargetChange
  });
  const { syncShellTarget } = useReviewTargetSync({
    iframeRef,
    reviewPathPrefix,
    selectedItemIdRef,
    size,
    sizeRef,
    source,
    target,
    targetRef,
    onActiveRouteChange,
    onClearSelectedItem: clearSelectedItem,
    onDraftTargetChange,
    onSyncTargetViewport: syncTargetViewport,
    onTargetChange
  });
  const {
    initReviewKit,
    reloadReviewKit,
    setControllerReviewMode
  } = useReviewKitLifecycle({
    adapter,
    fields,
    assigneeTitle,
    assigneeOptions,
    cleanupTargetRef,
    controllerRef,
    frameScrollRef,
    hiddenOverlayItemIdList,
    hiddenOverlayItemIdListRef,
    iframeRef,
    pageTargets,
    projectId,
    reviewPathPrefix,
    reviewUserId,
    reviewViewportPresets,
    ruler,
    adjustmentLabel,
    sizeRef,
    targetRef,
    onApplyPendingRestore: applyPendingRestore,
    onCancelReviewMode,
    onCloseRuler,
    onCreateItem: restoreReviewItem,
    onItemsRefresh,
    onModeChange,
    onRefreshTargetOverlayState: refreshTargetOverlayState,
    onRestoreInitialItem: restoreInitialItem,
    onRestoreReviewItem: restoreReviewItem,
    onSyncShellTarget: syncShellTarget,
    onSyncTargetViewport: syncTargetViewport
  });
  return {
    clearSelectedItem,
    closeTargetOverlay,
    initReviewKit,
    reloadReviewKit,
    restoreReviewItem,
    setControllerReviewMode,
    syncTargetViewport,
    toggleTargetOverlay
  };
};

// src/react-shell/hooks/use.review.presence.ts
var import_react16 = require("react");

// src/react-shell/presence/presence.ts
var REVIEW_PRESENCE_SESSION_KEY = "df-review-presence-session-id";
var DEFAULT_LOCAL_PRESENCE_CHANNEL = "df-review-kit:presence";
var DEFAULT_LOCAL_PRESENCE_HEARTBEAT_MS = 5e3;
var DEFAULT_LOCAL_PRESENCE_STALE_MS = 16e3;
var PRESENCE_COLORS = [
  "#7cc7ff",
  "#63d7c7",
  "#f3b75f",
  "#c99cff",
  "#ff8f61",
  "#9cc76b",
  "#f278a6",
  "#79a7ff"
];
var createId2 = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
};
var hashString = (value) => {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }
  return Math.abs(hash);
};
var getReviewPresenceColor = (value) => PRESENCE_COLORS[hashString(value || "anonymous") % PRESENCE_COLORS.length];
var getReviewPresenceDisplayName = (userId) => userId.trim() || "anonymous";
var getReviewPresenceSessionId = () => {
  if (typeof window === "undefined") return createId2();
  try {
    const stored = window.sessionStorage.getItem(REVIEW_PRESENCE_SESSION_KEY);
    if (stored) return stored;
    const nextId = createId2();
    window.sessionStorage.setItem(REVIEW_PRESENCE_SESSION_KEY, nextId);
    return nextId;
  } catch {
    return createId2();
  }
};
var getTimestamp = () => (/* @__PURE__ */ new Date()).toISOString();
var normalizePresenceUser = (state) => ({
  ...state,
  displayName: getReviewPresenceDisplayName(state.displayName || state.userId),
  updatedAt: state.updatedAt || getTimestamp()
});
var createLocalPresenceAdapter = (options = {}) => ({
  label: "local-presence",
  connect: (context) => {
    const heartbeatMs = options.heartbeatMs ?? DEFAULT_LOCAL_PRESENCE_HEARTBEAT_MS;
    const staleMs = options.staleMs ?? DEFAULT_LOCAL_PRESENCE_STALE_MS;
    const users = /* @__PURE__ */ new Map();
    const listeners = /* @__PURE__ */ new Set();
    let currentUser = normalizePresenceUser({
      ...context.initialState,
      sessionId: context.sessionId,
      userId: context.userId,
      displayName: context.displayName,
      color: context.color,
      updatedAt: getTimestamp()
    });
    users.set(context.sessionId, currentUser);
    const Channel = typeof BroadcastChannel === "undefined" ? void 0 : BroadcastChannel;
    const channel = Channel ? new Channel(options.channelName ?? DEFAULT_LOCAL_PRESENCE_CHANNEL) : null;
    const getUsers = () => {
      const now = Date.now();
      users.forEach((user, sessionId) => {
        if (now - Date.parse(user.updatedAt) > staleMs) {
          users.delete(sessionId);
        }
      });
      return Array.from(users.values()).sort((a, b) => {
        if (a.sessionId === context.sessionId) return -1;
        if (b.sessionId === context.sessionId) return 1;
        return a.displayName.localeCompare(b.displayName);
      });
    };
    const emit = () => {
      const nextUsers = getUsers();
      listeners.forEach((listener) => listener(nextUsers));
    };
    const post = (message) => {
      try {
        channel?.postMessage(message);
      } catch {
        return;
      }
    };
    const publish = () => {
      post({
        type: "update",
        sessionId: context.sessionId,
        user: currentUser
      });
    };
    if (channel) {
      channel.onmessage = (event) => {
        const message = event.data;
        if (!message || message.sessionId === context.sessionId) return;
        if (message.type === "request") {
          publish();
          return;
        }
        if (message.type === "leave") {
          users.delete(message.sessionId);
          emit();
          return;
        }
        if (message.type === "update" && message.user) {
          users.set(message.sessionId, normalizePresenceUser(message.user));
          emit();
        }
      };
    }
    const intervalId = typeof window === "undefined" ? void 0 : window.setInterval(() => {
      currentUser = {
        ...currentUser,
        updatedAt: getTimestamp()
      };
      users.set(context.sessionId, currentUser);
      emit();
      publish();
    }, heartbeatMs);
    emit();
    publish();
    post({
      type: "request",
      sessionId: context.sessionId
    });
    return {
      update: (state) => {
        currentUser = normalizePresenceUser({
          ...currentUser,
          ...state,
          sessionId: context.sessionId,
          userId: context.userId,
          displayName: context.displayName,
          color: context.color,
          updatedAt: getTimestamp()
        });
        users.set(context.sessionId, currentUser);
        emit();
        publish();
      },
      subscribe: (callback) => {
        listeners.add(callback);
        callback(getUsers());
        return () => {
          listeners.delete(callback);
        };
      },
      disconnect: () => {
        if (intervalId) {
          window.clearInterval(intervalId);
        }
        post({
          type: "leave",
          sessionId: context.sessionId
        });
        channel?.close();
        listeners.clear();
        users.clear();
      }
    };
  }
});
var createFallbackPresenceAdapter = (primaryAdapter, fallbackAdapter) => ({
  label: `${primaryAdapter.label}-with-${fallbackAdapter.label}-fallback`,
  connect: async (context) => {
    try {
      return await primaryAdapter.connect(context);
    } catch (error) {
      if (typeof console !== "undefined") {
        console.warn(
          `[df-review-kit] ${primaryAdapter.label} failed. Falling back to ${fallbackAdapter.label}.`,
          error
        );
      }
      return fallbackAdapter.connect(context);
    }
  }
});

// src/react-shell/hooks/use.review.presence.ts
var getPresenceUserTarget = (user, reviewPathPrefix) => getTargetRouteKey(user.target || user.routeKey, reviewPathPrefix);
var dedupePresenceUsersByPageAndId = (users, reviewPathPrefix) => {
  const userByPageAndId = /* @__PURE__ */ new Map();
  users.forEach((user) => {
    const userId = user.userId.trim();
    if (!userId) return;
    const userTarget = getPresenceUserTarget(user, reviewPathPrefix);
    const key = `${userTarget}::${userId}`;
    const currentUser = userByPageAndId.get(key);
    if (!currentUser || Date.parse(user.updatedAt) >= Date.parse(currentUser.updatedAt)) {
      userByPageAndId.set(key, user);
    }
  });
  return Array.from(userByPageAndId.values());
};
var useReviewPresence = ({
  activeRoute,
  mode,
  presence,
  projectId,
  reviewPathPrefix,
  reviewUserId,
  selectedNumberedItem,
  size,
  source
}) => {
  const presenceSessionRef = (0, import_react16.useRef)(null);
  const [presenceUsers, setPresenceUsers] = (0, import_react16.useState)([]);
  const [presenceSessionVersion, setPresenceSessionVersion] = (0, import_react16.useState)(0);
  const presenceSessionId = (0, import_react16.useMemo)(getReviewPresenceSessionId, []);
  const normalizedReviewUserId = reviewUserId.trim();
  const presenceDisplayName = getReviewPresenceDisplayName(
    normalizedReviewUserId
  );
  const presenceColor = getReviewPresenceColor(
    normalizedReviewUserId || presenceSessionId
  );
  const presenceViewport = (0, import_react16.useMemo)(
    () => ({
      label: size.label,
      width: size.width,
      height: size.height,
      kind: getViewportPresetKind(size)
    }),
    [size]
  );
  const presenceStatus = mode === "idle" ? "reviewing" : "editing";
  const visiblePresenceUsers = (0, import_react16.useMemo)(
    () => {
      const projectPresenceUsers = presenceUsers.filter(
        (user) => user.projectId === projectId && user.userId.trim()
      );
      return dedupePresenceUsersByPageAndId(
        projectPresenceUsers,
        reviewPathPrefix
      );
    },
    [presenceUsers, projectId, reviewPathPrefix]
  );
  const currentPagePresenceUsers = (0, import_react16.useMemo)(
    () => visiblePresenceUsers.filter((user) => {
      const userTarget = getPresenceUserTarget(user, reviewPathPrefix);
      return userTarget === activeRoute;
    }),
    [activeRoute, reviewPathPrefix, visiblePresenceUsers]
  );
  const pagePresenceUsers = (0, import_react16.useMemo)(() => {
    const usersByTarget = /* @__PURE__ */ new Map();
    visiblePresenceUsers.forEach((user) => {
      const userTarget = getPresenceUserTarget(user, reviewPathPrefix);
      const pageUsers = usersByTarget.get(userTarget) ?? [];
      pageUsers.push(user);
      usersByTarget.set(userTarget, pageUsers);
    });
    return usersByTarget;
  }, [reviewPathPrefix, visiblePresenceUsers]);
  const getCurrentPresenceState = (0, import_react16.useCallback)(
    () => ({
      projectId,
      sessionId: presenceSessionId,
      userId: normalizedReviewUserId,
      displayName: presenceDisplayName,
      color: presenceColor,
      routeKey: activeRoute,
      target: activeRoute,
      source,
      viewport: presenceViewport,
      mode,
      selectedItemId: selectedNumberedItem?.item.id ?? null,
      selectedReviewNumber: selectedNumberedItem?.number ?? null,
      status: presenceStatus,
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    }),
    [
      activeRoute,
      mode,
      normalizedReviewUserId,
      presenceColor,
      presenceDisplayName,
      presenceSessionId,
      presenceStatus,
      presenceViewport,
      projectId,
      selectedNumberedItem,
      source
    ]
  );
  const getCurrentPresenceStateRef = (0, import_react16.useRef)(getCurrentPresenceState);
  getCurrentPresenceStateRef.current = getCurrentPresenceState;
  (0, import_react16.useEffect)(() => {
    if (!presence || !normalizedReviewUserId) {
      const session = presenceSessionRef.current;
      presenceSessionRef.current = null;
      setPresenceUsers([]);
      void session?.disconnect();
      return void 0;
    }
    let isActive = true;
    let unsubscribe;
    const initialState = getCurrentPresenceStateRef.current();
    void Promise.resolve(
      presence.connect({
        projectId,
        sessionId: presenceSessionId,
        userId: normalizedReviewUserId,
        displayName: presenceDisplayName,
        color: presenceColor,
        initialState
      })
    ).then((session) => {
      if (!isActive) {
        void session.disconnect();
        return;
      }
      presenceSessionRef.current = session;
      unsubscribe = session.subscribe(setPresenceUsers);
      setPresenceSessionVersion((current) => current + 1);
      void session.update(initialState);
    }).catch(() => {
      if (!isActive) return;
      presenceSessionRef.current = null;
      setPresenceUsers([]);
    });
    return () => {
      isActive = false;
      unsubscribe?.();
      const session = presenceSessionRef.current;
      presenceSessionRef.current = null;
      setPresenceUsers([]);
      void session?.disconnect();
    };
  }, [
    normalizedReviewUserId,
    presence,
    presenceColor,
    presenceDisplayName,
    presenceSessionId,
    projectId
  ]);
  (0, import_react16.useEffect)(() => {
    const session = presenceSessionRef.current;
    if (!session || !normalizedReviewUserId) return;
    void session.update(getCurrentPresenceState());
  }, [
    getCurrentPresenceState,
    normalizedReviewUserId,
    presenceSessionVersion
  ]);
  return {
    currentPagePresenceUsers,
    pagePresenceUsers,
    presenceSessionId
  };
};

// src/react-shell/hooks/use.review.ruler.ts
var import_react18 = require("react");

// src/react-shell/hooks/use.review.ruler.drag.ts
var import_react17 = require("react");

// src/react-shell/ruler/ruler.ts
var getRulerPointFromRect = (clientX, clientY, rect) => {
  const x = Math.min(Math.max(clientX - rect.left, 0), rect.width);
  const y = Math.min(Math.max(clientY - rect.top, 0), rect.height);
  return {
    x: Math.round(x),
    y: Math.round(y)
  };
};
var getRulerMeasure = (start, end) => {
  if (!start || !end) return void 0;
  return {
    left: Math.min(start.x, end.x),
    top: Math.min(start.y, end.y),
    width: Math.abs(end.x - start.x),
    height: Math.abs(end.y - start.y)
  };
};

// src/react-shell/hooks/use.review.ruler.drag.ts
var useReviewRulerDrag = ({
  iframeRef,
  isRulerAvailable,
  isRulerVisible,
  size,
  targetSrc
}) => {
  const rulerOverlayRef = (0, import_react17.useRef)(null);
  const rulerDragRectRef = (0, import_react17.useRef)(null);
  const isRulerDraggingRef = (0, import_react17.useRef)(false);
  const sizeRef = (0, import_react17.useRef)(size);
  const [rulerStart, setRulerStart] = (0, import_react17.useState)(null);
  const [rulerPoint, setRulerPoint] = (0, import_react17.useState)(null);
  const [rulerHover, setRulerHover] = (0, import_react17.useState)(null);
  const [isRulerDragging, setIsRulerDragging] = (0, import_react17.useState)(false);
  const rulerMeasure = (0, import_react17.useMemo)(
    () => getRulerMeasure(rulerStart, rulerPoint),
    [rulerPoint, rulerStart]
  );
  const clearRulerMeasure = (0, import_react17.useCallback)(() => {
    rulerDragRectRef.current = null;
    isRulerDraggingRef.current = false;
    setRulerStart(null);
    setRulerPoint(null);
    setRulerHover(null);
    setIsRulerDragging(false);
  }, []);
  const finishRulerDrag = (0, import_react17.useCallback)((point) => {
    if (point) {
      setRulerPoint(point);
    }
    rulerDragRectRef.current = null;
    isRulerDraggingRef.current = false;
    setIsRulerDragging(false);
  }, []);
  const startRulerDrag = (0, import_react17.useCallback)(
    (clientX, clientY, rect) => {
      const point = getRulerPointFromRect(clientX, clientY, rect);
      rulerDragRectRef.current = rect;
      isRulerDraggingRef.current = true;
      setRulerStart(point);
      setRulerPoint(point);
      setIsRulerDragging(true);
    },
    []
  );
  (0, import_react17.useEffect)(() => {
    sizeRef.current = size;
  }, [size]);
  (0, import_react17.useEffect)(() => {
    if (!isRulerVisible || !isRulerAvailable) return void 0;
    const getRulerEventClientPoint = (event) => {
      const frame2 = iframeRef.current;
      let isFrameEvent = false;
      try {
        isFrameEvent = Boolean(frame2?.contentWindow) && event.view === frame2?.contentWindow;
        if (!isFrameEvent && frame2?.contentDocument) {
          const targetDocument = event.target?.ownerDocument;
          isFrameEvent = targetDocument === frame2.contentDocument;
        }
      } catch {
        isFrameEvent = false;
      }
      if (isFrameEvent && frame2) {
        const frameRect = frame2.getBoundingClientRect();
        return {
          clientX: event.clientX + frameRect.left,
          clientY: event.clientY + frameRect.top
        };
      }
      return {
        clientX: event.clientX,
        clientY: event.clientY
      };
    };
    const snapDesign = (screen, axis) => {
      const current = sizeRef.current;
      const scaleX = current.designWidth ? current.width / current.designWidth : 1;
      const scale = axis === "y" ? current.designHeight ? current.height / current.designHeight : scaleX : scaleX;
      return Math.round(Math.round(screen / scale) * scale);
    };
    const getActiveRulerPoint = (event) => {
      const rect = rulerDragRectRef.current ?? rulerOverlayRef.current?.getBoundingClientRect();
      if (!rect) return void 0;
      const point = getRulerEventClientPoint(event);
      const snapped = getRulerPointFromRect(point.clientX, point.clientY, rect);
      return { x: snapDesign(snapped.x, "x"), y: snapDesign(snapped.y, "y") };
    };
    const getHoverRulerPoint = (event) => {
      const rect = rulerOverlayRef.current?.getBoundingClientRect();
      if (!rect) return null;
      const { clientX, clientY } = getRulerEventClientPoint(event);
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      if (x < 0 || y < 0 || x > rect.width || y > rect.height) return null;
      return { x: snapDesign(x, "x"), y: snapDesign(y, "y") };
    };
    const handleDragStart = (event) => {
      if (isRulerDraggingRef.current) return;
      const mouseEvent = event;
      if (mouseEvent.button !== 0) return;
      const overlay = rulerOverlayRef.current;
      const target = mouseEvent.target;
      if (!overlay || !(target instanceof Node) || !overlay.contains(target)) {
        return;
      }
      event.preventDefault();
      startRulerDrag(
        mouseEvent.clientX,
        mouseEvent.clientY,
        overlay.getBoundingClientRect()
      );
    };
    const handlePointerMove = (event) => {
      const mouseEvent = event;
      if (isRulerDraggingRef.current) {
        const point = getActiveRulerPoint(mouseEvent);
        if (!point) return;
        mouseEvent.preventDefault();
        setRulerPoint(point);
        setRulerHover(point);
        return;
      }
      setRulerHover(getHoverRulerPoint(mouseEvent));
    };
    const handleDragEnd = (event) => {
      if (!isRulerDraggingRef.current) return;
      const point = getActiveRulerPoint(event);
      event.preventDefault();
      finishRulerDrag(point);
    };
    const handleWindowBlur = () => {
      if (!isRulerDraggingRef.current) return;
      finishRulerDrag();
    };
    const dragTargets = /* @__PURE__ */ new Set([window]);
    const frame = iframeRef.current;
    try {
      if (frame?.contentWindow) dragTargets.add(frame.contentWindow);
      if (frame?.contentDocument) dragTargets.add(frame.contentDocument);
    } catch {
    }
    dragTargets.forEach((target) => {
      target.addEventListener("mousedown", handleDragStart, true);
      target.addEventListener("mousemove", handlePointerMove, true);
      target.addEventListener("mouseup", handleDragEnd, true);
    });
    window.addEventListener("blur", handleWindowBlur);
    return () => {
      dragTargets.forEach((target) => {
        target.removeEventListener("mousedown", handleDragStart, true);
        target.removeEventListener("mousemove", handlePointerMove, true);
        target.removeEventListener("mouseup", handleDragEnd, true);
      });
      window.removeEventListener("blur", handleWindowBlur);
    };
  }, [
    finishRulerDrag,
    iframeRef,
    isRulerAvailable,
    isRulerVisible,
    startRulerDrag
  ]);
  (0, import_react17.useEffect)(() => {
    clearRulerMeasure();
  }, [clearRulerMeasure, size.height, size.width, targetSrc]);
  return {
    clearRulerMeasure,
    isRulerDragging,
    rulerHover,
    rulerMeasure,
    rulerOverlayRef
  };
};

// src/react-shell/hooks/use.review.ruler.ts
var useReviewRuler = ({
  iframeRef,
  ruler,
  size,
  targetSrc,
  onCancelReviewMode,
  onCloseTransientPanels
}) => {
  const [isRulerVisible, setIsRulerVisible] = (0, import_react18.useState)(false);
  const isRulerAvailable = ruler?.enabled !== false && typeof size.designWidth === "number" && size.designWidth > 0;
  const rulerUnit = ruler?.unit ?? "px";
  const rulerScaleX = isRulerAvailable && size.designWidth ? size.width / size.designWidth : 1;
  const rulerScaleY = size.designHeight && size.designHeight > 0 ? size.height / size.designHeight : rulerScaleX;
  const {
    clearRulerMeasure,
    isRulerDragging,
    rulerHover,
    rulerMeasure,
    rulerOverlayRef
  } = useReviewRulerDrag({
    iframeRef,
    isRulerAvailable,
    isRulerVisible,
    size,
    targetSrc
  });
  const rulerMeasureLabel = rulerMeasure ? `${Math.round(rulerMeasure.width / rulerScaleX)} \xD7 ${Math.round(
    rulerMeasure.height / rulerScaleY
  )} ${rulerUnit}` : "";
  const closeRuler = (0, import_react18.useCallback)(() => {
    if (!isRulerVisible) return false;
    setIsRulerVisible(false);
    clearRulerMeasure();
    return true;
  }, [clearRulerMeasure, isRulerVisible]);
  const toggleRuler = (0, import_react18.useCallback)(() => {
    if (!isRulerAvailable) return;
    onCancelReviewMode();
    onCloseTransientPanels();
    clearRulerMeasure();
    setIsRulerVisible((current) => !current);
  }, [
    clearRulerMeasure,
    isRulerAvailable,
    onCancelReviewMode,
    onCloseTransientPanels
  ]);
  (0, import_react18.useEffect)(() => {
    if (!isRulerVisible || isRulerAvailable) return;
    closeRuler();
  }, [closeRuler, isRulerAvailable, isRulerVisible]);
  return {
    closeRuler,
    isRulerAvailable,
    isRulerDragging,
    isRulerVisible,
    rulerHover,
    rulerMeasure,
    rulerMeasureLabel,
    rulerOverlayRef,
    rulerScaleX,
    rulerScaleY,
    rulerUnit,
    toggleRuler
  };
};

// src/react-shell/hooks/use.review.figma.images.ts
var import_react19 = require("react");
var useReviewFigmaImages = ({
  imageFormat = DEFAULT_REVIEW_FIGMA_IMAGE_FORMAT,
  pageUrl,
  projectId,
  store,
  viewport
}) => {
  const target = (0, import_react19.useMemo)(
    () => createReviewFigmaRouteTarget({
      pageUrl,
      projectId,
      viewport
    }),
    [
      pageUrl,
      projectId,
      viewport.height,
      viewport.label,
      viewport.width,
      viewport.kind
    ]
  );
  const {
    addImage: addStoreImage,
    deleteImage,
    error,
    images,
    isLoading,
    isMutating,
    moveImage,
    refreshImages,
    reorderImages,
    updateImage
  } = useReviewFigmaImageStoreController({
    imageFormat,
    store,
    target
  });
  const {
    imageOverlayStates,
    isAnyImageOverlayVisible,
    isOverlayLocked,
    isOverlayVisible,
    overlayMode,
    overlayOffsetY,
    overlayOpacity,
    resetOverlay,
    selectedImage,
    selectedImageId,
    setOverlayLocked,
    setOverlayMode,
    setOverlayOffsetY,
    setOverlayOpacity,
    setSelectedImageId,
    showImage,
    setImageOverlayOffsetY,
    setImageOverlayOpacity,
    state: overlayState,
    toggleImageOverlayLocked,
    toggleImageOverlayMode,
    toggleImageOverlayVisible,
    toggleAllImageOverlayVisible,
    toggleOverlayLocked,
    toggleOverlayMode,
    toggleOverlayVisible
  } = useReviewFigmaImageOverlayController({
    images,
    isLoading,
    target
  });
  const addImage = (0, import_react19.useCallback)(
    async (figmaUrl, label) => {
      const image = await addStoreImage(figmaUrl, label);
      if (image) showImage(image.id);
      return image;
    },
    [addStoreImage, showImage]
  );
  return {
    addImage,
    deleteImage,
    error,
    images,
    imageOverlayStates,
    isAnyImageOverlayVisible,
    isLoading,
    isMutating,
    isOverlayLocked,
    isOverlayVisible,
    moveImage,
    overlayMode,
    overlayOffsetY,
    overlayOpacity,
    overlayState,
    refreshImages,
    resetOverlay,
    reorderImages,
    selectedImage,
    selectedImageId,
    setOverlayLocked,
    setOverlayMode,
    setOverlayOffsetY,
    setOverlayOpacity,
    setSelectedImageId,
    setImageOverlayOffsetY,
    setImageOverlayOpacity,
    target,
    toggleImageOverlayLocked,
    toggleImageOverlayMode,
    toggleImageOverlayVisible,
    toggleAllImageOverlayVisible,
    toggleOverlayLocked,
    toggleOverlayMode,
    toggleOverlayVisible,
    updateImage
  };
};

// src/react-shell/hooks/use.review.settings.ts
var import_react20 = require("react");
var useReviewSettings = ({
  onCancelReviewMode,
  onCloseInitialPrompt,
  onCloseSitemap,
  onReloadTargetFrame
}) => {
  const [figmaTokenDraft, setFigmaTokenDraft] = (0, import_react20.useState)(getStoredFigmaToken);
  const [reviewUserId, setReviewUserId] = (0, import_react20.useState)(getStoredReviewUserId);
  const [reviewUserIdDraft, setReviewUserIdDraft] = (0, import_react20.useState)(
    getStoredReviewUserId
  );
  const [reviewTheme, setReviewTheme] = (0, import_react20.useState)(getStoredReviewTheme);
  const [reviewThemeDraft, setReviewThemeDraft] = (0, import_react20.useState)(getStoredReviewTheme);
  const [systemReviewTheme, setSystemReviewTheme] = (0, import_react20.useState)(getSystemReviewTheme);
  const [figmaSettingsStatus, setFigmaSettingsStatus] = (0, import_react20.useState)("");
  const [isFigmaSettingsOpen, setIsFigmaSettingsOpen] = (0, import_react20.useState)(false);
  const [isFigmaTokenVisible, setIsFigmaTokenVisible] = (0, import_react20.useState)(false);
  const [isFigmaTokenGuideOpen, setIsFigmaTokenGuideOpen] = (0, import_react20.useState)(false);
  const effectiveReviewTheme = reviewTheme === "system" ? systemReviewTheme : reviewTheme;
  const closeFigmaSettings = (0, import_react20.useCallback)(() => {
    setIsFigmaSettingsOpen(false);
    setFigmaSettingsStatus("");
    setIsFigmaTokenVisible(false);
    setIsFigmaTokenGuideOpen(false);
  }, []);
  const openFigmaSettings = (0, import_react20.useCallback)(() => {
    onCancelReviewMode();
    onCloseSitemap();
    onCloseInitialPrompt();
    setFigmaTokenDraft(getStoredFigmaToken());
    setReviewUserIdDraft(getStoredReviewUserId());
    setReviewThemeDraft(reviewTheme);
    setFigmaSettingsStatus("");
    setIsFigmaTokenVisible(false);
    setIsFigmaTokenGuideOpen(false);
    setIsFigmaSettingsOpen(true);
  }, [
    onCancelReviewMode,
    onCloseInitialPrompt,
    onCloseSitemap,
    reviewTheme
  ]);
  const saveReviewSettings = (0, import_react20.useCallback)(
    (token, userId, theme) => {
      const nextToken = token.trim();
      const nextUserId = userId.trim();
      const nextTheme = normalizeReviewTheme(theme);
      const shouldReload = nextToken !== getStoredFigmaToken();
      writeStoredFigmaToken(nextToken);
      writeStoredReviewUserId(nextUserId);
      writeStoredReviewTheme(nextTheme);
      setFigmaTokenDraft(nextToken);
      setReviewUserId(nextUserId);
      setReviewUserIdDraft(nextUserId);
      setReviewTheme(nextTheme);
      setReviewThemeDraft(nextTheme);
      setFigmaSettingsStatus(
        nextToken || nextUserId || nextTheme !== DEFAULT_REVIEW_THEME ? "Saved" : "Cleared"
      );
      if (shouldReload) {
        onReloadTargetFrame();
      }
      closeFigmaSettings();
    },
    [closeFigmaSettings, onReloadTargetFrame]
  );
  (0, import_react20.useEffect)(() => {
    if (typeof window === "undefined" || !window.matchMedia) return void 0;
    const query = window.matchMedia("(prefers-color-scheme: light)");
    const syncSystemTheme = () => {
      setSystemReviewTheme(query.matches ? "light" : "dark");
    };
    syncSystemTheme();
    if (query.addEventListener) {
      query.addEventListener("change", syncSystemTheme);
      return () => query.removeEventListener("change", syncSystemTheme);
    }
    query.addListener(syncSystemTheme);
    return () => query.removeListener(syncSystemTheme);
  }, []);
  (0, import_react20.useEffect)(() => {
    document.body.classList.toggle(
      "df-review-theme-light",
      effectiveReviewTheme === "light"
    );
    document.body.classList.toggle(
      "df-review-theme-dark",
      effectiveReviewTheme === "dark"
    );
    return () => {
      document.body.classList.remove(
        "df-review-theme-light",
        "df-review-theme-dark"
      );
    };
  }, [effectiveReviewTheme]);
  return {
    closeFigmaSettings,
    effectiveReviewTheme,
    figmaSettingsStatus,
    figmaTokenDraft,
    isFigmaSettingsOpen,
    isFigmaTokenGuideOpen,
    isFigmaTokenVisible,
    openFigmaSettings,
    reviewThemeDraft,
    reviewUserId,
    reviewUserIdDraft,
    saveReviewSettings,
    setFigmaSettingsStatus,
    setFigmaTokenDraft,
    setIsFigmaTokenGuideOpen,
    setIsFigmaTokenVisible,
    setReviewThemeDraft,
    setReviewUserIdDraft
  };
};

// src/react-shell/hooks/use.review.shell.data.ts
var import_react21 = require("react");
var SITEMAP_STATUS_DONE = "done";
var useReviewShellData = ({
  activeRoute,
  isAllQaVisible,
  isRemoteSource,
  pages,
  reviewPathPrefix,
  reviewViewportPresets,
  selectedItemId,
  size,
  target,
  viewportPresets
}) => {
  const [items, setItems] = (0, import_react21.useState)([]);
  const [hiddenOverlayItemIds, setHiddenOverlayItemIds] = (0, import_react21.useState)(
    () => /* @__PURE__ */ new Set()
  );
  const [qaFilter, setQaFilter] = (0, import_react21.useState)("all");
  const [qaStatusFilter, setQaStatusFilterState] = (0, import_react21.useState)(getStoredReviewQaStatusFilter);
  const [sitemapItems, setSitemapItems] = (0, import_react21.useState)(() => ({
    local: [],
    remote: []
  }));
  const targetSrc = (0, import_react21.useMemo)(() => buildTargetSrc(target), [target]);
  const pageTargets = (0, import_react21.useMemo)(
    () => new Set(
      pages.map((page) => normalizeTarget(page.href, reviewPathPrefix))
    ),
    [pages, reviewPathPrefix]
  );
  const sitemapSourceItems = (0, import_react21.useMemo)(
    () => isRemoteSource ? sitemapItems.remote : sitemapItems.local,
    [isRemoteSource, sitemapItems]
  );
  const activeItems = (0, import_react21.useMemo)(
    () => {
      const sourceItems = isAllQaVisible ? sitemapSourceItems : items.filter(
        (item) => getItemTarget(item, reviewPathPrefix) === activeRoute
      );
      return [...sourceItems].sort(
        (a, b) => b.createdAt.localeCompare(a.createdAt)
      );
    },
    [activeRoute, isAllQaVisible, items, reviewPathPrefix, sitemapSourceItems]
  );
  const numberedActiveItems = (0, import_react21.useMemo)(
    () => getNumberedReviewItems(activeItems, reviewViewportPresets),
    [activeItems, reviewViewportPresets]
  );
  const scopeFilteredNumberedActiveItems = (0, import_react21.useMemo)(
    () => qaFilter === "all" ? numberedActiveItems : numberedActiveItems.filter(
      (numberedItem) => numberedItem.scope === qaFilter
    ),
    [numberedActiveItems, qaFilter]
  );
  const statusFilteredNumberedActiveItems = (0, import_react21.useMemo)(
    () => qaStatusFilter === "all" ? numberedActiveItems : numberedActiveItems.filter(
      (numberedItem) => normalizeReviewItemStatus(numberedItem.item.status) === qaStatusFilter
    ),
    [numberedActiveItems, qaStatusFilter]
  );
  const filteredNumberedActiveItems = (0, import_react21.useMemo)(
    () => qaStatusFilter === "all" ? scopeFilteredNumberedActiveItems : scopeFilteredNumberedActiveItems.filter(
      (numberedItem) => normalizeReviewItemStatus(numberedItem.item.status) === qaStatusFilter
    ),
    [qaStatusFilter, scopeFilteredNumberedActiveItems]
  );
  const hiddenOverlayItemIdList = (0, import_react21.useMemo)(
    () => {
      const nextHiddenItemIds = new Set(hiddenOverlayItemIds);
      if (qaStatusFilter !== "all") {
        activeItems.forEach((item) => {
          if (normalizeReviewItemStatus(item.status) !== qaStatusFilter) {
            nextHiddenItemIds.add(item.id);
          }
        });
      }
      return Array.from(nextHiddenItemIds);
    },
    [activeItems, hiddenOverlayItemIds, qaStatusFilter]
  );
  const qaFilterCounts = (0, import_react21.useMemo)(() => {
    const counts = /* @__PURE__ */ new Map();
    counts.set("all", statusFilteredNumberedActiveItems.length);
    statusFilteredNumberedActiveItems.forEach((numberedItem) => {
      counts.set(numberedItem.scope, (counts.get(numberedItem.scope) ?? 0) + 1);
    });
    return counts;
  }, [statusFilteredNumberedActiveItems]);
  const qaStatusFilterCounts = (0, import_react21.useMemo)(() => {
    const counts = /* @__PURE__ */ new Map();
    counts.set("all", scopeFilteredNumberedActiveItems.length);
    scopeFilteredNumberedActiveItems.forEach((numberedItem) => {
      const status = normalizeReviewItemStatus(numberedItem.item.status);
      counts.set(status, (counts.get(status) ?? 0) + 1);
    });
    return counts;
  }, [scopeFilteredNumberedActiveItems]);
  const getItemPreset = (0, import_react21.useCallback)(
    (item) => findViewportPreset(
      viewportPresets,
      item.viewport?.width ?? 0,
      item.viewport?.height ?? 0
    ),
    [viewportPresets]
  );
  const getItemPresetScope = (0, import_react21.useCallback)(
    (item) => getViewportPresetKind(getItemPreset(item)),
    [getItemPreset]
  );
  const getItemPresetColumn = (0, import_react21.useCallback)(
    (item) => {
      const preset = getItemPreset(item);
      const presetIndex = Math.max(0, viewportPresets.indexOf(preset));
      return createSitemapViewportColumn(preset, presetIndex);
    },
    [getItemPreset, viewportPresets]
  );
  const getItemCountScope = (0, import_react21.useCallback)(
    (item) => item.scope === "dom" ? "dom" : getItemPresetScope(item),
    [getItemPresetScope]
  );
  const activeRemainingItemCount = (0, import_react21.useMemo)(
    () => activeItems.filter(
      (item) => normalizeReviewItemStatus(item.status) !== SITEMAP_STATUS_DONE
    ).length,
    [activeItems]
  );
  const presetScopeCounts = (0, import_react21.useMemo)(() => {
    const counts = /* @__PURE__ */ new Map();
    activeItems.forEach((item) => {
      const scope = getItemPresetScope(item);
      counts.set(scope, (counts.get(scope) ?? 0) + 1);
    });
    return counts;
  }, [activeItems, getItemPresetScope]);
  const currentPresetScope = getViewportPresetKind(size);
  const setQaStatusFilter = (0, import_react21.useCallback)((filter) => {
    setQaStatusFilterState(filter);
    writeStoredReviewQaStatusFilter(filter);
  }, []);
  const pageQaCounts = (0, import_react21.useMemo)(() => {
    const counts = /* @__PURE__ */ new Map();
    const addItems = (sourceKey, sourceItems) => {
      sourceItems.forEach((item) => {
        const pageTarget = normalizeTarget(
          getItemTarget(item, reviewPathPrefix),
          reviewPathPrefix
        );
        const currentCount = counts.get(pageTarget) ?? createEmptySitemapQaCount();
        const status = normalizeReviewItemStatus(item.status);
        const scope = getItemCountScope(item);
        const viewportColumn = getItemPresetColumn(item);
        const currentViewportCount = currentCount.viewport[viewportColumn.key] ?? { total: 0, remaining: 0 };
        const isRemaining = status !== SITEMAP_STATUS_DONE;
        counts.set(pageTarget, {
          ...currentCount,
          total: currentCount.total + 1,
          remaining: isRemaining ? currentCount.remaining + 1 : currentCount.remaining,
          local: currentCount.local + (sourceKey === "local" ? 1 : 0),
          remote: currentCount.remote + (sourceKey === "remote" ? 1 : 0),
          status: {
            ...currentCount.status,
            [status]: currentCount.status[status] + 1
          },
          scope: {
            ...currentCount.scope,
            [scope]: (currentCount.scope[scope] ?? 0) + 1
          },
          viewport: {
            ...currentCount.viewport,
            [viewportColumn.key]: {
              total: currentViewportCount.total + 1,
              remaining: isRemaining ? currentViewportCount.remaining + 1 : currentViewportCount.remaining
            }
          }
        });
      });
    };
    addItems("local", sitemapItems.local);
    addItems("remote", sitemapItems.remote);
    return counts;
  }, [getItemCountScope, getItemPresetColumn, reviewPathPrefix, sitemapItems]);
  const allQaCount = (0, import_react21.useMemo)(
    () => Array.from(pageQaCounts.values()).reduce(
      addSitemapQaCounts,
      createEmptySitemapQaCount()
    ),
    [pageQaCounts]
  );
  const selectedNumberedItem = (0, import_react21.useMemo)(
    () => selectedItemId ? numberedActiveItems.find(
      (numberedItem) => numberedItem.item.id === selectedItemId
    ) : void 0,
    [numberedActiveItems, selectedItemId]
  );
  return {
    activeItems,
    activeRemainingItemCount,
    allQaCount,
    currentPresetScope,
    filteredNumberedActiveItems,
    getItemPresetScope,
    hiddenOverlayItemIdList,
    hiddenOverlayItemIds,
    items,
    pageQaCounts,
    pageTargets,
    presetScopeCounts,
    qaFilter,
    qaFilterCounts,
    qaStatusFilter,
    qaStatusFilterCounts,
    selectedNumberedItem,
    setHiddenOverlayItemIds,
    setItems,
    setQaFilter,
    setQaStatusFilter,
    setSitemapItems,
    targetSrc
  };
};

// src/react-shell/hooks/use.review.shell.hotkeys.ts
var import_react22 = require("react");
var useReviewShellHotkeys = ({
  isFigmaSettingsOpen,
  isInitialPromptOpen,
  isRulerAvailable,
  isRulerVisible,
  isSitemapOpen,
  mode,
  onCancelReviewMode,
  onCloseFigmaSettings,
  onCloseInitialPrompt,
  onCloseRuler,
  onCloseSitemap,
  onSetReviewMode,
  onToggleRuler,
  onToggleTargetOverlay
}) => {
  (0, import_react22.useEffect)(() => {
    if (mode === "idle" && !isRulerVisible && !isInitialPromptOpen && !isSitemapOpen && !isFigmaSettingsOpen) {
      return;
    }
    const handleKeyDown = (event) => {
      if (event.key !== "Escape") return;
      if (mode !== "idle" && onCancelReviewMode()) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      if (onCloseRuler()) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      if (isInitialPromptOpen) {
        onCloseInitialPrompt();
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      if (isSitemapOpen) {
        onCloseSitemap();
        return;
      }
      if (isFigmaSettingsOpen) {
        onCloseFigmaSettings();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    isFigmaSettingsOpen,
    isInitialPromptOpen,
    isRulerVisible,
    isSitemapOpen,
    mode,
    onCancelReviewMode,
    onCloseFigmaSettings,
    onCloseInitialPrompt,
    onCloseRuler,
    onCloseSitemap
  ]);
  (0, import_react22.useEffect)(() => {
    const handleHotkey = (event) => {
      if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) {
        return;
      }
      if (isEditableEventTarget(event)) return;
      const actions = {
        r: () => {
          if (isRulerAvailable) onToggleRuler();
        },
        g: () => onToggleTargetOverlay("grid"),
        f: () => onToggleTargetOverlay("figma"),
        n: () => onSetReviewMode("note"),
        e: () => onSetReviewMode("element"),
        a: () => onSetReviewMode("area")
      };
      const action = actions[event.key.toLowerCase()];
      if (!action) return;
      event.preventDefault();
      action();
    };
    window.addEventListener("keydown", handleHotkey);
    return () => window.removeEventListener("keydown", handleHotkey);
  }, [
    isRulerAvailable,
    onSetReviewMode,
    onToggleRuler,
    onToggleTargetOverlay
  ]);
};

// src/react-shell/hooks/use.review.shell.state.ts
var import_react23 = require("react");

// src/react-shell/adapters.ts
var ALL_REVIEW_WRITE_MODES = ["dom", "note", "area"];
var DEFAULT_ASSIGNEE_TITLE = "Assignee";
function normalizeReviewShellAdapters(adapters) {
  if (Array.isArray(adapters)) {
    const normalized = adapters.map((adapter) => normalizeShellAdapter(adapter));
    const local = normalized.find((adapter) => adapter.label === "local") ?? null;
    const remote = normalized.find((adapter) => adapter.label !== "local") ?? null;
    if (normalized.length === 0 || !local && !remote) {
      throw new Error("ReviewShell requires at least one adapter.");
    }
    return {
      local,
      remote,
      sources: normalized
    };
  }
  return normalizeLegacyAdapterMap(adapters);
}
function normalizeLegacyAdapterMap(adapters) {
  const local = {
    label: "local",
    adapter: adapters.local,
    fields: { title: false },
    statusOptions: [...REVIEW_WORKFLOW_STATUS_OPTIONS],
    assigneeTitle: DEFAULT_ASSIGNEE_TITLE,
    assigneeOptions: [],
    updateStatus: ({ id, status }) => adapters.local.update(id, { status }),
    updateAssignee: ({ id, assigneeId, assigneeName }) => adapters.local.update(id, { assigneeId, assigneeName }),
    syncSubmission: ({ id, patch }) => adapters.local.update(id, patch),
    writeModes: [...ALL_REVIEW_WRITE_MODES],
    canUpdate: true,
    canRemove: true
  };
  const remote = adapters.remote ? {
    label: "remote",
    adapter: adapters.remote,
    fields: { title: false },
    statusOptions: [...REVIEW_WORKFLOW_STATUS_OPTIONS],
    assigneeTitle: DEFAULT_ASSIGNEE_TITLE,
    assigneeOptions: [],
    updateStatus: ({ id, status }) => adapters.remote?.update(id, { status }) ?? Promise.reject(new Error("Remote adapter is not available.")),
    updateAssignee: ({ id, assigneeId, assigneeName }) => adapters.remote?.update(id, { assigneeId, assigneeName }) ?? Promise.reject(new Error("Remote adapter is not available.")),
    writeModes: [],
    canUpdate: true,
    canRemove: false,
    pageId: adapters.remotePageId
  } : null;
  return {
    local,
    remote,
    sources: remote ? [local, remote] : [local]
  };
}
function normalizeShellAdapter(adapterConfig) {
  const statusOptions = [
    ...adapterConfig.statusOptions ?? REVIEW_WORKFLOW_STATUS_OPTIONS
  ];
  const fields = {
    title: adapterConfig.fields?.title === true
  };
  const assigneeTitle = adapterConfig.assigneeTitle?.trim() || DEFAULT_ASSIGNEE_TITLE;
  const assigneeOptions = [...adapterConfig.assigneeOptions ?? []];
  const updateAdapter = adapterConfig.update;
  const updateStatus = adapterConfig.updateStatus ? adapterConfig.updateStatus : updateAdapter ? ({ id, status }) => updateAdapter(id, { status }) : void 0;
  const updateAssignee = adapterConfig.updateAssignee ? adapterConfig.updateAssignee : updateAdapter ? ({ id, assigneeId, assigneeName, assigneeOption }) => updateAdapter(id, {
    assigneeId,
    assigneeName: assigneeName ?? assigneeOption?.label
  }) : void 0;
  const writeModes = normalizeWriteModes(
    adapterConfig.create ? adapterConfig.canWrite ?? adapterConfig.label === "local" : false
  );
  return {
    label: adapterConfig.label,
    pageId: adapterConfig.pageId,
    fields,
    statusOptions,
    assigneeTitle,
    assigneeOptions,
    updateStatus,
    updateAssignee,
    syncSubmission: adapterConfig.syncSubmission,
    writeModes,
    canUpdate: Boolean(updateAdapter),
    canRemove: Boolean(adapterConfig.remove),
    adapter: {
      get: adapterConfig.get,
      list: adapterConfig.list,
      create: async (item) => {
        if (!adapterConfig.create) {
          throw new Error(
            `Review adapter "${adapterConfig.label}" does not support create.`
          );
        }
        return adapterConfig.create(item);
      },
      update: async (id, patch) => {
        const nextStatus = patch.status;
        if (nextStatus && updateStatus) {
          const statusIndex = statusOptions.findIndex(
            (statusOption2) => statusOption2.value === nextStatus
          );
          const statusOption = statusOptions[statusIndex];
          if (statusOption) {
            const item2 = await adapterConfig.get(id);
            if (!item2) throw new Error(`Review item not found: ${id}`);
            const updated2 = await updateStatus({
              id,
              item: item2,
              status: nextStatus,
              statusOption,
              statusIndex
            });
            return updated2;
          }
        }
        if (updateAdapter) {
          return updateAdapter(id, patch);
        }
        if (!adapterConfig.syncSubmission) {
          throw new Error(
            `Review adapter "${adapterConfig.label}" does not support update.`
          );
        }
        const item = await adapterConfig.get(id);
        if (!item) throw new Error(`Review item not found: ${id}`);
        await adapterConfig.syncSubmission({
          id,
          item,
          patch
        });
        const updated = await adapterConfig.get(id);
        if (!updated) throw new Error(`Review item not found after update: ${id}`);
        return updated;
      },
      remove: async (id) => {
        if (!adapterConfig.remove) {
          throw new Error(
            `Review adapter "${adapterConfig.label}" does not support remove.`
          );
        }
        return adapterConfig.remove(id);
      }
    }
  };
}
function normalizeWriteModes(value) {
  if (value === true) return [...ALL_REVIEW_WRITE_MODES];
  if (Array.isArray(value)) {
    const modes = value.filter(
      (mode) => ALL_REVIEW_WRITE_MODES.includes(mode)
    );
    return Array.from(new Set(modes));
  }
  return [];
}

// src/react-shell/hooks/use.review.shell.state.ts
var useReviewShellState = ({
  adapters,
  presets,
  reviewPathPrefix
}) => {
  const viewportPresets = presets.length > 0 ? presets : DEFAULT_REVIEW_VIEWPORT_PRESETS;
  const reviewViewportPresets = (0, import_react23.useMemo)(
    () => toReviewViewportPresets(viewportPresets),
    [viewportPresets]
  );
  const normalizedAdapters = (0, import_react23.useMemo)(
    () => normalizeReviewShellAdapters(adapters),
    [adapters]
  );
  const localAdapterEntry = normalizedAdapters.local;
  const remoteAdapterEntry = normalizedAdapters.remote;
  const sourceEntries = normalizedAdapters.sources;
  const defaultSource = sourceEntries[0]?.label ?? "local";
  const initialItemId = getInitialItemId();
  const initialSidePanel = getInitialReviewSidePanel();
  const [source, setSource] = (0, import_react23.useState)(() => {
    const initialSource = getInitialSource(remoteAdapterEntry?.label);
    return sourceEntries.some((entry) => entry.label === initialSource) ? initialSource : defaultSource;
  });
  const remoteSource = remoteAdapterEntry?.label ?? null;
  const activeAdapterEntry = sourceEntries.find((entry) => entry.label === source) ?? sourceEntries[0];
  const isRemoteSource = Boolean(
    remoteSource && activeAdapterEntry.label === remoteSource
  );
  const showSourceSelect = sourceEntries.length > 1;
  const canWriteArea = activeAdapterEntry.writeModes.includes("area");
  const canWriteDom = activeAdapterEntry.writeModes.includes("dom");
  const adapter = activeAdapterEntry.adapter;
  const iframeRef = (0, import_react23.useRef)(null);
  const frameScrollRef = (0, import_react23.useRef)(null);
  const controllerRef = (0, import_react23.useRef)(null);
  const cleanupTargetRef = (0, import_react23.useRef)(null);
  const pendingRestoreRef = (0, import_react23.useRef)(null);
  const pendingInitialItemIdRef = (0, import_react23.useRef)(initialItemId);
  const selectedItemIdRef = (0, import_react23.useRef)(initialItemId);
  const hiddenOverlayItemIdListRef = (0, import_react23.useRef)([]);
  const [target, setTarget] = (0, import_react23.useState)(
    () => getInitialTarget(reviewPathPrefix)
  );
  const [draftTarget, setDraftTarget] = (0, import_react23.useState)(
    () => getInitialTarget(reviewPathPrefix)
  );
  const [activeRoute, setActiveRoute] = (0, import_react23.useState)(
    () => getTargetRouteKey(getInitialTarget(reviewPathPrefix), reviewPathPrefix)
  );
  const [size, setSize] = (0, import_react23.useState)(
    () => getInitialSize(viewportPresets)
  );
  const [mode, setMode] = (0, import_react23.useState)("idle");
  const [targetOverlayState, setTargetOverlayState] = (0, import_react23.useState)({
    grid: false,
    figma: false
  });
  const [selectedItemId, setSelectedItemId] = (0, import_react23.useState)(initialItemId);
  const [isListVisible, setIsListVisible] = (0, import_react23.useState)(
    () => Boolean(initialItemId || initialSidePanel) || getStoredReviewSidePanelVisible()
  );
  const [isSitemapOpen, setIsSitemapOpen] = (0, import_react23.useState)(false);
  const [isInitialPromptOpen, setIsInitialPromptOpen] = (0, import_react23.useState)(false);
  const [copyLabel, setCopyLabel] = (0, import_react23.useState)("Copy URL");
  const [toastMessage, setToastMessage] = (0, import_react23.useState)("");
  const [copiedPromptKey, setCopiedPromptKey] = (0, import_react23.useState)(null);
  const targetRef = (0, import_react23.useRef)(target);
  const sizeRef = (0, import_react23.useRef)(size);
  const isFigmaOverlayAvailable = getIsFigmaOverlayAvailable(size);
  return {
    activeAdapterEntry,
    activeRoute,
    adapter,
    canWriteArea,
    canWriteDom,
    cleanupTargetRef,
    controllerRef,
    copiedPromptKey,
    copyLabel,
    draftTarget,
    frameScrollRef,
    hiddenOverlayItemIdListRef,
    iframeRef,
    isFigmaOverlayAvailable,
    isInitialPromptOpen,
    isListVisible,
    isRemoteSource,
    isSitemapOpen,
    localAdapterEntry,
    mode,
    pendingInitialItemIdRef,
    pendingRestoreRef,
    remoteAdapterEntry,
    reviewViewportPresets,
    selectedItemId,
    selectedItemIdRef,
    setActiveRoute,
    setCopiedPromptKey,
    setCopyLabel,
    setDraftTarget,
    setIsInitialPromptOpen,
    setIsListVisible,
    setIsSitemapOpen,
    setMode,
    setSelectedItemId,
    setSize,
    setSource,
    setTarget,
    setTargetOverlayState,
    showSourceSelect,
    size,
    sizeRef,
    source,
    sourceEntries,
    target,
    targetOverlayState,
    targetRef,
    toastMessage,
    viewportPresets,
    setToastMessage
  };
};

// src/react-shell/review/shell.actions.ts
var writeClipboardTextFallback = (value) => {
  const selection = document.getSelection();
  const activeElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  const ranges = selection ? Array.from(
    { length: selection.rangeCount },
    (_, index) => selection.getRangeAt(index)
  ) : [];
  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  textarea.style.top = "0";
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  const isCopied = document.execCommand("copy");
  textarea.remove();
  selection?.removeAllRanges();
  ranges.forEach((range) => selection?.addRange(range));
  activeElement?.focus();
  if (!isCopied) {
    throw new Error("Failed to copy to clipboard");
  }
};
var writeClipboardText = async (value) => {
  try {
    writeClipboardTextFallback(value);
    return;
  } catch (error) {
    if (!navigator.clipboard?.writeText) {
      throw error;
    }
    await navigator.clipboard.writeText(value);
  }
};
var listReviewItems = async ({
  activeRoute,
  adapter,
  isRemoteSource,
  pageId,
  projectId
}) => adapter.list({
  projectId,
  pageId,
  routeKey: isRemoteSource ? activeRoute : void 0
});
var listSitemapReviewItems = async ({
  localAdapterEntry,
  projectId,
  remoteAdapterEntry
}) => {
  const [localResult, remoteResult] = await Promise.allSettled([
    localAdapterEntry ? localAdapterEntry.adapter.list({
      projectId,
      pageId: localAdapterEntry.pageId
    }) : Promise.resolve([]),
    remoteAdapterEntry ? remoteAdapterEntry.adapter.list({
      projectId,
      pageId: remoteAdapterEntry.pageId,
      source: remoteAdapterEntry.label
    }) : Promise.resolve([])
  ]);
  return {
    local: localResult.status === "fulfilled" ? localResult.value : [],
    remote: remoteResult.status === "fulfilled" ? remoteResult.value : []
  };
};
var refreshReviewItems = async ({
  onItemsChange,
  ...listOptions
}) => {
  const nextItems = await listReviewItems(listOptions);
  onItemsChange(nextItems);
  return nextItems;
};
var refreshSitemapReviewItems = async ({
  onSitemapItemsChange,
  ...listOptions
}) => {
  const sitemapItems = await listSitemapReviewItems(listOptions);
  onSitemapItemsChange(sitemapItems);
};
var copyCurrentReviewUrl = async ({
  onCopyLabelChange
}) => {
  await writeClipboardText(window.location.href);
  onCopyLabelChange("Copied");
  window.setTimeout(() => onCopyLabelChange("Copy URL"), 1200);
};
var refreshReviewData = async ({
  onRefreshItems,
  onRefreshSitemapItems,
  onReloadReviewKit
}) => {
  await onReloadReviewKit();
  await Promise.all([onRefreshItems(), onRefreshSitemapItems()]);
};
var updateReviewItemStatus = async ({
  activeAdapterEntry,
  item,
  nextStatus,
  onRefreshReviewData,
  onToast
}) => {
  if (!activeAdapterEntry.updateStatus) return;
  const statusIndex = activeAdapterEntry.statusOptions.findIndex(
    (statusOption2) => statusOption2.value === nextStatus
  );
  const statusOption = activeAdapterEntry.statusOptions[statusIndex];
  if (!statusOption) return;
  await activeAdapterEntry.updateStatus({
    id: item.id,
    item,
    status: statusOption.value,
    statusOption,
    statusIndex
  });
  await onRefreshReviewData();
  onToast?.("QA status updated");
};
var updateReviewItemAssignee = async ({
  activeAdapterEntry,
  item,
  assigneeId,
  onRefreshReviewData,
  onToast
}) => {
  if (!activeAdapterEntry.updateAssignee) return;
  const assigneeIndex = activeAdapterEntry.assigneeOptions.findIndex(
    (assigneeOption2) => assigneeOption2.value === assigneeId
  );
  const assigneeOption = activeAdapterEntry.assigneeOptions[assigneeIndex];
  const nextAssigneeId = assigneeOption?.value ?? (assigneeId && item.assigneeId === assigneeId ? assigneeId : null);
  const nextAssigneeName = assigneeOption?.label ?? (nextAssigneeId ? item.assigneeName : void 0);
  if ((item.assigneeId ?? null) === nextAssigneeId) {
    onToast?.("No QA assignee changes");
    return item;
  }
  const updated = await activeAdapterEntry.updateAssignee({
    id: item.id,
    item,
    assigneeId: nextAssigneeId,
    assigneeName: nextAssigneeName,
    assigneeOption,
    assigneeIndex
  });
  await onRefreshReviewData();
  onToast?.("QA assignee updated");
  return updated;
};
var updateReviewItemDetails = async ({
  activeAdapterEntry,
  fields,
  item,
  title,
  comment,
  onRefreshReviewData,
  onToast
}) => {
  const nextTitle = title?.trim() || void 0;
  const nextComment = comment.trim();
  if (!nextComment) throw new Error("Comment is required.");
  if (!activeAdapterEntry.canUpdate) {
    throw new Error(
      `Review adapter "${activeAdapterEntry.label}" does not support edit.`
    );
  }
  const isTitleUnchanged = !fields.title || nextTitle === (item.title?.trim() || void 0);
  const isUnchanged = isTitleUnchanged && nextComment === item.comment.trim();
  if (isUnchanged) {
    onToast?.("No QA changes");
    return item;
  }
  const updated = await activeAdapterEntry.adapter.update(item.id, {
    ...fields.title ? { title: nextTitle } : {},
    comment: nextComment
  });
  await onRefreshReviewData();
  onToast?.("QA updated");
  return updated;
};
var submitReviewItem = async ({
  localAdapterEntry,
  numberedItem,
  remoteAdapterEntry,
  selectedItemIdRef,
  onClearSelectedItem,
  onRefreshReviewData,
  onToast
}) => {
  const { item } = numberedItem;
  const syncLocalSubmission = localAdapterEntry?.syncSubmission;
  if (!remoteAdapterEntry || !localAdapterEntry || !syncLocalSubmission || item.submitStatus === "submitted") {
    return;
  }
  await syncLocalSubmission({
    id: item.id,
    item,
    patch: {
      submitStatus: "submitting",
      submitError: void 0
    }
  });
  await onRefreshReviewData();
  let toastMessage;
  try {
    await remoteAdapterEntry.adapter.create({
      ...item,
      reviewNumber: void 0,
      externalIssueId: void 0,
      externalIssueUrl: void 0,
      submittedAt: void 0,
      submitStatus: "submitted",
      submitError: void 0
    });
    await localAdapterEntry.adapter.remove(item.id);
    if (selectedItemIdRef.current === item.id) {
      onClearSelectedItem();
    }
    toastMessage = "Remote submitted";
  } catch (error) {
    await syncLocalSubmission({
      id: item.id,
      item,
      patch: {
        submitStatus: "failed",
        submitError: error instanceof Error ? error.message : "Failed to submit remote"
      }
    });
    toastMessage = "Remote submit failed";
  }
  await onRefreshReviewData();
  onToast?.(toastMessage);
};
var copyReviewPrompt = async ({
  key,
  toastMessage = "Copied",
  value,
  onCopiedPromptKeyChange,
  onToast
}) => {
  if (!value) return;
  await writeClipboardText(value);
  onCopiedPromptKeyChange(key);
  onToast?.(toastMessage);
  window.setTimeout(() => {
    onCopiedPromptKeyChange((current) => current === key ? null : current);
  }, 1200);
};
var removeReviewItem = async ({
  activeAdapterEntry,
  isRemoteSource,
  item,
  selectedItemIdRef,
  sizeRef,
  source,
  targetRef,
  onClearSelectedItem,
  onRefreshReviewData,
  onToast
}) => {
  if (!activeAdapterEntry.canRemove || item.submitStatus === "submitting" || !isRemoteSource && item.submitStatus === "submitted") {
    return;
  }
  await activeAdapterEntry.adapter.remove(item.id);
  if (selectedItemIdRef.current === item.id) {
    onClearSelectedItem();
    updateShellUrl(targetRef.current, sizeRef.current, source);
  }
  await onRefreshReviewData();
  onToast?.("QA deleted");
};

// src/react-shell/review/shell.tsx
var import_jsx_runtime26 = require("react/jsx-runtime");
var SOURCE_PANEL_MAX_WIDTH = 440;
var SOURCE_PANEL_MIN_WIDTH = 240;
var SOURCE_PANEL_MAX_HEIGHT = 260;
var SOURCE_TREE_PANEL_CLOSE_DELAY_MS = 180;
var ReviewShell = ({
  projectId,
  pages,
  adapters,
  presets = DEFAULT_REVIEW_VIEWPORT_PRESETS,
  ruler,
  initialPrompt = DEFAULT_INITIAL_REVIEW_PROMPT,
  adjustmentLabel,
  reviewPathPrefix = DEFAULT_REVIEW_PATH_PREFIX,
  sourceRoot,
  sourceInspector,
  presence,
  figmaImages
}) => {
  const {
    activeAdapterEntry,
    activeRoute,
    adapter,
    canWriteArea,
    canWriteDom,
    cleanupTargetRef,
    controllerRef,
    copiedPromptKey,
    copyLabel,
    draftTarget,
    frameScrollRef,
    hiddenOverlayItemIdListRef,
    iframeRef,
    isFigmaOverlayAvailable: isViewportFigmaOverlayAvailable,
    isInitialPromptOpen,
    isListVisible,
    isRemoteSource,
    isSitemapOpen,
    localAdapterEntry,
    mode,
    pendingInitialItemIdRef,
    pendingRestoreRef,
    remoteAdapterEntry,
    reviewViewportPresets,
    selectedItemId,
    selectedItemIdRef,
    setActiveRoute,
    setCopiedPromptKey,
    setCopyLabel,
    setDraftTarget,
    setIsInitialPromptOpen,
    setIsListVisible,
    setIsSitemapOpen,
    setMode,
    setSelectedItemId,
    setSize,
    setSource,
    setTarget,
    setTargetOverlayState,
    showSourceSelect,
    size,
    sizeRef,
    source,
    sourceEntries,
    target,
    targetOverlayState,
    targetRef,
    toastMessage,
    viewportPresets,
    setToastMessage
  } = useReviewShellState({
    adapters,
    presets,
    reviewPathPrefix
  });
  const sourceShortcutCleanupRef = (0, import_react24.useRef)(null);
  const sourceInspectorInteractionRef = (0, import_react24.useRef)(false);
  const [sourceInspectorState, setSourceInspectorState] = (0, import_react24.useState)(null);
  const [sectionOutline, setSectionOutline] = (0, import_react24.useState)(null);
  const [sectionOutlineFilter, setSectionOutlineFilter] = (0, import_react24.useState)(
    () => getStoredSourceTreeFilter()
  );
  const [sectionOutlineMetaVisibility, setSectionOutlineMetaVisibility] = (0, import_react24.useState)(() => getStoredSourceTreeMetaVisibility());
  const isSectionOutlineBoxMetaVisible = sectionOutlineMetaVisibility.box;
  const isSectionOutlineFontMetaVisible = sectionOutlineMetaVisibility.font;
  const isSectionOutlineMediaMetaVisible = sectionOutlineMetaVisibility.media;
  const isSectionOutlineClassMetaVisible = sectionOutlineMetaVisibility.className;
  const [collapsedSectionOutlineIds, setCollapsedSectionOutlineIds] = (0, import_react24.useState)(() => /* @__PURE__ */ new Set());
  const [isAllQaVisible, setIsAllQaVisible] = (0, import_react24.useState)(false);
  const [isInitialPromptScriptOpen, setIsInitialPromptScriptOpen] = (0, import_react24.useState)(false);
  const resolvedReviewSourceOptions = (0, import_react24.useMemo)(
    () => resolveReviewSourceOptions({ sourceInspector, sourceRoot }),
    [sourceInspector, sourceRoot]
  );
  const resolvedSourceInspector = resolvedReviewSourceOptions.sourceInspector;
  const resolvedSourceRoot = resolvedReviewSourceOptions.sourceRoot;
  const sourceOpenOptions = (0, import_react24.useMemo)(
    () => ({
      ...resolvedSourceInspector,
      sourceRoot: resolvedSourceRoot
    }),
    [resolvedSourceInspector, resolvedSourceRoot]
  );
  const sourceCandidateOptions = (0, import_react24.useMemo)(
    () => ({
      ignore: resolvedSourceInspector?.ignore,
      includePlacer: resolvedSourceInspector?.includePlacer
    }),
    [resolvedSourceInspector]
  );
  const sectionOutlineOptions = (0, import_react24.useMemo)(
    () => ({
      includePlacer: resolvedSourceInspector?.includePlacer,
      ignore: resolvedSourceInspector?.ignore,
      maxDepth: resolvedSourceInspector?.maxDepth
    }),
    [resolvedSourceInspector]
  );
  const isSourceInspectorEnabled = resolvedSourceInspector?.enabled !== false;
  const [sidePanel, setSidePanel] = (0, import_react24.useState)(() => {
    const initialSidePanel = getInitialReviewSidePanel();
    if (initialSidePanel) return initialSidePanel;
    if (getInitialItemId()) return "qa";
    return isSourceInspectorEnabled ? getStoredReviewSidePanel() : "qa";
  });
  const figmaImageStore = (0, import_react24.useMemo)(
    () => getReviewFigmaImageStore(figmaImages),
    [figmaImages]
  );
  const isFigmaImageManagementEnabled = Boolean(figmaImageStore);
  const figmaImageFormat = figmaImages?.imageFormat ?? DEFAULT_REVIEW_FIGMA_IMAGE_FORMAT;
  const isSourceTreeHoverOutlineEnabled = resolvedSourceInspector?.hoverOutline !== false;
  const isQaPanelVisible = isListVisible && sidePanel === "qa";
  const isSourceTreePanelVisible = isSourceInspectorEnabled && isListVisible && sidePanel === "source";
  const isFigmaImagesPanelVisible = isFigmaImageManagementEnabled && isListVisible && sidePanel === "figma-images";
  (0, import_react24.useEffect)(() => {
    if (isSourceInspectorEnabled || sidePanel !== "source") return;
    setSidePanel("qa");
  }, [isSourceInspectorEnabled, sidePanel]);
  (0, import_react24.useEffect)(() => {
    if (isFigmaImageManagementEnabled || sidePanel !== "figma-images") return;
    setSidePanel("qa");
  }, [isFigmaImageManagementEnabled, sidePanel]);
  (0, import_react24.useEffect)(() => {
    writeStoredReviewSidePanel(sidePanel);
  }, [sidePanel]);
  (0, import_react24.useEffect)(() => {
    writeStoredReviewSidePanelVisible(isListVisible);
  }, [isListVisible]);
  const updateSectionOutlineFilter = (0, import_react24.useCallback)((nextFilter) => {
    setSectionOutlineFilter(nextFilter);
    writeStoredSourceTreeFilter(nextFilter);
  }, []);
  const updateSectionOutlineMetaVisibility = (0, import_react24.useCallback)(
    (key) => {
      setSectionOutlineMetaVisibility((current) => {
        const next = { ...current, [key]: !current[key] };
        writeStoredSourceTreeMetaVisibility(next);
        return next;
      });
    },
    []
  );
  const sectionOutlineFilterTerms = (0, import_react24.useMemo)(
    () => getSectionOutlineFilterTerms(sectionOutlineFilter),
    [sectionOutlineFilter]
  );
  const filteredSectionOutline = (0, import_react24.useMemo)(
    () => sectionOutline ? filterSectionOutlineEntries(sectionOutline, sectionOutlineFilterTerms) : [],
    [sectionOutline, sectionOutlineFilterTerms]
  );
  const sectionOutlineTotalCount = (0, import_react24.useMemo)(
    () => getSectionOutlineEntryCount(sectionOutline ?? []),
    [sectionOutline]
  );
  const filteredSectionOutlineCount = (0, import_react24.useMemo)(
    () => getSectionOutlineEntryCount(filteredSectionOutline),
    [filteredSectionOutline]
  );
  const isSectionOutlineFiltering = sectionOutlineFilterTerms.length > 0;
  const {
    activeItems,
    activeRemainingItemCount,
    allQaCount,
    currentPresetScope,
    filteredNumberedActiveItems,
    getItemPresetScope,
    hiddenOverlayItemIdList,
    hiddenOverlayItemIds,
    items,
    pageQaCounts,
    pageTargets,
    presetScopeCounts,
    qaFilter,
    qaFilterCounts,
    qaStatusFilter,
    qaStatusFilterCounts,
    selectedNumberedItem,
    setHiddenOverlayItemIds,
    setItems,
    setQaFilter,
    setQaStatusFilter,
    setSitemapItems,
    targetSrc
  } = useReviewShellData({
    activeRoute,
    isAllQaVisible,
    isRemoteSource,
    pages,
    reviewPathPrefix,
    reviewViewportPresets,
    selectedItemId,
    size,
    target,
    viewportPresets
  });
  const itemRefreshIdRef = (0, import_react24.useRef)(0);
  const [isItemsLoading, setIsItemsLoading] = (0, import_react24.useState)(false);
  const [mutatingItemIds, setMutatingItemIds] = (0, import_react24.useState)(
    () => /* @__PURE__ */ new Set()
  );
  const {
    addImage: addFigmaImage,
    deleteImage: deleteFigmaImage,
    error: figmaImageError,
    imageOverlayStates: figmaImageOverlayStates,
    images: figmaImageList,
    isAnyImageOverlayVisible: isAnyFigmaImageOverlayVisible,
    isLoading: isFigmaImageLoading,
    isMutating: isFigmaImageMutating,
    refreshImages: refreshFigmaImages,
    reorderImages: reorderFigmaImages,
    selectedImageId: selectedFigmaImageId,
    setImageOverlayOffsetY: setFigmaImageOverlayOffsetY,
    setImageOverlayOpacity: setFigmaImageOverlayOpacity,
    setSelectedImageId: setSelectedFigmaImageId,
    target: figmaImageTarget,
    toggleAllImageOverlayVisible: toggleAllFigmaImageOverlayVisible,
    toggleImageOverlayLocked: toggleFigmaImageOverlayLocked,
    toggleImageOverlayMode: toggleFigmaImageOverlayMode,
    toggleImageOverlayVisible: toggleFigmaImageOverlayVisible,
    updateImage: updateFigmaImage
  } = useReviewFigmaImages({
    imageFormat: figmaImageFormat,
    pageUrl: target,
    projectId,
    store: figmaImageStore,
    viewport: size
  });
  const [targetFigmaState, setTargetFigmaState] = (0, import_react24.useState)(null);
  const targetFigmaConfig = targetFigmaState?.targetSrc === targetSrc ? targetFigmaState.config : null;
  const isFigmaOverlayAvailable = !isFigmaImageManagementEnabled && isViewportFigmaOverlayAvailable && Boolean(targetFigmaConfig);
  const [editingItem, setEditingItem] = (0, import_react24.useState)(null);
  const initialPromptText = initialPrompt.trim();
  const refreshItems = (0, import_react24.useCallback)(
    async () => {
      const requestId = ++itemRefreshIdRef.current;
      setIsItemsLoading(true);
      try {
        return await refreshReviewItems({
          activeRoute,
          adapter,
          isRemoteSource,
          pageId: activeAdapterEntry.pageId,
          projectId,
          onItemsChange: setItems
        });
      } finally {
        if (itemRefreshIdRef.current === requestId) {
          setIsItemsLoading(false);
        }
      }
    },
    [
      activeAdapterEntry.pageId,
      activeRoute,
      adapter,
      isRemoteSource,
      projectId,
      setItems
    ]
  );
  const refreshSitemapItems = (0, import_react24.useCallback)(
    () => refreshSitemapReviewItems({
      localAdapterEntry,
      projectId,
      remoteAdapterEntry,
      onSitemapItemsChange: setSitemapItems
    }),
    [localAdapterEntry, projectId, remoteAdapterEntry]
  );
  const cancelReviewMode = (0, import_react24.useCallback)(() => {
    const controller = controllerRef.current;
    if (!controller || controller.getMode() === "idle") return false;
    controller.setMode("idle");
    setMode(controller.getMode());
    return true;
  }, []);
  const closePromptModal = (0, import_react24.useCallback)(() => {
    setIsInitialPromptOpen(false);
  }, []);
  const closeSitemap = (0, import_react24.useCallback)(() => {
    setIsSitemapOpen(false);
  }, []);
  const reloadTargetFrame = (0, import_react24.useCallback)(() => {
    try {
      iframeRef.current?.contentWindow?.location.reload();
    } catch {
      return;
    }
  }, []);
  const {
    closeFigmaSettings,
    effectiveReviewTheme,
    figmaSettingsStatus,
    figmaTokenDraft,
    isFigmaSettingsOpen,
    isFigmaTokenGuideOpen,
    isFigmaTokenVisible,
    openFigmaSettings,
    reviewThemeDraft,
    reviewUserId,
    reviewUserIdDraft,
    saveReviewSettings,
    setFigmaSettingsStatus,
    setFigmaTokenDraft,
    setIsFigmaTokenGuideOpen,
    setIsFigmaTokenVisible,
    setReviewThemeDraft,
    setReviewUserIdDraft
  } = useReviewSettings({
    onCancelReviewMode: cancelReviewMode,
    onCloseInitialPrompt: closePromptModal,
    onCloseSitemap: closeSitemap,
    onReloadTargetFrame: reloadTargetFrame
  });
  const {
    currentPagePresenceUsers,
    pagePresenceUsers,
    presenceSessionId
  } = useReviewPresence({
    activeRoute,
    mode,
    presence,
    projectId,
    reviewPathPrefix,
    reviewUserId,
    selectedNumberedItem,
    size,
    source
  });
  const closeRulerPanels = (0, import_react24.useCallback)(() => {
    closeSitemap();
    closeFigmaSettings();
  }, [closeFigmaSettings, closeSitemap]);
  const {
    closeRuler,
    isRulerAvailable,
    isRulerDragging,
    isRulerVisible,
    rulerHover,
    rulerMeasure,
    rulerMeasureLabel,
    rulerOverlayRef,
    rulerScaleX,
    rulerScaleY,
    rulerUnit,
    toggleRuler
  } = useReviewRuler({
    iframeRef,
    ruler,
    size,
    targetSrc,
    onCancelReviewMode: cancelReviewMode,
    onCloseTransientPanels: closeRulerPanels
  });
  const {
    clearSelectedItem,
    initReviewKit,
    reloadReviewKit,
    restoreReviewItem,
    setControllerReviewMode,
    syncTargetViewport,
    toggleTargetOverlay
  } = useReviewController({
    adapter,
    fields: activeAdapterEntry.fields,
    assigneeTitle: activeAdapterEntry.assigneeTitle,
    assigneeOptions: activeAdapterEntry.assigneeOptions,
    cleanupTargetRef,
    controllerRef,
    frameScrollRef,
    hiddenOverlayItemIdList,
    hiddenOverlayItemIdListRef,
    iframeRef,
    isFigmaOverlayAvailable,
    pageTargets,
    pendingInitialItemIdRef,
    pendingRestoreRef,
    projectId,
    reviewPathPrefix,
    reviewUserId,
    reviewViewportPresets,
    ruler,
    adjustmentLabel,
    selectedItemIdRef,
    size,
    sizeRef,
    source,
    target,
    targetOverlayState,
    targetRef,
    viewportPresets,
    onActiveRouteChange: setActiveRoute,
    onCancelReviewMode: cancelReviewMode,
    onCloseRuler: closeRuler,
    onDraftTargetChange: setDraftTarget,
    onItemsRefresh: refreshItems,
    onModeChange: setMode,
    onSelectedItemIdChange: setSelectedItemId,
    onSizeChange: setSize,
    onTargetChange: setTarget,
    onTargetOverlayStateChange: setTargetOverlayState
  });
  (0, import_react24.useEffect)(() => {
    const itemId = pendingInitialItemIdRef.current;
    if (!itemId) return;
    const item = items.find(
      (candidate) => candidate.id === itemId || candidate.externalIssueId === itemId
    );
    if (!item) return;
    restoreReviewItem(item);
  }, [items, pendingInitialItemIdRef, restoreReviewItem]);
  const refreshReviewData2 = (0, import_react24.useCallback)(() => {
    return refreshReviewData({
      onRefreshItems: refreshItems,
      onRefreshSitemapItems: refreshSitemapItems,
      onReloadReviewKit: reloadReviewKit
    });
  }, [refreshItems, refreshSitemapItems, reloadReviewKit]);
  const toggleItemOverlayVisibility = (0, import_react24.useCallback)((itemId) => {
    setHiddenOverlayItemIds((currentHiddenOverlayItemIds) => {
      const nextHiddenItemIds = new Set(currentHiddenOverlayItemIds);
      if (nextHiddenItemIds.has(itemId)) {
        nextHiddenItemIds.delete(itemId);
      } else {
        nextHiddenItemIds.add(itemId);
      }
      return nextHiddenItemIds;
    });
  }, []);
  (0, import_react24.useEffect)(() => {
    void refreshItems();
  }, [refreshItems]);
  (0, import_react24.useEffect)(() => {
    void refreshSitemapItems();
  }, [refreshSitemapItems]);
  (0, import_react24.useEffect)(() => {
    if (!isSitemapOpen) return;
    void refreshSitemapItems();
  }, [isSitemapOpen, refreshSitemapItems]);
  (0, import_react24.useEffect)(() => {
    const frameScroll = frameScrollRef.current;
    if (!frameScroll) return void 0;
    const centerFrameScroll = () => {
      frameScroll.scrollLeft = Math.max(
        0,
        (frameScroll.scrollWidth - frameScroll.clientWidth) / 2
      );
      frameScroll.scrollTop = 0;
      syncTargetViewport();
    };
    const animationFrame = window.requestAnimationFrame(centerFrameScroll);
    const transitionTimeout = window.setTimeout(centerFrameScroll, 180);
    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.clearTimeout(transitionTimeout);
    };
  }, [isListVisible, size.height, size.width, syncTargetViewport, targetSrc]);
  const applyTarget = async () => {
    const parsedInput = parseReviewAddressInput(draftTarget, reviewPathPrefix);
    const normalizedTarget = parsedInput.target;
    const normalizedRoute = getTargetRouteKey(
      normalizedTarget,
      reviewPathPrefix
    );
    const nextSource = parsedInput.source && sourceEntries.some((entry) => entry.label === parsedInput.source) ? parsedInput.source : source;
    const nextSize = parsedInput.width && parsedInput.height ? findViewportPreset(
      viewportPresets,
      parsedInput.width,
      parsedInput.height
    ) : sizeRef.current;
    const nextAdapter = sourceEntries.find((entry) => entry.label === nextSource) ?? activeAdapterEntry;
    const isCurrentTarget = targetRef.current === normalizedTarget && source === nextSource && sizeRef.current.width === nextSize.width && sizeRef.current.height === nextSize.height;
    if (parsedInput.itemId) {
      const item = await nextAdapter.adapter.get(parsedInput.itemId);
      if (item) {
        setIsAllQaVisible(false);
        setSource(nextSource);
        restoreReviewItem(item);
        return;
      }
    }
    clearSelectedItem();
    setIsAllQaVisible(false);
    setSource(nextSource);
    targetRef.current = normalizedTarget;
    setActiveRoute(normalizedRoute);
    setDraftTarget(normalizedTarget);
    setSize(nextSize);
    setTarget(normalizedTarget);
    updateShellUrl(normalizedTarget, nextSize, nextSource);
    if (isCurrentTarget) reloadTargetFrame();
  };
  const selectPage = (href) => {
    const normalizedTarget = normalizeTarget(href, reviewPathPrefix);
    const normalizedRoute = getTargetRouteKey(
      normalizedTarget,
      reviewPathPrefix
    );
    clearSelectedItem();
    setIsAllQaVisible(false);
    targetRef.current = normalizedTarget;
    setActiveRoute(normalizedRoute);
    setDraftTarget(normalizedTarget);
    setTarget(normalizedTarget);
    updateShellUrl(normalizedTarget, sizeRef.current, source);
    setIsSitemapOpen(false);
  };
  const selectAllQa = () => {
    setIsAllQaVisible(true);
    setIsSitemapOpen(false);
  };
  const setReviewMode = (nextMode) => {
    const writeMode = getReviewModeWriteMode(nextMode);
    if (writeMode && !activeAdapterEntry.writeModes.includes(writeMode)) return;
    closeRuler();
    if (writeMode && mode !== nextMode) {
      setSidePanel("qa");
      setIsListVisible(true);
    }
    setControllerReviewMode(nextMode);
  };
  useReviewShellHotkeys({
    isFigmaSettingsOpen,
    isInitialPromptOpen,
    isRulerAvailable,
    isRulerVisible,
    isSitemapOpen,
    mode,
    onCancelReviewMode: cancelReviewMode,
    onCloseFigmaSettings: closeFigmaSettings,
    onCloseInitialPrompt: closePromptModal,
    onCloseRuler: closeRuler,
    onCloseSitemap: closeSitemap,
    onSetReviewMode: setReviewMode,
    onToggleRuler: toggleRuler,
    onToggleTargetOverlay: toggleTargetOverlay
  });
  const copyCurrentUrl = () => copyCurrentReviewUrl({
    onCopyLabelChange: setCopyLabel
  });
  const showToast = (0, import_react24.useCallback)(
    (message) => {
      setToastMessage(message);
      window.setTimeout(() => {
        setToastMessage((current) => current === message ? "" : current);
      }, 1600);
    },
    [setToastMessage]
  );
  const refreshTargetFigmaConfig = (0, import_react24.useCallback)(() => {
    const config = getTargetFigmaFrameConfig(
      iframeRef.current?.contentWindow
    );
    setTargetFigmaState(config ? { targetSrc, config } : null);
  }, [iframeRef, targetSrc]);
  (0, import_react24.useEffect)(() => {
    const targetDocument = iframeRef.current?.contentDocument;
    setTargetFigmaOverlayLocked(targetDocument, mode === "element");
    return () => {
      setTargetFigmaOverlayLocked(targetDocument, false);
    };
  }, [iframeRef, mode, targetSrc]);
  const clearSourceInspector = (0, import_react24.useCallback)(() => {
    sourceInspectorInteractionRef.current = false;
    setSourceInspectorState(null);
  }, []);
  (0, import_react24.useEffect)(() => {
    clearSourceInspector();
    setCollapsedSectionOutlineIds(/* @__PURE__ */ new Set());
    setSectionOutline(null);
  }, [clearSourceInspector, targetSrc]);
  const getSourceInspectorRect = (0, import_react24.useCallback)(
    (element) => {
      const frame = iframeRef.current;
      if (!frame) return null;
      const frameRect = frame.getBoundingClientRect();
      const elementRect = element.getBoundingClientRect();
      const left = Math.max(frameRect.left, frameRect.left + elementRect.left);
      const top = Math.max(frameRect.top, frameRect.top + elementRect.top);
      const right = Math.min(
        frameRect.right,
        frameRect.left + elementRect.right
      );
      const bottom = Math.min(
        frameRect.bottom,
        frameRect.top + elementRect.bottom
      );
      return {
        height: Math.max(2, bottom - top),
        left,
        top,
        width: Math.max(2, right - left)
      };
    },
    [iframeRef]
  );
  const getSourceInspectorPanelPosition = (0, import_react24.useCallback)(
    (rect) => {
      const margin = 12;
      const gap = 10;
      const preferredLeft = rect.left + rect.width + gap;
      const rightSpace = window.innerWidth - preferredLeft - margin;
      const leftSpace = rect.left - gap - margin;
      const canOpenRight = rightSpace >= SOURCE_PANEL_MIN_WIDTH;
      const canOpenLeft = leftSpace >= SOURCE_PANEL_MIN_WIDTH;
      const left = canOpenRight || !canOpenLeft ? preferredLeft : margin;
      const right = canOpenRight || !canOpenLeft ? null : Math.max(margin, window.innerWidth - (rect.left - gap));
      const maxWidth = Math.min(
        SOURCE_PANEL_MAX_WIDTH,
        Math.max(
          SOURCE_PANEL_MIN_WIDTH,
          canOpenRight ? rightSpace : canOpenLeft ? leftSpace : window.innerWidth - margin * 2
        )
      );
      const top = Math.min(
        Math.max(margin, rect.top),
        Math.max(margin, window.innerHeight - SOURCE_PANEL_MAX_HEIGHT - margin)
      );
      return { left, maxWidth, right, top };
    },
    []
  );
  const showSourceInspectorForTarget = (0, import_react24.useCallback)(
    (target2, isPinned = false) => {
      const candidates = getSourceCandidates(target2, sourceCandidateOptions).map(
        (candidate) => ({
          ...candidate,
          openUrl: getSourceOpenUrl(candidate.source, {
            ...sourceOpenOptions,
            omitPosition: !candidate.usesPosition
          })
        })
      );
      const firstCandidate = candidates[0];
      const rect = firstCandidate ? getSourceInspectorRect(firstCandidate.element) : null;
      if (!firstCandidate || !rect) {
        setSourceInspectorState(null);
        return [];
      }
      const { left, maxWidth, right, top } = getSourceInspectorPanelPosition(rect);
      setSourceInspectorState({
        candidates,
        isPinned,
        panelLeft: left,
        panelMaxWidth: maxWidth,
        panelRight: right,
        panelTop: top,
        rect
      });
      return candidates;
    },
    [
      getSourceInspectorPanelPosition,
      getSourceInspectorRect,
      sourceCandidateOptions,
      sourceOpenOptions
    ]
  );
  const showSourceOutlineForTarget = (0, import_react24.useCallback)(
    (target2) => {
      const firstCandidate = getSourceCandidates(
        target2,
        sourceCandidateOptions
      )[0];
      const rect = firstCandidate ? getSourceInspectorRect(firstCandidate.element) : null;
      if (!firstCandidate || !rect) {
        setSourceInspectorState(null);
        return null;
      }
      setSourceInspectorState({
        candidates: [],
        isPinned: false,
        panelLeft: 0,
        panelMaxWidth: SOURCE_PANEL_MAX_WIDTH,
        panelRight: null,
        panelTop: 0,
        rect
      });
      return firstCandidate;
    },
    [getSourceInspectorRect, sourceCandidateOptions]
  );
  const showSourceOutlineForElement = (0, import_react24.useCallback)(
    (element) => {
      if (!isSourceTreeHoverOutlineEnabled) return;
      const rect = getSourceInspectorRect(element);
      if (!rect) {
        setSourceInspectorState(
          (current) => current?.isPinned ? current : null
        );
        return;
      }
      setSourceInspectorState(
        (current) => current?.isPinned ? current : {
          candidates: [],
          isPinned: false,
          panelLeft: 0,
          panelMaxWidth: SOURCE_PANEL_MAX_WIDTH,
          panelRight: null,
          panelTop: 0,
          rect
        }
      );
    },
    [getSourceInspectorRect, isSourceTreeHoverOutlineEnabled]
  );
  const clearSourceOutlineHover = (0, import_react24.useCallback)(() => {
    setSourceInspectorState((current) => current?.isPinned ? current : null);
  }, []);
  const openSourceCandidate = (0, import_react24.useCallback)(
    (candidate) => {
      const didOpen = openSourceInEditor(candidate.source, {
        ...sourceOpenOptions,
        omitPosition: !candidate.usesPosition
      });
      showToast(didOpen ? "Source opened" : "Source root required");
      clearSourceInspector();
    },
    [clearSourceInspector, showToast, sourceOpenOptions]
  );
  const getCurrentSectionOutline = (0, import_react24.useCallback)(
    () => {
      let frameDocument = null;
      try {
        frameDocument = iframeRef.current?.contentDocument ?? null;
      } catch {
        frameDocument = null;
      }
      if (!frameDocument || frameDocument.readyState !== "complete") {
        return null;
      }
      return getSectionOutline(frameDocument, sectionOutlineOptions);
    },
    [iframeRef, sectionOutlineOptions]
  );
  const setSectionOutlineWithDefaultCollapse = (0, import_react24.useCallback)(
    (nextSectionOutline) => {
      setSectionOutline(nextSectionOutline);
      setCollapsedSectionOutlineIds(
        getDefaultCollapsedSectionOutlineIds(nextSectionOutline)
      );
    },
    []
  );
  (0, import_react24.useEffect)(() => {
    if (sidePanel !== "source" || !isListVisible) return void 0;
    const refreshSectionOutline = () => {
      const nextSectionOutline = getCurrentSectionOutline();
      if (!nextSectionOutline) return;
      setSectionOutlineWithDefaultCollapse(nextSectionOutline);
    };
    const animationFrame = window.requestAnimationFrame(refreshSectionOutline);
    const firstTimeout = window.setTimeout(refreshSectionOutline, 120);
    const secondTimeout = window.setTimeout(refreshSectionOutline, 500);
    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.clearTimeout(firstTimeout);
      window.clearTimeout(secondTimeout);
    };
  }, [
    getCurrentSectionOutline,
    isListVisible,
    setSectionOutlineWithDefaultCollapse,
    sidePanel,
    targetSrc
  ]);
  const toggleQaPanel = (0, import_react24.useCallback)(() => {
    setSidePanel("qa");
    setIsListVisible((current) => sidePanel === "qa" ? !current : true);
  }, [setIsListVisible, sidePanel]);
  const toggleSourceTreePanel = (0, import_react24.useCallback)(() => {
    if (!isSourceInspectorEnabled) return;
    if (sidePanel === "source" && isListVisible) {
      setIsListVisible(false);
      return;
    }
    setSidePanel("source");
    const nextSectionOutline = getCurrentSectionOutline();
    if (nextSectionOutline) {
      setSectionOutlineWithDefaultCollapse(nextSectionOutline);
    }
    setIsListVisible(true);
  }, [
    getCurrentSectionOutline,
    isListVisible,
    isSourceInspectorEnabled,
    setSectionOutlineWithDefaultCollapse,
    setIsListVisible,
    sidePanel
  ]);
  const toggleFigmaImagesPanel = (0, import_react24.useCallback)(() => {
    if (!isFigmaImageManagementEnabled) return;
    if (sidePanel === "figma-images" && isListVisible) {
      setIsListVisible(false);
      return;
    }
    setSidePanel("figma-images");
    setIsListVisible(true);
  }, [
    isFigmaImageManagementEnabled,
    isListVisible,
    setIsListVisible,
    sidePanel
  ]);
  const toggleSectionOutlineEntry = (0, import_react24.useCallback)((entryId) => {
    setCollapsedSectionOutlineIds((current) => {
      const next = new Set(current);
      if (next.has(entryId)) {
        next.delete(entryId);
      } else {
        next.add(entryId);
      }
      return next;
    });
  }, []);
  const scrollToSection = (0, import_react24.useCallback)((entry) => {
    scrollElementInTarget(entry.element, "start");
    centerFrameScrollOnElement(
      frameScrollRef.current,
      iframeRef.current,
      entry.element
    );
  }, [frameScrollRef, iframeRef]);
  const openSectionSource = (0, import_react24.useCallback)(
    (entry) => {
      const didOpen = openSourceInEditor(entry.source, {
        ...sourceOpenOptions,
        omitPosition: true
      });
      showToast(didOpen ? "Source opened" : "Source root required");
    },
    [showToast, sourceOpenOptions]
  );
  const openSectionData = (0, import_react24.useCallback)(
    (entry) => {
      const didOpen = openSourceInEditor(entry.data, sourceOpenOptions);
      showToast(didOpen ? "Data opened" : "Data hint not found");
    },
    [showToast, sourceOpenOptions]
  );
  const startSectionDomReview = (0, import_react24.useCallback)(
    (entry) => {
      if (!canWriteDom) {
        showToast("DOM QA unavailable");
        return;
      }
      const rect = entry.element.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) {
        showToast("Component has no visible area here");
        return;
      }
      clearSourceInspector();
      setSidePanel("qa");
      setIsListVisible(true);
      let targetWindow = null;
      try {
        targetWindow = entry.element.ownerDocument.defaultView ?? iframeRef.current?.contentWindow ?? null;
      } catch {
        targetWindow = null;
      }
      void waitForMs(SOURCE_TREE_PANEL_CLOSE_DELAY_MS).then(async () => {
        initReviewKit();
        await waitForFrame(targetWindow);
        const controller = controllerRef.current;
        if (!controller) {
          showToast("DOM QA unavailable");
          return;
        }
        scrollElementInTarget(entry.element, "center");
        await waitForFrame(targetWindow);
        centerFrameScrollOnElement(
          frameScrollRef.current,
          iframeRef.current,
          entry.element
        );
        await waitForFrame(targetWindow);
        await controller.startElementReview(entry.element);
        await waitForFrame(targetWindow);
        setMode(controller.getMode());
      }).catch(() => {
        setMode(controllerRef.current?.getMode() ?? "idle");
      });
    },
    [
      canWriteDom,
      clearSourceInspector,
      controllerRef,
      frameScrollRef,
      iframeRef,
      initReviewKit,
      setIsListVisible,
      setMode,
      showToast
    ]
  );
  const cleanupSourceOpenShortcut = (0, import_react24.useCallback)(() => {
    sourceShortcutCleanupRef.current?.();
    sourceShortcutCleanupRef.current = null;
  }, []);
  const bindSourceOpenShortcut = (0, import_react24.useCallback)(() => {
    cleanupSourceOpenShortcut();
    let frameDocument = null;
    try {
      frameDocument = iframeRef.current?.contentDocument ?? null;
    } catch {
      return;
    }
    if (!frameDocument || !isSourceInspectorEnabled) return;
    const frameRoot = frameDocument.head ?? frameDocument.documentElement;
    const frameBody = frameDocument.body ?? frameDocument.documentElement;
    if (!frameRoot || !frameBody) return;
    const optionAttribute = "data-dfwr-source-option";
    const fontOverlayAttribute = "data-dfwr-source-fonts";
    const style = frameDocument.createElement("style");
    style.dataset.dfwrSourceOpenShortcut = "true";
    style.textContent = createSourceShortcutStyle(
      optionAttribute,
      fontOverlayAttribute
    );
    frameRoot.append(style);
    const fontOverlay = frameDocument.createElement("div");
    fontOverlay.setAttribute(fontOverlayAttribute, "true");
    fontOverlay.hidden = true;
    frameBody.append(fontOverlay);
    let hoveredElement = null;
    let lastSourceTarget = null;
    let isSourceSelecting = false;
    let isSourcePanelPinned = false;
    const getFontHints = (element) => {
      if (!element) return [];
      const values = [];
      const addValue = (target2) => {
        const value = target2.getAttribute("data-font")?.trim();
        const tag = target2.tagName.toLowerCase();
        if (value && !values.some((item) => item.tag === tag && item.value === value)) {
          values.push({ tag, value });
        }
      };
      addValue(element);
      element.querySelectorAll("[data-font]").forEach(addValue);
      return values;
    };
    const updateFontOverlay = (element) => {
      const values = isSourceSelecting ? getFontHints(element) : [];
      if (!values.length || !element) {
        fontOverlay.hidden = true;
        return;
      }
      const rect = element.getBoundingClientRect();
      const frameWidth = frameDocument.documentElement.clientWidth;
      const showAbove = rect.top > 48;
      const top = Math.max(4, showAbove ? rect.top : rect.bottom);
      fontOverlay.replaceChildren();
      fontOverlay.style.minWidth = "72px";
      fontOverlay.style.left = "4px";
      fontOverlay.style.top = `${top}px`;
      fontOverlay.style.transform = showAbove ? "translateY(calc(-100% - 6px))" : "translateY(6px)";
      fontOverlay.style.visibility = "hidden";
      const rows = values.map(({ tag, value }) => {
        const row = frameDocument.createElement("span");
        const tagText = frameDocument.createElement("span");
        const valueText = frameDocument.createElement("span");
        tagText.textContent = tag;
        valueText.textContent = value;
        row.append(tagText, valueText);
        return row;
      });
      fontOverlay.append(...rows);
      fontOverlay.hidden = false;
      const overlayWidth = fontOverlay.getBoundingClientRect().width;
      const left = Math.max(
        4,
        Math.min(rect.left, frameWidth - overlayWidth - 4)
      );
      fontOverlay.style.left = `${left}px`;
      fontOverlay.style.visibility = "";
    };
    const setHoveredElement = (element) => {
      hoveredElement = element;
      updateFontOverlay(element);
    };
    const setSourceSelecting = (isSelecting) => {
      isSourceSelecting = isSelecting;
      if (isSelecting) {
        isSourcePanelPinned = false;
        frameDocument.documentElement.setAttribute(optionAttribute, "true");
        const candidate = showSourceOutlineForTarget(lastSourceTarget);
        setHoveredElement(candidate?.element ?? hoveredElement);
        return;
      }
      setHoveredElement(null);
      fontOverlay.hidden = true;
      frameDocument.documentElement.removeAttribute(optionAttribute);
      if (!isSourcePanelPinned && !sourceInspectorInteractionRef.current) {
        clearSourceInspector();
      }
    };
    const handleMouseMove = (event) => {
      if (isSourcePanelPinned) return;
      lastSourceTarget = event.target;
      const candidates = getSourceCandidates(event.target, sourceCandidateOptions);
      const sourceElement = candidates[0]?.element ?? null;
      if (event.altKey && !isSourceSelecting) {
        setSourceSelecting(true);
      }
      if (isSourceSelecting && !isSourcePanelPinned) {
        showSourceOutlineForTarget(event.target);
      }
      setHoveredElement(isSourceSelecting ? sourceElement : null);
    };
    const handleClick = (event) => {
      if (!isSourceSelecting && !event.altKey) return;
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      const candidates = showSourceInspectorForTarget(event.target, true);
      if (!candidates.length) {
        showToast("Source hint not found");
        isSourcePanelPinned = false;
        setSourceSelecting(false);
        return;
      }
      isSourcePanelPinned = true;
      setSourceSelecting(false);
    };
    const isOptionKeyEvent = (event) => event.key === "Alt" || event.code === "AltLeft" || event.code === "AltRight" || event.altKey;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        isSourcePanelPinned = false;
        setSourceSelecting(false);
        clearSourceInspector();
        return;
      }
      if (!isOptionKeyEvent(event)) return;
      if (isSourcePanelPinned) return;
      cancelReviewMode();
      setSourceSelecting(true);
    };
    const handleKeyUp = (event) => {
      if (isOptionKeyEvent(event) || !event.altKey) setSourceSelecting(false);
    };
    const handleBlur = () => {
      isSourcePanelPinned = false;
      setSourceSelecting(false);
    };
    const handleWindowPointerDown = (event) => {
      const target2 = event.target;
      if (target2 instanceof Element && target2.closest(".df-review-source-popover")) {
        sourceInspectorInteractionRef.current = true;
        return;
      }
      isSourcePanelPinned = false;
      sourceInspectorInteractionRef.current = false;
      setSourceSelecting(false);
      clearSourceInspector();
    };
    frameDocument.addEventListener("mousemove", handleMouseMove, true);
    frameDocument.addEventListener("click", handleClick, true);
    frameDocument.addEventListener("keydown", handleKeyDown, true);
    frameDocument.addEventListener("keyup", handleKeyUp, true);
    window.addEventListener("keydown", handleKeyDown, true);
    window.addEventListener("keyup", handleKeyUp, true);
    window.addEventListener("blur", handleBlur);
    window.addEventListener("pointerdown", handleWindowPointerDown, true);
    sourceShortcutCleanupRef.current = () => {
      frameDocument.removeEventListener("mousemove", handleMouseMove, true);
      frameDocument.removeEventListener("click", handleClick, true);
      frameDocument.removeEventListener("keydown", handleKeyDown, true);
      frameDocument.removeEventListener("keyup", handleKeyUp, true);
      window.removeEventListener("keydown", handleKeyDown, true);
      window.removeEventListener("keyup", handleKeyUp, true);
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("pointerdown", handleWindowPointerDown, true);
      isSourcePanelPinned = false;
      setSourceSelecting(false);
      style.remove();
      fontOverlay.remove();
    };
  }, [
    cancelReviewMode,
    clearSourceInspector,
    cleanupSourceOpenShortcut,
    iframeRef,
    isSourceInspectorEnabled,
    showToast,
    sourceCandidateOptions,
    showSourceOutlineForTarget,
    showSourceInspectorForTarget
  ]);
  (0, import_react24.useEffect)(() => {
    return cleanupSourceOpenShortcut;
  }, [cleanupSourceOpenShortcut]);
  const loadTargetFrame = (0, import_react24.useCallback)(() => {
    initReviewKit();
    refreshTargetFigmaConfig();
    setTargetFigmaOverlayLocked(
      iframeRef.current?.contentDocument,
      mode === "element"
    );
    bindSourceOpenShortcut();
    if (sidePanel === "source" && isListVisible) {
      const nextSectionOutline = getCurrentSectionOutline();
      if (nextSectionOutline) {
        setSectionOutlineWithDefaultCollapse(nextSectionOutline);
      }
    }
  }, [
    bindSourceOpenShortcut,
    getCurrentSectionOutline,
    iframeRef,
    initReviewKit,
    isListVisible,
    mode,
    refreshTargetFigmaConfig,
    setSectionOutlineWithDefaultCollapse,
    sidePanel
  ]);
  (0, import_react24.useEffect)(() => {
    const frame = window.requestAnimationFrame(bindSourceOpenShortcut);
    return () => window.cancelAnimationFrame(frame);
  }, [bindSourceOpenShortcut, targetSrc]);
  const clearSelectedReviewItem = (0, import_react24.useCallback)(() => {
    clearSelectedItem();
    updateShellUrl(targetRef.current, sizeRef.current, source);
  }, [clearSelectedItem, sizeRef, source, targetRef]);
  const withItemMutation = async (itemId, action) => {
    setMutatingItemIds((currentIds) => {
      const nextIds = new Set(currentIds);
      nextIds.add(itemId);
      return nextIds;
    });
    try {
      return await action();
    } finally {
      setMutatingItemIds((currentIds) => {
        const nextIds = new Set(currentIds);
        nextIds.delete(itemId);
        return nextIds;
      });
    }
  };
  const showItemMutationError = (error, fallback) => {
    showToast(
      error instanceof Error && error.message ? error.message : fallback
    );
  };
  const changeReviewSource = (nextSource) => {
    if (!sourceEntries.some((entry) => entry.label === nextSource)) return;
    cancelReviewMode();
    clearSelectedItem();
    setItems([]);
    setSource(nextSource);
    updateShellUrl(targetRef.current, sizeRef.current, nextSource);
  };
  const changeItemStatus = async (item, nextStatus) => {
    try {
      await withItemMutation(
        item.id,
        () => updateReviewItemStatus({
          activeAdapterEntry,
          item,
          nextStatus,
          onRefreshReviewData: refreshReviewData2,
          onToast: showToast
        })
      );
    } catch (error) {
      showItemMutationError(error, "QA status update failed");
    }
  };
  const changeItemAssignee = async (item, assigneeId) => {
    try {
      await withItemMutation(
        item.id,
        () => updateReviewItemAssignee({
          activeAdapterEntry,
          item,
          assigneeId,
          onRefreshReviewData: refreshReviewData2,
          onToast: showToast
        })
      );
    } catch (error) {
      showItemMutationError(error, "QA assignee update failed");
    }
  };
  const saveItemDetails = async (item, patch) => {
    try {
      await withItemMutation(
        item.id,
        () => updateReviewItemDetails({
          activeAdapterEntry,
          fields: activeAdapterEntry.fields,
          item,
          ...patch,
          onRefreshReviewData: refreshReviewData2,
          onToast: showToast
        })
      );
      setEditingItem(null);
    } catch (error) {
      showItemMutationError(error, "QA update failed");
      throw error;
    }
  };
  const submitItem = async (numberedItem) => {
    try {
      await withItemMutation(
        numberedItem.item.id,
        () => submitReviewItem({
          localAdapterEntry,
          numberedItem,
          remoteAdapterEntry,
          selectedItemIdRef,
          onClearSelectedItem: clearSelectedItem,
          onRefreshReviewData: refreshReviewData2,
          onToast: showToast
        })
      );
    } catch (error) {
      showItemMutationError(error, "QA submit failed");
    }
  };
  const copyPrompt = (value, key, toastMessage2 = "Prompt copied") => copyReviewPrompt({
    key,
    toastMessage: toastMessage2,
    value,
    onCopiedPromptKeyChange: setCopiedPromptKey,
    onToast: showToast
  });
  const copyItemPrompt = (numberedItem) => copyPrompt(
    buildReviewItemPrompt(numberedItem, reviewPathPrefix),
    `qa:${numberedItem.item.id}`,
    "QA prompt copied"
  );
  const copyItemLabel = (numberedItem) => copyPrompt(
    numberedItem.displayLabel,
    `label:${numberedItem.item.id}`,
    "QA number copied"
  );
  const copyItemLink = (numberedItem) => {
    const { item } = numberedItem;
    return copyPrompt(
      getShellUrlForItem(
        getItemFrameTarget(item, reviewPathPrefix),
        getRestoredSize(item, viewportPresets),
        item.id,
        source
      ).href,
      `link:${item.id}`,
      "QA link copied"
    );
  };
  const copyRemoteIssuePath = (item) => {
    const path = getUrlPathWithoutOrigin(item.externalIssueUrl);
    if (!path) {
      showToast("QA link not found");
      return Promise.resolve();
    }
    return copyPrompt(path, `remote-link:${item.id}`, "QA path copied");
  };
  const removeItem = async (item) => {
    try {
      await withItemMutation(
        item.id,
        () => removeReviewItem({
          activeAdapterEntry,
          isRemoteSource,
          item,
          selectedItemIdRef,
          sizeRef,
          source,
          targetRef,
          onClearSelectedItem: clearSelectedItem,
          onRefreshReviewData: refreshReviewData2,
          onToast: showToast
        })
      );
    } catch (error) {
      showItemMutationError(error, "QA delete failed");
    }
  };
  const figmaImageOverlays = createReviewTargetFigmaImageOverlays({
    imageOverlayStates: figmaImageOverlayStates,
    images: figmaImageList
  });
  return /* @__PURE__ */ (0, import_jsx_runtime26.jsxs)(
    "div",
    {
      className: `df-review-shell is-theme-${effectiveReviewTheme}${isListVisible ? " is-list-visible" : ""}`,
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime26.jsx)(
          ReviewTopbar,
          {
            draftTarget,
            copyLabel,
            viewportPresets,
            size,
            presetScopeCounts,
            isRulerAvailable,
            isRulerVisible,
            targetOverlayState,
            figmaOverlayUnavailableMessage: isFigmaImageManagementEnabled ? "No Figma images on this viewport." : void 0,
            isFigmaOverlayActive: isFigmaImageManagementEnabled ? isAnyFigmaImageOverlayVisible : targetOverlayState.figma,
            isFigmaOverlayAvailable: isFigmaImageManagementEnabled ? figmaImageList.length > 0 : isFigmaOverlayAvailable,
            onDraftTargetChange: setDraftTarget,
            onApplyTarget: applyTarget,
            onOpenSitemap: () => setIsSitemapOpen(true),
            onCopyCurrentUrl: () => void copyCurrentUrl(),
            onSizeChange: setSize,
            onToggleFigmaOverlay: isFigmaImageManagementEnabled ? toggleAllFigmaImageOverlayVisible : () => toggleTargetOverlay("figma"),
            onToggleRuler: toggleRuler,
            onToggleTargetOverlay: toggleTargetOverlay
          }
        ),
        isSitemapOpen && /* @__PURE__ */ (0, import_jsx_runtime26.jsx)(
          SitemapModal,
          {
            pages,
            activeRoute,
            allQaCount,
            isAllQaVisible,
            pageQaCounts,
            pagePresenceUsers,
            getPageTarget: (href) => normalizeTarget(href, reviewPathPrefix),
            onClose: () => setIsSitemapOpen(false),
            onSelectAllQa: selectAllQa,
            onSelectPage: selectPage
          }
        ),
        isFigmaSettingsOpen && /* @__PURE__ */ (0, import_jsx_runtime26.jsx)(
          ReviewSettingsModal,
          {
            figmaTokenDraft,
            reviewUserIdDraft,
            reviewThemeDraft,
            figmaSettingsStatus,
            isFigmaTokenVisible,
            isFigmaTokenGuideOpen,
            onClose: closeFigmaSettings,
            onFigmaTokenDraftChange: setFigmaTokenDraft,
            onReviewUserIdDraftChange: setReviewUserIdDraft,
            onReviewThemeDraftChange: setReviewThemeDraft,
            onClearStatus: () => setFigmaSettingsStatus(""),
            onToggleFigmaTokenVisible: () => setIsFigmaTokenVisible((current) => !current),
            onToggleFigmaTokenGuide: () => setIsFigmaTokenGuideOpen((current) => !current),
            onSave: saveReviewSettings
          }
        ),
        isInitialPromptOpen && /* @__PURE__ */ (0, import_jsx_runtime26.jsx)(PromptModal, { onClose: closePromptModal }),
        isInitialPromptScriptOpen && /* @__PURE__ */ (0, import_jsx_runtime26.jsx)(
          InitialPromptModal,
          {
            initialPromptText,
            copiedPromptKey,
            onClose: () => setIsInitialPromptScriptOpen(false),
            onCopyPrompt: (text, key) => void copyPrompt(text, key)
          }
        ),
        editingItem && /* @__PURE__ */ (0, import_jsx_runtime26.jsx)(
          QaItemEditModal,
          {
            fields: activeAdapterEntry.fields,
            item: editingItem,
            onClose: () => setEditingItem(null),
            onSave: saveItemDetails
          }
        ),
        toastMessage && /* @__PURE__ */ (0, import_jsx_runtime26.jsx)("div", { className: "df-review-copy-toast", role: "status", children: toastMessage }),
        /* @__PURE__ */ (0, import_jsx_runtime26.jsxs)("div", { className: "df-review-side-rail", children: [
          /* @__PURE__ */ (0, import_jsx_runtime26.jsx)(
            "button",
            {
              "aria-label": isQaPanelVisible ? "Hide QA list" : "Show QA list",
              "aria-pressed": isQaPanelVisible,
              className: `df-review-side-toggle${isQaPanelVisible ? " is-active" : ""}`,
              type: "button",
              onClick: toggleQaPanel,
              title: "QA",
              children: /* @__PURE__ */ (0, import_jsx_runtime26.jsx)("span", { "aria-hidden": "true", children: /* @__PURE__ */ (0, import_jsx_runtime26.jsx)(SquareCheckBig, {}) })
            }
          ),
          isSourceInspectorEnabled && /* @__PURE__ */ (0, import_jsx_runtime26.jsx)(
            "button",
            {
              "aria-controls": "df-review-section-outline",
              "aria-label": isSourceTreePanelVisible ? "Hide source tree" : "Show source tree",
              "aria-pressed": isSourceTreePanelVisible,
              className: `df-review-side-toggle${isSourceTreePanelVisible ? " is-active" : ""}`,
              type: "button",
              onClick: toggleSourceTreePanel,
              title: "Source Tree",
              children: /* @__PURE__ */ (0, import_jsx_runtime26.jsx)("span", { "aria-hidden": "true", children: /* @__PURE__ */ (0, import_jsx_runtime26.jsx)(Images, {}) })
            }
          ),
          isFigmaImageManagementEnabled && /* @__PURE__ */ (0, import_jsx_runtime26.jsx)(
            "button",
            {
              "aria-label": isFigmaImagesPanelVisible ? "Hide Figma images" : "Show Figma images",
              "aria-pressed": isFigmaImagesPanelVisible,
              className: `df-review-side-toggle${isFigmaImagesPanelVisible ? " is-active" : ""}`,
              type: "button",
              onClick: toggleFigmaImagesPanel,
              title: "Figma Images",
              children: /* @__PURE__ */ (0, import_jsx_runtime26.jsx)("span", { "aria-hidden": "true", children: /* @__PURE__ */ (0, import_jsx_runtime26.jsx)(FigmaRailIcon, {}) })
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime26.jsxs)("div", { className: "df-review-side-actions", children: [
            /* @__PURE__ */ (0, import_jsx_runtime26.jsx)(
              "button",
              {
                "aria-label": "Open initial prompt",
                className: "df-review-side-toggle",
                type: "button",
                onClick: () => setIsInitialPromptScriptOpen(true),
                title: "Initial prompt",
                children: /* @__PURE__ */ (0, import_jsx_runtime26.jsx)("span", { "aria-hidden": "true", children: /* @__PURE__ */ (0, import_jsx_runtime26.jsx)(Bot, {}) })
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime26.jsx)(
              "button",
              {
                "aria-label": "Open settings",
                className: "df-review-side-toggle",
                type: "button",
                onClick: openFigmaSettings,
                title: "Settings",
                children: /* @__PURE__ */ (0, import_jsx_runtime26.jsx)("span", { "aria-hidden": "true", children: /* @__PURE__ */ (0, import_jsx_runtime26.jsx)(Settings, {}) })
              }
            ),
            currentPagePresenceUsers.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime26.jsx)(
              PresenceOverlay,
              {
                presenceSessionId,
                users: currentPagePresenceUsers
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime26.jsx)("span", { className: "df-review-side-divider", "aria-hidden": "true" }),
            /* @__PURE__ */ (0, import_jsx_runtime26.jsx)(
              "button",
              {
                "aria-label": "Open about",
                className: "df-review-side-toggle",
                type: "button",
                onClick: () => {
                  setIsInitialPromptOpen(true);
                },
                title: "About",
                children: /* @__PURE__ */ (0, import_jsx_runtime26.jsx)("span", { "aria-hidden": "true", children: /* @__PURE__ */ (0, import_jsx_runtime26.jsx)(DfLogoIcon, {}) })
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime26.jsx)(
          ReviewQaPanel,
          {
            activeAdapterEntry,
            activeItems,
            activeRemainingItemCount,
            currentPresetScope,
            filteredNumberedActiveItems,
            getItemPresetScope,
            hiddenOverlayItemIds,
            isListVisible: isQaPanelVisible,
            isAllQaVisible,
            isLoading: isItemsLoading,
            isRemoteSource,
            mutatingItemIds,
            copiedPromptKey,
            qaFilter,
            qaFilterCounts,
            qaStatusFilter,
            qaStatusFilterCounts,
            remoteAdapterEntry,
            selectedItemId,
            showSourceSelect,
            source,
            sourceEntries,
            fields: activeAdapterEntry.fields,
            assigneeTitle: activeAdapterEntry.assigneeTitle,
            onChangeItemStatus: changeItemStatus,
            onClearSelectedItem: clearSelectedReviewItem,
            onChangeItemAssignee: changeItemAssignee,
            onChangeReviewSource: changeReviewSource,
            onCopyItemLabel: (numberedItem) => void copyItemLabel(numberedItem),
            onCopyItemLink: (numberedItem) => void copyItemLink(numberedItem),
            onCopyItemPrompt: (numberedItem) => void copyItemPrompt(numberedItem),
            onCopyRemoteIssuePath: copyRemoteIssuePath,
            onEditItem: setEditingItem,
            onQaFilterChange: setQaFilter,
            onQaStatusFilterChange: setQaStatusFilter,
            onRefreshReviewData: refreshReviewData2,
            onRemoveItem: removeItem,
            onRestoreReviewItem: restoreReviewItem,
            onSubmitItem: submitItem,
            onToggleItemOverlayVisibility: toggleItemOverlayVisibility
          }
        ),
        isFigmaImageManagementEnabled && /* @__PURE__ */ (0, import_jsx_runtime26.jsx)(
          FigmaImagesPanel,
          {
            error: figmaImageError,
            imageOverlayStates: figmaImageOverlayStates,
            images: figmaImageList,
            isListVisible: isFigmaImagesPanelVisible,
            isLoading: isFigmaImageLoading,
            isMutating: isFigmaImageMutating,
            selectedImageId: selectedFigmaImageId,
            onAddImage: addFigmaImage,
            onDeleteImage: deleteFigmaImage,
            onRefreshImages: refreshFigmaImages,
            onReorderImages: reorderFigmaImages,
            onSelectImage: setSelectedFigmaImageId,
            onSetImageOverlayOffsetY: setFigmaImageOverlayOffsetY,
            onSetImageOverlayOpacity: setFigmaImageOverlayOpacity,
            onToggleImageOverlayLocked: toggleFigmaImageOverlayLocked,
            onToggleImageOverlayMode: toggleFigmaImageOverlayMode,
            onToggleImageOverlayVisible: toggleFigmaImageOverlayVisible,
            onUpdateImage: updateFigmaImage
          }
        ),
        isSourceInspectorEnabled && /* @__PURE__ */ (0, import_jsx_runtime26.jsx)(
          SectionOutlinePanel,
          {
            isPanelVisible: isSourceTreePanelVisible,
            isFiltering: isSectionOutlineFiltering,
            filteredCount: filteredSectionOutlineCount,
            totalCount: sectionOutlineTotalCount,
            rootCount: sectionOutline?.length ?? 0,
            filter: sectionOutlineFilter,
            entries: filteredSectionOutline,
            collapsedIds: collapsedSectionOutlineIds,
            canWriteDom,
            isBoxMetaVisible: isSectionOutlineBoxMetaVisible,
            isFontMetaVisible: isSectionOutlineFontMetaVisible,
            isMediaMetaVisible: isSectionOutlineMediaMetaVisible,
            isClassMetaVisible: isSectionOutlineClassMetaVisible,
            onToggleMeta: updateSectionOutlineMetaVisibility,
            onFilterChange: updateSectionOutlineFilter,
            onToggleEntry: toggleSectionOutlineEntry,
            onScrollToSection: scrollToSection,
            onOpenData: openSectionData,
            onOpenSource: openSectionSource,
            onStartDomReview: startSectionDomReview,
            onHoverElement: showSourceOutlineForElement,
            onClearHover: clearSourceOutlineHover
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime26.jsx)(
          ReviewTargetFrame,
          {
            canWriteArea,
            canWriteDom,
            figmaImageOverlays,
            frameScrollRef,
            iframeRef,
            isRulerAvailable,
            isRulerDragging,
            isRulerVisible,
            mode,
            rulerHover,
            rulerMeasure,
            rulerMeasureLabel,
            rulerOverlayRef,
            rulerScaleX,
            rulerScaleY,
            rulerUnit,
            size,
            targetSrc,
            onLoadTarget: loadTargetFrame,
            onSetFigmaImageOverlayOffsetY: setFigmaImageOverlayOffsetY,
            onSetReviewMode: setReviewMode
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime26.jsx)(
          SourceInspectorOverlay,
          {
            state: sourceInspectorState,
            interactionRef: sourceInspectorInteractionRef,
            onClear: clearSourceInspector,
            onOpenCandidate: openSourceCandidate
          }
        )
      ]
    }
  );
};
function getUrlPathWithoutOrigin(value) {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  try {
    const url = new URL(trimmed, window.location.origin);
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return trimmed;
  }
}

// src/react-shell/figma/dev-overlay.tsx
var import_react25 = __toESM(require("react"), 1);
var import_client = require("react-dom/client");
var import_jsx_runtime27 = require("react/jsx-runtime");
var FIGMA_DEV_OVERLAY_ROOT_ID = "df-review-figma-dev-overlay-root";
var FIGMA_DEV_OVERLAY_MOUNT_ID = "df-review-figma-dev-overlay-mount";
var mountFigmaDevOverlay = (options) => {
  if (typeof document === "undefined" || !document.body) {
    return { destroy: () => void 0 };
  }
  const rootId = options.rootId ?? FIGMA_DEV_OVERLAY_ROOT_ID;
  document.getElementById(rootId)?.remove();
  const host = document.createElement("div");
  host.id = rootId;
  host.style.display = "contents";
  const shadow = host.attachShadow({ mode: "open" });
  const style = document.createElement("style");
  style.textContent = figmaDevOverlayStyle;
  const mountNode = document.createElement("div");
  mountNode.id = FIGMA_DEV_OVERLAY_MOUNT_ID;
  shadow.append(style, mountNode);
  document.body.appendChild(host);
  const root = (0, import_client.createRoot)(mountNode);
  root.render(
    /* @__PURE__ */ (0, import_jsx_runtime27.jsx)(import_react25.default.StrictMode, { children: /* @__PURE__ */ (0, import_jsx_runtime27.jsx)(FigmaDevOverlayWidget, { ...options }) })
  );
  return {
    destroy() {
      root.unmount();
      host.remove();
      removeTargetFigmaImageOverlays(document);
    }
  };
};
var FigmaDevOverlayWidget = ({
  figmaImages,
  pageUrl,
  presets = DEFAULT_REVIEW_VIEWPORT_PRESETS,
  projectId,
  reviewPathPrefix
}) => {
  const figmaImageStore = getReviewFigmaImageStore(figmaImages);
  const viewport = useCurrentViewport();
  const currentPageUrl = useCurrentPageUrl(pageUrl, reviewPathPrefix);
  const viewportBoundaries = (0, import_react25.useMemo)(
    () => getFigmaDevViewportBoundaries(presets),
    [presets]
  );
  const matchedViewportMatch = (0, import_react25.useMemo)(
    () => findBoundaryFigmaDevViewportMatch(presets, viewport.width),
    [presets, viewport.width]
  );
  const matchedViewport = matchedViewportMatch?.preset ?? null;
  const activeViewport = matchedViewport ?? viewportBoundaries?.minPreset ?? presets[0] ?? DEFAULT_REVIEW_VIEWPORT_PRESETS[0];
  const {
    error,
    images,
    imageOverlayStates,
    isAnyImageOverlayVisible,
    isLoading,
    selectedImageId,
    setImageOverlayOffsetY,
    setImageOverlayOpacity,
    setSelectedImageId,
    toggleImageOverlayLocked,
    toggleImageOverlayMode,
    toggleImageOverlayVisible
  } = useReviewFigmaImages({
    imageFormat: figmaImages?.imageFormat ?? DEFAULT_REVIEW_FIGMA_IMAGE_FORMAT,
    pageUrl: currentPageUrl,
    projectId,
    store: matchedViewport ? figmaImageStore : null,
    viewport: activeViewport
  });
  const [isPanelOpen, setIsPanelOpen] = (0, import_react25.useState)(false);
  const [isWidgetVisible, setIsWidgetVisible] = (0, import_react25.useState)(false);
  const [offsetYDraftByImageId, setOffsetYDraftByImageId] = (0, import_react25.useState)({});
  const selectedImage = selectedImageId ? images.find((image) => image.id === selectedImageId) ?? null : null;
  const selectedImageIndex = selectedImage ? images.indexOf(selectedImage) : -1;
  const selectedImageLabel = selectedImage ? getFigmaImageLabel(selectedImage, selectedImageIndex) : "Figma layer";
  const selectedOverlayState = selectedImage ? imageOverlayStates[selectedImage.id] ?? DEFAULT_FIGMA_IMAGE_LAYER_STATE : DEFAULT_FIGMA_IMAGE_LAYER_STATE;
  const selectedOpacityPercent = selectedImage ? getSnappedOpacityPercent(selectedOverlayState.opacity) : 0;
  const selectedOffsetYDraft = selectedImage ? offsetYDraftByImageId[selectedImage.id] ?? String(selectedOverlayState.offsetY) : "";
  const figmaImageOverlays = (0, import_react25.useMemo)(
    () => createReviewTargetFigmaImageOverlays({
      imageOverlayStates,
      images
    }),
    [imageOverlayStates, images]
  );
  (0, import_react25.useEffect)(() => {
    if (!isWidgetVisible || !matchedViewport) {
      removeTargetFigmaImageOverlays(document);
      return;
    }
    renderTargetFigmaImageOverlays({
      onSetOverlayOffsetY: setImageOverlayOffsetY,
      overlays: figmaImageOverlays,
      size: matchedViewport,
      targetDocument: document
    });
  }, [
    figmaImageOverlays,
    isWidgetVisible,
    matchedViewport,
    setImageOverlayOffsetY
  ]);
  (0, import_react25.useEffect)(
    () => () => {
      removeTargetFigmaImageOverlays(document);
    },
    []
  );
  (0, import_react25.useEffect)(() => {
    const handleKeyDown = (event) => {
      if (!event.shiftKey || event.metaKey || event.ctrlKey || event.altKey || event.code !== "KeyF" && event.key.toLowerCase() !== "f" || isEditableFigmaDevOverlayEventTarget(event)) {
        return;
      }
      event.preventDefault();
      setIsPanelOpen(false);
      setIsWidgetVisible((currentVisible) => !currentVisible);
    };
    document.addEventListener("keydown", handleKeyDown, true);
    return () => document.removeEventListener("keydown", handleKeyDown, true);
  }, []);
  if (!figmaImageStore) return null;
  if (!isWidgetVisible) return null;
  const updateSelectedImageOpacity = (value) => {
    if (!selectedImage) return;
    const opacityPercent = Math.max(
      0,
      Math.min(100, Math.round(Number(value) / 10) * 10)
    );
    if (Number.isFinite(opacityPercent)) {
      setImageOverlayOpacity(selectedImage.id, opacityPercent / 100);
    }
  };
  return /* @__PURE__ */ (0, import_jsx_runtime27.jsxs)(
    "aside",
    {
      "aria-label": "Figma overlay",
      className: `df-review-figma-dev-widget${isPanelOpen ? " is-open" : ""}${isAnyImageOverlayVisible ? " is-active" : ""}`,
      children: [
        isPanelOpen && /* @__PURE__ */ (0, import_jsx_runtime27.jsxs)("div", { className: "df-review-figma-dev-panel", children: [
          /* @__PURE__ */ (0, import_jsx_runtime27.jsxs)("div", { className: "df-review-figma-dev-panel-header", children: [
            /* @__PURE__ */ (0, import_jsx_runtime27.jsx)("strong", { children: "Figma" }),
            /* @__PURE__ */ (0, import_jsx_runtime27.jsx)("span", { children: matchedViewportMatch ? `${matchedViewportMatch.label} \xB7 ${matchedViewportMatch.rangeLabel}` : `${viewport.width}px` })
          ] }),
          selectedImage && /* @__PURE__ */ (0, import_jsx_runtime27.jsxs)("div", { className: "df-review-figma-dev-selected-controls", children: [
            /* @__PURE__ */ (0, import_jsx_runtime27.jsxs)("label", { className: "df-review-figma-dev-opacity-control", children: [
              /* @__PURE__ */ (0, import_jsx_runtime27.jsx)("span", { children: "Opacity" }),
              /* @__PURE__ */ (0, import_jsx_runtime27.jsx)(
                "input",
                {
                  "aria-label": `${selectedImageLabel} overlay opacity`,
                  max: "100",
                  min: "0",
                  step: "10",
                  type: "range",
                  value: selectedOpacityPercent,
                  onChange: (event) => updateSelectedImageOpacity(event.currentTarget.value),
                  onInput: (event) => updateSelectedImageOpacity(event.currentTarget.value)
                }
              ),
              /* @__PURE__ */ (0, import_jsx_runtime27.jsx)("strong", { children: selectedOpacityPercent })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime27.jsxs)("label", { className: "df-review-figma-dev-y-control", children: [
              /* @__PURE__ */ (0, import_jsx_runtime27.jsx)(MoveVertical, { "aria-hidden": "true" }),
              /* @__PURE__ */ (0, import_jsx_runtime27.jsx)(
                "input",
                {
                  "aria-label": `${selectedImageLabel} overlay Y offset`,
                  inputMode: "numeric",
                  step: "1",
                  type: "number",
                  value: selectedOffsetYDraft,
                  onBlur: () => {
                    setOffsetYDraftByImageId((currentDrafts) => {
                      const nextDrafts = { ...currentDrafts };
                      delete nextDrafts[selectedImage.id];
                      return nextDrafts;
                    });
                  },
                  onChange: (event) => {
                    const value = event.currentTarget.value;
                    const offsetY = Number(value);
                    setOffsetYDraftByImageId((currentDrafts) => ({
                      ...currentDrafts,
                      [selectedImage.id]: value
                    }));
                    if (value.trim() !== "" && Number.isFinite(offsetY)) {
                      setImageOverlayOffsetY(selectedImage.id, offsetY);
                    }
                  }
                }
              )
            ] })
          ] }),
          error && /* @__PURE__ */ (0, import_jsx_runtime27.jsx)("p", { className: "df-review-figma-dev-status", children: error }),
          !matchedViewport ? /* @__PURE__ */ (0, import_jsx_runtime27.jsxs)("p", { className: "df-review-figma-dev-empty", children: [
            "No Figma layers for this viewport.",
            viewportBoundaries ? ` Mobile ${viewportBoundaries.mobileRangeLabel} / Full width ${viewportBoundaries.fullWidthRangeLabel}` : ""
          ] }) : isLoading ? /* @__PURE__ */ (0, import_jsx_runtime27.jsx)("p", { className: "df-review-figma-dev-status", children: "Loading..." }) : images.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime27.jsx)("p", { className: "df-review-figma-dev-empty", children: "No Figma layers for this viewport." }) : /* @__PURE__ */ (0, import_jsx_runtime27.jsx)("div", { className: "df-review-figma-dev-list", children: images.map((image, index) => {
            const imageLabel = getFigmaImageLabel(image, index);
            const overlayState = imageOverlayStates[image.id] ?? DEFAULT_FIGMA_IMAGE_LAYER_STATE;
            return /* @__PURE__ */ (0, import_jsx_runtime27.jsxs)(
              "article",
              {
                className: `df-review-figma-dev-row${image.id === selectedImageId ? " is-active" : ""}`,
                role: "button",
                tabIndex: 0,
                onClick: () => setSelectedImageId(image.id),
                onKeyDown: (event) => {
                  if (event.key !== "Enter" && event.key !== " ") return;
                  event.preventDefault();
                  setSelectedImageId(image.id);
                },
                children: [
                  /* @__PURE__ */ (0, import_jsx_runtime27.jsx)(
                    FigmaImageLayerStateButtons,
                    {
                      imageLabel,
                      overlayState,
                      title: getFigmaImageLayerStatusLabel(overlayState),
                      onSelect: () => setSelectedImageId(image.id),
                      onToggleLocked: () => toggleImageOverlayLocked(image.id),
                      onToggleMode: () => toggleImageOverlayMode(image.id),
                      onToggleVisible: () => toggleImageOverlayVisible(image.id)
                    }
                  ),
                  /* @__PURE__ */ (0, import_jsx_runtime27.jsxs)("span", { className: "df-review-figma-dev-row-main", children: [
                    /* @__PURE__ */ (0, import_jsx_runtime27.jsx)("strong", { children: imageLabel }),
                    /* @__PURE__ */ (0, import_jsx_runtime27.jsx)("small", { children: formatFigmaImageDate(image.updatedAt) })
                  ] })
                ]
              },
              image.id
            );
          }) })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime27.jsx)("div", { className: "df-review-figma-dev-bar", children: /* @__PURE__ */ (0, import_jsx_runtime27.jsxs)(
          "button",
          {
            "aria-expanded": isPanelOpen,
            "aria-label": isPanelOpen ? "Hide Figma layer controls" : "Show Figma layer controls",
            className: "df-review-figma-dev-button is-figma",
            title: isPanelOpen ? "Hide layers" : "Show layers",
            type: "button",
            onClick: () => setIsPanelOpen((isOpen) => !isOpen),
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime27.jsx)(FigmaMarkIcon, {}),
              /* @__PURE__ */ (0, import_jsx_runtime27.jsx)("span", { className: "df-review-figma-dev-button-count", children: images.length })
            ]
          }
        ) })
      ]
    }
  );
};
function useCurrentPageUrl(pageUrl, reviewPathPrefix) {
  const [currentPageUrl, setCurrentPageUrl] = (0, import_react25.useState)(
    () => getFigmaDevOverlayPageUrl(pageUrl, reviewPathPrefix)
  );
  (0, import_react25.useEffect)(() => {
    const updatePageUrl = () => {
      setCurrentPageUrl(getFigmaDevOverlayPageUrl(pageUrl, reviewPathPrefix));
    };
    window.addEventListener("popstate", updatePageUrl);
    window.addEventListener("hashchange", updatePageUrl);
    return () => {
      window.removeEventListener("popstate", updatePageUrl);
      window.removeEventListener("hashchange", updatePageUrl);
    };
  }, [pageUrl, reviewPathPrefix]);
  return currentPageUrl;
}
function isEditableFigmaDevOverlayEventTarget(event) {
  const path = event.composedPath?.() ?? [];
  const element = path[0] ?? event.target;
  if (!element || typeof element.tagName !== "string") return false;
  const tagName = element.tagName;
  return tagName === "INPUT" || tagName === "TEXTAREA" || tagName === "SELECT" || element.isContentEditable === true;
}
function useCurrentViewport() {
  const [viewport, setViewport] = (0, import_react25.useState)(getCurrentViewportSize);
  (0, import_react25.useEffect)(() => {
    const updateViewport = () => setViewport(getCurrentViewportSize());
    window.addEventListener("resize", updateViewport);
    window.addEventListener("orientationchange", updateViewport);
    window.visualViewport?.addEventListener("resize", updateViewport);
    return () => {
      window.removeEventListener("resize", updateViewport);
      window.removeEventListener("orientationchange", updateViewport);
      window.visualViewport?.removeEventListener("resize", updateViewport);
    };
  }, []);
  return viewport;
}
function getCurrentViewportSize() {
  return {
    height: Math.round(window.innerHeight),
    width: Math.round(window.innerWidth)
  };
}
function getFigmaDevOverlayPageUrl(pageUrl, reviewPathPrefix) {
  if (typeof pageUrl === "function") return pageUrl();
  if (typeof pageUrl === "string") return pageUrl;
  return normalizeTarget(
    `${window.location.pathname}${window.location.search}${window.location.hash}`,
    reviewPathPrefix
  );
}
function findBoundaryFigmaDevViewportMatch(presets, width) {
  const boundaries = getFigmaDevViewportBoundaries(presets);
  if (!boundaries) return null;
  if (width <= boundaries.minPreset.width) {
    return {
      label: "Mobile",
      preset: boundaries.minPreset,
      rangeLabel: boundaries.mobileRangeLabel
    };
  }
  if (width >= boundaries.maxPreset.width) {
    return {
      label: "Full width",
      preset: boundaries.maxPreset,
      rangeLabel: boundaries.fullWidthRangeLabel
    };
  }
  return null;
}
function getFigmaDevViewportBoundaries(presets) {
  if (presets.length === 0) return null;
  const sortedPresets = [...presets].sort((a, b) => a.width - b.width);
  const minPreset = sortedPresets[0];
  const maxPreset = sortedPresets[sortedPresets.length - 1];
  return {
    fullWidthRangeLabel: `>= ${maxPreset.width}px`,
    maxPreset,
    minPreset,
    mobileRangeLabel: `<= ${minPreset.width}px`
  };
}
var figmaDevOverlayStyle = `
  :host {
    all: initial;
    color-scheme: dark;
    font-family:
      Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont,
      "Segoe UI", sans-serif;
    --df-review-figma-dev-bg: rgba(15, 18, 24, 0.94);
    --df-review-figma-dev-panel: rgba(19, 24, 33, 0.96);
    --df-review-figma-dev-control: #202938;
    --df-review-figma-dev-control-hover: #273345;
    --df-review-figma-dev-border: rgba(226, 233, 245, 0.16);
    --df-review-figma-dev-border-soft: rgba(226, 233, 245, 0.09);
    --df-review-figma-dev-text: #edf3fb;
    --df-review-figma-dev-muted: rgba(237, 243, 251, 0.58);
    --df-review-figma-dev-subtle: rgba(237, 243, 251, 0.42);
    --df-review-figma-dev-accent: #7cc7ff;
    --df-review-figma-dev-accent-soft: rgba(124, 199, 255, 0.16);
  }

  * {
    box-sizing: border-box;
  }

  .df-review-figma-dev-widget {
    position: fixed;
    right: calc(16px + env(safe-area-inset-right));
    bottom: calc(16px + env(safe-area-inset-bottom));
    z-index: 2147483200;
    display: grid;
    justify-items: end;
    gap: 8px;
    color: var(--df-review-figma-dev-text);
    font-size: 13px;
    line-height: 1.25;
    pointer-events: none;
  }

  .df-review-figma-dev-panel,
  .df-review-figma-dev-bar {
    pointer-events: auto;
  }

  .df-review-figma-dev-panel {
    display: grid;
    gap: 8px;
    width: min(360px, calc(100vw - 32px - env(safe-area-inset-left) - env(safe-area-inset-right)));
    max-height: min(460px, calc(100vh - 96px - env(safe-area-inset-top) - env(safe-area-inset-bottom)));
    overflow: hidden;
    border: 1px solid var(--df-review-figma-dev-border);
    border-radius: 8px;
    padding: 10px;
    background: var(--df-review-figma-dev-panel);
    box-shadow: 0 18px 48px rgba(0, 0, 0, 0.34);
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
  }

  .df-review-figma-dev-panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    min-width: 0;
  }

  .df-review-figma-dev-panel-header strong {
    font-size: 14px;
    font-weight: 700;
  }

  .df-review-figma-dev-panel-header span,
  .df-review-figma-dev-status,
  .df-review-figma-dev-empty {
    color: var(--df-review-figma-dev-muted);
    font-size: 12px;
  }

  .df-review-figma-dev-selected-controls {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 84px;
    gap: 8px;
  }

  .df-review-figma-dev-opacity-control,
  .df-review-figma-dev-y-control {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
    height: 36px;
    border: 1px solid var(--df-review-figma-dev-border);
    border-radius: 8px;
    padding: 0 10px;
    background: var(--df-review-figma-dev-control);
  }

  .df-review-figma-dev-opacity-control span {
    color: var(--df-review-figma-dev-muted);
    font-size: 12px;
  }

  .df-review-figma-dev-opacity-control strong {
    min-width: 24px;
    text-align: right;
    font-size: 13px;
  }

  .df-review-figma-dev-opacity-control input[type="range"] {
    flex: 1;
    min-width: 0;
    height: 24px;
    accent-color: var(--df-review-figma-dev-accent);
  }

  .df-review-figma-dev-y-control svg {
    width: 15px;
    height: 15px;
    color: var(--df-review-figma-dev-muted);
  }

  .df-review-figma-dev-y-control input {
    width: 100%;
    min-width: 0;
    border: 0;
    padding: 0;
    color: var(--df-review-figma-dev-text);
    background: transparent;
    font: inherit;
    outline: none;
  }

  .df-review-figma-dev-status,
  .df-review-figma-dev-empty {
    margin: 0;
    border: 1px dashed var(--df-review-figma-dev-border);
    border-radius: 8px;
    padding: 12px;
  }

  .df-review-figma-dev-list {
    display: grid;
    gap: 6px;
    min-height: 0;
    overflow: auto;
  }

  .df-review-figma-dev-row {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    align-items: center;
    gap: 8px;
    width: 100%;
    min-width: 0;
    border: 1px solid var(--df-review-figma-dev-border-soft);
    border-radius: 8px;
    padding: 12px 10px;
    color: var(--df-review-figma-dev-text);
    background: rgba(237, 243, 251, 0.035);
    font: inherit;
    text-align: left;
    cursor: pointer;
    user-select: none;
    -webkit-user-select: none;
    -webkit-user-drag: none;
  }

  .df-review-figma-dev-row:hover,
  .df-review-figma-dev-row:focus-visible {
    border-color: var(--df-review-figma-dev-border);
    outline: none;
  }

  .df-review-figma-dev-row.is-active {
    border-color: var(--df-review-figma-dev-accent);
    box-shadow: inset 0 0 0 1px var(--df-review-figma-dev-accent-soft);
  }

  .df-review-figma-dev-row-main {
    display: grid;
    gap: 2px;
    min-width: 0;
  }

  .df-review-figma-dev-row-main strong {
    color: var(--df-review-figma-dev-text);
    font-size: 13px;
    font-weight: 700;
    white-space: normal;
    word-break: break-word;
  }

  .df-review-figma-dev-row-main small {
    color: var(--df-review-figma-dev-muted);
    font-size: 12px;
  }

  .df-review-figma-image-layer-state {
    display: grid;
    grid-template-columns: repeat(3, 22px);
    align-items: center;
    gap: 2px;
    min-width: 0;
    height: 24px;
  }

  .df-review-figma-image-state-button {
    display: inline-grid;
    place-items: center;
    width: 22px;
    min-width: 22px;
    height: 22px;
    min-height: 22px;
    border: 0;
    border-radius: 0;
    padding: 0;
    color: var(--df-review-figma-dev-subtle);
    background: transparent;
    box-shadow: none;
    opacity: 0.68;
    cursor: pointer;
  }

  .df-review-figma-image-state-button:hover,
  .df-review-figma-image-state-button:focus-visible {
    color: var(--df-review-figma-dev-text);
    opacity: 1;
    outline: none;
  }

  .df-review-figma-image-state-button.is-active {
    color: var(--df-review-figma-dev-accent);
    opacity: 1;
  }

  .df-review-figma-image-state-button svg {
    width: 13px;
    height: 13px;
  }

  .df-review-figma-dev-bar {
    display: inline-flex;
    align-items: center;
    pointer-events: auto;
  }

  .df-review-figma-dev-button {
    position: relative;
    display: inline-grid;
    place-items: center;
    width: 36px;
    height: 36px;
    border: 1px solid var(--df-review-figma-dev-border);
    border-radius: 8px;
    padding: 0;
    color: var(--df-review-figma-dev-muted);
    background: var(--df-review-figma-dev-control);
    box-shadow: 0 10px 24px rgba(0, 0, 0, 0.26);
    cursor: pointer;
  }

  .df-review-figma-dev-button:hover,
  .df-review-figma-dev-button:focus-visible,
  .df-review-figma-dev-widget.is-active .df-review-figma-dev-button.is-figma {
    color: var(--df-review-figma-dev-accent);
    border-color: rgba(124, 199, 255, 0.5);
    outline: none;
  }

  .df-review-figma-dev-button:disabled {
    color: var(--df-review-figma-dev-subtle);
    cursor: not-allowed;
    opacity: 0.5;
  }

  .df-review-figma-dev-button svg {
    width: 17px;
    height: 17px;
  }

  .df-review-figma-dev-button .df-review-figma-mark-icon {
    width: 17px;
    height: 17px;
    fill: currentColor;
  }

  .df-review-figma-dev-button.is-figma {
    width: 38px;
    height: 38px;
  }

  .df-review-figma-dev-button-count {
    position: absolute;
    right: -3px;
    top: -4px;
    display: inline-grid;
    place-items: center;
    min-width: 15px;
    height: 15px;
    border: 1px solid rgba(15, 18, 24, 0.86);
    border-radius: 4px;
    padding: 0 3px;
    color: currentColor;
    background: rgba(15, 18, 24, 0.92);
    font-size: 10px;
    font-weight: 700;
    line-height: 1;
  }

  .df-review-figma-dev-button.is-figma:disabled .df-review-figma-dev-button-count {
    color: var(--df-review-figma-dev-subtle);
  }

  @media (max-width: 420px) {
    .df-review-figma-dev-widget {
      right: calc(10px + env(safe-area-inset-right));
      bottom: calc(10px + env(safe-area-inset-bottom));
    }

    .df-review-figma-dev-selected-controls {
      grid-template-columns: 1fr;
    }
  }
`;

// src/react-shell/pages.ts
var escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
var normalizePageHref = (value) => {
  const href = value || "/";
  return href.startsWith("/") ? href : `/${href}`;
};
var sortReviewPages = (a, b) => {
  if (a.href === "/") return -1;
  if (b.href === "/") return 1;
  return a.href.localeCompare(b.href);
};
var createReviewPagesFromGlob = (entries, options = {}) => {
  const root = options.root ?? "/page";
  const rootPattern = root ? new RegExp(`^${escapeRegExp(root)}`) : null;
  return Object.keys(entries).map((key) => {
    const withoutRoot = rootPattern ? key.replace(rootPattern, "") : key;
    const href = withoutRoot.replace(/index\.(tsx|ts|jsx|js)$/, "");
    return normalizePageHref(href === "" ? "/" : href);
  }).filter((href) => !options.exclude?.(href)).sort((a, b) => sortReviewPages({ href: a }, { href: b })).map((href) => ({ href }));
};

// src/react-shell/presence/supabase.ts
var normalizeTopicPart = (value) => value.trim().replace(/[^a-zA-Z0-9_-]+/g, "-").replace(/^-+|-+$/g, "") || "default";
var getPresenceTopic = (channelPrefix, projectId) => `${normalizeTopicPart(channelPrefix)}-${normalizeTopicPart(projectId)}`;
var PRESENCE_BRIDGE_KEY = "__dfReviewPresenceBridge";
var isReviewPresenceUser = (value) => {
  if (!value || typeof value !== "object") return false;
  const candidate = value;
  return typeof candidate.projectId === "string" && typeof candidate.sessionId === "string" && typeof candidate.userId === "string" && typeof candidate.updatedAt === "string";
};
var flattenPresenceState = (state) => Object.values(state).flat().filter(isReviewPresenceUser);
var dedupePresenceUsers = (users) => {
  const userBySessionId = /* @__PURE__ */ new Map();
  users.forEach((user) => {
    const currentUser = userBySessionId.get(user.sessionId);
    if (!currentUser || Date.parse(user.updatedAt) >= Date.parse(currentUser.updatedAt)) {
      userBySessionId.set(user.sessionId, user);
    }
  });
  return Array.from(userBySessionId.values());
};
var sortPresenceUsers = (users, selfSessionId) => users.sort((a, b) => {
  if (a.sessionId === selfSessionId) return -1;
  if (b.sessionId === selfSessionId) return 1;
  return a.displayName.localeCompare(b.displayName);
});
var subscribeChannel = (channel) => new Promise((resolve, reject) => {
  channel.subscribe((status, error) => {
    if (status === "SUBSCRIBED") {
      resolve();
      return;
    }
    if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
      reject(error ?? new Error(`Supabase presence ${status}`));
    }
  });
});
var removeTopicChannels = async (client, topic) => {
  const existingChannels = client.getChannels?.() ?? [];
  const normalizedTopic = `realtime:${topic}`;
  const topicChannels = existingChannels.filter(
    (channel) => channel.topic === topic || channel.topic === normalizedTopic
  );
  await Promise.allSettled(
    topicChannels.map(async (channel) => {
      const result = await client.removeChannel(channel);
      if (result !== "ok") {
        channel.teardown?.();
      }
    })
  );
};
var getTopicChannel = (client, topic) => {
  const normalizedTopic = `realtime:${topic}`;
  return client.getChannels?.().find(
    (channel) => channel.topic === topic || channel.topic === normalizedTopic
  );
};
var createPresenceBridge = (client, topic, context, isPrivate) => {
  const channel = client.channel(topic, {
    config: {
      private: isPrivate,
      presence: {
        key: context.sessionId
      }
    }
  });
  const bridge = {
    channel,
    listeners: /* @__PURE__ */ new Set(),
    refCount: 0,
    getUsers: () => dedupePresenceUsers(flattenPresenceState(channel.presenceState())),
    emit: () => {
      bridge.listeners.forEach((listener) => listener());
    },
    ready: Promise.resolve()
  };
  channel[PRESENCE_BRIDGE_KEY] = bridge;
  channel.on("presence", { event: "sync" }, bridge.emit).on("presence", { event: "join" }, bridge.emit).on("presence", { event: "leave" }, bridge.emit);
  bridge.ready = subscribeChannel(channel).catch((error) => {
    delete channel[PRESENCE_BRIDGE_KEY];
    throw error;
  });
  return bridge;
};
var getPresenceBridge = async (client, topic, context, isPrivate) => {
  const existingChannel = getTopicChannel(client, topic);
  const existingBridge = existingChannel?.[PRESENCE_BRIDGE_KEY];
  if (existingBridge) return existingBridge;
  if (existingChannel) {
    await removeTopicChannels(client, topic);
  }
  return createPresenceBridge(client, topic, context, isPrivate);
};
var createSupabasePresenceAdapter = ({
  client,
  channelPrefix = "review-presence",
  private: isPrivate = false
}) => ({
  label: "supabase-presence",
  connect: async (context) => {
    const topic = getPresenceTopic(channelPrefix, context.projectId);
    const bridge = await getPresenceBridge(client, topic, context, isPrivate);
    const listeners = /* @__PURE__ */ new Set();
    let currentState = context.initialState;
    bridge.refCount += 1;
    const getUsers = () => sortPresenceUsers(
      [...bridge.getUsers()],
      context.sessionId
    );
    const emit = () => {
      const users = getUsers();
      listeners.forEach((listener) => listener(users));
    };
    const bridgeListener = () => emit();
    bridge.listeners.add(bridgeListener);
    await bridge.ready;
    await bridge.channel.track(currentState);
    bridge.emit();
    emit();
    return {
      update: async (state) => {
        currentState = {
          ...currentState,
          ...state,
          sessionId: context.sessionId,
          userId: context.userId,
          displayName: context.displayName,
          color: context.color,
          updatedAt: (/* @__PURE__ */ new Date()).toISOString()
        };
        await bridge.channel.track(currentState);
      },
      subscribe: (callback) => {
        listeners.add(callback);
        callback(getUsers());
        return () => {
          listeners.delete(callback);
        };
      },
      disconnect: async () => {
        listeners.clear();
        bridge.listeners.delete(bridgeListener);
        bridge.refCount = Math.max(0, bridge.refCount - 1);
        if (bridge.refCount > 0) return;
        delete bridge.channel[PRESENCE_BRIDGE_KEY];
        await bridge.channel.untrack();
        await client.removeChannel(bridge.channel);
      }
    };
  }
});

// src/react-shell.tsx
var import_jsx_runtime28 = require("react/jsx-runtime");
var mountReviewShell = (options) => {
  if (typeof document === "undefined" || !document.head) return;
  const { rootId = "root", ...shellProps } = options;
  ensureReviewShellStyle();
  const root = document.getElementById(rootId);
  if (!root) return;
  root.style.width = "100%";
  root.style.height = "100%";
  root.style.margin = "0";
  (0, import_client2.createRoot)(root).render(
    /* @__PURE__ */ (0, import_jsx_runtime28.jsx)(import_react26.default.StrictMode, { children: /* @__PURE__ */ (0, import_jsx_runtime28.jsx)(ReviewShell, { ...shellProps }) })
  );
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  DEFAULT_REVIEW_VIEWPORT_PRESETS,
  ReviewShell,
  createFallbackPresenceAdapter,
  createLocalPresenceAdapter,
  createReviewPagesFromGlob,
  createSupabasePresenceAdapter,
  mountFigmaDevOverlay,
  mountReviewShell
});
/*! Bundled license information:

lucide-react/dist/esm/shared/src/utils/mergeClasses.mjs:
lucide-react/dist/esm/shared/src/utils/toKebabCase.mjs:
lucide-react/dist/esm/shared/src/utils/toCamelCase.mjs:
lucide-react/dist/esm/shared/src/utils/toPascalCase.mjs:
lucide-react/dist/esm/defaultAttributes.mjs:
lucide-react/dist/esm/shared/src/utils/hasA11yProp.mjs:
lucide-react/dist/esm/context.mjs:
lucide-react/dist/esm/Icon.mjs:
lucide-react/dist/esm/createLucideIcon.mjs:
lucide-react/dist/esm/icons/bot.mjs:
lucide-react/dist/esm/icons/chevron-down.mjs:
lucide-react/dist/esm/icons/circle-question-mark.mjs:
lucide-react/dist/esm/icons/code-xml.mjs:
lucide-react/dist/esm/icons/contrast.mjs:
lucide-react/dist/esm/icons/copy.mjs:
lucide-react/dist/esm/icons/database.mjs:
lucide-react/dist/esm/icons/external-link.mjs:
lucide-react/dist/esm/icons/eye-off.mjs:
lucide-react/dist/esm/icons/eye.mjs:
lucide-react/dist/esm/icons/image.mjs:
lucide-react/dist/esm/icons/images.mjs:
lucide-react/dist/esm/icons/layout-grid.mjs:
lucide-react/dist/esm/icons/link-2.mjs:
lucide-react/dist/esm/icons/list-filter.mjs:
lucide-react/dist/esm/icons/lock-open.mjs:
lucide-react/dist/esm/icons/lock.mjs:
lucide-react/dist/esm/icons/map.mjs:
lucide-react/dist/esm/icons/maximize-2.mjs:
lucide-react/dist/esm/icons/monitor.mjs:
lucide-react/dist/esm/icons/moon.mjs:
lucide-react/dist/esm/icons/move-vertical.mjs:
lucide-react/dist/esm/icons/pencil.mjs:
lucide-react/dist/esm/icons/plus.mjs:
lucide-react/dist/esm/icons/rectangle-horizontal.mjs:
lucide-react/dist/esm/icons/refresh-cw.mjs:
lucide-react/dist/esm/icons/ruler.mjs:
lucide-react/dist/esm/icons/scan.mjs:
lucide-react/dist/esm/icons/search.mjs:
lucide-react/dist/esm/icons/settings.mjs:
lucide-react/dist/esm/icons/smartphone.mjs:
lucide-react/dist/esm/icons/square-check-big.mjs:
lucide-react/dist/esm/icons/square-dashed.mjs:
lucide-react/dist/esm/icons/square-mouse-pointer.mjs:
lucide-react/dist/esm/icons/sticky-note.mjs:
lucide-react/dist/esm/icons/sun.mjs:
lucide-react/dist/esm/icons/trash-2.mjs:
lucide-react/dist/esm/icons/type.mjs:
lucide-react/dist/esm/icons/upload.mjs:
lucide-react/dist/esm/icons/x.mjs:
lucide-react/dist/esm/lucide-react.mjs:
  (**
   * @license lucide-react v1.20.0 - ISC
   *
   * This source code is licensed under the ISC license.
   * See the LICENSE file in the root directory of this source tree.
   *)
*/
//# sourceMappingURL=react-shell.cjs.map
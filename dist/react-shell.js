import {
  REVIEW_WORKFLOW_STATUS_OPTIONS,
  createWebReviewKit,
  getNumberedReviewItems,
  normalizeReviewItemStatus
} from "./chunk-6L2KJ7XL.js";

// src/react-shell.tsx
import React2 from "react";
import { createRoot } from "react-dom/client";

// src/react-shell/style.ts
var REVIEW_SHELL_STYLE_ID = "df-review-shell-style";
function ensureReviewShellStyle() {
  if (!document.getElementById(REVIEW_SHELL_STYLE_ID)) {
    const style = document.createElement("style");
    style.id = REVIEW_SHELL_STYLE_ID;
    style.textContent = `
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
	    --df-review-font-weight-medium: 650;
	    --df-review-font-weight-bold: 700;
	    --df-review-font-weight-strong: 800;
	    --df-review-font-weight-heavy: 900;
	    --df-review-line-height-tight: 1.25;
	    --df-review-line-height-base: 1.42;
	    --df-review-line-height-relaxed: 1.55;
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
	    --df-review-control-height-lg: 38px;
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
    display: grid;
    grid-template-columns: minmax(0, 1fr) 0 32px;
    grid-template-rows: auto auto minmax(0, 1fr);
    width: 100%;
    height: 100%;
    overflow: hidden;
    transition: grid-template-columns 160ms ease;
  }

  .df-review-shell.is-list-visible {
    grid-template-columns: minmax(0, 1fr) clamp(320px, 28vw, 420px) 32px;
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

  .df-review-presence-row {
    grid-column: 1;
    grid-row: 2;
    position: relative;
    z-index: 590;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    min-width: 0;
    padding: var(--df-review-space-2) var(--df-review-frame-gutter-x);
    border-bottom: 1px solid var(--df-review-line-soft);
    background: var(--df-review-panel);
  }

		  .df-review-address {
		    display: grid;
		    grid-template-columns: auto minmax(160px, 1fr) auto auto;
		    align-items: stretch;
		    gap: var(--df-review-space-2);
		    width: 100%;
		    max-width: 1440px;
		    margin: 0 auto;
		  }

  .df-review-address input {
	    width: 100%;
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
		  .df-review-side-toggle,
		  .df-review-presets button,
		  .df-review-overlay-button,
			  .df-review-mode-button,
			  .df-review-settings-header button,
			  .df-review-prompt-header button,
			  .df-review-settings-actions button,
			  .df-review-prompt-block-header button,
			  .df-review-item-actions button {
		    min-height: var(--df-review-control-height-md);
		    border: 1px solid var(--df-review-line);
		    border-radius: var(--df-review-radius-sm);
		    background: var(--df-review-control);
	    box-shadow: var(--df-review-shadow-control);
	    color: var(--df-review-text);
	    font-size: var(--df-review-font-size-sm);
	    font-weight: 700;
	    transition: border-color 140ms ease, background 140ms ease, color 140ms ease, box-shadow 140ms ease, opacity 140ms ease;
	  }

		  .df-review-address button:hover,
	  .df-review-side-toggle:hover,
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
    grid-template-rows: auto minmax(0, 1fr);
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
  }

	  .df-review-sitemap-header span {
	    color: var(--df-review-muted);
	    font-size: var(--df-review-font-size-sm);
	    font-weight: 700;
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
	    font-weight: 800;
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
    font-weight: 850;
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
    font-weight: 720;
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
    font-weight: 650;
    line-height: 1.35;
  }

  .df-review-sitemap-row.is-folder .df-review-sitemap-path {
    color: var(--df-review-muted);
  }

  .df-review-sitemap-tree-prefix {
    flex: 0 0 auto;
    color: var(--df-review-muted);
    font-family: var(--df-review-font-mono);
    font-weight: 500;
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
    font-weight: 650;
    line-height: 1;
    text-align: right;
  }

  .df-review-sitemap-cell.is-total {
    color: var(--df-review-accent);
    font-weight: 760;
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
    font-weight: 900;
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
		  }

		  .df-review-settings-header span {
		    color: var(--df-review-muted);
		    font-size: var(--df-review-font-size-xs);
		    font-weight: 800;
		  }

		  .df-review-settings-header button {
		    display: grid;
		    place-items: center;
		    width: 34px;
		    min-width: 34px;
		    padding: 0;
		    font-size: var(--df-review-font-size-md);
		    font-weight: 800;
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
		    font-weight: 800;
		  }

		  .df-review-settings-theme-options {
		    display: inline-flex;
		    justify-content: flex-end;
		    gap: 6px;
		    min-width: 0;
		    flex-wrap: wrap;
		  }

		  .df-review-settings-theme-option {
		    min-height: 30px;
		    border: 1px solid var(--df-review-line);
		    border-radius: var(--df-review-radius-sm);
		    padding: 0 10px;
		    color: var(--df-review-muted);
		    background: var(--df-review-control);
		    box-shadow: var(--df-review-shadow-control);
		    font-size: var(--df-review-font-size-sm);
		    font-weight: 800;
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
		    font-weight: 700;
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
		    font-weight: 800;
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
    font-weight: 800;
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
    font-weight: 800;
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
			  }

			  .df-review-prompt-header span {
			    overflow: hidden;
			    color: var(--df-review-muted);
			    font-size: var(--df-review-font-size-xs);
			    font-weight: 800;
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
			    font-weight: 800;
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
			    font-weight: 900;
			  }

			  .df-review-prompt-block-header span {
			    color: var(--df-review-muted);
			    font-size: var(--df-review-font-size-xs);
			    font-weight: 800;
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
			    font-weight: 600;
			    line-height: 1.5;
			    white-space: pre;
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
			    font-weight: 900;
			  }

			  .df-review-prompt-section-header span {
			    color: var(--df-review-muted);
			    font-size: var(--df-review-font-size-xs);
			    font-weight: 800;
			  }

			  .df-review-prompt-about {
			    display: grid;
			    gap: 10px;
			    min-width: 0;
			  }

			  .df-review-prompt-about-grid {
			    display: grid;
			    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
			    gap: 10px;
			    min-width: 0;
			  }

			  .df-review-prompt-about-grid article {
			    display: grid;
			    align-content: start;
			    gap: 6px;
			    border: 1px solid var(--df-review-line);
			    border-radius: var(--df-review-radius-md);
			    padding: 12px;
			    background: var(--df-review-surface);
			  }

			  .df-review-prompt-about-grid strong {
			    color: var(--df-review-text);
			    font-size: var(--df-review-font-size-sm);
			    font-weight: 900;
			  }

			  .df-review-prompt-about-grid p {
			    margin: 0;
			    color: var(--df-review-muted);
			    font-size: var(--df-review-font-size-sm);
			    font-weight: 700;
			    line-height: 1.55;
			  }

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
		  .df-review-mode,
	  .df-review-overlays {
	    display: flex;
	    align-items: center;
	    gap: var(--df-review-space-1-5);
	    min-height: calc(var(--df-review-control-height-lg) + 6px);
	    padding: 3px;
	    border: 1px solid var(--df-review-line-soft);
	    border-radius: var(--df-review-radius-md);
	    background: var(--df-review-card);
	  }

		  .df-review-tool-divider,
		  .df-review-mode-divider {
		    display: inline-flex;
		    align-items: center;
		    color: var(--df-review-line);
		    font-size: var(--df-review-font-size-2xl);
		    font-weight: 700;
	    line-height: 1;
		    user-select: none;
	  }

		  .df-review-active-size {
		    flex: 0 0 auto;
		    display: inline-flex;
		    align-items: center;
		    min-height: var(--df-review-control-height-lg);
		    color: var(--df-review-muted);
		    font-size: var(--df-review-font-size-sm);
		    font-variant-numeric: tabular-nums;
	    font-weight: 800;
	    line-height: 1;
	  }

	  .df-review-presets button {
	    display: inline-flex;
	    align-items: center;
    gap: 7px;
    min-height: var(--df-review-control-height-lg);
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
    font-weight: 800;
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
  }

	  .df-review-overlay-button,
	  .df-review-mode-button {
    position: relative;
    display: inline-grid;
    place-items: center;
	    width: 38px;
	    min-width: 38px;
	    padding: 0;
	    border-color: transparent;
	    background: transparent;
	    box-shadow: none;
	    color: var(--df-review-muted);
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
	      flex-direction: column;
	      align-items: stretch;
	      justify-content: flex-start;
	    }

	    .df-review-tool-controls {
	      width: 100%;
	    }

	    .df-review-presets {
	      flex-wrap: wrap;
	    }

	    .df-review-overlays {
	      width: 100%;
	      justify-content: flex-start;
	    }
	  }

	  .df-review-side-rail {
	    grid-column: 3;
	    grid-row: 1 / span 3;
	    position: relative;
	    z-index: 600;
	    display: flex;
	    flex-direction: column;
	    align-items: stretch;
	    justify-content: center;
	    min-width: 0;
	    min-height: 0;
	    border-left: 1px solid var(--df-review-line);
	    background: var(--df-review-side-rail);
	  }

  .df-review-side-toggle {
    flex: 1 1 0;
    display: grid;
    grid-template-rows: 24px auto;
    align-items: start;
    justify-items: center;
    gap: 8px;
    width: 100%;
    min-height: 0;
    border: 0;
	    border-radius: 0;
	    padding: 10px 0;
	    background: transparent;
	    color: var(--df-review-muted);
	  }

	  .df-review-side-toggle:hover {
	    background: var(--df-review-accent-soft);
	    color: var(--df-review-text);
	  }

  .df-review-side-toggle.is-active {
    background: var(--df-review-accent-soft);
    color: var(--df-review-accent);
    box-shadow: inset 2px 0 0 var(--df-review-accent);
  }

  .df-review-side-toggle span {
    display: grid;
    place-items: center;
	    width: 20px;
	    height: 24px;
	    line-height: 1;
	  }

	  .df-review-side-toggle svg {
	    width: 18px;
	    height: 18px;
	    fill: none;
	    stroke: currentColor;
	    stroke-linecap: round;
	    stroke-width: 2;
	  }

  .df-review-side-toggle strong {
    writing-mode: vertical-rl;
    text-orientation: mixed;
    color: inherit;
    font-size: var(--df-review-font-size-2xs);
    font-weight: 900;
    letter-spacing: 0;
    text-transform: uppercase;
  }

	  .df-review-qa-panel {
	    grid-column: 2;
	    grid-row: 1 / span 3;
	    position: relative;
	    z-index: 600;
	    display: grid;
	    grid-template-rows: minmax(0, 1fr);
	    min-width: 0;
	    min-height: 0;
	    overflow: hidden;
	    border-left: 1px solid var(--df-review-line-soft);
	    background:
	      linear-gradient(180deg, var(--df-review-panel), var(--df-review-bg));
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
			    grid-template-rows: auto auto;
			    gap: var(--df-review-space-2);
			    padding: var(--df-review-space-3) var(--df-review-frame-gutter-x);
			    border-bottom: 1px solid var(--df-review-line-soft);
			    background: var(--df-review-card);
			    color: var(--df-review-muted);
			    font-size: var(--df-review-font-size-sm);
			    font-weight: 800;
			  }

			  .df-review-list-toolbar {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
    gap: 8px;
    min-width: 0;
  }

			  .df-review-list-title {
			    display: flex;
			    align-items: center;
			    gap: 8px;
		    min-width: 0;
		  }

		  .df-review-list-title span {
		    min-width: 0;
		    overflow: hidden;
		    text-overflow: ellipsis;
		    white-space: nowrap;
		  }

		  .df-review-list-title strong {
		    flex: 0 0 auto;
		    color: var(--df-review-muted);
		    font-size: var(--df-review-font-size-xs);
		    font-variant-numeric: tabular-nums;
		  }

  .df-review-presence-overlay {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 5px;
    max-width: 100%;
    pointer-events: none;
  }

  .df-review-presence-row .df-review-presence-overlay {
    width: 100%;
    max-width: 1440px;
    margin: 0 auto;
  }

  .df-review-presence-chip {
    --df-review-presence-color: var(--df-review-accent);
    display: inline-flex;
    align-items: center;
    min-width: 0;
    max-width: min(220px, calc(100% - 20px));
    min-height: 24px;
    border: 1px solid rgba(15, 23, 42, 0.12);
    border-radius: var(--df-review-radius-pill);
    padding: 0 8px;
    color: #17202c;
    background: rgba(255, 255, 255, 0.92);
    box-shadow: 0 8px 22px rgba(15, 23, 42, 0.14);
    font-size: var(--df-review-font-size-2xs);
    font-weight: 900;
    line-height: 1.1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    backdrop-filter: blur(8px);
  }

  .df-review-presence-row .df-review-presence-chip {
    max-width: none;
  }

  .df-review-presence-chip.is-self {
    border-color: var(--df-review-presence-color);
    box-shadow:
      inset 0 0 0 1px var(--df-review-presence-color),
      0 8px 22px rgba(15, 23, 42, 0.14);
  }

  .df-review-presence-more {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 28px;
    min-height: 24px;
    border: 1px solid rgba(15, 23, 42, 0.12);
    border-radius: var(--df-review-radius-pill);
    padding: 0 8px;
    color: #17202c;
    background: rgba(255, 255, 255, 0.92);
    box-shadow: 0 8px 22px rgba(15, 23, 42, 0.14);
    cursor: pointer;
    font: inherit;
    font-size: var(--df-review-font-size-2xs);
    font-weight: 900;
    line-height: 1;
    pointer-events: auto;
    backdrop-filter: blur(8px);
  }

  .df-review-presence-more:hover {
    border-color: rgba(0, 102, 255, 0.42);
    color: #005be8;
    background: rgba(255, 255, 255, 0.98);
  }

  .df-review-list-controls {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .df-review-source-select,
  .df-review-status-filter-select {
    min-height: 30px;
    border: 1px solid var(--df-review-line-soft);
    border-radius: var(--df-review-radius-sm);
    padding: 0 24px 0 8px;
    color: var(--df-review-text);
    background: var(--df-review-control);
    box-shadow: var(--df-review-shadow-control);
    font-size: var(--df-review-font-size-xs);
    font-weight: 800;
  }

  .df-review-source-select {
    width: 104px;
  }

  .df-review-status-filter-select {
    width: 124px;
  }

  .df-review-list-title .df-review-status-filter-select {
    margin-left: auto;
  }

  .df-review-source-refresh {
    position: relative;
		    display: inline-grid;
		    place-items: center;
		    width: 30px;
		    min-width: 30px;
		    height: 30px;
		    border: 1px solid var(--df-review-line-soft);
		    border-radius: var(--df-review-radius-sm);
		    padding: 0;
		    color: var(--df-review-muted);
		    background: var(--df-review-control);
		    box-shadow: var(--df-review-shadow-control);
		  }

		  .df-review-source-refresh svg {
		    width: 14px;
		    height: 14px;
		  }

			  .df-review-filter-tabs {
    display: flex;
    align-items: center;
    gap: 2px;
    height: 30px;
    padding: 2px;
    border: 1px solid var(--df-review-line-soft);
    border-radius: var(--df-review-radius-md);
    background: var(--df-review-card);
    box-shadow: var(--df-review-shadow-control);
  }

				  .df-review-filter-tab {
    position: relative;
    display: grid;
    place-items: center;
    width: 26px;
    min-width: 26px;
    height: 26px;
    border: 0;
    border-radius: 5px;
    background: transparent;
    color: var(--df-review-subtle);
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
		    background: var(--df-review-accent-soft);
		    color: var(--df-review-text);
		  }

		  .df-review-filter-tab.is-active {
		    box-shadow: inset 0 0 0 1px rgba(124, 199, 255, 0.42);
		    color: var(--df-review-accent);
		  }

				  .df-review-filter-icon svg {
				    width: 15px;
				    height: 15px;
		    fill: none;
		    stroke: currentColor;
		    stroke-linecap: round;
		    stroke-linejoin: round;
			    stroke-width: 2;
			  }

			  .df-review-filter-count {
			    color: currentColor;
			    font-size: var(--df-review-font-size-3xs);
			    font-weight: 900;
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
	    margin: 0;
	    padding: var(--df-review-space-5) var(--df-review-space-4);
	    border: 1px dashed var(--df-review-line);
	    border-radius: var(--df-review-radius-lg);
	    background: var(--df-review-card);
	    color: var(--df-review-subtle);
	    font-size: var(--df-review-font-size-sm);
	    line-height: 1.45;
	  }

  .df-review-item-card.is-dim {
    opacity: 0.4;
  }

  .df-review-item-card.is-dim:hover {
    opacity: 0.72;
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

  .df-review-item-main strong {
    overflow-wrap: anywhere;
    font-size: var(--df-review-font-size-md);
    line-height: 1.35;
  }

  .df-review-item-comment {
    padding: 5px 0;
    white-space: pre-wrap;
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
    font-weight: 900;
    line-height: 1;
    text-transform: uppercase;
  }

  .df-review-item-id {
    border-color: var(--df-review-line);
    background: rgba(255, 255, 255, 0.03);
    color: var(--df-review-text);
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
    font-weight: 750;
    text-transform: none;
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
    font-weight: 750;
    text-transform: none;
  }

  .df-review-item-status-select:focus-visible {
    border-color: var(--df-review-accent);
    box-shadow: 0 0 0 2px var(--df-review-accent-soft);
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

			  .df-review-item-status-actions {
			    display: inline-flex;
			    grid-column: 1;
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
		    font-weight: 750;
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

  .df-review-item-action-button svg {
    width: 14px;
    height: 14px;
    fill: none;
    stroke: currentColor;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-width: 2;
  }

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

  .df-review-frame-link-stack {
    position: absolute;
    z-index: 14;
    top: 0;
    right: -44px;
    display: grid;
    gap: 8px;
  }

  .df-review-frame-link {
    display: grid;
    place-items: center;
    width: 34px;
    height: 34px;
    border: 1px solid rgba(15, 23, 42, 0.16);
    border-radius: var(--df-review-radius-md);
    color: #17202c;
    background: rgba(255, 255, 255, 0.92);
    box-shadow: 0 10px 26px rgba(15, 23, 42, 0.18);
    text-decoration: none;
    backdrop-filter: blur(8px);
    transition: transform 140ms ease, border-color 140ms ease, color 140ms ease,
      background 140ms ease;
  }

  .df-review-frame-link:hover {
    transform: translateY(-1px);
    border-color: rgba(0, 102, 255, 0.42);
    color: #005be8;
    background: rgba(255, 255, 255, 0.98);
  }

  .df-review-frame-link svg {
    width: 18px;
    height: 18px;
  }

  .df-review-frame-link.is-target svg {
    fill: none;
    stroke: currentColor;
    stroke-width: 2;
  }

  .df-review-frame-link.is-figma svg {
    fill: currentColor;
    stroke: none;
  }

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
    font-size: 16px;
    font-weight: 800;
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
    min-height: 54px;
    border: 0;
    border-radius: var(--df-review-radius-sm);
    padding: 8px 30px 8px 8px;
    color: var(--df-review-source-popover-text);
    background: transparent;
    text-align: left;
  }

  .df-review-source-candidate:hover {
    background: var(--df-review-source-popover-hover);
  }

  .df-review-source-candidate-main {
    display: grid;
    gap: 2px;
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
    font-weight: 900;
  }

  .df-review-source-candidate-main span {
    overflow-wrap: anywhere;
    color: var(--df-review-source-popover-muted);
    font-family: var(--df-review-font-mono);
    font-size: var(--df-review-font-size-2xs);
    line-height: 1.25;
    white-space: normal;
  }

  .df-review-source-candidate-main small {
    color: var(--df-review-source-popover-subtle);
    font-family: var(--df-review-font-mono);
    font-size: var(--df-review-font-size-2xs);
  }

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
    align-items: center;
    gap: 8px;
    min-width: 0;
    min-height: 88px;
    padding: 10px 14px;
    border-bottom: 1px solid var(--df-review-line-soft);
    color: var(--df-review-muted);
  }

  .df-review-section-outline-head span {
    display: grid;
    gap: 2px;
    min-width: 0;
  }

  .df-review-section-outline-head strong {
    overflow: hidden;
    color: var(--df-review-text);
    font-size: var(--df-review-font-size-lg);
    font-weight: 900;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .df-review-section-outline-head small {
    overflow: hidden;
    color: var(--df-review-muted);
    font-size: var(--df-review-font-size-xs);
    font-weight: 800;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .df-review-section-outline-filter {
    display: grid;
    grid-template-columns: 16px minmax(0, 1fr);
    align-items: center;
    gap: 7px;
    min-width: 0;
    min-height: 30px;
    border: 1px solid var(--df-review-line-soft);
    border-radius: var(--df-review-radius-sm);
    padding: 0 9px;
    color: var(--df-review-muted);
    background: var(--df-review-control);
    box-shadow: var(--df-review-shadow-control);
  }

  .df-review-section-outline-filter:focus-within {
    border-color: var(--df-review-accent);
    box-shadow: inset 0 0 0 1px var(--df-review-accent-hover);
  }

  .df-review-section-outline-filter svg {
    width: 14px;
    height: 14px;
    fill: none;
    stroke: currentColor;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-width: 2;
  }

  .df-review-section-outline-filter input {
    width: 100%;
    min-width: 0;
    height: 28px;
    border: 0;
    padding: 0;
    color: var(--df-review-text);
    background: transparent;
    font-size: var(--df-review-font-size-xs);
    font-weight: 800;
    outline: 0;
  }

  .df-review-section-outline-filter input::placeholder {
    color: var(--df-review-subtle);
  }

  .df-review-section-outline-filter input::-webkit-search-cancel-button {
    filter: invert(1);
    opacity: 0.55;
  }

  .df-review-section-outline-list {
    display: grid;
    align-content: start;
    gap: 2px;
    min-height: 0;
    overflow-y: auto;
    padding: 8px 1px 8px 15px;
    scrollbar-gutter: stable;
  }

  .df-review-section-outline-item {
    display: grid;
  }

  .df-review-section-outline-row {
    display: grid;
    grid-template-columns: 18px minmax(0, 1fr) auto;
    align-items: center;
    gap: 5px;
    border-radius: var(--df-review-radius-sm);
    padding: 7px 6px;
  }

  .df-review-section-outline-row:hover {
    background: var(--df-review-accent-soft);
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
    overflow: visible;
    border: 0;
    padding: 0;
    color: var(--df-review-text);
    background: transparent;
    font-size: var(--df-review-font-size-sm);
    font-weight: 800;
    text-align: left;
    white-space: normal;
    cursor: pointer;
  }

  .df-review-section-outline-name span,
  .df-review-section-outline-name small {
    overflow: visible;
    overflow-wrap: anywhere;
    text-overflow: clip;
    white-space: normal;
  }

  .df-review-section-outline-name small {
    color: var(--df-review-muted);
    font-family: var(--df-review-font-mono);
    font-size: var(--df-review-font-size-xs);
    font-weight: 700;
  }

  .df-review-section-outline-name:hover {
    color: var(--df-review-accent);
  }

  .df-review-section-outline-links {
    display: inline-flex;
    align-items: center;
    justify-content: flex-end;
    gap: 2px;
  }

  .df-review-section-outline-link {
    display: inline-grid;
    place-items: center;
    width: 26px;
    height: 26px;
    border: 1px solid transparent;
    border-radius: var(--df-review-radius-sm);
    padding: 0;
    color: var(--df-review-muted);
    background: transparent;
    cursor: pointer;
    transition: border-color 140ms ease, background 140ms ease,
      color 140ms ease, opacity 140ms ease;
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
  }

  .df-review-section-outline-empty {
    padding: 14px 12px 16px;
    color: var(--df-review-muted);
    font-size: var(--df-review-font-size-xs);
    font-weight: 700;
  }

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
    font-weight: 900;
  }

  .df-review-ruler-frame-label span {
    color: var(--df-review-color-ruler-label-text);
    font-size: var(--df-review-font-size-xs);
    font-weight: 900;
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
    font-weight: 900;
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
    font-weight: 900;
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
	      grid-template-columns: minmax(0, 1fr) 0 32px;
	      grid-template-rows: auto auto minmax(0, 1fr);
	    }

	    .df-review-shell.is-list-visible {
	      grid-template-columns: minmax(0, 1fr) minmax(260px, 70vw) 32px;
	    }

	    .df-review-qa-panel {
	      border-left: 1px solid var(--df-review-line);
	      border-bottom: 0;
	    }

	    .df-review-tools {
	      flex-wrap: wrap;
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
    `;
    document.head.append(style);
  }
}

// src/react-shell/review/shell.tsx
import {
  useCallback as useCallback11,
  useEffect as useEffect10,
  useMemo as useMemo7,
  useRef as useRef5,
  useState as useState10
} from "react";

// node_modules/.pnpm/lucide-react@1.20.0_react@19.2.7/node_modules/lucide-react/dist/esm/createLucideIcon.mjs
import { forwardRef as forwardRef2, createElement as createElement3 } from "react";

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
import { forwardRef, createElement as createElement2 } from "react";

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
import { createContext, useContext, useMemo, createElement } from "react";
var LucideContext = createContext({});
var useLucideContext = () => useContext(LucideContext);

// node_modules/.pnpm/lucide-react@1.20.0_react@19.2.7/node_modules/lucide-react/dist/esm/Icon.mjs
var Icon = forwardRef(
  ({ color, size, strokeWidth, absoluteStrokeWidth, className = "", children, iconNode, ...rest }, ref) => {
    const {
      size: contextSize = 24,
      strokeWidth: contextStrokeWidth = 2,
      absoluteStrokeWidth: contextAbsoluteStrokeWidth = false,
      color: contextColor = "currentColor",
      className: contextClass = ""
    } = useLucideContext() ?? {};
    const calculatedStrokeWidth = absoluteStrokeWidth ?? contextAbsoluteStrokeWidth ? Number(strokeWidth ?? contextStrokeWidth) * 24 / Number(size ?? contextSize) : strokeWidth ?? contextStrokeWidth;
    return createElement2(
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
        ...iconNode.map(([tag, attrs]) => createElement2(tag, attrs)),
        ...Array.isArray(children) ? children : [children]
      ]
    );
  }
);

// node_modules/.pnpm/lucide-react@1.20.0_react@19.2.7/node_modules/lucide-react/dist/esm/createLucideIcon.mjs
var createLucideIcon = (iconName, iconNode) => {
  const Component = forwardRef2(
    ({ className, ...props }, ref) => createElement3(Icon, {
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

// node_modules/.pnpm/lucide-react@1.20.0_react@19.2.7/node_modules/lucide-react/dist/esm/icons/copy.mjs
var __iconNode5 = [
  ["rect", { width: "14", height: "14", x: "8", y: "8", rx: "2", ry: "2", key: "17jyea" }],
  ["path", { d: "M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2", key: "zix9uf" }]
];
var Copy = createLucideIcon("copy", __iconNode5);

// node_modules/.pnpm/lucide-react@1.20.0_react@19.2.7/node_modules/lucide-react/dist/esm/icons/database.mjs
var __iconNode6 = [
  ["ellipse", { cx: "12", cy: "5", rx: "9", ry: "3", key: "msslwz" }],
  ["path", { d: "M3 5V19A9 3 0 0 0 21 19V5", key: "1wlel7" }],
  ["path", { d: "M3 12A9 3 0 0 0 21 12", key: "mv7ke4" }]
];
var Database = createLucideIcon("database", __iconNode6);

// node_modules/.pnpm/lucide-react@1.20.0_react@19.2.7/node_modules/lucide-react/dist/esm/icons/external-link.mjs
var __iconNode7 = [
  ["path", { d: "M15 3h6v6", key: "1q9fwt" }],
  ["path", { d: "M10 14 21 3", key: "gplh6r" }],
  ["path", { d: "M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6", key: "a6xqqp" }]
];
var ExternalLink = createLucideIcon("external-link", __iconNode7);

// node_modules/.pnpm/lucide-react@1.20.0_react@19.2.7/node_modules/lucide-react/dist/esm/icons/eye-off.mjs
var __iconNode8 = [
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
var EyeOff = createLucideIcon("eye-off", __iconNode8);

// node_modules/.pnpm/lucide-react@1.20.0_react@19.2.7/node_modules/lucide-react/dist/esm/icons/eye.mjs
var __iconNode9 = [
  [
    "path",
    {
      d: "M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0",
      key: "1nclc0"
    }
  ],
  ["circle", { cx: "12", cy: "12", r: "3", key: "1v7zrd" }]
];
var Eye = createLucideIcon("eye", __iconNode9);

// node_modules/.pnpm/lucide-react@1.20.0_react@19.2.7/node_modules/lucide-react/dist/esm/icons/grip-vertical.mjs
var __iconNode10 = [
  ["circle", { cx: "9", cy: "12", r: "1", key: "1vctgf" }],
  ["circle", { cx: "9", cy: "5", r: "1", key: "hp0tcf" }],
  ["circle", { cx: "9", cy: "19", r: "1", key: "fkjjf6" }],
  ["circle", { cx: "15", cy: "12", r: "1", key: "1tmaij" }],
  ["circle", { cx: "15", cy: "5", r: "1", key: "19l28e" }],
  ["circle", { cx: "15", cy: "19", r: "1", key: "f4zoj3" }]
];
var GripVertical = createLucideIcon("grip-vertical", __iconNode10);

// node_modules/.pnpm/lucide-react@1.20.0_react@19.2.7/node_modules/lucide-react/dist/esm/icons/image.mjs
var __iconNode11 = [
  ["rect", { width: "18", height: "18", x: "3", y: "3", rx: "2", ry: "2", key: "1m3agn" }],
  ["circle", { cx: "9", cy: "9", r: "2", key: "af1f0g" }],
  ["path", { d: "m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21", key: "1xmnt7" }]
];
var Image = createLucideIcon("image", __iconNode11);

// node_modules/.pnpm/lucide-react@1.20.0_react@19.2.7/node_modules/lucide-react/dist/esm/icons/layout-grid.mjs
var __iconNode12 = [
  ["rect", { width: "7", height: "7", x: "3", y: "3", rx: "1", key: "1g98yp" }],
  ["rect", { width: "7", height: "7", x: "14", y: "3", rx: "1", key: "6d4xhi" }],
  ["rect", { width: "7", height: "7", x: "14", y: "14", rx: "1", key: "nxv5o0" }],
  ["rect", { width: "7", height: "7", x: "3", y: "14", rx: "1", key: "1bb6yr" }]
];
var LayoutGrid = createLucideIcon("layout-grid", __iconNode12);

// node_modules/.pnpm/lucide-react@1.20.0_react@19.2.7/node_modules/lucide-react/dist/esm/icons/link-2.mjs
var __iconNode13 = [
  ["path", { d: "M9 17H7A5 5 0 0 1 7 7h2", key: "8i5ue5" }],
  ["path", { d: "M15 7h2a5 5 0 1 1 0 10h-2", key: "1b9ql8" }],
  ["line", { x1: "8", x2: "16", y1: "12", y2: "12", key: "1jonct" }]
];
var Link2 = createLucideIcon("link-2", __iconNode13);

// node_modules/.pnpm/lucide-react@1.20.0_react@19.2.7/node_modules/lucide-react/dist/esm/icons/list-filter.mjs
var __iconNode14 = [
  ["path", { d: "M2 5h20", key: "1fs1ex" }],
  ["path", { d: "M6 12h12", key: "8npq4p" }],
  ["path", { d: "M9 19h6", key: "456am0" }]
];
var ListFilter = createLucideIcon("list-filter", __iconNode14);

// node_modules/.pnpm/lucide-react@1.20.0_react@19.2.7/node_modules/lucide-react/dist/esm/icons/map.mjs
var __iconNode15 = [
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
var Map2 = createLucideIcon("map", __iconNode15);

// node_modules/.pnpm/lucide-react@1.20.0_react@19.2.7/node_modules/lucide-react/dist/esm/icons/maximize-2.mjs
var __iconNode16 = [
  ["path", { d: "M15 3h6v6", key: "1q9fwt" }],
  ["path", { d: "m21 3-7 7", key: "1l2asr" }],
  ["path", { d: "m3 21 7-7", key: "tjx5ai" }],
  ["path", { d: "M9 21H3v-6", key: "wtvkvv" }]
];
var Maximize2 = createLucideIcon("maximize-2", __iconNode16);

// node_modules/.pnpm/lucide-react@1.20.0_react@19.2.7/node_modules/lucide-react/dist/esm/icons/monitor.mjs
var __iconNode17 = [
  ["rect", { width: "20", height: "14", x: "2", y: "3", rx: "2", key: "48i651" }],
  ["line", { x1: "8", x2: "16", y1: "21", y2: "21", key: "1svkeh" }],
  ["line", { x1: "12", x2: "12", y1: "17", y2: "21", key: "vw1qmm" }]
];
var Monitor = createLucideIcon("monitor", __iconNode17);

// node_modules/.pnpm/lucide-react@1.20.0_react@19.2.7/node_modules/lucide-react/dist/esm/icons/pencil.mjs
var __iconNode18 = [
  [
    "path",
    {
      d: "M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z",
      key: "1a8usu"
    }
  ],
  ["path", { d: "m15 5 4 4", key: "1mk7zo" }]
];
var Pencil = createLucideIcon("pencil", __iconNode18);

// node_modules/.pnpm/lucide-react@1.20.0_react@19.2.7/node_modules/lucide-react/dist/esm/icons/rectangle-horizontal.mjs
var __iconNode19 = [
  ["rect", { width: "20", height: "12", x: "2", y: "6", rx: "2", key: "9lu3g6" }]
];
var RectangleHorizontal = createLucideIcon("rectangle-horizontal", __iconNode19);

// node_modules/.pnpm/lucide-react@1.20.0_react@19.2.7/node_modules/lucide-react/dist/esm/icons/refresh-cw.mjs
var __iconNode20 = [
  ["path", { d: "M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8", key: "v9h5vc" }],
  ["path", { d: "M21 3v5h-5", key: "1q7to0" }],
  ["path", { d: "M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16", key: "3uifl3" }],
  ["path", { d: "M8 16H3v5", key: "1cv678" }]
];
var RefreshCw = createLucideIcon("refresh-cw", __iconNode20);

// node_modules/.pnpm/lucide-react@1.20.0_react@19.2.7/node_modules/lucide-react/dist/esm/icons/ruler.mjs
var __iconNode21 = [
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
var Ruler = createLucideIcon("ruler", __iconNode21);

// node_modules/.pnpm/lucide-react@1.20.0_react@19.2.7/node_modules/lucide-react/dist/esm/icons/scan.mjs
var __iconNode22 = [
  ["path", { d: "M3 7V5a2 2 0 0 1 2-2h2", key: "aa7l1z" }],
  ["path", { d: "M17 3h2a2 2 0 0 1 2 2v2", key: "4qcy5o" }],
  ["path", { d: "M21 17v2a2 2 0 0 1-2 2h-2", key: "6vwrx8" }],
  ["path", { d: "M7 21H5a2 2 0 0 1-2-2v-2", key: "ioqczr" }]
];
var Scan = createLucideIcon("scan", __iconNode22);

// node_modules/.pnpm/lucide-react@1.20.0_react@19.2.7/node_modules/lucide-react/dist/esm/icons/search.mjs
var __iconNode23 = [
  ["path", { d: "m21 21-4.34-4.34", key: "14j7rj" }],
  ["circle", { cx: "11", cy: "11", r: "8", key: "4ej97u" }]
];
var Search = createLucideIcon("search", __iconNode23);

// node_modules/.pnpm/lucide-react@1.20.0_react@19.2.7/node_modules/lucide-react/dist/esm/icons/settings.mjs
var __iconNode24 = [
  [
    "path",
    {
      d: "M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915",
      key: "1i5ecw"
    }
  ],
  ["circle", { cx: "12", cy: "12", r: "3", key: "1v7zrd" }]
];
var Settings = createLucideIcon("settings", __iconNode24);

// node_modules/.pnpm/lucide-react@1.20.0_react@19.2.7/node_modules/lucide-react/dist/esm/icons/smartphone.mjs
var __iconNode25 = [
  ["rect", { width: "14", height: "20", x: "5", y: "2", rx: "2", ry: "2", key: "1yt0o3" }],
  ["path", { d: "M12 18h.01", key: "mhygvu" }]
];
var Smartphone = createLucideIcon("smartphone", __iconNode25);

// node_modules/.pnpm/lucide-react@1.20.0_react@19.2.7/node_modules/lucide-react/dist/esm/icons/square-mouse-pointer.mjs
var __iconNode26 = [
  [
    "path",
    {
      d: "M12.034 12.681a.498.498 0 0 1 .647-.647l9 3.5a.5.5 0 0 1-.033.943l-3.444 1.068a1 1 0 0 0-.66.66l-1.067 3.443a.5.5 0 0 1-.943.033z",
      key: "xwnzip"
    }
  ],
  ["path", { d: "M21 11V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h6", key: "14rsvq" }]
];
var SquareMousePointer = createLucideIcon("square-mouse-pointer", __iconNode26);

// node_modules/.pnpm/lucide-react@1.20.0_react@19.2.7/node_modules/lucide-react/dist/esm/icons/sticky-note.mjs
var __iconNode27 = [
  [
    "path",
    {
      d: "M21 9a2.4 2.4 0 0 0-.706-1.706l-3.588-3.588A2.4 2.4 0 0 0 15 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2z",
      key: "1dfntj"
    }
  ],
  ["path", { d: "M15 3v5a1 1 0 0 0 1 1h5", key: "6s6qgf" }]
];
var StickyNote = createLucideIcon("sticky-note", __iconNode27);

// node_modules/.pnpm/lucide-react@1.20.0_react@19.2.7/node_modules/lucide-react/dist/esm/icons/upload.mjs
var __iconNode28 = [
  ["path", { d: "M12 3v12", key: "1x0j5s" }],
  ["path", { d: "m17 8-5-5-5 5", key: "7q97r8" }],
  ["path", { d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4", key: "ih7n3h" }]
];
var Upload = createLucideIcon("upload", __iconNode28);

// node_modules/.pnpm/lucide-react@1.20.0_react@19.2.7/node_modules/lucide-react/dist/esm/icons/x.mjs
var __iconNode29 = [
  ["path", { d: "M18 6 6 18", key: "1bl5f8" }],
  ["path", { d: "m6 6 12 12", key: "d8bk6v" }]
];
var X = createLucideIcon("x", __iconNode29);

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
  const [path] = raw.split(/[?#]/);
  const normalized = path.startsWith("/") ? path : `/${path}`;
  const reviewPrefix = normalizeReviewPathPrefix(reviewPathPrefix);
  return normalized === reviewPrefix || normalized.startsWith(`${reviewPrefix}/`) ? "/" : normalized;
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
      target: normalizeTarget(parsedUrl.pathname, reviewPathPrefix)
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
var getHashRoutePath = (hash) => {
  if (!hash.startsWith("#/")) return null;
  const [path] = hash.slice(1).split(/[?#]/);
  try {
    return decodeURI(path || "/");
  } catch {
    return path || "/";
  }
};
var getFrameRouteTarget = (targetWindow, reviewPathPrefix) => {
  const hashPath = getHashRoutePath(targetWindow.location.hash);
  return normalizeTarget(
    hashPath ?? targetWindow.location.pathname,
    reviewPathPrefix
  );
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
  if (item.routeKey) return normalizeTarget(item.routeKey, reviewPathPrefix);
  if (item.normalizedPath) {
    return normalizeTarget(item.normalizedPath, reviewPathPrefix);
  }
  try {
    return normalizeTarget(new URL(item.pageUrl).pathname, reviewPathPrefix);
  } catch {
    return "/";
  }
};

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

// src/react-shell/prompt/prompt.ts
var getItemTitle = (item) => item.title || item.comment.split("\n")[0] || item.kind;
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
    "Issue:",
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

// src/react-shell/prompt/modal.tsx
import { jsx, jsxs } from "react/jsx-runtime";
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
var PromptModal = ({
  initialPromptText,
  copiedPromptKey,
  onClose,
  onCopyPrompt
}) => {
  return /* @__PURE__ */ jsxs(
    "div",
    {
      "aria-label": "Review help",
      "aria-modal": "true",
      className: "df-review-prompt-modal",
      role: "dialog",
      children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            "aria-label": "Close help",
            className: "df-review-prompt-backdrop",
            type: "button",
            onClick: onClose
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "df-review-prompt-dialog", children: [
          /* @__PURE__ */ jsxs("div", { className: "df-review-prompt-header", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("strong", { children: "Review shell help" }),
              /* @__PURE__ */ jsx("span", { children: "About / Initial prompt" })
            ] }),
            /* @__PURE__ */ jsx("button", { "aria-label": "Close help", type: "button", onClick: onClose, children: "x" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "df-review-prompt-body", children: [
            /* @__PURE__ */ jsxs(
              "section",
              {
                className: "df-review-prompt-about",
                "aria-labelledby": "df-review-about-title",
                children: [
                  /* @__PURE__ */ jsxs("div", { className: "df-review-prompt-section-header", children: [
                    /* @__PURE__ */ jsx("strong", { id: "df-review-about-title", children: "About" }),
                    /* @__PURE__ */ jsx("span", { children: "Program overview and setup notes" })
                  ] }),
                  /* @__PURE__ */ jsx("div", { className: "df-review-prompt-about-grid", children: ABOUT_SECTIONS.map((section) => /* @__PURE__ */ jsxs("article", { children: [
                    /* @__PURE__ */ jsx("strong", { children: section.title }),
                    /* @__PURE__ */ jsx("p", { children: section.body })
                  ] }, section.title)) })
                ]
              }
            ),
            /* @__PURE__ */ jsxs(
              "section",
              {
                className: "df-review-prompt-block",
                "aria-labelledby": "df-review-initial-prompt-title",
                children: [
                  /* @__PURE__ */ jsxs("div", { className: "df-review-prompt-block-header", children: [
                    /* @__PURE__ */ jsxs("div", { children: [
                      /* @__PURE__ */ jsx("strong", { id: "df-review-initial-prompt-title", children: "Initial Prompt" }),
                      /* @__PURE__ */ jsx("span", { children: getPromptLengthLabel(initialPromptText) })
                    ] }),
                    /* @__PURE__ */ jsxs(
                      "button",
                      {
                        disabled: !initialPromptText,
                        type: "button",
                        onClick: () => onCopyPrompt(initialPromptText, "initial"),
                        children: [
                          /* @__PURE__ */ jsx(Copy, { "aria-hidden": "true" }),
                          copiedPromptKey === "initial" ? "Copied" : "Copy"
                        ]
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsx(
                    "textarea",
                    {
                      readOnly: true,
                      "aria-label": "Initial Prompt content",
                      value: initialPromptText || "Initial prompt is not configured."
                    }
                  )
                ]
              }
            )
          ] })
        ] })
      ]
    }
  );
};

// src/react-shell/settings.ts
var normalizeReviewTheme = (value) => value === "light" || value === "system" || value === "dark" ? value : DEFAULT_REVIEW_THEME;
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
var getSystemReviewTheme = () => {
  if (typeof window === "undefined" || !window.matchMedia) return "dark";
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
};

// src/react-shell/review/settings.modal.tsx
import { jsx as jsx2, jsxs as jsxs2 } from "react/jsx-runtime";
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
  return /* @__PURE__ */ jsxs2(
    "div",
    {
      "aria-label": "Review settings",
      "aria-modal": "true",
      className: "df-review-settings-modal",
      role: "dialog",
      children: [
        /* @__PURE__ */ jsx2(
          "button",
          {
            "aria-label": "Close settings",
            className: "df-review-settings-backdrop",
            type: "button",
            onClick: onClose
          }
        ),
        /* @__PURE__ */ jsxs2(
          "form",
          {
            className: "df-review-settings-dialog",
            onSubmit: (event) => {
              event.preventDefault();
              onSave(figmaTokenDraft, reviewUserIdDraft, reviewThemeDraft);
            },
            children: [
              /* @__PURE__ */ jsxs2("div", { className: "df-review-settings-header", children: [
                /* @__PURE__ */ jsxs2("div", { className: "df-review-settings-title", children: [
                  /* @__PURE__ */ jsx2("strong", { children: "Settings" }),
                  /* @__PURE__ */ jsxs2("span", { children: [
                    FIGMA_TOKEN_STORAGE_KEY,
                    " / ",
                    REVIEW_USER_ID_STORAGE_KEY,
                    " /",
                    " ",
                    REVIEW_THEME_STORAGE_KEY
                  ] })
                ] }),
                /* @__PURE__ */ jsx2("div", { className: "df-review-settings-header-actions", children: /* @__PURE__ */ jsx2("button", { "aria-label": "Close settings", type: "button", onClick: onClose, children: "x" }) })
              ] }),
              /* @__PURE__ */ jsxs2("div", { className: "df-review-settings-body", children: [
                /* @__PURE__ */ jsxs2("div", { className: "df-review-settings-row", children: [
                  /* @__PURE__ */ jsx2("span", { children: "Theme" }),
                  /* @__PURE__ */ jsx2("div", { className: "df-review-settings-theme-options", children: REVIEW_THEME_OPTIONS.map((option) => /* @__PURE__ */ jsx2(
                    "button",
                    {
                      "aria-pressed": reviewThemeDraft === option.value,
                      className: `df-review-settings-theme-option${reviewThemeDraft === option.value ? " is-active" : ""}`,
                      type: "button",
                      onClick: () => {
                        onReviewThemeDraftChange(normalizeReviewTheme(option.value));
                        onClearStatus();
                      },
                      children: option.label
                    },
                    option.value
                  )) })
                ] }),
                /* @__PURE__ */ jsxs2("div", { className: "df-review-settings-field", children: [
                  /* @__PURE__ */ jsxs2("div", { className: "df-review-settings-label-row", children: [
                    /* @__PURE__ */ jsx2("label", { htmlFor: "df-review-figma-token", children: "Figma token" }),
                    /* @__PURE__ */ jsx2(
                      "button",
                      {
                        "aria-controls": FIGMA_TOKEN_GUIDE_ID,
                        "aria-expanded": isFigmaTokenGuideOpen,
                        "aria-label": "Show Figma token guide",
                        className: `df-review-settings-help-button${isFigmaTokenGuideOpen ? " is-active" : ""}`,
                        type: "button",
                        onClick: onToggleFigmaTokenGuide,
                        children: /* @__PURE__ */ jsx2(CircleQuestionMark, { "aria-hidden": "true" })
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsxs2("div", { className: "df-review-settings-token-input", children: [
                    /* @__PURE__ */ jsx2(
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
                    /* @__PURE__ */ jsx2(
                      "button",
                      {
                        "aria-label": isFigmaTokenVisible ? "Hide Figma token" : "Show Figma token",
                        className: "df-review-settings-token-toggle",
                        type: "button",
                        onClick: onToggleFigmaTokenVisible,
                        children: isFigmaTokenVisible ? /* @__PURE__ */ jsx2(EyeOff, { "aria-hidden": "true" }) : /* @__PURE__ */ jsx2(Eye, { "aria-hidden": "true" })
                      }
                    )
                  ] }),
                  isFigmaTokenGuideOpen && /* @__PURE__ */ jsx2(
                    "div",
                    {
                      className: "df-review-settings-guide",
                      id: FIGMA_TOKEN_GUIDE_ID,
                      children: /* @__PURE__ */ jsxs2("ol", { children: [
                        /* @__PURE__ */ jsx2("li", { children: "Figma file browser\uC5D0\uC11C account menu\uB97C \uC5F4\uACE0 Settings\uB85C \uC774\uB3D9" }),
                        /* @__PURE__ */ jsx2("li", { children: "Security \uD0ED\uC758 Personal access tokens\uB85C \uC774\uB3D9" }),
                        /* @__PURE__ */ jsx2("li", { children: "Generate new token\uC5D0\uC11C \uC774\uB984\uACFC scope\uB97C \uC815\uD55C \uB4A4 \uC0DD\uC131" }),
                        /* @__PURE__ */ jsx2("li", { children: "\uC0DD\uC131\uB41C token\uC744 \uBCF5\uC0AC\uD574\uC11C \uC5EC\uAE30\uC5D0 \uBD99\uC5EC\uB123\uAE30" })
                      ] })
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxs2("label", { className: "df-review-settings-field", children: [
                  /* @__PURE__ */ jsx2("span", { children: "User ID" }),
                  /* @__PURE__ */ jsx2("div", { className: "df-review-settings-text-input", children: /* @__PURE__ */ jsx2(
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
                figmaSettingsStatus && /* @__PURE__ */ jsx2("p", { className: "df-review-settings-status", children: figmaSettingsStatus }),
                /* @__PURE__ */ jsxs2("div", { className: "df-review-settings-actions", children: [
                  /* @__PURE__ */ jsx2(
                    "button",
                    {
                      type: "button",
                      onClick: () => onSave("", "", DEFAULT_REVIEW_THEME),
                      children: "Clear"
                    }
                  ),
                  /* @__PURE__ */ jsx2("span", {}),
                  /* @__PURE__ */ jsx2("button", { type: "button", onClick: onClose, children: "Cancel" }),
                  /* @__PURE__ */ jsx2("button", { type: "submit", children: "Save" })
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
import {
  useMemo as useMemo2,
  useState
} from "react";

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
    const visibleChildren = sortSummaries(summary.children);
    visibleChildren.forEach((child, childIndex) => {
      appendSummaryRows(
        child,
        depth + 1,
        depth === 0 ? [] : [...ancestorLastList, isLastNode],
        childIndex === visibleChildren.length - 1
      );
    });
  };
  if (root.isPage) {
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
    Array.from(root.children.values()).map(createNodeSummary)
  );
  rootSummaries.forEach((summary, index, siblings) => {
    appendSummaryRows(summary, 1, [], index === siblings.length - 1);
  });
  return rows;
};

// src/react-shell/sitemap/modal.tsx
import { Fragment, jsx as jsx3, jsxs as jsxs3 } from "react/jsx-runtime";
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
  const [sort, setSort] = useState({
    key: "total",
    direction: "desc"
  });
  const allQaUsers = useMemo2(
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
  return /* @__PURE__ */ jsxs3(
    "div",
    {
      "aria-label": "Sitemap",
      "aria-modal": "true",
      className: "df-review-sitemap-modal",
      role: "dialog",
      children: [
        /* @__PURE__ */ jsx3(
          "button",
          {
            "aria-label": "Close sitemap",
            className: "df-review-sitemap-backdrop",
            type: "button",
            onClick: onClose
          }
        ),
        /* @__PURE__ */ jsxs3("div", { className: "df-review-sitemap-dialog", children: [
          /* @__PURE__ */ jsxs3("div", { className: "df-review-sitemap-header", children: [
            /* @__PURE__ */ jsxs3("div", { children: [
              /* @__PURE__ */ jsx3("strong", { children: "Sitemap" }),
              /* @__PURE__ */ jsxs3("span", { children: [
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
            /* @__PURE__ */ jsx3("button", { "aria-label": "Close sitemap", type: "button", onClick: onClose, children: "x" })
          ] }),
          /* @__PURE__ */ jsxs3("div", { className: "df-review-sitemap-list", style: gridStyle, children: [
            /* @__PURE__ */ jsx3("div", { className: "df-review-sitemap-table-head", role: "row", children: sortHeaders.map((header) => /* @__PURE__ */ jsxs3(
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
                  /* @__PURE__ */ jsx3(
                    "span",
                    {
                      "aria-hidden": "true",
                      className: "df-review-sitemap-sort-indicator",
                      children: getSortIndicator(sort, header.key)
                    }
                  ),
                  /* @__PURE__ */ jsx3("span", { className: "df-review-sitemap-sort-label", children: header.label })
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
              const rowContent = /* @__PURE__ */ jsx3(
                SitemapRowContent,
                {
                  label: row.label,
                  prefix: row.prefix,
                  qaCount: row.qaCount,
                  users: row.users
                }
              );
              if (!row.isPage) {
                return /* @__PURE__ */ jsx3(
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
              return /* @__PURE__ */ jsx3(
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
            /* @__PURE__ */ jsx3(
              "button",
              {
                "aria-label": `All QA / ${allQaCount.remaining} remaining / ${allQaCount.status.review} review / ${allQaCount.status.hold} hold`,
                className: `df-review-sitemap-row is-summary${isAllQaVisible ? " is-active" : ""}`,
                type: "button",
                onClick: onSelectAllQa,
                children: /* @__PURE__ */ jsx3(
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
}) => /* @__PURE__ */ jsxs3(Fragment, { children: [
  /* @__PURE__ */ jsxs3("span", { className: "df-review-sitemap-path", children: [
    /* @__PURE__ */ jsx3("span", { className: "df-review-sitemap-tree-prefix", children: prefix }),
    /* @__PURE__ */ jsx3("span", { className: "df-review-sitemap-label", children: label })
  ] }),
  /* @__PURE__ */ jsx3("span", { className: "df-review-sitemap-cell is-total", children: /* @__PURE__ */ jsx3("strong", { children: qaCount.remaining }) }),
  /* @__PURE__ */ jsx3("span", { className: "df-review-sitemap-cell is-review", children: qaCount.status.review }),
  /* @__PURE__ */ jsx3("span", { className: "df-review-sitemap-cell is-hold", children: qaCount.status.hold }),
  /* @__PURE__ */ jsx3("span", { className: "df-review-sitemap-cell is-online", children: users.length > 0 ? /* @__PURE__ */ jsx3("span", { className: "df-review-sitemap-users", children: users.map((user) => /* @__PURE__ */ jsx3(
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
function getFigmaFrameUrl(config, preset) {
  if (!config) return null;
  const kind = getViewportPresetKind(preset);
  const value = kind === "mobile" ? config.mobileNodeId : config.desktopNodeId;
  return value ? createFigmaFrameUrl(value) : null;
}
function normalizeFigmaNodeValue(value) {
  return typeof value === "string" ? value.trim() || void 0 : void 0;
}
function createFigmaFrameUrl(value) {
  const [fileKey, nodeId] = value.split("->").map((part) => part.trim());
  if (!fileKey || !nodeId) return null;
  const urlNodeId = encodeURIComponent(nodeId.replace(/:/g, "-"));
  return `https://www.figma.com/design/${encodeURIComponent(
    fileKey
  )}?node-id=${urlNodeId}`;
}

// src/react-shell/qa/item.edit.modal.tsx
import { useEffect, useState as useState2 } from "react";
import { jsx as jsx4, jsxs as jsxs4 } from "react/jsx-runtime";
var QaItemEditModal = ({
  item,
  onClose,
  onSave
}) => {
  const [commentDraft, setCommentDraft] = useState2(item.comment);
  const [error, setError] = useState2("");
  const [isSaving, setIsSaving] = useState2(false);
  useEffect(() => {
    setCommentDraft(item.comment);
    setError("");
    setIsSaving(false);
  }, [item.id, item.comment]);
  const saveComment = async () => {
    const nextComment = commentDraft.trim();
    if (!nextComment) {
      setError("Comment is required.");
      return;
    }
    setError("");
    setIsSaving(true);
    try {
      await onSave(item, nextComment);
    } catch (error2) {
      setError(
        error2 instanceof Error ? error2.message : "Failed to update QA comment."
      );
      setIsSaving(false);
    }
  };
  return /* @__PURE__ */ jsxs4(
    "div",
    {
      "aria-modal": "true",
      className: "df-review-edit-modal",
      role: "dialog",
      "aria-labelledby": "df-review-edit-title",
      children: [
        /* @__PURE__ */ jsx4(
          "button",
          {
            "aria-label": "Close edit dialog",
            className: "df-review-settings-backdrop",
            type: "button",
            onClick: onClose
          }
        ),
        /* @__PURE__ */ jsxs4(
          "form",
          {
            className: "df-review-edit-dialog",
            onSubmit: (event) => {
              event.preventDefault();
              void saveComment();
            },
            children: [
              /* @__PURE__ */ jsxs4("header", { className: "df-review-settings-header", children: [
                /* @__PURE__ */ jsxs4("div", { className: "df-review-settings-title", children: [
                  /* @__PURE__ */ jsx4("strong", { id: "df-review-edit-title", children: "Edit QA comment" }),
                  /* @__PURE__ */ jsx4("span", { children: "Update the text shown on this QA item." })
                ] }),
                /* @__PURE__ */ jsx4("div", { className: "df-review-settings-header-actions", children: /* @__PURE__ */ jsx4(
                  "button",
                  {
                    "aria-label": "Close edit dialog",
                    type: "button",
                    onClick: onClose,
                    children: "x"
                  }
                ) })
              ] }),
              /* @__PURE__ */ jsxs4("div", { className: "df-review-settings-body df-review-edit-body", children: [
                /* @__PURE__ */ jsxs4("label", { className: "df-review-settings-field", children: [
                  /* @__PURE__ */ jsx4("span", { children: "Comment" }),
                  /* @__PURE__ */ jsx4("div", { className: "df-review-settings-text-input df-review-edit-textarea", children: /* @__PURE__ */ jsx4(
                    "textarea",
                    {
                      autoFocus: true,
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
                          void saveComment();
                        }
                      }
                    }
                  ) })
                ] }),
                error && /* @__PURE__ */ jsx4("p", { className: "df-review-edit-error", children: error }),
                /* @__PURE__ */ jsxs4("footer", { className: "df-review-settings-actions df-review-edit-actions", children: [
                  /* @__PURE__ */ jsx4("span", {}),
                  /* @__PURE__ */ jsx4("button", { disabled: isSaving, type: "button", onClick: onClose, children: "Cancel" }),
                  /* @__PURE__ */ jsx4("button", { disabled: isSaving, type: "submit", children: isSaving ? "Saving\u2026" : "Save" })
                ] })
              ] })
            ]
          }
        )
      ]
    }
  );
};

// src/react-shell/qa/item.remote.actions.tsx
import { jsx as jsx5, jsxs as jsxs5 } from "react/jsx-runtime";
var QaItemRemoteActions = ({
  isRemoteSource,
  isSubmitted,
  isSubmitting,
  item,
  numberedItem,
  remoteAdapterEntry,
  onSubmitItem
}) => {
  const canSubmitToRemote = !isRemoteSource && Boolean(remoteAdapterEntry);
  const canOpenRemoteIssue = !isRemoteSource && Boolean(item.externalIssueUrl);
  const hasRemoteActions = canSubmitToRemote || canOpenRemoteIssue;
  if (!hasRemoteActions) return null;
  return /* @__PURE__ */ jsxs5(
    "div",
    {
      className: "df-review-item-remote-actions",
      onClick: (event) => event.stopPropagation(),
      children: [
        canSubmitToRemote && remoteAdapterEntry && /* @__PURE__ */ jsxs5(
          "button",
          {
            "aria-label": "Submit to remote",
            className: "df-review-item-action-button df-review-item-submit-button",
            disabled: isSubmitted || isSubmitting,
            type: "button",
            onClick: () => void onSubmitItem(numberedItem),
            children: [
              /* @__PURE__ */ jsx5(Upload, { "aria-hidden": "true" }),
              /* @__PURE__ */ jsx5("span", { children: isSubmitted ? "Submitted" : isSubmitting ? "Submitting" : "Submit" })
            ]
          }
        ),
        canOpenRemoteIssue && /* @__PURE__ */ jsx5(
          "a",
          {
            "aria-label": "Open remote issue",
            className: "df-review-item-action-button",
            href: item.externalIssueUrl,
            rel: "noreferrer",
            target: "_blank",
            children: /* @__PURE__ */ jsx5(ExternalLink, { "aria-hidden": "true" })
          }
        )
      ]
    }
  );
};

// src/react-shell/qa/item.status.actions.tsx
import { jsx as jsx6 } from "react/jsx-runtime";
var getStatusOption = (status, statusOptions) => {
  const normalizedStatus = normalizeReviewItemStatus(status);
  return statusOptions.find((statusOption) => statusOption.value === status) ?? statusOptions.find(
    (statusOption) => statusOption.value === normalizedStatus
  ) ?? statusOptions[0];
};
var QaItemStatusActions = ({
  canUpdateStatus,
  item,
  statusOptions,
  onChangeItemStatus
}) => {
  const currentStatusOption = getStatusOption(item.status, statusOptions);
  if (!currentStatusOption) return null;
  const statusClassName = `is-status-${normalizeReviewItemStatus(
    currentStatusOption.value
  )}`;
  return /* @__PURE__ */ jsx6(
    "div",
    {
      className: "df-review-item-status-actions",
      onClick: (event) => event.stopPropagation(),
      children: canUpdateStatus ? /* @__PURE__ */ jsx6(
        "select",
        {
          "aria-label": "QA status",
          className: `df-review-item-status-select ${statusClassName}`,
          value: currentStatusOption.value,
          onChange: (event) => void onChangeItemStatus(
            item,
            event.currentTarget.value
          ),
          children: statusOptions.map((statusOption) => /* @__PURE__ */ jsx6("option", { value: statusOption.value, children: statusOption.label }, statusOption.value))
        }
      ) : /* @__PURE__ */ jsx6("span", { className: `df-review-item-status-badge ${statusClassName}`, children: currentStatusOption.label })
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
import { jsx as jsx7 } from "react/jsx-runtime";
var ReviewScopeIcon = ({ scope }) => {
  if (scope === "mobile") return /* @__PURE__ */ jsx7(Smartphone, { "aria-hidden": "true" });
  if (scope === "tablet") return /* @__PURE__ */ jsx7(RectangleHorizontal, { "aria-hidden": "true" });
  if (scope === "wide") return /* @__PURE__ */ jsx7(Maximize2, { "aria-hidden": "true" });
  if (scope === "dom") return /* @__PURE__ */ jsx7(SquareMousePointer, { "aria-hidden": "true" });
  return /* @__PURE__ */ jsx7(Monitor, { "aria-hidden": "true" });
};
var getReviewItemMode = (item) => isAnchorRestorableReviewItem(item) ? "dom" : item.kind;
var ReviewItemModeIcon = ({
  mode
}) => {
  if (mode === "area") return /* @__PURE__ */ jsx7(Scan, { "aria-hidden": "true" });
  if (mode === "dom") return /* @__PURE__ */ jsx7(SquareMousePointer, { "aria-hidden": "true" });
  return /* @__PURE__ */ jsx7(StickyNote, { "aria-hidden": "true" });
};

// src/react-shell/qa/item.card.tsx
import { jsx as jsx8, jsxs as jsxs6 } from "react/jsx-runtime";
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
  currentPresetScope,
  getItemPresetScope,
  isOverlayVisible,
  isRemoteSource,
  numberedItem,
  remoteAdapterEntry,
  copiedPromptKey,
  selectedItemId,
  onChangeItemStatus,
  onClearSelectedItem,
  onRemoveItem,
  onCopyItemLink,
  onCopyItemPrompt,
  onEditItem,
  onRestoreReviewItem,
  onSubmitItem,
  onToggleItemOverlayVisibility
}) => {
  const { item } = numberedItem;
  const itemMode = getReviewItemMode(item);
  const isSubmitted = item.submitStatus === "submitted";
  const isSubmitting = item.submitStatus === "submitting";
  const canRemoveItem = activeAdapterEntry.canRemove && !isSubmitting && (isRemoteSource || !isSubmitted);
  const itemComment = item.comment.trim() || getItemTitle(item);
  const itemAuthor = item.createdBy?.trim();
  const promptCopyKey = `qa:${item.id}`;
  const linkCopyKey = `link:${item.id}`;
  const isPromptCopied = copiedPromptKey === promptCopyKey;
  const isLinkCopied = copiedPromptKey === linkCopyKey;
  const statusOptions = activeAdapterEntry.statusOptions;
  const isActive = item.id === selectedItemId;
  const canUpdateStatus = Boolean(activeAdapterEntry.updateStatus) && statusOptions.length > 0 && !isSubmitting;
  const canEditItem = activeAdapterEntry.canUpdate && !isSubmitting;
  const itemMeta = [formatItemCardDate(item.createdAt), itemAuthor].filter(Boolean).join(" | ");
  return /* @__PURE__ */ jsxs6(
    "article",
    {
      className: `df-review-item-card${isActive ? " is-active" : ""}${getItemPresetScope(item) !== currentPresetScope ? " is-dim" : ""}${isOverlayVisible ? "" : " is-overlay-hidden"}`,
      onClick: () => {
        if (isActive) {
          onClearSelectedItem();
          return;
        }
        onRestoreReviewItem(item);
      },
      children: [
        /* @__PURE__ */ jsxs6("div", { className: "df-review-item-header", children: [
          /* @__PURE__ */ jsxs6("div", { className: "df-review-item-main", children: [
            /* @__PURE__ */ jsxs6("span", { className: "df-review-item-badges", children: [
              /* @__PURE__ */ jsx8("span", { className: "df-review-item-id", children: numberedItem.displayLabel }),
              /* @__PURE__ */ jsxs6(
                "span",
                {
                  className: `df-review-item-scope is-scope-${numberedItem.scope}`,
                  children: [
                    /* @__PURE__ */ jsx8(ReviewScopeIcon, { scope: numberedItem.scope }),
                    numberedItem.label
                  ]
                }
              ),
              /* @__PURE__ */ jsxs6("span", { className: `df-review-item-mode is-mode-${itemMode}`, children: [
                /* @__PURE__ */ jsx8(ReviewItemModeIcon, { mode: itemMode }),
                itemMode
              ] })
            ] }),
            /* @__PURE__ */ jsx8("strong", { className: "df-review-item-comment", children: itemComment }),
            /* @__PURE__ */ jsx8("small", { className: "df-review-item-meta", children: itemMeta }),
            item.submitError && /* @__PURE__ */ jsx8("small", { className: "df-review-item-error", children: item.submitError })
          ] }),
          /* @__PURE__ */ jsxs6(
            "div",
            {
              className: "df-review-item-header-actions",
              onClick: (event) => event.stopPropagation(),
              children: [
                /* @__PURE__ */ jsx8(
                  "button",
                  {
                    "aria-label": isOverlayVisible ? "Hide QA overlay" : "Show QA overlay",
                    className: `df-review-item-visibility${isOverlayVisible ? " is-visible" : " is-hidden"}`,
                    type: "button",
                    onClick: () => onToggleItemOverlayVisibility(item.id),
                    children: isOverlayVisible ? /* @__PURE__ */ jsx8(Eye, { "aria-hidden": "true" }) : /* @__PURE__ */ jsx8(EyeOff, { "aria-hidden": "true" })
                  }
                ),
                /* @__PURE__ */ jsx8(
                  "button",
                  {
                    "aria-label": isLinkCopied ? "Copied QA link" : "Copy QA link",
                    className: `df-review-item-link-copy${isLinkCopied ? " is-copied" : ""}`,
                    title: isLinkCopied ? "Copied QA link" : "Copy QA link",
                    type: "button",
                    onClick: () => onCopyItemLink(numberedItem),
                    children: /* @__PURE__ */ jsx8(Link2, { "aria-hidden": "true" })
                  }
                ),
                canEditItem && /* @__PURE__ */ jsx8(
                  "button",
                  {
                    "aria-label": "Edit QA comment",
                    className: "df-review-item-edit",
                    title: "Edit QA comment",
                    type: "button",
                    onClick: () => onEditItem(item),
                    children: /* @__PURE__ */ jsx8(Pencil, { "aria-hidden": "true" })
                  }
                ),
                canRemoveItem && /* @__PURE__ */ jsx8(
                  "button",
                  {
                    "aria-label": "Delete QA",
                    className: "df-review-item-delete",
                    type: "button",
                    onClick: () => void onRemoveItem(item),
                    children: /* @__PURE__ */ jsx8(X, { "aria-hidden": "true" })
                  }
                )
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxs6("div", { className: "df-review-item-actions", children: [
          /* @__PURE__ */ jsx8(
            QaItemStatusActions,
            {
              canUpdateStatus,
              item,
              statusOptions,
              onChangeItemStatus
            }
          ),
          /* @__PURE__ */ jsx8(
            "div",
            {
              className: "df-review-item-prompt-actions",
              onClick: (event) => event.stopPropagation(),
              children: /* @__PURE__ */ jsx8(
                "button",
                {
                  "aria-label": isPromptCopied ? "Copied QA prompt" : "Copy QA prompt",
                  className: `df-review-item-action-button df-review-item-prompt-copy${isPromptCopied ? " is-copied" : ""}`,
                  title: isPromptCopied ? "Copied QA prompt" : "Copy QA prompt",
                  type: "button",
                  onClick: () => onCopyItemPrompt(numberedItem),
                  children: isPromptCopied ? /* @__PURE__ */ jsx8(Copy, { "aria-hidden": "true" }) : /* @__PURE__ */ jsx8(Bot, { "aria-hidden": "true" })
                }
              )
            }
          ),
          /* @__PURE__ */ jsx8(
            QaItemRemoteActions,
            {
              isRemoteSource,
              isSubmitted,
              isSubmitting,
              item,
              numberedItem,
              remoteAdapterEntry,
              onSubmitItem
            }
          )
        ] })
      ]
    }
  );
};

// src/react-shell/qa/panel.header.tsx
import { jsx as jsx9, jsxs as jsxs7 } from "react/jsx-runtime";
var QaPanelHeader = ({
  activeItemCount,
  activeRemainingItemCount,
  filteredItemCount,
  isAllQaVisible,
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
  return /* @__PURE__ */ jsxs7("div", { className: "df-review-list-header", children: [
    /* @__PURE__ */ jsxs7("div", { className: "df-review-list-toolbar", children: [
      /* @__PURE__ */ jsxs7("div", { className: "df-review-list-controls", children: [
        showSourceSelect && /* @__PURE__ */ jsx9(
          "select",
          {
            "aria-label": "QA source",
            className: "df-review-source-select",
            value: source,
            onChange: (event) => onChangeReviewSource(event.currentTarget.value),
            children: sourceEntries.map((entry) => /* @__PURE__ */ jsx9("option", { value: entry.label, children: entry.label }, entry.label))
          }
        ),
        /* @__PURE__ */ jsx9(
          "button",
          {
            "aria-label": "Refresh QA",
            className: "df-review-source-refresh",
            type: "button",
            onClick: () => void onRefreshReviewData(),
            children: /* @__PURE__ */ jsx9(RefreshCw, { "aria-hidden": "true" })
          }
        )
      ] }),
      /* @__PURE__ */ jsx9("div", { className: "df-review-filter-tabs", "aria-label": "QA filters", children: REVIEW_QA_FILTERS.map((filter) => {
        const count = qaFilterCounts.get(filter.key) ?? 0;
        const isActive = qaFilter === filter.key;
        return /* @__PURE__ */ jsx9(
          "button",
          {
            "aria-label": `${filter.label} QA (${count})`,
            "aria-pressed": isActive,
            className: `df-review-filter-tab${isActive ? " is-active" : ""}`,
            type: "button",
            onClick: () => onQaFilterChange(filter.key),
            children: /* @__PURE__ */ jsx9("span", { className: "df-review-filter-icon", children: filter.scope ? /* @__PURE__ */ jsx9(ReviewScopeIcon, { scope: filter.scope }) : /* @__PURE__ */ jsx9(ListFilter, { "aria-hidden": "true" }) })
          },
          filter.key
        );
      }) })
    ] }),
    /* @__PURE__ */ jsxs7("div", { className: "df-review-list-title", children: [
      /* @__PURE__ */ jsx9("span", { children: isAllQaVisible ? `${label} QA \xB7 All pages` : `${label} QA` }),
      /* @__PURE__ */ jsx9("strong", { title: `${activeRemainingItemCount} remaining of ${activeItemCount}`, children: !hasActiveFilter ? `${activeRemainingItemCount}/${activeItemCount}` : `${filteredItemCount}/${activeItemCount}` }),
      /* @__PURE__ */ jsxs7(
        "select",
        {
          "aria-label": "QA status filter",
          className: "df-review-status-filter-select",
          value: qaStatusFilter,
          onChange: (event) => onQaStatusFilterChange(
            event.currentTarget.value
          ),
          children: [
            /* @__PURE__ */ jsx9("option", { value: "all", children: `All status (${qaStatusFilterCounts.get("all") ?? 0})` }),
            statusFilterOptions.map((statusOption) => /* @__PURE__ */ jsx9("option", { value: statusOption.value, children: `${statusOption.label} (${qaStatusFilterCounts.get(statusOption.value) ?? 0})` }, statusOption.value))
          ]
        }
      )
    ] })
  ] });
};
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
import { jsx as jsx10, jsxs as jsxs8 } from "react/jsx-runtime";
var ReviewQaPanel = ({
  activeAdapterEntry,
  activeItems,
  activeRemainingItemCount,
  currentPresetScope,
  filteredNumberedActiveItems,
  getItemPresetScope,
  hiddenOverlayItemIds,
  isAllQaVisible,
  isListVisible,
  isRemoteSource,
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
  onClearSelectedItem,
  onChangeReviewSource,
  onCopyItemLink,
  onCopyItemPrompt,
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
  return /* @__PURE__ */ jsx10("aside", { className: "df-review-qa-panel", "aria-hidden": !isListVisible, children: /* @__PURE__ */ jsx10("div", { className: "df-review-panel-body", children: /* @__PURE__ */ jsxs8("section", { className: "df-review-item-list", children: [
    /* @__PURE__ */ jsx10(
      QaPanelHeader,
      {
        activeItemCount: activeItems.length,
        activeRemainingItemCount,
        filteredItemCount: filteredNumberedActiveItems.length,
        isAllQaVisible,
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
    /* @__PURE__ */ jsxs8(
      "div",
      {
        className: "df-review-list-scroll",
        onClick: (event) => {
          if (event.target === event.currentTarget) {
            onClearSelectedItem();
          }
        },
        children: [
          activeItems.length === 0 && /* @__PURE__ */ jsx10("p", { className: "df-review-empty", children: emptyMessage }),
          activeItems.length > 0 && filteredNumberedActiveItems.length === 0 && /* @__PURE__ */ jsx10("p", { className: "df-review-empty", children: "No QA in this filter." }),
          filteredNumberedActiveItems.map((numberedItem) => {
            const { item } = numberedItem;
            return /* @__PURE__ */ jsx10(
              QaItemCard,
              {
                activeAdapterEntry,
                currentPresetScope,
                getItemPresetScope,
                isOverlayVisible: !hiddenOverlayItemIds.has(item.id),
                isRemoteSource,
                numberedItem,
                remoteAdapterEntry,
                copiedPromptKey,
                selectedItemId,
                onChangeItemStatus,
                onClearSelectedItem,
                onCopyItemLink,
                onCopyItemPrompt,
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
  ] }) }) });
};

// src/react-shell/presence/overlay.tsx
import { useState as useState3 } from "react";
import { jsx as jsx11, jsxs as jsxs9 } from "react/jsx-runtime";
var COLLAPSED_USER_COUNT = 1;
var getPresenceName = (user) => user.displayName || user.userId;
var PresenceOverlay = ({
  presenceSessionId,
  users
}) => {
  const [isExpanded, setIsExpanded] = useState3(false);
  if (users.length === 0) return null;
  const visibleUsers = isExpanded ? users : users.slice(0, COLLAPSED_USER_COUNT);
  const hiddenUserCount = users.length - visibleUsers.length;
  return /* @__PURE__ */ jsxs9(
    "div",
    {
      "aria-label": `Review presence, ${users.length} online`,
      className: `df-review-presence-overlay${isExpanded ? " is-expanded" : ""}`,
      children: [
        visibleUsers.map((user) => /* @__PURE__ */ jsx11(
          "span",
          {
            className: `df-review-presence-chip${user.sessionId === presenceSessionId ? " is-self" : ""}`,
            style: {
              "--df-review-presence-color": user.color
            },
            title: getPresenceName(user),
            children: getPresenceName(user)
          },
          user.sessionId
        )),
        hiddenUserCount > 0 && /* @__PURE__ */ jsxs9(
          "button",
          {
            "aria-label": `Show ${hiddenUserCount} more online reviewers`,
            "aria-expanded": isExpanded,
            className: "df-review-presence-more",
            type: "button",
            onClick: () => setIsExpanded(true),
            children: [
              "+",
              hiddenUserCount
            ]
          }
        )
      ]
    }
  );
};

// src/react-shell/source.open.ts
var SOURCE_SELECTOR = [
  "[data-wrk-source-file]",
  "[data-wrk-source-component]",
  "[data-wrk-source-line]",
  "[data-wrk-source-column]",
  "[data-file]",
  "[data-component]",
  "[data-section-index]",
  "[data-section-id]"
].join(", ");
var SECTION_OUTLINE_ROOT_SELECTOR = [
  "[data-wrk-source-component]",
  "header[data-wrk-source-file]",
  "footer[data-wrk-source-file]",
  '[role="banner"][data-wrk-source-file]',
  '[role="contentinfo"][data-wrk-source-file]'
].join(", ");
var matchesIgnore = (file, patterns) => {
  const normalized = file.replace(/\\/g, "/");
  return patterns.some(
    (pattern) => typeof pattern === "string" ? normalized.includes(pattern) : pattern.test(normalized)
  );
};
var getSourceCandidates = (target, options) => {
  const startElement = getEventElement(target);
  if (!startElement) return [];
  const candidates = [];
  const seen = /* @__PURE__ */ new Set();
  const add = (element2, source, depth2) => {
    if (!source?.file) return;
    const key = source.file.replace(/\\/g, "/");
    if (seen.has(key)) return;
    seen.add(key);
    candidates.push(createSourceCandidate(element2, source, depth2));
  };
  let element = startElement;
  let depth = 0;
  while (element && element.nodeType === 1) {
    add(element, getSourceHintFromElement(element), depth);
    add(element, getDataHintFromElement(element), 0);
    if (element === element.ownerDocument.documentElement) break;
    element = element.parentElement;
    depth += 1;
  }
  const ignore = options?.ignore;
  const visible = ignore?.length ? candidates.filter((c) => !matchesIgnore(c.source.file ?? "", ignore)) : candidates;
  return (visible.length ? visible : candidates).slice(0, 8);
};
var getSectionOutline = (root, options) => {
  const maxDepth = options?.maxDepth ?? 9;
  return getSectionOutlineRoots(root, options?.ignore).map((element, index) => {
    const source = getSourceHintFromElement(element);
    const label = getOutlineLabel(element, source, "section");
    const seen = /* @__PURE__ */ new Set();
    if (source?.file) seen.add(getOutlineSourceKey(source));
    return {
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
        options?.ignore
      )
    };
  });
};
function getSectionOutlineRoots(root, ignore) {
  return Array.from(root.querySelectorAll(SECTION_OUTLINE_ROOT_SELECTOR)).filter(
    (element) => {
      const source = getSourceHintFromElement(element);
      const label = getOutlineLabel(element, source, "");
      return !isSkippedOutlineNode(label, source?.file, ignore);
    }
  );
}
function getSectionOutlineChildren(parent, depth, maxDepth, seen, ignore) {
  if (depth > maxDepth) return [];
  const entries = [];
  for (const child of Array.from(parent.children)) {
    const source = getSourceHintFromElement(child);
    const label = getOutlineLabel(child, source, child.tagName.toLowerCase());
    const sourceKey = source?.file ? getOutlineSourceKey(source) : "";
    const isNewSource = Boolean(sourceKey) && !seen.has(sourceKey);
    if (isSkippedOutlineNode(label, source?.file, ignore)) continue;
    if (source?.file && isNewSource) {
      seen.add(sourceKey);
      entries.push({
        id: `${sourceKey}-${entries.length}`,
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
          seen,
          ignore
        )
      });
      continue;
    }
    entries.push(
      ...getSectionOutlineChildren(child, depth, maxDepth, seen, ignore)
    );
  }
  return entries;
}
function getOutlineSourceKey(source) {
  return source.file?.replace(/\\/g, "/") ?? "";
}
function getOutlineLabel(element, source, fallback) {
  return source?.component?.trim() || getComponentNameFromSourceFile(source?.file) || element.id.trim() || fallback;
}
function isSkippedOutlineNode(label, file, ignore) {
  const isIgnoredSource = file && ignore?.length ? matchesIgnore(file, ignore) : false;
  return isPlacerOutlineNode(label, file) || isIgnoredSource;
}
function isPlacerOutlineNode(label, file) {
  return `${label} ${file ?? ""}`.toLowerCase().includes("placer");
}
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
function createSourceCandidate(element, source, depth) {
  const confidence = getSourceConfidence(source, depth);
  const fileName = source.file?.split(/[\\/]/).pop() ?? source.file ?? "source";
  const component = source.component?.trim();
  const fallbackComponent = getComponentNameFromSourceFile(source.file);
  const tag = element.tagName.toLowerCase();
  const line = getSourcePosition(source.line);
  const column = getSourcePosition(source.column);
  const position = line ? `:${line}${column ? `:${column}` : ""}` : "";
  return {
    id: getSourceCandidateKey(source),
    depth,
    element,
    filePath: getDisplaySourcePath(source.file) ?? fileName,
    label: component || fallbackComponent || tag,
    detail: `${fileName}${position}`,
    positionLabel: line ? `${line}:${column ?? 1}` : "",
    confidence,
    confidenceLabel: confidence >= 0.82 ? "high" : confidence >= 0.58 ? "medium" : "low",
    usesPosition: confidence >= 0.72 && Boolean(line),
    source
  };
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
function getSourceAttribute(element, ...names) {
  for (const name of names) {
    const value = element.getAttribute(name)?.trim();
    if (value) return value;
  }
  return void 0;
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

// src/react-shell/review/mode.toolbar.tsx
import { jsx as jsx12, jsxs as jsxs10 } from "react/jsx-runtime";
var ReviewModeToolbar = ({
  canWriteArea,
  canWriteDom,
  mode,
  onSetReviewMode
}) => {
  if (!canWriteDom && !canWriteArea) return null;
  return /* @__PURE__ */ jsxs10("div", { className: "df-review-mode", "aria-label": "Add QA", children: [
    canWriteDom && /* @__PURE__ */ jsx12(
      "button",
      {
        "aria-label": "Element",
        className: `df-review-mode-button is-element${mode === "element" ? " is-active" : ""}`,
        type: "button",
        onClick: () => onSetReviewMode("element"),
        children: /* @__PURE__ */ jsx12(SquareMousePointer, { "aria-hidden": "true" })
      }
    ),
    canWriteDom && canWriteArea && /* @__PURE__ */ jsx12("span", { className: "df-review-mode-divider", "aria-hidden": "true", children: "|" }),
    canWriteArea && /* @__PURE__ */ jsx12(
      "button",
      {
        "aria-label": "Area",
        className: `df-review-mode-button is-area${mode === "area" ? " is-active" : ""}`,
        type: "button",
        onClick: () => onSetReviewMode("area"),
        children: /* @__PURE__ */ jsx12(Scan, { "aria-hidden": "true" })
      }
    )
  ] });
};

// src/react-shell/ruler/gutters.tsx
import { Fragment as Fragment2, jsx as jsx13, jsxs as jsxs11 } from "react/jsx-runtime";
var RulerGutters = ({
  rulerHover,
  rulerScaleX,
  rulerScaleY,
  rulerUnit,
  size
}) => {
  return /* @__PURE__ */ jsxs11(Fragment2, { children: [
    /* @__PURE__ */ jsx13("div", { className: "df-review-ruler-corner", "aria-hidden": "true" }),
    /* @__PURE__ */ jsxs11(
      "div",
      {
        className: "df-review-ruler-gutter is-x",
        style: {
          "--df-review-ruler-step-x": `${rulerScaleX * 20}px`
        },
        children: [
          /* @__PURE__ */ jsxs11("div", { className: "df-review-ruler-frame-label", children: [
            /* @__PURE__ */ jsx13("strong", { children: size.label }),
            /* @__PURE__ */ jsxs11("span", { children: [
              size.designWidth,
              size.designHeight ? `x${size.designHeight}` : "",
              rulerUnit
            ] })
          ] }),
          rulerHover && /* @__PURE__ */ jsx13(
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
    /* @__PURE__ */ jsx13(
      "div",
      {
        className: "df-review-ruler-gutter is-y",
        style: {
          "--df-review-ruler-step-y": `${rulerScaleY * 20}px`
        },
        children: rulerHover && /* @__PURE__ */ jsx13(
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
import { Fragment as Fragment3, jsx as jsx14, jsxs as jsxs12 } from "react/jsx-runtime";
var RulerOverlay = ({
  iframeRef,
  isRulerDragging,
  rulerHover,
  rulerMeasure,
  rulerMeasureLabel,
  rulerOverlayRef,
  size
}) => {
  return /* @__PURE__ */ jsxs12(
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
        rulerHover && /* @__PURE__ */ jsxs12(Fragment3, { children: [
          /* @__PURE__ */ jsx14(
            "div",
            {
              className: "df-review-ruler-guide is-x",
              "aria-hidden": "true",
              style: { top: `${rulerHover.y}px` }
            }
          ),
          /* @__PURE__ */ jsx14(
            "div",
            {
              className: "df-review-ruler-guide is-y",
              "aria-hidden": "true",
              style: { left: `${rulerHover.x}px` }
            }
          )
        ] }),
        rulerMeasure && (rulerMeasure.width > 0 || rulerMeasure.height > 0) && /* @__PURE__ */ jsxs12(Fragment3, { children: [
          /* @__PURE__ */ jsx14(
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
          /* @__PURE__ */ jsx14(
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

// src/react-shell/target/frame.tsx
import { jsx as jsx15, jsxs as jsxs13 } from "react/jsx-runtime";
var ReviewTargetFrame = ({
  canWriteArea,
  canWriteDom,
  frameScrollRef,
  figmaFrameUrl,
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
  onSetReviewMode
}) => {
  const showRuler = isRulerVisible && isRulerAvailable;
  const targetHref = getTargetOpenHref(targetSrc);
  return /* @__PURE__ */ jsx15("main", { className: "df-review-stage", children: /* @__PURE__ */ jsxs13("div", { className: "df-review-frame", children: [
    /* @__PURE__ */ jsx15("div", { className: "df-review-frame-scroll", ref: frameScrollRef, children: /* @__PURE__ */ jsx15("div", { className: "df-review-frame-canvas", children: /* @__PURE__ */ jsx15("div", { className: "df-review-target-stack", children: /* @__PURE__ */ jsxs13(
      "div",
      {
        className: `df-review-device-frame${showRuler ? " is-ruler" : ""}`,
        children: [
          showRuler && /* @__PURE__ */ jsx15(
            RulerGutters,
            {
              rulerHover,
              rulerScaleX,
              rulerScaleY,
              rulerUnit,
              size
            }
          ),
          /* @__PURE__ */ jsxs13(
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
                /* @__PURE__ */ jsx15(
                  "iframe",
                  {
                    ref: iframeRef,
                    width: size.width,
                    height: size.height,
                    src: targetSrc,
                    title: "Review target",
                    onLoad: onLoadTarget
                  },
                  targetSrc
                ),
                showRuler && /* @__PURE__ */ jsx15(
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
          ),
          /* @__PURE__ */ jsxs13("div", { className: "df-review-frame-link-stack", children: [
            /* @__PURE__ */ jsx15(
              "a",
              {
                "aria-label": "Open target page",
                className: "df-review-frame-link is-target",
                href: targetHref,
                rel: "noreferrer",
                target: "_blank",
                title: "Open target page",
                children: /* @__PURE__ */ jsx15(ExternalLink, { "aria-hidden": "true" })
              }
            ),
            figmaFrameUrl && /* @__PURE__ */ jsx15(
              "a",
              {
                "aria-label": "Open Figma frame",
                className: "df-review-frame-link is-figma",
                href: figmaFrameUrl,
                rel: "noreferrer",
                target: "_blank",
                title: "Open Figma frame",
                children: /* @__PURE__ */ jsx15(FigmaIcon, {})
              }
            )
          ] })
        ]
      }
    ) }) }) }),
    /* @__PURE__ */ jsx15("div", { className: "df-review-frame-actions", children: /* @__PURE__ */ jsx15(
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
function getTargetOpenHref(targetSrc) {
  const url = new URL(targetSrc, window.location.origin);
  url.searchParams.delete("__dfwr_target");
  return `${url.pathname}${url.search}${url.hash}`;
}
var FigmaIcon = () => /* @__PURE__ */ jsx15(
  "svg",
  {
    "aria-hidden": "true",
    viewBox: "0 0 24 24",
    xmlns: "http://www.w3.org/2000/svg",
    children: /* @__PURE__ */ jsx15("path", { d: "M15.852 8.981h-4.588V0h4.588c2.476 0 4.49 2.014 4.49 4.49s-2.014 4.491-4.49 4.491zM12.735 7.51h3.117c1.665 0 3.019-1.355 3.019-3.019s-1.355-3.019-3.019-3.019h-3.117V7.51zm0 1.471H8.148c-2.476 0-4.49-2.014-4.49-4.49S5.672 0 8.148 0h4.588v8.981zm-4.587-7.51c-1.665 0-3.019 1.355-3.019 3.019s1.354 3.02 3.019 3.02h3.117V1.471H8.148zm4.587 15.019H8.148c-2.476 0-4.49-2.014-4.49-4.49s2.014-4.49 4.49-4.49h4.588v8.98zM8.148 8.981c-1.665 0-3.019 1.355-3.019 3.019s1.355 3.019 3.019 3.019h3.117V8.981H8.148zM8.172 24c-2.489 0-4.515-2.014-4.515-4.49s2.014-4.49 4.49-4.49h4.588v4.441C12.735 21.964 10.688 24 8.172 24zm-.024-7.51a3.023 3.023 0 0 0-3.019 3.019c0 1.665 1.365 3.019 3.044 3.019 1.705 0 3.093-1.376 3.093-3.068v-2.97H8.148zm7.704 0h-.098c-2.476 0-4.49-2.014-4.49-4.49s2.014-4.49 4.49-4.49h.098c2.476 0 4.49 2.014 4.49 4.49s-2.014 4.49-4.49 4.49zm-.097-7.509c-1.665 0-3.019 1.355-3.019 3.019s1.355 3.019 3.019 3.019h.098c1.665 0 3.019-1.355 3.019-3.019s-1.355-3.019-3.019-3.019h-.098z" })
  }
);

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
    targetDocument?.body.classList.contains("is-help") || targetDocument?.querySelector(".helper.onShow") || getStoredOverlayState(targetDocument, "grid")
  ),
  figma: Boolean(
    targetDocument?.querySelector(
      ".helper-figma-root, .helper-figma-loading-backdrop"
    ) || getStoredOverlayState(targetDocument, "figma")
  )
});

// src/react-shell/topbar.tsx
import { jsx as jsx16, jsxs as jsxs14 } from "react/jsx-runtime";
var ReviewScopeIcon2 = ({ scope }) => {
  if (scope === "mobile") return /* @__PURE__ */ jsx16(Smartphone, { "aria-hidden": "true" });
  if (scope === "tablet") return /* @__PURE__ */ jsx16(RectangleHorizontal, { "aria-hidden": "true" });
  if (scope === "wide") return /* @__PURE__ */ jsx16(Maximize2, { "aria-hidden": "true" });
  if (scope === "dom") return /* @__PURE__ */ jsx16(SquareMousePointer, { "aria-hidden": "true" });
  return /* @__PURE__ */ jsx16(Monitor, { "aria-hidden": "true" });
};
var ViewportPresetIcon = ({
  preset
}) => {
  return /* @__PURE__ */ jsx16(ReviewScopeIcon2, { scope: getViewportPresetKind(preset) });
};
var ReviewTopbar = ({
  draftTarget,
  copyLabel,
  viewportPresets,
  size,
  presetScopeCounts,
  isRulerAvailable,
  isRulerVisible,
  targetOverlayState,
  isFigmaOverlayAvailable,
  onDraftTargetChange,
  onApplyTarget,
  onOpenSitemap,
  onCopyCurrentUrl,
  onSizeChange,
  onToggleRuler,
  onToggleTargetOverlay,
  onOpenInitialPrompt,
  onOpenSettings
}) => {
  return /* @__PURE__ */ jsxs14("header", { className: "df-review-topbar", children: [
    /* @__PURE__ */ jsxs14(
      "form",
      {
        className: "df-review-address",
        onSubmit: (event) => {
          event.preventDefault();
          onApplyTarget();
        },
        children: [
          /* @__PURE__ */ jsx16(
            "button",
            {
              "aria-label": "Open sitemap",
              className: "df-review-sitemap-button",
              type: "button",
              onClick: onOpenSitemap,
              children: /* @__PURE__ */ jsx16(Map2, { "aria-hidden": "true" })
            }
          ),
          /* @__PURE__ */ jsx16(
            "input",
            {
              "aria-label": "Path",
              value: draftTarget,
              onChange: (event) => onDraftTargetChange(event.target.value)
            }
          ),
          /* @__PURE__ */ jsx16("button", { type: "submit", children: "Load" }),
          /* @__PURE__ */ jsx16("button", { type: "button", onClick: onCopyCurrentUrl, children: copyLabel })
        ]
      }
    ),
    /* @__PURE__ */ jsxs14("div", { className: "df-review-tools", children: [
      /* @__PURE__ */ jsxs14("div", { className: "df-review-tool-controls", children: [
        /* @__PURE__ */ jsx16("div", { className: "df-review-presets", "aria-label": "Viewport presets", children: viewportPresets.map((preset) => /* @__PURE__ */ jsxs14(
          "button",
          {
            className: preset.label === size.label ? "is-active" : "",
            type: "button",
            onClick: () => onSizeChange(preset),
            children: [
              /* @__PURE__ */ jsx16(ViewportPresetIcon, { preset }),
              /* @__PURE__ */ jsx16("span", { className: "df-review-preset-copy", children: /* @__PURE__ */ jsx16("strong", { children: preset.label }) }),
              /* @__PURE__ */ jsx16("span", { className: "df-review-preset-count", children: presetScopeCounts.get(getViewportPresetKind(preset)) ?? 0 })
            ]
          },
          preset.label
        )) }),
        /* @__PURE__ */ jsx16("span", { className: "df-review-tool-divider", "aria-hidden": "true", children: "|" }),
        /* @__PURE__ */ jsxs14("span", { className: "df-review-active-size", children: [
          size.width,
          "x",
          size.height
        ] })
      ] }),
      /* @__PURE__ */ jsxs14("div", { className: "df-review-overlays", "aria-label": "Target overlays", children: [
        isRulerAvailable && /* @__PURE__ */ jsx16(
          "button",
          {
            "aria-label": "Toggle ruler",
            className: `df-review-overlay-button is-ruler${isRulerVisible ? " is-active" : ""}`,
            type: "button",
            onClick: onToggleRuler,
            children: /* @__PURE__ */ jsx16(Ruler, { "aria-hidden": "true" })
          }
        ),
        /* @__PURE__ */ jsx16(
          "button",
          {
            "aria-label": "Toggle grid overlay",
            className: `df-review-overlay-button is-grid${targetOverlayState.grid ? " is-active" : ""}`,
            type: "button",
            onClick: () => onToggleTargetOverlay("grid"),
            children: /* @__PURE__ */ jsx16(LayoutGrid, { "aria-hidden": "true" })
          }
        ),
        /* @__PURE__ */ jsx16(
          "button",
          {
            "aria-disabled": !isFigmaOverlayAvailable,
            "aria-label": isFigmaOverlayAvailable ? "Toggle Figma overlay" : FIGMA_OVERLAY_UNAVAILABLE_MESSAGE,
            className: `df-review-overlay-button is-figma${targetOverlayState.figma ? " is-active" : ""}${isFigmaOverlayAvailable ? "" : " is-disabled"}`,
            disabled: !isFigmaOverlayAvailable,
            type: "button",
            onClick: () => onToggleTargetOverlay("figma"),
            children: /* @__PURE__ */ jsx16(Image, { "aria-hidden": "true" })
          }
        ),
        /* @__PURE__ */ jsx16("span", { className: "df-review-tool-divider", "aria-hidden": "true", children: "|" }),
        /* @__PURE__ */ jsx16(
          "button",
          {
            "aria-label": "Open initial prompt",
            className: "df-review-overlay-button is-prompt",
            type: "button",
            onClick: onOpenInitialPrompt,
            children: /* @__PURE__ */ jsx16(CircleQuestionMark, { "aria-hidden": "true" })
          }
        ),
        /* @__PURE__ */ jsx16(
          "button",
          {
            "aria-label": "Open settings",
            className: "df-review-overlay-button is-settings",
            type: "button",
            onClick: onOpenSettings,
            children: /* @__PURE__ */ jsx16(Settings, { "aria-hidden": "true" })
          }
        )
      ] })
    ] })
  ] });
};

// src/react-shell/hooks/use.review.controller.ts
import {
  useCallback as useCallback5
} from "react";

// src/react-shell/hooks/use.review.item.restore.ts
import {
  useCallback
} from "react";
function runWithAutoScrollBehavior(targetDocument, callback) {
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
var waitForNextAnimationFrame = (targetWindow) => new Promise((resolve) => {
  targetWindow.requestAnimationFrame(() => resolve());
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
  const clearSelectedItem = useCallback(() => {
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
  const applyItemScroll = useCallback(
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
      runWithAutoScrollBehavior(targetDocument, () => {
        setDocumentScrollInstantly(
          targetWindow,
          targetDocument,
          getReviewItemRestoreScrollPosition(
            targetWindow,
            targetDocument,
            item,
            anchorElement
          )
        );
      });
      onSyncTargetViewport();
      controllerRef.current?.highlightItem(item.id);
      return true;
    },
    [controllerRef, iframeRef, onSyncTargetViewport, selectedItemIdRef]
  );
  const applyPendingRestore = useCallback(() => {
    const item = pendingRestoreRef.current;
    if (!item) return;
    void applyItemScroll(item).then((didApply) => {
      if (didApply && pendingRestoreRef.current?.id === item.id) {
        pendingRestoreRef.current = null;
      }
    });
  }, [applyItemScroll, pendingRestoreRef]);
  const restoreReviewItem = useCallback(
    (item) => {
      const nextTarget = getItemTarget(item, reviewPathPrefix);
      const nextSize = getRestoredSize(item, viewportPresets);
      pendingRestoreRef.current = item;
      selectedItemIdRef.current = item.id;
      onSelectedItemIdChange(item.id);
      onActiveRouteChange(nextTarget);
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
      reviewPathPrefix,
      selectedItemIdRef,
      source,
      targetRef,
      viewportPresets
    ]
  );
  const restoreInitialItem = useCallback(async () => {
    const itemId = pendingInitialItemIdRef.current;
    if (!itemId) return;
    pendingInitialItemIdRef.current = null;
    const item = await adapter.get(itemId);
    if (item) {
      restoreReviewItem(item);
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
import {
  useCallback as useCallback2,
  useEffect as useEffect2
} from "react";

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
    if (nextTarget !== targetRef.current && !pageTargets.has(nextTarget)) {
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
    const nextTarget = normalizeTarget(url.pathname, reviewPathPrefix);
    if (nextTarget === targetRef.current) return;
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
    }
  };
};

// src/react-shell/hooks/use.review.kit.lifecycle.ts
var useReviewKitLifecycle = ({
  adapter,
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
  const destroyReviewKit = useCallback2(() => {
    cleanupTargetRef.current?.();
    cleanupTargetRef.current = null;
    controllerRef.current?.destroy();
    controllerRef.current = null;
  }, [cleanupTargetRef, controllerRef]);
  const initReviewKit = useCallback2(() => {
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
  const reloadReviewKit = useCallback2(async () => {
    await controllerRef.current?.reload();
  }, [controllerRef]);
  const setControllerReviewMode = useCallback2(
    (nextMode) => {
      controllerRef.current?.setMode(nextMode);
      onModeChange(controllerRef.current?.getMode() ?? "idle");
    },
    [controllerRef, onModeChange]
  );
  useEffect2(() => destroyReviewKit, [destroyReviewKit]);
  useEffect2(() => {
    const frameDocument = iframeRef.current?.contentDocument;
    if (!frameDocument || frameDocument.readyState !== "complete") return;
    initReviewKit();
  }, [iframeRef, initReviewKit]);
  useEffect2(() => {
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
import { useCallback as useCallback3, useEffect as useEffect3, useRef } from "react";
var TARGET_OVERLAY_REFRESH_DELAYS = [80, 240, 600];
var useReviewTargetOverlay = ({
  iframeRef,
  isFigmaOverlayAvailable,
  targetOverlayState,
  onTargetOverlayStateChange
}) => {
  const refreshTimersRef = useRef([]);
  const clearRefreshTimers = useCallback3(() => {
    refreshTimersRef.current.forEach((timer) => window.clearTimeout(timer));
    refreshTimersRef.current = [];
  }, []);
  const updateTargetOverlayState = useCallback3(() => {
    const state = getTargetOverlayState(
      iframeRef.current?.contentDocument ?? void 0
    );
    onTargetOverlayStateChange(state);
    return state;
  }, [iframeRef, onTargetOverlayStateChange]);
  const refreshTargetOverlayState = useCallback3(() => {
    clearRefreshTimers();
    updateTargetOverlayState();
    refreshTimersRef.current = TARGET_OVERLAY_REFRESH_DELAYS.map(
      (delay) => window.setTimeout(updateTargetOverlayState, delay)
    );
  }, [clearRefreshTimers, updateTargetOverlayState]);
  const dispatchTargetOverlayHotkey = useCallback3(
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
  const toggleTargetOverlay = useCallback3(
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
  const closeTargetOverlay = useCallback3(
    (overlay) => {
      const currentState = updateTargetOverlayState();
      if (!currentState[overlay]) return false;
      return dispatchTargetOverlayHotkey(overlay);
    },
    [dispatchTargetOverlayHotkey, updateTargetOverlayState]
  );
  useEffect3(() => {
    if (isFigmaOverlayAvailable || !targetOverlayState.figma) return;
    closeTargetOverlay("figma");
  }, [closeTargetOverlay, isFigmaOverlayAvailable, targetOverlayState.figma]);
  useEffect3(() => clearRefreshTimers, [clearRefreshTimers]);
  return {
    closeTargetOverlay,
    refreshTargetOverlayState,
    toggleTargetOverlay
  };
};

// src/react-shell/hooks/use.review.target.sync.ts
import {
  useCallback as useCallback4,
  useEffect as useEffect4
} from "react";
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
  const syncShellTarget = useCallback4(
    (nextTarget) => {
      const normalizedTarget = normalizeTarget(nextTarget, reviewPathPrefix);
      if (normalizedTarget !== targetRef.current) {
        onClearSelectedItem();
        targetRef.current = normalizedTarget;
        onTargetChange(normalizedTarget);
        onDraftTargetChange(normalizedTarget);
        onActiveRouteChange(normalizedTarget);
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
  useEffect4(() => {
    targetRef.current = target;
    onActiveRouteChange(target);
  }, [onActiveRouteChange, target, targetRef]);
  useEffect4(() => {
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
  const syncTargetViewport = useCallback5(() => {
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
import {
  useCallback as useCallback6,
  useEffect as useEffect5,
  useMemo as useMemo3,
  useRef as useRef2,
  useState as useState4
} from "react";

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
var createId = () => {
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
  if (typeof window === "undefined") return createId();
  try {
    const stored = window.sessionStorage.getItem(REVIEW_PRESENCE_SESSION_KEY);
    if (stored) return stored;
    const nextId = createId();
    window.sessionStorage.setItem(REVIEW_PRESENCE_SESSION_KEY, nextId);
    return nextId;
  } catch {
    return createId();
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
var getPresenceUserTarget = (user, reviewPathPrefix) => normalizeTarget(user.target || user.routeKey, reviewPathPrefix);
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
  const presenceSessionRef = useRef2(null);
  const [presenceUsers, setPresenceUsers] = useState4([]);
  const [presenceSessionVersion, setPresenceSessionVersion] = useState4(0);
  const presenceSessionId = useMemo3(getReviewPresenceSessionId, []);
  const normalizedReviewUserId = reviewUserId.trim();
  const presenceDisplayName = getReviewPresenceDisplayName(
    normalizedReviewUserId
  );
  const presenceColor = getReviewPresenceColor(
    normalizedReviewUserId || presenceSessionId
  );
  const presenceViewport = useMemo3(
    () => ({
      label: size.label,
      width: size.width,
      height: size.height,
      kind: getViewportPresetKind(size)
    }),
    [size]
  );
  const presenceStatus = mode === "idle" ? "reviewing" : "editing";
  const visiblePresenceUsers = useMemo3(
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
  const currentPagePresenceUsers = useMemo3(
    () => visiblePresenceUsers.filter((user) => {
      const userTarget = getPresenceUserTarget(user, reviewPathPrefix);
      return userTarget === activeRoute;
    }),
    [activeRoute, reviewPathPrefix, visiblePresenceUsers]
  );
  const pagePresenceUsers = useMemo3(() => {
    const usersByTarget = /* @__PURE__ */ new Map();
    visiblePresenceUsers.forEach((user) => {
      const userTarget = getPresenceUserTarget(user, reviewPathPrefix);
      const pageUsers = usersByTarget.get(userTarget) ?? [];
      pageUsers.push(user);
      usersByTarget.set(userTarget, pageUsers);
    });
    return usersByTarget;
  }, [reviewPathPrefix, visiblePresenceUsers]);
  const getCurrentPresenceState = useCallback6(
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
  const getCurrentPresenceStateRef = useRef2(getCurrentPresenceState);
  getCurrentPresenceStateRef.current = getCurrentPresenceState;
  useEffect5(() => {
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
  useEffect5(() => {
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
import {
  useCallback as useCallback8,
  useEffect as useEffect7,
  useState as useState6
} from "react";

// src/react-shell/hooks/use.review.ruler.drag.ts
import {
  useCallback as useCallback7,
  useEffect as useEffect6,
  useMemo as useMemo4,
  useRef as useRef3,
  useState as useState5
} from "react";

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
  const rulerOverlayRef = useRef3(null);
  const rulerDragRectRef = useRef3(null);
  const isRulerDraggingRef = useRef3(false);
  const sizeRef = useRef3(size);
  const [rulerStart, setRulerStart] = useState5(null);
  const [rulerPoint, setRulerPoint] = useState5(null);
  const [rulerHover, setRulerHover] = useState5(null);
  const [isRulerDragging, setIsRulerDragging] = useState5(false);
  const rulerMeasure = useMemo4(
    () => getRulerMeasure(rulerStart, rulerPoint),
    [rulerPoint, rulerStart]
  );
  const clearRulerMeasure = useCallback7(() => {
    rulerDragRectRef.current = null;
    isRulerDraggingRef.current = false;
    setRulerStart(null);
    setRulerPoint(null);
    setRulerHover(null);
    setIsRulerDragging(false);
  }, []);
  const finishRulerDrag = useCallback7((point) => {
    if (point) {
      setRulerPoint(point);
    }
    rulerDragRectRef.current = null;
    isRulerDraggingRef.current = false;
    setIsRulerDragging(false);
  }, []);
  const startRulerDrag = useCallback7(
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
  useEffect6(() => {
    sizeRef.current = size;
  }, [size]);
  useEffect6(() => {
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
  useEffect6(() => {
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
  const [isRulerVisible, setIsRulerVisible] = useState6(false);
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
  const closeRuler = useCallback8(() => {
    if (!isRulerVisible) return false;
    setIsRulerVisible(false);
    clearRulerMeasure();
    return true;
  }, [clearRulerMeasure, isRulerVisible]);
  const toggleRuler = useCallback8(() => {
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
  useEffect7(() => {
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

// src/react-shell/hooks/use.review.settings.ts
import { useCallback as useCallback9, useEffect as useEffect8, useState as useState7 } from "react";
var useReviewSettings = ({
  onCancelReviewMode,
  onCloseInitialPrompt,
  onCloseSitemap,
  onReloadTargetFrame
}) => {
  const [figmaTokenDraft, setFigmaTokenDraft] = useState7(getStoredFigmaToken);
  const [reviewUserId, setReviewUserId] = useState7(getStoredReviewUserId);
  const [reviewUserIdDraft, setReviewUserIdDraft] = useState7(
    getStoredReviewUserId
  );
  const [reviewTheme, setReviewTheme] = useState7(getStoredReviewTheme);
  const [reviewThemeDraft, setReviewThemeDraft] = useState7(getStoredReviewTheme);
  const [systemReviewTheme, setSystemReviewTheme] = useState7(getSystemReviewTheme);
  const [figmaSettingsStatus, setFigmaSettingsStatus] = useState7("");
  const [isFigmaSettingsOpen, setIsFigmaSettingsOpen] = useState7(false);
  const [isFigmaTokenVisible, setIsFigmaTokenVisible] = useState7(false);
  const [isFigmaTokenGuideOpen, setIsFigmaTokenGuideOpen] = useState7(false);
  const effectiveReviewTheme = reviewTheme === "system" ? systemReviewTheme : reviewTheme;
  const closeFigmaSettings = useCallback9(() => {
    setIsFigmaSettingsOpen(false);
    setFigmaSettingsStatus("");
    setIsFigmaTokenVisible(false);
    setIsFigmaTokenGuideOpen(false);
  }, []);
  const openFigmaSettings = useCallback9(() => {
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
  const saveReviewSettings = useCallback9(
    (token, userId, theme) => {
      const nextToken = token.trim();
      const nextUserId = userId.trim();
      const nextTheme = normalizeReviewTheme(theme);
      const shouldReload = nextToken !== getStoredFigmaToken() || nextUserId !== getStoredReviewUserId();
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
  useEffect8(() => {
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
  useEffect8(() => {
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
import { useCallback as useCallback10, useMemo as useMemo5, useState as useState8 } from "react";
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
  const [items, setItems] = useState8([]);
  const [hiddenOverlayItemIds, setHiddenOverlayItemIds] = useState8(
    () => /* @__PURE__ */ new Set()
  );
  const [qaFilter, setQaFilter] = useState8("all");
  const [qaStatusFilter, setQaStatusFilter] = useState8("all");
  const [sitemapItems, setSitemapItems] = useState8(() => ({
    local: [],
    remote: []
  }));
  const targetSrc = useMemo5(() => buildTargetSrc(target), [target]);
  const pageTargets = useMemo5(
    () => new Set(
      pages.map((page) => normalizeTarget(page.href, reviewPathPrefix))
    ),
    [pages, reviewPathPrefix]
  );
  const sitemapSourceItems = useMemo5(
    () => isRemoteSource ? sitemapItems.remote : sitemapItems.local,
    [isRemoteSource, sitemapItems]
  );
  const activeItems = useMemo5(
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
  const numberedActiveItems = useMemo5(
    () => getNumberedReviewItems(activeItems, reviewViewportPresets),
    [activeItems, reviewViewportPresets]
  );
  const scopeFilteredNumberedActiveItems = useMemo5(
    () => qaFilter === "all" ? numberedActiveItems : numberedActiveItems.filter(
      (numberedItem) => numberedItem.scope === qaFilter
    ),
    [numberedActiveItems, qaFilter]
  );
  const statusFilteredNumberedActiveItems = useMemo5(
    () => qaStatusFilter === "all" ? numberedActiveItems : numberedActiveItems.filter(
      (numberedItem) => normalizeReviewItemStatus(numberedItem.item.status) === qaStatusFilter
    ),
    [numberedActiveItems, qaStatusFilter]
  );
  const filteredNumberedActiveItems = useMemo5(
    () => qaStatusFilter === "all" ? scopeFilteredNumberedActiveItems : scopeFilteredNumberedActiveItems.filter(
      (numberedItem) => normalizeReviewItemStatus(numberedItem.item.status) === qaStatusFilter
    ),
    [qaStatusFilter, scopeFilteredNumberedActiveItems]
  );
  const hiddenOverlayItemIdList = useMemo5(
    () => Array.from(hiddenOverlayItemIds),
    [hiddenOverlayItemIds]
  );
  const qaFilterCounts = useMemo5(() => {
    const counts = /* @__PURE__ */ new Map();
    counts.set("all", statusFilteredNumberedActiveItems.length);
    statusFilteredNumberedActiveItems.forEach((numberedItem) => {
      counts.set(numberedItem.scope, (counts.get(numberedItem.scope) ?? 0) + 1);
    });
    return counts;
  }, [statusFilteredNumberedActiveItems]);
  const qaStatusFilterCounts = useMemo5(() => {
    const counts = /* @__PURE__ */ new Map();
    counts.set("all", scopeFilteredNumberedActiveItems.length);
    scopeFilteredNumberedActiveItems.forEach((numberedItem) => {
      const status = normalizeReviewItemStatus(numberedItem.item.status);
      counts.set(status, (counts.get(status) ?? 0) + 1);
    });
    return counts;
  }, [scopeFilteredNumberedActiveItems]);
  const getItemPreset = useCallback10(
    (item) => findViewportPreset(
      viewportPresets,
      item.viewport?.width ?? 0,
      item.viewport?.height ?? 0
    ),
    [viewportPresets]
  );
  const getItemPresetScope = useCallback10(
    (item) => getViewportPresetKind(getItemPreset(item)),
    [getItemPreset]
  );
  const getItemPresetColumn = useCallback10(
    (item) => {
      const preset = getItemPreset(item);
      const presetIndex = Math.max(0, viewportPresets.indexOf(preset));
      return createSitemapViewportColumn(preset, presetIndex);
    },
    [getItemPreset, viewportPresets]
  );
  const getItemCountScope = useCallback10(
    (item) => item.scope === "dom" ? "dom" : getItemPresetScope(item),
    [getItemPresetScope]
  );
  const activeRemainingItemCount = useMemo5(
    () => activeItems.filter(
      (item) => normalizeReviewItemStatus(item.status) !== SITEMAP_STATUS_DONE
    ).length,
    [activeItems]
  );
  const presetScopeCounts = useMemo5(() => {
    const counts = /* @__PURE__ */ new Map();
    activeItems.forEach((item) => {
      const scope = getItemPresetScope(item);
      counts.set(scope, (counts.get(scope) ?? 0) + 1);
    });
    return counts;
  }, [activeItems, getItemPresetScope]);
  const currentPresetScope = getViewportPresetKind(size);
  const pageQaCounts = useMemo5(() => {
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
  const allQaCount = useMemo5(
    () => Array.from(pageQaCounts.values()).reduce(
      addSitemapQaCounts,
      createEmptySitemapQaCount()
    ),
    [pageQaCounts]
  );
  const selectedNumberedItem = useMemo5(
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
import { useEffect as useEffect9 } from "react";
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
  useEffect9(() => {
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
  useEffect9(() => {
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
import {
  useMemo as useMemo6,
  useRef as useRef4,
  useState as useState9
} from "react";

// src/react-shell/adapters.ts
var ALL_REVIEW_WRITE_MODES = ["dom", "note", "area"];
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
    statusOptions: [...REVIEW_WORKFLOW_STATUS_OPTIONS],
    updateStatus: ({ id, status }) => adapters.local.update(id, { status }),
    syncSubmission: ({ id, patch }) => adapters.local.update(id, patch),
    writeModes: [...ALL_REVIEW_WRITE_MODES],
    canUpdate: true,
    canRemove: true
  };
  const remote = adapters.remote ? {
    label: "remote",
    adapter: adapters.remote,
    statusOptions: [...REVIEW_WORKFLOW_STATUS_OPTIONS],
    updateStatus: ({ id, status }) => adapters.remote?.update(id, { status }) ?? Promise.reject(new Error("Remote adapter is not available.")),
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
  const updateAdapter = adapterConfig.update;
  const updateStatus = adapterConfig.updateStatus ? adapterConfig.updateStatus : updateAdapter ? ({ id, status }) => updateAdapter(id, { status }) : void 0;
  const writeModes = normalizeWriteModes(
    adapterConfig.create ? adapterConfig.canWrite ?? adapterConfig.label === "local" : false
  );
  return {
    label: adapterConfig.label,
    pageId: adapterConfig.pageId,
    statusOptions,
    updateStatus,
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
  const reviewViewportPresets = useMemo6(
    () => toReviewViewportPresets(viewportPresets),
    [viewportPresets]
  );
  const normalizedAdapters = useMemo6(
    () => normalizeReviewShellAdapters(adapters),
    [adapters]
  );
  const localAdapterEntry = normalizedAdapters.local;
  const remoteAdapterEntry = normalizedAdapters.remote;
  const sourceEntries = normalizedAdapters.sources;
  const defaultSource = sourceEntries[0]?.label ?? "local";
  const [source, setSource] = useState9(() => {
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
  const iframeRef = useRef4(null);
  const frameScrollRef = useRef4(null);
  const controllerRef = useRef4(null);
  const cleanupTargetRef = useRef4(null);
  const pendingRestoreRef = useRef4(null);
  const pendingInitialItemIdRef = useRef4(getInitialItemId());
  const selectedItemIdRef = useRef4(getInitialItemId());
  const hiddenOverlayItemIdListRef = useRef4([]);
  const [target, setTarget] = useState9(
    () => getInitialTarget(reviewPathPrefix)
  );
  const [draftTarget, setDraftTarget] = useState9(
    () => getInitialTarget(reviewPathPrefix)
  );
  const [activeRoute, setActiveRoute] = useState9(
    () => getInitialTarget(reviewPathPrefix)
  );
  const [size, setSize] = useState9(
    () => getInitialSize(viewportPresets)
  );
  const [mode, setMode] = useState9("idle");
  const [targetOverlayState, setTargetOverlayState] = useState9({
    grid: false,
    figma: false
  });
  const [selectedItemId, setSelectedItemId] = useState9(getInitialItemId());
  const [isListVisible, setIsListVisible] = useState9(true);
  const [isSitemapOpen, setIsSitemapOpen] = useState9(false);
  const [isInitialPromptOpen, setIsInitialPromptOpen] = useState9(false);
  const [copyLabel, setCopyLabel] = useState9("Copy URL");
  const [toastMessage, setToastMessage] = useState9("");
  const [copiedPromptKey, setCopiedPromptKey] = useState9(null);
  const targetRef = useRef4(target);
  const sizeRef = useRef4(size);
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
var writeClipboardText = async (value) => {
  try {
    await navigator.clipboard.writeText(value);
    return;
  } catch {
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
var updateReviewItemComment = async ({
  activeAdapterEntry,
  item,
  comment,
  onRefreshReviewData,
  onToast
}) => {
  const nextComment = comment.trim();
  if (!nextComment) throw new Error("Comment is required.");
  if (!activeAdapterEntry.canUpdate) {
    throw new Error(
      `Review adapter "${activeAdapterEntry.label}" does not support edit.`
    );
  }
  if (nextComment === item.comment.trim()) {
    onToast?.("No QA comment changes");
    return item;
  }
  const updated = await activeAdapterEntry.adapter.update(item.id, {
    comment: nextComment
  });
  await onRefreshReviewData();
  onToast?.("QA comment updated");
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
import { Fragment as Fragment4, jsx as jsx17, jsxs as jsxs15 } from "react/jsx-runtime";
var getReviewModeWriteMode = (mode) => {
  if (mode === "element") return "dom";
  if (mode === "note" || mode === "area") return mode;
  return null;
};
var SOURCE_PANEL_MAX_WIDTH = 440;
var SOURCE_PANEL_MIN_WIDTH = 240;
var SOURCE_PANEL_MAX_HEIGHT = 260;
var getSectionOutlineFilterTerms = (value) => value.trim().toLowerCase().split(/\s+/).filter(Boolean);
var getSectionOutlineEntryCount = (entries) => entries.reduce(
  (count, entry) => count + 1 + getSectionOutlineEntryCount(entry.children),
  0
);
var matchesSectionOutlineFilter = (entry, terms) => {
  if (terms.length === 0) return true;
  const text = [
    entry.label,
    entry.filePath,
    entry.source?.file,
    entry.data?.file
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
  presence
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
  const sourceShortcutCleanupRef = useRef5(null);
  const sourceInspectorInteractionRef = useRef5(false);
  const [sidePanel, setSidePanel] = useState10("qa");
  const [sourceInspectorState, setSourceInspectorState] = useState10(null);
  const [sectionOutline, setSectionOutline] = useState10(null);
  const [sectionOutlineFilter, setSectionOutlineFilter] = useState10("");
  const [collapsedSectionOutlineIds, setCollapsedSectionOutlineIds] = useState10(() => /* @__PURE__ */ new Set());
  const [isAllQaVisible, setIsAllQaVisible] = useState10(false);
  const sourceOpenOptions = useMemo7(
    () => ({
      ...sourceInspector,
      sourceRoot
    }),
    [sourceInspector, sourceRoot]
  );
  const sourceCandidateOptions = useMemo7(
    () => ({ ignore: sourceInspector?.ignore }),
    [sourceInspector]
  );
  const sectionOutlineOptions = useMemo7(
    () => ({
      ignore: sourceInspector?.ignore,
      maxDepth: sourceInspector?.maxDepth
    }),
    [sourceInspector]
  );
  const isSourceInspectorEnabled = sourceInspector?.enabled !== false;
  const isQaPanelVisible = isListVisible && sidePanel === "qa";
  const isSourceTreePanelVisible = isSourceInspectorEnabled && isListVisible && sidePanel === "source";
  const sectionOutlineFilterTerms = useMemo7(
    () => getSectionOutlineFilterTerms(sectionOutlineFilter),
    [sectionOutlineFilter]
  );
  const filteredSectionOutline = useMemo7(
    () => sectionOutline ? filterSectionOutlineEntries(sectionOutline, sectionOutlineFilterTerms) : [],
    [sectionOutline, sectionOutlineFilterTerms]
  );
  const sectionOutlineTotalCount = useMemo7(
    () => getSectionOutlineEntryCount(sectionOutline ?? []),
    [sectionOutline]
  );
  const filteredSectionOutlineCount = useMemo7(
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
  const [targetFigmaState, setTargetFigmaState] = useState10(null);
  const targetFigmaConfig = targetFigmaState?.targetSrc === targetSrc ? targetFigmaState.config : null;
  const figmaFrameUrl = useMemo7(
    () => getFigmaFrameUrl(targetFigmaConfig, size),
    [targetFigmaConfig, size]
  );
  const isFigmaOverlayAvailable = isViewportFigmaOverlayAvailable && Boolean(targetFigmaConfig);
  const [editingItem, setEditingItem] = useState10(null);
  const initialPromptText = initialPrompt.trim();
  const refreshItems = useCallback11(
    () => refreshReviewItems({
      activeRoute,
      adapter,
      isRemoteSource,
      pageId: activeAdapterEntry.pageId,
      projectId,
      onItemsChange: setItems
    }),
    [activeAdapterEntry.pageId, activeRoute, adapter, isRemoteSource, projectId]
  );
  const refreshSitemapItems = useCallback11(
    () => refreshSitemapReviewItems({
      localAdapterEntry,
      projectId,
      remoteAdapterEntry,
      onSitemapItemsChange: setSitemapItems
    }),
    [localAdapterEntry, projectId, remoteAdapterEntry]
  );
  const cancelReviewMode = useCallback11(() => {
    const controller = controllerRef.current;
    if (!controller || controller.getMode() === "idle") return false;
    controller.setMode("idle");
    setMode(controller.getMode());
    return true;
  }, []);
  const closePromptModal = useCallback11(() => {
    setIsInitialPromptOpen(false);
  }, []);
  const closeSitemap = useCallback11(() => {
    setIsSitemapOpen(false);
  }, []);
  const reloadTargetFrame = useCallback11(() => {
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
  const closeRulerPanels = useCallback11(() => {
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
  const refreshReviewData2 = useCallback11(() => {
    return refreshReviewData({
      onRefreshItems: refreshItems,
      onRefreshSitemapItems: refreshSitemapItems,
      onReloadReviewKit: reloadReviewKit
    });
  }, [refreshItems, refreshSitemapItems, reloadReviewKit]);
  const toggleItemOverlayVisibility = useCallback11((itemId) => {
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
  useEffect10(() => {
    void refreshItems();
  }, [refreshItems]);
  useEffect10(() => {
    void refreshSitemapItems();
  }, [refreshSitemapItems]);
  useEffect10(() => {
    if (!isSitemapOpen) return;
    void refreshSitemapItems();
  }, [isSitemapOpen, refreshSitemapItems]);
  useEffect10(() => {
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
    const nextSource = parsedInput.source && sourceEntries.some((entry) => entry.label === parsedInput.source) ? parsedInput.source : source;
    const nextSize = parsedInput.width && parsedInput.height ? findViewportPreset(
      viewportPresets,
      parsedInput.width,
      parsedInput.height
    ) : sizeRef.current;
    const nextAdapter = sourceEntries.find((entry) => entry.label === nextSource) ?? activeAdapterEntry;
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
    setActiveRoute(normalizedTarget);
    setDraftTarget(normalizedTarget);
    setSize(nextSize);
    setTarget(normalizedTarget);
    updateShellUrl(normalizedTarget, nextSize, nextSource);
  };
  const selectPage = (href) => {
    const normalizedTarget = normalizeTarget(href, reviewPathPrefix);
    clearSelectedItem();
    setIsAllQaVisible(false);
    targetRef.current = normalizedTarget;
    setActiveRoute(normalizedTarget);
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
  const showToast = useCallback11(
    (message) => {
      setToastMessage(message);
      window.setTimeout(() => {
        setToastMessage((current) => current === message ? "" : current);
      }, 1600);
    },
    [setToastMessage]
  );
  const refreshTargetFigmaConfig = useCallback11(() => {
    const config = getTargetFigmaFrameConfig(
      iframeRef.current?.contentWindow
    );
    setTargetFigmaState(config ? { targetSrc, config } : null);
  }, [iframeRef, targetSrc]);
  useEffect10(() => {
    const targetDocument = iframeRef.current?.contentDocument;
    setTargetFigmaOverlayLocked(targetDocument, mode === "element");
    return () => {
      setTargetFigmaOverlayLocked(targetDocument, false);
    };
  }, [iframeRef, mode, targetSrc]);
  const clearSourceInspector = useCallback11(() => {
    sourceInspectorInteractionRef.current = false;
    setSourceInspectorState(null);
  }, []);
  const getSourceInspectorRect = useCallback11(
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
  const getSourceInspectorPanelPosition = useCallback11(
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
  const showSourceInspectorForTarget = useCallback11(
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
  const showSourceOutlineForTarget = useCallback11(
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
  const openSourceCandidate = useCallback11(
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
  const getCurrentSectionOutline = useCallback11(
    () => {
      let frameDocument = null;
      try {
        frameDocument = iframeRef.current?.contentDocument ?? null;
      } catch {
        frameDocument = null;
      }
      return frameDocument ? getSectionOutline(frameDocument, sectionOutlineOptions) : [];
    },
    [iframeRef, sectionOutlineOptions]
  );
  const toggleQaPanel = useCallback11(() => {
    setSidePanel("qa");
    setIsListVisible((current) => sidePanel === "qa" ? !current : true);
  }, [setIsListVisible, sidePanel]);
  const toggleSourceTreePanel = useCallback11(() => {
    if (!isSourceInspectorEnabled) return;
    if (sidePanel === "source" && isListVisible) {
      setIsListVisible(false);
      return;
    }
    setSidePanel("source");
    setCollapsedSectionOutlineIds(/* @__PURE__ */ new Set());
    setSectionOutline(getCurrentSectionOutline());
    setIsListVisible(true);
  }, [
    getCurrentSectionOutline,
    isListVisible,
    isSourceInspectorEnabled,
    setIsListVisible,
    sidePanel
  ]);
  const toggleSectionOutlineEntry = useCallback11((entryId) => {
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
  const scrollToSection = useCallback11((entry) => {
    entry.element.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);
  const openSectionSource = useCallback11(
    (entry) => {
      const didOpen = openSourceInEditor(entry.source, {
        ...sourceOpenOptions,
        omitPosition: true
      });
      showToast(didOpen ? "Source opened" : "Source root required");
    },
    [showToast, sourceOpenOptions]
  );
  const openSectionData = useCallback11(
    (entry) => {
      const didOpen = openSourceInEditor(entry.data, sourceOpenOptions);
      showToast(didOpen ? "Data opened" : "Data hint not found");
    },
    [showToast, sourceOpenOptions]
  );
  const cleanupSourceOpenShortcut = useCallback11(() => {
    sourceShortcutCleanupRef.current?.();
    sourceShortcutCleanupRef.current = null;
  }, []);
  const bindSourceOpenShortcut = useCallback11(() => {
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
    style.textContent = `
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
        font: 700 12px/1 system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif !important;
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
        font: 800 11px/1.35 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace !important;
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
  useEffect10(() => {
    return cleanupSourceOpenShortcut;
  }, [cleanupSourceOpenShortcut]);
  const loadTargetFrame = useCallback11(() => {
    initReviewKit();
    refreshTargetFigmaConfig();
    setTargetFigmaOverlayLocked(
      iframeRef.current?.contentDocument,
      mode === "element"
    );
    bindSourceOpenShortcut();
    if (sidePanel === "source" && isListVisible) {
      setCollapsedSectionOutlineIds(/* @__PURE__ */ new Set());
      setSectionOutline(getCurrentSectionOutline());
    }
  }, [
    bindSourceOpenShortcut,
    getCurrentSectionOutline,
    iframeRef,
    initReviewKit,
    isListVisible,
    mode,
    refreshTargetFigmaConfig,
    sidePanel
  ]);
  useEffect10(() => {
    const frame = window.requestAnimationFrame(bindSourceOpenShortcut);
    return () => window.cancelAnimationFrame(frame);
  }, [bindSourceOpenShortcut, targetSrc]);
  const clearSelectedReviewItem = useCallback11(() => {
    clearSelectedItem();
    updateShellUrl(targetRef.current, sizeRef.current, source);
  }, [clearSelectedItem, sizeRef, source, targetRef]);
  const changeReviewSource = (nextSource) => {
    if (!sourceEntries.some((entry) => entry.label === nextSource)) return;
    cancelReviewMode();
    clearSelectedItem();
    setItems([]);
    setSource(nextSource);
    updateShellUrl(targetRef.current, sizeRef.current, nextSource);
  };
  const changeItemStatus = (item, nextStatus) => updateReviewItemStatus({
    activeAdapterEntry,
    item,
    nextStatus,
    onRefreshReviewData: refreshReviewData2,
    onToast: showToast
  });
  const saveItemComment = async (item, comment) => {
    await updateReviewItemComment({
      activeAdapterEntry,
      item,
      comment,
      onRefreshReviewData: refreshReviewData2,
      onToast: showToast
    });
    setEditingItem(null);
  };
  const submitItem = (numberedItem) => submitReviewItem({
    localAdapterEntry,
    numberedItem,
    remoteAdapterEntry,
    selectedItemIdRef,
    onClearSelectedItem: clearSelectedItem,
    onRefreshReviewData: refreshReviewData2,
    onToast: showToast
  });
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
  const copyItemLink = (numberedItem) => {
    const { item } = numberedItem;
    return copyPrompt(
      getShellUrlForItem(
        getItemTarget(item, reviewPathPrefix),
        getRestoredSize(item, viewportPresets),
        item.id,
        source
      ).href,
      `link:${item.id}`,
      "QA link copied"
    );
  };
  const removeItem = (item) => removeReviewItem({
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
  });
  const renderSectionOutlineEntry = (entry) => {
    const hasChildren = entry.children.length > 0;
    const isCollapsed = !isSectionOutlineFiltering && collapsedSectionOutlineIds.has(entry.id);
    return /* @__PURE__ */ jsxs15("div", { className: "df-review-section-outline-item", children: [
      /* @__PURE__ */ jsxs15(
        "div",
        {
          className: "df-review-section-outline-row",
          style: { paddingLeft: `${Math.max(0, entry.depth - 1) * 12 + 6}px` },
          children: [
            hasChildren ? /* @__PURE__ */ jsx17(
              "button",
              {
                "aria-label": isCollapsed ? `Expand ${entry.label}` : `Collapse ${entry.label}`,
                "aria-expanded": !isCollapsed,
                className: `df-review-section-outline-toggle${isCollapsed ? " is-collapsed" : ""}`,
                type: "button",
                onClick: () => toggleSectionOutlineEntry(entry.id),
                children: /* @__PURE__ */ jsx17(ChevronDown, { "aria-hidden": "true" })
              }
            ) : /* @__PURE__ */ jsx17(
              "span",
              {
                "aria-hidden": "true",
                className: "df-review-section-outline-toggle is-placeholder"
              }
            ),
            /* @__PURE__ */ jsxs15(
              "button",
              {
                className: "df-review-section-outline-name",
                type: "button",
                onClick: () => scrollToSection(entry),
                children: [
                  /* @__PURE__ */ jsx17("span", { children: entry.label }),
                  /* @__PURE__ */ jsx17("small", { children: entry.filePath })
                ]
              }
            ),
            /* @__PURE__ */ jsxs15("span", { className: "df-review-section-outline-links", children: [
              /* @__PURE__ */ jsx17(
                "button",
                {
                  "aria-label": `Open ${entry.label} data`,
                  className: "df-review-section-outline-link",
                  title: "Open data",
                  type: "button",
                  disabled: !entry.data?.file,
                  onClick: () => openSectionData(entry),
                  children: /* @__PURE__ */ jsx17(Database, { "aria-hidden": "true" })
                }
              ),
              /* @__PURE__ */ jsx17(
                "button",
                {
                  "aria-label": `Open ${entry.label} source`,
                  className: "df-review-section-outline-link",
                  title: "Open source",
                  type: "button",
                  disabled: !entry.source?.file,
                  onClick: () => openSectionSource(entry),
                  children: /* @__PURE__ */ jsx17(CodeXml, { "aria-hidden": "true" })
                }
              )
            ] })
          ]
        }
      ),
      hasChildren && !isCollapsed && /* @__PURE__ */ jsx17("div", { className: "df-review-section-outline-children", children: entry.children.map(renderSectionOutlineEntry) })
    ] }, entry.id);
  };
  return /* @__PURE__ */ jsxs15(
    "div",
    {
      className: `df-review-shell is-theme-${effectiveReviewTheme}${isListVisible ? " is-list-visible" : ""}`,
      children: [
        /* @__PURE__ */ jsx17(
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
            isFigmaOverlayAvailable,
            onDraftTargetChange: setDraftTarget,
            onApplyTarget: applyTarget,
            onOpenSitemap: () => setIsSitemapOpen(true),
            onCopyCurrentUrl: () => void copyCurrentUrl(),
            onSizeChange: setSize,
            onToggleRuler: toggleRuler,
            onToggleTargetOverlay: toggleTargetOverlay,
            onOpenInitialPrompt: () => {
              setIsInitialPromptOpen(true);
            },
            onOpenSettings: openFigmaSettings
          }
        ),
        currentPagePresenceUsers.length > 0 && /* @__PURE__ */ jsx17("div", { className: "df-review-presence-row", children: /* @__PURE__ */ jsx17(
          PresenceOverlay,
          {
            presenceSessionId,
            users: currentPagePresenceUsers
          }
        ) }),
        isSitemapOpen && /* @__PURE__ */ jsx17(
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
        isFigmaSettingsOpen && /* @__PURE__ */ jsx17(
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
        isInitialPromptOpen && /* @__PURE__ */ jsx17(
          PromptModal,
          {
            initialPromptText,
            copiedPromptKey,
            onClose: closePromptModal,
            onCopyPrompt: (text, key) => void copyPrompt(text, key)
          }
        ),
        editingItem && /* @__PURE__ */ jsx17(
          QaItemEditModal,
          {
            item: editingItem,
            onClose: () => setEditingItem(null),
            onSave: saveItemComment
          }
        ),
        toastMessage && /* @__PURE__ */ jsx17("div", { className: "df-review-copy-toast", role: "status", children: toastMessage }),
        /* @__PURE__ */ jsxs15("div", { className: "df-review-side-rail", children: [
          /* @__PURE__ */ jsxs15(
            "button",
            {
              "aria-label": isQaPanelVisible ? "Hide QA list" : "Show QA list",
              "aria-pressed": isQaPanelVisible,
              className: `df-review-side-toggle${isQaPanelVisible ? " is-active" : ""}`,
              type: "button",
              onClick: toggleQaPanel,
              children: [
                /* @__PURE__ */ jsx17("span", { "aria-hidden": "true", children: /* @__PURE__ */ jsx17(GripVertical, {}) }),
                /* @__PURE__ */ jsx17("strong", { children: "QA" })
              ]
            }
          ),
          isSourceInspectorEnabled && /* @__PURE__ */ jsxs15(
            "button",
            {
              "aria-controls": "df-review-section-outline",
              "aria-label": isSourceTreePanelVisible ? "Hide source tree" : "Show source tree",
              "aria-pressed": isSourceTreePanelVisible,
              className: `df-review-side-toggle${isSourceTreePanelVisible ? " is-active" : ""}`,
              type: "button",
              onClick: toggleSourceTreePanel,
              children: [
                /* @__PURE__ */ jsx17("span", { "aria-hidden": "true", children: /* @__PURE__ */ jsx17(CodeXml, {}) }),
                /* @__PURE__ */ jsx17("strong", { children: "SOURCE" })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsx17(
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
            isRemoteSource,
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
            onChangeItemStatus: changeItemStatus,
            onClearSelectedItem: clearSelectedReviewItem,
            onChangeReviewSource: changeReviewSource,
            onCopyItemLink: (numberedItem) => void copyItemLink(numberedItem),
            onCopyItemPrompt: (numberedItem) => void copyItemPrompt(numberedItem),
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
        isSourceInspectorEnabled && /* @__PURE__ */ jsx17(
          "aside",
          {
            className: "df-review-source-tree-panel",
            "aria-hidden": !isSourceTreePanelVisible,
            children: /* @__PURE__ */ jsxs15("div", { id: "df-review-section-outline", className: "df-review-section-outline", children: [
              /* @__PURE__ */ jsxs15("div", { className: "df-review-section-outline-head", children: [
                /* @__PURE__ */ jsxs15("span", { children: [
                  /* @__PURE__ */ jsx17("strong", { children: "Source Tree" }),
                  /* @__PURE__ */ jsx17("small", { children: isSectionOutlineFiltering ? `${filteredSectionOutlineCount} / ${sectionOutlineTotalCount} results` : `${sectionOutline?.length ?? 0} roots` })
                ] }),
                /* @__PURE__ */ jsxs15("label", { className: "df-review-section-outline-filter", children: [
                  /* @__PURE__ */ jsx17(Search, { "aria-hidden": "true" }),
                  /* @__PURE__ */ jsx17(
                    "input",
                    {
                      "aria-label": "Filter source tree",
                      type: "search",
                      value: sectionOutlineFilter,
                      placeholder: "Filter",
                      spellCheck: false,
                      onChange: (event) => setSectionOutlineFilter(event.currentTarget.value)
                    }
                  )
                ] })
              ] }),
              filteredSectionOutline.length > 0 ? /* @__PURE__ */ jsx17("div", { className: "df-review-section-outline-list", children: filteredSectionOutline.map(renderSectionOutlineEntry) }) : /* @__PURE__ */ jsx17("div", { className: "df-review-section-outline-empty", children: sectionOutline ? "No source matches" : "No sections found" })
            ] })
          }
        ),
        /* @__PURE__ */ jsx17(
          ReviewTargetFrame,
          {
            canWriteArea,
            canWriteDom,
            figmaFrameUrl,
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
            onSetReviewMode: setReviewMode
          }
        ),
        sourceInspectorState && /* @__PURE__ */ jsxs15(Fragment4, { children: [
          /* @__PURE__ */ jsx17(
            "div",
            {
              className: `df-review-source-outline${sourceInspectorState.isPinned ? " is-pinned" : ""}`,
              style: {
                height: `${sourceInspectorState.rect.height}px`,
                left: `${sourceInspectorState.rect.left}px`,
                top: `${sourceInspectorState.rect.top}px`,
                width: `${sourceInspectorState.rect.width}px`
              }
            }
          ),
          sourceInspectorState.candidates.length > 0 && /* @__PURE__ */ jsxs15(
            "div",
            {
              className: `df-review-source-popover${sourceInspectorState.isPinned ? " is-pinned" : ""}`,
              style: {
                left: sourceInspectorState.panelRight === null ? `${sourceInspectorState.panelLeft}px` : void 0,
                maxWidth: `${sourceInspectorState.panelMaxWidth}px`,
                right: sourceInspectorState.panelRight === null ? void 0 : `${sourceInspectorState.panelRight}px`,
                top: `${sourceInspectorState.panelTop}px`
              },
              onPointerDown: () => {
                sourceInspectorInteractionRef.current = true;
              },
              onPointerEnter: () => {
                sourceInspectorInteractionRef.current = true;
              },
              onPointerLeave: () => {
                sourceInspectorInteractionRef.current = false;
              },
              onClick: (event) => event.stopPropagation(),
              children: [
                /* @__PURE__ */ jsx17("div", { className: "df-review-source-popover-close", children: /* @__PURE__ */ jsx17(
                  "button",
                  {
                    "aria-label": "Close source candidates",
                    type: "button",
                    onClick: clearSourceInspector,
                    children: "\xD7"
                  }
                ) }),
                /* @__PURE__ */ jsx17("div", { className: "df-review-source-candidate-list", children: sourceInspectorState.candidates.map((candidate) => /* @__PURE__ */ jsx17(
                  "button",
                  {
                    className: "df-review-source-candidate",
                    type: "button",
                    onClick: (event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      openSourceCandidate(candidate);
                    },
                    children: /* @__PURE__ */ jsxs15("span", { className: "df-review-source-candidate-main", children: [
                      /* @__PURE__ */ jsx17("strong", { children: candidate.label }),
                      /* @__PURE__ */ jsx17("span", { children: candidate.filePath }),
                      /* @__PURE__ */ jsx17("small", { children: candidate.positionLabel || (candidate.usesPosition ? "" : "file only") })
                    ] })
                  },
                  candidate.id
                )) })
              ]
            }
          )
        ] })
      ]
    }
  );
};

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
import { jsx as jsx18 } from "react/jsx-runtime";
var mountReviewShell = (options) => {
  if (typeof document === "undefined" || !document.head) return;
  const { rootId = "root", ...shellProps } = options;
  ensureReviewShellStyle();
  const root = document.getElementById(rootId);
  if (!root) return;
  root.style.width = "100%";
  root.style.height = "100%";
  root.style.margin = "0";
  createRoot(root).render(
    /* @__PURE__ */ jsx18(React2.StrictMode, { children: /* @__PURE__ */ jsx18(ReviewShell, { ...shellProps }) })
  );
};
export {
  DEFAULT_REVIEW_VIEWPORT_PRESETS,
  ReviewShell,
  createFallbackPresenceAdapter,
  createLocalPresenceAdapter,
  createReviewPagesFromGlob,
  createSupabasePresenceAdapter,
  mountReviewShell
};
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
lucide-react/dist/esm/icons/copy.mjs:
lucide-react/dist/esm/icons/database.mjs:
lucide-react/dist/esm/icons/external-link.mjs:
lucide-react/dist/esm/icons/eye-off.mjs:
lucide-react/dist/esm/icons/eye.mjs:
lucide-react/dist/esm/icons/grip-vertical.mjs:
lucide-react/dist/esm/icons/image.mjs:
lucide-react/dist/esm/icons/layout-grid.mjs:
lucide-react/dist/esm/icons/link-2.mjs:
lucide-react/dist/esm/icons/list-filter.mjs:
lucide-react/dist/esm/icons/map.mjs:
lucide-react/dist/esm/icons/maximize-2.mjs:
lucide-react/dist/esm/icons/monitor.mjs:
lucide-react/dist/esm/icons/pencil.mjs:
lucide-react/dist/esm/icons/rectangle-horizontal.mjs:
lucide-react/dist/esm/icons/refresh-cw.mjs:
lucide-react/dist/esm/icons/ruler.mjs:
lucide-react/dist/esm/icons/scan.mjs:
lucide-react/dist/esm/icons/search.mjs:
lucide-react/dist/esm/icons/settings.mjs:
lucide-react/dist/esm/icons/smartphone.mjs:
lucide-react/dist/esm/icons/square-mouse-pointer.mjs:
lucide-react/dist/esm/icons/sticky-note.mjs:
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
//# sourceMappingURL=react-shell.js.map
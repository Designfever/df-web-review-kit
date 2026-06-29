import { reviewTypographyTokens } from '../../core/typography.tokens';

export const reviewShellBaseStyle = `
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

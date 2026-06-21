const REVIEW_SHELL_STYLE_ID = 'df-review-shell-style';

export function ensureReviewShellStyle() {
  if (!document.getElementById(REVIEW_SHELL_STYLE_ID)) {
    const style = document.createElement('style');
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
	    --df-review-focus-ring: rgba(124, 199, 255, 0.58);
	    --df-review-shadow-card: 0 14px 36px rgba(0, 0, 0, 0.34);
	    --df-review-shadow-control: inset 0 1px 0 rgba(255, 255, 255, 0.04);
	    --df-review-shadow-device: 0 24px 60px rgba(0, 0, 0, 0.38);
	    --df-review-shadow-panel: 0 18px 48px rgba(0, 0, 0, 0.38);
	    --df-review-shadow-modal: 0 24px 70px rgba(0, 0, 0, 0.48);

	    /* Semantic aliases consumed by the existing shell chrome. */
	    --df-review-bg: var(--df-review-color-canvas);
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
	    --df-review-focus-ring: rgba(23, 105, 170, 0.42);
	    --df-review-shadow-card: 0 14px 36px rgba(15, 23, 42, 0.14);
	    --df-review-shadow-control: inset 0 1px 0 rgba(255, 255, 255, 0.72);
	    --df-review-shadow-device: 0 24px 60px rgba(15, 23, 42, 0.18);
	    --df-review-shadow-panel: 0 18px 48px rgba(15, 23, 42, 0.18);
	    --df-review-shadow-modal: 0 24px 70px rgba(15, 23, 42, 0.2);
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
    grid-template-rows: auto minmax(0, 1fr);
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
			  .df-review-prompt-tabs button,
			  .df-review-prompt-block-header button,
			  .df-review-item-prompt-actions button,
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
		  .df-review-prompt-tabs button:hover,
		  .df-review-prompt-tabs button.is-active,
		  .df-review-prompt-block-header button:hover,
		  .df-review-item-prompt-actions button:hover,
			  .df-review-item-actions button:hover,
		  .df-review-item-visibility:hover,
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
	    width: min(760px, calc(100vw - 48px));
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

  .df-review-sitemap-list {
    display: grid;
    align-content: start;
    min-height: 0;
    overflow: auto;
    padding: 8px;
  }

  .df-review-sitemap-table-head,
  .df-review-sitemap-row {
    display: grid;
    grid-template-columns: minmax(160px, 1fr) 70px 78px minmax(96px, 140px);
    align-items: center;
    column-gap: 0;
  }

  .df-review-sitemap-table-head {
    position: sticky;
    top: 0;
    z-index: 1;
    min-height: 32px;
    border-bottom: 1px solid var(--df-review-line);
    padding: 0 10px;
    background: var(--df-review-surface);
    color: var(--df-review-muted);
    font-size: var(--df-review-font-size-xs);
    font-weight: 900;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .df-review-sitemap-table-head span:not(:first-child) {
    text-align: right;
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
    min-width: 0;
    overflow-wrap: anywhere;
    color: var(--df-review-text);
    font-size: var(--df-review-font-size-md);
    font-weight: 800;
    line-height: 1.35;
  }

  .df-review-sitemap-row.is-folder .df-review-sitemap-path {
    color: var(--df-review-muted);
  }

  .df-review-sitemap-tree-prefix {
    flex: 0 0 auto;
    color: var(--df-review-muted);
    font-family: var(--df-review-font-mono);
    font-weight: 700;
    white-space: pre;
  }

  .df-review-sitemap-cell {
    min-width: 0;
    color: var(--df-review-muted);
    font-size: var(--df-review-font-size-sm);
    font-variant-numeric: tabular-nums;
    font-weight: 900;
    line-height: 1;
    text-align: right;
  }

  .df-review-sitemap-cell.is-local {
    color: var(--df-review-accent);
  }

  .df-review-sitemap-cell.is-remote {
    color: var(--df-review-area);
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

		  .df-review-settings-theme-select {
		    min-height: 34px;
		    max-width: 118px;
		    border: 1px solid var(--df-review-line);
		    border-radius: var(--df-review-radius-sm);
		    padding: 0 9px;
		    color: var(--df-review-text);
		    background: var(--df-review-control);
		    font-size: var(--df-review-font-size-sm);
		    font-weight: 800;
		  }

		  .df-review-settings-theme-select:focus-visible {
		    outline: 2px solid var(--df-review-focus-ring);
		    outline-offset: 1px;
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

		  .df-review-settings-field span,
		  .df-review-settings-label-row label {
		    color: var(--df-review-muted);
		    font-size: var(--df-review-font-size-sm);
		    font-weight: 800;
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
			    gap: 12px;
			    min-height: 0;
			    overflow: auto;
			    padding: 16px;
			  }

			  .df-review-prompt-tabs {
			    display: grid;
			    grid-template-columns: repeat(2, minmax(0, 1fr));
			    gap: 4px;
			    padding: 3px;
			    border: 1px solid var(--df-review-line-soft);
			    border-radius: 7px;
			    background: var(--df-review-line-soft);
			  }

			  .df-review-prompt-tabs button {
			    min-width: 0;
			    min-height: 32px;
			    padding: 0 10px;
			    border-color: transparent;
			    background: transparent;
			    color: var(--df-review-muted);
			    font-size: var(--df-review-font-size-xs);
			    font-weight: 900;
			  }

			  .df-review-prompt-tabs button:hover,
			  .df-review-prompt-tabs button.is-active {
			    border-color: var(--df-review-line);
			    background: var(--df-review-panel);
			    color: var(--df-review-text);
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
				    height: min(520px, calc(100vh - 290px));
				    min-height: 360px;
				    max-height: calc(100vh - 290px);
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

			  .df-review-prompt-about {
			    display: grid;
			    gap: 10px;
			    min-width: 0;
			  }

			  .df-review-prompt-about article {
			    display: grid;
			    gap: 6px;
			    border: 1px solid var(--df-review-line);
			    border-radius: var(--df-review-radius-md);
			    padding: 12px;
			    background: var(--df-review-surface);
			  }

			  .df-review-prompt-about strong {
			    color: var(--df-review-text);
			    font-size: var(--df-review-font-size-sm);
			    font-weight: 900;
			  }

			  .df-review-prompt-about p {
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
	    grid-row: 1 / span 2;
	    display: flex;
	    align-items: stretch;
	    justify-content: center;
	    min-width: 0;
	    min-height: 0;
	    border-left: 1px solid var(--df-review-line);
	    background: var(--df-review-side-rail);
	  }

  .df-review-side-toggle {
    display: grid;
    grid-template-rows: 28px auto;
    align-items: start;
    justify-items: center;
    gap: 8px;
    width: 100%;
    min-height: 100%;
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
    letter-spacing: 0.08em;
  }

	  .df-review-qa-panel {
	    grid-column: 2;
	    grid-row: 1 / span 2;
	    display: grid;
	    grid-template-rows: minmax(0, 1fr);
	    min-width: 0;
	    min-height: 0;
	    overflow: hidden;
	    border-left: 1px solid var(--df-review-line-soft);
	    background:
	      linear-gradient(180deg, var(--df-review-panel), var(--df-review-bg));
	  }

	  .df-review-shell:not(.is-list-visible) .df-review-qa-panel {
	    visibility: hidden;
	    border-left: 0;
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

  .df-review-presence-row {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    align-items: start;
    gap: 5px;
    min-width: 0;
  }

  .df-review-presence-label {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    min-width: 0;
    color: var(--df-review-muted);
    font-size: var(--df-review-font-size-2xs);
    font-weight: 900;
    line-height: 1;
    white-space: nowrap;
  }

  .df-review-presence-label svg {
    width: 12px;
    height: 12px;
    fill: none;
    stroke: currentColor;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-width: 2;
  }

  .df-review-presence-list {
    display: flex;
    align-items: center;
    gap: 4px;
    min-width: 0;
    flex-wrap: wrap;
  }

  .df-review-presence-chip {
    --df-review-presence-color: var(--df-review-accent);
    display: inline-flex;
    align-items: center;
    gap: 5px;
    min-width: 0;
    flex: 0 1 auto;
    min-height: 22px;
    border: 1px solid var(--df-review-line-soft);
    border-radius: var(--df-review-radius-pill);
    padding: 0 7px;
    color: var(--df-review-text);
    background: var(--df-review-chip-bg);
    font-size: var(--df-review-font-size-2xs);
    font-weight: 900;
    line-height: 1.1;
    white-space: nowrap;
  }

  .df-review-presence-chip.is-self {
    border-color: var(--df-review-presence-color);
    background: var(--df-review-accent-soft);
  }

  .df-review-presence-dot {
    width: 7px;
    min-width: 7px;
    height: 7px;
    border-radius: var(--df-review-radius-pill);
    background: var(--df-review-presence-color);
  }

  .df-review-presence-name {
    min-width: 0;
  }

		  .df-review-list-controls {
		    display: flex;
		    align-items: center;
		    gap: 4px;
		  }

		  .df-review-source-select {
		    width: 104px;
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
		    gap: var(--df-review-space-2);
		    padding: var(--df-review-space-3);
		    border: 1px solid var(--df-review-line-soft);
		    border-radius: var(--df-review-radius-lg);
		    background: var(--df-review-card);
		    cursor: pointer;
		    transition: border-color 140ms ease, background 140ms ease, opacity 140ms ease, transform 140ms ease;
		  }

	  .df-review-item-card:not(.is-dim) {
    border-left: 3px solid var(--df-review-accent);
    padding-left: calc(var(--df-review-space-3) - 2px);
  }

  .df-review-item-card:not(.is-dim):hover {
    border-color: var(--df-review-line);
    background: var(--df-review-card-hover);
    transform: translateY(-1px);
  }

  .df-review-item-card.is-active {
	    border-color: var(--df-review-accent);
	    background: var(--df-review-accent-soft);
	    box-shadow: inset 0 0 0 1px var(--df-review-accent-hover);
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
    border-color: var(--df-review-line);
    color: var(--df-review-muted);
    background: var(--df-review-line-soft);
  }

  .df-review-item-status-select {
    max-width: 86px;
    cursor: pointer;
    border-color: var(--df-review-line);
    color: var(--df-review-text);
    background: var(--df-review-control);
    outline: 0;
  }

  .df-review-item-status-select:focus-visible {
    border-color: var(--df-review-accent);
    box-shadow: 0 0 0 2px var(--df-review-accent-soft);
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
	    gap: 4px;
	    cursor: auto;
	  }

  .df-review-item-delete,
  .df-review-item-visibility {
    display: inline-grid;
    place-items: center;
    width: 24px;
    height: 24px;
    border: 1px solid transparent;
    border-radius: var(--df-review-radius-sm);
    padding: 0;
    color: var(--df-review-muted);
    background: transparent;
  }

  .df-review-item-visibility.is-visible {
    color: var(--df-review-accent);
  }

  .df-review-item-visibility.is-hidden {
    opacity: 0.7;
    color: var(--df-review-subtle);
  }

  .df-review-item-delete svg,
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
			  }

			  .df-review-item-prompt-actions {
			    display: inline-grid;
			    grid-template-columns: auto 28px;
		    align-items: stretch;
			    min-width: 0;
		    cursor: auto;
			  }

			  .df-review-item-status-actions {
			    display: inline-flex;
			    grid-column: 1;
			    align-items: center;
			    min-width: 0;
		    cursor: auto;
			  }

			  .df-review-item-remote-actions {
			    display: inline-flex;
			    grid-column: 3;
			    align-items: center;
			    justify-content: flex-end;
			    gap: 6px;
			    min-width: 0;
		    cursor: auto;
			  }

	  .df-review-item-prompt {
	    display: inline-flex;
	    align-items: center;
	    min-height: 28px;
	    padding: 0 8px;
	    border-top-right-radius: 0;
	    border-bottom-right-radius: 0;
	    font-size: var(--df-review-font-size-2xs);
	    text-transform: uppercase;
	  }

	  .df-review-item-prompt-copy {
	    position: relative;
	    display: inline-grid;
	    place-items: center;
	    width: 28px;
	    min-width: 28px;
	    min-height: 28px;
	    border-left: 0;
	    border-top-left-radius: 0;
	    border-bottom-left-radius: 0;
	    padding: 0;
	  }

	  .df-review-item-prompt-copy.is-copied {
	    border-color: var(--df-review-accent);
	    color: var(--df-review-accent);
	  }

	  .df-review-item-prompt-copy svg {
	    width: 12px;
	    height: 12px;
	    fill: none;
	    stroke: currentColor;
	    stroke-linecap: round;
	    stroke-linejoin: round;
	    stroke-width: 2;
	  }

  .df-review-item-action-button {
    position: relative;
    display: inline-grid;
    place-items: center;
    width: 30px;
    min-width: 30px;
    height: 28px;
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

		  .df-review-item-submit-button {
		    display: inline-flex;
		    align-items: center;
		    gap: 6px;
		    width: auto;
		    min-width: 0;
		    padding: 0 9px;
		    border-color: rgba(124, 199, 255, 0.46);
		    background: var(--df-review-accent-soft);
		    color: var(--df-review-accent);
		  }

		  .df-review-item-submit-button span {
		    font-size: var(--df-review-font-size-2xs);
		    font-weight: 900;
		    line-height: 1;
		    white-space: nowrap;
		  }

	  .df-review-item-submit-button:hover:not(:disabled) {
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
	    grid-row: 2;
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
	    padding: 34px 40px 12px;
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
    background: rgba(10, 13, 18, 0.92);
  }

  .df-review-ruler-gutter {
    position: absolute;
    z-index: 6;
    background: rgba(10, 13, 18, 0.92);
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
      linear-gradient(to right, rgba(179, 149, 255, 0.75) 1px, transparent 1px),
      linear-gradient(to right, rgba(237, 243, 251, 0.2) 1px, transparent 1px);
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
      linear-gradient(to bottom, rgba(179, 149, 255, 0.75) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(237, 243, 251, 0.2) 1px, transparent 1px);
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
    padding: 3px 7px;
    border-radius: 5px;
    background: rgba(20, 24, 32, 0.92);
    line-height: 1;
    white-space: nowrap;
  }

  .df-review-ruler-frame-label strong {
    color: #e1d8ff;
    font-size: var(--df-review-font-size-2xs);
    font-weight: 900;
  }

  .df-review-ruler-frame-label span {
    color: var(--df-review-muted);
    font-size: var(--df-review-font-size-2xs);
    font-weight: 900;
  }

  .df-review-ruler-coord {
    position: absolute;
    z-index: 7;
    padding: 2px 4px;
    border-radius: 4px;
    background: #b395ff;
    color: #14111f;
    font-size: var(--df-review-font-size-3xs);
    font-weight: 900;
    line-height: 1;
    white-space: nowrap;
    pointer-events: none;
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
    background: rgba(255, 255, 255, 0.74);
    box-shadow: 0 0 0 1px rgba(87, 55, 166, 0.45);
  }

  .df-review-ruler-guide.is-x {
    left: 0;
    right: 0;
    height: 1px;
  }

  .df-review-ruler-guide.is-y {
    top: 0;
    bottom: 0;
    width: 1px;
  }

  .df-review-ruler-selection {
    position: absolute;
    z-index: 3;
    pointer-events: none;
    border: 1px solid #c9b8ff;
    background: rgba(179, 149, 255, 0.16);
    box-shadow:
      inset 0 0 0 1px rgba(20, 12, 40, 0.38),
      0 0 0 1px rgba(20, 12, 40, 0.38);
  }

  .df-review-ruler-label {
    position: absolute;
    z-index: 4;
    pointer-events: none;
    min-width: 156px;
    padding: 7px 8px;
    border: 1px solid rgba(237, 243, 251, 0.22);
    border-radius: var(--df-review-radius-sm);
    background: rgba(10, 13, 18, 0.9);
    color: var(--df-review-text);
    font-size: var(--df-review-font-size-xs);
    font-weight: 900;
    line-height: 1;
    white-space: nowrap;
    box-shadow: 0 8px 22px rgba(0, 0, 0, 0.34);
  }

	  @media (max-width: 860px) {
	    .df-review-shell,
	    .df-review-shell.is-list-visible {
	      grid-template-columns: minmax(0, 1fr) 0 32px;
	      grid-template-rows: auto minmax(0, 1fr);
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

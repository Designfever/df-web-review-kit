export const reviewShellStageStyle = `
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
    font-size: 16px;
    font-weight: 500;
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
    font-weight: 600;
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
    font-weight: 500;
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
    font-weight: 600;
    line-height: 1;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .df-review-section-outline-head small {
    flex: 0 0 auto;
    overflow: hidden;
    color: var(--df-review-muted);
    font-size: var(--df-review-font-size-xs);
    font-weight: 500;
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
    font-weight: 500;
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
    gap: 2px;
    min-height: 0;
    overflow-y: auto;
    padding: 8px 1px 8px 15px;
    scrollbar-gutter: stable;
  }

  .df-review-section-outline-item {
    display: grid;
  }

  .df-review-section-outline-entry-body {
    display: grid;
    border-radius: var(--df-review-radius-sm);
  }

  .df-review-section-outline-entry-body:hover {
    background: var(--df-review-accent-soft);
  }

  .df-review-section-outline-item.is-depth-1:not(:last-child) {
    margin-bottom: 7px;
    padding-bottom: 7px;
    border-bottom: 1px solid var(--df-review-line-soft);
  }

  .df-review-section-outline-row {
    display: grid;
    grid-template-columns: 18px minmax(0, 1fr) auto;
    align-items: center;
    gap: 5px;
    border-radius: var(--df-review-radius-sm);
    padding: 7px 6px;
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
    font-weight: 500;
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
    font-weight: 500;
  }

  .df-review-section-outline-name:hover {
    color: var(--df-review-accent);
  }

  .df-review-section-outline-meta {
    display: grid;
    gap: 3px;
    min-width: 0;
    padding: 0 6px 7px;
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
    font-weight: 600;
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
    gap: 2px;
  }

  .df-review-section-outline-divider {
    color: var(--df-review-subtle);
    font-size: var(--df-review-font-size-xs);
    line-height: 1;
    user-select: none;
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

  .df-review-section-outline-link.is-dom-select {
    width: 26px;
    min-width: 26px;
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
  }

  .df-review-section-outline-empty {
    padding: 14px 12px 16px;
    color: var(--df-review-muted);
    font-size: var(--df-review-font-size-xs);
    font-weight: 500;
  }

`;

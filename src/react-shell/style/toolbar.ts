export const reviewShellToolbarStyle = `
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

export const reviewShellModalStyle = `
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

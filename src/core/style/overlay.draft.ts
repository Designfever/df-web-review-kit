// Separate ordered fragments retain their original cascade positions.
export const overlayDraftStyle = `    .dfwr-dom-draft {
      position: fixed;
      inset: 0;
      z-index: 4;
      pointer-events: none;
    }

    .dfwr-dom-pin {
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
        0 0 0 4px rgba(124, 199, 255, 0.22),
        0 8px 18px rgba(0, 0, 0, 0.28);
      cursor: grab;
      pointer-events: auto;
    }

    .dfwr-dom-pin:active {
      cursor: grabbing;
    }

    .dfwr-dom-popover {
      position: fixed;
      z-index: 4;
      width: min(320px, calc(100vw - 24px));
      padding: 12px;
      pointer-events: auto;
      color: var(--df-review-color-text);
      background: var(--df-review-color-panel);
      border: 1px solid rgba(124, 199, 255, 0.56);
      border-radius: var(--df-review-radius-md);
      box-shadow: var(--df-review-shadow-popover);
    }

    .dfwr-dom-popover.is-composer,
    .dfwr-area-draft.is-composer {
      max-height: min(360px, calc(100vh - 32px));
      overflow: auto;
      border-color: rgba(124, 199, 255, 0.56);
    }

    .dfwr-shell.is-docked-composer .dfwr-dom-popover.is-docked-composer,
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

    .dfwr-shell.is-docked-composer .dfwr-dom-popover.is-composer .dfwr-textarea {
      /* Area metrics: three text lines, padding, borders and grid gaps. */
      min-height: calc(184px + var(--df-review-font-size-xs) * 1.35 * 3 + 36px);
    }

    .dfwr-dom-popover.is-dragging,
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
      background: rgba(124, 199, 255, 0.62);
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
      border: 1px solid rgba(124, 199, 255, 0.56);
      border-radius: var(--df-review-radius-md);
      box-shadow: var(--df-review-shadow-popover);
    }

    .dfwr-dom-popover .dfwr-actions {
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
      flex-wrap: wrap;
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

    .dfwr-area-draft .dfwr-actions {
      padding: 0;
    }

    .dfwr-form {
      display: grid;
      grid-template-columns: minmax(0, 1fr);
      min-width: 0;
      gap: 10px;
    }

    .dfwr-form-error {
      margin: 0;
      color: #ff8f61;
      font-size: var(--df-review-font-size-sm);
      line-height: 1.4;
      overflow-wrap: anywhere;
    }

    .dfwr-attachment-queue {
      display: grid;
      gap: 8px;
      min-width: 0;
    }

    .dfwr-attachment-label {
      color: var(--df-review-color-text-muted);
      font-size: var(--df-review-font-size-xs);
      line-height: 1.35;
    }

    .dfwr-attachment-list {
      display: grid;
      gap: 8px;
    }

    .dfwr-attachment-item {
      display: grid;
      grid-template-columns: 42px minmax(0, 1fr) auto;
      align-items: center;
      gap: 8px;
      min-width: 0;
      padding: 6px;
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: var(--df-review-radius-sm);
      background: rgba(255, 255, 255, 0.04);
    }

    .dfwr-attachment-thumb {
      display: block;
      width: 42px;
      height: 42px;
      object-fit: cover;
      border-radius: var(--df-review-radius-xs);
      background: var(--df-review-color-panel-strong);
    }

    .dfwr-attachment-thumb.is-file {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: var(--df-review-color-text-muted);
      font-size: var(--df-review-font-size-xs);
      font-weight: var(--df-review-font-weight-emphasis);
    }

    .dfwr-attachment-name {
      min-width: 0;
      overflow: hidden;
      color: var(--df-review-color-text);
      font-size: var(--df-review-font-size-sm);
      line-height: 1.35;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .dfwr-attachment-remove {
      appearance: none;
      min-height: 28px;
      padding: 0 8px;
      border: 1px solid var(--df-review-color-border-strong);
      border-radius: var(--df-review-radius-sm);
      color: var(--df-review-color-text-muted);
      background: var(--df-review-color-control);
      cursor: pointer;
      font: inherit;
      font-size: var(--df-review-font-size-xs);
      line-height: 1;
    }

    .dfwr-attachment-remove:hover {
      color: var(--df-review-color-text);
      background: var(--df-review-color-control-hover);
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

    .dfwr-workflow-fields {
      display: grid;
      grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
      align-items: start;
      gap: 10px;
      min-width: 0;
    }

    .dfwr-workflow-fields > :only-child {
      grid-column: 1 / -1;
    }

    .dfwr-workflow-fields .dfwr-select {
      min-height: 30px;
      padding: 0 10px;
      font-size: var(--df-review-font-size-xs);
      line-height: 28px;
    }

    .dfwr-status-select {
      appearance: auto;
    }

    .dfwr-status-select.is-status-todo {
      color: var(--df-review-color-text-muted);
      background-color: rgba(255, 255, 255, 0.06);
    }

    .dfwr-status-select.is-status-doing {
      border-color: rgba(124, 199, 255, 0.44);
      color: #7cc7ff;
      background-color: rgba(124, 199, 255, 0.14);
    }

    .dfwr-status-select.is-status-review {
      border-color: rgba(243, 183, 95, 0.44);
      color: #f3b75f;
      background-color: rgba(243, 183, 95, 0.14);
    }

    .dfwr-status-select.is-status-hold {
      border-color: rgba(179, 149, 255, 0.42);
      color: #b395ff;
      background-color: rgba(179, 149, 255, 0.14);
    }

    .dfwr-status-select.is-status-done {
      border-color: rgba(99, 215, 199, 0.44);
      color: #63d7c7;
      background-color: rgba(99, 215, 199, 0.14);
    }

    .dfwr-assignee-picker {
      position: relative;
      min-width: 0;
    }

    .dfwr-assignee-summary {
      display: block;
      background-color: var(--df-review-color-control);
      background-image: var(--df-review-select-chevron, url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23d7e0ec' stroke-width='2.2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E"));
      background-repeat: no-repeat;
      background-position: right 10px center;
      background-size: 14px 14px;
      overflow: hidden;
      list-style: none;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .dfwr-assignee-summary::-webkit-details-marker {
      display: none;
    }

    .dfwr-workflow-fields .dfwr-assignee-summary {
      padding-right: 32px;
    }

    .dfwr-assignee-menu {
      position: absolute;
      right: 0;
      bottom: calc(100% + 6px);
      z-index: 20;
      display: grid;
      gap: 3px;
      width: max(100%, min(200px, calc(100vw - 50px)));
      max-height: 260px;
      overflow: auto;
      padding: 7px;
      border: 1px solid var(--df-review-color-border);
      border-radius: var(--df-review-radius-md);
      color: var(--df-review-color-text);
      background: var(--df-review-color-panel);
      box-shadow: 0 12px 32px rgba(0, 0, 0, 0.36);
    }

    .dfwr-assignee-option {
      display: flex;
      align-items: center;
      gap: 8px;
      min-height: 30px;
      padding: 0 7px;
      border-radius: var(--df-review-radius-sm);
      cursor: pointer;
      font-size: var(--df-review-font-size-xs);
    }

    .dfwr-assignee-option:hover {
      background: var(--df-review-color-border-soft, rgba(255, 255, 255, 0.08));
    }

    .dfwr-assignee-option input {
      flex: 0 0 auto;
      accent-color: var(--df-review-color-accent);
    }

    .dfwr-assignee-option span {
      min-width: 0;
      overflow-wrap: anywhere;
    }

    .dfwr-assignee-menu-actions {
      display: flex;
      justify-content: flex-end;
      gap: 6px;
      margin-top: 4px;
      padding-top: 7px;
      border-top: 1px solid var(--df-review-color-border-soft, rgba(255, 255, 255, 0.08));
    }

    .dfwr-assignee-menu-actions button {
      min-height: 28px;
      padding: 0 9px;
      border: 1px solid var(--df-review-color-border);
      border-radius: var(--df-review-radius-sm);
      color: var(--df-review-color-text);
      background: var(--df-review-color-control);
      cursor: pointer;
      font: inherit;
      font-size: var(--df-review-font-size-xs);
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
      border-color: rgba(124, 199, 255, 0.5);
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
      border-color: rgba(124, 199, 255, 0.68);
      background: var(--df-review-color-accent-soft);
      outline: none;
    }

    .dfwr-adjust-toggle svg {
      width: 18px;
      height: 18px;
      pointer-events: none;
    }

`;

export const overlaySelectionStyle = `    .dfwr-text-layer,
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
      border: 1px solid #7cc7ff;
      background: rgba(124, 199, 255, 0.16);
      box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.18);
    }

`;

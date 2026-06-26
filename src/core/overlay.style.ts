import { reviewTypographyTokens } from './typography.tokens';

/** Creates the shadow-root stylesheet for the standalone core overlay. */
export function createStyleElement() {
  const style = document.createElement('style');
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

    .dfwr-textarea {
      width: 100%;
      min-height: 92px;
      resize: vertical;
      border: 1px solid rgba(255, 255, 255, 0.16);
      border-radius: var(--df-review-radius-sm);
      padding: 10px;
      color: var(--df-review-color-text);
      background: var(--df-review-color-panel-strong);
      font: inherit;
      font-size: var(--df-review-font-size-md);
      line-height: 1.45;
    }

    .dfwr-textarea:focus {
      outline: 2px solid var(--df-review-color-accent-ring);
      outline-offset: 1px;
    }

    @media (hover: none) and (pointer: coarse) {
      .dfwr-textarea {
        font-size: var(--df-review-font-size-xl);
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

    .dfwr-item-comment {
      margin: 4px 0;
      color: var(--df-review-color-text);
      font-size: var(--df-review-font-size-md);
      line-height: 1.42;
      overflow-wrap: anywhere;
      white-space: pre-wrap;
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

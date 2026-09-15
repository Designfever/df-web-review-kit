import { reviewTypographyTokens } from '../typography.tokens';

// Separate ordered fragments retain their original cascade positions.
export const overlayBaseStyle = `
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
      --df-review-color-accent: #7cc7ff;
      --df-review-color-accent-contrast: #171b1e;
      --df-review-color-accent-soft: rgba(124, 199, 255, 0.16);
      --df-review-color-accent-ring: rgba(124, 199, 255, 0.6);
      --df-review-color-area: #7cc7ff;
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

`;

export const overlayListStyle = `    .dfwr-empty,
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
      outline: 2px solid rgba(124, 199, 255, 0.72);
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

`;

export const overlayResponsiveStyle = `    @media (max-width: 520px) {
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

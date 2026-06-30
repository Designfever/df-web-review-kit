export const reviewShellSourceInspectorStyle = `
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

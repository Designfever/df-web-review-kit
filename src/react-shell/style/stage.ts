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
	    padding: 34px 58px 12px;
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

  .df-review-outside-marker-layer {
    position: absolute;
    left: -44px;
    top: 0;
    z-index: 8;
    width: 40px;
    height: 100%;
    pointer-events: none;
  }

  .df-review-outside-marker {
    --df-review-outside-marker-color: #7cc7ff;
    --df-review-outside-marker-connector-top: 10px;
    --df-review-outside-marker-connector-stem-top: 10px;
    --df-review-outside-marker-connector-stem-height: 0px;
    --df-review-outside-marker-z-index: 1;
    position: absolute;
    right: 10px;
    z-index: var(--df-review-outside-marker-z-index);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: max-content;
    min-width: 28px;
    height: 22px;
    padding: 0 6px;
    border: 1px solid var(--df-review-outside-marker-color);
    border-radius: var(--df-review-radius-pill);
    background: var(--df-review-color-panel);
    box-shadow: 0 0 0 3px rgba(124, 199, 255, 0.14);
    color: var(--df-review-outside-marker-color);
    font-size: var(--df-review-font-size-2xs);
    font-weight: var(--df-review-font-weight-emphasis);
    line-height: 1;
    white-space: nowrap;
    pointer-events: auto;
  }

  .df-review-outside-marker::before,
  .df-review-outside-marker::after {
    content: "";
    position: absolute;
    background: var(--df-review-outside-marker-color);
    opacity: 0.72;
    pointer-events: none;
  }

  .df-review-outside-marker::before {
    left: 100%;
    top: var(--df-review-outside-marker-connector-stem-top);
    width: 1px;
    height: var(--df-review-outside-marker-connector-stem-height);
  }

  .df-review-outside-marker::after {
    left: 100%;
    top: var(--df-review-outside-marker-connector-top);
    width: 10px;
    height: 1px;
  }

  .df-review-outside-marker.is-scope-tablet {
    --df-review-outside-marker-color: #63d7c7;
  }

  .df-review-outside-marker.is-scope-desktop {
    --df-review-outside-marker-color: #f3b75f;
  }

  .df-review-outside-marker.is-scope-wide {
    --df-review-outside-marker-color: #c99cff;
  }

  .df-review-outside-marker.is-scope-dom {
    --df-review-outside-marker-color: #ff8f61;
  }

  .df-review-outside-marker.is-active {
    border-width: 2px;
    box-shadow:
      0 0 0 4px rgba(124, 199, 255, 0.22),
      0 10px 22px rgba(0, 0, 0, 0.28);
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

`;

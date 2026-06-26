export const reviewShellRulerStyle = `
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
    background: var(--df-review-color-ruler-surface);
  }

  .df-review-ruler-gutter {
    position: absolute;
    z-index: 6;
    background: var(--df-review-color-ruler-surface);
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
      linear-gradient(
        to right,
        var(--df-review-color-ruler-tick-major) 1px,
        transparent 1px
      ),
      linear-gradient(
        to right,
        var(--df-review-color-ruler-tick-minor) 1px,
        transparent 1px
      );
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
      linear-gradient(
        to bottom,
        var(--df-review-color-ruler-tick-major) 1px,
        transparent 1px
      ),
      linear-gradient(
        to bottom,
        var(--df-review-color-ruler-tick-minor) 1px,
        transparent 1px
      );
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
    padding: 4px 8px;
    border: 1px solid var(--df-review-color-ruler-popover-border);
    border-radius: var(--df-review-radius-sm);
    background: var(--df-review-color-ruler-label);
    line-height: 1;
    white-space: nowrap;
    box-shadow: 0 6px 18px var(--df-review-color-ruler-popover-shadow);
  }

  .df-review-ruler-frame-label strong {
    color: var(--df-review-color-ruler-label-text);
    font-size: var(--df-review-font-size-xs);
    font-weight: 600;
  }

  .df-review-ruler-frame-label span {
    color: var(--df-review-color-ruler-label-text);
    font-size: var(--df-review-font-size-xs);
    font-weight: 600;
    opacity: 0.78;
  }

  .df-review-ruler-coord {
    position: absolute;
    z-index: 7;
    padding: 4px 6px;
    border: 1px solid var(--df-review-color-ruler-popover-border);
    border-radius: var(--df-review-radius-xs);
    background: var(--df-review-color-ruler-coord-bg);
    color: var(--df-review-color-ruler-coord-text);
    font-size: var(--df-review-font-size-xs);
    font-weight: 600;
    line-height: 1;
    white-space: nowrap;
    pointer-events: none;
    box-shadow: 0 6px 18px var(--df-review-color-ruler-popover-shadow);
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
    background: var(--df-review-color-ruler-guide);
    box-shadow: 0 0 0 1px var(--df-review-color-ruler-measure-shadow);
  }

  .df-review-ruler-guide.is-x {
    left: 0;
    right: 0;
    height: 2px;
  }

  .df-review-ruler-guide.is-y {
    top: 0;
    bottom: 0;
    width: 2px;
  }

  .df-review-ruler-selection {
    position: absolute;
    z-index: 3;
    pointer-events: none;
    border: 3px solid var(--df-review-color-ruler-measure-border);
    background: var(--df-review-color-ruler-measure-bg);
    box-shadow:
      inset 0 0 0 1px var(--df-review-color-ruler-measure-shadow),
      0 0 0 1px rgba(255, 255, 255, 0.96),
      0 0 0 4px var(--df-review-color-ruler-measure-shadow);
  }

  .df-review-ruler-label {
    position: absolute;
    z-index: 4;
    pointer-events: none;
    min-width: 124px;
    padding: 9px 11px;
    border: 1px solid var(--df-review-color-ruler-popover-border);
    border-radius: var(--df-review-radius-md);
    background: var(--df-review-color-ruler-popover-bg);
    color: var(--df-review-color-ruler-popover-text);
    font-family: var(--df-review-font-mono);
    font-size: var(--df-review-font-size-lg);
    font-weight: 600;
    line-height: 1;
    white-space: nowrap;
    letter-spacing: -0.02em;
    text-align: center;
    box-shadow:
      0 10px 26px var(--df-review-color-ruler-popover-shadow),
      inset 0 1px 0 rgba(255, 255, 255, 0.18);
  }

	  @media (max-width: 860px) {
	    .df-review-shell,
	    .df-review-shell.is-list-visible {
	      grid-template-columns: minmax(0, 1fr) 0 48px;
	      grid-template-rows: auto auto minmax(0, 1fr);
	    }

	    .df-review-shell.is-list-visible {
	      grid-template-columns: minmax(0, 1fr) minmax(260px, 70vw) 48px;
	    }

	    .df-review-qa-panel {
	      border-left: 1px solid var(--df-review-line);
	      border-bottom: 0;
	    }

	    .df-review-tools {
	      flex-wrap: nowrap;
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

    @media (hover: none) and (pointer: coarse) {
      .df-review-edit-textarea textarea,
      .df-review-preset-select,
      .df-review-prompt-block textarea {
        font-size: 16px;
      }
    }
`;

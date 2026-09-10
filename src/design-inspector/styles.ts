export const inspectorStyles = `
:host { all: initial; color-scheme: inherit; display: flex; width: 100%; height: 100%; min-width: 0; min-height: 0; }
*, *::before, *::after { box-sizing: border-box; }
.inspector { width: 100%; min-width: 0; min-height: 0; height: 100%; display: flex; font: 12px/1.5 -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: var(--df-review-text, #edf3fb); letter-spacing: normal; text-align: left; }
button, input, select, textarea { font: inherit; color: inherit; }
button { cursor: pointer; border: 1px solid var(--df-review-line, #3a4352); background: var(--df-review-control, #202938); border-radius: 7px; padding: 7px 10px; min-height: 34px; }
button:hover { background: var(--df-review-control-hover, #273345); }
button:disabled { opacity: .42; cursor: default; }
button[aria-pressed='true'] { background: var(--df-review-accent-soft, #203448); color: var(--df-review-accent, #7cc7ff); border-color: var(--df-review-accent, #7cc7ff); }
button:focus-visible, input:focus-visible, select:focus-visible, textarea:focus-visible { outline: 2px solid var(--df-review-accent, #7cc7ff); outline-offset: 2px; }
[hidden] { display: none !important; }
.panel { width: 100%; height: 100%; min-width: 0; min-height: 0; background: var(--df-review-panel, #131821); pointer-events: auto; display: flex; flex-direction: column; overflow: hidden; }
.header { padding: var(--df-review-space-3, 12px) var(--df-review-frame-gutter-x, 12px); display: grid; grid-template-rows: repeat(2, var(--df-review-control-height-md, 34px)); gap: var(--df-review-space-2, 8px); border-bottom: 1px solid var(--df-review-line-soft, #252d39); background: var(--df-review-card, #1b2430); font-family: var(--df-review-font-sans, sans-serif); flex-shrink: 0; }
.brand { min-width: 0; display: flex; align-items: center; gap: 8px; font-weight: var(--df-review-font-weight-normal, 400); font-size: var(--df-review-font-size-sm, 12px); }
.brand small { font-size: var(--df-review-font-size-xs, 11px); font-weight: var(--df-review-font-weight-normal, 400); color: var(--df-review-muted, #929cab); }
.toolbar { display: flex; align-items: center; gap: 6px; min-width: 0; overflow-x: auto; }
.toolbar button { flex: 0 0 auto; height: 28px; min-height: 28px; border: 1px solid var(--df-review-line-soft, #252d39); border-radius: var(--df-review-radius-sm, 6px); padding: 0 9px; color: var(--df-review-subtle, #929cab); background: transparent; font-size: var(--df-review-font-size-xs, 11px); font-weight: var(--df-review-font-weight-normal, 400); white-space: nowrap; }
.toolbar button:hover { border-color: var(--df-review-line, #3a4352); color: var(--df-review-text, #edf3fb); }
.toolbar button[aria-pressed='true'] { background: var(--df-review-accent-soft, #203448); color: var(--df-review-accent, #7cc7ff); border-color: color-mix(in srgb, var(--df-review-accent, #7cc7ff) 40%, transparent); }
.status { padding: 10px 12px; color: var(--df-review-muted, #929cab); flex-shrink: 0; }
.body { flex: 1; overflow: auto; overscroll-behavior: contain; padding: 0 12px 12px; min-height: 0; }
.body, .report { scrollbar-color: var(--df-review-scrollbar-thumb, #505969) var(--df-review-scrollbar-track, #1b2430); }
.empty { padding: 20px 6px; text-align: center; color: var(--df-review-muted, #929cab); }
.empty strong { display: block; color: var(--df-review-text, #edf3fb); font-size: 16px; margin-bottom: 10px; }
.identity { font: 11px/1.5 ui-monospace, monospace; overflow-wrap: anywhere; background: var(--df-review-panel-strong, #1b2430); padding: 8px; border-radius: 7px; margin-bottom: 8px; }
.source-location { display: grid; grid-template-columns: minmax(0,1fr) auto; align-items: center; gap: 6px; margin-bottom: 8px; padding: 7px 8px; border: 1px solid var(--df-review-line, #3a4352); border-radius: 7px; background: var(--df-review-card, #1b2430); }
.source-location.error { border-color: var(--df-review-danger, #ff8f61); color: var(--df-review-danger, #ff8f61); background: var(--df-review-danger-soft, #342620); }
.source-path { min-width: 0; font: 10px/1.45 ui-monospace, monospace; overflow-wrap: anywhere; user-select: text; }
.open-source { white-space: nowrap; }
.navigation, .tabs, .actions { display: flex; gap: 5px; flex-wrap: wrap; margin-bottom: 9px; }
.tabs button { flex: 1; }
.metrics { display: grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: 7px; margin: 8px 0 12px; }
.metric { background: var(--df-review-card, #1b2430); padding: 9px; border-radius: 8px; }
.metric span { display: block; color: var(--df-review-muted, #929cab); font-size: 10px; }
.metric strong { font: 600 17px/1.6 ui-monospace, monospace; }
h3 { margin: 14px 0 6px; font-size: 12px; font-weight: 700; }
.row { display: grid; grid-template-columns: minmax(0, 43%) minmax(0,57%); gap: 5px; padding: 5px 0; border-bottom: 1px solid var(--df-review-line-soft, #252d39); }
.key { color: var(--df-review-muted, #929cab); overflow-wrap: anywhere; }
.value { font-family: ui-monospace, monospace; overflow-wrap: anywhere; white-space: pre-wrap; user-select: text; }
.swatch { display: inline-block; width: 12px; height: 12px; vertical-align: -2px; margin-right: 5px; border: 1px solid var(--df-review-line, #3a4352); border-radius: 3px; }
.hint { color: var(--df-review-muted, #929cab); font-size: 11px; margin: 8px 0; }
.notice { padding: 8px; border-radius: 7px; background: var(--df-review-warning-soft, #342c21); color: var(--df-review-warning, #f3b75f); margin: 8px 0; }
.box-model { padding: 8px; background: color-mix(in srgb, var(--df-review-warning, #f3b75f) 12%, var(--df-review-panel, #131821)); text-align: center; border: 1px dashed var(--df-review-warning, #f3b75f); color: var(--df-review-text, #edf3fb); border-radius: 5px; }
.box-model .border { background: color-mix(in srgb, var(--df-review-purple, #b395ff) 12%, var(--df-review-panel, #131821)); padding: 7px; border: 1px solid var(--df-review-purple, #b395ff); margin-top: 5px; }
.box-model .padding { background: color-mix(in srgb, var(--df-review-area, #63d7c7) 12%, var(--df-review-panel, #131821)); padding: 7px; border: 1px dashed var(--df-review-area, #63d7c7); margin-top: 5px; }
.box-model .content { background: color-mix(in srgb, var(--df-review-accent, #7cc7ff) 12%, var(--df-review-panel, #131821)); padding: 6px; color: var(--df-review-accent, #7cc7ff); margin-top: 5px; }
.search, .pseudo, .report { width: 100%; background: var(--df-review-control, #202938); border: 1px solid var(--df-review-line, #3a4352); border-radius: 7px; padding: 8px; margin-bottom: 8px; }
input::placeholder, textarea::placeholder { color: var(--df-review-muted, #929cab); opacity: 1; }
.report { min-height: 125px; resize: vertical; font: 11px/1.5 ui-monospace, monospace; }
.canvas { position: fixed; inset: 0; pointer-events: none; overflow: hidden; }
.geometry, .labels { position: absolute; inset: 0; pointer-events: none; }
.outline { position: absolute; border: 1.5px solid var(--df-review-accent, #7cc7ff); background: color-mix(in srgb, var(--df-review-accent, #7cc7ff) 4%, transparent); pointer-events: none; }
.outline.hover { border-color: var(--df-review-area, #63d7c7); background: color-mix(in srgb, var(--df-review-area, #63d7c7) 4%, transparent); }
.badge, .distance { position: absolute; width: max-content; max-width: min(600px, calc(100vw - 16px)); color: var(--df-review-accent-contrast, #0f1218); background: var(--df-review-accent, #7cc7ff); border-radius: 4px; padding: 2px 6px; font: 11px/1.6 ui-monospace, monospace; white-space: normal; overflow-wrap: anywhere; box-shadow: 0 1px 4px #0002; }
.badge.hover { background: var(--df-review-area, #63d7c7); }
.line { position: absolute; background: var(--df-review-purple, #b395ff); }
.line.x { height: 1px; }
.line.y { width: 1px; }
.line::before, .line::after { content: ''; position: absolute; background: inherit; }
.line.x::before, .line.x::after { width: 1px; height: 8px; top: -4px; }
.line.x::after { right: 0; }
.line.y::before, .line.y::after { height: 1px; width: 8px; left: -4px; }
.line.y::after { bottom: 0; }
.distance { background: var(--df-review-panel, #131821); color: var(--df-review-purple, #b395ff); border: 1px solid var(--df-review-purple, #b395ff); box-shadow: none; }
.distance.overlap { color: var(--df-review-danger, #ff8f61); border-color: var(--df-review-danger, #ff8f61); }
.line.overlap { background: var(--df-review-danger, #ff8f61); }
`;

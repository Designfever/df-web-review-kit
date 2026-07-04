import { ControlRow } from './control-row';
import { MetricsPanel } from './metrics-panel';
import { StatePreviewGrid } from './state-preview-grid';

export function ComponentsFixture() {
  return (
    <section
      className="dev-section"
      data-qa-id="components-section"
      data-section-id="components"
    >
      <div className="dev-section-heading" data-qa-id="components-heading">
        <p className="dev-eyebrow">Components</p>
        <h1>Controls and layout states</h1>
      </div>
      <ControlRow />
      <div className="dev-component-stack" data-qa-id="component-stack">
        <MetricsPanel />
        <StatePreviewGrid />
      </div>
    </section>
  );
}

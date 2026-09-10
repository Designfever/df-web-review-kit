import { useSyncExternalStore } from 'react';
import { PanelRight } from 'lucide-react';
import { useReviewShellStore } from '../store/store.context';
import { useCustomPanelRegistry } from './context';

export function CustomPanelRailButtons() {
  const registry = useCustomPanelRegistry();
  const entries = useSyncExternalStore(registry.subscribe, registry.getSnapshot, registry.getSnapshot);
  const selected = useReviewShellStore(state => state.sidePanel);
  const visible = useReviewShellStore(state => state.isListVisible);
  return <>{entries.map(({ definition, container }) => {
    const active = visible && selected === `custom:${definition.id}`;
    return <button
      key={container.id}
      ref={button => { registry.setButton(definition.id, button); }}
      type="button"
      aria-controls={container.id}
      aria-label={`${active ? 'Hide' : 'Show'} ${definition.label}`}
      aria-pressed={active}
      className={`df-review-side-toggle${active ? ' is-active' : ''}`}
      data-review-tooltip={definition.label}
      data-review-tooltip-placement="left"
      title={definition.label}
      onClick={() => registry.toggle(definition.id)}
    >
      {definition.icon ? <svg aria-hidden="true" viewBox={definition.icon.viewBox}
        fill="none" stroke="currentColor" strokeWidth={2}>
        {definition.icon.paths.map((d, index) => <path key={index} d={d} />)}
      </svg> : <PanelRight aria-hidden="true" />}
    </button>;
  })}</>;
}

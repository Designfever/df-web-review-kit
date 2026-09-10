import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { localAdapter } from '@designfever/web-review-kit';
import {
  connectReviewCustomPanel,
  mountReviewShell,
  type ReviewCustomPanelSnapshot,
} from '@designfever/web-review-kit/react-shell';

// Call on the browser's /review route, after rootId exists. Retain cleanup.
export function mountExampleReview(rootId: string) {
  return mountReviewShell({
    rootId,
    projectId: 'custom-panel-example',
    pages: [{ href: '/example/' }],
    adapters: [{ label: 'local', ...localAdapter({ storageKey: 'custom-panel-example:items' }) }],
    customPanels: true,
  });
}

// Render on /example/, both standalone and as Review Kit's target.
// This is a browser-only example. The host owns routing and editor styling.
export function EditablePreview() {
  const [text, setText] = useState('Hello');
  const [color, setColor] = useState('#60a5fa');
  const [framed] = useState(() => window.parent !== window);
  const [localHost, setLocalHost] = useState<HTMLElement | null>(null);
  const [panel, setPanel] = useState<ReviewCustomPanelSnapshot | null>(null);

  useEffect(() => {
    if (!framed) return;
    const connection = connectReviewCustomPanel({
      id: 'example.editor', label: 'Example editor',
    });
    const sync = () => setPanel(connection.getSnapshot());
    const unsubscribe = connection.subscribe(sync);
    sync();
    return () => { unsubscribe(); connection.dispose(); };
  }, [framed]);

  const container = framed ? panel?.status === 'ready' ? panel.container : null : localHost;
  const controls = <div style={{ display: 'grid', gap: 12, padding: 16 }}>
    <label>Text <input value={text} onChange={event => setText(event.target.value)} /></label>
    <label>Color <input type="color" value={color}
      onInput={event => setColor(event.currentTarget.value)} /></label>
  </div>;

  return <div style={{ display: 'flex', gap: 16 }}>
    <h1 style={{ color, flex: 1, minWidth: 0, overflowWrap: 'anywhere' }}>{text}</h1>
    {!framed && <aside ref={setLocalHost} aria-label="Example editor"
      style={{ flex: '0 1 280px', minWidth: 0 }} />}
    {container && createPortal(controls, container)}
    {framed && panel?.status === 'unavailable' && <p>Editor unavailable: {panel.reason}</p>}
    {framed && panel?.status === 'error' && <p>Editor registration failed: {panel.reason}</p>}
  </div>;
}

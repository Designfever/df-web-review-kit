import { useEffect, useId, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  connectReviewCustomPanel,
  type ReviewCustomPanelSnapshot,
} from '../../../../src/react-shell';

const INITIAL_TEXT = 'Make it yours';
const INITIAL_COLOR = '#60a5fa';

interface EditorProps {
  text: string;
  color: string;
  onTextChange: (text: string) => void;
  onColorChange: (color: string) => void;
  onReset: () => void;
}

// One editor for both hosts. All values live above the portal in the target tree.
function PreviewEditor({ text, color, onTextChange, onColorChange, onReset }: EditorProps) {
  const id = useId();
  return (
    <div className="dev-portal-editor" data-qa-id="portal-editor">
      <header>
        <p className="dev-portal-kicker">Live controls</p>
        <h2>Preview editor</h2>
      </header>
      <label htmlFor={`${id}-text`}>Preview text</label>
      <input id={`${id}-text`} type="text" value={text}
        onChange={event => onTextChange(event.target.value)} />
      <label htmlFor={`${id}-color`}>Accent color</label>
      <div className="dev-portal-color-control">
        <input id={`${id}-color`} type="color" value={color}
          onInput={event => onColorChange(event.currentTarget.value)} />
        <output>{color}</output>
      </div>
      <button type="button" onClick={onReset}>Reset preview</button>
      <p className="dev-portal-help">Changes are live. Reloading this page resets them.</p>
    </div>
  );
}

export function PortalEditorDemo() {
  const [text, setText] = useState(INITIAL_TEXT);
  const [color, setColor] = useState(INITIAL_COLOR);
  // Unlike a query flag, frame identity survives the fixture's SPA navigation.
  const [isFramed] = useState(() => window.parent !== window);
  const [localContainer, setLocalContainer] = useState<HTMLElement | null>(null);
  const [panel, setPanel] = useState<ReviewCustomPanelSnapshot | null>(null);

  useEffect(() => {
    if (!isFramed) return;
    const connection = connectReviewCustomPanel({
      id: 'demo.preview-editor',
      label: 'Preview editor',
      icon: { viewBox: '0 0 24 24', paths: ['M4 7h16M4 17h16M8 4v6M16 14v6'] },
    });
    const sync = () => setPanel(connection.getSnapshot());
    const unsubscribe = connection.subscribe(sync);
    sync();
    return () => { unsubscribe(); connection.dispose(); };
  }, [isFramed]);

  const container = isFramed
    ? panel?.status === 'ready' ? panel.container : null
    : localContainer;
  const status = !panel || panel.status === 'waiting'
    ? 'Connecting editor…'
    : panel.status === 'ready'
      ? 'Open Preview editor in the right rail to edit this card.'
      : 'The review editor is unavailable in this frame.';

  return (
    <section className={`dev-portal-demo${isFramed ? '' : ' is-standalone'}`}
      data-qa-id="portal-demo" aria-label="Live preview demo">
      <div className="dev-portal-preview">
        <p className="dev-portal-kicker">Live preview</p>
        <h2 data-qa-id="portal-preview-text" style={{ color }}>{text || 'Your text here'}</h2>
        <p>Edit the text and accent color from the right-side panel.</p>
        {isFramed ? <p className="dev-portal-help" role="status">{status}</p> : <>
          <a className="dev-portal-review-link" href="/review/?target=/components/&w=768&h=1024">
            Open in Review Kit
          </a>
          <a className="dev-portal-review-link" href="/review-df-sheet/?target=/components/&w=768&h=1024">
            Test in DF Sheet review
          </a>
        </>}
      </div>
      {!isFramed && <aside className="dev-portal-local-panel" ref={setLocalContainer}
        aria-label="Preview editor" />}
      {container && createPortal(<PreviewEditor
        text={text} color={color} onTextChange={setText} onColorChange={setColor}
        onReset={() => { setText(INITIAL_TEXT); setColor(INITIAL_COLOR); }}
      />, container)}
    </section>
  );
}

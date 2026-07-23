import type {
  SourceComponentPopup,
  SourceInspectorRect,
} from './source.inspector.overlay';

type SourceInspectorPopupProps = {
  popup: SourceComponentPopup | null;
  onSelectEntry: (element: Element) => void;
};

const POPUP_GAP = 8;
const POPUP_WIDTH = 320;
const VIEWPORT_MARGIN = 8;

/** 요소 우측에 붙이되, 공간이 없으면 좌측으로 flip 하고 뷰포트 안으로 clamp 한다. */
const getPopupPosition = (rect: SourceInspectorRect) => {
  const viewportWidth =
    document.documentElement.clientWidth || window.innerWidth;
  const viewportHeight =
    document.documentElement.clientHeight || window.innerHeight;

  const rightLeft = rect.left + rect.width + POPUP_GAP;
  const fitsRight = rightLeft + POPUP_WIDTH <= viewportWidth - VIEWPORT_MARGIN;
  const left = fitsRight ? rightLeft : rect.left - POPUP_WIDTH - POPUP_GAP;

  return {
    left: Math.max(VIEWPORT_MARGIN, left),
    top: Math.max(
      VIEWPORT_MARGIN,
      Math.min(rect.top, viewportHeight - 120)
    ),
  };
};

export const SourceInspectorPopup = ({
  popup,
  onSelectEntry,
}: SourceInspectorPopupProps) => {
  if (!popup || popup.entries.length === 0) return null;

  const position = getPopupPosition(popup.rect);

  return (
    <div
      className="df-review-source-popup"
      style={{
        left: `${position.left}px`,
        top: `${position.top}px`,
      }}
    >
      <ul className="df-review-source-popup-list">
        {popup.dataEntries.map((entry) => (
          <li key={entry.id}>
            <button
              className="df-review-source-popup-entry is-data"
              type="button"
              title={entry.filePath}
              onClick={() => onSelectEntry(entry.element)}
            >
              <span className="df-review-source-popup-entry-label">
                {entry.label}
              </span>
              <span className="df-review-source-popup-entry-path">
                {entry.filePath}
              </span>
            </button>
          </li>
        ))}
        {popup.dataEntries.length > 0 ? (
          <li aria-hidden="true" className="df-review-source-popup-divider" />
        ) : null}
        {popup.entries.map((entry, index) => (
          <li key={entry.id}>
            <button
              className={`df-review-source-popup-entry${
                index === 0 ? ' is-selected' : ''
              }`}
              type="button"
              title={entry.filePath}
              onClick={() => onSelectEntry(entry.element)}
            >
              <span className="df-review-source-popup-entry-label">
                {entry.label}
              </span>
              <span className="df-review-source-popup-entry-path">
                {entry.filePath}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

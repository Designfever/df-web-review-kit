import { ReviewModal } from '../review/modal';

interface PromptModalProps {
  onClose: () => void;
}

const REVIEW_KIT_VERSION = '0.7.3';

const SHORTCUT_SECTIONS = [
  {
    title: 'Panels',
    items: [
      { keys: ['Shift', '1'], label: 'Figma images' },
      { keys: ['Shift', '2'], label: 'QA list' },
      { keys: ['Shift', '3'], label: 'Component list' },
    ],
  },
  {
    title: 'Review modes',
    items: [
      { keys: ['Shift', 'Q / ㅂ'], label: 'Toggle QA runtime' },
      { keys: ['E / ㄷ'], label: 'Element QA' },
      { keys: ['A / ㅁ'], label: 'Area QA' },
    ],
  },
  {
    title: 'Overlays',
    items: [
      { keys: ['G / ㅎ'], label: 'Grid overlay' },
      { keys: ['F / ㄹ'], label: 'Figma overlay' },
      { keys: ['R / ㄱ'], label: 'Ruler' },
    ],
  },
  {
    title: 'Source and cleanup',
    items: [
      { keys: ['Option'], label: 'Trace source candidates' },
      { keys: ['Option', 'Click'], label: 'Pin source candidates' },
      { keys: ['Command'], label: 'Hide QA markers while pressed' },
      { keys: ['Esc'], label: 'Cancel mode or close popup' },
    ],
  },
];

export const PromptModal = ({ onClose }: PromptModalProps) => {
  return (
    <ReviewModal
      ariaLabel="Review help"
      bodyClassName="df-review-about-body"
      description={`v${REVIEW_KIT_VERSION}`}
      dialogClassName="df-review-about-dialog"
      title="df-web-review-kit"
      onClose={onClose}
    >
      <div className="df-review-shortcut-groups">
        {SHORTCUT_SECTIONS.map((section) => (
          <section className="df-review-shortcut-group" key={section.title}>
            <strong>{section.title}</strong>
            <div className="df-review-shortcut-list">
              {section.items.map((item) => (
                <div className="df-review-shortcut-row" key={item.label}>
                  <span className="df-review-shortcut-keys">
                    {item.keys.map((key) => (
                      <kbd key={key}>{key}</kbd>
                    ))}
                  </span>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </ReviewModal>
  );
};

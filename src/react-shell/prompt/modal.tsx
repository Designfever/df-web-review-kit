import type { ReactNode } from 'react';
import packageJson from '../../../package.json';

import { ReviewModal } from '../review/modal';

interface PromptModalProps {
  onClose: () => void;
  activeTab: 'About' | 'Prompt' | 'Settings' | 'Shortcuts';
  onTabChange: (tab: 'About' | 'Prompt' | 'Settings' | 'Shortcuts') => void;
  children: ReactNode;
}

const REVIEW_KIT_VERSION = packageJson.version;

const SHORTCUT_SECTIONS = [
  {
    title: 'Panels',
    items: [
      { keys: ['Shift', '1'], label: 'Design inspector' },
      { keys: ['Shift', '2'], label: 'Figma images' },
      { keys: ['Shift', '3'], label: 'QA list' },
      { keys: ['Shift', '4'], label: 'Component list' },
    ],
  },
  {
    title: 'Review modes',
    items: [
      { keys: ['Shift', 'Q / ㅂ'], label: 'Review page / normal page' },
      { keys: ['E / ㄷ'], label: 'Element QA' },
      { keys: ['A / ㅁ'], label: 'Area QA' },
    ],
  },
  {
    title: 'Overlays',
    items: [
      { keys: ['G / ㅎ'], label: 'Grid overlay' },
      { keys: ['F / ㄹ'], label: 'Figma overlay' },
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

export const PromptModal = ({ onClose, activeTab, onTabChange, children }: PromptModalProps) => {
  return (
    <ReviewModal
      ariaLabel="Review help"
      bodyClassName="df-review-df-body"
      description={`v${REVIEW_KIT_VERSION}`}
      dialogClassName="df-review-about-dialog df-review-standard-dialog"
      title="df-web-review-kit"
      onClose={onClose}
    >
      <div role="tablist" aria-label="DF popup" className="df-review-df-tabs">
        {(['About', 'Prompt', 'Settings', 'Shortcuts'] as const).map((tab, index, tabs) => (
          <button key={tab} type="button" role="tab" id={`df-popup-tab-${tab}`}
            aria-selected={activeTab === tab} aria-controls="df-popup-panel"
            tabIndex={activeTab === tab ? 0 : -1}
            onClick={() => onTabChange(tab)}
            onKeyDown={(event) => {
              const next = event.key === 'ArrowRight' ? (index + 1) % tabs.length
                : event.key === 'ArrowLeft' ? (index + tabs.length - 1) % tabs.length
                : event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : -1;
              if (next < 0) return;
              event.preventDefault();
              onTabChange(tabs[next]);
              event.currentTarget.parentElement?.querySelectorAll('button')[next]?.focus();
            }}>{tab}</button>
        ))}
      </div>
      <div role="tabpanel" id="df-popup-panel" aria-labelledby={`df-popup-tab-${activeTab}`} className="df-review-df-content" tabIndex={0}>
      {activeTab === 'About' && <section className="df-review-shortcut-group">
        <strong>df-web-review-kit</strong>
        <p>Review pages, compare Figma designs, and share QA feedback.</p>
        <span>Version {REVIEW_KIT_VERSION}</span>
      </section>}
      {activeTab === 'Shortcuts' && <div className="df-review-shortcut-groups">
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
      </div>}
      {children}
      </div>
    </ReviewModal>
  );
};

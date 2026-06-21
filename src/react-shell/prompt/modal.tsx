import { Copy as CopyIcon } from 'lucide-react';
import { getPromptLengthLabel } from './prompt';

interface PromptModalProps {
  initialPromptText: string;
  copiedPromptKey: string | null;
  onClose: () => void;
  onCopyPrompt: (text: string, key: string) => void;
}

const ABOUT_SECTIONS = [
  {
    title: 'What this is',
    body:
      'df-web-review-kit is a project-embedded review shell. It mounts a /review page, opens real host pages in an iframe, and lets reviewers create QA notes, area markers, and DOM markers against the actual implementation instead of a separate screenshot tool.',
  },
  {
    title: 'How to setup',
    body:
      'Install the package, mount the review route in the host project, and choose the storage adapters for that project. Local drafts work by default; shared remote QA and realtime presence depend on the host project configuration.',
  },
  {
    title: 'Figma token',
    body:
      'Add a browser-safe Figma token in Settings only when the host page already supports the Figma overlay helper. The package stores it in localStorage as figma-token and does not own a server-side Figma integration.',
  },
  {
    title: 'User ID',
    body:
      'Set your User ID in Settings before reviewing. It is used for presence, online user pills, and author context so teammates can tell who is looking at the same project or route.',
  },
  {
    title: 'Remote',
    body:
      'Remote QA is optional and project-specific. If you need shared canonical items, Supabase, or realtime presence, ask the project owner or 담당 개발자 which remote adapter and browser-safe env values are connected. Never put service_role or operator secrets in the browser.',
  },
];

export const PromptModal = ({
  initialPromptText,
  copiedPromptKey,
  onClose,
  onCopyPrompt,
}: PromptModalProps) => {
  return (
    <div
      aria-label="Review help"
      aria-modal="true"
      className="df-review-prompt-modal"
      role="dialog"
    >
      <button
        aria-label="Close help"
        className="df-review-prompt-backdrop"
        type="button"
        onClick={onClose}
      />
      <div className="df-review-prompt-dialog">
        <div className="df-review-prompt-header">
          <div>
            <strong>Review shell help</strong>
            <span>About / Initial prompt</span>
          </div>
          <button aria-label="Close help" type="button" onClick={onClose}>
            x
          </button>
        </div>
        <div className="df-review-prompt-body">
          <section
            className="df-review-prompt-about"
            aria-labelledby="df-review-about-title"
          >
            <div className="df-review-prompt-section-header">
              <strong id="df-review-about-title">About</strong>
              <span>Program overview and setup notes</span>
            </div>
            <div className="df-review-prompt-about-grid">
              {ABOUT_SECTIONS.map((section) => (
                <article key={section.title}>
                  <strong>{section.title}</strong>
                  <p>{section.body}</p>
                </article>
              ))}
            </div>
          </section>
          <section
            className="df-review-prompt-block"
            aria-labelledby="df-review-initial-prompt-title"
          >
            <div className="df-review-prompt-block-header">
              <div>
                <strong id="df-review-initial-prompt-title">
                  Initial Prompt
                </strong>
                <span>{getPromptLengthLabel(initialPromptText)}</span>
              </div>
              <button
                disabled={!initialPromptText}
                type="button"
                onClick={() => onCopyPrompt(initialPromptText, 'initial')}
              >
                <CopyIcon aria-hidden="true" />
                {copiedPromptKey === 'initial' ? 'Copied' : 'Copy'}
              </button>
            </div>
            <textarea
              readOnly
              aria-label="Initial Prompt content"
              value={initialPromptText || 'Initial prompt is not configured.'}
            />
          </section>
        </div>
      </div>
    </div>
  );
};

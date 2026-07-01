import { X as XIcon } from 'lucide-react';
import { DfLogoIcon } from '../review/df.logo';

interface PromptModalProps {
  onClose: () => void;
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
      'Project owners can set FIGMA_TOKEN on the server. Reviewers who cannot change env can add a browser-local Figma token in Settings; it is stored as figma-token and used only as an image-store fallback.',
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

export const PromptModal = ({ onClose }: PromptModalProps) => {
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
      <div className="df-review-prompt-dialog df-review-about-dialog">
        <button
          aria-label="Close help"
          className="df-review-about-close"
          type="button"
          onClick={onClose}
        >
          <XIcon aria-hidden="true" />
        </button>
        <div className="df-review-about-body">
          <div className="df-review-about-intro">
            <span className="df-review-about-logo" aria-hidden="true">
              <DfLogoIcon />
            </span>
            <strong>Review shell help</strong>
            <span>Program overview and setup notes</span>
          </div>
          {ABOUT_SECTIONS.map((section) => (
            <div className="df-review-about-item" key={section.title}>
              <strong>{section.title}</strong>
              <p>{section.body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

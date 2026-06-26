import { Copy as CopyIcon, X as XIcon } from 'lucide-react';
import { getPromptLengthLabel } from './prompt';

interface InitialPromptModalProps {
  initialPromptText: string;
  copiedPromptKey: string | null;
  onClose: () => void;
  onCopyPrompt: (text: string, key: string) => void;
}

export const InitialPromptModal = ({
  initialPromptText,
  copiedPromptKey,
  onClose,
  onCopyPrompt,
}: InitialPromptModalProps) => {
  return (
    <div
      aria-label="Initial prompt"
      aria-modal="true"
      className="df-review-prompt-modal"
      role="dialog"
    >
      <button
        aria-label="Close initial prompt"
        className="df-review-prompt-backdrop"
        type="button"
        onClick={onClose}
      />
      <div className="df-review-prompt-dialog df-review-prompt-dialog-narrow">
        <div className="df-review-prompt-header">
          <div>
            <strong>Initial Prompt</strong>
            <span>AI handoff script for coding agents</span>
          </div>
          <button
            aria-label="Close initial prompt"
            type="button"
            onClick={onClose}
          >
            <XIcon aria-hidden="true" />
          </button>
        </div>
        <div className="df-review-prompt-body">
          <section
            className="df-review-prompt-block"
            aria-labelledby="df-review-initial-prompt-title"
          >
            <div className="df-review-prompt-block-header">
              <div>
                <strong id="df-review-initial-prompt-title">
                  QA handoff prompt
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

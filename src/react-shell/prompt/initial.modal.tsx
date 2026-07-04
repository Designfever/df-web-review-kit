import { Copy as CopyIcon } from 'lucide-react';
import { ReviewModal } from '../review/modal';
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
    <ReviewModal
      ariaLabel="Initial prompt"
      description="AI handoff script for coding agents"
      dialogClassName="df-review-prompt-dialog-narrow"
      title="Initial Prompt"
      onClose={onClose}
    >
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
    </ReviewModal>
  );
};

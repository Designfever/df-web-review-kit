import { useEffect, useState } from 'react';
import type { ReviewItem } from '../../types';

interface QaItemEditModalProps {
  item: ReviewItem;
  onClose: () => void;
  onSave: (item: ReviewItem, comment: string) => Promise<void>;
}

export const QaItemEditModal = ({
  item,
  onClose,
  onSave,
}: QaItemEditModalProps) => {
  const [commentDraft, setCommentDraft] = useState(item.comment);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setCommentDraft(item.comment);
    setError('');
    setIsSaving(false);
  }, [item.id, item.comment]);

  const saveComment = async () => {
    const nextComment = commentDraft.trim();
    if (!nextComment) {
      setError('Comment is required.');
      return;
    }

    setError('');
    setIsSaving(true);
    try {
      await onSave(item, nextComment);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : 'Failed to update QA comment.'
      );
      setIsSaving(false);
    }
  };

  return (
    <div
      aria-modal="true"
      className="df-review-edit-modal"
      role="dialog"
      aria-labelledby="df-review-edit-title"
    >
      <button
        aria-label="Close edit dialog"
        className="df-review-settings-backdrop"
        type="button"
        onClick={onClose}
      />
      <form
        className="df-review-edit-dialog"
        onSubmit={(event) => {
          event.preventDefault();
          void saveComment();
        }}
      >
        <header className="df-review-settings-header">
          <div className="df-review-settings-title">
            <strong id="df-review-edit-title">Edit QA comment</strong>
            <span>Update the text shown on this QA item.</span>
          </div>
          <div className="df-review-settings-header-actions">
            <button
              aria-label="Close edit dialog"
              type="button"
              onClick={onClose}
            >
              x
            </button>
          </div>
        </header>
        <div className="df-review-settings-body df-review-edit-body">
          <label className="df-review-settings-field">
            <span>Comment</span>
            <div className="df-review-settings-text-input df-review-edit-textarea">
              <textarea
                autoFocus
                value={commentDraft}
                onChange={(event) => {
                  setCommentDraft(event.target.value);
                  if (error) setError('');
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Escape') {
                    event.preventDefault();
                    onClose();
                  }
                  if (
                    (event.metaKey || event.ctrlKey) &&
                    event.key === 'Enter'
                  ) {
                    event.preventDefault();
                    void saveComment();
                  }
                }}
              />
            </div>
          </label>
          {error && <p className="df-review-edit-error">{error}</p>}
          <footer className="df-review-settings-actions df-review-edit-actions">
            <span />
            <button disabled={isSaving} type="button" onClick={onClose}>
              Cancel
            </button>
            <button disabled={isSaving} type="submit">
              {isSaving ? 'Saving…' : 'Save'}
            </button>
          </footer>
        </div>
      </form>
    </div>
  );
};

import { useEffect, useState } from 'react';
import type { ReviewFieldsConfig, ReviewItem } from '../../types';

interface QaItemEditModalProps {
  fields: Required<Pick<ReviewFieldsConfig, 'title'>>;
  item: ReviewItem;
  onClose: () => void;
  onSave: (
    item: ReviewItem,
    patch: Pick<ReviewItem, 'comment'> & Partial<Pick<ReviewItem, 'title'>>
  ) => Promise<void>;
}

export const QaItemEditModal = ({
  fields,
  item,
  onClose,
  onSave,
}: QaItemEditModalProps) => {
  const [titleDraft, setTitleDraft] = useState(item.title ?? '');
  const [commentDraft, setCommentDraft] = useState(item.comment);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setTitleDraft(item.title ?? '');
    setCommentDraft(item.comment);
    setError('');
    setIsSaving(false);
  }, [item.id, item.title, item.comment]);

  const saveDetails = async () => {
    const nextTitle = titleDraft.trim();
    const nextComment = commentDraft.trim();
    if (!nextComment) {
      setError('Comment is required.');
      return;
    }

    setError('');
    setIsSaving(true);
    try {
      await onSave(item, {
        ...(fields.title ? { title: nextTitle || undefined } : {}),
        comment: nextComment,
      });
    } catch (error) {
      setError(
        error instanceof Error ? error.message : 'Failed to update QA.'
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
          void saveDetails();
        }}
      >
        <header className="df-review-settings-header">
          <div className="df-review-settings-title">
            <strong id="df-review-edit-title">Edit QA</strong>
            <span>
              {fields.title
                ? 'Update the title and comment.'
                : 'Update the comment.'}
            </span>
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
          {fields.title && (
            <label className="df-review-settings-field">
              <span>Title</span>
              <div className="df-review-settings-text-input">
                <input
                  autoFocus
                  value={titleDraft}
                  onChange={(event) => {
                    setTitleDraft(event.target.value);
                    if (error) setError('');
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'Escape') {
                      event.preventDefault();
                      onClose();
                    }
                  }}
                />
              </div>
            </label>
          )}
          <label className="df-review-settings-field">
            <span>Comment</span>
            <div className="df-review-settings-text-input df-review-edit-textarea">
              <textarea
                autoFocus={!fields.title}
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
                    void saveDetails();
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
              {isSaving && (
                <span className="df-review-spinner" aria-hidden="true" />
              )}
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </footer>
        </div>
      </form>
    </div>
  );
};

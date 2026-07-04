import React from 'react';
import { X as XIcon } from 'lucide-react';

interface ReviewModalProps {
  ariaLabel: string;
  bodyClassName?: string;
  children: React.ReactNode;
  className?: string;
  description?: React.ReactNode;
  dialogClassName?: string;
  title: React.ReactNode;
  titleId?: string;
  onClose: () => void;
}

export const ReviewModal = ({
  ariaLabel,
  bodyClassName,
  children,
  className,
  description,
  dialogClassName,
  title,
  titleId,
  onClose,
}: ReviewModalProps) => {
  return (
    <div
      aria-label={ariaLabel}
      aria-modal="true"
      className={className ?? 'df-review-prompt-modal'}
      role="dialog"
    >
      <button
        aria-label={`Close ${ariaLabel}`}
        className="df-review-prompt-backdrop"
        type="button"
        onClick={onClose}
      />
      <div
        className={`df-review-prompt-dialog${dialogClassName ? ` ${dialogClassName}` : ''}`}
      >
        <div className="df-review-prompt-header">
          <div>
            <strong id={titleId}>{title}</strong>
            {description ? <span>{description}</span> : null}
          </div>
          <button
            aria-label={`Close ${ariaLabel}`}
            className="df-review-modal-close"
            type="button"
            onClick={onClose}
          >
            <XIcon aria-hidden="true" />
          </button>
        </div>
        <div className={bodyClassName ?? 'df-review-prompt-body'}>
          {children}
        </div>
      </div>
    </div>
  );
};

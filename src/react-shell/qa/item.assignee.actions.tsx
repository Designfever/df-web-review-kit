import { useRef, useState } from 'react';
import type { ReviewItem } from '../../types';
import type { ReviewShellAssigneeOption } from '../types';

interface QaItemAssigneeActionsProps {
  assigneeOptions: readonly ReviewShellAssigneeOption[];
  assigneeTitle: string;
  canUpdateAssignee: boolean;
  isDisabled?: boolean;
  item: ReviewItem;
  onChangeItemAssignee: (
    item: ReviewItem,
    assigneeIds: string[]
  ) => Promise<void>;
}

const getItemAssigneeIds = (item: ReviewItem) =>
  item.assigneeIds ?? (item.assigneeId ? [item.assigneeId] : []);

const getAssigneeLabels = (
  item: ReviewItem,
  assigneeOptions: readonly ReviewShellAssigneeOption[]
) => {
  const ids = getItemAssigneeIds(item);
  const names =
    item.assigneeNames ?? (item.assigneeName ? [item.assigneeName] : []);
  return ids.map(
    (id, index) =>
      names[index] ||
      assigneeOptions.find((option) => option.value === id)?.label ||
      id
  );
};

export const QaItemAssigneeActions = ({
  assigneeOptions,
  assigneeTitle,
  canUpdateAssignee,
  isDisabled = false,
  item,
  onChangeItemAssignee,
}: QaItemAssigneeActionsProps) => {
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const itemAssigneeIds = getItemAssigneeIds(item);
  const [selectedIds, setSelectedIds] = useState(itemAssigneeIds);
  const currentLabel = getAssigneeLabels(item, assigneeOptions).join(', ');

  if (!canUpdateAssignee && !currentLabel) return null;

  const apply = async () => {
    const orderedIds = assigneeOptions
      .filter((option) => selectedIds.includes(option.value))
      .map((option) => option.value);
    await onChangeItemAssignee(item, orderedIds);
    if (detailsRef.current) detailsRef.current.open = false;
  };

  return (
    <div
      className="df-review-item-assignee-actions"
      onClick={(event) => event.stopPropagation()}
    >
      {canUpdateAssignee ? (
        <details
          className="df-review-item-assignee-picker"
          ref={detailsRef}
        >
          <summary
            aria-label={`QA ${assigneeTitle}`}
            className="df-review-item-assignee-select"
            onClick={() => {
              if (!detailsRef.current?.open) setSelectedIds(itemAssigneeIds);
            }}
          >
            {currentLabel || assigneeTitle}
          </summary>
          <div className="df-review-item-assignee-menu">
            {assigneeOptions.map((option) => (
              <label
                className="df-review-item-assignee-option"
                key={option.value}
              >
                <input
                  checked={selectedIds.includes(option.value)}
                  disabled={isDisabled}
                  type="checkbox"
                  onChange={(event) => {
                    const checked = event.currentTarget.checked;
                    setSelectedIds((current) =>
                      checked
                        ? [...current, option.value]
                        : current.filter((id) => id !== option.value)
                    );
                  }}
                />
                <span>{option.label}</span>
              </label>
            ))}
            <div className="df-review-item-assignee-menu-actions">
              <button
                disabled={isDisabled}
                type="button"
                onClick={() => setSelectedIds([])}
              >
                Clear
              </button>
              <button
                disabled={isDisabled}
                type="button"
                onClick={() => void apply()}
              >
                Apply
              </button>
            </div>
          </div>
        </details>
      ) : (
        <span className="df-review-item-assignee-badge">{currentLabel}</span>
      )}
    </div>
  );
};

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
    assigneeId: string | null
  ) => Promise<void>;
}

const getAssigneeLabel = (
  item: ReviewItem,
  assigneeOptions: readonly ReviewShellAssigneeOption[]
) =>
  item.assigneeName ||
  assigneeOptions.find(
    (assigneeOption) => assigneeOption.value === item.assigneeId
  )?.label ||
  item.assigneeId ||
  '';

export const QaItemAssigneeActions = ({
  assigneeOptions,
  assigneeTitle,
  canUpdateAssignee,
  isDisabled = false,
  item,
  onChangeItemAssignee,
}: QaItemAssigneeActionsProps) => {
  const assigneeId = item.assigneeId ?? '';
  const currentLabel = getAssigneeLabel(item, assigneeOptions);
  const hasUnknownAssignee =
    Boolean(assigneeId) &&
    !assigneeOptions.some(
      (assigneeOption) => assigneeOption.value === assigneeId
    );

  if (!canUpdateAssignee && !currentLabel) return null;

  return (
    <div
      className="df-review-item-assignee-actions"
      onClick={(event) => event.stopPropagation()}
    >
      {canUpdateAssignee ? (
        <select
          aria-label={`QA ${assigneeTitle}`}
          className="df-review-item-assignee-select"
          disabled={isDisabled}
          value={assigneeId}
          onChange={(event) =>
            void onChangeItemAssignee(item, event.currentTarget.value || null)
          }
        >
          <option value="">{assigneeTitle}</option>
          {hasUnknownAssignee && (
            <option value={assigneeId}>{currentLabel}</option>
          )}
          {assigneeOptions.map((assigneeOption) => (
            <option key={assigneeOption.value} value={assigneeOption.value}>
              {assigneeOption.label}
            </option>
          ))}
        </select>
      ) : (
        <span className="df-review-item-assignee-badge">{currentLabel}</span>
      )}
    </div>
  );
};

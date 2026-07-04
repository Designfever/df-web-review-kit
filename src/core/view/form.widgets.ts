// DOM/Area draft 폼이 공유하는 입력 위젯 빌더 모음.
// 모든 함수는 상태를 직접 읽지 않고 값/콜백을 인자로 받는다.
import type { WebReviewKitOptions } from '../../types';
import { createSpinner } from './icons';

/** Finds the configured assignee option for a stored assignee id. */
function getAssigneeOption(
  options: WebReviewKitOptions,
  assigneeId: string | null | undefined
) {
  if (!assigneeId) return undefined;
  return options.assigneeOptions?.find(
    (option) => option.value === assigneeId
  );
}

/** Resolves the display name for an assignee id, if it is still configured. */
function getAssigneeName(
  options: WebReviewKitOptions,
  assigneeId: string | null | undefined
) {
  return getAssigneeOption(options, assigneeId)?.label;
}

/** Title input is opt-in per host project. */
export function isTitleFieldEnabled(options: WebReviewKitOptions) {
  return options.fields?.title === true;
}

export function createDraftTitleInput(
  value: string | undefined,
  onInput: (value: string) => void
) {
  const input = document.createElement('input');
  input.className = 'dfwr-input';
  input.placeholder = 'Title';
  input.type = 'text';
  input.value = value ?? '';
  input.addEventListener('input', () => onInput(input.value));
  return input;
}

/**
 * Assignee dropdown. Returns undefined when the host has no assignee options,
 * so callers can skip appending it entirely.
 */
export function createDraftAssigneeSelect(
  options: WebReviewKitOptions,
  value: string | null | undefined,
  fallbackLabel: string | undefined,
  onChange: (assigneeId: string | null, assigneeName?: string) => void
) {
  const assigneeOptions = options.assigneeOptions ?? [];
  if (assigneeOptions.length === 0) return undefined;
  const assigneeTitle = options.assigneeTitle?.trim() || 'Assignee';

  const select = document.createElement('select');
  select.className = 'dfwr-select';

  const emptyOption = document.createElement('option');
  emptyOption.value = '';
  emptyOption.textContent = assigneeTitle;
  select.append(emptyOption);

  // 저장된 담당자가 옵션 목록에서 빠졌어도 선택 값이 유실되지 않게 유지한다.
  const hasUnknownAssignee =
    Boolean(value) && !assigneeOptions.some((option) => option.value === value);
  if (hasUnknownAssignee && value) {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = fallbackLabel ?? value;
    select.append(option);
  }

  assigneeOptions.forEach((assigneeOption) => {
    const option = document.createElement('option');
    option.value = assigneeOption.value;
    option.textContent = assigneeOption.label;
    select.append(option);
  });

  select.value = value ?? '';
  select.addEventListener('change', () => {
    onChange(select.value || null, getAssigneeName(options, select.value));
  });

  return select;
}

/** Collects trimmed form values in the shape createItem expects. */
export function getDraftFields(
  options: WebReviewKitOptions,
  titleInput: HTMLInputElement | undefined,
  textarea: HTMLTextAreaElement,
  assigneeSelect: HTMLSelectElement | undefined
) {
  const title = titleInput?.value.trim();
  const comment = textarea.value.trim();
  const assigneeId = assigneeSelect?.value.trim() || undefined;
  return {
    title: title || undefined,
    comment,
    assigneeId,
    assigneeName: getAssigneeName(options, assigneeId),
  };
}

/**
 * Save/Cancel action row. Three layouts:
 * - leading: 캡처/조정 버튼을 왼쪽에, Save/Cancel 을 오른쪽 그룹으로
 * - beforeSave/className: Cancel → 추가 버튼 → Save 순서 (커스텀 배치)
 * - 기본: Save → Cancel
 */
export function createFormActions({
  saveLabel,
  onSave,
  onCancel,
  isSaving,
  beforeSave,
  className,
  leading,
}: {
  saveLabel: string;
  onSave: () => void;
  onCancel: (event?: Event) => void;
  isSaving: boolean;
  beforeSave?: HTMLButtonElement[];
  className?: string;
  leading?: HTMLElement[];
}) {
  const actions = document.createElement('div');
  actions.className = ['dfwr-actions', className].filter(Boolean).join(' ');

  const save = document.createElement('button');
  save.className = 'dfwr-button is-primary';
  save.type = 'button';
  save.disabled = isSaving;
  save.setAttribute('aria-busy', isSaving ? 'true' : 'false');
  if (isSaving) {
    save.append(createSpinner('dfwr-spinner'), 'Saving...');
  } else {
    save.textContent = saveLabel;
  }
  save.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (save.disabled) return;
    onSave();
  });

  const cancel = document.createElement('button');
  cancel.className = 'dfwr-button';
  cancel.type = 'button';
  cancel.disabled = isSaving;
  cancel.textContent = 'Cancel';
  cancel.addEventListener('click', (event) => {
    onCancel(event);
  });

  if (leading?.length) {
    actions.classList.add('has-leading');
    const leadingGroup = document.createElement('div');
    leadingGroup.className = 'dfwr-actions-leading';
    leadingGroup.append(...leading);
    const primary = document.createElement('div');
    primary.className = 'dfwr-actions-primary';
    primary.append(save, cancel);
    actions.append(leadingGroup, primary);
    return actions;
  }

  if (beforeSave?.length || className) {
    actions.append(cancel, ...(beforeSave ?? []), save);
    return actions;
  }

  actions.append(save, cancel);
  return actions;
}

/** Inline error line under the draft form; hidden when there is no error. */
export function createDraftError(message: string | undefined) {
  if (!message) return undefined;

  const error = document.createElement('p');
  error.className = 'dfwr-form-error';
  error.setAttribute('role', 'alert');
  error.textContent = message;
  return error;
}

/** Grab handle shown on floating composers so they can be dragged around. */
export function createDraftDragHandle(label: string) {
  const handle = document.createElement('button');
  handle.className = 'dfwr-draft-drag-handle';
  handle.type = 'button';
  handle.setAttribute('aria-label', label);
  return handle;
}

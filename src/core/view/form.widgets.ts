// DOM/Area draft 폼이 공유하는 입력 위젯 빌더 모음.
// 모든 함수는 상태를 직접 읽지 않고 값/콜백을 인자로 받는다.
import {
  REVIEW_WORKFLOW_STATUS_OPTIONS,
  normalizeReviewItemStatus,
} from '../../status';
import type { ReviewItemStatus, WebReviewKitOptions } from '../../types';
import { createSpinner } from './icons';

const getStatusOptions = (options: WebReviewKitOptions) =>
  options.statusOptions?.length
    ? options.statusOptions
    : REVIEW_WORKFLOW_STATUS_OPTIONS;

const getAssigneeName = (options: WebReviewKitOptions, assigneeId: string) =>
  options.assigneeOptions?.find((option) => option.value === assigneeId)?.label;

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

export function createDraftStatusSelect(
  options: WebReviewKitOptions,
  value: ReviewItemStatus | undefined,
  onChange: (status: ReviewItemStatus) => void
) {
  const statusOptions = getStatusOptions(options);
  const selectedStatus =
    statusOptions.find((option) => option.value === value)?.value ??
    statusOptions[0]?.value ??
    'todo';

  const select = document.createElement('select');
  select.setAttribute('aria-label', 'QA status');

  const syncStatusClass = () => {
    select.className = `dfwr-select dfwr-status-select is-status-${normalizeReviewItemStatus(
      select.value as ReviewItemStatus
    )}`;
  };

  statusOptions.forEach((statusOption) => {
    const option = document.createElement('option');
    option.value = statusOption.value;
    option.textContent = statusOption.label;
    select.append(option);
  });

  select.value = selectedStatus;
  syncStatusClass();
  select.addEventListener('change', () => {
    syncStatusClass();
    onChange(select.value as ReviewItemStatus);
  });
  return select;
}

/** Multi-owner picker shared by DOM and Area draft forms. */
export function createDraftAssigneePicker(
  options: WebReviewKitOptions,
  valueIds: readonly string[],
  onChange: (assigneeIds: string[], assigneeNames: string[]) => void
) {
  const assigneeOptions = options.assigneeOptions ?? [];
  if (assigneeOptions.length === 0) return undefined;
  const assigneeTitle = options.assigneeTitle?.trim() || 'Assignee';
  const selectedIds = new Set(valueIds);

  const details = document.createElement('details');
  details.className = 'dfwr-assignee-picker';

  const summary = document.createElement('summary');
  summary.className = 'dfwr-select dfwr-assignee-summary';
  summary.setAttribute('aria-label', assigneeTitle);

  const menu = document.createElement('div');
  menu.className = 'dfwr-assignee-menu';

  const getSelectedOptions = () =>
    Array.from(
      menu.querySelectorAll<HTMLInputElement>('input[type="checkbox"]:checked')
    ).map((input) => ({
      value: input.value,
      label: input.dataset.label ?? input.value,
    }));

  const updateSummary = () => {
    const selected = getSelectedOptions();
    const labels = selected.map((option) => option.label);
    summary.textContent = labels.join(', ') || assigneeTitle;
    summary.title = labels.join(', ');
  };

  assigneeOptions.forEach((assigneeOption) => {
    const label = document.createElement('label');
    label.className = 'dfwr-assignee-option';
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.value = assigneeOption.value;
    input.checked = selectedIds.has(assigneeOption.value);
    input.dataset.label = assigneeOption.label;
    const text = document.createElement('span');
    text.textContent = assigneeOption.label;
    input.addEventListener('change', () => {
      const selected = getSelectedOptions();
      updateSummary();
      onChange(
        selected.map((option) => option.value),
        selected.map((option) => option.label)
      );
    });
    label.append(input, text);
    menu.append(label);
  });

  const menuActions = document.createElement('div');
  menuActions.className = 'dfwr-assignee-menu-actions';
  const clearButton = document.createElement('button');
  clearButton.type = 'button';
  clearButton.textContent = 'Clear';
  clearButton.addEventListener('click', (event) => {
    event.preventDefault();
    menu.querySelectorAll<HTMLInputElement>('input[type="checkbox"]').forEach(
      (input) => {
        input.checked = false;
      }
    );
    updateSummary();
    onChange([], []);
  });
  const applyButton = document.createElement('button');
  applyButton.type = 'button';
  applyButton.textContent = 'Apply';
  applyButton.addEventListener('click', (event) => {
    event.preventDefault();
    details.open = false;
  });
  menuActions.append(clearButton, applyButton);
  menu.append(menuActions);
  details.append(summary, menu);
  updateSummary();

  return details;
}

/** Collects trimmed form values in the shape createItem expects. */
export function getDraftFields(
  options: WebReviewKitOptions,
  titleInput: HTMLInputElement | undefined,
  textarea: HTMLTextAreaElement,
  statusSelect: HTMLSelectElement,
  assigneePicker: HTMLDetailsElement | undefined
) {
  const title = titleInput?.value.trim();
  const comment = textarea.value.trim();
  const selectedAssignees = Array.from(
    assigneePicker?.querySelectorAll<HTMLInputElement>(
      'input[type="checkbox"]:checked'
    ) ?? []
  );
  const assigneeIds = selectedAssignees.map((input) => input.value);
  const assigneeNames = assigneeIds.map(
    (assigneeId) => getAssigneeName(options, assigneeId) || assigneeId
  );
  return {
    title: title || undefined,
    comment,
    status: statusSelect.value as ReviewItemStatus,
    assigneeId: assigneeIds[0],
    assigneeName: assigneeNames[0],
    assigneeIds,
    assigneeNames,
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

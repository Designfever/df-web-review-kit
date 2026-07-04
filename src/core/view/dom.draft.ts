// DOM draft(요소 지정 QA)의 페이지 레이어 전체:
// 마커 핀 + 선택 하이라이트 + 작성 popover + adjustment(위치/스케일 미세조정) 패널.
// dockComposer 옵션이 켜지면 popover 를 페이지 대신 셸 패널에 도킹한다.
import type { ReviewPoint } from '../../types';
import {
  attachDraftImagePasteQueue,
  createDraftAttachmentQueue,
  removeDraftAttachment,
} from '../draft.attachments';
import {
  getAdjustedDraftPoint,
  getAdjustedDraftSelection,
  hasDraftAdjustment,
} from '../draft.metrics';
import {
  clampPoint,
  getPopoverPosition,
  roundPoint,
  toHostPoint,
  toHostSelection,
  toTargetPoint,
  toTargetPointFromHostEvent,
  toViewportSelection,
} from '../geometry';
import type { DomDraft } from '../review/draft';
import { formatDomDraftMeta } from '../review/format';
import {
  attachDraftComposerDrag,
  getDraftComposerPosition,
} from './composer.position';
import { createDraftCaptureButton } from './draft.capture';
import {
  getAdjustmentLabel,
  getDraftAdjustmentMetricLines,
  withDraftAdjustmentComment,
} from './draft.text';
import {
  createDraftAssigneeSelect,
  createDraftDragHandle,
  createDraftError,
  createDraftTitleInput,
  createFormActions,
  getDraftFields,
  isTitleFieldEnabled,
} from './form.widgets';
import { setAdjustmentToggleIcon } from './icons';
import { createSelectionHighlight } from './markers';
import type { DraftLayerContext } from './types';

/**
 * Builds the DOM draft layer: the on-page marker/highlight plus its composer
 * popover. When dockComposer is set the composer element is returned separately
 * so the caller can render it into the side panel instead.
 */
export function createDomDraftLayer(
  context: DraftLayerContext,
  draft: DomDraft,
  options: { dockComposer?: boolean } = {}
): { layer: HTMLElement; composer?: HTMLElement } {
  const { config } = context;
  const presets = config.options.viewports?.presets;
  const environment = config.getEnvironment();
  const group = document.createElement('div');
  group.className = 'dfwr-dom-draft';
  if (!environment) return { layer: group, composer: undefined };

  // element 모드에서 selection 이 있으면 "요소 draft" — adjustment 조작이 가능하다.
  const isElementDraft =
    config.getState().mode === 'element' && Boolean(draft.selection);
  const hostPoint = toHostPoint(
    isElementDraft
      ? getAdjustedDraftPoint(draft.marker.viewport, draft, presets)
      : draft.marker.viewport,
    environment
  );
  let selectionHighlight: HTMLDivElement | undefined;

  if (draft.selection) {
    const selection = toViewportSelection(draft.selection.viewport);
    selectionHighlight = createSelectionHighlight(
      isElementDraft
        ? getAdjustedDraftSelection(selection, draft, presets)
        : selection,
      environment,
      true
    );
    group.append(selectionHighlight);
  }

  const pin = document.createElement('button');
  pin.className = 'dfwr-dom-pin';
  pin.type = 'button';
  pin.setAttribute('aria-label', 'Move DOM point');
  pin.style.left = `${hostPoint.x}px`;
  pin.style.top = `${hostPoint.y}px`;

  const popover = document.createElement('div');
  const position = getPopoverPosition(hostPoint, environment);

  popover.className = [
    'dfwr-dom-popover',
    isElementDraft ? 'is-composer' : '',
    options.dockComposer ? 'is-docked-composer' : '',
  ]
    .filter(Boolean)
    .join(' ');
  if (options.dockComposer) {
    popover.style.width = '100%';
  } else if (isElementDraft) {
    const selection = draft.selection
      ? toHostSelection(
          getAdjustedDraftSelection(
            toViewportSelection(draft.selection.viewport),
            draft,
            presets
          ),
          environment
        )
      : undefined;
    const composer = getDraftComposerPosition({
      selection,
      environment,
      composerPosition: draft.composerPosition,
      estimatedHeight: 252,
    });
    popover.style.left = `${composer.left}px`;
    popover.style.top = `${composer.top}px`;
    popover.style.width = `${composer.width}px`;
  } else {
    popover.style.left = `${position.left}px`;
    popover.style.top = `${position.top}px`;
  }

  const form = document.createElement('form');
  form.className = 'dfwr-form';

  // 요소 draft 가 아닐 때만 좌표 메타 라인을 노출한다.
  const meta = isElementDraft ? undefined : document.createElement('div');
  if (meta) {
    meta.className = 'dfwr-item-date';
    meta.textContent = formatDomDraftMeta(draft);
  }

  const titleInput = isTitleFieldEnabled(config.options)
    ? createDraftTitleInput(draft.title, (title) => {
        const domDraft = config.getState().domDraft;
        if (!domDraft) return;
        config.actions.setDomDraft({
          ...domDraft,
          title,
        });
      })
    : undefined;

  const textarea = document.createElement('textarea');
  textarea.className = 'dfwr-textarea';
  textarea.placeholder = 'Review comment';
  textarea.rows = 4;
  textarea.value = draft.comment ?? '';
  textarea.addEventListener('input', () => {
    const domDraft = config.getState().domDraft;
    if (!domDraft) return;
    config.actions.setDomDraft({
      ...domDraft,
      comment: textarea.value,
    });
  });
  attachDraftImagePasteQueue(textarea, {
    getAttachments: () =>
      config.getState().domDraft?.attachments ?? draft.attachments,
    onAttachmentsChange: (attachments) => {
      const domDraft = config.getState().domDraft ?? draft;
      config.actions.setDomDraft({
        ...domDraft,
        comment: textarea.value,
        attachments,
      });
    },
    onCommentChange: (comment) => {
      const domDraft = config.getState().domDraft ?? draft;
      config.actions.setDomDraft({
        ...domDraft,
        comment,
      });
    },
    onPasteComplete: () => config.actions.render(),
  });

  const assigneeSelect = createDraftAssigneeSelect(
    config.options,
    draft.assigneeId,
    draft.assigneeName,
    (assigneeId, assigneeName) => {
      const domDraft = config.getState().domDraft;
      if (!domDraft) return;
      config.actions.setDomDraft({
        ...domDraft,
        assigneeId,
        assigneeName,
      });
    }
  );

  const saveDraft = () => {
    const currentDraft = config.getState().domDraft ?? draft;
    const fields = getDraftFields(
      config.options,
      titleInput,
      textarea,
      assigneeSelect
    );
    const comment = fields.comment;
    const hasAttachments = Boolean(currentDraft.attachments?.length);
    // 코멘트/adjustment/첨부 중 하나는 있어야 저장 의미가 있다.
    if (
      !comment &&
      !hasDraftAdjustment(currentDraft, presets) &&
      !hasAttachments
    ) {
      return;
    }
    void config.actions.createItem({
      kind: 'dom',
      title: fields.title,
      comment: withDraftAdjustmentComment(
        comment,
        currentDraft,
        config.options
      ),
      assigneeId: fields.assigneeId,
      assigneeName: fields.assigneeName,
      viewport: currentDraft.viewport,
      anchor: currentDraft.anchor,
      marker: currentDraft.marker,
      selection: currentDraft.selection,
      attachments: currentDraft.attachments,
    });
  };

  const adjustmentControls = isElementDraft
    ? createAdjustmentControls(context, {
        draft,
        pin,
        popover,
        selectionHighlight,
        textarea,
        dockToggle: options.dockComposer,
      })
    : undefined;
  const leadingActions = [
    adjustmentControls?.actionButton,
    createDraftCaptureButton(config, draft, {
      kind: 'dom',
      isElementDraft,
      textarea,
    }),
  ].filter((element): element is HTMLButtonElement => Boolean(element));

  const actions = createFormActions({
    saveLabel: 'Save DOM QA',
    isSaving: config.getState().isCreatingItem,
    onSave: saveDraft,
    onCancel: context.cancelDraft,
    leading: leadingActions.length > 0 ? leadingActions : undefined,
  });
  const error = createDraftError(config.getState().draftError);
  const attachmentQueue = createDraftAttachmentQueue(
    document,
    draft.attachments,
    (attachmentId) => {
      const domDraft = config.getState().domDraft ?? draft;
      const attachments = removeDraftAttachment(
        domDraft.attachments,
        attachmentId
      );
      config.actions.setDomDraft({
        ...domDraft,
        comment: textarea.value,
        attachments: attachments.length > 0 ? attachments : undefined,
      });
      config.actions.render();
    }
  );

  form.append(
    ...(meta ? [meta] : []),
    ...(adjustmentControls ? [adjustmentControls.panel] : []),
    ...(titleInput ? [titleInput] : []),
    textarea,
    ...(attachmentQueue ? [attachmentQueue] : []),
    ...(assigneeSelect ? [assigneeSelect] : []),
    ...(error ? [error] : []),
    actions
  );
  const dragHandle =
    isElementDraft && !options.dockComposer
      ? createDraftDragHandle('Move DOM composer')
      : undefined;
  popover.append(...(dragHandle ? [dragHandle] : []), form);
  group.append(pin);
  if (!options.dockComposer) {
    group.append(popover);
  }

  if (dragHandle) {
    attachDraftComposerDrag({
      getEnvironment: () => config.getEnvironment(),
      popover,
      handle: dragHandle,
      onMove: (composerPosition) => {
        const domDraft = config.getState().domDraft ?? draft;
        config.actions.setDomDraft({
          ...domDraft,
          composerPosition,
          comment: textarea.value,
        });
      },
    });
  }

  // 요소 draft 는 popover 가 자체 드래그 핸들로 움직이므로 핀만 이동시킨다.
  attachDraftPinDrag(context, {
    pin,
    popover: isElementDraft || options.dockComposer ? undefined : popover,
    meta,
    textarea,
  });

  if (!options.dockComposer) {
    // 렌더 직후 포커스: adjustment 조작 중이면 토글, 아니면 코멘트 입력으로.
    window.setTimeout(() => {
      if (draft.adjustment?.isActive) {
        adjustmentControls?.focusTarget.focus();
        return;
      }

      textarea.focus();
    }, 0);
  }

  return {
    layer: group,
    composer: options.dockComposer ? popover : undefined,
  };
}

/**
 * Element-adjustment controls (nudge the previewed element via arrow keys /
 * buttons). Wires keyboard deltas to the draft transform and keeps the pin,
 * popover, highlight and textarea in sync as the value changes.
 */
function createAdjustmentControls(
  context: DraftLayerContext,
  {
    draft,
    pin,
    popover,
    selectionHighlight,
    textarea,
    dockToggle,
  }: {
    draft: DomDraft;
    pin: HTMLButtonElement;
    popover: HTMLDivElement;
    selectionHighlight?: HTMLDivElement;
    textarea: HTMLTextAreaElement;
    dockToggle?: boolean;
  }
) {
  const { config } = context;
  const presets = config.options.viewports?.presets;
  const panel = document.createElement('div');
  panel.className = 'dfwr-adjust-panel is-dom-adjust-panel';

  const header = document.createElement('div');
  header.className = 'dfwr-adjust-panel-header';
  const help = document.createElement('div');
  help.className = 'dfwr-adjust-help';
  help.textContent = getAdjustmentLabel(config.options);

  const adjust = document.createElement('button');
  adjust.className = 'dfwr-adjust-toggle';
  adjust.type = 'button';
  adjust.title = 'Adjust DOM element with keyboard arrows';
  adjust.setAttribute('aria-label', 'Adjust DOM element with keyboard arrows');

  const xyStatus = document.createElement('div');
  xyStatus.className = 'dfwr-adjust-status';

  const scaleStatus = document.createElement('div');
  scaleStatus.className = 'dfwr-adjust-status';

  const syncControls = (nextDraft: DomDraft) => {
    const isActive = nextDraft.adjustment?.isActive === true;
    panel.classList.toggle('is-active', isActive);
    adjust.classList.toggle('is-active', isActive);
    adjust.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    setAdjustmentToggleIcon(adjust, isActive);
    adjust.title = isActive
      ? 'Finish DOM adjustment'
      : 'Adjust DOM element with keyboard arrows';
    adjust.setAttribute(
      'aria-label',
      isActive
        ? 'Finish DOM adjustment'
        : 'Adjust DOM element with keyboard arrows'
    );
    const [xyLine, scaleLine] = getDraftAdjustmentMetricLines(
      nextDraft,
      presets
    );
    xyStatus.textContent = xyLine;
    scaleStatus.textContent = scaleLine;
    syncDraftAdjustmentUi(context, {
      draft: nextDraft,
      pin,
      selectionHighlight,
    });
  };

  const updateDraft = (updater: (current: DomDraft) => DomDraft) => {
    const currentDraft = config.getState().domDraft ?? draft;
    const nextDraft = updater(currentDraft);
    config.actions.setDomDraft({
      ...nextDraft,
      comment: textarea.value,
    });
    syncControls(nextDraft);
  };

  adjust.addEventListener('click', () => {
    updateDraft((currentDraft) => ({
      ...currentDraft,
      adjustment: {
        x: currentDraft.adjustment?.x ?? 0,
        y: currentDraft.adjustment?.y ?? 0,
        scale: currentDraft.adjustment?.scale ?? 0,
        isActive: currentDraft.adjustment?.isActive !== true,
      },
    }));
    adjust.focus();
  });

  popover.addEventListener('keydown', (event) => {
    const currentDraft = config.getState().domDraft ?? draft;
    if (currentDraft.adjustment?.isActive !== true) return;

    const keyDelta = getAdjustmentKeyDelta(event);
    if (!keyDelta) return;

    event.preventDefault();
    event.stopPropagation();

    updateDraft((activeDraft) => ({
      ...activeDraft,
      adjustment: {
        x: (activeDraft.adjustment?.x ?? 0) + keyDelta.x,
        y: (activeDraft.adjustment?.y ?? 0) + keyDelta.y,
        scale: (activeDraft.adjustment?.scale ?? 0) + keyDelta.scale,
        isActive: true,
      },
    }));
  });

  header.append(help);
  if (!dockToggle) {
    header.append(adjust);
  }
  panel.append(header, xyStatus, scaleStatus);
  syncControls(draft);

  return {
    panel,
    focusTarget: adjust,
    // 도킹 모드에서는 토글 버튼을 폼 액션 줄(leading)로 옮긴다.
    actionButton: dockToggle ? adjust : undefined,
  };
}

/** 화살표 = x/y 이동, w/s = 스케일. Shift 는 10px 단위. */
function getAdjustmentKeyDelta(event: KeyboardEvent) {
  const step = event.shiftKey ? 10 : 1;

  if (event.key === 'ArrowLeft') return { x: -step, y: 0, scale: 0 };
  if (event.key === 'ArrowRight') return { x: step, y: 0, scale: 0 };
  if (event.key === 'ArrowUp') return { x: 0, y: -step, scale: 0 };
  if (event.key === 'ArrowDown') return { x: 0, y: step, scale: 0 };
  if (event.key.toLowerCase() === 'w') return { x: 0, y: 0, scale: step };
  if (event.key.toLowerCase() === 's') return { x: 0, y: 0, scale: -step };

  return undefined;
}

/** Re-applies adjusted coordinates to the pin/highlight and the live preview. */
function syncDraftAdjustmentUi(
  context: DraftLayerContext,
  {
    draft,
    pin,
    selectionHighlight,
  }: {
    draft: DomDraft;
    pin: HTMLButtonElement;
    selectionHighlight?: HTMLDivElement;
  }
) {
  const { config } = context;
  const presets = config.options.viewports?.presets;
  const environment = config.getEnvironment();
  if (!environment) return;

  const hostPoint = toHostPoint(
    getAdjustedDraftPoint(draft.marker.viewport, draft, presets),
    environment
  );
  pin.style.left = `${hostPoint.x}px`;
  pin.style.top = `${hostPoint.y}px`;

  if (draft.selection && selectionHighlight) {
    const rect = toHostSelection(
      getAdjustedDraftSelection(
        toViewportSelection(draft.selection.viewport),
        draft,
        presets
      ),
      environment
    );
    selectionHighlight.style.left = `${rect.left}px`;
    selectionHighlight.style.top = `${rect.top}px`;
    selectionHighlight.style.width = `${rect.width}px`;
    selectionHighlight.style.height = `${rect.height}px`;
  }

  context.syncDraftPreview(draft);
}

/**
 * Pin drag: moves the marker point. On release the draft is re-bound to the
 * element under the new point (bindElementDraftToPoint), carrying form fields.
 */
function attachDraftPinDrag(
  context: DraftLayerContext,
  {
    pin,
    popover,
    meta,
    textarea,
  }: {
    pin: HTMLButtonElement;
    popover: HTMLDivElement | undefined;
    meta: HTMLDivElement | undefined;
    textarea: HTMLTextAreaElement;
  }
) {
  const { config } = context;
  let isDragging = false;

  const moveDraftUi = (hostPoint: ReviewPoint) => {
    const environment = config.getEnvironment();
    if (!environment) return;

    const nextPoint = clampPoint(
      toTargetPoint(hostPoint, environment),
      environment
    );
    const nextHostPoint = toHostPoint(nextPoint, environment);

    pin.style.left = `${nextHostPoint.x}px`;
    pin.style.top = `${nextHostPoint.y}px`;
    if (popover) {
      const position = getPopoverPosition(nextHostPoint, environment);
      popover.style.left = `${position.left}px`;
      popover.style.top = `${position.top}px`;
    }

    const domDraft = config.getState().domDraft;
    if (!domDraft) return;

    const nextDraft = {
      ...domDraft,
      marker: {
        ...domDraft.marker,
        viewport: roundPoint(nextPoint),
      },
      comment: textarea.value,
    };
    config.actions.setDomDraft(nextDraft);
    if (meta) {
      meta.textContent = formatDomDraftMeta(nextDraft);
    }
  };

  pin.addEventListener('pointerdown', (event) => {
    if (event.button !== 0) return;

    event.preventDefault();
    event.stopPropagation();
    isDragging = true;
    pin.setPointerCapture(event.pointerId);
  });

  pin.addEventListener('pointermove', (event) => {
    if (!isDragging || !pin.hasPointerCapture(event.pointerId)) return;

    event.preventDefault();
    moveDraftUi({
      x: event.clientX,
      y: event.clientY,
    });
  });

  pin.addEventListener('pointerup', (event) => {
    if (!isDragging || !pin.hasPointerCapture(event.pointerId)) return;

    event.preventDefault();
    event.stopPropagation();
    isDragging = false;
    pin.releasePointerCapture(event.pointerId);

    const nextPoint = toTargetPointFromHostEvent(
      event,
      config.getEnvironment()
    );
    const currentDraft = config.getState().domDraft;
    const fields = {
      title: currentDraft?.title,
      comment: textarea.value,
      assigneeId: currentDraft?.assigneeId,
      assigneeName: currentDraft?.assigneeName,
    };
    void config.actions.bindElementDraftToPoint(nextPoint, fields);
  });
}

// Area draft(영역 지정 QA)의 작성 폼, 페이지 오버레이, 플로팅 popover.
// 폼은 내장 패널(코어 단독)과 플로팅 popover(React 셸) 양쪽에서 재사용된다.
import {
  attachDraftImagePasteQueue,
  createDraftAttachmentQueue,
  removeDraftAttachment,
} from '../draft.attachments';
import {
  toHostPoint,
  toHostSelection,
  toViewportSelection,
} from '../geometry';
import type { AreaDraft } from '../review/draft';
import { getReviewViewportScope } from '../review/scope';
import {
  attachDraftComposerDrag,
  getDraftComposerPosition,
} from './composer.position';
import { createDraftCaptureButton } from './draft.capture';
import {
  getAreaDraftMetricSelection,
  getSelectionMetricLines,
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
import { createMarkerElement, createSelectionHighlight } from './markers';
import type { DraftLayerContext } from './types';

/** Area draft form: metrics, comment, attachments, assignee, save/cancel. */
export function createAreaForm(context: DraftLayerContext) {
  const { config } = context;
  const form = document.createElement('form');
  form.className = 'dfwr-form';
  const areaDraft = config.getState().areaDraft;

  if (!areaDraft) {
    const empty = document.createElement('p');
    empty.className = 'dfwr-empty';
    empty.textContent = 'Drag on the page to select an area.';
    form.append(empty);
    return form;
  }

  form.append(createAreaMetricsPanel(context, areaDraft));

  const titleInput = isTitleFieldEnabled(config.options)
    ? createDraftTitleInput(areaDraft.title, (title) => {
        const draft = config.getState().areaDraft;
        if (!draft) return;
        config.actions.setAreaDraft({
          ...draft,
          title,
        });
      })
    : undefined;

  const textarea = document.createElement('textarea');
  textarea.className = 'dfwr-textarea';
  textarea.placeholder = 'Area comment';
  textarea.rows = 4;
  textarea.value = areaDraft.comment ?? '';
  textarea.addEventListener('input', () => {
    const draft = config.getState().areaDraft;
    if (!draft) return;
    config.actions.setAreaDraft({
      ...draft,
      comment: textarea.value,
    });
  });
  // textarea 에 이미지를 붙여넣으면 첨부 큐로 들어간다.
  attachDraftImagePasteQueue(textarea, {
    getAttachments: () =>
      config.getState().areaDraft?.attachments ?? areaDraft.attachments,
    onAttachmentsChange: (attachments) => {
      const draft = config.getState().areaDraft ?? areaDraft;
      config.actions.setAreaDraft({
        ...draft,
        comment: textarea.value,
        attachments,
      });
    },
    onCommentChange: (comment) => {
      const draft = config.getState().areaDraft ?? areaDraft;
      config.actions.setAreaDraft({
        ...draft,
        comment,
      });
    },
    onPasteComplete: () => config.actions.render(),
  });

  const assigneeSelect = createDraftAssigneeSelect(
    config.options,
    areaDraft.assigneeId,
    areaDraft.assigneeName,
    (assigneeId, assigneeName) => {
      const draft = config.getState().areaDraft;
      if (!draft) return;
      config.actions.setAreaDraft({
        ...draft,
        assigneeId,
        assigneeName,
      });
    }
  );

  const actions = createFormActions({
    saveLabel: 'Save area',
    isSaving: config.getState().isCreatingItem,
    onCancel: context.cancelDraft,
    onSave: () => {
      const draft = config.getState().areaDraft;
      const fields = getDraftFields(
        config.options,
        titleInput,
        textarea,
        assigneeSelect
      );
      const comment = fields.comment;
      // 코멘트도 첨부도 없는 빈 draft 는 저장하지 않는다.
      if ((!comment && !draft?.attachments?.length) || !draft) return;
      void config.actions.createItem({
        kind: 'area',
        title: fields.title,
        comment,
        assigneeId: fields.assigneeId,
        assigneeName: fields.assigneeName,
        viewport: draft.viewport,
        anchor: draft.anchor,
        marker: draft.marker,
        selection: draft.selection,
        attachments: draft.attachments,
      });
    },
    leading: [
      createDraftCaptureButton(config, areaDraft, {
        kind: 'area',
        textarea,
      }),
    ],
  });
  const error = createDraftError(config.getState().draftError);
  const attachmentQueue = createDraftAttachmentQueue(
    document,
    areaDraft.attachments,
    (attachmentId) => {
      const draft = config.getState().areaDraft ?? areaDraft;
      const attachments = removeDraftAttachment(
        draft.attachments,
        attachmentId
      );
      config.actions.setAreaDraft({
        ...draft,
        comment: textarea.value,
        attachments: attachments.length > 0 ? attachments : undefined,
      });
      config.actions.render();
    }
  );

  form.append(
    ...(titleInput ? [titleInput] : []),
    textarea,
    ...(attachmentQueue ? [attachmentQueue] : []),
    ...(assigneeSelect ? [assigneeSelect] : []),
    ...(error ? [error] : []),
    actions
  );
  return form;
}

/** Read-only metrics header (design-px position/size) above the area form. */
function createAreaMetricsPanel(context: DraftLayerContext, draft: AreaDraft) {
  const panel = document.createElement('div');
  panel.className = 'dfwr-adjust-panel is-area-metrics-panel';

  const [labelLine, xyLine, sizeLine] = getSelectionMetricLines(
    getAreaDraftMetricSelection(draft),
    draft.viewport,
    context.config.options.viewports?.presets
  );

  const help = document.createElement('div');
  help.className = 'dfwr-adjust-help';
  help.textContent = labelLine;

  const xyStatus = document.createElement('div');
  xyStatus.className = 'dfwr-adjust-status';
  xyStatus.textContent = xyLine;

  const sizeStatus = document.createElement('div');
  sizeStatus.className = 'dfwr-adjust-status';
  sizeStatus.textContent = sizeLine;

  panel.append(help, xyStatus, sizeStatus);
  return panel;
}

/** Selection highlight + center dot shown on the page while drafting an area. */
export function createAreaDraftOverlay(
  context: DraftLayerContext,
  draft: AreaDraft
) {
  const { config } = context;
  const layer = document.createElement('div');
  layer.className = 'dfwr-area-preview-layer';

  const environment = config.getEnvironment();
  if (!environment || !draft.selection) return layer;

  const selection = toViewportSelection(draft.selection.viewport);
  layer.append(createSelectionHighlight(selection, environment, true));

  if (draft.marker) {
    const hostPoint = toHostPoint(draft.marker.viewport, environment);
    layer.append(
      createMarkerElement(
        undefined,
        hostPoint,
        '•',
        getReviewViewportScope(
          draft.viewport,
          config.options.viewports?.presets
        ),
        true,
        true
      )
    );
  }

  return layer;
}

/** Floating (or docked) composer popover wrapping the area form. */
export function createAreaDraftPopover(
  context: DraftLayerContext,
  draft: AreaDraft,
  options: { dockComposer?: boolean } = {}
) {
  const { config } = context;
  const environment = config.getEnvironment();
  const popover = document.createElement('div');
  popover.className = [
    'dfwr-area-draft',
    'is-composer',
    options.dockComposer ? 'is-docked-composer' : '',
  ]
    .filter(Boolean)
    .join(' ');
  if (options.dockComposer) {
    // 도킹 모드에서는 셸 패널이 폭을 결정한다.
    popover.style.width = '100%';
  } else if (environment && draft.selection) {
    const selection = toHostSelection(
      toViewportSelection(draft.selection.viewport),
      environment
    );
    const composer = getDraftComposerPosition({
      selection,
      environment,
      composerPosition: draft.composerPosition,
      estimatedHeight: 220,
    });
    popover.style.left = `${composer.left}px`;
    popover.style.top = `${composer.top}px`;
    popover.style.width = `${composer.width}px`;
    popover.style.right = 'auto';
  }
  const dragHandle = options.dockComposer
    ? undefined
    : createDraftDragHandle('Move area composer');
  popover.append(
    ...(dragHandle ? [dragHandle] : []),
    createAreaForm(context)
  );
  if (dragHandle) {
    attachDraftComposerDrag({
      getEnvironment: () => config.getEnvironment(),
      popover,
      handle: dragHandle,
      onMove: (composerPosition) => {
        const areaDraft = config.getState().areaDraft ?? draft;
        config.actions.setAreaDraft({
          ...areaDraft,
          composerPosition,
        });
      },
    });
  }
  return popover;
}

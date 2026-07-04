// Draft 폼의 "Capture" 버튼과 캡처 요청 페이로드 빌더.
// 실제 스크린샷은 environment.captureViewport(React 셸이 주입)가 수행한다.
import {
  getAdjustedDraftPoint,
  getAdjustedDraftSelection,
} from '../draft.metrics';
import {
  roundPoint,
  toPublicSelection,
  toViewportSelection,
} from '../geometry';
import type { AreaDraft, DomDraft } from '../review/draft';
import { createSpinner } from './icons';
import type { WebReviewKitViewConfig } from './types';

/** Capture helper is optional; only the React shell provides it today. */
function canCaptureViewport(config: WebReviewKitViewConfig) {
  return Boolean(config.getEnvironment()?.captureViewport);
}

/** Area draft capture payload: stored coordinates as-is. */
function getCaptureAreaDraft(draft: AreaDraft) {
  return {
    viewport: draft.viewport,
    marker: draft.marker,
    selection: draft.selection,
  };
}

/**
 * DOM draft capture payload. Element drafts apply the pending adjustment
 * (nudge/scale) so the screenshot matches what the reviewer is previewing.
 */
function getCaptureDomDraft(
  config: WebReviewKitViewConfig,
  draft: DomDraft,
  isElementDraft: boolean
) {
  if (!isElementDraft) {
    return {
      viewport: draft.viewport,
      marker: draft.marker,
      selection: draft.selection,
    };
  }

  const presets = config.options.viewports?.presets;
  const marker = {
    ...draft.marker,
    viewport: roundPoint(
      getAdjustedDraftPoint(draft.marker.viewport, draft, presets)
    ),
  };
  const selection = draft.selection
    ? {
        ...draft.selection,
        viewport: toPublicSelection(
          getAdjustedDraftSelection(
            toViewportSelection(draft.selection.viewport),
            draft,
            presets
          )
        ),
      }
    : undefined;

  return {
    viewport: draft.viewport,
    marker,
    selection,
  };
}

/** Builds the capture button; disabled while capturing/saving or without helper. */
export function createDraftCaptureButton(
  config: WebReviewKitViewConfig,
  draft: DomDraft | AreaDraft,
  options:
    | {
        kind: 'dom';
        isElementDraft: boolean;
        textarea: HTMLTextAreaElement;
      }
    | {
        kind: 'area';
        textarea: HTMLTextAreaElement;
      }
) {
  const button = document.createElement('button');
  const state = config.getState();
  const isCapturing = state.isCapturingViewport;
  const canCapture = canCaptureViewport(config);

  button.className = 'dfwr-button';
  button.type = 'button';
  button.disabled = !canCapture || isCapturing || state.isCreatingItem;
  button.setAttribute('aria-busy', isCapturing ? 'true' : 'false');
  button.title = canCapture
    ? 'Capture current viewport'
    : 'Viewport capture helper is not available';
  if (isCapturing) {
    button.append(createSpinner('dfwr-spinner'), 'Capturing...');
  } else {
    button.textContent = 'Capture';
  }

  button.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    // 클릭 시점의 최신 상태로 다시 판정 (렌더 이후 상태가 바뀌었을 수 있음)
    const currentState = config.getState();
    if (!canCaptureViewport(config) || currentState.isCapturingViewport) {
      return;
    }

    if (options.kind === 'area') {
      const areaDraft = currentState.areaDraft ?? (draft as AreaDraft);
      // 캡처 전에 작성 중인 코멘트를 draft 에 반영해 유실을 막는다.
      const nextDraft = {
        ...areaDraft,
        comment: options.textarea.value,
      };
      config.actions.setAreaDraft(nextDraft);
      void config.actions.captureAreaDraft(getCaptureAreaDraft(nextDraft));
      return;
    }

    const domDraft = currentState.domDraft ?? (draft as DomDraft);
    const nextDraft = {
      ...domDraft,
      comment: options.textarea.value,
    };
    config.actions.setDomDraft(nextDraft);
    void config.actions.captureDomDraft(
      getCaptureDomDraft(config, nextDraft, options.isElementDraft)
    );
  });

  return button;
}

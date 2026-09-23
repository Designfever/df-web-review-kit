import {
  toHostSelection,
  toViewportSelection,
  type ViewportSelection,
} from '../geometry';
import type { AreaDraft, DomDraft } from '../review/draft';
import type { DraftLayerContext } from './types';

const FRAME_INTERVAL = 1000 / 30;

export function createAreaAnnotationLayer(
  context: DraftLayerContext,
  initialDraft: AreaDraft
) {
  const { config } = context;
  return createAnnotationToolbar(context, initialDraft, {
    getDraft: () => config.getState().areaDraft,
    setDraft: (draft) => config.actions.setAreaDraft(draft),
    getSelection: (draft) => {
      const selection = draft.selection?.viewport;
      return selection ? toViewportSelection(selection) : undefined;
    },
  });
}

export function createDomAnnotationLayer(
  context: DraftLayerContext,
  initialDraft: DomDraft,
  getSelection: (draft: DomDraft) => ViewportSelection | undefined
) {
  const { config } = context;
  return createAnnotationToolbar(context, initialDraft, {
    getDraft: () => config.getState().domDraft,
    setDraft: (draft) => config.actions.setDomDraft(draft),
    getSelection,
  });
}

type AnnotationDraft = Pick<
  AreaDraft,
  'annotationTool' | 'annotations'
>;

function createAnnotationToolbar<T extends AnnotationDraft>(
  context: DraftLayerContext,
  initialDraft: T,
  options: {
    getDraft: () => T | undefined;
    setDraft: (draft: T) => void;
    getSelection: (draft: T) => ViewportSelection | undefined;
  }
) {
  const { config } = context;
  const toolbar = document.createElement('div');
  toolbar.className = 'dfwr-area-annotation-toolbar';

  const actionButton = document.createElement('button');
  actionButton.type = 'button';
  actionButton.className = 'dfwr-area-annotation-action';
  const actionIcon = document.createElement('span');
  actionIcon.setAttribute('aria-hidden', 'true');
  for (let index = 0; index < 4; index += 1) {
    actionIcon.append(document.createElement('span'));
  }
  actionButton.append(actionIcon);
  toolbar.append(actionButton);

  const getDraft = () => options.getDraft() ?? initialDraft;
  const syncAction = (draft: T) => {
    const hasAnnotations = Boolean(draft.annotations?.length);
    const active = !hasAnnotations && draft.annotationTool === 'rectangle';
    const label = hasAnnotations ? 'Clear annotations' : 'Draw rectangle';
    actionButton.setAttribute('aria-label', label);
    actionButton.setAttribute('aria-pressed', String(active));
    actionButton.title = label;
    actionButton.classList.toggle('is-active', active);
    actionIcon.className = hasAnnotations
      ? 'dfwr-area-annotation-clear-icon'
      : 'dfwr-area-annotation-rectangle-icon';
  };
  syncAction(getDraft());

  let lastFrame = 0;
  const sync = (time: number) => {
    if (!toolbar.isConnected) return;
    toolbar.ownerDocument.defaultView?.requestAnimationFrame(sync);
    if (time - lastFrame < FRAME_INTERVAL) return;
    lastFrame = time;

    const draft = getDraft();
    syncAction(draft);
    const environment = config.getEnvironment();
    const selection = options.getSelection(draft);
    if (!environment || !selection) return;
    const rect = toHostSelection(selection, environment);
    toolbar.style.left = `${rect.left + rect.width}px`;
    toolbar.style.top = `${Math.max(8, rect.top - 34)}px`;
  };

  actionButton.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    const draft = getDraft();
    if (draft.annotations?.length) {
      options.setDraft({
        ...draft,
        annotationTool: undefined,
        annotations: undefined,
      });
      config.actions.render();
      return;
    }
    options.setDraft({
      ...draft,
      annotationTool:
        draft.annotationTool === 'rectangle' ? undefined : 'rectangle',
    });
    config.actions.render();
  });

  toolbar.ownerDocument.defaultView?.requestAnimationFrame(sync);
  return toolbar;
}

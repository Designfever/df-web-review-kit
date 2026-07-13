// 코어 오버레이의 진입 렌더러. 실제 DOM 조립은 view/* 모듈이 담당하고
// 이 클래스는 상태를 읽어 어떤 레이어를 그릴지 결정하는 오케스트레이션과
// 셸 패널로의 composer 도킹만 책임진다.
//
// 모듈 구성:
// - view/panel.ts            내장 사이드 패널 (헤더/툴바/리스트)
// - view/markers.ts          저장된 아이템 마커/하이라이트 레이어
// - view/selection.layers.ts 요소 클릭 / 영역 드래그 선택 레이어
// - view/dom.draft.ts        DOM draft 작성 popover + adjustment 조작
// - view/area.draft.ts       Area draft 폼/오버레이/popover
// - view/form.widgets.ts     폼 공용 위젯, view/draft.capture.ts 캡처 버튼
// - view/composer.position.ts / draft.text.ts / icons.ts  순수 헬퍼
import * as draftMetrics from './draft.metrics';
import { DraftPreviewController } from './draft.preview';
import { createStyleElement } from './overlay.style';
import { createAreaDraftOverlay, createAreaDraftPopover, createAreaForm } from './view/area.draft';
import { createDomDraftLayer } from './view/dom.draft';
import { createMarkerLayer } from './view/markers';
import { createReviewPanel } from './view/panel';
import { createAreaLayer, createElementLayer } from './view/selection.layers';
import type {
  DraftLayerContext,
  WebReviewKitViewConfig,
} from './view/types';

export type {
  CreateReviewItemInput,
  WebReviewKitViewConfig,
} from './view/types';

/** Vanilla DOM renderer for the core overlay, separate from React shell chrome. */
export class WebReviewKitView {
  private readonly draftPreview: DraftPreviewController;
  private readonly draftContext: DraftLayerContext;
  /** React 셸 패널 안에 composer 를 도킹했을 때의 호스트 요소. */
  private shellComposerHost?: HTMLElement;

  constructor(private readonly config: WebReviewKitViewConfig) {
    const presets = () => this.config.options.viewports?.presets;
    this.draftPreview = new DraftPreviewController({
      getEnvironment: () => this.config.getEnvironment(),
      getMetrics: (draft) =>
        draftMetrics.getDraftAdjustmentMetrics(draft, presets()),
      hasAdjustment: (draft) =>
        draft.adjustment?.preview !== false &&
        draftMetrics.hasDraftAdjustment(draft, presets()),
    });
    // draft 레이어 모듈들이 공유하는 컨텍스트. config 외에 뷰 인스턴스가
    // 소유한 preview 동기화/취소 동작을 콜백으로 넘긴다.
    this.draftContext = {
      config: this.config,
      cancelDraft: (event) => this.cancelDraft(event),
      syncDraftPreview: (draft) => this.draftPreview.sync(draft),
    };
  }

  clearDraftPreview() {
    this.draftPreview.clear();
    this.clearShellComposer();
  }

  /** Rebuilds the entire shadow-root UI from the current state snapshot. */
  render(shadow: ShadowRoot, hiddenItemsStyle: HTMLStyleElement) {
    const state = this.state;
    this.draftPreview.sync(
      state.isOpen && state.mode === 'element' ? state.domDraft : undefined
    );

    shadow.replaceChildren();
    shadow.append(createStyleElement());
    shadow.append(hiddenItemsStyle);

    const hasSelectionOnlyDraft = state.domDraft?.isSelectionOnly === true;
    const hasDismissableDraft = Boolean(
      (state.domDraft && !hasSelectionOnlyDraft) || state.areaDraft
    );
    // 셸 모드(panel: false)에서 composerHost 가 준비돼 있으면 폼을 패널에 도킹.
    const shouldDockComposer =
      this.config.options.ui?.panel === false &&
      hasDismissableDraft &&
      !hasSelectionOnlyDraft &&
      Boolean(this.getShellComposerHost());
    let dockedComposer: HTMLElement | undefined;
    const shell = document.createElement('div');
    shell.className = [
      'dfwr-shell',
      state.isOpen ? 'is-open' : '',
      hasDismissableDraft && !shouldDockComposer ? 'has-dismissible-draft' : '',
    ]
      .filter(Boolean)
      .join(' ');
    shell.setAttribute('aria-hidden', state.isOpen ? 'false' : 'true');

    if (this.config.options.ui?.panel !== false) {
      // Standalone core usage gets a built-in panel; React shell disables this.
      shell.append(
        createReviewPanel(this.config, () =>
          createAreaForm(this.draftContext)
        )
      );
    }

    shell.append(
      createMarkerLayer({
        items: state.items,
        highlightedItemId: state.highlightedItemId,
        environment: this.config.getEnvironment(),
        presets: this.config.options.viewports?.presets,
        showCompactMarkers: this.config.options.ui?.markers !== 'external',
      })
    );
    if (state.isOpen && hasDismissableDraft && !shouldDockComposer) {
      shell.append(this.createDraftCancelLayer());
    }

    if (state.isOpen && state.mode === 'element') {
      if (state.domDraft) {
        const domDraft = createDomDraftLayer(this.draftContext, state.domDraft, {
          dockComposer: shouldDockComposer,
        });
        shell.append(domDraft.layer);
        dockedComposer = domDraft.composer;
      } else {
        shell.append(createElementLayer(this.config));
      }
    }

    if (
      state.isOpen &&
      state.mode === 'area' &&
      !state.areaDraft &&
      !state.isSelectingArea
    ) {
      shell.append(createAreaLayer(this.config));
    }

    if (
      state.isOpen &&
      state.mode === 'area' &&
      state.areaDraft &&
      this.config.options.ui?.panel === false
    ) {
      // Shell mode renders the draft form near the target because the side panel is React-owned.
      if (state.areaDraft.selection) {
        shell.append(createAreaDraftOverlay(this.draftContext, state.areaDraft));
      }
      const areaComposer = createAreaDraftPopover(
        this.draftContext,
        state.areaDraft,
        { dockComposer: shouldDockComposer }
      );
      if (shouldDockComposer) {
        dockedComposer = areaComposer;
      } else {
        shell.append(areaComposer);
      }
    }

    shadow.append(shell);
    this.renderShellComposer(dockedComposer);
  }

  private get state() {
    return this.config.getState();
  }

  private getShellComposerHost() {
    const environment = this.config.getEnvironment();
    if (this.config.options.ui?.panel !== false) return undefined;
    return environment?.composerHost ?? undefined;
  }

  /** Mounts the docked composer into the shell-provided host element. */
  private renderShellComposer(composer?: HTMLElement) {
    const host = composer ? this.getShellComposerHost() : undefined;
    if (!host || !composer) {
      this.clearShellComposer();
      return;
    }

    if (this.shellComposerHost && this.shellComposerHost !== host) {
      this.clearShellComposer();
    }

    this.shellComposerHost = host;
    // React 셸이 CSS 로 도킹 상태를 표시할 수 있게 data 속성을 남긴다.
    host.dataset.hasDraftComposer = 'true';
    if (host.parentElement) {
      host.parentElement.dataset.hasDraftComposer = 'true';
    }

    const shell = document.createElement('div');
    shell.className = 'dfwr-shell is-open is-shell-draft is-docked-composer';
    shell.append(composer);

    host.replaceChildren(createStyleElement(), shell);
  }

  private clearShellComposer() {
    const host = this.shellComposerHost;
    host?.replaceChildren();
    if (host) {
      delete host.dataset.hasDraftComposer;
      delete host.parentElement?.dataset.hasDraftComposer;
    }
    this.shellComposerHost = undefined;
  }

  /** Full-screen click-away layer that cancels the active draft. */
  private createDraftCancelLayer() {
    const layer = document.createElement('div');
    layer.className = 'dfwr-draft-cancel-layer';
    layer.setAttribute('aria-hidden', 'true');

    layer.addEventListener('pointerdown', (event) => {
      if (event.button !== 0) return;
      this.cancelDraft(event);
    });

    return layer;
  }

  private cancelDraft(event?: Event) {
    event?.preventDefault();
    event?.stopPropagation();
    event?.stopImmediatePropagation();
    this.config.actions.setModeState('idle');
    this.config.actions.clearDrafts();
    this.config.actions.setSelectingArea(false);
    this.config.actions.render();
  }
}

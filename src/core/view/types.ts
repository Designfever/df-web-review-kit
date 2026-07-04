// web.review.kit.view.ts 에서 분리한 뷰 계층 공용 타입.
// 뷰 모듈(view/*)은 앱 코어(web.review.kit.app.ts)를 직접 알지 못하고,
// 이 파일의 config/actions 인터페이스를 통해서만 상태를 읽고 갱신한다.
import type {
  ReviewItem,
  ReviewMode,
  ReviewPoint,
  WebReviewKitOptions,
} from '../../types';
import type { ReviewEnvironment, ViewportSelection } from '../geometry';
import type {
  AreaDraft,
  DomDraft,
  ReviewDraftAttachment,
} from '../review/draft';

/** Draft form fields carried over when a draft is re-bound to another point. */
type DraftItemFields = Partial<
  Pick<ReviewItem, 'title' | 'comment' | 'assigneeId' | 'assigneeName'>
>;

/** Minimal item payload collected by the view before the app fills persistence metadata. */
export type CreateReviewItemInput = Pick<ReviewItem, 'kind' | 'comment'> &
  Partial<
    Pick<
      ReviewItem,
      | 'title'
      | 'assigneeId'
      | 'assigneeName'
      | 'scope'
      | 'viewport'
      | 'anchor'
      | 'marker'
      | 'selection'
    >
  > & {
    attachments?: ReviewDraftAttachment[];
  };

/** Snapshot of app state the view reads on every render. */
interface WebReviewKitViewState {
  isOpen: boolean;
  mode: ReviewMode;
  items: ReviewItem[];
  domDraft?: DomDraft;
  areaDraft?: AreaDraft;
  draftError?: string;
  isCreatingItem: boolean;
  isCapturingViewport: boolean;
  isSelectingArea: boolean;
  highlightedItemId?: string;
}

/** Callbacks the view uses to mutate app state; the app owns all persistence. */
interface WebReviewKitViewActions {
  close: () => void;
  render: () => void;
  reload: () => Promise<ReviewItem[]>;
  restoreItem: (item: ReviewItem) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  setModeState: (mode: ReviewMode) => void;
  clearDrafts: () => void;
  setDomDraft: (draft?: DomDraft) => void;
  setAreaDraft: (draft?: AreaDraft) => void;
  setSelectingArea: (isSelectingArea: boolean) => void;
  createItem: (input: CreateReviewItemInput) => Promise<void>;
  captureDomDraft: (
    input: Pick<DomDraft, 'marker' | 'selection' | 'viewport'>
  ) => Promise<void>;
  captureAreaDraft: (
    input: Pick<AreaDraft, 'marker' | 'selection' | 'viewport'>
  ) => Promise<void>;
  bindElementDraftToPoint: (
    point: ReviewPoint,
    fields?: DraftItemFields
  ) => Promise<void>;
  createAreaDraft: (selection: ViewportSelection) => Promise<void>;
}

/** Everything a view module needs to render: options, live state, and actions. */
export interface WebReviewKitViewConfig {
  options: WebReviewKitOptions;
  getState: () => WebReviewKitViewState;
  getEnvironment: () => ReviewEnvironment | undefined;
  actions: WebReviewKitViewActions;
}

/**
 * Config plus the couple of callbacks draft composers need but the plain
 * config cannot provide (draft-preview sync lives on the view instance).
 */
export interface DraftLayerContext {
  config: WebReviewKitViewConfig;
  /** Cancels the active draft and resets the mode back to idle. */
  cancelDraft: (event?: Event) => void;
  /** Re-applies the DOM draft adjustment preview to the target element. */
  syncDraftPreview: (draft: DomDraft) => void;
}

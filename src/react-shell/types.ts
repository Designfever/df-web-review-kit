import type {
  ReviewAssigneeOption,
  ReviewFieldsConfig,
  ReviewItem,
  ReviewItemScope,
  ReviewItemStatus,
  ReviewWorkflowStatus,
  ReviewMode,
  ReviewRulerConfig,
  ReviewSource,
  WebReviewKitAdapter,
} from '../types';
import type {
  ReviewFigmaImageFormat,
  ReviewFigmaImageStore,
} from '../figma/image.types';

export type ReviewShellViewportKind = Exclude<ReviewItemScope, 'dom'>;

export type ReviewShellViewportPreset = {
  label: string;
  width: number;
  height: number;
  kind?: ReviewShellViewportKind;
  designWidth?: number;
  designHeight?: number;
};

export type ReviewShellPage = {
  href: string;
};

export type ReviewShellGlobEntries = Record<string, unknown>;

export type ReviewSourceEditor = 'vscode' | 'cursor' | 'webstorm' | 'custom';

export type ReviewSourceInspectorOptions = {
  enabled?: boolean;
  editor?: ReviewSourceEditor;
  urlTemplate?: string;
  /**
   * Source Tree에서 기본으로 내려갈 최대 DOM/source depth.
   */
  maxDepth?: number;
  /**
   * Source Tree item hover 시 iframe target outline 표시 여부.
   */
  hoverOutline?: boolean;
  /**
   * Source Tree에서 Placer primitive node까지 표시할지 여부.
   * 기본값은 false 로, wrapper noise를 줄이기 위해 Placer branch를 숨긴다.
   */
  includePlacer?: boolean;
  /**
   * 소스 후보에서 숨길 파일 패턴. 문자열은 경로 부분 일치, RegExp 는 정규식 매칭.
   * (예: core.section / control.render 등 인프라 파일 제외)
   */
  ignore?: readonly (string | RegExp)[];
};

export type ReviewShellStatusOption = {
  value: ReviewItemStatus;
  label: string;
};

export type ReviewShellAssigneeOption = ReviewAssigneeOption;

export type ReviewShellWriteMode = 'dom' | 'note' | 'area';

export type ReviewShellUpdateStatusInput = {
  id: string;
  item: ReviewItem;
  status: ReviewItemStatus;
  statusOption: ReviewShellStatusOption;
  statusIndex: number;
};

export type ReviewShellUpdateAssigneeInput = {
  id: string;
  item: ReviewItem;
  assigneeId: string | null;
  assigneeName?: string;
  assigneeOption?: ReviewShellAssigneeOption;
  assigneeIndex: number;
};

type ReviewShellSubmissionPatch = Partial<
  Pick<
    ReviewItem,
    | 'attachments'
    | 'externalLinks'
    | 'externalIssueId'
    | 'externalIssueUrl'
    | 'submittedAt'
    | 'submitStatus'
    | 'submitError'
  >
>;

export type ReviewShellSyncSubmissionInput = {
  id: string;
  item: ReviewItem;
  patch: ReviewShellSubmissionPatch;
};

export type ReviewShellAdapter = {
  label: ReviewSource;
  pageId?: string;
  defaultUserId?: string;
  get: WebReviewKitAdapter['get'];
  list: WebReviewKitAdapter['list'];
  create?: WebReviewKitAdapter['create'];
  update?: WebReviewKitAdapter['update'];
  uploadAttachment?: WebReviewKitAdapter['uploadAttachment'];
  fields?: ReviewFieldsConfig;
  statusOptions?: readonly ReviewShellStatusOption[];
  assigneeTitle?: string;
  assigneeOptions?: readonly ReviewShellAssigneeOption[];
  canWrite?: boolean | readonly ReviewShellWriteMode[];
  updateStatus?: (input: ReviewShellUpdateStatusInput) => Promise<ReviewItem>;
  updateAssignee?: (
    input: ReviewShellUpdateAssigneeInput
  ) => Promise<ReviewItem>;
  syncSubmission?: (
    input: ReviewShellSyncSubmissionInput
  ) => Promise<ReviewItem>;
  remove?: WebReviewKitAdapter['remove'];
};

export type ReviewShellAdapterMap = {
  local: WebReviewKitAdapter;
  remote?: WebReviewKitAdapter | null;
  remotePageId?: string;
  defaultUserId?: string;
};

export type ReviewShellAdapters = ReviewShellAdapterMap | ReviewShellAdapter[];

export type ReviewPresenceStatus = 'idle' | 'reviewing' | 'editing';

type ReviewPresenceViewport = {
  label: string;
  width: number;
  height: number;
  kind: ReviewShellViewportKind;
};

export type ReviewPresenceState = {
  projectId: string;
  sessionId: string;
  userId: string;
  displayName: string;
  color: string;
  routeKey: string;
  target: string;
  source: ReviewSource;
  viewport: ReviewPresenceViewport;
  mode: ReviewMode;
  selectedItemId?: string | null;
  selectedReviewNumber?: number | null;
  status: ReviewPresenceStatus;
  updatedAt: string;
};

export type ReviewPresenceUser = ReviewPresenceState;

export type ReviewPresenceContext = {
  projectId: string;
  sessionId: string;
  userId: string;
  displayName: string;
  color: string;
  initialState: ReviewPresenceState;
};

export type ReviewPresenceSession = {
  update: (state: Partial<ReviewPresenceState>) => void | Promise<void>;
  subscribe: (
    callback: (users: ReviewPresenceUser[]) => void
  ) => () => void;
  disconnect: () => void | Promise<void>;
};

export type ReviewPresenceAdapter = {
  label: string;
  connect: (
    context: ReviewPresenceContext
  ) => Promise<ReviewPresenceSession> | ReviewPresenceSession;
};

export type ReviewShellFigmaImagesOptions = {
  enabled?: boolean;
  store?: ReviewFigmaImageStore;
  imageFormat?: ReviewFigmaImageFormat;
};

export interface CreateReviewPagesOptions {
  root?: string;
  exclude?: (href: string) => boolean;
}

export interface ReviewShellProps {
  projectId: string;
  pages: ReviewShellPage[];
  adapters: ReviewShellAdapters;
  presets?: ReviewShellViewportPreset[];
  ruler?: ReviewRulerConfig;
  initialPrompt?: string;
  adjustmentLabel?: string;
  reviewPathPrefix?: string;
  sourceRoot?: string;
  sourceInspector?: ReviewSourceInspectorOptions;
  presence?: ReviewPresenceAdapter;
  figmaImages?: ReviewShellFigmaImagesOptions;
}

export interface ReviewShellMountOptions extends ReviewShellProps {
  rootId?: string;
}

export type TargetOverlayKey = 'grid' | 'figma';

export type TargetOverlayState = Record<TargetOverlayKey, boolean>;

export type ReviewQaFilter = 'all' | ReviewItemScope;
export type ReviewQaStatusFilter = 'all' | ReviewWorkflowStatus;

export type ReviewShellTheme = 'dark' | 'light' | 'system';

export type ReviewRulerPoint = {
  x: number;
  y: number;
};

export type ReviewRulerMeasure = {
  left: number;
  top: number;
  width: number;
  height: number;
};

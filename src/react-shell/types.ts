import type {
  ReviewItem,
  ReviewItemScope,
  ReviewItemStatus,
  ReviewMode,
  ReviewRulerConfig,
  ReviewSource,
  WebReviewKitAdapter,
} from '../types';

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

export type ReviewShellStatusOption = {
  value: ReviewItemStatus;
  label: string;
};

export type ReviewShellWriteMode = 'dom' | 'note' | 'area';

export type ReviewShellUpdateStatusInput = {
  id: string;
  item: ReviewItem;
  status: ReviewItemStatus;
  statusOption: ReviewShellStatusOption;
  statusIndex: number;
};

export type ReviewShellSubmissionPatch = Partial<
  Pick<
    ReviewItem,
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
  get: WebReviewKitAdapter['get'];
  list: WebReviewKitAdapter['list'];
  create?: WebReviewKitAdapter['create'];
  update?: WebReviewKitAdapter['update'];
  statusOptions?: readonly ReviewShellStatusOption[];
  canWrite?: boolean | readonly ReviewShellWriteMode[];
  updateStatus?: (input: ReviewShellUpdateStatusInput) => Promise<ReviewItem>;
  syncSubmission?: (
    input: ReviewShellSyncSubmissionInput
  ) => Promise<ReviewItem>;
  remove?: WebReviewKitAdapter['remove'];
};

export type ReviewShellAdapterMap = {
  local: WebReviewKitAdapter;
  remote?: WebReviewKitAdapter | null;
  remotePageId?: string;
};

export type ReviewShellAdapters = ReviewShellAdapterMap | ReviewShellAdapter[];

export type ReviewPresenceStatus = 'idle' | 'reviewing' | 'editing';

export type ReviewPresenceViewport = {
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
  reviewPathPrefix?: string;
  presence?: ReviewPresenceAdapter;
}

export interface ReviewShellMountOptions extends ReviewShellProps {
  rootId?: string;
}

export type TargetOverlayKey = 'grid' | 'figma';

export type TargetOverlayState = Record<TargetOverlayKey, boolean>;

export type ReviewQaFilter = 'all' | ReviewItemScope;

export type ReviewShellTheme = 'dark' | 'light' | 'system';

export type ReviewPromptTab = 'about' | 'initial';

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

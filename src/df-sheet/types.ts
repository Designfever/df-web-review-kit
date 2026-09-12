import type { ReviewFigmaImageStore } from '../figma/image.types';
import type { ReviewItem } from '../types';
import type { ReviewShellAdapter, ReviewShellAssigneeOption } from '../react-shell/types';

export type DfSheetReviewPage = {
  id: string;
  name: string;
};

export type DfSheetReviewProject = {
  id: string;
  key: string;
};

export type DfSheetReviewUser = {
  user_id: string;
  name: string | null;
};

export type DfSheetReviewAssignee = ReviewShellAssigneeOption;

export type ConnectDfSheetReviewOptions = {
  projectId: string;
  /** Select the QA page in df-sheet before returning to the host. */
  selectPage?: boolean;
  baseUrl?: string;
  fetch?: typeof fetch;
};

export type DfSheetReviewAdapterOptions = {
  pageId: string;
  source?: string;
  reviewPathPrefix?: string;
  fields?: ReviewShellAdapter['fields'];
  buildPrompt?: (item: ReviewItem) => string | undefined;
  assigneeTitle?: string;
  assigneeOptions?: readonly ReviewShellAssigneeOption[];
};

export type DfSheetReviewSession = {
  project: DfSheetReviewProject;
  selectedPageId?: string;
  user: DfSheetReviewUser;
  expiresAt: number;
  listPages: () => Promise<DfSheetReviewPage[]>;
  listAssignees: () => Promise<DfSheetReviewAssignee[]>;
  createAdapter: (options: DfSheetReviewAdapterOptions) => ReviewShellAdapter;
  figmaImageStore: ReviewFigmaImageStore;
  disconnect: () => void;
  createLogoutUrl: () => Promise<string>;
};

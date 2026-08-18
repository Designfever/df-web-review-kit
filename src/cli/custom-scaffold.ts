export const CUSTOM_REVIEW_PATH = 'src/review/custom.review.tsx';
export const CUSTOM_FIGMA_PATH = 'src/review/custom.figma.store.ts';

export const CUSTOM_REVIEW_TODO = 'WEB_REVIEW_KIT_CUSTOM_REVIEW_TODO';
export const CUSTOM_FIGMA_TODO = 'WEB_REVIEW_KIT_CUSTOM_FIGMA_TODO';

const HOST_OWNED_HEADER =
  '// Created by @designfever/web-review-kit. This file is host-owned; edit it directly.';

export function renderCustomReviewScaffold() {
  return `${HOST_OWNED_HEADER}
import type {
  ReviewProviderBootstrap,
  ReviewShellAdapter,
} from '@designfever/web-review-kit/react-shell';

const incomplete = (): never => {
  throw new Error('${CUSTOM_REVIEW_TODO}: implement the host review adapter or gate.');
};

const customReviewAdapter: ReviewShellAdapter = {
  label: 'custom',
  get: async () => incomplete(),
  list: async () => incomplete(),
};

export const customReviewBootstrap: ReviewProviderBootstrap = {
  mount({ onReady }) {
    // For a host-specific flow, mount the login/project/page gate here.
    // Remove the gate before calling onReady with the selected adapter.
    onReady({ adapters: [customReviewAdapter] });
  },
};
`;
}

export function renderCustomFigmaScaffold() {
  return `${HOST_OWNED_HEADER}
import type { ReviewFigmaImageStore } from '@designfever/web-review-kit';

const incomplete = (): never => {
  throw new Error('${CUSTOM_FIGMA_TODO}: implement the host Figma image store.');
};

export const customFigmaImageStore: ReviewFigmaImageStore = {
  listImages: async () => incomplete(),
  addImage: async () => incomplete(),
  updateImage: async () => incomplete(),
  reorderImages: async () => incomplete(),
  deleteImage: async () => incomplete(),
};
`;
}

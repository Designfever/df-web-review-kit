// prop 유래 설정값 전달용 context. mount 후 사실상 불변이라 store 에 넣지 않는다.
import {
  createContext,
  useContext,
} from 'react';
import type { ReviewViewportPreset } from '../../types';
import {
  normalizeReviewShellAdapters,
  type NormalizedReviewShellAdapter,
} from '../adapters';
import { DEFAULT_REVIEW_PATH_PREFIX } from '../route';
import type {
  ReviewShellPage,
  ReviewShellProps,
  ReviewShellViewportPreset,
} from '../types';
import {
  DEFAULT_REVIEW_VIEWPORT_PRESETS,
  toReviewViewportPresets,
} from '../viewport';

export interface ReviewShellConfig {
  projectId: string;
  pages: ReviewShellPage[];
  reviewPathPrefix: string;
  viewportPresets: ReviewShellViewportPreset[];
  reviewViewportPresets: ReviewViewportPreset[];
  localAdapterEntry: NormalizedReviewShellAdapter | null;
  remoteAdapterEntry: NormalizedReviewShellAdapter | null;
  sourceEntries: NormalizedReviewShellAdapter[];
  showSourceSelect: boolean;
}

export const createReviewShellConfig = ({
  projectId,
  pages,
  adapters,
  presets = DEFAULT_REVIEW_VIEWPORT_PRESETS,
  reviewPathPrefix = DEFAULT_REVIEW_PATH_PREFIX,
}: ReviewShellProps): ReviewShellConfig => {
  const viewportPresets =
    presets.length > 0 ? presets : DEFAULT_REVIEW_VIEWPORT_PRESETS;
  const normalizedAdapters = normalizeReviewShellAdapters(adapters);

  return {
    projectId,
    pages,
    reviewPathPrefix,
    viewportPresets,
    reviewViewportPresets: toReviewViewportPresets(viewportPresets),
    localAdapterEntry: normalizedAdapters.local,
    remoteAdapterEntry: normalizedAdapters.remote,
    sourceEntries: normalizedAdapters.sources,
    showSourceSelect: normalizedAdapters.sources.length > 1,
  };
};

const ReviewShellConfigContext = createContext<ReviewShellConfig | null>(null);

export const ReviewShellConfigProvider = ReviewShellConfigContext.Provider;

export const useReviewShellConfig = (): ReviewShellConfig => {
  const config = useContext(ReviewShellConfigContext);
  if (!config) {
    throw new Error(
      'useReviewShellConfig must be used within a ReviewShell provider'
    );
  }
  return config;
};

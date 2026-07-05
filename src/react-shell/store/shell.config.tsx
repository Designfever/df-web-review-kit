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
import { DEFAULT_INITIAL_REVIEW_PROMPT } from '../constants';
import { resolveReviewSourceOptions } from '../env';
import { DEFAULT_REVIEW_PATH_PREFIX } from '../route';
import type { GetSectionOutlineOptions } from '../section.outline';
import type {
  GetSourceCandidatesOptions,
  SourceOpenOptions,
} from '../source.open';
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
  initialPrompt: string;
  projectId: string;
  pages: ReviewShellPage[];
  reviewPathPrefix: string;
  viewportPresets: ReviewShellViewportPreset[];
  reviewViewportPresets: ReviewViewportPreset[];
  localAdapterEntry: NormalizedReviewShellAdapter | null;
  remoteAdapterEntry: NormalizedReviewShellAdapter | null;
  sectionOutlineOptions: GetSectionOutlineOptions;
  sourceEntries: NormalizedReviewShellAdapter[];
  sourceCandidateOptions: GetSourceCandidatesOptions;
  sourceOpenOptions: SourceOpenOptions;
  showSourceSelect: boolean;
  isSourceInspectorEnabled: boolean;
  isSourceTreeHoverOutlineEnabled: boolean;
}

export const createReviewShellConfig = ({
  projectId,
  pages,
  adapters,
  initialPrompt = DEFAULT_INITIAL_REVIEW_PROMPT,
  presets = DEFAULT_REVIEW_VIEWPORT_PRESETS,
  reviewPathPrefix = DEFAULT_REVIEW_PATH_PREFIX,
  sourceInspector,
  sourceRoot,
}: ReviewShellProps): ReviewShellConfig => {
  const viewportPresets =
    presets.length > 0 ? presets : DEFAULT_REVIEW_VIEWPORT_PRESETS;
  const normalizedAdapters = normalizeReviewShellAdapters(adapters);
  const resolvedReviewSourceOptions = resolveReviewSourceOptions({
    sourceInspector,
    sourceRoot,
  });
  const resolvedSourceInspector =
    resolvedReviewSourceOptions.sourceInspector;
  const resolvedSourceRoot = resolvedReviewSourceOptions.sourceRoot;

  return {
    initialPrompt,
    projectId,
    pages,
    reviewPathPrefix,
    viewportPresets,
    reviewViewportPresets: toReviewViewportPresets(viewportPresets),
    localAdapterEntry: normalizedAdapters.local,
    remoteAdapterEntry: normalizedAdapters.remote,
    sectionOutlineOptions: {
      includePlacer: resolvedSourceInspector?.includePlacer,
      ignore: resolvedSourceInspector?.ignore,
      maxDepth: resolvedSourceInspector?.maxDepth,
    },
    sourceEntries: normalizedAdapters.sources,
    sourceCandidateOptions: {
      ignore: resolvedSourceInspector?.ignore,
      includePlacer: resolvedSourceInspector?.includePlacer,
    },
    sourceOpenOptions: {
      ...resolvedSourceInspector,
      sourceRoot: resolvedSourceRoot,
    },
    showSourceSelect: normalizedAdapters.sources.length > 1,
    isSourceInspectorEnabled: resolvedSourceInspector?.enabled !== false,
    isSourceTreeHoverOutlineEnabled:
      resolvedSourceInspector?.hoverOutline !== false,
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

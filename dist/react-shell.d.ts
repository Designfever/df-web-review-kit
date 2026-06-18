import React from 'react';
import { ReviewItemScope, ReviewRulerConfig } from './index.js';

type ReviewShellViewportKind = Exclude<ReviewItemScope, 'dom'>;
type ReviewShellViewportPreset = {
    label: string;
    width: number;
    height: number;
    kind?: ReviewShellViewportKind;
};
type ReviewShellPage = {
    href: string;
};
type ReviewShellGlobEntries = Record<string, unknown>;
interface CreateReviewPagesOptions {
    root?: string;
    exclude?: (href: string) => boolean;
}
interface ReviewShellProps {
    projectId: string;
    pages: ReviewShellPage[];
    storageKey?: string;
    presets?: ReviewShellViewportPreset[];
    ruler?: ReviewRulerConfig;
    initialPrompt?: string;
    reviewPathPrefix?: string;
}
interface ReviewShellMountOptions extends ReviewShellProps {
    rootId?: string;
}
declare const DEFAULT_REVIEW_VIEWPORT_PRESETS: ReviewShellViewportPreset[];
declare const createReviewPagesFromGlob: (entries: ReviewShellGlobEntries, options?: CreateReviewPagesOptions) => ReviewShellPage[];
declare const ReviewShell: ({ projectId, pages, storageKey, presets, ruler, initialPrompt, reviewPathPrefix }: ReviewShellProps) => React.JSX.Element;
declare const mountReviewShell: (options: ReviewShellMountOptions) => void;

export { type CreateReviewPagesOptions, DEFAULT_REVIEW_VIEWPORT_PRESETS, ReviewShell, type ReviewShellGlobEntries, type ReviewShellMountOptions, type ReviewShellPage, type ReviewShellProps, type ReviewShellViewportKind, type ReviewShellViewportPreset, createReviewPagesFromGlob, mountReviewShell };

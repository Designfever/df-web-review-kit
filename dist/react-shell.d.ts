import { f as ReviewItemScope, r as ReviewSource, n as ReviewMode, W as WebReviewKitAdapter, a as ReviewItemStatus, e as ReviewItem, p as ReviewRulerConfig } from './types-7IhUVTjO.js';
import React from 'react';

type ReviewShellViewportKind = Exclude<ReviewItemScope, 'dom'>;
type ReviewShellViewportPreset = {
    label: string;
    width: number;
    height: number;
    kind?: ReviewShellViewportKind;
    designWidth?: number;
    designHeight?: number;
};
type ReviewShellPage = {
    href: string;
};
type ReviewShellGlobEntries = Record<string, unknown>;
type ReviewSourceEditor = 'vscode' | 'cursor' | 'webstorm' | 'custom';
type ReviewSourceInspectorOptions = {
    enabled?: boolean;
    editor?: ReviewSourceEditor;
    urlTemplate?: string;
};
type ReviewShellStatusOption = {
    value: ReviewItemStatus;
    label: string;
};
type ReviewShellWriteMode = 'dom' | 'note' | 'area';
type ReviewShellUpdateStatusInput = {
    id: string;
    item: ReviewItem;
    status: ReviewItemStatus;
    statusOption: ReviewShellStatusOption;
    statusIndex: number;
};
type ReviewShellSubmissionPatch = Partial<Pick<ReviewItem, 'externalIssueId' | 'externalIssueUrl' | 'submittedAt' | 'submitStatus' | 'submitError'>>;
type ReviewShellSyncSubmissionInput = {
    id: string;
    item: ReviewItem;
    patch: ReviewShellSubmissionPatch;
};
type ReviewShellAdapter = {
    label: ReviewSource;
    pageId?: string;
    get: WebReviewKitAdapter['get'];
    list: WebReviewKitAdapter['list'];
    create?: WebReviewKitAdapter['create'];
    update?: WebReviewKitAdapter['update'];
    statusOptions?: readonly ReviewShellStatusOption[];
    canWrite?: boolean | readonly ReviewShellWriteMode[];
    updateStatus?: (input: ReviewShellUpdateStatusInput) => Promise<ReviewItem>;
    syncSubmission?: (input: ReviewShellSyncSubmissionInput) => Promise<ReviewItem>;
    remove?: WebReviewKitAdapter['remove'];
};
type ReviewShellAdapterMap = {
    local: WebReviewKitAdapter;
    remote?: WebReviewKitAdapter | null;
    remotePageId?: string;
};
type ReviewShellAdapters = ReviewShellAdapterMap | ReviewShellAdapter[];
type ReviewPresenceStatus = 'idle' | 'reviewing' | 'editing';
type ReviewPresenceViewport = {
    label: string;
    width: number;
    height: number;
    kind: ReviewShellViewportKind;
};
type ReviewPresenceState = {
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
type ReviewPresenceUser = ReviewPresenceState;
type ReviewPresenceContext = {
    projectId: string;
    sessionId: string;
    userId: string;
    displayName: string;
    color: string;
    initialState: ReviewPresenceState;
};
type ReviewPresenceSession = {
    update: (state: Partial<ReviewPresenceState>) => void | Promise<void>;
    subscribe: (callback: (users: ReviewPresenceUser[]) => void) => () => void;
    disconnect: () => void | Promise<void>;
};
type ReviewPresenceAdapter = {
    label: string;
    connect: (context: ReviewPresenceContext) => Promise<ReviewPresenceSession> | ReviewPresenceSession;
};
interface CreateReviewPagesOptions {
    root?: string;
    exclude?: (href: string) => boolean;
}
interface ReviewShellProps {
    projectId: string;
    pages: ReviewShellPage[];
    adapters: ReviewShellAdapters;
    presets?: ReviewShellViewportPreset[];
    ruler?: ReviewRulerConfig;
    initialPrompt?: string;
    reviewPathPrefix?: string;
    sourceRoot?: string;
    sourceInspector?: ReviewSourceInspectorOptions;
    presence?: ReviewPresenceAdapter;
}
interface ReviewShellMountOptions extends ReviewShellProps {
    rootId?: string;
}

declare const ReviewShell: ({ projectId, pages, adapters, presets, ruler, initialPrompt, reviewPathPrefix, sourceRoot, sourceInspector, presence }: ReviewShellProps) => React.JSX.Element;

declare const createReviewPagesFromGlob: (entries: ReviewShellGlobEntries, options?: CreateReviewPagesOptions) => ReviewShellPage[];

declare const DEFAULT_REVIEW_VIEWPORT_PRESETS: ReviewShellViewportPreset[];

type LocalPresenceAdapterOptions = {
    channelName?: string;
    heartbeatMs?: number;
    staleMs?: number;
};
declare const createLocalPresenceAdapter: (options?: LocalPresenceAdapterOptions) => ReviewPresenceAdapter;
declare const createFallbackPresenceAdapter: (primaryAdapter: ReviewPresenceAdapter, fallbackAdapter: ReviewPresenceAdapter) => ReviewPresenceAdapter;

type SupabaseRealtimeStatus = 'SUBSCRIBED' | 'CHANNEL_ERROR' | 'TIMED_OUT' | 'CLOSED' | string;
type SupabaseRealtimeChannel = {
    topic?: string;
    on: (type: 'presence', filter: {
        event: 'sync' | 'join' | 'leave';
    }, callback: () => void) => SupabaseRealtimeChannel;
    subscribe: (callback: (status: SupabaseRealtimeStatus, error?: Error) => void) => SupabaseRealtimeChannel;
    track: (payload: ReviewPresenceUser) => Promise<unknown>;
    untrack: () => Promise<unknown>;
    presenceState: () => Record<string, unknown[]>;
    teardown?: () => void;
};
type SupabasePresenceClient = {
    channel: (topic: string, options?: {
        config?: {
            private?: boolean;
            presence?: {
                key?: string;
            };
        };
    }) => SupabaseRealtimeChannel;
    getChannels?: () => SupabaseRealtimeChannel[];
    removeChannel: (channel: SupabaseRealtimeChannel) => Promise<unknown>;
};
type SupabasePresenceAdapterOptions = {
    client: SupabasePresenceClient;
    channelPrefix?: string;
    private?: boolean;
};
declare const createSupabasePresenceAdapter: ({ client, channelPrefix, private: isPrivate, }: SupabasePresenceAdapterOptions) => ReviewPresenceAdapter;

declare const mountReviewShell: (options: ReviewShellMountOptions) => void;

export { type CreateReviewPagesOptions, DEFAULT_REVIEW_VIEWPORT_PRESETS, type LocalPresenceAdapterOptions, type ReviewPresenceAdapter, type ReviewPresenceContext, type ReviewPresenceSession, type ReviewPresenceState, type ReviewPresenceStatus, type ReviewPresenceUser, ReviewShell, type ReviewShellAdapter, type ReviewShellAdapters, type ReviewShellGlobEntries, type ReviewShellMountOptions, type ReviewShellPage, type ReviewShellProps, type ReviewShellStatusOption, type ReviewShellViewportKind, type ReviewShellViewportPreset, type ReviewSourceEditor, type ReviewSourceInspectorOptions, type SupabasePresenceAdapterOptions, type SupabasePresenceClient, createFallbackPresenceAdapter, createLocalPresenceAdapter, createReviewPagesFromGlob, createSupabasePresenceAdapter, mountReviewShell };

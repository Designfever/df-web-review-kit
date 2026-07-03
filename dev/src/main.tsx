import React from 'react';
import { createRoot } from 'react-dom/client';
import { createClient } from '@supabase/supabase-js';
import {
  REVIEW_WORKFLOW_STATUS_OPTIONS,
  createReviewFigmaImageStoreClient,
  localAdapter,
  supabaseAdapter,
  type ReviewItem,
  type SupabaseReviewClient,
} from '../../src';
import {
  createFallbackPresenceAdapter,
  createLocalPresenceAdapter,
  createSupabasePresenceAdapter,
  mountFigmaDevOverlay,
  mountReviewShell,
  type ReviewShellAdapter,
  type SupabasePresenceClient,
} from '../../src/react-shell';
import {
  REVIEW_PATH_PREFIX,
  pages,
  presets,
} from './fixtures/config';
import { TargetApp } from './fixtures/target-app';
import './style.css';

declare global {
  interface Window {
    __figma?: {
      desktopNodeId: string;
      mobileNodeId: string;
    };
  }
}

const REVIEW_PROJECT_ID =
  import.meta.env.VITE_REVIEW_PROJECT_ID || 'df-web-review-kit';
const REVIEW_STORAGE_KEY = `${REVIEW_PROJECT_ID}:items`;
const REVIEW_USER_ID = import.meta.env.VITE_REVIEW_USER_ID || '';
const REVIEW_SUPABASE_TABLE =
  import.meta.env.VITE_REVIEW_SUPABASE_TABLE || 'review_items';
const DEV_EXTERNAL_LINKS_ITEM_ID = 'dev-review-external-links-fixture';
const figmaImageStore = createReviewFigmaImageStoreClient();

window.__figma = {
  desktopNodeId: 'p2DY6W7xu5WmDNtJK8v6zd->4:228',
  mobileNodeId: 'p2DY6W7xu5WmDNtJK8v6zd->4:491',
};

const local = localAdapter({ storageKey: REVIEW_STORAGE_KEY });
const assigneeOptions = [
  { value: 'planning', label: 'Planning' },
  { value: 'frontend', label: 'Frontend' },
  { value: 'design', label: 'Design' },
];
const supabaseUrl = import.meta.env.VITE_REVIEW_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_REVIEW_SUPABASE_ANON_KEY;
const supabaseClient =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;
const remote = supabaseClient
  ? supabaseAdapter({
      client: supabaseClient as unknown as SupabaseReviewClient,
      table: REVIEW_SUPABASE_TABLE,
      projectId: REVIEW_PROJECT_ID,
      source: 'supabase',
      reviewPathPrefix: REVIEW_PATH_PREFIX,
    })
  : null;

const adapters: ReviewShellAdapter[] = [
  {
    label: 'local',
    defaultUserId: REVIEW_USER_ID,
    get: (id) => local.get(id),
    list: (query) => local.list(query),
    create: (item) => local.create(item),
    update: (id, patch) => local.update(id, patch),
    fields: { title: true },
    statusOptions: REVIEW_WORKFLOW_STATUS_OPTIONS,
    updateStatus: ({ id, status }) => local.update(id, { status }),
    assigneeTitle: 'Part',
    assigneeOptions,
    updateAssignee: ({ id, assigneeId, assigneeName }) =>
      local.update(id, { assigneeId, assigneeName }),
    syncSubmission: ({ id, patch }) => local.update(id, patch),
    uploadAttachment: createDevAttachmentUploader(),
    remove: (id) => local.remove(id),
  },
  ...(remote
    ? [
        {
          label: 'supabase',
          defaultUserId: REVIEW_USER_ID,
          get: (id) => remote.get(id),
          list: (query) => remote.list(query),
          create: (item) => remote.create(item),
          update: (id, patch) => remote.update(id, patch),
          canWrite: true,
          fields: { title: true },
          statusOptions: REVIEW_WORKFLOW_STATUS_OPTIONS,
          updateStatus: ({ id, status }) => remote.update(id, { status }),
          assigneeTitle: 'Part',
          assigneeOptions,
          updateAssignee: ({ id, assigneeId, assigneeName }) =>
            remote.update(id, { assigneeId, assigneeName }),
          remove: (id) => remote.remove(id),
        } satisfies ReviewShellAdapter,
      ]
    : []),
];

const localPresence = createLocalPresenceAdapter({
  channelName: `${REVIEW_PROJECT_ID}:presence`,
});
const presence = supabaseClient
  ? createFallbackPresenceAdapter(
      createSupabasePresenceAdapter({
        client: supabaseClient as unknown as SupabasePresenceClient,
        channelPrefix: 'review-presence',
        private: import.meta.env.VITE_REVIEW_SUPABASE_PRESENCE_PRIVATE === 'true',
      }),
      localPresence
    )
  : localPresence;

const initialPrompt = [
  'You are reviewing the df-web-review-kit local dev fixture.',
  'Use the selected item route, viewport, marker, anchor, and comment to verify review shell behavior before adding package features.',
].join('\n');

function mountDevReviewShell() {
  seedDevExternalLinksFixtureItem();

  mountReviewShell({
    projectId: REVIEW_PROJECT_ID,
    pages,
    adapters,
    presets,
    presence,
    figmaImages: {
      store: figmaImageStore,
      imageFormat: 'webp',
    },
    initialPrompt,
    reviewPathPrefix: REVIEW_PATH_PREFIX,
    ruler: { enabled: true, unit: 'px' },
  });
}

function seedDevExternalLinksFixtureItem() {
  const stored = readStoredReviewItems();
  if (stored.some((item) => item.id === DEV_EXTERNAL_LINKS_ITEM_ID)) return;

  window.localStorage.setItem(
    REVIEW_STORAGE_KEY,
    JSON.stringify([createDevExternalLinksFixtureItem(), ...stored])
  );
}

function readStoredReviewItems(): ReviewItem[] {
  const raw = window.localStorage.getItem(REVIEW_STORAGE_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function createDevExternalLinksFixtureItem(): ReviewItem {
  const now = new Date().toISOString();

  return {
    id: DEV_EXTERNAL_LINKS_ITEM_ID,
    projectId: REVIEW_PROJECT_ID,
    routeKey: '/',
    pageUrl: `${window.location.origin}/`,
    normalizedPath: '/',
    scope: 'mobile',
    kind: 'note',
    title: 'externalLinks adapter example',
    comment:
      'dev:review adapter fixture. 외부 연동 adapter가 externalLinks 배열을 내려주면 QA 본문 아래에 버튼 row로 렌더링된다.',
    createdBy: 'dev:review',
    status: 'todo',
    viewport: { width: 390, height: 844 },
    devicePixelRatio: window.devicePixelRatio || 1,
    scroll: { x: 0, y: 0 },
    marker: {
      viewport: { x: 96, y: 210 },
      relative: { x: 96 / 390, y: 210 / 844 },
    },
    externalLinks: [
      {
        label: 'df-sheet',
        url: 'https://example.com/df-sheet/reviews/870',
        title: 'Open df-sheet adapter example',
        icon: 'sheet',
      },
      {
        label: 'Jira',
        url: 'https://example.com/jira/DFWR-870',
        title: 'Open Jira adapter example',
        icon: 'jira',
      },
      {
        label: 'GitHub',
        url: 'https://github.com/Designfever/df-web-review-kit',
        title: 'Open df-web-review-kit repository',
        icon: 'github',
      },
    ],
    createdAt: now,
    updatedAt: now,
  };
}

function createDevAttachmentUploader(): NonNullable<
  ReviewShellAdapter['uploadAttachment']
> {
  return async ({ file, name, mime, kind, metadata }) => {
    const url = URL.createObjectURL(file);
    const resolvedMime = mime || file.type || 'application/octet-stream';

    return {
      id: createDevAttachmentId(),
      url,
      name: name || (file instanceof File ? file.name : 'attachment'),
      mime: resolvedMime,
      size: file.size,
      kind: kind || (resolvedMime.startsWith('image/') ? 'image' : 'file'),
      metadata: {
        ...metadata,
        storage: 'dev-object-url',
      },
      createdAt: new Date().toISOString(),
    };
  };
}

function createDevAttachmentId() {
  return `dev-attachment-${
    crypto.randomUUID?.() ?? Math.random().toString(36).slice(2)
  }`;
}

if (window.location.pathname.startsWith(REVIEW_PATH_PREFIX)) {
  mountDevReviewShell();
} else {
  createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
      <TargetApp reviewPathPrefix={REVIEW_PATH_PREFIX} />
    </React.StrictMode>
  );
  if (!new URLSearchParams(window.location.search).has('__dfwr_target')) {
    mountFigmaDevOverlay({
      projectId: REVIEW_PROJECT_ID,
      presets,
      reviewPathPrefix: REVIEW_PATH_PREFIX,
      figmaImages: {
        store: figmaImageStore,
        imageFormat: 'webp',
      },
    });
  }
}

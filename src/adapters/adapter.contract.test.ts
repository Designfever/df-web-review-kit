import { beforeEach, describe, expect, it, vi } from 'vitest';
import { localAdapter } from './local';
import { supabaseAdapter } from './supabase';
import type {
  ReviewItem,
  ReviewItemKind,
  ReviewItemStatus,
  SupabaseReviewClient,
  WebReviewKitAdapter,
} from '../types';

const PROJECT_ID = 'df-web-review-kit-test';
const STORAGE_KEY = `${PROJECT_ID}:items`;
const SOURCE = 'supabase';
const NOW = '2026-07-04T09:00:00.000Z';
const UPDATED_AT = '2026-07-04T09:10:00.000Z';

type AdapterHarness = {
  name: string;
  setup: () => WebReviewKitAdapter;
};

type SupabaseTestRow = {
  id: string;
  project_id: string;
  route_key: string;
  source: string;
  review_number?: number | null;
  status: string;
  item: unknown;
  created_at: string;
  updated_at: string;
};

type SupabaseFilter = {
  column: keyof SupabaseTestRow;
  value: unknown;
};

function createMemoryStorage(): Storage {
  const store = new Map<string, string>();

  return {
    get length() {
      return store.size;
    },
    clear() {
      store.clear();
    },
    getItem(key) {
      return store.get(key) ?? null;
    },
    key(index) {
      return Array.from(store.keys())[index] ?? null;
    },
    removeItem(key) {
      store.delete(key);
    },
    setItem(key, value) {
      store.set(key, value);
    },
  };
}

const createReviewItem = (
  overrides: Partial<ReviewItem> = {}
): ReviewItem => {
  const kind = overrides.kind ?? 'dom';
  const routeKey = overrides.routeKey ?? '/';

  return {
    id: overrides.id ?? `review-${kind}`,
    projectId: PROJECT_ID,
    routeKey,
    pageUrl: `http://localhost${routeKey}`,
    normalizedPath: routeKey,
    scope: kind === 'dom' ? 'dom' : 'mobile',
    kind,
    title: 'QA title',
    comment: 'QA comment',
    assigneeId: 'frontend',
    assigneeName: 'Frontend',
    createdBy: 'vitest',
    status: 'todo',
    viewport: { width: 390, height: 844 },
    devicePixelRatio: 1,
    scroll: { x: 0, y: 12 },
    marker: {
      viewport: { x: 96, y: 210 },
      relative: { x: 0.25, y: 0.25 },
    },
    selection:
      kind === 'dom'
        ? {
            viewport: { x: 80, y: 190, width: 120, height: 48 },
            relative: { x: 0.1, y: 0.2, width: 0.4, height: 0.2 },
          }
        : {
            viewport: { x: 40, y: 140, width: 180, height: 80 },
          },
    attachments: [
      {
        id: 'attachment-1',
        url: 'http://localhost/capture.webp',
        name: 'capture.webp',
        mime: 'image/webp',
        size: 1234,
        kind: 'capture',
      },
    ],
    externalLinks: [
      {
        label: 'GitHub',
        url: 'https://github.com/Designfever/df-web-review-kit',
        icon: 'github',
      },
    ],
    createdAt: NOW,
    updatedAt: NOW,
    ...overrides,
  };
};

const createSupabaseRow = (
  item: ReviewItem | (Omit<ReviewItem, 'kind'> & { kind?: string }),
  overrides: Partial<SupabaseTestRow> = {}
): SupabaseTestRow => ({
  id: item.id,
  project_id: item.projectId,
  route_key: item.routeKey,
  source: SOURCE,
  review_number: item.reviewNumber ?? null,
  status: item.status,
  item,
  created_at: item.createdAt,
  updated_at: item.updatedAt,
  ...overrides,
});

class SupabaseQuery {
  private filters: SupabaseFilter[] = [];
  private operation: 'select' | 'update' | 'delete' = 'select';
  private updatePatch?: Partial<SupabaseTestRow>;

  constructor(private rows: SupabaseTestRow[]) {}

  select() {
    return this;
  }

  eq(column: keyof SupabaseTestRow, value: unknown) {
    this.filters.push({ column, value });
    return this;
  }

  order(column: keyof SupabaseTestRow, options?: { ascending?: boolean }) {
    const direction = options?.ascending === true ? 1 : -1;
    const rows = [...this.matchRows()].sort((a, b) =>
      String(a[column]).localeCompare(String(b[column])) * direction
    );

    return { data: rows, error: null };
  }

  maybeSingle() {
    return { data: this.matchRows()[0] ?? null, error: null };
  }

  single() {
    if (this.operation === 'update') {
      return this.updateSingle();
    }

    const row = this.matchRows()[0];
    return row
      ? { data: row, error: null }
      : { data: null, error: { message: 'No rows found' } };
  }

  update(patch: Partial<SupabaseTestRow>) {
    this.operation = 'update';
    this.updatePatch = patch;
    return this;
  }

  delete() {
    this.operation = 'delete';
    return this;
  }

  get data() {
    if (this.operation === 'delete') {
      this.deleteRows();
      return null;
    }

    return this.matchRows();
  }

  get error() {
    return null;
  }

  private updateSingle() {
    const row = this.matchRows()[0];
    if (!row) return { data: null, error: { message: 'No rows found' } };

    Object.assign(row, this.updatePatch);
    return { data: row, error: null };
  }

  private deleteRows() {
    const ids = new Set(this.matchRows().map((row) => row.id));
    for (let index = this.rows.length - 1; index >= 0; index -= 1) {
      if (ids.has(this.rows[index].id)) {
        this.rows.splice(index, 1);
      }
    }
  }

  private matchRows() {
    return this.rows.filter((row) =>
      this.filters.every((filter) => row[filter.column] === filter.value)
    );
  }
}

function createSupabaseTestClient(
  rows: SupabaseTestRow[] = []
): SupabaseReviewClient {
  return {
    from() {
      return new SupabaseQuery(rows);
    },
    rpc(fn, args = {}) {
      if (fn !== 'create_review_item') {
        return { data: null, error: { message: `Unknown RPC: ${fn}` } };
      }

      const item = args.p_item as ReviewItem;
      const row = createSupabaseRow(item, {
        id: String(args.p_id),
        project_id: String(args.p_project_id),
        route_key: String(args.p_route_key),
        source: String(args.p_source),
        status: String(args.p_status),
        review_number: rows.length + 1,
      });
      rows.unshift(row);

      return { data: row, error: null };
    },
  };
}

function runAdapterContractSuite({ name, setup }: AdapterHarness) {
  describe(`${name} adapter contract`, () => {
    let adapter: WebReviewKitAdapter;

    beforeEach(() => {
      vi.setSystemTime(new Date(UPDATED_AT));
      adapter = setup();
    });

    it('creates, lists, gets, updates, and removes review items', async () => {
      const created = await adapter.create(createReviewItem({ id: `${name}-dom` }));

      expect(created.kind).toBe('dom');
      expect(created.projectId).toBe(PROJECT_ID);
      expect(created.attachments?.[0]?.kind).toBe('capture');
      expect(created.externalLinks?.[0]?.icon).toBe('github');

      const listedByRoute = await adapter.list({
        projectId: PROJECT_ID,
        routeKey: '/',
      });
      expect(listedByRoute.map((item) => item.id)).toContain(created.id);

      const listedByOtherRoute = await adapter.list({
        projectId: PROJECT_ID,
        routeKey: '/other',
      });
      expect(listedByOtherRoute.map((item) => item.id)).not.toContain(created.id);

      const found = await adapter.get(created.id);
      expect(found?.id).toBe(created.id);
      expect(found?.kind).toBe('dom');

      const updated = await adapter.update(created.id, {
        status: 'review',
        comment: 'Updated comment',
        assigneeId: 'design',
        assigneeName: 'Design',
      });
      expect(updated.id).toBe(created.id);
      expect(updated.createdAt).toBe(created.createdAt);
      expect(updated.updatedAt).toBe(UPDATED_AT);
      expect(updated.status).toBe('review');
      expect(updated.comment).toBe('Updated comment');
      expect(updated.assigneeName).toBe('Design');

      const listedByStatus = await adapter.list({
        projectId: PROJECT_ID,
        status: 'review',
      });
      expect(listedByStatus.map((item) => item.id)).toContain(created.id);

      await adapter.remove(created.id);
      expect(await adapter.get(created.id)).toBeNull();
    });

    it('keeps DOM and area kinds as the only writable review item kinds', async () => {
      const domItem = await adapter.create(
        createReviewItem({ id: `${name}-dom-kind`, kind: 'dom', routeKey: '/' })
      );
      const areaItem = await adapter.create(
        createReviewItem({
          id: `${name}-area-kind`,
          kind: 'area',
          routeKey: '/',
          scope: 'mobile',
        })
      );

      const items = await adapter.list({ projectId: PROJECT_ID, routeKey: '/' });
      const kinds = new Map(items.map((item) => [item.id, item.kind]));

      expect(kinds.get(domItem.id)).toBe('dom');
      expect(kinds.get(areaItem.id)).toBe('area');
      expect([...kinds.values()]).not.toContain('note' as ReviewItemKind);
    });
  });
}

beforeEach(() => {
  Object.defineProperty(window, 'localStorage', {
    value: createMemoryStorage(),
    configurable: true,
  });
  vi.useFakeTimers();
  vi.setSystemTime(new Date(NOW));
});

runAdapterContractSuite({
  name: 'local',
  setup: () => localAdapter({ storageKey: STORAGE_KEY }),
});

runAdapterContractSuite({
  name: 'supabase',
  setup: () =>
    supabaseAdapter({
      client: createSupabaseTestClient(),
      projectId: PROJECT_ID,
      source: SOURCE,
    }),
});

describe('legacy note removal', () => {
  it('filters local legacy note rows and keeps legacy capture rows as area', async () => {
    const legacyNote = {
      ...createReviewItem({ id: 'legacy-note' }),
      kind: 'note',
    };
    const legacyCapture = {
      ...createReviewItem({
        id: 'legacy-capture',
        kind: 'area',
        scope: 'mobile',
      }),
      kind: 'capture',
      screenshot: 'legacy-screenshot.png',
      reviewNumber: 'old-number',
    };

    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([legacyNote, legacyCapture])
    );

    const items = await localAdapter({ storageKey: STORAGE_KEY }).list({
      projectId: PROJECT_ID,
    });

    expect(items).toHaveLength(1);
    expect(items[0].id).toBe('legacy-capture');
    expect(items[0].kind).toBe('area');

    const stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '[]');
    expect(stored).toHaveLength(1);
    expect(stored[0].kind).toBe('area');
    expect(stored[0].screenshot).toBeUndefined();
    expect(stored[0].reviewNumber).toBeUndefined();
  });

  it('filters supabase legacy note rows', async () => {
    const rows = [
      createSupabaseRow({
        ...createReviewItem({ id: 'legacy-note' }),
        kind: 'note',
      }),
      createSupabaseRow(createReviewItem({ id: 'current-dom', kind: 'dom' })),
      createSupabaseRow(
        createReviewItem({
          id: 'current-area',
          kind: 'area',
          scope: 'mobile',
          status: 'doing',
        })
      ),
    ];
    const adapter = supabaseAdapter({
      client: createSupabaseTestClient(rows),
      projectId: PROJECT_ID,
      source: SOURCE,
    });

    const items = await adapter.list({ projectId: PROJECT_ID });
    expect(items.map((item) => item.id)).toEqual([
      'current-dom',
      'current-area',
    ]);
    expect(items.map((item) => item.kind)).toEqual(['dom', 'area']);
    expect(await adapter.get('legacy-note')).toBeNull();
  });
});

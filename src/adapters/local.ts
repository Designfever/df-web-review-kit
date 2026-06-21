import { getItemRouteKey } from '../route';
import { matchesReviewItemStatus } from '../status';
import type {
  LocalAdapterOptions,
  ReviewItem,
  WebReviewKitAdapter,
} from '../types';

const DEFAULT_STORAGE_KEY = 'df-web-review-kit:items';

export function localAdapter(
  options: LocalAdapterOptions = {}
): WebReviewKitAdapter {
  const storageKey = options.storageKey ?? DEFAULT_STORAGE_KEY;

  const write = (items: ReviewItem[]) => {
    window.localStorage.setItem(storageKey, JSON.stringify(items));
  };

  const read = (): ReviewItem[] => {
    if (typeof window === 'undefined') return [];

    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return [];

    try {
      const value = JSON.parse(raw);
      if (!Array.isArray(value)) return [];

      let changed = false;
      const items = value.flatMap((item) => {
        const normalized = normalizeStoredReviewItem(item);
        if (!normalized || normalized !== item) changed = true;
        return normalized ? [normalized] : [];
      });

      if (changed) write(items);
      return items;
    } catch {
      return [];
    }
  };

  return {
    async get(id) {
      return read().find((item) => item.id === id) ?? null;
    },

    async list(query) {
      return read().filter((item) => {
        if (item.projectId !== query.projectId) return false;
        const queryRouteKey = query.routeKey ?? query.normalizedPath;
        if (
          queryRouteKey &&
          getItemRouteKey(item) !== queryRouteKey
        ) {
          return false;
        }
        if (query.status && !matchesReviewItemStatus(item.status, query.status)) {
          return false;
        }
        return true;
      });
    },

    async create(item) {
      const items = read();
      items.unshift(item);
      write(items);
      return item;
    },

    async update(id, patch) {
      const items = read();
      const index = items.findIndex((item) => item.id === id);

      if (index < 0) {
        throw new Error(`Review item not found: ${id}`);
      }

      const next: ReviewItem = {
        ...items[index],
        ...patch,
        id,
        createdAt: items[index].createdAt,
        updatedAt: new Date().toISOString(),
      };

      items[index] = next;
      write(items);
      return next;
    },

    async remove(id) {
      write(read().filter((item) => item.id !== id));
    },
  };
}

function normalizeStoredReviewItem(value: unknown): ReviewItem | undefined {
  if (!value || typeof value !== 'object') return undefined;

  const raw = value as Omit<ReviewItem, 'kind'> & {
    kind?: string;
    reviewNumber?: unknown;
    screenshot?: unknown;
  };
  const kind =
    raw.kind === 'text' ? 'note' :
    raw.kind === 'capture' ? 'area' :
    raw.kind;

  if (kind !== 'note' && kind !== 'area') return undefined;

  const { screenshot: _screenshot, reviewNumber: _reviewNumber, ...item } = raw;

  if (
    kind === raw.kind &&
    _screenshot === undefined &&
    _reviewNumber === undefined
  ) {
    return raw as ReviewItem;
  }

  return {
    ...item,
    kind,
  } as ReviewItem;
}

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
      const numberedItems = ensureStoredReviewNumbers(items);
      if (numberedItems !== items) changed = true;

      if (changed) write(numberedItems);
      return numberedItems;
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
    screenshot?: unknown;
  };
  const kind =
    raw.kind === 'text' ? 'note' :
    raw.kind === 'capture' ? 'area' :
    raw.kind;

  if (kind !== 'note' && kind !== 'area') return undefined;

  const { screenshot: _screenshot, ...item } = raw;

  if (kind === raw.kind && _screenshot === undefined) {
    return raw as ReviewItem;
  }

  return {
    ...item,
    kind,
  } as ReviewItem;
}

function ensureStoredReviewNumbers(items: ReviewItem[]) {
  const usedNumbers = new Set<number>();
  let maxNumber = 0;
  let changed = false;

  items.forEach((item) => {
    const number = normalizeReviewNumber(item.reviewNumber);
    if (!number) {
      changed = true;
      return;
    }

    if (usedNumbers.has(number)) {
      changed = true;
      return;
    }

    usedNumbers.add(number);
    maxNumber = Math.max(maxNumber, number);
  });

  if (!changed) return items;

  let nextNumber = maxNumber + 1;
  const assignedNumbers = new Set<number>();
  const numberById = new Map<string, number>();

  [...items]
    .sort((a, b) => {
      const createdOrder = a.createdAt.localeCompare(b.createdAt);
      if (createdOrder !== 0) return createdOrder;
      return a.id.localeCompare(b.id);
    })
    .forEach((item) => {
      const storedNumber = normalizeReviewNumber(item.reviewNumber);
      const reviewNumber =
        storedNumber && !assignedNumbers.has(storedNumber)
          ? storedNumber
          : nextNumber++;

      assignedNumbers.add(reviewNumber);
      numberById.set(item.id, reviewNumber);
    });

  return items.map((item) => {
    const reviewNumber = numberById.get(item.id);
    return item.reviewNumber === reviewNumber ? item : { ...item, reviewNumber };
  });
}

function normalizeReviewNumber(value: unknown) {
  if (typeof value !== 'number') return undefined;
  if (!Number.isInteger(value) || value < 1) return undefined;
  return value;
}

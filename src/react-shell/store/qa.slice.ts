import type { SetStateAction } from 'react';
import type { StateCreator } from 'zustand';
import type { ReviewItem } from '../../types';
import { getInitialItemId } from '../route';
import { getStoredReviewQaStatusFilters } from '../settings';
import type {
  ReviewQaFilter,
  ReviewQaStatusFilter,
} from '../types';
import type { ReviewShellState } from './create.review.shell.store';

export type SitemapItemsBySource = {
  local: ReviewItem[];
  remote: ReviewItem[];
};

export interface QaSlice {
  copiedPromptKey: string | null;
  editingItem: ReviewItem | null;
  hiddenOverlayItemIds: ReadonlySet<string>;
  isAllQaVisible: boolean;
  isItemsLoading: boolean;
  items: ReviewItem[];
  mutatingItemIds: ReadonlySet<string>;
  qaFilter: ReviewQaFilter;
  qaStatusFilters: readonly ReviewQaStatusFilter[];
  selectedItemId: string | null;
  sitemapItems: SitemapItemsBySource;
  addMutatingItemId: (itemId: string) => void;
  removeMutatingItemId: (itemId: string) => void;
  setCopiedPromptKey: (value: SetStateAction<string | null>) => void;
  setEditingItem: (item: ReviewItem | null) => void;
  setIsAllQaVisible: (isVisible: boolean) => void;
  setIsItemsLoading: (isLoading: boolean) => void;
  setItems: (items: ReviewItem[]) => void;
  setQaFilter: (filter: ReviewQaFilter) => void;
  setQaStatusFilters: (filters: readonly ReviewQaStatusFilter[]) => void;
  setSelectedItemId: (itemId: string | null) => void;
  setSitemapItems: (sitemapItems: SitemapItemsBySource) => void;
  toggleHiddenOverlayItemId: (itemId: string) => void;
}

export const createQaSlice: StateCreator<
  ReviewShellState,
  [],
  [],
  QaSlice
> = (set) => ({
  copiedPromptKey: null,
  editingItem: null,
  hiddenOverlayItemIds: new Set<string>(),
  isAllQaVisible: false,
  isItemsLoading: false,
  items: [],
  mutatingItemIds: new Set<string>(),
  qaFilter: 'all',
  qaStatusFilters: getStoredReviewQaStatusFilters(),
  selectedItemId: getInitialItemId(),
  sitemapItems: {
    local: [],
    remote: [],
  },
  addMutatingItemId: (itemId) =>
    set((state) => {
      const mutatingItemIds = new Set(state.mutatingItemIds);
      mutatingItemIds.add(itemId);
      return { mutatingItemIds };
    }),
  removeMutatingItemId: (itemId) =>
    set((state) => {
      const mutatingItemIds = new Set(state.mutatingItemIds);
      mutatingItemIds.delete(itemId);
      return { mutatingItemIds };
    }),
  setCopiedPromptKey: (value) =>
    set((state) => ({
      copiedPromptKey:
        typeof value === 'function' ? value(state.copiedPromptKey) : value,
    })),
  setEditingItem: (editingItem) => set({ editingItem }),
  setIsAllQaVisible: (isAllQaVisible) => set({ isAllQaVisible }),
  setIsItemsLoading: (isItemsLoading) => set({ isItemsLoading }),
  setItems: (items) => set({ items }),
  setQaFilter: (qaFilter) => set({ qaFilter }),
  setQaStatusFilters: (qaStatusFilters) => set({ qaStatusFilters }),
  setSelectedItemId: (selectedItemId) => set({ selectedItemId }),
  setSitemapItems: (sitemapItems) => set({ sitemapItems }),
  toggleHiddenOverlayItemId: (itemId) =>
    set((state) => {
      const hiddenOverlayItemIds = new Set(state.hiddenOverlayItemIds);
      if (hiddenOverlayItemIds.has(itemId)) {
        hiddenOverlayItemIds.delete(itemId);
      } else {
        hiddenOverlayItemIds.add(itemId);
      }
      return { hiddenOverlayItemIds };
    }),
});

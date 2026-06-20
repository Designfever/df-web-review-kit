import { REVIEW_WORKFLOW_STATUS_OPTIONS } from '../status';
import type {
  ReviewSource,
  WebReviewKitAdapter,
} from '../types';
import type {
  ReviewShellAdapter,
  ReviewShellAdapterMap,
  ReviewShellAdapters,
  ReviewShellStatusOption,
  ReviewShellSyncSubmissionInput,
  ReviewShellUpdateStatusInput,
} from './types';

export type NormalizedReviewShellAdapter = {
  label: ReviewSource;
  adapter: WebReviewKitAdapter;
  statusOptions: ReviewShellStatusOption[];
  updateStatus?: (input: ReviewShellUpdateStatusInput) => Promise<unknown>;
  syncSubmission?: (input: ReviewShellSyncSubmissionInput) => Promise<unknown>;
  canRemove: boolean;
  pageId?: string;
};

export type NormalizedReviewShellAdapters = {
  local: NormalizedReviewShellAdapter;
  remote: NormalizedReviewShellAdapter | null;
};

export function normalizeReviewShellAdapters(
  adapters: ReviewShellAdapters
): NormalizedReviewShellAdapters {
  if (Array.isArray(adapters)) {
    const local = adapters.find((adapter) => adapter.label === 'local');
    const remote =
      adapters.find((adapter) => adapter.label !== 'local') ?? null;

    if (!local) {
      throw new Error('ReviewShell requires a local adapter.');
    }

    return {
      local: normalizeShellAdapter(local),
      remote: remote ? normalizeShellAdapter(remote) : null,
    };
  }

  return normalizeLegacyAdapterMap(adapters);
}

function normalizeLegacyAdapterMap(
  adapters: ReviewShellAdapterMap
): NormalizedReviewShellAdapters {
  return {
    local: {
      label: 'local',
      adapter: adapters.local,
      statusOptions: [...REVIEW_WORKFLOW_STATUS_OPTIONS],
      updateStatus: ({ id, status }) => adapters.local.update(id, { status }),
      syncSubmission: ({ id, patch }) => adapters.local.update(id, patch),
      canRemove: true,
    },
    remote: adapters.remote
      ? {
          label: 'df-sheet',
          adapter: adapters.remote,
          statusOptions: [...REVIEW_WORKFLOW_STATUS_OPTIONS],
          canRemove: false,
          pageId: adapters.remotePageId,
        }
      : null,
  };
}

function normalizeShellAdapter(
  adapterConfig: ReviewShellAdapter
): NormalizedReviewShellAdapter {
  return {
    label: adapterConfig.label,
    pageId: adapterConfig.pageId,
    statusOptions: [...(adapterConfig.statusOptions ?? [])],
    updateStatus: adapterConfig.updateStatus,
    syncSubmission: adapterConfig.syncSubmission,
    canRemove: Boolean(adapterConfig.remove),
    adapter: {
      get: adapterConfig.get,
      list: adapterConfig.list,
      create: adapterConfig.create,
      update: async (id, patch) => {
        const nextStatus = patch.status;
        if (nextStatus && adapterConfig.updateStatus) {
          const statusIndex = (adapterConfig.statusOptions ?? []).findIndex(
            (statusOption) => statusOption.value === nextStatus
          );
          const statusOption = (adapterConfig.statusOptions ?? [])[statusIndex];

          if (statusOption) {
            const item = await adapterConfig.get(id);
            if (!item) throw new Error(`Review item not found: ${id}`);

            return adapterConfig.updateStatus({
              id,
              item,
              status: nextStatus,
              statusOption,
              statusIndex,
            });
          }
        }

        if (!adapterConfig.syncSubmission) {
          throw new Error(
            `Review adapter "${adapterConfig.label}" does not support update.`
          );
        }

        const item = await adapterConfig.get(id);
        if (!item) throw new Error(`Review item not found: ${id}`);

        return adapterConfig.syncSubmission({
          id,
          item,
          patch,
        });
      },
      remove: async (id) => {
        if (!adapterConfig.remove) {
          throw new Error(
            `Review adapter "${adapterConfig.label}" does not support remove.`
          );
        }

        return adapterConfig.remove(id);
      },
    },
  };
}

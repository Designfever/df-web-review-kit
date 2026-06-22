import { REVIEW_WORKFLOW_STATUS_OPTIONS } from '../status';
import type {
  ReviewItem,
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
  ReviewShellWriteMode,
} from './types';

const ALL_REVIEW_WRITE_MODES: ReviewShellWriteMode[] = ['dom', 'note', 'area'];

export type NormalizedReviewShellAdapter = {
  label: ReviewSource;
  adapter: WebReviewKitAdapter;
  statusOptions: ReviewShellStatusOption[];
  updateStatus?: (input: ReviewShellUpdateStatusInput) => Promise<unknown>;
  syncSubmission?: (input: ReviewShellSyncSubmissionInput) => Promise<unknown>;
  writeModes: ReviewShellWriteMode[];
  canUpdate: boolean;
  canRemove: boolean;
  pageId?: string;
};

export type NormalizedReviewShellAdapters = {
  local: NormalizedReviewShellAdapter | null;
  remote: NormalizedReviewShellAdapter | null;
  sources: NormalizedReviewShellAdapter[];
};

export function normalizeReviewShellAdapters(
  adapters: ReviewShellAdapters
): NormalizedReviewShellAdapters {
  if (Array.isArray(adapters)) {
    const normalized = adapters.map((adapter) => normalizeShellAdapter(adapter));
    const local = normalized.find((adapter) => adapter.label === 'local') ?? null;
    const remote =
      normalized.find((adapter) => adapter.label !== 'local') ?? null;

    if (normalized.length === 0 || (!local && !remote)) {
      throw new Error('ReviewShell requires at least one adapter.');
    }

    return {
      local,
      remote,
      sources: normalized,
    };
  }

  return normalizeLegacyAdapterMap(adapters);
}

function normalizeLegacyAdapterMap(
  adapters: ReviewShellAdapterMap
): NormalizedReviewShellAdapters {
  const local = {
    label: 'local',
    adapter: adapters.local,
    statusOptions: [...REVIEW_WORKFLOW_STATUS_OPTIONS],
    updateStatus: ({ id, status }) => adapters.local.update(id, { status }),
    syncSubmission: ({ id, patch }) => adapters.local.update(id, patch),
    writeModes: [...ALL_REVIEW_WRITE_MODES],
    canUpdate: true,
    canRemove: true,
  } satisfies NormalizedReviewShellAdapter;
  const remote = adapters.remote
    ? ({
        label: 'remote',
        adapter: adapters.remote,
        statusOptions: [...REVIEW_WORKFLOW_STATUS_OPTIONS],
        updateStatus: ({ id, status }) =>
          adapters.remote?.update(id, { status }) ??
          Promise.reject(new Error('Remote adapter is not available.')),
        writeModes: [],
        canUpdate: true,
        canRemove: false,
        pageId: adapters.remotePageId,
      } satisfies NormalizedReviewShellAdapter)
    : null;

  return {
    local,
    remote,
    sources: remote ? [local, remote] : [local],
  };
}

function normalizeShellAdapter(
  adapterConfig: ReviewShellAdapter
): NormalizedReviewShellAdapter {
  const statusOptions = [
    ...(adapterConfig.statusOptions ?? REVIEW_WORKFLOW_STATUS_OPTIONS),
  ];
  const updateAdapter = adapterConfig.update;
  const updateStatus: NormalizedReviewShellAdapter['updateStatus'] =
    adapterConfig.updateStatus
      ? adapterConfig.updateStatus
      : updateAdapter
        ? ({ id, status }) => updateAdapter(id, { status })
        : undefined;
  const writeModes = normalizeWriteModes(
    adapterConfig.create
      ? adapterConfig.canWrite ?? adapterConfig.label === 'local'
      : false
  );

  return {
    label: adapterConfig.label,
    pageId: adapterConfig.pageId,
    statusOptions,
    updateStatus,
    syncSubmission: adapterConfig.syncSubmission,
    writeModes,
    canUpdate: Boolean(updateAdapter),
    canRemove: Boolean(adapterConfig.remove),
    adapter: {
      get: adapterConfig.get,
      list: adapterConfig.list,
      create: async (item) => {
        if (!adapterConfig.create) {
          throw new Error(
            `Review adapter "${adapterConfig.label}" does not support create.`
          );
        }
        return adapterConfig.create(item);
      },
      update: async (id, patch) => {
        const nextStatus = patch.status;
        if (nextStatus && updateStatus) {
          const statusIndex = statusOptions.findIndex(
            (statusOption) => statusOption.value === nextStatus
          );
          const statusOption = statusOptions[statusIndex];

          if (statusOption) {
            const item = await adapterConfig.get(id);
            if (!item) throw new Error(`Review item not found: ${id}`);

            const updated = await updateStatus({
              id,
              item,
              status: nextStatus,
              statusOption,
              statusIndex,
            });
            return updated as ReviewItem;
          }
        }

        if (updateAdapter) {
          return updateAdapter(id, patch);
        }

        if (!adapterConfig.syncSubmission) {
          throw new Error(
            `Review adapter "${adapterConfig.label}" does not support update.`
          );
        }

        const item = await adapterConfig.get(id);
        if (!item) throw new Error(`Review item not found: ${id}`);

        await adapterConfig.syncSubmission({
          id,
          item,
          patch,
        });
        const updated = await adapterConfig.get(id);
        if (!updated) throw new Error(`Review item not found after update: ${id}`);
        return updated;
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

function normalizeWriteModes(
  value: boolean | readonly ReviewShellWriteMode[] | undefined
): ReviewShellWriteMode[] {
  if (value === true) return [...ALL_REVIEW_WRITE_MODES];
  if (Array.isArray(value)) {
    const modes = value.filter((mode) =>
      ALL_REVIEW_WRITE_MODES.includes(mode)
    );
    return Array.from(new Set(modes));
  }
  return [];
}

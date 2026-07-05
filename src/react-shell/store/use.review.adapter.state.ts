// source(store) + adapters(config) 조합 파생값. 셸과 feature container 가 공유한다.
import { useReviewShellConfig } from './shell.config';
import { useReviewShellStore } from './store.context';

export const useReviewShellAdapterState = () => {
  const {
    localAdapterEntry,
    remoteAdapterEntry,
    showSourceSelect,
    sourceEntries,
  } = useReviewShellConfig();
  const source = useReviewShellStore((state) => state.source);

  const remoteSource = remoteAdapterEntry?.label ?? null;
  const activeAdapterEntry =
    sourceEntries.find((entry) => entry.label === source) ?? sourceEntries[0]!;
  const isRemoteSource = Boolean(
    remoteSource && activeAdapterEntry.label === remoteSource
  );

  return {
    activeAdapterEntry,
    adapter: activeAdapterEntry.adapter,
    canWriteArea: activeAdapterEntry.writeModes.includes('area'),
    canWriteDom: activeAdapterEntry.writeModes.includes('dom'),
    isRemoteSource,
    localAdapterEntry,
    remoteAdapterEntry,
    showSourceSelect,
    source,
    sourceEntries,
  };
};

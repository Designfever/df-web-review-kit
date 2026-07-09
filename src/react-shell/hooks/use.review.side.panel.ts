import {
  useCallback,
  useEffect,
} from 'react';
import {
  writeStoredReviewSidePanel,
  writeStoredReviewSidePanelVisible,
  type StoredReviewSidePanel,
} from '../settings';
import {
  useReviewShellStore,
  useReviewShellStoreApi,
} from '../store/store.context';

interface UseReviewSidePanelOptions {
  isFigmaImageManagementEnabled: boolean;
  isSourceTreeEnabled: boolean;
}

const getAvailableSidePanel = (
  sidePanel: StoredReviewSidePanel,
  {
    isFigmaImageManagementEnabled,
    isSourceTreeEnabled,
  }: UseReviewSidePanelOptions
): StoredReviewSidePanel => {
  if (sidePanel === 'source' && !isSourceTreeEnabled) return 'qa';
  if (sidePanel === 'figma-images' && !isFigmaImageManagementEnabled) {
    return 'qa';
  }
  return sidePanel;
};

// slice 는 raw 상태만 갖는다. prop 의존 클램프/localStorage 저장은 이 훅이 담당.
export const useReviewSidePanel = ({
  isFigmaImageManagementEnabled,
  isSourceTreeEnabled,
}: UseReviewSidePanelOptions) => {
  const storeApi = useReviewShellStoreApi();
  const rawSidePanel = useReviewShellStore((state) => state.sidePanel);
  const isListVisible = useReviewShellStore((state) => state.isListVisible);
  const sidePanel = getAvailableSidePanel(rawSidePanel, {
    isFigmaImageManagementEnabled,
    isSourceTreeEnabled,
  });
  const isQaPanelVisible = isListVisible && sidePanel === 'qa';
  const isSourceTreePanelVisible =
    isSourceTreeEnabled && isListVisible && sidePanel === 'source';
  const isFigmaImagesPanelVisible =
    isFigmaImageManagementEnabled &&
    isListVisible &&
    sidePanel === 'figma-images';

  useEffect(() => {
    const state = storeApi.getState();
    const availableSidePanel = getAvailableSidePanel(state.sidePanel, {
      isFigmaImageManagementEnabled,
      isSourceTreeEnabled,
    });
    if (availableSidePanel !== state.sidePanel) {
      state.setSidePanel(availableSidePanel);
    }
  }, [isFigmaImageManagementEnabled, isSourceTreeEnabled, storeApi]);

  useEffect(() => {
    writeStoredReviewSidePanel(sidePanel);
  }, [sidePanel]);

  useEffect(() => {
    writeStoredReviewSidePanelVisible(isListVisible);
  }, [isListVisible]);

  const openSidePanel = useCallback(
    (nextSidePanel: StoredReviewSidePanel) => {
      const state = storeApi.getState();
      state.setSidePanel(
        getAvailableSidePanel(nextSidePanel, {
          isFigmaImageManagementEnabled,
          isSourceTreeEnabled,
        })
      );
      state.setIsListVisible(true);
    },
    [isFigmaImageManagementEnabled, isSourceTreeEnabled, storeApi]
  );

  const toggleSidePanel = useCallback(
    (nextSidePanel: StoredReviewSidePanel) => {
      const state = storeApi.getState();
      const currentSidePanel = getAvailableSidePanel(state.sidePanel, {
        isFigmaImageManagementEnabled,
        isSourceTreeEnabled,
      });
      const availableSidePanel = getAvailableSidePanel(nextSidePanel, {
        isFigmaImageManagementEnabled,
        isSourceTreeEnabled,
      });
      state.setSidePanel(availableSidePanel);
      state.setIsListVisible(
        currentSidePanel === availableSidePanel ? !state.isListVisible : true
      );
    },
    [isFigmaImageManagementEnabled, isSourceTreeEnabled, storeApi]
  );

  return {
    isFigmaImagesPanelVisible,
    isListVisible,
    isQaPanelVisible,
    isSourceTreePanelVisible,
    openSidePanel,
    sidePanel,
    toggleSidePanel,
  };
};

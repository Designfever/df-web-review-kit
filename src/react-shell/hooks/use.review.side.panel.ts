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
}

const getAvailableSidePanel = (
  sidePanel: StoredReviewSidePanel,
  {
    isFigmaImageManagementEnabled,
  }: UseReviewSidePanelOptions
): StoredReviewSidePanel => {
  if (sidePanel === 'figma-images' && !isFigmaImageManagementEnabled) {
    return 'qa';
  }
  return sidePanel;
};

// slice 는 raw 상태만 갖는다. prop 의존 클램프/localStorage 저장은 이 훅이 담당.
export const useReviewSidePanel = ({
  isFigmaImageManagementEnabled,
}: UseReviewSidePanelOptions) => {
  const storeApi = useReviewShellStoreApi();
  const rawSidePanel = useReviewShellStore((state) => state.sidePanel);
  const isListVisible = useReviewShellStore((state) => state.isListVisible);
  const sidePanel = getAvailableSidePanel(rawSidePanel, {
    isFigmaImageManagementEnabled,
  });
  const isQaPanelVisible = isListVisible && sidePanel === 'qa';
  const isSourceTreePanelVisible = isListVisible && sidePanel === 'source';
  const isFigmaImagesPanelVisible =
    isFigmaImageManagementEnabled &&
    isListVisible &&
    sidePanel === 'figma-images';

  useEffect(() => {
    const state = storeApi.getState();
    const availableSidePanel = getAvailableSidePanel(state.sidePanel, {
      isFigmaImageManagementEnabled,
    });
    if (availableSidePanel !== state.sidePanel) {
      state.setSidePanel(availableSidePanel);
    }
  }, [isFigmaImageManagementEnabled, storeApi]);

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
        })
      );
      state.setIsListVisible(true);
    },
    [isFigmaImageManagementEnabled, storeApi]
  );

  const toggleSidePanel = useCallback(
    (nextSidePanel: StoredReviewSidePanel) => {
      const state = storeApi.getState();
      const currentSidePanel = getAvailableSidePanel(state.sidePanel, {
        isFigmaImageManagementEnabled,
      });
      const availableSidePanel = getAvailableSidePanel(nextSidePanel, {
        isFigmaImageManagementEnabled,
      });
      state.setSidePanel(availableSidePanel);
      state.setIsListVisible(
        currentSidePanel === availableSidePanel ? !state.isListVisible : true
      );
    },
    [isFigmaImageManagementEnabled, storeApi]
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

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
  isSourceInspectorEnabled: boolean;
}

const getAvailableSidePanel = (
  sidePanel: StoredReviewSidePanel,
  {
    isFigmaImageManagementEnabled,
    isSourceInspectorEnabled,
  }: UseReviewSidePanelOptions
): StoredReviewSidePanel => {
  if (sidePanel === 'source' && !isSourceInspectorEnabled) return 'qa';
  if (sidePanel === 'figma-images' && !isFigmaImageManagementEnabled) {
    return 'qa';
  }
  return sidePanel;
};

// slice 는 raw 상태만 갖는다. prop 의존 클램프/localStorage 저장은 이 훅이 담당.
export const useReviewSidePanel = ({
  isFigmaImageManagementEnabled,
  isSourceInspectorEnabled,
}: UseReviewSidePanelOptions) => {
  const storeApi = useReviewShellStoreApi();
  const rawSidePanel = useReviewShellStore((state) => state.sidePanel);
  const isListVisible = useReviewShellStore((state) => state.isListVisible);
  const sidePanel = getAvailableSidePanel(rawSidePanel, {
    isFigmaImageManagementEnabled,
    isSourceInspectorEnabled,
  });
  const isQaPanelVisible = isListVisible && sidePanel === 'qa';
  const isSourceTreePanelVisible =
    isSourceInspectorEnabled && isListVisible && sidePanel === 'source';
  const isFigmaImagesPanelVisible =
    isFigmaImageManagementEnabled &&
    isListVisible &&
    sidePanel === 'figma-images';

  useEffect(() => {
    const state = storeApi.getState();
    const availableSidePanel = getAvailableSidePanel(state.sidePanel, {
      isFigmaImageManagementEnabled,
      isSourceInspectorEnabled,
    });
    if (availableSidePanel !== state.sidePanel) {
      state.setSidePanel(availableSidePanel);
    }
  }, [isFigmaImageManagementEnabled, isSourceInspectorEnabled, storeApi]);

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
          isSourceInspectorEnabled,
        })
      );
      state.setIsListVisible(true);
    },
    [isFigmaImageManagementEnabled, isSourceInspectorEnabled, storeApi]
  );

  const toggleSidePanel = useCallback(
    (nextSidePanel: StoredReviewSidePanel) => {
      const state = storeApi.getState();
      const currentSidePanel = getAvailableSidePanel(state.sidePanel, {
        isFigmaImageManagementEnabled,
        isSourceInspectorEnabled,
      });
      const availableSidePanel = getAvailableSidePanel(nextSidePanel, {
        isFigmaImageManagementEnabled,
        isSourceInspectorEnabled,
      });
      state.setSidePanel(availableSidePanel);
      state.setIsListVisible(
        currentSidePanel === availableSidePanel ? !state.isListVisible : true
      );
    },
    [isFigmaImageManagementEnabled, isSourceInspectorEnabled, storeApi]
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

import {
  useCallback,
  useEffect,
  useState,
} from 'react';
import { getInitialItemId } from '../route';
import {
  getInitialReviewSidePanel,
  getStoredReviewSidePanel,
  getStoredReviewSidePanelVisible,
  writeStoredReviewSidePanel,
  writeStoredReviewSidePanelVisible,
  type StoredReviewSidePanel,
} from '../settings';

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

export const useReviewSidePanel = ({
  isFigmaImageManagementEnabled,
  isSourceInspectorEnabled,
}: UseReviewSidePanelOptions) => {
  const [sidePanel, setSidePanel] = useState<StoredReviewSidePanel>(() => {
    const initialSidePanel = getInitialReviewSidePanel();
    const nextSidePanel =
      initialSidePanel ??
      (getInitialItemId() ? 'qa' : getStoredReviewSidePanel());
    return getAvailableSidePanel(nextSidePanel, {
      isFigmaImageManagementEnabled,
      isSourceInspectorEnabled,
    });
  });
  const [isListVisible, setIsListVisible] = useState(
    () =>
      Boolean(getInitialItemId() || getInitialReviewSidePanel()) ||
      getStoredReviewSidePanelVisible()
  );
  const isQaPanelVisible = isListVisible && sidePanel === 'qa';
  const isSourceTreePanelVisible =
    isSourceInspectorEnabled && isListVisible && sidePanel === 'source';
  const isFigmaImagesPanelVisible =
    isFigmaImageManagementEnabled &&
    isListVisible &&
    sidePanel === 'figma-images';

  useEffect(() => {
    setSidePanel((currentSidePanel) =>
      getAvailableSidePanel(currentSidePanel, {
        isFigmaImageManagementEnabled,
        isSourceInspectorEnabled,
      })
    );
  }, [isFigmaImageManagementEnabled, isSourceInspectorEnabled]);

  useEffect(() => {
    writeStoredReviewSidePanel(sidePanel);
  }, [sidePanel]);

  useEffect(() => {
    writeStoredReviewSidePanelVisible(isListVisible);
  }, [isListVisible]);

  const openSidePanel = useCallback(
    (nextSidePanel: StoredReviewSidePanel) => {
      setSidePanel(
        getAvailableSidePanel(nextSidePanel, {
          isFigmaImageManagementEnabled,
          isSourceInspectorEnabled,
        })
      );
      setIsListVisible(true);
    },
    [isFigmaImageManagementEnabled, isSourceInspectorEnabled]
  );

  const toggleSidePanel = useCallback(
    (nextSidePanel: StoredReviewSidePanel) => {
      const availableSidePanel = getAvailableSidePanel(nextSidePanel, {
        isFigmaImageManagementEnabled,
        isSourceInspectorEnabled,
      });
      setSidePanel(availableSidePanel);
      setIsListVisible((currentVisible) =>
        sidePanel === availableSidePanel ? !currentVisible : true
      );
    },
    [isFigmaImageManagementEnabled, isSourceInspectorEnabled, sidePanel]
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

import { useReviewShellStore } from '../store/store.context';
import { useReviewFigmaImagesState } from './images.context';
import { FigmaImagesPanel } from './images.panel';

export const FigmaImagesPanelContainer = () => {
  const {
    addImage,
    deleteImage,
    error,
    imageOverlayStates,
    images,
    isEnabled,
    isLoading,
    isMutating,
    refreshImages,
    reorderImages,
    selectedImageId,
    setImageOverlayOffsetY,
    setImageOverlayOpacity,
    setSelectedImageId,
    toggleImageOverlayLocked,
    toggleImageOverlayMode,
    toggleImageOverlayVisible,
    updateImage,
  } = useReviewFigmaImagesState();
  const isListVisible = useReviewShellStore(
    (state) => state.isListVisible && state.sidePanel === 'figma-images'
  );

  if (!isEnabled) return null;

  return (
    <FigmaImagesPanel
      error={error}
      imageOverlayStates={imageOverlayStates}
      images={images}
      isListVisible={isListVisible}
      isLoading={isLoading}
      isMutating={isMutating}
      selectedImageId={selectedImageId}
      onAddImage={addImage}
      onDeleteImage={deleteImage}
      onRefreshImages={refreshImages}
      onReorderImages={reorderImages}
      onSelectImage={setSelectedImageId}
      onSetImageOverlayOffsetY={setImageOverlayOffsetY}
      onSetImageOverlayOpacity={setImageOverlayOpacity}
      onToggleImageOverlayLocked={toggleImageOverlayLocked}
      onToggleImageOverlayMode={toggleImageOverlayMode}
      onToggleImageOverlayVisible={toggleImageOverlayVisible}
      onUpdateImage={updateImage}
    />
  );
};

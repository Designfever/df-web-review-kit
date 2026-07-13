// Source Tree feature container. 아웃라인 훅과 패널 JSX 를 소유한다.
import { useReviewSectionOutline } from '../hooks/use.review.section.outline';
import { useReviewShellActions } from '../store/shell.actions.context';
import { useReviewShellConfig } from '../store/shell.config';
import { SectionOutlinePanel } from './section.outline.panel';

export const SectionOutlineContainer = () => {
  const { isSourceTreeEnabled } = useReviewShellConfig();
  const {
    clearSourceInspector,
    clearSourceOutlineHover,
    initReviewKit,
    pinSourceOutlineForElement,
    showSourceOutlineForElement,
  } = useReviewShellActions();
  const {
    activeDomAdjustmentEntryId,
    canWriteDom,
    collapsedSectionOutlineIds,
    copiedSectionOutlineId,
    copySectionOutlineName,
    domAdjustmentByEntryId,
    finishSectionDomAdjustment,
    filteredSectionOutline,
    filteredSectionOutlineCount,
    isPanelVisible,
    isDomAdjustmentEmpty,
    isSectionOutlineFiltering,
    openSectionData,
    openSectionSource,
    openSectionUsageSource,
    sectionOutline,
    sectionOutlineFilter,
    sectionOutlineMetaVisibility,
    sectionOutlineTotalCount,
    selectedSectionOutlineId,
    selectSectionOutlineEntry,
    resetSectionDomAdjustment,
    startSectionDomAdjustment,
    startSectionDomReview,
    toggleSectionOutlineEntry,
    updateSectionOutlineFilter,
    updateSectionOutlineMetaVisibility,
  } = useReviewSectionOutline({
    onClearSourceInspector: clearSourceInspector,
    onInitReviewKit: initReviewKit,
    onPinSourceOutlineForElement: pinSourceOutlineForElement,
  });

  if (!isSourceTreeEnabled) return null;

  return (
    <SectionOutlinePanel
      isPanelVisible={isPanelVisible}
      isFiltering={isSectionOutlineFiltering}
      filteredCount={filteredSectionOutlineCount}
      totalCount={sectionOutlineTotalCount}
      rootCount={sectionOutline?.length ?? 0}
      filter={sectionOutlineFilter}
      entries={filteredSectionOutline}
      collapsedIds={collapsedSectionOutlineIds}
      selectedEntryId={selectedSectionOutlineId}
      copiedEntryId={copiedSectionOutlineId}
      activeDomAdjustmentEntryId={activeDomAdjustmentEntryId}
      domAdjustmentByEntryId={domAdjustmentByEntryId}
      canWriteDom={canWriteDom}
      isFontMetaVisible={sectionOutlineMetaVisibility.font}
      isMediaMetaVisible={sectionOutlineMetaVisibility.media}
      isClassMetaVisible={sectionOutlineMetaVisibility.className}
      onToggleMeta={updateSectionOutlineMetaVisibility}
      onFilterChange={updateSectionOutlineFilter}
      onToggleEntry={toggleSectionOutlineEntry}
      onSelectEntry={selectSectionOutlineEntry}
      onCopyEntryName={(entry) => void copySectionOutlineName(entry)}
      onFinishDomAdjustment={finishSectionDomAdjustment}
      onResetDomAdjustment={resetSectionDomAdjustment}
      isDomAdjustmentEmpty={isDomAdjustmentEmpty}
      onStartDomAdjustment={startSectionDomAdjustment}
      onOpenData={openSectionData}
      onOpenSource={openSectionSource}
      onOpenUsageSource={openSectionUsageSource}
      onStartDomReview={startSectionDomReview}
      onHoverElement={showSourceOutlineForElement}
      onClearHover={clearSourceOutlineHover}
    />
  );
};

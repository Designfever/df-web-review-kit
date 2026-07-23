// Source Tree feature container. 아웃라인 훅과 패널 JSX 를 소유한다.
import { useReviewSectionOutline } from '../hooks/use.review.section.outline';
import { useReviewShellActions } from '../store/shell.actions.context';
import { SectionOutlinePanel } from './section.outline.panel';

export const SectionOutlineContainer = () => {
  const {
    clearSourceInspector,
    clearSourceOutlineHover,
    clearSourceOutlineSelection,
    initReviewKit,
    selectSourceOutlineForElement,
    showSourceOutlineForElement,
  } = useReviewShellActions();
  const {
    activeDomAdjustmentEntryId,
    canOpenSourceFiles,
    canWriteDom,
    collapsedSectionOutlineIds,
    domAdjustmentByEntryId,
    filteredSectionOutline,
    filteredSectionOutlineCount,
    isPanelVisible,
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
    clearSectionOutlineSelection,
    clearSectionDomAdjustment,
    startSectionDomAdjustment,
    startSectionDomReview,
    toggleSectionOutlineEntry,
    updateSectionOutlineFilter,
    updateSectionOutlineMetaVisibility,
  } = useReviewSectionOutline({
    onClearSourceInspector: clearSourceInspector,
    onClearSourceSelection: clearSourceOutlineSelection,
    onInitReviewKit: initReviewKit,
    onSelectSourceElement: selectSourceOutlineForElement,
  });

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
      activeDomAdjustmentEntryId={activeDomAdjustmentEntryId}
      domAdjustmentByEntryId={domAdjustmentByEntryId}
      canOpenSourceFiles={canOpenSourceFiles}
      canWriteDom={canWriteDom}
      isFontMetaVisible={sectionOutlineMetaVisibility.font}
      isMediaMetaVisible={sectionOutlineMetaVisibility.media}
      isClassMetaVisible={sectionOutlineMetaVisibility.className}
      onToggleMeta={updateSectionOutlineMetaVisibility}
      onFilterChange={updateSectionOutlineFilter}
      onToggleEntry={toggleSectionOutlineEntry}
      onSelectEntry={selectSectionOutlineEntry}
      onClearSelection={clearSectionOutlineSelection}
      onClearDomAdjustment={clearSectionDomAdjustment}
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

// Source Tree feature container. 아웃라인 훅과 패널 JSX 를 소유한다.
import { useReviewSectionOutline } from '../hooks/use.review.section.outline';
import { useReviewShellActions } from '../store/shell.actions.context';
import { useReviewShellConfig } from '../store/shell.config';
import { SectionOutlinePanel } from './section.outline.panel';

export const SectionOutlineContainer = () => {
  const { isSourceInspectorEnabled } = useReviewShellConfig();
  const {
    clearSourceInspector,
    clearSourceOutlineHover,
    initReviewKit,
    showSourceOutlineForElement,
  } = useReviewShellActions();
  const {
    canWriteDom,
    collapsedSectionOutlineIds,
    filteredSectionOutline,
    filteredSectionOutlineCount,
    isPanelVisible,
    isSectionOutlineFiltering,
    openSectionData,
    openSectionSource,
    openSectionUsageSource,
    scrollToSection,
    sectionOutline,
    sectionOutlineFilter,
    sectionOutlineMetaVisibility,
    sectionOutlineTotalCount,
    startSectionDomReview,
    toggleSectionOutlineEntry,
    updateSectionOutlineFilter,
    updateSectionOutlineMetaVisibility,
  } = useReviewSectionOutline({
    onClearSourceInspector: clearSourceInspector,
    onInitReviewKit: initReviewKit,
  });

  if (!isSourceInspectorEnabled) return null;

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
      canWriteDom={canWriteDom}
      isFontMetaVisible={sectionOutlineMetaVisibility.font}
      isMediaMetaVisible={sectionOutlineMetaVisibility.media}
      isClassMetaVisible={sectionOutlineMetaVisibility.className}
      onToggleMeta={updateSectionOutlineMetaVisibility}
      onFilterChange={updateSectionOutlineFilter}
      onToggleEntry={toggleSectionOutlineEntry}
      onScrollToSection={scrollToSection}
      onOpenData={openSectionData}
      onOpenSource={openSectionSource}
      onOpenUsageSource={openSectionUsageSource}
      onStartDomReview={startSectionDomReview}
      onHoverElement={showSourceOutlineForElement}
      onClearHover={clearSourceOutlineHover}
    />
  );
};

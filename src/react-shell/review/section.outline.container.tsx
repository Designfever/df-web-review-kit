// Source Tree feature container. 아웃라인 훅과 패널 JSX 를 소유하고
// 셸에서는 소스 인스펙터/컨트롤러 결합 콜백만 props 로 받는다.
import { useMemo } from 'react';
import type { ReviewMode } from '../../types';
import { useReviewSectionOutline } from '../hooks/use.review.section.outline';
import { buildTargetSrc } from '../route';
import type { GetSectionOutlineOptions } from '../section.outline';
import type { SourceOpenOptions } from '../source.open';
import { useReviewShellRefs } from '../store/shell.refs';
import { useReviewShellStore } from '../store/store.context';
import { useReviewShellAdapterState } from '../store/use.review.adapter.state';
import { SectionOutlinePanel } from './section.outline.panel';

interface SectionOutlineContainerProps {
  isPanelVisible: boolean;
  sectionOutlineOptions: GetSectionOutlineOptions;
  sourceOpenOptions: SourceOpenOptions;
  targetFrameLoadVersion: number;
  onClearHover: () => void;
  onClearSourceInspector: () => void;
  onHoverElement: (element: Element) => void;
  onInitReviewKit: () => void;
  onModeChange: (mode: ReviewMode) => void;
  onShowQaPanel: () => void;
  onToast: (message: string) => void;
}

export const SectionOutlineContainer = ({
  isPanelVisible,
  sectionOutlineOptions,
  sourceOpenOptions,
  targetFrameLoadVersion,
  onClearHover,
  onClearSourceInspector,
  onHoverElement,
  onInitReviewKit,
  onModeChange,
  onShowQaPanel,
  onToast,
}: SectionOutlineContainerProps) => {
  const { controllerRef, frameScrollRef, iframeRef } = useReviewShellRefs();
  const { canWriteDom } = useReviewShellAdapterState();
  const target = useReviewShellStore((state) => state.target);
  const targetSrc = useMemo(() => buildTargetSrc(target), [target]);

  const {
    collapsedSectionOutlineIds,
    filteredSectionOutline,
    filteredSectionOutlineCount,
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
    canWriteDom,
    controllerRef,
    frameScrollRef,
    iframeRef,
    isPanelVisible,
    sectionOutlineOptions,
    sourceOpenOptions,
    targetFrameLoadVersion,
    targetSrc,
    onClearSourceInspector,
    onInitReviewKit,
    onModeChange,
    onShowQaPanel,
    onToast,
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
      canWriteDom={canWriteDom}
      isBoxMetaVisible={sectionOutlineMetaVisibility.box}
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
      onHoverElement={onHoverElement}
      onClearHover={onClearHover}
    />
  );
};

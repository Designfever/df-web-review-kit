// Shell root layout for slots and root-level visual flags.
import {
  useEffect,
  useRef,
  type ReactNode,
} from 'react';

export interface ReviewShellFrameSlots {
  figmaImagesPanel?: ReactNode;
  modals?: ReactNode;
  qaPanel: ReactNode;
  sideRail: ReactNode;
  sourceInspector: ReactNode;
  sourceTreePanel?: ReactNode;
  targetFrame: ReactNode;
  toast?: ReactNode;
  topbar: ReactNode;
}

interface ReviewShellFrameProps {
  areTooltipsEnabled: boolean;
  effectiveReviewTheme: string;
  isListVisible: boolean;
  slots: ReviewShellFrameSlots;
}

const getTooltipElements = (root: HTMLElement) =>
  Array.from(root.querySelectorAll<HTMLElement>('[data-review-tooltip]'));

const restoreNativeTooltipTitles = (root: HTMLElement) => {
  getTooltipElements(root).forEach((element) => {
    const storedTitle = element.dataset.reviewTooltipTitle;
    if (storedTitle === undefined) return;
    element.setAttribute('title', storedTitle);
    delete element.dataset.reviewTooltipTitle;
  });
};

const syncNativeTooltipTitles = (
  root: HTMLElement,
  areTooltipsEnabled: boolean
) => {
  getTooltipElements(root).forEach((element) => {
    if (areTooltipsEnabled) {
      const storedTitle = element.dataset.reviewTooltipTitle;
      if (storedTitle === undefined) return;
      if (!element.getAttribute('title')) {
        element.setAttribute('title', storedTitle);
      }
      delete element.dataset.reviewTooltipTitle;
      return;
    }

    const title = element.getAttribute('title');
    if (title === null) return;
    element.dataset.reviewTooltipTitle = title;
    element.removeAttribute('title');
  });
};

export const ReviewShellFrame = ({
  areTooltipsEnabled,
  effectiveReviewTheme,
  isListVisible,
  slots,
}: ReviewShellFrameProps) => {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    syncNativeTooltipTitles(root, areTooltipsEnabled);

    const observer = new MutationObserver(() => {
      syncNativeTooltipTitles(root, areTooltipsEnabled);
    });
    observer.observe(root, {
      attributeFilter: ['data-review-tooltip', 'title'],
      attributes: true,
      childList: true,
      subtree: true,
    });

    return () => {
      observer.disconnect();
      restoreNativeTooltipTitles(root);
    };
  }, [areTooltipsEnabled]);

  return (
    <div
      className={`df-review-shell is-theme-${effectiveReviewTheme}${
        isListVisible ? ' is-list-visible' : ''
      }${areTooltipsEnabled ? '' : ' is-tooltips-disabled'}`}
      ref={rootRef}
    >
      {slots.topbar}
      {slots.modals}
      {slots.toast}
      {slots.sideRail}
      {slots.qaPanel}
      {slots.figmaImagesPanel}
      {slots.sourceTreePanel}
      {slots.targetFrame}
      {slots.sourceInspector}
    </div>
  );
};

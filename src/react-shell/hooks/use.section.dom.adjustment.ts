// use.review.section.outline.ts 에서 분리한 DOM 이동 조정(드래그 오버레이) 서브시스템.
// 담당 범위:
// - 항목별 이동 위치 상태(activeDomAdjustmentEntryId / domAdjustmentByEntryId) 관리
// - target 문서에 오버레이 레이어를 생성/파괴하는 DomAdjustmentLayerManager 수명 관리
// - 방향키 조정 / 바깥 pointerdown 종료 / active 동기화 이펙트
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getDraftViewportScale } from '../../core/draft.metrics';
import { isEditableEventTarget } from '../../core/hotkey';
import { waitForFrame } from '../review/shell.helpers';
import { type SectionOutlineEntry } from '../section.outline';
import { useReviewShellConfig } from '../store/shell.config';
import { useReviewShellRefs } from '../store/shell.refs';
import { useReviewShellStore } from '../store/store.context';
import { useReviewShellAdapterState } from '../store/use.review.adapter.state';
import { useReviewToast } from './use.review.toast';
import {
  DomAdjustmentLayerManager,
  type DomAdjustmentPosition,
} from '../target/dom-adjustment.layer';

const EMPTY_DOM_ADJUSTMENT_POSITION: DomAdjustmentPosition = {
  x: 0,
  y: 0,
};

const getSectionDomAdjustmentKeyDelta = (event: KeyboardEvent) => {
  const step = event.shiftKey ? 10 : 1;
  if (event.key === 'ArrowLeft') return { x: -step };
  if (event.key === 'ArrowRight') return { x: step };
  if (event.key === 'ArrowUp') return { y: -step };
  if (event.key === 'ArrowDown') return { y: step };
  return null;
};

export function useSectionDomAdjustment({
  scrollToSection,
  onSelectEntry,
}: {
  scrollToSection: (entry: SectionOutlineEntry) => void;
  onSelectEntry: (entry: SectionOutlineEntry) => void;
}) {
  const { reviewViewportPresets } = useReviewShellConfig();
  const { iframeRef } = useReviewShellRefs();
  const { canWriteDom } = useReviewShellAdapterState();
  const size = useReviewShellStore((state) => state.size);
  const showToast = useReviewToast();
  const [activeDomAdjustmentEntryId, setActiveDomAdjustmentEntryId] = useState<
    string | null
  >(null);
  const [domAdjustmentByEntryId, setDomAdjustmentByEntryId] = useState<
    Record<string, DomAdjustmentPosition>
  >({});
  const domAdjustmentManagerRef = useRef<DomAdjustmentLayerManager | null>(null);
  const domAdjustmentRequestVersionRef = useRef(0);

  const handleDomAdjustmentCleared = useCallback((entryId: string) => {
    setActiveDomAdjustmentEntryId((current) =>
      current === entryId ? null : current
    );
    setDomAdjustmentByEntryId((current) => {
      if (!current[entryId]) return current;
      const next = { ...current };
      delete next[entryId];
      return next;
    });
  }, []);

  const getDomAdjustmentManager = useCallback(() => {
    const frameDocument = iframeRef.current?.contentDocument;
    if (!frameDocument?.documentElement || !frameDocument.body) return null;

    const current = domAdjustmentManagerRef.current;
    if (current?.belongsTo(frameDocument)) return current;

    current?.destroy();
    const next = new DomAdjustmentLayerManager({
      document: frameDocument,
      onClear: handleDomAdjustmentCleared,
    });
    domAdjustmentManagerRef.current = next;
    return next;
  }, [handleDomAdjustmentCleared, iframeRef]);

  const domAdjustmentViewportScale = useMemo(
    () =>
      getDraftViewportScale(
        { width: size.width, height: size.height },
        reviewViewportPresets
      ).scale,
    [reviewViewportPresets, size.height, size.width]
  );

  const clearActiveDomAdjustment = useCallback(() => {
    setActiveDomAdjustmentEntryId(null);
  }, []);

  const clearDomAdjustments = useCallback(() => {
    domAdjustmentRequestVersionRef.current += 1;
    domAdjustmentManagerRef.current?.destroy();
    domAdjustmentManagerRef.current = null;
    setActiveDomAdjustmentEntryId(null);
    setDomAdjustmentByEntryId({});
  }, []);

  const finishActiveDomAdjustment = useCallback(() => {
    if (!activeDomAdjustmentEntryId) return;
    clearActiveDomAdjustment();
  }, [activeDomAdjustmentEntryId, clearActiveDomAdjustment]);

  useEffect(() => {
    if (!activeDomAdjustmentEntryId) return undefined;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (isEditableEventTarget(event)) return;

      const delta = getSectionDomAdjustmentKeyDelta(event);
      if (!delta) return;

      const position = domAdjustmentManagerRef.current?.adjust(
        activeDomAdjustmentEntryId,
        delta,
        domAdjustmentViewportScale
      );
      if (!position) {
        clearActiveDomAdjustment();
        return;
      }

      setDomAdjustmentByEntryId((current) => ({
        ...current,
        [activeDomAdjustmentEntryId]: position,
      }));
      event.preventDefault();
      event.stopPropagation();
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [
    activeDomAdjustmentEntryId,
    clearActiveDomAdjustment,
    domAdjustmentViewportScale,
  ]);

  useEffect(() => {
    if (!activeDomAdjustmentEntryId) return undefined;

    const finishOnPointerDown = (event: PointerEvent) => {
      if (
        event.target instanceof Element &&
        event.target.closest('.df-review-section-outline-link.is-dom-adjust')
      ) {
        return;
      }
      finishActiveDomAdjustment();
    };

    let frameDocument: Document | null = null;
    try {
      frameDocument = iframeRef.current?.contentDocument ?? null;
    } catch {
      frameDocument = null;
    }

    window.addEventListener('pointerdown', finishOnPointerDown, true);
    frameDocument?.addEventListener(
      'pointerdown',
      finishOnPointerDown,
      true
    );
    return () => {
      window.removeEventListener('pointerdown', finishOnPointerDown, true);
      frameDocument?.removeEventListener(
        'pointerdown',
        finishOnPointerDown,
        true
      );
    };
  }, [
    activeDomAdjustmentEntryId,
    finishActiveDomAdjustment,
    iframeRef,
  ]);

  useEffect(() => {
    domAdjustmentManagerRef.current?.setActive(activeDomAdjustmentEntryId);
  }, [activeDomAdjustmentEntryId]);

  const startSectionDomAdjustment = useCallback(
    (entry: SectionOutlineEntry) => {
      if (!canWriteDom) {
        showToast('DOM select unavailable');
        return;
      }

      const rect = entry.element.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) {
        showToast('Component has no visible area here');
        return;
      }

      finishActiveDomAdjustment();
      scrollToSection(entry);
      onSelectEntry(entry);
      const requestVersion = domAdjustmentRequestVersionRef.current + 1;
      domAdjustmentRequestVersionRef.current = requestVersion;

      let targetWindow: Window | null = null;
      try {
        targetWindow =
          entry.element.ownerDocument.defaultView ??
          iframeRef.current?.contentWindow ??
          null;
      } catch {
        targetWindow = null;
      }

      void waitForFrame(targetWindow)
        .then(async () => {
          const position =
            domAdjustmentByEntryId[entry.id] ?? EMPTY_DOM_ADJUSTMENT_POSITION;
          const manager = getDomAdjustmentManager();
          if (!manager) {
            showToast('DOM move unavailable');
            return;
          }

          const didCreate = await manager.create(
            entry.id,
            entry.label,
            entry.element,
            position,
            domAdjustmentViewportScale
          );
          if (!didCreate) {
            showToast('DOM move unavailable');
            return;
          }

          setDomAdjustmentByEntryId((current) => ({
            ...current,
            [entry.id]: position,
          }));
          if (domAdjustmentRequestVersionRef.current === requestVersion) {
            setActiveDomAdjustmentEntryId(entry.id);
          }
        })
        .catch(() => {
          clearActiveDomAdjustment();
          showToast('DOM move unavailable');
        });
    },
    [
      canWriteDom,
      clearActiveDomAdjustment,
      domAdjustmentByEntryId,
      domAdjustmentViewportScale,
      finishActiveDomAdjustment,
      getDomAdjustmentManager,
      iframeRef,
      onSelectEntry,
      scrollToSection,
      showToast,
    ]
  );

  const clearSectionDomAdjustment = useCallback(
    (entry: SectionOutlineEntry) => {
      const manager = domAdjustmentManagerRef.current;
      if (manager) {
        manager.clear(entry.id);
        return;
      }
      handleDomAdjustmentCleared(entry.id);
    },
    [handleDomAdjustmentCleared]
  );

  return {
    activeDomAdjustmentEntryId,
    domAdjustmentByEntryId,
    clearActiveDomAdjustment,
    clearDomAdjustments,
    finishActiveDomAdjustment,
    startSectionDomAdjustment,
    clearSectionDomAdjustment,
  };
}

import { useEffect, useRef, useState } from 'react';
import { getSourceCandidates, openSourceInEditor } from '../source.open';
import { useReviewShellActions } from '../store/shell.actions.context';
import { useReviewShellConfig } from '../store/shell.config';
import { useReviewShellRefs } from '../store/shell.refs';
import { useReviewShellStore, useReviewShellStoreApi } from '../store/store.context';
import { setTargetDesignInspectorLocked } from '../target/target';

/** The shell owns navigation and viewport; the engine only inspects its iframe. */
export const DesignInspectorPanelContainer = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { iframeRef, controllerRef } = useReviewShellRefs();
  const storeApi = useReviewShellStoreApi();
  const { clearSourceInspector, clearSourceOutlineSelection } = useReviewShellActions();
  const { sourceCandidateOptions, sourceOpenOptions, canOpenSourceFiles } = useReviewShellConfig();
  const isVisible = useReviewShellStore(
    (state) => state.isListVisible && state.sidePanel === 'design-inspector'
  );
  const frameNavigationVersion = useReviewShellStore((state) => state.frameNavigationVersion);
  const frameTarget = useReviewShellStore((state) => state.frameTarget);
  const [error, setError] = useState('');

  useEffect(() => {
    const container = containerRef.current;
    const frame = iframeRef.current;
    if (!isVisible || !container || !frame) return;

    let cancelled = false;
    let destroy: (() => void) | undefined;
    let lockedDocument: Document | null = null;
    const close = () => {
      storeApi.getState().setIsListVisible(false);
    };
    setError('');

    void import('../../design-inspector').then(({ createDesignInspector }) => {
      if (cancelled) return;
      const inspector = createDesignInspector({
        container,
        frame,
        overlayContainer: container.closest<HTMLElement>('.df-review-shell') ?? undefined,
        onClose: close,
        onModeChange: (mode) => {
          storeApi.getState().setDesignInspectorMode(mode);
          if (mode === 'pick') {
            controllerRef.current?.setMode('idle');
            storeApi.getState().setMode('idle');
            clearSourceInspector();
            clearSourceOutlineSelection();
          }
          try {
            const targetDocument = frame.contentDocument;
            if (lockedDocument !== targetDocument) {
              setTargetDesignInspectorLocked(lockedDocument, false);
              lockedDocument = targetDocument;
            }
            if (targetDocument) {
              setTargetDesignInspectorLocked(targetDocument, mode === 'pick');
            }
          } catch {
            // Cross-origin capability errors are shown by the inspector engine.
          }
        },
        source: canOpenSourceFiles ? {
          resolve: (element) => {
            const candidate = getSourceCandidates(element, sourceCandidateOptions)
              .find((item) => item.kind === 'source');
            if (!candidate) return null;
            return {
              file: candidate.source.file ?? '',
              displayPath: candidate.filePath,
              line: candidate.usesPosition ? Number(candidate.source.line) || 1 : 1,
              column: candidate.usesPosition ? Number(candidate.source.column) || 1 : 1,
            };
          },
          open: (location) => {
            openSourceInEditor({
              file: location.file,
              line: String(location.line),
              column: String(location.column),
            }, sourceOpenOptions);
          },
        } : undefined,
      });
      destroy = () => inspector.destroy();
    }).catch(() => {
      if (!cancelled) setError('디자인 인스펙터를 불러오지 못했습니다. 패널을 닫고 다시 열어주세요.');
    });

    return () => {
      cancelled = true;
      destroy?.();
      setTargetDesignInspectorLocked(lockedDocument, false);
      storeApi.getState().setDesignInspectorMode('pick');
    };
  }, [isVisible, frameTarget, frameNavigationVersion, iframeRef, controllerRef, storeApi,
    canOpenSourceFiles, sourceCandidateOptions, sourceOpenOptions, clearSourceInspector, clearSourceOutlineSelection]);

  if (!isVisible) return null;
  return (
    <aside id="df-review-design-inspector" className="df-review-design-inspector-panel" aria-label="Design inspector">
      {error ? <p role="alert">{error}</p> : null}
      <div className="df-review-design-inspector-host" ref={containerRef} />
    </aside>
  );
};

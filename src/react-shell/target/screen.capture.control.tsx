import { useEffect, useRef, useState } from 'react';
import { Monitor as MonitorIcon, Circle as RecordIcon, X as CloseIcon } from 'lucide-react';
import { useReviewSettingsState } from '../review/settings.context';
import { useReviewShellStore } from '../store/store.context';
import { useReviewShellRefs } from '../store/shell.refs';
import { ScreenCaptureSession, screenCaptureSessions } from './screen.capture';

export function ScreenCaptureControl() {
  const { captureMethod } = useReviewSettingsState();
  const { iframeRef } = useReviewShellRefs();
  const frameTarget = useReviewShellStore((state) => state.frameTarget);
  const frameNavigationVersion = useReviewShellStore(
    (state) => state.frameNavigationVersion
  );
  const session = useRef<ScreenCaptureSession | null>(null);
  const [active, setActive] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const errorDialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (error) errorDialog.current?.showModal();
  }, [error]);
  useEffect(() => {
    const frame = iframeRef.current;
    if (!frame) return;
    const current = new ScreenCaptureSession(frame.ownerDocument, setActive, (cause) => setError(getSharingHelp(cause)));
    session.current = current;

    const stop = () => current.stop();
    frame.ownerDocument.defaultView?.addEventListener('pagehide', stop);
    return () => {
      current.stop();
      session.current = null;

      frame.ownerDocument.defaultView?.removeEventListener('pagehide', stop);
    };
  }, [iframeRef]);
  useEffect(() => {
    const frame = iframeRef.current;
    const current = session.current;
    if (!frame || !current) return;
    screenCaptureSessions.set(frame, current);
    return () => {
      screenCaptureSessions.delete(frame);
    };
  }, [iframeRef, frameTarget, frameNavigationVersion]);
  useEffect(() => {
    if (captureMethod === 'html2canvas') session.current?.stop();
  }, [captureMethod]);
  const closeSetup = () => {
    setError('');
  };
  const startSharing = async () => {
    setError('');
    setPending(true);
    try {
      await session.current?.start();
      closeSetup();
    } catch (cause) {
      setError(getSharingHelp(cause));
    } finally {
      setPending(false);
    }
  };
  const dialogTitle = '화면 공유를 시작할 수 없습니다';
  const label = active ? 'Stop sharing' : 'Start screen capture';
  if (captureMethod === 'html2canvas') return null;
  return (
    <div className="df-review-mode" aria-label="Browser capture">
      <button
        type="button"
        className={`df-review-mode-button${active ? ' is-active' : ''}`}
        aria-label={label}
        aria-pressed={active}
        disabled={pending}
        data-review-tooltip={label}
        data-review-tooltip-placement="top"
        onClick={() => {
          if (active) session.current?.stop();
          else void startSharing();
        }}
      >
        {active ? (
          <RecordIcon aria-hidden="true" style={{ fill: '#ef4444', stroke: '#ef4444' }} />
        ) : (
          <MonitorIcon aria-hidden="true" />
        )}
      </button>
      {error && (
        <dialog
          ref={errorDialog}
          className="df-review-settings-dialog df-review-capture-error"
          aria-label={dialogTitle}
          onClose={closeSetup}
          onClick={(event) => {
            event.stopPropagation();
            if (event.target === event.currentTarget) errorDialog.current?.close();
          }}
        >
          <header className="df-review-settings-header">
              <strong>{dialogTitle}</strong>
              <button type="button" aria-label="안내 닫기"
                onClick={() => errorDialog.current?.close()}>
                <CloseIcon aria-hidden="true" />
              </button>
          </header>
          <div className="df-review-settings-body">
            <p>{error}</p>
            <div className="df-review-settings-actions df-review-capture-setup-actions">
              <button type="button" disabled={pending}
                onClick={closeSetup}>닫기</button>
              <button type="button" className="df-review-settings-theme-option is-active" disabled={pending}
                onClick={() => void startSharing()}>{pending ? '연결 중…' : '브라우저 캡처 시작'}</button>
            </div>
          </div>
        </dialog>
      )}
    </div>
  );
}


function getSharingHelp(cause: unknown) {
  const message = cause instanceof Error ? cause.message : '';
  if (message.includes('Choose this Review tab')) {
    return '공유 창에서 「Chrome 탭」 → 현재 리뷰 탭 → 「공유」를 선택하세요.';
  }
  if (message.includes('current-tab verification')) {
    return 'Chrome에서 리뷰 페이지를 열고 다시 시도하세요.';
  }
  if (message.includes('NotAllowedError')) {
    return '화면 공유가 취소되었거나 권한이 허용되지 않았습니다.\n하단 모니터 버튼을 눌러 다시 시도하세요.';
  }
  return '리뷰 탭을 활성화한 후 하단 모니터 버튼을 누르세요.\n공유 창에서 현재 리뷰 탭을 선택하세요.';
}

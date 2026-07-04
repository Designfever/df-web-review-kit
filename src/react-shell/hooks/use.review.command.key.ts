// shell.tsx 에서 분리한 Command(⌘) 키 추적 훅.
// ⌘ 를 누르고 있는 동안 QA 오버레이를 잠시 숨기는 기능에 쓰인다.
// 호스트 창과 target iframe 양쪽에서 키 이벤트를 들어야 하고,
// 창 전환/blur 시 눌림 상태가 남지 않게 정리하는 것이 핵심.
import { useEffect, useState, type RefObject } from 'react';

const isCommandModifierKeyEvent = (event: KeyboardEvent) =>
  event.key === 'Meta' ||
  event.code === 'MetaLeft' ||
  event.code === 'MetaRight';

const isCommandKeyDownEvent = (event: KeyboardEvent) =>
  isCommandModifierKeyEvent(event) || event.metaKey;

export function useReviewCommandKey({
  iframeRef,
  targetFrameLoadVersion,
  targetSrc,
}: {
  iframeRef: RefObject<HTMLIFrameElement | null>;
  /** iframe 로드마다 증가; 새 문서에 리스너를 다시 걸기 위한 의존성. */
  targetFrameLoadVersion: number;
  targetSrc: string;
}) {
  const [isCommandKeyPressed, setIsCommandKeyPressed] = useState(false);

  useEffect(() => {
    const targetDocument = iframeRef.current?.contentDocument;
    const targetWindow = iframeRef.current?.contentWindow;

    const setCommandKeyPressed = (pressed: boolean) => {
      setIsCommandKeyPressed((current) =>
        current === pressed ? current : pressed
      );
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (isCommandKeyDownEvent(event)) setCommandKeyPressed(true);
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (isCommandModifierKeyEvent(event) || !event.metaKey) {
        setCommandKeyPressed(false);
      }
    };

    const handleVisibilityChange = () => {
      // 탭 전환 중 keyup 을 놓치면 눌림 상태가 고착되므로 여기서 해제.
      if (document.visibilityState === 'hidden') setCommandKeyPressed(false);
    };

    const clearCommandKeyPressed = () => setCommandKeyPressed(false);

    window.addEventListener('keydown', handleKeyDown, true);
    window.addEventListener('keyup', handleKeyUp, true);
    window.addEventListener('blur', clearCommandKeyPressed);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    targetDocument?.addEventListener('keydown', handleKeyDown, true);
    targetDocument?.addEventListener('keyup', handleKeyUp, true);
    targetWindow?.addEventListener('blur', clearCommandKeyPressed);

    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
      window.removeEventListener('keyup', handleKeyUp, true);
      window.removeEventListener('blur', clearCommandKeyPressed);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      targetDocument?.removeEventListener('keydown', handleKeyDown, true);
      targetDocument?.removeEventListener('keyup', handleKeyUp, true);
      targetWindow?.removeEventListener('blur', clearCommandKeyPressed);
      clearCommandKeyPressed();
    };
  }, [iframeRef, targetFrameLoadVersion, targetSrc]);

  return isCommandKeyPressed;
}

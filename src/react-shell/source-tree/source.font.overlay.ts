import { createSourceShortcutStyle } from './source.shortcut.style';

/** Owns target-document shortcut styles and data-font hint DOM, not selection state. */
export function createSourceFontOverlay(frameDocument: Document, optionAttribute: string) {
  const frameRoot = frameDocument.head ?? frameDocument.documentElement;
  const frameBody = frameDocument.body ?? frameDocument.documentElement;
  if (!frameRoot || !frameBody) return undefined;

  const fontOverlayAttribute = 'data-dfwr-source-fonts';
  const style = frameDocument.createElement('style');
  style.dataset.dfwrSourceOpenShortcut = 'true';
  style.textContent = createSourceShortcutStyle(
    optionAttribute,
    fontOverlayAttribute,
  );

  frameRoot.append(style);

  const fontOverlay = frameDocument.createElement('div');
  fontOverlay.setAttribute(fontOverlayAttribute, 'true');
  fontOverlay.hidden = true;
  frameBody.append(fontOverlay);

  // 요소와 하위의 data-font 값을 수집해 폰트 힌트로 보여준다.
  const getFontHints = (element: Element | null) => {
    if (!element) return [];

    const values: Array<{ tag: string; value: string }> = [];
    const addValue = (target: Element) => {
      const value = target.getAttribute('data-font')?.trim();
      const tag = target.tagName.toLowerCase();
      if (
        value &&
        !values.some((item) => item.tag === tag && item.value === value)
      ) {
        values.push({ tag, value });
      }
    };

    addValue(element);
    element.querySelectorAll('[data-font]').forEach(addValue);
    return values;
  };

  const updateFontOverlay = (element: Element | null, isSourceSelecting: boolean) => {
    const values = isSourceSelecting ? getFontHints(element) : [];
    if (!values.length || !element) {
      fontOverlay.hidden = true;
      return;
    }

    const rect = element.getBoundingClientRect();
    const frameWidth = frameDocument.documentElement.clientWidth;
    const showAbove = rect.top > 48;
    const top = Math.max(4, showAbove ? rect.top : rect.bottom);

    fontOverlay.replaceChildren();
    fontOverlay.style.minWidth = '72px';
    fontOverlay.style.left = '4px';
    fontOverlay.style.top = `${top}px`;
    fontOverlay.style.transform = showAbove
      ? 'translateY(calc(-100% - 6px))'
      : 'translateY(6px)';
    // 너비 측정 전까지 숨겨서 좌표 보정 중 깜빡임을 막는다.
    fontOverlay.style.visibility = 'hidden';
    const rows = values.map(({ tag, value }) => {
      const row = frameDocument.createElement('span');
      const tagText = frameDocument.createElement('span');
      const valueText = frameDocument.createElement('span');
      tagText.textContent = tag;
      valueText.textContent = value;
      row.append(tagText, valueText);
      return row;
    });
    fontOverlay.append(...rows);
    fontOverlay.hidden = false;
    const overlayWidth = fontOverlay.getBoundingClientRect().width;
    const left = Math.max(
      4,
      Math.min(rect.left, frameWidth - overlayWidth - 4)
    );
    fontOverlay.style.left = `${left}px`;
    fontOverlay.style.visibility = '';
  };

  return {
    update: updateFontOverlay,
    hide: () => { fontOverlay.hidden = true; },
    destroy: () => { style.remove(); fontOverlay.remove(); },
  };
}

const HOTKEY_KEY_ALIASES: Record<string, string[]> = {
  q: ['ㅂ', 'ㅃ'],
  w: ['ㅈ', 'ㅉ'],
  e: ['ㄷ', 'ㄸ'],
  r: ['ㄱ', 'ㄲ'],
  t: ['ㅅ', 'ㅆ'],
  y: ['ㅛ'],
  u: ['ㅕ'],
  i: ['ㅑ'],
  o: ['ㅐ', 'ㅒ'],
  p: ['ㅔ', 'ㅖ'],
  a: ['ㅁ'],
  s: ['ㄴ'],
  d: ['ㅇ'],
  f: ['ㄹ'],
  g: ['ㅎ'],
  h: ['ㅗ'],
  j: ['ㅓ'],
  k: ['ㅏ'],
  l: ['ㅣ'],
  z: ['ㅋ'],
  x: ['ㅌ'],
  c: ['ㅊ'],
  v: ['ㅍ'],
  b: ['ㅠ'],
  n: ['ㅜ'],
  m: ['ㅡ'],
};

/** True when the key event originated from a text-editing element. */
export function isEditableEventTarget(event: KeyboardEvent) {
  const path = event.composedPath?.() ?? [];
  const element = (path[0] ?? event.target) as HTMLElement | null;
  if (!element || typeof element.tagName !== 'string') return false;

  const tag = element.tagName;
  return (
    tag === 'INPUT' ||
    tag === 'TEXTAREA' ||
    tag === 'SELECT' ||
    element.isContentEditable === true
  );
}

/** Matches configured hotkeys while supporting common Korean keyboard aliases. */
export function isHotkey(event: KeyboardEvent, hotkey: string) {
  const parts = hotkey
    .split('+')
    .map((part) => part.trim().toLowerCase())
    .filter(Boolean);
  const key = parts.find(
    (part) => !['shift', 'ctrl', 'control', 'alt', 'meta', 'cmd'].includes(part)
  );

  if (!key) return false;
  if (parts.includes('shift') !== event.shiftKey) return false;
  if (
    (parts.includes('ctrl') || parts.includes('control')) !== event.ctrlKey
  ) {
    return false;
  }
  if (parts.includes('alt') !== event.altKey) return false;
  if ((parts.includes('meta') || parts.includes('cmd')) !== event.metaKey) {
    return false;
  }

  return isHotkeyKey(event, key);
}

export function getHotkeyActionKey(
  event: KeyboardEvent,
  keys: readonly string[]
) {
  return keys.find((key) => isHotkeyKey(event, key));
}

export function isHotkeyKey(event: KeyboardEvent, key: string) {
  const normalizedKey = key.toLowerCase();

  if (event.key.toLowerCase() === normalizedKey) return true;

  if (getHotkeyCode(normalizedKey) === event.code) return true;

  return HOTKEY_KEY_ALIASES[normalizedKey]?.includes(event.key) ?? false;
}

function getHotkeyCode(key: string) {
  if (/^[a-z]$/.test(key)) return `Key${key.toUpperCase()}`;
  if (/^[0-9]$/.test(key)) return `Digit${key}`;
  return undefined;
}

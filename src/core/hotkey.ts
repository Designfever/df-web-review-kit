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

function isHotkeyKey(event: KeyboardEvent, key: string) {
  const normalizedKey = key.toLowerCase();

  if (event.key.toLowerCase() === normalizedKey) return true;

  if (getHotkeyCode(normalizedKey) === event.code) return true;

  const aliases: Record<string, string[]> = {
    q: ['ㅂ', 'ㅃ'],
  };

  return aliases[normalizedKey]?.includes(event.key) ?? false;
}

function getHotkeyCode(key: string) {
  if (/^[a-z]$/.test(key)) return `Key${key.toUpperCase()}`;
  if (/^[0-9]$/.test(key)) return `Digit${key}`;
  return undefined;
}

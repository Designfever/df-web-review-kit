import { describe, expect, it } from 'vitest';
import { getHotkeyActionKey, isHotkey, isHotkeyKey } from './hotkey';

// KeyboardEvent 전체를 만들 필요 없이 판정에 쓰이는 필드만 채운다.
function createKeyEvent(
  key: string,
  modifiers: Partial<
    Pick<KeyboardEvent, 'shiftKey' | 'ctrlKey' | 'altKey' | 'metaKey' | 'code'>
  > = {}
): KeyboardEvent {
  return {
    key,
    code: modifiers.code ?? '',
    shiftKey: modifiers.shiftKey ?? false,
    ctrlKey: modifiers.ctrlKey ?? false,
    altKey: modifiers.altKey ?? false,
    metaKey: modifiers.metaKey ?? false,
  } as KeyboardEvent;
}

describe('isHotkey', () => {
  it('matches a plain key without modifiers', () => {
    expect(isHotkey(createKeyEvent('r'), 'r')).toBe(true);
    expect(isHotkey(createKeyEvent('R'), 'r')).toBe(true);
    expect(isHotkey(createKeyEvent('x'), 'r')).toBe(false);
  });

  it('requires configured modifiers to match exactly', () => {
    expect(isHotkey(createKeyEvent('r', { shiftKey: true }), 'shift+r')).toBe(
      true
    );
    // 설정에 없는 modifier 가 눌려 있으면 다른 단축키로 취급해야 한다.
    expect(isHotkey(createKeyEvent('r', { shiftKey: true }), 'r')).toBe(false);
    expect(isHotkey(createKeyEvent('r'), 'shift+r')).toBe(false);
  });

  it('accepts ctrl/control and meta/cmd spellings', () => {
    expect(isHotkey(createKeyEvent('s', { ctrlKey: true }), 'control+s')).toBe(
      true
    );
    expect(isHotkey(createKeyEvent('s', { metaKey: true }), 'cmd+s')).toBe(
      true
    );
  });

  it('ignores hotkeys that only contain modifiers', () => {
    expect(isHotkey(createKeyEvent('Shift', { shiftKey: true }), 'shift')).toBe(
      false
    );
  });
});

describe('isHotkeyKey', () => {
  it('matches Korean IME aliases for latin hotkeys', () => {
    // 한글 자판 상태에서 R 위치를 누르면 event.key 가 'ㄱ' 으로 들어온다.
    expect(isHotkeyKey(createKeyEvent('ㄱ'), 'r')).toBe(true);
    expect(isHotkeyKey(createKeyEvent('ㅁ'), 'a')).toBe(true);
    expect(isHotkeyKey(createKeyEvent('ㄱ'), 'a')).toBe(false);
  });

  it('falls back to the physical key code', () => {
    // IME 알리아스 표에 없는 배열이어도 물리 키 위치(code)로 매칭된다.
    expect(isHotkeyKey(createKeyEvent('µ', { code: 'KeyM' }), 'm')).toBe(true);
    expect(isHotkeyKey(createKeyEvent('!', { code: 'Digit1' }), '1')).toBe(
      true
    );
  });
});

describe('getHotkeyActionKey', () => {
  it('returns the first configured key matching the event', () => {
    expect(getHotkeyActionKey(createKeyEvent('ㄷ'), ['r', 'e'])).toBe('e');
    expect(getHotkeyActionKey(createKeyEvent('z'), ['r', 'e'])).toBeUndefined();
  });
});

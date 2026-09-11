import { act } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { mountFigmaDevOverlay } from './dev-overlay';

describe('Figma overlay initial visibility', () => {
  it.each([false, true])('starts visible=%s and keeps Shift+F toggle behavior', async (initiallyVisible) => {
    let controller: ReturnType<typeof mountFigmaDevOverlay>;
    await act(async () => {
      controller = mountFigmaDevOverlay({
        projectId: 'test',
        initiallyVisible,
        figmaImages: {
          store: {
            listImages: vi.fn(async () => []),
            addImage: vi.fn(), updateImage: vi.fn(),
            reorderImages: vi.fn(), deleteImage: vi.fn(),
          },
        },
      });
    });
    const shadow = document.getElementById('df-review-figma-dev-overlay-root')!.shadowRoot!;
    expect(Boolean(shadow.querySelector('[aria-label="Figma overlay"]'))).toBe(initiallyVisible);
    await act(async () => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'F', code: 'KeyF', shiftKey: true, bubbles: true }));
    });
    expect(Boolean(shadow.querySelector('[aria-label="Figma overlay"]'))).toBe(!initiallyVisible);
    await act(async () => controller!.destroy());
  });
});

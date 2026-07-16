import { describe, expect, it, vi } from 'vitest';
import { normalizeZeroSizeCaptureGradients } from './capture';

describe('normalizeZeroSizeCaptureGradients', () => {
  it('removes gradients from zero-size elements only', () => {
    const hidden = document.createElement('span');
    hidden.style.backgroundImage = 'linear-gradient(red 0%, blue 100%)';
    vi.spyOn(hidden, 'getBoundingClientRect').mockReturnValue({
      width: 0,
      height: 0,
    } as DOMRect);

    const visible = document.createElement('span');
    visible.style.backgroundImage = 'linear-gradient(red 0%, blue 100%)';
    vi.spyOn(visible, 'getBoundingClientRect').mockReturnValue({
      width: 100,
      height: 20,
    } as DOMRect);

    document.body.append(hidden, visible);

    normalizeZeroSizeCaptureGradients(document);

    expect(hidden.style.getPropertyValue('background-image')).toBe('none');
    expect(hidden.style.getPropertyPriority('background-image')).toBe(
      'important'
    );
    expect(visible.style.backgroundImage).toContain('linear-gradient');
  });
});

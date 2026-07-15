import {
  afterEach,
  describe,
  expect,
  it,
} from 'vitest';
import {
  updateShellUrl,
  updateShellUrlForItem,
} from './route';

const viewport = {
  label: 'MO 390',
  width: 390,
  height: 844,
};

afterEach(() => {
  window.history.replaceState(null, '', '/');
});

describe('shell URL updates', () => {
  it('keeps the current hash when updating the target', () => {
    window.history.replaceState(null, '', '/review/?item=draft#section');

    updateShellUrl('/components/', viewport, 'local');

    expect(window.location.hash).toBe('#section');
    expect(window.location.search).not.toContain('item=');
  });

  it('keeps the current hash when selecting a QA item', () => {
    window.history.replaceState(null, '', '/review/#section');

    updateShellUrlForItem('/components/', viewport, 'draft-1', 'local');

    expect(window.location.hash).toBe('#section');
    expect(window.location.search).toContain('item=draft-1');
  });
});

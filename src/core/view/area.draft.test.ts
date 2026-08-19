import { describe, expect, it, vi } from 'vitest';
import type { ReviewItem } from '../../types';
import type { AreaDraft } from '../review/draft';
import { createAreaForm } from './area.draft';
import type { DraftLayerContext, WebReviewKitViewConfig } from './types';

describe('createAreaForm', () => {
  it('creates Area QA with the selected status and multiple owners', () => {
    let areaDraft: AreaDraft = {
      viewport: { width: 1440, height: 900 },
      comment: 'Check this area',
    };
    const createItem = vi.fn(async () => undefined);
    const config: WebReviewKitViewConfig = {
      options: {
        projectId: 'test-project',
        statusOptions: [
          { value: 'todo', label: 'Todo' },
          { value: 'done', label: 'Done' },
        ],
        assigneeOptions: [
          { value: 'one', label: 'One' },
          { value: 'two', label: 'Two' },
        ],
      },
      getEnvironment: () => undefined,
      getState: () => ({
        isOpen: true,
        mode: 'area',
        items: [],
        areaDraft,
        isCreatingItem: false,
        isCapturingViewport: false,
        isSelectingArea: false,
      }),
      actions: {
        close: vi.fn(),
        render: vi.fn(),
        reload: vi.fn(async () => [] as ReviewItem[]),
        restoreItem: vi.fn(async () => undefined),
        removeItem: vi.fn(async () => undefined),
        setModeState: vi.fn(),
        clearDrafts: vi.fn(),
        setDomDraft: vi.fn(),
        setAreaDraft: (draft) => {
          if (draft) areaDraft = draft;
        },
        setSelectingArea: vi.fn(),
        createItem,
        captureDomDraft: vi.fn(async () => undefined),
        captureAreaDraft: vi.fn(async () => undefined),
        bindElementDraftToPoint: vi.fn(async () => undefined),
        createAreaDraft: vi.fn(async () => undefined),
      },
    };
    const context: DraftLayerContext = {
      config,
      cancelDraft: vi.fn(),
      syncDraftPreview: vi.fn(),
    };
    const form = createAreaForm(context);
    const status = form.querySelector<HTMLSelectElement>('.dfwr-status-select');
    const owners = Array.from(
      form.querySelectorAll<HTMLInputElement>('.dfwr-assignee-option input')
    );

    if (!status) throw new Error('Status selector was not rendered.');
    status.value = 'done';
    status.dispatchEvent(new Event('change', { bubbles: true }));
    owners.forEach((owner) => {
      owner.checked = true;
      owner.dispatchEvent(new Event('change', { bubbles: true }));
    });
    Array.from(form.querySelectorAll('button'))
      .find((button) => button.textContent === 'Save area')
      ?.click();

    expect(createItem).toHaveBeenCalledWith(
      expect.objectContaining({
        kind: 'area',
        status: 'done',
        assigneeId: 'one',
        assigneeName: 'One',
        assigneeIds: ['one', 'two'],
        assigneeNames: ['One', 'Two'],
      })
    );
  });
});

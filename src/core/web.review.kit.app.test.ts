import { afterEach, describe, expect, it, vi } from 'vitest';
import type { ReviewItem, WebReviewKitAdapter } from '../types';
import { createWebReviewKit } from './web.review.kit.app';

describe('createWebReviewKit', () => {
  afterEach(() => {
    document.body.replaceChildren();
  });

  it('mounts the interaction layers in a fixed viewport host', () => {
    const controller = createWebReviewKit({ projectId: 'test-project' });
    const root = document.getElementById('df-web-review-kit-root');

    expect(root?.style.position).toBe('fixed');
    expect(root?.style.inset).toBe('0px');
    expect(root?.style.zIndex).toBe('2147483647');
    expect(root?.style.pointerEvents).toBe('none');
    expect(root?.style.display).not.toBe('contents');

    controller.destroy();
  });

  it('reports a failed initial load and allows a later reload to recover', async () => {
    const error = new Error('Session expired. Reload to sign in.');
    const list = vi.fn().mockRejectedValueOnce(error).mockResolvedValue([]);
    const onItemsError = vi.fn();
    const onItemsChange = vi.fn();
    const controller = createWebReviewKit({
      projectId: 'test-project',
      adapter: { list, get: vi.fn(), create: vi.fn(), update: vi.fn(), remove: vi.fn() },
      onItemsError,
      onItemsChange,
    });
    try {
      controller.open();
      await vi.waitFor(() => expect(onItemsError).toHaveBeenCalledWith(error));
      expect(onItemsChange).not.toHaveBeenCalled();
      await expect(controller.reload()).resolves.toEqual([]);
      expect(onItemsChange).toHaveBeenCalledWith([]);
      list.mockRejectedValueOnce(error);
      await expect(controller.reload()).rejects.toBe(error);
    } finally {
      controller.destroy();
    }
  });

  it.each([false, true])('closes draft owners outside without losing selections (docked: %s)', async (docked) => {
    const target = document.createElement('div');
    const composerHost = document.createElement('div');
    document.body.append(target, composerHost);
    vi.spyOn(target, 'getBoundingClientRect').mockReturnValue({
      x: 20, y: 20, left: 20, top: 20, right: 140, bottom: 60,
      width: 120, height: 40, toJSON: () => ({}),
    });
    const controller = createWebReviewKit({
      projectId: 'outside-owner-test',
      ui: { panel: !docked },
      target: { window, document, getComposerHost: () => composerHost },
      assigneeOptions: [{ value: 'one', label: 'One' }],
    });
    await controller.startElementReview(target, 'Keep this comment');
    const root = docked ? composerHost : document.getElementById('df-web-review-kit-root')!.shadowRoot!;
    const picker = root.querySelector<HTMLDetailsElement>('.dfwr-assignee-picker')!;
    const owner = picker.querySelector<HTMLInputElement>('input')!;
    picker.open = true;
    owner.dispatchEvent(new Event('pointerdown', { bubbles: true, composed: true }));
    owner.click();
    expect(picker.open).toBe(true);
    expect(owner.checked).toBe(true);

    const comment = root.querySelector<HTMLTextAreaElement>('textarea')!;
    comment.dispatchEvent(new Event('pointerdown', { bubbles: true, composed: true }));
    expect(picker.open).toBe(false);
    expect(owner.checked).toBe(true);
    expect(comment.value).toBe('Keep this comment');

    picker.open = true;
    window.dispatchEvent(new Event('blur'));
    expect(picker.open).toBe(false);
    controller.destroy();
    picker.open = true;
    window.dispatchEvent(new Event('blur'));
    expect(picker.open).toBe(true);
  });

  it('creates DOM QA with the selected status and multiple owners', async () => {
    const create = vi.fn(async (item: ReviewItem) => item);
    const adapter: WebReviewKitAdapter = {
      get: vi.fn(async () => null),
      list: vi.fn(async () => []),
      create,
      update: vi.fn(async (_id, patch) => patch as ReviewItem),
      remove: vi.fn(async () => undefined),
    };
    const element = document.createElement('button');
    document.body.append(element);
    vi.spyOn(element, 'getBoundingClientRect').mockReturnValue({
      bottom: 60,
      height: 40,
      left: 20,
      right: 140,
      top: 20,
      width: 120,
      x: 20,
      y: 20,
      toJSON: () => ({}),
    });
    const controller = createWebReviewKit({
      projectId: 'test-project',
      adapter,
      statusOptions: [
        { value: 'todo', label: 'Todo' },
        { value: 'review', label: 'Review' },
      ],
      assigneeTitle: 'Owner',
      assigneeOptions: [
        { value: 'one', label: 'One' },
        { value: 'two', label: 'Two' },
      ],
    });

    await controller.startElementReview(element, 'Check this');

    const shadow = document.getElementById('df-web-review-kit-root')?.shadowRoot;
    const status = shadow?.querySelector<HTMLSelectElement>(
      '.dfwr-status-select'
    );
    const owners = Array.from(
      shadow?.querySelectorAll<HTMLInputElement>(
        '.dfwr-assignee-option input'
      ) ?? []
    );
    expect(status?.value).toBe('todo');
    expect(owners).toHaveLength(2);

    if (!status) throw new Error('Status selector was not rendered.');
    status.value = 'review';
    status.dispatchEvent(new Event('change', { bubbles: true }));
    owners.forEach((owner) => {
      owner.checked = true;
      owner.dispatchEvent(new Event('change', { bubbles: true }));
    });
    shadow?.querySelector<HTMLButtonElement>('.dfwr-button.is-primary')?.click();

    await vi.waitFor(() => expect(create).toHaveBeenCalledOnce());
    expect(create.mock.calls[0]?.[0]).toMatchObject({
      status: 'review',
      assigneeId: 'one',
      assigneeName: 'One',
      assigneeIds: ['one', 'two'],
      assigneeNames: ['One', 'Two'],
    });

    controller.destroy();
  });
});

describe('automatic issue capture', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    document.body.replaceChildren();
  });

  it.each(['automatic', 'manual', 'failed'] as const)(
    'saves a capture once, or keeps the issue when capture fails: %s', async (mode) => {
      vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:capture-test');
      vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
      vi.spyOn(console, 'warn').mockImplementation(() => {});
      const captureViewport = vi.fn(async () => {
        if (mode === 'failed') throw new Error('Capture unavailable');
        return { file: new Blob(['capture'], { type: 'image/webp' }), width: 120, height: 40 };
      });
      const uploadAttachment = vi.fn(async () => ({
        url: 'https://example.com/capture.webp', name: 'capture.webp',
        mime: 'image/webp', size: 7, kind: 'capture',
      }));
      const create = vi.fn(async (item: ReviewItem) => item);
      const element = document.createElement('button');
      element.textContent = 'Capture target';
      document.body.append(element);
      vi.spyOn(element, 'getBoundingClientRect').mockReturnValue({
        x: 20, y: 20, left: 20, top: 20, right: 140, bottom: 60,
        width: 120, height: 40, toJSON: () => ({}),
      });
      const controller = createWebReviewKit({
        projectId: 'capture-test', target: { window, document, captureViewport },
        adapter: {
          get: async () => null, list: async () => [], create,
          update: async (_id, patch) => patch as ReviewItem,
          remove: async () => undefined, uploadAttachment,
        },
      });
      try {
        await controller.startElementReview(element, 'Capture this issue');
        const shadow = document.getElementById('df-web-review-kit-root')!.shadowRoot!;
        if (mode === 'manual') {
          shadow.querySelector<HTMLButtonElement>('[title="Capture current viewport"]')!.click();
          await vi.waitFor(() => expect(shadow.querySelector('[aria-busy="true"]')).toBeNull());
        }
        shadow.querySelector<HTMLButtonElement>('.dfwr-button.is-primary')!.click();
        await vi.waitFor(() => expect(create).toHaveBeenCalledOnce());
        expect(captureViewport).toHaveBeenCalledOnce();
        if (mode === 'failed') {
          expect(create.mock.calls[0][0].attachments).toBeUndefined();
          expect(uploadAttachment).not.toHaveBeenCalled();
        } else {
          expect(create.mock.calls[0][0].attachments).toHaveLength(1);
          expect(uploadAttachment).toHaveBeenCalledOnce();
          expect(captureViewport.mock.calls[0]).toBeDefined();
        }
      } finally { controller.destroy(); }
    }
  );
});

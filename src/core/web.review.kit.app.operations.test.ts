import { afterEach, describe, expect, it, vi } from 'vitest';
import type { ReviewAttachmentUploadInput, ReviewItem, WebReviewKitController, WebReviewKitOptions } from '../types';
import type { WebReviewKitViewConfig } from './view/types';
import type { ReviewDraftAttachment } from './review/draft';
import { createWebReviewKit } from './web.review.kit.app';

// Expose the existing view/actions boundary; exercise the real app and operations.
const view = vi.hoisted(() => ({ config: undefined as WebReviewKitViewConfig | undefined }));
vi.mock('./web.review.kit.view', () => ({
  WebReviewKitView: class {
    constructor(config: WebReviewKitViewConfig) { view.config = config; }
    render() {}
    clearDraftPreview() {}
  },
}));
let controller: WebReviewKitController;
afterEach(() => {
  controller?.destroy();
  document.body.replaceChildren();
  vi.restoreAllMocks();
});
function setup(options: Partial<WebReviewKitOptions> = {}) {
  const create = vi.fn(async (item: ReviewItem) => item);
  const list = vi.fn(async () => []);
  controller = createWebReviewKit({
    projectId: 'operations',
    adapter: { get: async () => null, list, create,
      update: async (_id, patch) => patch as ReviewItem, remove: async () => {} },
    ...options,
  });
  const config = view.config!;
  return { config, create, list };
}
function captureSetup() {
  vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:manual');
  const revoke = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
  const captureViewport = vi.fn(async () => ({
    file: new Blob(['capture'], { type: 'image/png' }), width: 20, height: 10,
  }));
  const context = setup({ target: { window, document, captureViewport } });
  context.config.actions.setDomDraft({ viewport: { width: 400, height: 800 }, marker: { viewport: { x: 2, y: 3 } } });
  return { ...context, captureViewport, revoke };
}
const input = { kind: 'dom' as const, comment: 'Keep comment' };
const draftAttachment = (): ReviewDraftAttachment => ({
  id: 'draft', file: new Blob(['file']), name: 'file.png', mime: 'image/png',
  size: 4, kind: 'image', previewUrl: 'blob:attachment', metadata: { original: true },
});
const uploaded = { url: '/file.png', name: 'file.png', mime: 'image/png', size: 4, kind: 'image' as const };

describe('core item and attachment orchestration', () => {
  it('keeps one submit in flight through upload, create, reload and notification', async () => {
    const { config, create, list } = setup();
    let finishUpload!: (value: typeof uploaded) => void;
    let finishNotification!: () => void;
    const uploadAttachment = vi.fn((_input: ReviewAttachmentUploadInput) => new Promise<typeof uploaded>(resolve => { finishUpload = resolve; }));
    config.options.adapter!.uploadAttachment = uploadAttachment;
    config.options.onCreateItem = vi.fn(() => new Promise<void>(resolve => { finishNotification = resolve; }));
    const attachment = draftAttachment();
    const pending = config.actions.createItem({ ...input, attachments: [attachment] });
    await config.actions.createItem(input);
    expect(uploadAttachment).toHaveBeenCalledOnce();
    expect(create).not.toHaveBeenCalled();
    expect(config.getState().isCreatingItem).toBe(true);
    expect(uploadAttachment.mock.calls[0]?.[0]).toMatchObject({ file: attachment.file, metadata: attachment.metadata, item: { projectId: 'operations' } });
    finishUpload(uploaded);
    await vi.waitFor(() => expect(config.options.onCreateItem).toHaveBeenCalledOnce());
    expect(create).toHaveBeenCalledOnce();
    expect(list).toHaveBeenCalledOnce();
    expect(config.getState().isCreatingItem).toBe(true);
    await config.actions.createItem(input);
    expect(create).toHaveBeenCalledOnce();
    finishNotification();
    await pending;
    expect(config.getState().isCreatingItem).toBe(false);
    expect(create.mock.calls[0][0].attachments).toEqual([uploaded]);
  });

  it.each(['missing', 'rejected'] as const)('keeps draft and reports required upload failure: %s', async mode => {
    const { config, create } = setup();
    const revoke = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
    const attachment = draftAttachment();
    config.actions.setDomDraft({ viewport: { width: 400, height: 800 }, marker: { viewport: { x: 0, y: 0 } }, attachments: [attachment] });
    if (mode === 'rejected') config.options.adapter!.uploadAttachment = vi.fn(async () => { throw Object.assign(new Error('Too large'), { reason: 'size' }); });
    await config.actions.createItem({ ...input, attachments: [attachment] });
    expect(create).not.toHaveBeenCalled();
    expect(config.getState().isCreatingItem).toBe(false);
    expect(config.getState().domDraft?.attachments).toEqual([attachment]);
    expect(config.getState().draftError).toBe(mode === 'missing' ? 'Attachment upload adapter is not configured.' : 'Attachment upload failed (size): Too large');
    expect(revoke).not.toHaveBeenCalled();
    controller.close();
    expect(revoke).toHaveBeenCalledWith('blob:attachment');
  });

  it('keeps saving when automatic upload fails and revokes its temporary preview', async () => {
    const { config, create, revoke, captureViewport } = captureSetup();
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    config.options.adapter!.uploadAttachment = vi.fn(async () => { throw new Error('Offline'); });
    await config.actions.createItem(input);
    expect(captureViewport).toHaveBeenCalledOnce();
    expect(create).toHaveBeenCalledOnce();
    expect(create.mock.calls[0][0].attachments).toBeUndefined();
    expect(console.warn).toHaveBeenCalledWith('[web-review-kit] Automatic capture failed', expect.any(Error));
    expect(revoke).toHaveBeenCalledExactlyOnceWith('blob:manual');
    expect(config.getState().draftError).toBe('');
  });

  it('keeps manual capture failure visible and releases the capture guard', async () => {
    const { config, captureViewport, revoke } = captureSetup();
    captureViewport.mockRejectedValueOnce(new Error('Capture denied'));
    await config.actions.captureDomDraft(config.getState().domDraft!);
    expect(config.getState().draftError).toBe('Capture denied');
    expect(config.getState().isCapturingViewport).toBe(false);
    expect(config.getState().domDraft?.attachments).toBeUndefined();
    expect(revoke).not.toHaveBeenCalled();
    await config.actions.captureDomDraft(config.getState().domDraft!);
    expect(config.getState().draftError).toBe('');
    expect(config.getState().domDraft?.attachments).toHaveLength(1);
    controller.destroy();
    expect(revoke).toHaveBeenCalledExactlyOnceWith('blob:manual');
  });

  it('preserves newer draft fields during capture and prevents duplicate capture', async () => {
    const { config, captureViewport } = captureSetup();
    let finish!: (value: { file: Blob; width: number; height: number }) => void;
    captureViewport.mockImplementationOnce(() => new Promise(resolve => { finish = resolve; }));
    const pending = config.actions.captureDomDraft(config.getState().domDraft!);
    await config.actions.captureDomDraft(config.getState().domDraft!);
    config.actions.setDomDraft({ ...config.getState().domDraft!, comment: 'Edited while capturing' });
    finish({ file: new Blob(['x'], { type: 'image/png' }), width: 20, height: 10 });
    await pending;
    expect(captureViewport).toHaveBeenCalledOnce();
    expect(config.getState().domDraft?.comment).toBe('Edited while capturing');
    expect(config.getState().domDraft?.attachments?.[0].metadata).toMatchObject({ source: 'viewport-capture', width: 20, height: 10 });
  });

  it('uploads manual captures once and revokes their preview only after item creation', async () => {
    const { config, create, captureViewport, revoke } = captureSetup();
    await config.actions.captureDomDraft(config.getState().domDraft!);
    config.options.adapter!.uploadAttachment = vi.fn(async () => ({ ...uploaded, kind: 'capture' }));
    create.mockImplementationOnce(async item => {
      expect(revoke).not.toHaveBeenCalled();
      return item;
    });
    await config.actions.createItem({ ...input, attachments: config.getState().domDraft!.attachments });
    expect(captureViewport).toHaveBeenCalledOnce();
    expect(config.options.adapter!.uploadAttachment).toHaveBeenCalledOnce();
    expect(revoke).toHaveBeenCalledExactlyOnceWith('blob:manual');
    expect(config.getState().domDraft).toBeUndefined();
  });

  it('normalizes owners and persistence metadata without altering comment or geometry', async () => {
    const { config, create } = setup({ userId: ' reviewer ', assigneeOptions: [{ value: 'two', label: 'Two' }] });
    await config.actions.createItem({ ...input, title: ' Title ', assigneeIds: [' one ', 'one', '', 'two'], assigneeNames: [' First ', ''], viewport: { width: 390, height: 844 }, scope: 'mobile', status: 'review', marker: { viewport: { x: 2, y: 3 } } });
    expect(create.mock.calls[0][0]).toMatchObject({ title: 'Title', createdBy: 'reviewer', assigneeId: 'one', assigneeName: 'First', assigneeIds: ['one', 'two'], assigneeNames: ['First', 'Two'], scope: 'mobile', status: 'review', viewport: { width: 390, height: 844 }, comment: input.comment, marker: { viewport: { x: 2, y: 3 } } });
    expect(create.mock.calls[0][0].updatedAt).toBe(create.mock.calls[0][0].createdAt);
    await config.actions.createItem({ ...input, assigneeId: ' two ' });
    expect(create.mock.calls[1][0]).toMatchObject({ assigneeId: 'two', assigneeName: 'Two', status: 'todo' });
  });
});

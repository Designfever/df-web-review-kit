import type {
  ReviewAttachment, ReviewItem, ReviewViewportCaptureInput, WebReviewKitAdapter,
} from '../../types';
import type { ReviewEnvironment } from '../geometry';
import {
  createCaptureDraftAttachment, createViewportCaptureInput, type CaptureDraftInput,
} from './capture.input';
import type { ReviewDraftAttachment } from './draft';

export async function captureDraftAttachment(
  environment: ReviewEnvironment & Required<Pick<ReviewEnvironment, 'captureViewport'>>,
  input: ReviewViewportCaptureInput
): Promise<ReviewDraftAttachment> {
  const result = await environment.captureViewport(input);
  return createCaptureDraftAttachment(result, input);
}

/** Explicit attachments are required; automatic screenshots are best effort. */
export async function prepareItemAttachments({ input, item, environment, adapter }: {
  input: Partial<CaptureDraftInput> & { attachments?: ReviewDraftAttachment[] };
  item: ReviewItem;
  environment: ReviewEnvironment;
  adapter: Pick<WebReviewKitAdapter, 'uploadAttachment'>;
}): Promise<ReviewAttachment[]> {
  const attachments = await uploadDraftAttachments(
    adapter,
    input.attachments,
    item
  );
  if (!attachments.some((attachment) => attachment.kind === 'capture') &&
      !input.attachments?.some((attachment) => attachment.kind === 'capture') &&
      environment.captureViewport && adapter.uploadAttachment) {
    let previewUrl: string | undefined;
    try {
      const captureInput = createViewportCaptureInput(environment, { ...input, viewport: item.viewport }, input.selection?.viewport);
      const result = await environment.captureViewport(captureInput);
      const capture = createCaptureDraftAttachment(result, captureInput);
      previewUrl = capture.previewUrl;
      attachments.push(...await uploadDraftAttachments(adapter, [capture], item));
    } catch (error) {
      // A missing screenshot must not prevent the reviewer from saving the issue.
      console.warn('[web-review-kit] Automatic capture failed', error);
    } finally {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    }
  }
  return attachments;
}

async function uploadDraftAttachments(
  adapter: Pick<WebReviewKitAdapter, 'uploadAttachment'>,
  attachments: ReviewDraftAttachment[] | undefined,
  item: ReviewItem
): Promise<ReviewAttachment[]> {
  if (!attachments?.length) return [];
  const uploadAttachment = adapter.uploadAttachment;
  if (!uploadAttachment) {
    throw new Error('Attachment upload adapter is not configured.');
  }

  return Promise.all(
    attachments.map((attachment) =>
      uploadAttachment({
        file: attachment.file,
        name: attachment.name,
        mime: attachment.mime,
        kind: attachment.kind,
        item,
        metadata: attachment.metadata,
      })
    )
  );
}

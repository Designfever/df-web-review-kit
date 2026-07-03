import type { ReviewDraftAttachment } from './review/draft';

interface DraftAttachmentPasteOptions {
  getAttachments: () => ReviewDraftAttachment[] | undefined;
  onAttachmentsChange: (attachments: ReviewDraftAttachment[]) => void;
  onCommentChange: (comment: string) => void;
  onPasteComplete: () => void;
}

export function attachDraftImagePasteQueue(
  textarea: HTMLTextAreaElement,
  options: DraftAttachmentPasteOptions
) {
  textarea.addEventListener('paste', (event) => {
    const imageFiles = getClipboardImageFiles(event.clipboardData);
    if (imageFiles.length === 0) return;

    event.preventDefault();
    const text = event.clipboardData?.getData('text/plain');
    if (text) {
      insertTextAtTextareaSelection(textarea, text);
      options.onCommentChange(textarea.value);
    }

    const attachments = imageFiles.map((file, index) =>
      createDraftImageAttachment(file, index)
    );
    options.onAttachmentsChange([
      ...(options.getAttachments() ?? []),
      ...attachments,
    ]);
    options.onPasteComplete();
  });
}

export function createDraftAttachmentQueue(
  ownerDocument: Document,
  attachments: ReviewDraftAttachment[] | undefined,
  onRemove: (attachmentId: string) => void
) {
  if (!attachments?.length) return undefined;

  const queue = ownerDocument.createElement('div');
  queue.className = 'dfwr-attachment-queue';

  const label = ownerDocument.createElement('div');
  label.className = 'dfwr-attachment-label';
  label.textContent = `Attachments (${attachments.length})`;

  const list = ownerDocument.createElement('div');
  list.className = 'dfwr-attachment-list';

  attachments.forEach((attachment) => {
    const item = ownerDocument.createElement('div');
    item.className = 'dfwr-attachment-item';

    const preview = createDraftAttachmentPreview(ownerDocument, attachment);

    const name = ownerDocument.createElement('div');
    name.className = 'dfwr-attachment-name';
    name.textContent = attachment.name;
    name.title = attachment.name;

    const remove = ownerDocument.createElement('button');
    remove.className = 'dfwr-attachment-remove';
    remove.type = 'button';
    remove.textContent = 'Remove';
    remove.setAttribute('aria-label', `Remove ${attachment.name}`);
    remove.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      onRemove(attachment.id);
    });

    item.append(preview, name, remove);
    list.append(item);
  });

  queue.append(label, list);
  return queue;
}

export function removeDraftAttachment(
  attachments: ReviewDraftAttachment[] | undefined,
  attachmentId: string
) {
  if (!attachments?.length) return [];

  const removed = attachments.find((attachment) => attachment.id === attachmentId);
  if (removed?.previewUrl) {
    URL.revokeObjectURL(removed.previewUrl);
  }
  return attachments.filter((attachment) => attachment.id !== attachmentId);
}

function getClipboardImageFiles(data: DataTransfer | null) {
  if (!data) return [];

  const itemFiles = Array.from(data.items)
    .filter((item) => item.kind === 'file' && item.type.startsWith('image/'))
    .map((item) => item.getAsFile())
    .filter((file): file is File => Boolean(file));
  if (itemFiles.length > 0) return itemFiles;

  return Array.from(data.files).filter((file) => file.type.startsWith('image/'));
}

function createDraftImageAttachment(file: File, index: number) {
  const mime = file.type || 'image/png';
  const name =
    file.name ||
    `pasted-image-${Date.now()}-${index + 1}${getImageExtension(mime)}`;
  return {
    id: createDraftAttachmentId(),
    file,
    name,
    mime,
    size: file.size,
    kind: 'image',
    previewUrl: URL.createObjectURL(file),
    metadata: { source: 'paste' },
  } satisfies ReviewDraftAttachment;
}

function createDraftAttachmentId() {
  return (
    window.crypto?.randomUUID?.() ??
    `draft-attachment-${Date.now()}-${Math.random().toString(36).slice(2)}`
  );
}

function getImageExtension(mime: string) {
  if (mime === 'image/jpeg') return '.jpg';
  if (mime === 'image/gif') return '.gif';
  if (mime === 'image/webp') return '.webp';
  if (mime === 'image/svg+xml') return '.svg';
  return '.png';
}

function insertTextAtTextareaSelection(
  textarea: HTMLTextAreaElement,
  text: string
) {
  const start = textarea.selectionStart ?? textarea.value.length;
  const end = textarea.selectionEnd ?? start;
  textarea.value = [
    textarea.value.slice(0, start),
    text,
    textarea.value.slice(end),
  ].join('');
  const nextSelection = start + text.length;
  textarea.setSelectionRange(nextSelection, nextSelection);
}

function createDraftAttachmentPreview(
  ownerDocument: Document,
  attachment: ReviewDraftAttachment
) {
  if (attachment.previewUrl && attachment.mime.startsWith('image/')) {
    const image = ownerDocument.createElement('img');
    image.className = 'dfwr-attachment-thumb';
    image.src = attachment.previewUrl;
    image.alt = '';
    image.decoding = 'async';
    return image;
  }

  const fallback = ownerDocument.createElement('div');
  fallback.className = 'dfwr-attachment-thumb is-file';
  fallback.textContent = 'IMG';
  return fallback;
}

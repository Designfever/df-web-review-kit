import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import type { ReviewAttachment } from '../types';

export function ImagePreviewModal({ attachment, issueLabel, issueTitle, onClose }: {
  attachment: ReviewAttachment;
  issueLabel: string;
  issueTitle: string;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [popupBlocked, setPopupBlocked] = useState(false);

  const openOriginal = () => {
    const imageWindow = dialogRef.current?.ownerDocument.defaultView?.open('about:blank', '_blank');
    setPopupBlocked(!imageWindow);
    if (!imageWindow) return;
    imageWindow.opener = null;
    const document = imageWindow.document;
    document.title = attachment.name;
    document.body.style.cssText = 'margin:0;background:#111;';
    // Render as an image instead of navigating to data URLs or executing SVG markup.
    const image = document.createElement('img');
    image.src = attachment.url;
    image.alt = attachment.name;
    image.style.display = 'block';
    document.body.append(image);
  };

  useEffect(() => {
    dialogRef.current?.showModal();
  }, [attachment]);

  return <dialog
    ref={dialogRef}
    className="df-review-attachment-preview"
    aria-label={`Preview ${issueLabel}: ${issueTitle}`}
    onClose={onClose}
    onClick={(event) => {
      event.stopPropagation();
      if (event.target === event.currentTarget) dialogRef.current?.close();
    }}
  >
    <div className="df-review-attachment-preview-content">
      <header>
        <div className="df-review-attachment-preview-heading">
          <strong>{issueLabel}</strong>
          <span>{issueTitle}</span>
        </div>
        <button type="button" aria-label="Close image preview"
          onClick={() => dialogRef.current?.close()}><X aria-hidden="true" /></button>
      </header>
      <button type="button" className="df-review-attachment-preview-original"
        aria-label="Open original image in a new window"
        title="Open original image in a new window" onClick={openOriginal}>
        <img src={attachment.url} alt={attachment.name} />
      </button>
      <footer>{attachment.name}</footer>
      {popupBlocked && <p role="status">Allow pop-ups to open the original image.</p>}
    </div>
  </dialog>;
}

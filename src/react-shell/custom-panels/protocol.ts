import type { ReviewCustomPanelDefinition, ReviewCustomPanelSnapshot } from './types';

// Private, versioned cross-bundle protocol. Never require module singleton identity.
export const PANEL_ENDPOINT = '__dfReviewCustomPanelsV1';
export const PANEL_READY_EVENT = 'df-review-custom-panels-ready-v1';
export interface PanelRegistration {
  open(): void;
  close(): void;
  dispose(): void;
}
export interface PanelEndpoint {
  version: 1;
  register(
    target: Window,
    document: Document,
    definition: ReviewCustomPanelDefinition,
    notify: (snapshot: ReviewCustomPanelSnapshot) => void,
  ): PanelRegistration | null;
}
export type PanelFrame = HTMLIFrameElement & { [PANEL_ENDPOINT]?: PanelEndpoint };

export function announcePanelEndpoint(frame: PanelFrame) {
  const event = frame.ownerDocument.createEvent('Event');
  event.initEvent(PANEL_READY_EVENT, false, false);
  frame.dispatchEvent(event);
}

export function isValidPanelDefinition(value: ReviewCustomPanelDefinition): boolean {
  if (!value || typeof value.id !== 'string' ||
      !/^[a-z][a-z0-9]*(?:[.-][a-z0-9]+)+$/.test(value.id) ||
      typeof value.label !== 'string' || !value.label.trim()) return false;
  const icon = value.icon;
  if (icon === undefined) return true;
  if (!icon || typeof icon.viewBox !== 'string' || !Array.isArray(icon.paths) ||
      !icon.paths.length) return false;
  const box = icon.viewBox.trim().split(/[\s,]+/).map(Number);
  return box.length === 4 && box.every(Number.isFinite) && box[2] > 0 && box[3] > 0 &&
    icon.paths.every(path => typeof path === 'string' && path.trim().length > 0 &&
      /^[MmZzLlHhVvCcSsQqTtAa0-9eE.,+\s-]+$/.test(path));
}

// A consumer callback must not interrupt shell cleanup or other registrations.
export function notifyPanelListener(listener: () => void) {
  try { listener(); }
  catch (error) { console.error('[web-review-kit] Custom panel listener failed', error); }
}

/** Metadata only. The target React tree owns panel contents and editor state. */
export interface ReviewCustomPanelDefinition {
  id: string;
  label: string;
  icon?: { viewBox: string; paths: readonly string[] };
}

export type ReviewCustomPanelSnapshot = Readonly<
  | { status: 'waiting'; container: null; visible: false }
  | { status: 'ready'; container: HTMLElement; visible: boolean }
  | { status: 'unavailable'; container: null; visible: false;
      reason: 'not-target' | 'cross-origin' | 'disabled' | 'incompatible' }
  | { status: 'error'; container: null; visible: false;
      reason: 'invalid-definition' | 'duplicate-id' }
  | { status: 'disposed'; container: null; visible: false }
>;

export interface ReviewCustomPanelConnection {
  getSnapshot(): ReviewCustomPanelSnapshot;
  subscribe(listener: () => void): () => void;
  open(): void;
  close(): void;
  dispose(): void;
}

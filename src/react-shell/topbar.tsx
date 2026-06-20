import {
  Image as ImageIcon,
  LayoutGrid as LayoutGridIcon,
  Map as MapIcon,
  Maximize2 as Maximize2Icon,
  Monitor as MonitorIcon,
  RectangleHorizontal as TabletIcon,
  Ruler as RulerIcon,
  Settings as SettingsIcon,
  Smartphone as SmartphoneIcon,
  SquareMousePointer as SquareMousePointerIcon,
} from 'lucide-react';
import type { ReviewItemScope } from '../index';
import { FIGMA_OVERLAY_UNAVAILABLE_MESSAGE } from './constants';
import type {
  ReviewShellViewportPreset,
  TargetOverlayKey,
  TargetOverlayState,
} from './types';
import { getViewportPresetKind } from './viewport';

interface ReviewTopbarProps {
  draftTarget: string;
  copyLabel: string;
  viewportPresets: ReviewShellViewportPreset[];
  size: ReviewShellViewportPreset;
  presetScopeCounts: ReadonlyMap<ReviewItemScope, number>;
  isRulerAvailable: boolean;
  isRulerVisible: boolean;
  targetOverlayState: TargetOverlayState;
  isFigmaOverlayAvailable: boolean;
  onDraftTargetChange: (value: string) => void;
  onApplyTarget: () => void;
  onOpenSitemap: () => void;
  onCopyCurrentUrl: () => void;
  onSizeChange: (preset: ReviewShellViewportPreset) => void;
  onToggleRuler: () => void;
  onToggleTargetOverlay: (key: TargetOverlayKey) => void;
  onOpenSettings: () => void;
}

const ReviewScopeIcon = ({ scope }: { scope: ReviewItemScope }) => {
  if (scope === 'mobile') return <SmartphoneIcon aria-hidden="true" />;
  if (scope === 'tablet') return <TabletIcon aria-hidden="true" />;
  if (scope === 'wide') return <Maximize2Icon aria-hidden="true" />;
  if (scope === 'dom') return <SquareMousePointerIcon aria-hidden="true" />;
  return <MonitorIcon aria-hidden="true" />;
};

const ViewportPresetIcon = ({
  preset
}: {
  preset: ReviewShellViewportPreset;
}) => {
  return <ReviewScopeIcon scope={getViewportPresetKind(preset)} />;
};

export const ReviewTopbar = ({
  draftTarget,
  copyLabel,
  viewportPresets,
  size,
  presetScopeCounts,
  isRulerAvailable,
  isRulerVisible,
  targetOverlayState,
  isFigmaOverlayAvailable,
  onDraftTargetChange,
  onApplyTarget,
  onOpenSitemap,
  onCopyCurrentUrl,
  onSizeChange,
  onToggleRuler,
  onToggleTargetOverlay,
  onOpenSettings,
}: ReviewTopbarProps) => {
  return (
    <header className="df-review-topbar">
      <form
        className="df-review-address"
        onSubmit={(event) => {
          event.preventDefault();
          onApplyTarget();
        }}
      >
        <button
          aria-label="Open sitemap"
          className="df-review-sitemap-button"
          type="button"
          onClick={onOpenSitemap}
        >
          <MapIcon aria-hidden="true" />
        </button>
        <input
          aria-label="Path"
          value={draftTarget}
          onChange={(event) => onDraftTargetChange(event.target.value)}
        />
        <button type="submit">Load</button>
        <button type="button" onClick={onCopyCurrentUrl}>
          {copyLabel}
        </button>
      </form>

      <div className="df-review-tools">
        <div className="df-review-tool-controls">
          <div className="df-review-presets" aria-label="Viewport presets">
            {viewportPresets.map((preset) => (
              <button
                key={preset.label}
                className={preset.label === size.label ? 'is-active' : ''}
                type="button"
                onClick={() => onSizeChange(preset)}
              >
                <ViewportPresetIcon preset={preset} />
                <span className="df-review-preset-copy">
                  <strong>{preset.label}</strong>
                </span>
                <span className="df-review-preset-count">
                  {presetScopeCounts.get(getViewportPresetKind(preset)) ?? 0}
                </span>
              </button>
            ))}
          </div>

          <span className="df-review-tool-divider" aria-hidden="true">
            |
          </span>

          <span className="df-review-active-size">
            {size.width}x{size.height}
          </span>
        </div>

        <div className="df-review-overlays" aria-label="Target overlays">
          {isRulerAvailable && (
            <button
              aria-label="Toggle ruler"
              className={`df-review-overlay-button is-ruler${
                isRulerVisible ? ' is-active' : ''
              }`}
              type="button"
              onClick={onToggleRuler}
            >
              <RulerIcon aria-hidden="true" />
            </button>
          )}
          <button
            aria-label="Toggle grid overlay"
            className={`df-review-overlay-button is-grid${
              targetOverlayState.grid ? ' is-active' : ''
            }`}
            type="button"
            onClick={() => onToggleTargetOverlay('grid')}
          >
            <LayoutGridIcon aria-hidden="true" />
          </button>
          <button
            aria-disabled={!isFigmaOverlayAvailable}
            aria-label={
              isFigmaOverlayAvailable
                ? 'Toggle Figma overlay'
                : FIGMA_OVERLAY_UNAVAILABLE_MESSAGE
            }
            className={`df-review-overlay-button is-figma${
              targetOverlayState.figma ? ' is-active' : ''
            }${isFigmaOverlayAvailable ? '' : ' is-disabled'}`}
            type="button"
            onClick={() => onToggleTargetOverlay('figma')}
          >
            <ImageIcon aria-hidden="true" />
          </button>
          <span className="df-review-tool-divider" aria-hidden="true">
            |
          </span>
          <button
            aria-label="Open settings"
            className="df-review-overlay-button is-settings"
            type="button"
            onClick={onOpenSettings}
          >
            <SettingsIcon aria-hidden="true" />
          </button>
        </div>
      </div>
    </header>
  );
};

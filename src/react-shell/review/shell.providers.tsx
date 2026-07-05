import type { ReactNode } from 'react';
import {
  ReviewFigmaImagesProvider,
  type ReviewFigmaImagesState,
} from '../figma/images.context';
import {
  ReviewPresenceProvider,
  type ReviewPresenceState,
} from '../presence/presence.context';
import {
  ReviewFigmaOverlayProvider,
  type ReviewFigmaOverlayState,
} from '../store/figma.overlay.context';
import {
  ReviewRulerProvider,
  type ReviewRulerState,
} from '../store/ruler.context';
import {
  ReviewShellActionsProvider,
  type ReviewShellActions,
} from '../store/shell.actions.context';
import type { ReviewSettingsController } from '../hooks/use.review.settings';
import type { ReviewSourceInspectorController } from '../hooks/use.review.source.inspector';
import { ReviewSettingsProvider } from './settings.context';
import { ReviewSourceInspectorProvider } from './source.inspector.context';

export interface ReviewShellProviderValues {
  actions: ReviewShellActions;
  figmaImages: ReviewFigmaImagesState;
  figmaOverlay: ReviewFigmaOverlayState;
  presence: ReviewPresenceState;
  ruler: ReviewRulerState;
  settings: ReviewSettingsController;
  sourceInspector: ReviewSourceInspectorController;
}

interface ReviewShellProvidersProps extends ReviewShellProviderValues {
  children: ReactNode;
}

export const ReviewShellProviders = ({
  actions,
  children,
  figmaImages,
  figmaOverlay,
  presence,
  ruler,
  settings,
  sourceInspector,
}: ReviewShellProvidersProps) => (
  <ReviewShellActionsProvider value={actions}>
    <ReviewRulerProvider value={ruler}>
      <ReviewFigmaImagesProvider value={figmaImages}>
        <ReviewSourceInspectorProvider value={sourceInspector}>
          <ReviewSettingsProvider value={settings}>
            <ReviewPresenceProvider value={presence}>
              <ReviewFigmaOverlayProvider value={figmaOverlay}>
                {children}
              </ReviewFigmaOverlayProvider>
            </ReviewPresenceProvider>
          </ReviewSettingsProvider>
        </ReviewSourceInspectorProvider>
      </ReviewFigmaImagesProvider>
    </ReviewRulerProvider>
  </ReviewShellActionsProvider>
);

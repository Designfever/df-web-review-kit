// 우측 사이드 레일의 presentational UI.
import type { ReactNode } from 'react';
import { trackReviewEvent } from '../../analytics';
import {
  ListChecks as QaListIcon,
  Lightbulb as ImprovementIcon,
  Power as LogOutIcon,
  Network as ComponentTreeIcon,
  SquareMousePointer as InspectorIcon,
} from 'lucide-react';
import type { ReviewPresenceUser } from '../types';
import { FigmaRailIcon } from '../figma/figma-mark-icon';
import { PresenceOverlay } from '../presence/overlay';
import { DfLogoIcon } from './df.logo';

export const ReviewSideRail = ({
  customButtons,
  currentPagePresenceUsers,
  isFigmaImageManagementEnabled,
  isFigmaImagesPanelVisible,
  isQaPanelVisible,
  isImprovementEnabled,
  isImprovementsPanelVisible,
  isDesignInspectorVisible,
  isSourceTreePanelVisible,
  presenceSessionId,
  onOpenAbout,
  onLogout,
  onToggleFigmaImagesPanel,
  onToggleQaPanel,
  onToggleImprovementsPanel,
  onToggleDesignInspector,
  onToggleSourceTreePanel,
}: {
  customButtons?: ReactNode;
  currentPagePresenceUsers: ReviewPresenceUser[];
  isFigmaImageManagementEnabled: boolean;
  isFigmaImagesPanelVisible: boolean;
  isQaPanelVisible: boolean;
  isImprovementEnabled: boolean;
  isImprovementsPanelVisible: boolean;
  isDesignInspectorVisible: boolean;
  isSourceTreePanelVisible: boolean;
  presenceSessionId: string;
  onOpenAbout: () => void;
  onLogout?: () => void | Promise<void>;
  onToggleFigmaImagesPanel: () => void;
  onToggleQaPanel: () => void;
  onToggleImprovementsPanel: () => void;
  onToggleDesignInspector: () => void;
  onToggleSourceTreePanel: () => void;
}) => {
  const trackClick = (
    panelId: string,
    controlId: string,
    action: string,
    handler: () => void | Promise<void>
  ) => {
    trackReviewEvent('click', { panelId, controlId, action });
    void handler();
  };

  return (
    <div className="df-review-side-rail">
      <div className="df-review-rail-group" role="group" aria-label="Development">
        <button
          aria-controls="df-review-design-inspector"
          aria-label={isDesignInspectorVisible ? 'Hide design inspector' : 'Show design inspector'}
          aria-pressed={isDesignInspectorVisible}
          className={`df-review-side-toggle${isDesignInspectorVisible ? ' is-active' : ''}`}
          data-review-tooltip="Design inspector (Shift+1)"
          data-review-tooltip-placement="left"
          title="Design inspector (Shift+1)"
          type="button"
          onClick={() =>
            trackClick(
              'design-inspector',
              'panel-toggle',
              'toggle-panel',
              onToggleDesignInspector
            )
          }
        >
          <InspectorIcon aria-hidden="true" />
        </button>
        {isFigmaImageManagementEnabled && (
          <button
            aria-label={
              isFigmaImagesPanelVisible
                ? 'Hide Figma images'
                : 'Show Figma images'
            }
            aria-pressed={isFigmaImagesPanelVisible}
            className={`df-review-side-toggle${
              isFigmaImagesPanelVisible ? ' is-active' : ''
            }`}
            data-review-tooltip="Figma Images (Shift+2)"
            data-review-tooltip-placement="left"
            type="button"
            onClick={() =>
              trackClick(
                'figma-images',
                'panel-toggle',
                'toggle-panel',
                onToggleFigmaImagesPanel
              )
            }
            title="Figma Images (Shift+2)"
          >
            <span aria-hidden="true">
              <FigmaRailIcon />
            </span>
          </button>
        )}
        <button
          aria-controls="df-review-section-outline"
          aria-label={
            isSourceTreePanelVisible
              ? 'Hide component list'
              : 'Show component list'
          }
          aria-pressed={isSourceTreePanelVisible}
          className={`df-review-side-toggle${
            isSourceTreePanelVisible ? ' is-active' : ''
          }`}
          data-review-tooltip="Component List (Shift+4)"
          data-review-tooltip-placement="left"
          type="button"
          onClick={() =>
            trackClick(
              'source',
              'panel-toggle',
              'toggle-panel',
              onToggleSourceTreePanel
            )
          }
          title="Component List (Shift+4)"
        >
          <span aria-hidden="true">
            <ComponentTreeIcon />
          </span>
        </button>
      </div>
      <div className="df-review-rail-group" role="group" aria-label="Issues">
        <button
          aria-label={isQaPanelVisible ? 'Hide QA list' : 'Show QA list'}
          aria-pressed={isQaPanelVisible}
          className={`df-review-side-toggle${
            isQaPanelVisible ? ' is-active' : ''
          }`}
          data-review-tooltip="QA (Shift+3)"
          data-review-tooltip-placement="left"
          type="button"
          onClick={() =>
            trackClick('qa', 'panel-toggle', 'toggle-panel', onToggleQaPanel)
          }
          title="QA (Shift+3)"
        >
          <span aria-hidden="true">
            <QaListIcon />
          </span>
        </button>
      </div>
      {customButtons}
      <div className="df-review-side-actions">
        {isImprovementEnabled && (
          <button
            aria-controls="df-review-improvements-panel"
            aria-label={
              isImprovementsPanelVisible
                ? '개선사항 등록 닫기'
                : '개선사항 등록 열기'
            }
            aria-haspopup="dialog"
            aria-expanded={isImprovementsPanelVisible}
            className={`df-review-side-toggle${
              isImprovementsPanelVisible ? ' is-active' : ''
            }`}
            data-review-tooltip="개선사항"
            data-review-tooltip-placement="left"
            type="button"
            onClick={() =>
              trackClick(
                'improvements',
                'open-improvements',
                'open-modal',
                onToggleImprovementsPanel
              )
            }
            title="개선사항"
          >
            <span aria-hidden="true">
              <ImprovementIcon />
            </span>
          </button>
        )}

        {onLogout && (
          <button
            aria-label="Log out"
            className="df-review-side-toggle"
            data-review-tooltip="Log out"
            data-review-tooltip-placement="left"
            type="button"
            onClick={() =>
              trackClick('shell', 'logout', 'logout', onLogout)
            }
            title="Log out"
          >
            <span aria-hidden="true">
              <LogOutIcon />
            </span>
          </button>
        )}
        {currentPagePresenceUsers.length > 0 && (
          <PresenceOverlay
            presenceSessionId={presenceSessionId}
            users={currentPagePresenceUsers}
          />
        )}
        <span className="df-review-side-divider" aria-hidden="true" />
        <button
          aria-label="Open about"
          className="df-review-side-toggle"
          data-review-tooltip="About"
          data-review-tooltip-placement="left"
          type="button"
          onClick={() =>
            trackClick('shell', 'about', 'open-about', onOpenAbout)
          }
          title="About"
        >
          <span aria-hidden="true">
            <DfLogoIcon />
          </span>
        </button>
      </div>
    </div>
  );
};

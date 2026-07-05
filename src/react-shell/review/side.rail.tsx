// 우측 사이드 레일의 presentational UI.
import {
  Bot as BotIcon,
  ListChecks as QaListIcon,
  Network as ComponentTreeIcon,
  Settings as SettingsIcon,
} from 'lucide-react';
import type { ReviewPresenceUser } from '../types';
import { FigmaRailIcon } from '../figma/figma-mark-icon';
import { PresenceOverlay } from '../presence/overlay';
import { DfLogoIcon } from './df.logo';

export const ReviewSideRail = ({
  currentPagePresenceUsers,
  isFigmaImageManagementEnabled,
  isFigmaImagesPanelVisible,
  isQaPanelVisible,
  isSourceInspectorEnabled,
  isSourceTreePanelVisible,
  presenceSessionId,
  onOpenAbout,
  onOpenInitialPrompt,
  onOpenSettings,
  onToggleFigmaImagesPanel,
  onToggleQaPanel,
  onToggleSourceTreePanel,
}: {
  currentPagePresenceUsers: ReviewPresenceUser[];
  isFigmaImageManagementEnabled: boolean;
  isFigmaImagesPanelVisible: boolean;
  isQaPanelVisible: boolean;
  isSourceInspectorEnabled: boolean;
  isSourceTreePanelVisible: boolean;
  presenceSessionId: string;
  onOpenAbout: () => void;
  onOpenInitialPrompt: () => void;
  onOpenSettings: () => void;
  onToggleFigmaImagesPanel: () => void;
  onToggleQaPanel: () => void;
  onToggleSourceTreePanel: () => void;
}) => {
  return (
    <div className="df-review-side-rail">
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
          data-review-tooltip="Figma Images"
          data-review-tooltip-placement="left"
          type="button"
          onClick={onToggleFigmaImagesPanel}
          title="Figma Images"
        >
          <span aria-hidden="true">
            <FigmaRailIcon />
          </span>
        </button>
      )}
      <button
        aria-label={isQaPanelVisible ? 'Hide QA list' : 'Show QA list'}
        aria-pressed={isQaPanelVisible}
        className={`df-review-side-toggle${
          isQaPanelVisible ? ' is-active' : ''
        }`}
        data-review-tooltip="QA"
        data-review-tooltip-placement="left"
        type="button"
        onClick={onToggleQaPanel}
        title="QA"
      >
        <span aria-hidden="true">
          <QaListIcon />
        </span>
      </button>
      {isSourceInspectorEnabled && (
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
          data-review-tooltip="Component List"
          data-review-tooltip-placement="left"
          type="button"
          onClick={onToggleSourceTreePanel}
          title="Component List"
        >
          <span aria-hidden="true">
            <ComponentTreeIcon />
          </span>
        </button>
      )}
      <div className="df-review-side-actions">
        <button
          aria-label="Open initial prompt"
          className="df-review-side-toggle"
          data-review-tooltip="Initial prompt"
          data-review-tooltip-placement="left"
          type="button"
          onClick={onOpenInitialPrompt}
          title="Initial prompt"
        >
          <span aria-hidden="true">
            <BotIcon />
          </span>
        </button>
        <button
          aria-label="Open settings"
          className="df-review-side-toggle"
          data-review-tooltip="Settings"
          data-review-tooltip-placement="left"
          type="button"
          onClick={onOpenSettings}
          title="Settings"
        >
          <span aria-hidden="true">
            <SettingsIcon />
          </span>
        </button>
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
          onClick={onOpenAbout}
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

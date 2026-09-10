// 우측 사이드 레일의 presentational UI.
import type { ReactNode } from 'react';
import {
  Bot as BotIcon,
  ListChecks as QaListIcon,
  LogOut as LogOutIcon,
  Network as ComponentTreeIcon,
  SquareMousePointer as InspectorIcon,
  Settings as SettingsIcon,
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
  isDesignInspectorVisible,
  isSourceTreePanelVisible,
  presenceSessionId,
  onOpenAbout,
  onOpenInitialPrompt,
  onLogout,
  onOpenSettings,
  onToggleFigmaImagesPanel,
  onToggleQaPanel,
  onToggleDesignInspector,
  onToggleSourceTreePanel,
}: {
  customButtons?: ReactNode;
  currentPagePresenceUsers: ReviewPresenceUser[];
  isFigmaImageManagementEnabled: boolean;
  isFigmaImagesPanelVisible: boolean;
  isQaPanelVisible: boolean;
  isDesignInspectorVisible: boolean;
  isSourceTreePanelVisible: boolean;
  presenceSessionId: string;
  onOpenAbout: () => void;
  onOpenInitialPrompt: () => void;
  onLogout?: () => void | Promise<void>;
  onOpenSettings: () => void;
  onToggleFigmaImagesPanel: () => void;
  onToggleQaPanel: () => void;
  onToggleDesignInspector: () => void;
  onToggleSourceTreePanel: () => void;
}) => {
  return (
    <div className="df-review-side-rail">
      <button
        aria-controls="df-review-design-inspector"
        aria-label={isDesignInspectorVisible ? 'Hide design inspector' : 'Show design inspector'}
        aria-pressed={isDesignInspectorVisible}
        className={`df-review-side-toggle${isDesignInspectorVisible ? ' is-active' : ''}`}
        data-review-tooltip="Design inspector (Shift+1)"
        data-review-tooltip-placement="left"
        title="Design inspector (Shift+1)"
        type="button"
        onClick={onToggleDesignInspector}
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
          onClick={onToggleFigmaImagesPanel}
          title="Figma Images (Shift+2)"
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
        data-review-tooltip="QA (Shift+3)"
        data-review-tooltip-placement="left"
        type="button"
        onClick={onToggleQaPanel}
        title="QA (Shift+3)"
      >
        <span aria-hidden="true">
          <QaListIcon />
        </span>
      </button>
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
        onClick={onToggleSourceTreePanel}
        title="Component List (Shift+4)"
      >
        <span aria-hidden="true">
          <ComponentTreeIcon />
        </span>
      </button>
      {customButtons}
      <div className="df-review-side-actions">
        {onLogout && (
          <button
            aria-label="Log out"
            className="df-review-side-toggle"
            data-review-tooltip="Log out"
            data-review-tooltip-placement="left"
            type="button"
            onClick={() => void onLogout()}
            title="Log out"
          >
            <span aria-hidden="true">
              <LogOutIcon />
            </span>
          </button>
        )}
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

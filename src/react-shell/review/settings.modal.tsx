import {
  CircleHelp as CircleHelpIcon,
  Eye as EyeIcon,
  EyeOff as EyeOffIcon,
} from 'lucide-react';
import {
  DEFAULT_REVIEW_THEME,
  FIGMA_TOKEN_GUIDE_ID,
  FIGMA_TOKEN_STORAGE_KEY,
  REVIEW_THEME_OPTIONS,
  REVIEW_THEME_STORAGE_KEY,
  REVIEW_USER_ID_STORAGE_KEY,
} from '../constants';
import { normalizeReviewTheme } from '../settings';
import type { ReviewShellTheme } from '../types';

interface ReviewSettingsModalProps {
  figmaTokenDraft: string;
  reviewUserIdDraft: string;
  reviewThemeDraft: ReviewShellTheme;
  figmaSettingsStatus: string;
  isFigmaTokenVisible: boolean;
  isFigmaTokenGuideOpen: boolean;
  onClose: () => void;
  onFigmaTokenDraftChange: (value: string) => void;
  onReviewUserIdDraftChange: (value: string) => void;
  onReviewThemeDraftChange: (value: ReviewShellTheme) => void;
  onClearStatus: () => void;
  onToggleFigmaTokenVisible: () => void;
  onToggleFigmaTokenGuide: () => void;
  onSave: (
    figmaToken: string,
    reviewUserId: string,
    reviewTheme: ReviewShellTheme
  ) => void;
}

export const ReviewSettingsModal = ({
  figmaTokenDraft,
  reviewUserIdDraft,
  reviewThemeDraft,
  figmaSettingsStatus,
  isFigmaTokenVisible,
  isFigmaTokenGuideOpen,
  onClose,
  onFigmaTokenDraftChange,
  onReviewUserIdDraftChange,
  onReviewThemeDraftChange,
  onClearStatus,
  onToggleFigmaTokenVisible,
  onToggleFigmaTokenGuide,
  onSave,
}: ReviewSettingsModalProps) => {
  return (
    <div
      aria-label="Review settings"
      aria-modal="true"
      className="df-review-settings-modal"
      role="dialog"
    >
      <button
        aria-label="Close settings"
        className="df-review-settings-backdrop"
        type="button"
        onClick={onClose}
      />
      <form
        className="df-review-settings-dialog"
        onSubmit={(event) => {
          event.preventDefault();
          onSave(figmaTokenDraft, reviewUserIdDraft, reviewThemeDraft);
        }}
      >
        <div className="df-review-settings-header">
          <div className="df-review-settings-title">
            <strong>Settings</strong>
            <span>
              {FIGMA_TOKEN_STORAGE_KEY} / {REVIEW_USER_ID_STORAGE_KEY} /{' '}
              {REVIEW_THEME_STORAGE_KEY}
            </span>
          </div>
          <div className="df-review-settings-header-actions">
            <select
              aria-label="Review theme"
              className="df-review-settings-theme-select"
              value={reviewThemeDraft}
              onChange={(event) => {
                onReviewThemeDraftChange(normalizeReviewTheme(event.target.value));
                onClearStatus();
              }}
            >
              {REVIEW_THEME_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <button aria-label="Close settings" type="button" onClick={onClose}>
              x
            </button>
          </div>
        </div>
        <div className="df-review-settings-body">
          <div className="df-review-settings-field">
            <div className="df-review-settings-label-row">
              <label htmlFor="df-review-figma-token">Figma token</label>
              <button
                aria-controls={FIGMA_TOKEN_GUIDE_ID}
                aria-expanded={isFigmaTokenGuideOpen}
                aria-label="Show Figma token guide"
                className={`df-review-settings-help-button${
                  isFigmaTokenGuideOpen ? ' is-active' : ''
                }`}
                type="button"
                onClick={onToggleFigmaTokenGuide}
              >
                <CircleHelpIcon aria-hidden="true" />
              </button>
            </div>
            <div className="df-review-settings-token-input">
              <input
                id="df-review-figma-token"
                aria-label="Figma token"
                aria-describedby={
                  isFigmaTokenGuideOpen ? FIGMA_TOKEN_GUIDE_ID : undefined
                }
                autoCapitalize="off"
                autoComplete="off"
                autoCorrect="off"
                className={isFigmaTokenVisible ? undefined : 'is-token-masked'}
                data-1p-ignore="true"
                data-lpignore="true"
                inputMode="text"
                name="df-review-figma-access-key"
                spellCheck={false}
                type="text"
                value={figmaTokenDraft}
                onChange={(event) => {
                  onFigmaTokenDraftChange(event.target.value);
                  onClearStatus();
                }}
              />
              <button
                aria-label={
                  isFigmaTokenVisible
                    ? 'Hide Figma token'
                    : 'Show Figma token'
                }
                className="df-review-settings-token-toggle"
                type="button"
                onClick={onToggleFigmaTokenVisible}
              >
                {isFigmaTokenVisible ? (
                  <EyeOffIcon aria-hidden="true" />
                ) : (
                  <EyeIcon aria-hidden="true" />
                )}
              </button>
            </div>
            {isFigmaTokenGuideOpen && (
              <div
                className="df-review-settings-guide"
                id={FIGMA_TOKEN_GUIDE_ID}
              >
                <ol>
                  <li>Figma file browser에서 account menu를 열고 Settings로 이동</li>
                  <li>Security 탭의 Personal access tokens로 이동</li>
                  <li>Generate new token에서 이름과 scope를 정한 뒤 생성</li>
                  <li>생성된 token을 복사해서 여기에 붙여넣기</li>
                </ol>
              </div>
            )}
          </div>
          <label className="df-review-settings-field">
            <span>User ID</span>
            <div className="df-review-settings-text-input">
              <input
                aria-label="Review user ID"
                autoComplete="off"
                spellCheck={false}
                type="text"
                value={reviewUserIdDraft}
                onChange={(event) => {
                  onReviewUserIdDraftChange(event.target.value);
                  onClearStatus();
                }}
              />
            </div>
          </label>

          {figmaSettingsStatus && (
            <p className="df-review-settings-status">{figmaSettingsStatus}</p>
          )}
          <div className="df-review-settings-actions">
            <button
              type="button"
              onClick={() => onSave('', '', DEFAULT_REVIEW_THEME)}
            >
              Clear
            </button>
            <span />
            <button type="button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit">Save</button>
          </div>
        </div>
      </form>
    </div>
  );
};

import {
  CircleHelp as CircleHelpIcon,
  Eye as EyeIcon,
  EyeOff as EyeOffIcon,
  Monitor as MonitorIcon,
  Moon as MoonIcon,
  Sun as SunIcon,
  X as CloseIcon,
} from 'lucide-react';
import {
  DEFAULT_REVIEW_THEME,
  DEFAULT_REVIEW_TOOLTIPS_ENABLED,
  FIGMA_TOKEN_GUIDE_ID,
  REVIEW_THEME_OPTIONS,
} from '../constants';
import { type ReviewCaptureMethod, normalizeReviewTheme } from '../settings';
import type { ReviewShellTheme } from '../types';

const getReviewThemeIcon = (theme: ReviewShellTheme) => {
  if (theme === 'light') return SunIcon;
  if (theme === 'system') return MonitorIcon;
  return MoonIcon;
};

interface ReviewSettingsModalProps {
  embedded?: boolean;
  captureMethodDraft: ReviewCaptureMethod;
  onCaptureMethodDraftChange: (method: ReviewCaptureMethod) => void;
  figmaTokenDraft: string;
  reviewUserIdDraft: string;
  reviewThemeDraft: ReviewShellTheme;
  areTooltipsEnabledDraft: boolean;
  figmaSettingsStatus: string;
  isFigmaTokenVisible: boolean;
  isFigmaTokenGuideOpen: boolean;
  onClose: () => void;
  onFigmaTokenDraftChange: (value: string) => void;
  onReviewUserIdDraftChange: (value: string) => void;
  onReviewThemeDraftChange: (value: ReviewShellTheme) => void;
  onTooltipsEnabledDraftChange: (value: boolean) => void;
  onClearStatus: () => void;
  onToggleFigmaTokenVisible: () => void;
  onToggleFigmaTokenGuide: () => void;
  onSave: (
    figmaToken: string,
    reviewUserId: string,
    reviewTheme: ReviewShellTheme,
    tooltipsEnabled: boolean,
    captureMethod?: ReviewCaptureMethod
  ) => void;
}

export const ReviewSettingsModal = ({
  embedded = false,
  captureMethodDraft,
  onCaptureMethodDraftChange,
  figmaTokenDraft,
  reviewUserIdDraft,
  reviewThemeDraft,
  areTooltipsEnabledDraft,
  figmaSettingsStatus,
  isFigmaTokenVisible,
  isFigmaTokenGuideOpen,
  onClose,
  onFigmaTokenDraftChange,
  onReviewUserIdDraftChange,
  onReviewThemeDraftChange,
  onTooltipsEnabledDraftChange,
  onClearStatus,
  onToggleFigmaTokenVisible,
  onToggleFigmaTokenGuide,
  onSave,
}: ReviewSettingsModalProps) => {
  const content = (
      <form
        className={embedded ? "df-review-settings-embedded" : "df-review-settings-dialog df-review-standard-dialog"}
        onSubmit={(event) => {
          event.preventDefault();
          onSave(
            figmaTokenDraft,
            reviewUserIdDraft,
            reviewThemeDraft,
            areTooltipsEnabledDraft,
            captureMethodDraft
          );
        }}
      >
        {!embedded && <div className="df-review-settings-header">
          <div className="df-review-settings-title">
            <strong>Settings</strong>
            <span>
              Capture, appearance, and review preferences.
            </span>
          </div>
          <div className="df-review-settings-header-actions">
            <button aria-label="Close settings" type="button" onClick={onClose}>
              <CloseIcon aria-hidden="true" />
            </button>
          </div>
        </div>
        }
        <div className="df-review-settings-body">
          <div className="df-review-settings-row">
            <span>Capture</span>
            <div className="df-review-settings-theme-options">
              {(['browser', 'html2canvas'] as const).map((method) => (
                <button key={method} type="button"
                  aria-pressed={captureMethodDraft === method}
                  className={`df-review-settings-theme-option${captureMethodDraft === method ? ' is-active' : ''}`}
                  onClick={() => { onCaptureMethodDraftChange(method); onClearStatus(); }}>
                  {method === 'browser' ? 'Browser (기본)' : 'html2canvas'}
                </button>
              ))}
            </div>
          </div>
          <p className="df-review-capture-help">브라우저 캡처는 Element 또는 Area 버튼을 누르면 공유를 요청합니다. 공유 중에는 다시 요청하지 않습니다.</p>
          <div className="df-review-settings-row">
            <span>Theme</span>
            <div className="df-review-settings-theme-options">
              {REVIEW_THEME_OPTIONS.map((option) => {
                const ThemeIcon = getReviewThemeIcon(option.value);

                return (
                  <button
                    aria-pressed={reviewThemeDraft === option.value}
                    className={`df-review-settings-theme-option${
                      reviewThemeDraft === option.value ? ' is-active' : ''
                    }`}
                    key={option.value}
                    type="button"
                    onClick={() => {
                      onReviewThemeDraftChange(
                        normalizeReviewTheme(option.value)
                      );
                      onClearStatus();
                    }}
                  >
                    <ThemeIcon aria-hidden="true" />
                    <span>{option.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
          <div className="df-review-settings-row">
            <span>Tooltips</span>
            <label className="df-review-settings-toggle">
              <input
                aria-label="Show tooltips"
                checked={areTooltipsEnabledDraft}
                type="checkbox"
                onChange={(event) => {
                  onTooltipsEnabledDraftChange(event.target.checked);
                  onClearStatus();
                }}
              />
              <span>Show</span>
            </label>
          </div>
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
              onClick={() =>
                onSave(
                  '',
                  '',
                  DEFAULT_REVIEW_THEME,
                  DEFAULT_REVIEW_TOOLTIPS_ENABLED
                )
              }
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
  );
  if (embedded) return content;
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
      {content}

    </div>
  );
};

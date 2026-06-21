import type React from 'react';
import {
  CircleHelp as CircleHelpIcon,
  Copy as CopyIcon,
  Eye as EyeIcon,
  EyeOff as EyeOffIcon,
} from 'lucide-react';
import type { NumberedReviewItem } from '../index';
import {
  DEFAULT_REVIEW_THEME,
  FIGMA_TOKEN_GUIDE_ID,
  FIGMA_TOKEN_STORAGE_KEY,
  REVIEW_THEME_OPTIONS,
  REVIEW_THEME_STORAGE_KEY,
  REVIEW_USER_ID_STORAGE_KEY,
} from './constants';
import { getItemTitle, getPromptLengthLabel } from './prompt';
import { normalizeReviewTheme } from './settings';
import type {
  ReviewPresenceUser,
  ReviewPromptTab,
  ReviewShellPage,
  ReviewShellTheme,
} from './types';

type SitemapQaCount = {
  local: number;
  remote: number;
};

interface SitemapModalProps {
  pages: ReviewShellPage[];
  activeRoute: string;
  pageQaCounts: ReadonlyMap<string, SitemapQaCount>;
  pagePresenceUsers: ReadonlyMap<string, ReviewPresenceUser[]>;
  getPageTarget: (href: string) => string;
  onClose: () => void;
  onSelectPage: (href: string) => void;
}

const EMPTY_SITEMAP_QA_COUNT: SitemapQaCount = {
  local: 0,
  remote: 0,
};

export const SitemapModal = ({
  pages,
  activeRoute,
  pageQaCounts,
  pagePresenceUsers,
  getPageTarget,
  onClose,
  onSelectPage,
}: SitemapModalProps) => {
  return (
    <div
      aria-label="Sitemap"
      aria-modal="true"
      className="df-review-sitemap-modal"
      role="dialog"
    >
      <button
        aria-label="Close sitemap"
        className="df-review-sitemap-backdrop"
        type="button"
        onClick={onClose}
      />
      <div className="df-review-sitemap-dialog">
        <div className="df-review-sitemap-header">
          <div>
            <strong>Sitemap</strong>
            <span>{pages.length} pages</span>
          </div>
          <button aria-label="Close sitemap" type="button" onClick={onClose}>
            x
          </button>
        </div>
        <div className="df-review-sitemap-list">
          <div className="df-review-sitemap-table-head" aria-hidden="true">
            <span>Page</span>
            <span>Local</span>
            <span>Remote</span>
            <span>Online</span>
          </div>
          {pages.map((page) => {
            const pageTarget = getPageTarget(page.href);
            const qaCount = pageQaCounts.get(pageTarget) ?? EMPTY_SITEMAP_QA_COUNT;
            const pageUsers = pagePresenceUsers.get(pageTarget) ?? [];

            return (
              <button
                key={page.href}
                aria-label={`${page.href} / local ${qaCount.local} QA / remote ${qaCount.remote} QA / ${pageUsers.length} online`}
                className={pageTarget === activeRoute ? 'is-active' : ''}
                type="button"
                onClick={() => onSelectPage(page.href)}
              >
                <span className="df-review-sitemap-path">{page.href}</span>
                <span className="df-review-sitemap-cell is-local">
                  {qaCount.local}
                </span>
                <span className="df-review-sitemap-cell is-remote">
                  {qaCount.remote}
                </span>
                <span className="df-review-sitemap-cell is-online">
                  {pageUsers.length}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

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

interface PromptModalProps {
  numberedItem?: NumberedReviewItem;
  promptTab: ReviewPromptTab;
  activeLabel: string;
  activeText: string;
  activeCopyKey: string;
  copiedPromptKey: string | null;
  onClose: () => void;
  onPromptTabChange: (tab: ReviewPromptTab) => void;
  onCopyPrompt: (text: string, key: string) => void;
}

export const PromptModal = ({
  numberedItem,
  promptTab,
  activeLabel,
  activeText,
  activeCopyKey,
  copiedPromptKey,
  onClose,
  onPromptTabChange,
  onCopyPrompt,
}: PromptModalProps) => {
  return (
    <div
      aria-label="Prompt"
      aria-modal="true"
      className="df-review-prompt-modal"
      role="dialog"
    >
      <button
        aria-label="Close prompt"
        className="df-review-prompt-backdrop"
        type="button"
        onClick={onClose}
      />
      <div className="df-review-prompt-dialog">
        <div className="df-review-prompt-header">
          <div>
            <strong>Prompt</strong>
            <span>
              {numberedItem
                ? `${numberedItem.displayLabel} / ${getItemTitle(numberedItem.item)}`
                : 'Initial prompt'}
            </span>
          </div>
          <button aria-label="Close prompt" type="button" onClick={onClose}>
            x
          </button>
        </div>
        <div className="df-review-prompt-body">
          <div className="df-review-prompt-tabs" role="tablist">
            <button
              aria-selected={promptTab === 'initial'}
              className={promptTab === 'initial' ? 'is-active' : ''}
              role="tab"
              type="button"
              onClick={() => onPromptTabChange('initial')}
            >
              Initial prompt
            </button>
            <button
              aria-selected={promptTab === 'item'}
              className={promptTab === 'item' ? 'is-active' : ''}
              disabled={!numberedItem}
              role="tab"
              type="button"
              onClick={() => onPromptTabChange('item')}
            >
              This QA prompt
            </button>
          </div>
          <section className="df-review-prompt-block" role="tabpanel">
            <div className="df-review-prompt-block-header">
              <div>
                <strong>{activeLabel}</strong>
                <span>{getPromptLengthLabel(activeText)}</span>
              </div>
              <button
                disabled={!activeText}
                type="button"
                onClick={() => onCopyPrompt(activeText, activeCopyKey)}
              >
                <CopyIcon aria-hidden="true" />
                {copiedPromptKey === activeCopyKey ? 'Copied' : 'Copy'}
              </button>
            </div>
            <textarea
              readOnly
              aria-label={activeLabel}
              value={activeText || `${activeLabel} is not configured.`}
            />
          </section>
        </div>
      </div>
    </div>
  );
};

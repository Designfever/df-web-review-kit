import React from 'react';
import {
  ChevronDown as ChevronDownIcon,
  Code2 as Code2Icon,
  CornerUpRight as UsageIcon,
  Database as DatabaseIcon,
  Image as ImageIcon,
  Search as SearchIcon,
  SquareDashed as SquareDashedIcon,
  SquareMousePointer as SquareMousePointerIcon,
  Type as TypeIcon,
  X as XIcon,
} from 'lucide-react';
import type { SectionOutlineEntry } from '../section.outline';
import type { StoredSourceTreeMetaVisibility } from '../settings';
import { getLiveSectionOutlineRect } from './shell.helpers';

type SourceTreeMetaVisibilityKey = keyof StoredSourceTreeMetaVisibility;

type SectionOutlinePanelProps = {
  isPanelVisible: boolean;
  isFiltering: boolean;
  filteredCount: number;
  totalCount: number;
  rootCount: number;
  filter: string;
  entries: SectionOutlineEntry[];
  collapsedIds: Set<string>;
  canWriteDom: boolean;
  isBoxMetaVisible: boolean;
  isFontMetaVisible: boolean;
  isMediaMetaVisible: boolean;
  isClassMetaVisible: boolean;
  onToggleMeta: (key: SourceTreeMetaVisibilityKey) => void;
  onFilterChange: (value: string) => void;
  onToggleEntry: (entryId: string) => void;
  onScrollToSection: (entry: SectionOutlineEntry) => void;
  onOpenData: (entry: SectionOutlineEntry) => void;
  onOpenSource: (entry: SectionOutlineEntry) => void;
  onOpenUsageSource: (entry: SectionOutlineEntry) => void;
  onStartDomReview: (entry: SectionOutlineEntry) => void;
  onHoverElement: (element: Element) => void;
  onClearHover: () => void;
};

export const SectionOutlinePanel = ({
  isPanelVisible,
  isFiltering,
  filteredCount,
  totalCount,
  rootCount,
  filter,
  entries,
  collapsedIds,
  canWriteDom,
  isBoxMetaVisible,
  isFontMetaVisible,
  isMediaMetaVisible,
  isClassMetaVisible,
  onToggleMeta,
  onFilterChange,
  onToggleEntry,
  onScrollToSection,
  onOpenData,
  onOpenSource,
  onOpenUsageSource,
  onStartDomReview,
  onHoverElement,
  onClearHover,
}: SectionOutlinePanelProps) => {
  const renderMeta = (entry: SectionOutlineEntry) => {
    const { metadata } = entry;
    const rows: React.ReactNode[] = [];
    const metaPaddingLeft = 29;
    const rect = getLiveSectionOutlineRect(entry);

    if (isBoxMetaVisible) {
      rows.push(
        <span className="df-review-section-outline-meta-row" key="box">
          <b>box</b>
          <code>
            top {rect.top} / left {rect.left} / width {rect.width} / height{' '}
            {rect.height}
          </code>
        </span>
      );
    }

    if (metadata.textValue) {
      rows.push(
        <span
          className="df-review-section-outline-meta-row is-text"
          key="text"
        >
          <b>text</b>
          <code>{metadata.textValue}</code>
        </span>
      );
    }

    if (isFontMetaVisible && metadata.fontLabel) {
      rows.push(
        <span className="df-review-section-outline-meta-row" key="font">
          <b>font</b>
          <code>{metadata.fontLabel}</code>
        </span>
      );
    }

    if (isMediaMetaVisible && metadata.mediaItems?.length) {
      metadata.mediaItems.forEach((mediaItem) => {
        const mediaKey = `${mediaItem.variant}:${mediaItem.type}:${mediaItem.url}`;
        const mediaLabel =
          mediaItem.variant === 'media' ? mediaItem.type : mediaItem.variant;
        rows.push(
          <span
            className="df-review-section-outline-meta-row is-media"
            key={mediaKey}
          >
            <b>{mediaLabel}</b>
            <a
              className="df-review-section-outline-media-link"
              href={mediaItem.url}
              rel="noopener noreferrer"
              target="_blank"
              title={`${mediaLabel} ${mediaItem.type}`}
            >
              <code>{mediaItem.url}</code>
            </a>
          </span>
        );
      });
    }

    if (isClassMetaVisible && metadata.classNames?.length) {
      rows.push(
        <span className="df-review-section-outline-meta-row is-class" key="class">
          <b>class</b>
          <span className="df-review-section-outline-class-tags">
            {metadata.classNames.map((className) => (
              <code key={className}>{className}</code>
            ))}
          </span>
        </span>
      );
    }

    if (metadata.usage) {
      const usagePosition = metadata.usage.positionLabel
        ? `:${metadata.usage.positionLabel}`
        : '';
      rows.push(
        <span
          className="df-review-section-outline-meta-row is-usage"
          key="usage"
        >
          <b>used in</b>
          <button
            className="df-review-section-outline-usage-link"
            type="button"
            title={`Open ${metadata.usage.label} usage`}
            onClick={() => onOpenUsageSource(entry)}
          >
            <code>
              {metadata.usage.label} · {metadata.usage.filePath}
              {usagePosition}
            </code>
          </button>
        </span>
      );
    }

    if (rows.length === 0) return null;

    return (
      <div
        className="df-review-section-outline-meta"
        style={{ paddingLeft: `${metaPaddingLeft}px` }}
      >
        {rows}
      </div>
    );
  };

  const renderEntry = (entry: SectionOutlineEntry): React.ReactNode => {
    const hasChildren = entry.children.length > 0;
    const isCollapsed = !isFiltering && collapsedIds.has(entry.id);
    const liveRect = getLiveSectionOutlineRect(entry);
    const isZeroArea = liveRect.width <= 0 || liveRect.height <= 0;

    return (
      <div
        className={`df-review-section-outline-item is-depth-${entry.depth}`}
        key={entry.id}
      >
        <div
          className="df-review-section-outline-entry-body"
          onMouseEnter={() => onHoverElement(entry.element)}
          onMouseLeave={onClearHover}
          onMouseOver={() => onHoverElement(entry.element)}
          onMouseOut={(event) => {
            if (
              event.relatedTarget instanceof Node &&
              event.currentTarget.contains(event.relatedTarget)
            ) {
              return;
            }
            onClearHover();
          }}
          onPointerEnter={() => onHoverElement(entry.element)}
          onPointerLeave={onClearHover}
        >
          <div
            className="df-review-section-outline-row"
            style={{ paddingLeft: '6px' }}
          >
            {hasChildren ? (
              <button
                aria-label={
                  isCollapsed
                    ? `Expand ${entry.label}`
                    : `Collapse ${entry.label}`
                }
                aria-expanded={!isCollapsed}
                className={`df-review-section-outline-toggle${
                  isCollapsed ? ' is-collapsed' : ''
                }`}
                data-review-tooltip={isCollapsed ? 'Expand' : 'Collapse'}
                type="button"
                onClick={() => onToggleEntry(entry.id)}
              >
                <ChevronDownIcon aria-hidden="true" />
              </button>
            ) : (
              <span
                aria-hidden="true"
                className="df-review-section-outline-toggle is-placeholder"
              />
            )}
            <button
              className="df-review-section-outline-name"
              title={entry.filePath}
              type="button"
              onClick={() => onScrollToSection(entry)}
            >
              <span>{entry.label}</span>
              <small>{entry.filePath}</small>
            </button>
            <span className="df-review-section-outline-links">
              <button
                aria-label={`Open ${entry.label} data`}
                className="df-review-section-outline-link"
                data-review-tooltip="Open data"
                title="Open data"
                type="button"
                disabled={!entry.data?.file}
                onClick={() => onOpenData(entry)}
              >
                <DatabaseIcon aria-hidden="true" />
              </button>
              <button
                aria-label={`Open ${entry.label} source`}
                className="df-review-section-outline-link"
                data-review-tooltip="Open source"
                title="Open source"
                type="button"
                disabled={!entry.source?.file}
                onClick={() => onOpenSource(entry)}
              >
                <Code2Icon aria-hidden="true" />
              </button>
              <button
                aria-label={`Open ${entry.label} usage`}
                className="df-review-section-outline-link"
                data-review-tooltip="Open parent usage"
                title="Open parent usage"
                type="button"
                disabled={!entry.metadata.usage?.source.file}
                onClick={() => onOpenUsageSource(entry)}
              >
                <UsageIcon aria-hidden="true" />
              </button>
              <span
                aria-hidden="true"
                className="df-review-section-outline-divider"
              >
                |
              </span>
              <button
                aria-label={`Start DOM QA for ${entry.label}`}
                className="df-review-section-outline-link is-dom-select"
                data-review-tooltip={isZeroArea ? 'No visible area' : 'DOM select'}
                title={isZeroArea ? 'No visible area' : 'DOM select'}
                type="button"
                disabled={!canWriteDom || isZeroArea}
                onClick={() => onStartDomReview(entry)}
              >
                <SquareMousePointerIcon aria-hidden="true" />
              </button>
            </span>
          </div>
          {renderMeta(entry)}
        </div>
        {hasChildren && !isCollapsed && (
          <div className="df-review-section-outline-children">
            {entry.children.map(renderEntry)}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside
      className="df-review-source-tree-panel"
      aria-hidden={!isPanelVisible}
    >
      <div id="df-review-section-outline" className="df-review-section-outline">
        <div className="df-review-section-outline-head">
          <div className="df-review-section-outline-summary">
            <span>
              <strong>Component</strong>
              <small>
                {isFiltering
                  ? `${filteredCount} / ${totalCount} results`
                  : `${rootCount} ${rootCount === 1 ? 'root' : 'roots'}`}
              </small>
            </span>
            <div className="df-review-section-outline-meta-controls">
              <button
                aria-label="Toggle source tree box metadata"
                aria-pressed={isBoxMetaVisible}
                className={`df-review-section-outline-meta-toggle${
                  isBoxMetaVisible ? ' is-active' : ''
                }`}
                data-review-tooltip="Box metrics"
                title="top / left / width / height"
                type="button"
                onClick={() => onToggleMeta('box')}
              >
                <SquareDashedIcon aria-hidden="true" />
              </button>
              <button
                aria-label="Toggle source tree font metadata"
                aria-pressed={isFontMetaVisible}
                className={`df-review-section-outline-meta-toggle${
                  isFontMetaVisible ? ' is-active' : ''
                }`}
                data-review-tooltip="Font metadata"
                title="font size / weight"
                type="button"
                onClick={() => onToggleMeta('font')}
              >
                <TypeIcon aria-hidden="true" />
              </button>
              <button
                aria-label="Toggle source tree media metadata"
                aria-pressed={isMediaMetaVisible}
                className={`df-review-section-outline-meta-toggle${
                  isMediaMetaVisible ? ' is-active' : ''
                }`}
                data-review-tooltip="Media URLs"
                title="media urls"
                type="button"
                onClick={() => onToggleMeta('media')}
              >
                <ImageIcon aria-hidden="true" />
              </button>
              <button
                aria-label="Toggle source tree class metadata"
                aria-pressed={isClassMetaVisible}
                className={`df-review-section-outline-meta-toggle${
                  isClassMetaVisible ? ' is-active' : ''
                }`}
                data-review-tooltip="Class names"
                title="class names"
                type="button"
                onClick={() => onToggleMeta('className')}
              >
                <Code2Icon aria-hidden="true" />
              </button>
            </div>
          </div>
          <div className="df-review-section-outline-filter">
            <SearchIcon aria-hidden="true" />
            <input
              aria-label="Filter source tree"
              type="text"
              value={filter}
              placeholder="Filter"
              autoComplete="off"
              enterKeyHint="search"
              spellCheck={false}
              onChange={(event) => onFilterChange(event.currentTarget.value)}
            />
            {filter && (
              <button
                aria-label="Clear source tree filter"
                className="df-review-section-outline-filter-clear"
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => onFilterChange('')}
              >
                <XIcon aria-hidden="true" />
              </button>
            )}
          </div>
        </div>
        {entries.length > 0 ? (
          <div className="df-review-section-outline-list">
            {entries.map(renderEntry)}
          </div>
        ) : (
          <div className="df-review-section-outline-empty">
            {isFiltering ? 'No source matches' : 'No sections found'}
          </div>
        )}
      </div>
    </aside>
  );
};

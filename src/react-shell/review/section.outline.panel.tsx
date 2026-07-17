import React from 'react';
import {
  ChevronDown as ChevronDownIcon,
  Code2 as Code2Icon,
  CornerUpRight as UsageIcon,
  Database as DatabaseIcon,
  Image as ImageIcon,
  Move as MoveIcon,
  RotateCcw as ResetIcon,
  Search as SearchIcon,
  SquareMousePointer as SquareMousePointerIcon,
  Type as TypeIcon,
  X as XIcon,
} from 'lucide-react';
import type { SectionOutlineEntry } from '../section.outline';
import type { StoredSourceTreeMetaVisibility } from '../settings';

type SourceTreeMetaVisibilityKey = keyof StoredSourceTreeMetaVisibility;
type DomAdjustmentPosition = {
  x: number;
  y: number;
};

const ENTRY_ACTION_SELECTOR =
  'a, button, input, select, textarea, [role="button"]';

type SectionOutlinePanelProps = {
  isPanelVisible: boolean;
  isFiltering: boolean;
  filteredCount: number;
  totalCount: number;
  rootCount: number;
  filter: string;
  entries: SectionOutlineEntry[];
  collapsedIds: Set<string>;
  selectedEntryId: string | null;
  activeDomAdjustmentEntryId: string | null;
  domAdjustmentByEntryId: Record<string, DomAdjustmentPosition>;
  canWriteDom: boolean;
  isFontMetaVisible: boolean;
  isMediaMetaVisible: boolean;
  isClassMetaVisible: boolean;
  onToggleMeta: (key: SourceTreeMetaVisibilityKey) => void;
  onFilterChange: (value: string) => void;
  onToggleEntry: (entryId: string) => void;
  onSelectEntry: (entry: SectionOutlineEntry) => void;
  onClearSelection: () => void;
  onClearDomAdjustment: (entry: SectionOutlineEntry) => void;
  onStartDomAdjustment: (entry: SectionOutlineEntry) => void;
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
  selectedEntryId,
  activeDomAdjustmentEntryId,
  domAdjustmentByEntryId,
  canWriteDom,
  isFontMetaVisible,
  isMediaMetaVisible,
  isClassMetaVisible,
  onToggleMeta,
  onFilterChange,
  onToggleEntry,
  onSelectEntry,
  onClearSelection,
  onClearDomAdjustment,
  onStartDomAdjustment,
  onOpenData,
  onOpenSource,
  onOpenUsageSource,
  onStartDomReview,
  onHoverElement,
  onClearHover,
}: SectionOutlinePanelProps) => {
  const selectedEntryRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    selectedEntryRef.current?.scrollIntoView({
      block: 'center',
      inline: 'nearest',
    });
  }, [selectedEntryId]);

  const renderMeta = (entry: SectionOutlineEntry) => {
    const { metadata } = entry;
    const rows: React.ReactNode[] = [];
    const metaPaddingLeft = 29;

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

    if (entry.filePath) {
      rows.push(
        <span
          className="df-review-section-outline-meta-row is-source"
          key="source"
        >
          <b>src</b>
          {entry.source?.file ? (
            <button
              className="df-review-section-outline-source-link"
              type="button"
              title={`Open ${entry.filePath}`}
              onClick={() => onOpenSource(entry)}
            >
              <code>{entry.filePath}</code>
            </button>
          ) : (
            <code>{entry.filePath}</code>
          )}
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
            title={`Open ${metadata.usage.filePath}${usagePosition}`}
            onClick={() => onOpenUsageSource(entry)}
          >
            <code>
              {metadata.usage.filePath}
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
    const isSelected = selectedEntryId === entry.id;
    const isDomAdjusting = activeDomAdjustmentEntryId === entry.id;
    const hasDomAdjustment = Object.prototype.hasOwnProperty.call(
      domAdjustmentByEntryId,
      entry.id
    );
    const domAdjustmentPosition = domAdjustmentByEntryId[entry.id] ?? {
      x: 0,
      y: 0,
    };
    const shouldShowDomAdjustment = isDomAdjusting || hasDomAdjustment;

    return (
      <div
        className={`df-review-section-outline-item is-depth-${entry.depth}`}
        key={entry.id}
      >
        <div
          className={`df-review-section-outline-entry-body${
            isSelected ? ' is-selected' : ''
          }`}
          onClick={(event) => {
            if (
              event.target instanceof Element &&
              event.target.closest(ENTRY_ACTION_SELECTOR)
            ) {
              return;
            }
            event.currentTarget
              .querySelector<HTMLButtonElement>(
                '.df-review-section-outline-name'
              )
              ?.focus();
            onSelectEntry(entry);
          }}
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
            ref={isSelected ? selectedEntryRef : undefined}
            className={`df-review-section-outline-row${
              isSelected ? ' is-selected' : ''
            }`}
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
            <div className="df-review-section-outline-main">
              <div className="df-review-section-outline-title">
                <button
                  className="df-review-section-outline-name"
                  title={entry.filePath}
                  type="button"
                  onClick={() => onSelectEntry(entry)}
                >
                  <span>{entry.label}</span>
                </button>
              </div>
              <div className="df-review-section-outline-actions">
                <span className="df-review-section-outline-action-group is-left">
                  <button
                    aria-label={`Move ${entry.label} DOM`}
                    className={`df-review-section-outline-link is-dom-adjust${
                      isDomAdjusting ? ' is-active' : ''
                    }`}
                    data-review-tooltip={
                      isDomAdjusting ? 'Moving DOM' : 'Move DOM'
                    }
                    title={isDomAdjusting ? 'Moving DOM' : 'Move DOM'}
                    type="button"
                    disabled={!canWriteDom}
                    onClick={() => onStartDomAdjustment(entry)}
                  >
                    <MoveIcon aria-hidden="true" />
                  </button>
                  {shouldShowDomAdjustment ? (
                    <span
                      className="df-review-section-outline-adjust-status"
                      aria-label={`DOM adjustment position x ${domAdjustmentPosition.x}, y ${domAdjustmentPosition.y}`}
                    >
                      <code>{domAdjustmentPosition.x}</code>
                      <span aria-hidden="true">:</span>
                      <code>{domAdjustmentPosition.y}</code>
                    </span>
                  ) : null}
                  {shouldShowDomAdjustment ? (
                    <button
                      aria-label={`Clear ${entry.label} DOM adjustment`}
                      className="df-review-section-outline-link is-dom-reset"
                      data-review-tooltip="Clear move"
                      title="Clear move"
                      type="button"
                      onClick={() => onClearDomAdjustment(entry)}
                    >
                      <ResetIcon aria-hidden="true" />
                    </button>
                  ) : null}
                </span>
                <span className="df-review-section-outline-action-group is-right">
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
                    data-review-tooltip="DOM QA"
                    title="DOM QA"
                    type="button"
                    disabled={!canWriteDom}
                    onClick={() => onStartDomReview(entry)}
                  >
                    <SquareMousePointerIcon aria-hidden="true" />
                  </button>
                </span>
              </div>
            </div>
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
          <div
            className="df-review-section-outline-list"
            onPointerDown={(event) => {
              if (
                event.target instanceof Element &&
                !event.target.closest('.df-review-section-outline-entry-body')
              ) {
                onClearSelection();
              }
            }}
          >
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

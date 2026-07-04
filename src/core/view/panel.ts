// 코어 단독 사용 시 노출되는 내장 사이드 패널 (React 셸 모드에서는 비활성).
// 헤더/툴바/본문/아이템 리스트를 렌더링한다.
import type { NumberedReviewItem } from '../../types';
import { getRouteKey } from '../location';
import { formatItemMeta } from '../review/format';
import { getNumberedReviewItems } from '../review/scope';
import { isTitleFieldEnabled } from './form.widgets';
import type { WebReviewKitViewConfig } from './types';

/** Builds the whole built-in panel; area draft form is injected by the caller. */
export function createReviewPanel(
  config: WebReviewKitViewConfig,
  renderAreaForm: () => HTMLElement
) {
  const panel = document.createElement('div');
  panel.className = 'dfwr-panel';
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-label', 'Web review kit');

  panel.append(
    createHeader(config),
    createToolbar(config),
    createBody(config, renderAreaForm),
    createList(config)
  );

  return panel;
}

function createHeader(config: WebReviewKitViewConfig) {
  const header = document.createElement('div');
  header.className = 'dfwr-header';

  const title = document.createElement('div');
  title.className = 'dfwr-title';
  title.textContent = 'Review Kit';

  const meta = document.createElement('div');
  meta.className = 'dfwr-meta';
  meta.textContent = getRouteKey(config.getEnvironment());

  const titleGroup = document.createElement('div');
  titleGroup.append(title, meta);

  const close = document.createElement('button');
  close.className = 'dfwr-icon-button';
  close.type = 'button';
  close.textContent = 'x';
  close.setAttribute('aria-label', 'Close');
  close.addEventListener('click', () => config.actions.close());

  header.append(titleGroup, close);
  return header;
}

function createToolbar(config: WebReviewKitViewConfig) {
  const state = config.getState();
  const toolbar = document.createElement('div');
  toolbar.className = 'dfwr-toolbar';

  // 모드 버튼은 토글: 같은 모드를 다시 누르면 idle 로 돌아간다.
  const toggleMode = (target: 'element' | 'area') => {
    const mode = config.getState().mode;
    config.actions.setModeState(mode === target ? 'idle' : target);
    config.actions.clearDrafts();
    config.actions.render();
  };

  toolbar.append(
    createToolbarButton('Element', state.mode === 'element', () =>
      toggleMode('element')
    ),
    createToolbarButton(
      state.isSelectingArea ? 'Selecting' : 'Area',
      state.mode === 'area',
      () => toggleMode('area')
    ),
    createToolbarButton('Refresh', false, () => {
      void config.actions.reload();
    })
  );

  return toolbar;
}

function createToolbarButton(
  label: string,
  active: boolean,
  onClick: () => void
) {
  const button = document.createElement('button');
  button.className = `dfwr-button${active ? ' is-active' : ''}`;
  button.type = 'button';
  button.textContent = label;
  button.addEventListener('click', onClick);
  return button;
}

function createBody(
  config: WebReviewKitViewConfig,
  renderAreaForm: () => HTMLElement
) {
  const body = document.createElement('div');
  body.className = 'dfwr-body';
  const state = config.getState();

  if (state.mode === 'idle') {
    body.append(
      createEmptyText('Select an element or mark an area.')
    );
    return body;
  }

  if (state.mode === 'element') {
    // element 모드의 작성 폼은 페이지 위 popover 로 뜨므로 안내문만 표시.
    body.append(
      createEmptyText(
        state.domDraft
          ? 'Write the QA in the page box.'
          : 'Click an element to add QA.'
      )
    );
    return body;
  }

  body.append(renderAreaForm());
  return body;
}

function createEmptyText(text: string) {
  const empty = document.createElement('p');
  empty.className = 'dfwr-empty';
  empty.textContent = text;
  return empty;
}

function createList(config: WebReviewKitViewConfig) {
  const section = document.createElement('div');
  section.className = 'dfwr-list';
  const state = config.getState();

  const heading = document.createElement('div');
  heading.className = 'dfwr-list-heading';
  heading.textContent = `Review items (${state.items.length})`;
  section.append(heading);

  if (state.items.length === 0) {
    section.append(createEmptyText('No review items on this page.'));
    return section;
  }

  for (const numberedItem of getNumberedReviewItems(
    state.items,
    config.options.viewports?.presets
  )) {
    section.append(createListItem(config, numberedItem));
  }

  return section;
}

function createListItem(
  config: WebReviewKitViewConfig,
  numberedItem: NumberedReviewItem
) {
  const { item } = numberedItem;
  const row = document.createElement('article');
  row.className = 'dfwr-item';
  row.tabIndex = 0;
  row.setAttribute('role', 'button');
  row.setAttribute(
    'aria-label',
    `Restore review item: ${item.title ?? item.comment}`
  );
  row.addEventListener('click', () => {
    void config.actions.restoreItem(item);
  });
  row.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;

    event.preventDefault();
    void config.actions.restoreItem(item);
  });

  const body = document.createElement('div');
  body.className = 'dfwr-item-body';

  const badges = document.createElement('div');
  badges.className = 'dfwr-item-badges';

  const scope = document.createElement('div');
  scope.className = `dfwr-item-scope is-scope-${numberedItem.scope}`;
  scope.textContent = numberedItem.displayLabel;

  const kind = document.createElement('div');
  kind.className = 'dfwr-item-kind';
  kind.textContent = item.kind;
  badges.append(scope, kind);

  const title = isTitleFieldEnabled(config.options) ? item.title?.trim() : '';
  const titleElement = title ? document.createElement('strong') : undefined;
  if (title && titleElement) {
    titleElement.className = 'dfwr-item-title';
    titleElement.textContent = title;
  }

  const comment = document.createElement('p');
  comment.className = `dfwr-item-comment${title ? '' : ' is-primary'}`;
  comment.textContent = item.comment;

  const date = document.createElement('time');
  date.className = 'dfwr-item-date';
  date.dateTime = item.createdAt;
  date.textContent = formatItemMeta(item);

  body.append(badges, ...(titleElement ? [titleElement] : []), comment, date);

  const actions = document.createElement('div');
  actions.className = 'dfwr-item-actions';
  // 삭제 버튼 클릭이 행 전체의 restore 클릭으로 전파되지 않게 차단.
  actions.addEventListener('click', (event) => event.stopPropagation());
  actions.addEventListener('keydown', (event) => event.stopPropagation());

  const remove = document.createElement('button');
  remove.className = 'dfwr-icon-button';
  remove.type = 'button';
  remove.textContent = 'x';
  remove.setAttribute('aria-label', 'Delete');
  remove.addEventListener('click', (event) => {
    event.stopPropagation();
    void config.actions
      .removeItem(item.id)
      .then(() => config.actions.reload());
  });

  actions.append(remove);
  row.append(body, actions);
  return row;
}

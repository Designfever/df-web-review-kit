// @vitest-environment jsdom

import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, describe, expect, it } from 'vitest';
import type { ReviewItem } from '../../types';
import { QaItemAssigneeActions } from './item.assignee.actions';

const item = {
  id: 'review-1',
  projectId: 'project-1',
  routeKey: '/',
  pageUrl: '/',
  normalizedPath: '/',
  kind: 'dom',
  comment: 'Check this',
  status: 'todo',
  viewport: { width: 1440, height: 900 },
  assigneeId: 'hyeji',
  assigneeName: '안혜지',
  assigneeIds: ['hyeji', 'hyungjoo'],
  assigneeNames: ['안혜지', '신형주'],
  createdAt: '2026-08-19T00:00:00.000Z',
  updatedAt: '2026-08-19T00:00:00.000Z',
} satisfies ReviewItem;

describe('QaItemAssigneeActions', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('renders a compact multiple-owner picker', () => {
    const html = renderToStaticMarkup(
      <QaItemAssigneeActions
        assigneeOptions={[
          { value: 'hyeji', label: '안혜지' },
          { value: 'hyungjoo', label: '신형주' },
        ]}
        assigneeTitle="담당자"
        canUpdateAssignee
        item={item}
        onChangeItemAssignee={async () => undefined}
      />
    );

    expect(html).toContain('안혜지, 신형주');
    expect(html.match(/type="checkbox"/g)).toHaveLength(2);
    expect(html.match(/checked=""/g)).toHaveLength(2);
    expect(html).toContain('>Apply</button>');
  });

  it('keeps earlier owners checked while selecting another owner', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    await act(async () => {
      root.render(
        <QaItemAssigneeActions
          assigneeOptions={[
            { value: 'hyeji', label: '안혜지' },
            { value: 'hyungjoo', label: '신형주' },
          ]}
          assigneeTitle="담당자"
          canUpdateAssignee
          item={{ ...item, assigneeId: null, assigneeName: undefined, assigneeIds: [] }}
          onChangeItemAssignee={async () => undefined}
        />
      );
    });

    const summary = container.querySelector('summary');
    const checkboxes = container.querySelectorAll<HTMLInputElement>(
      'input[type="checkbox"]'
    );
    await act(async () => summary?.click());
    await act(async () => checkboxes[0].click());
    await act(async () => checkboxes[1].click());

    expect(checkboxes[0].checked).toBe(true);
    expect(checkboxes[1].checked).toBe(true);

    await act(async () => root.unmount());
  });
});

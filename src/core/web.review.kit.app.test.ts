import { afterEach, describe, expect, it, vi } from 'vitest';
import type { ReviewItem, WebReviewKitAdapter } from '../types';
import { createWebReviewKit } from './web.review.kit.app';

describe('createWebReviewKit', () => {
  afterEach(() => {
    document.body.replaceChildren();
  });

  it('mounts the interaction layers in a fixed viewport host', () => {
    const controller = createWebReviewKit({ projectId: 'test-project' });
    const root = document.getElementById('df-web-review-kit-root');

    expect(root?.style.position).toBe('fixed');
    expect(root?.style.inset).toBe('0px');
    expect(root?.style.zIndex).toBe('2147483647');
    expect(root?.style.pointerEvents).toBe('none');
    expect(root?.style.display).not.toBe('contents');

    controller.destroy();
  });

  it('creates DOM QA with the selected status and multiple owners', async () => {
    const create = vi.fn(async (item: ReviewItem) => item);
    const adapter: WebReviewKitAdapter = {
      get: vi.fn(async () => null),
      list: vi.fn(async () => []),
      create,
      update: vi.fn(async (_id, patch) => patch as ReviewItem),
      remove: vi.fn(async () => undefined),
    };
    const element = document.createElement('button');
    document.body.append(element);
    vi.spyOn(element, 'getBoundingClientRect').mockReturnValue({
      bottom: 60,
      height: 40,
      left: 20,
      right: 140,
      top: 20,
      width: 120,
      x: 20,
      y: 20,
      toJSON: () => ({}),
    });
    const controller = createWebReviewKit({
      projectId: 'test-project',
      adapter,
      statusOptions: [
        { value: 'todo', label: 'Todo' },
        { value: 'review', label: 'Review' },
      ],
      assigneeTitle: 'Owner',
      assigneeOptions: [
        { value: 'one', label: 'One' },
        { value: 'two', label: 'Two' },
      ],
    });

    await controller.startElementReview(element, 'Check this');

    const shadow = document.getElementById('df-web-review-kit-root')?.shadowRoot;
    const status = shadow?.querySelector<HTMLSelectElement>(
      '.dfwr-status-select'
    );
    const owners = Array.from(
      shadow?.querySelectorAll<HTMLInputElement>(
        '.dfwr-assignee-option input'
      ) ?? []
    );
    expect(status?.value).toBe('todo');
    expect(owners).toHaveLength(2);

    if (!status) throw new Error('Status selector was not rendered.');
    status.value = 'review';
    status.dispatchEvent(new Event('change', { bubbles: true }));
    owners.forEach((owner) => {
      owner.checked = true;
      owner.dispatchEvent(new Event('change', { bubbles: true }));
    });
    shadow?.querySelector<HTMLButtonElement>('.dfwr-button.is-primary')?.click();

    await vi.waitFor(() => expect(create).toHaveBeenCalledOnce());
    expect(create.mock.calls[0]?.[0]).toMatchObject({
      status: 'review',
      assigneeId: 'one',
      assigneeName: 'One',
      assigneeIds: ['one', 'two'],
      assigneeNames: ['One', 'Two'],
    });

    controller.destroy();
  });
});

// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  DfSheetReviewSessionExpiredError,
  connectDfSheetReview,
} from './df-sheet';
import type { ReviewItem } from './types';

const projectId = 'f82b8ad5-7289-43d4-b175-bd5ecf1d4dba';
const sessionKey = `df-web-review-kit:df-sheet:session:${projectId}`;
const pendingKey = `df-web-review-kit:df-sheet:pending:${projectId}`;

const jsonResponse = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

describe('connectDfSheetReview', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
    window.history.replaceState(null, '', '/review');
  });

  it('reuses a short browser session and creates authenticated clients', async () => {
    window.sessionStorage.setItem(
      sessionKey,
      JSON.stringify({
        accessToken: 'short-token',
        expiresAt: Date.now() + 300_000,
        project: { id: projectId, key: 'IKAOS' },
        user: { user_id: 'hyungjoo', name: 'Hyung-Joo' },
      })
    );
    const remoteItem: ReviewItem = {
      id: 'df-sheet-issue-1',
      projectId,
      routeKey: '/story',
      pageUrl: '/story',
      normalizedPath: '/story',
      kind: 'dom',
      comment: '완료 상태 동기화',
      status: 'doing',
      viewport: { width: 390, height: 844 },
      createdAt: '2026-09-15T00:00:00.000Z',
      updatedAt: '2026-09-15T00:00:00.000Z',
    };
    const request = vi.fn<typeof fetch>(async (input, init) => {
      const url = String(input);
      expect(new Headers(init?.headers).get('Authorization')).toBe(
        'Bearer short-token'
      );
      if (url.endsWith('/api/review/pages')) {
        return jsonResponse({ success: true, data: [{ id: 'page-1', name: 'QA' }] });
      }
      if (url.endsWith('/api/review/assignees')) {
        return jsonResponse({
          success: true,
          data: [{ value: 'hyeji', label: '안혜지' }],
        });
      }
      if (url.includes('/api/review/items?')) {
        return jsonResponse({ success: true, data: [] });
      }
      if (url.endsWith('/api/review/issues/df-sheet-issue-1')) {
        expect(init?.method).toBe('PATCH');
        expect(JSON.parse(String(init?.body))).toEqual({
          patch: { status: 'done' },
        });
        return jsonResponse({
          success: true,
          data: { ...remoteItem, status: 'done' },
        });
      }
      if (url.includes('/api/review/figma-images?')) {
        return jsonResponse({ success: true, data: [] });
      }
      if (url.endsWith('/api/review/improvements')) {
        expect(init?.method).toBe('POST');
        expect(JSON.parse(String(init?.body))).toEqual({
          title: '검색 개선',
          content: '검색 결과를 더 빠르게 보고 싶습니다.',
          category: 'feature',
          area: 'projects',
          attachment_urls: ['https://asset.example/improvement.png'],
        });
        return jsonResponse({
          success: true,
          data: {
            id: 'improvement-1',
            title: '검색 개선',
            status: 'pending',
          },
        });
      }
      throw new Error(`Unexpected request: ${url}`);
    });

    const session = await connectDfSheetReview({
      projectId,
      baseUrl: 'https://sheet.example/',
      fetch: request,
    });

    expect(session?.user.user_id).toBe('hyungjoo');
    const adapter = session!.createAdapter({ pageId: 'page-1' });
    const logoutUrl = new URL(await session!.createLogoutUrl());
    expect(logoutUrl.origin).toBe('https://sheet.example');
    expect(logoutUrl.pathname).toBe('/api/auth/logout');

    const authorizePath = logoutUrl.searchParams.get('from');
    expect(authorizePath).toMatch(/^\/api\/review\/sso\/authorize\?/);
    const authorizeUrl = new URL(authorizePath!, logoutUrl.origin);
    expect(authorizeUrl.searchParams.get('project_id')).toBe(projectId);
    expect(authorizeUrl.searchParams.get('redirect_uri')).toBe(
      'http://localhost/review'
    );
    expect(authorizeUrl.searchParams.get('state')).toHaveLength(43);
    expect(authorizeUrl.searchParams.get('code_challenge')).toHaveLength(43);
    expect(window.sessionStorage.getItem(pendingKey)).not.toBeNull();
    await expect(session?.listPages()).resolves.toEqual([
      { id: 'page-1', name: 'QA' },
    ]);
    await expect(session?.listAssignees()).resolves.toEqual([
      { value: 'hyeji', label: '안혜지' },
    ]);
    await expect(
      adapter.list({
        projectId,
        routeKey: '/story',
      })
    ).resolves.toEqual([]);
    await expect(
      adapter.updateStatus?.({
        id: remoteItem.id,
        item: remoteItem,
        status: 'done',
        statusOption: { value: 'done', label: 'Done' },
        statusIndex: 4,
      })
    ).resolves.toEqual({ ...remoteItem, status: 'done' });
    await expect(
      adapter.createImprovement?.({
        title: '검색 개선',
        content: '검색 결과를 더 빠르게 보고 싶습니다.',
        category: 'feature',
        area: 'projects',
        attachmentUrls: ['https://asset.example/improvement.png'],
      })
    ).resolves.toEqual({
      id: 'improvement-1',
      title: '검색 개선',
      status: 'pending',
      url: 'https://sheet.example/improvements',
    });
    await expect(
      session?.figmaImageStore.listImages({
        type: 'route',
        projectId,
        pageUrl: '/story',
      })
    ).resolves.toEqual([]);

    session?.disconnect();
    expect(window.sessionStorage.getItem(sessionKey)).toBeNull();
  });

  it('exchanges a matching PKCE callback and removes the code from the URL', async () => {
    window.sessionStorage.setItem(
      pendingKey,
      JSON.stringify({
        state: 'a'.repeat(43),
        verifier: 'b'.repeat(43),
        redirectUri: 'https://review.example/review',
        returnSearch: '?item=12',
      })
    );
    window.history.replaceState(
      null,
      '',
      `/review?code=${'c'.repeat(43)}&state=${'a'.repeat(43)}`
    );
    const request = vi.fn<typeof fetch>(async (_input, init) => {
      expect(JSON.parse(String(init?.body))).toEqual({
        code: 'c'.repeat(43),
        redirect_uri: 'https://review.example/review',
        code_verifier: 'b'.repeat(43),
      });
      return jsonResponse({
        success: true,
        data: {
          access_token: 'new-token',
          token_type: 'Bearer',
          expires_in: 600,
          project: { id: projectId, key: 'IKAOS' },
          user: { user_id: 'hyungjoo', name: null },
        },
      });
    });

    const session = await connectDfSheetReview({
      projectId,
      baseUrl: 'https://sheet.example',
      fetch: request,
    });

    expect(session?.project.id).toBe(projectId);
    expect(window.location.search).toBe('?item=12');
    expect(window.sessionStorage.getItem(pendingKey)).toBeNull();
    expect(window.sessionStorage.getItem(sessionKey)).toContain('new-token');
  });

  it('reports an expired authenticated request', async () => {
    window.sessionStorage.setItem(
      sessionKey,
      JSON.stringify({
        accessToken: 'expired-on-server',
        expiresAt: Date.now() + 300_000,
        project: { id: projectId, key: 'IKAOS' },
        user: { user_id: 'hyungjoo', name: null },
      })
    );
    const session = await connectDfSheetReview({
      projectId,
      fetch: vi.fn(async () =>
        jsonResponse({ success: false, message: 'expired' }, 401)
      ),
    });

    await expect(session?.listPages()).rejects.toBeInstanceOf(
      DfSheetReviewSessionExpiredError
    );
  });

  it.each(['page-1', 'other-project-page', null])('validates the selected callback page: %s', async (pageId) => {
    window.sessionStorage.setItem(pendingKey, JSON.stringify({
      state: 'a'.repeat(43), verifier: 'b'.repeat(43),
      redirectUri: 'http://localhost/review',
      returnSearch: '?target=%2Fsample%2F&w=390&h=844', selectPage: true,
    }));
    const query = new URLSearchParams({ code: 'c'.repeat(43), state: 'a'.repeat(43) });
    if (pageId) query.set('review_page_id', pageId);
    window.history.replaceState(null, '', `/review?${query}`);
    const request = vi.fn<typeof fetch>(async (input, init) => {
      if (String(input).endsWith('/api/review/pages')) {
        expect(new Headers(init?.headers).get('Authorization')).toBe('Bearer new-token');
        return jsonResponse({ success: true, data: [{ id: 'page-1', name: 'QA' }] });
      }
      return jsonResponse({ success: true, data: {
        access_token: 'new-token', expires_in: 600,
        project: { id: projectId, key: 'LEXUS' }, user: { user_id: 'reviewer', name: null },
      } });
    });
    const connecting = connectDfSheetReview({ projectId, selectPage: true, fetch: request });
    if (pageId !== 'page-1') {
      await expect(connecting).rejects.toThrow('valid review page');
      expect(window.sessionStorage.getItem(sessionKey)).toBeNull();
      expect(window.sessionStorage.getItem(pendingKey)).toBeNull();
      expect(window.location.search).toBe('?target=%2Fsample%2F&w=390&h=844');
      return;
    }
    const session = await connecting;
    expect(session?.selectedPageId).toBe('page-1');
    expect(window.location.search).toBe('?target=%2Fsample%2F&w=390&h=844');
    const cached = await connectDfSheetReview({ projectId, selectPage: true, fetch: request });
    expect(cached?.selectedPageId).toBe('page-1');
    expect(request).toHaveBeenCalledTimes(2);
    const logout = new URL(await cached!.createLogoutUrl());
    const authorize = new URL(logout.searchParams.get('from')!, logout.origin);
    expect(authorize.searchParams.get('select_page')).toBe('1');
  });

  it('starts page selection when a cached Figma-only session has no page', async () => {
    window.sessionStorage.setItem(sessionKey, JSON.stringify({
      accessToken: 'figma-token', expiresAt: Date.now() + 300_000,
      project: { id: projectId, key: 'LEXUS' }, user: { user_id: 'reviewer', name: null },
    }));
    await expect(connectDfSheetReview({ projectId, selectPage: true })).resolves.toBeNull();
    expect(JSON.parse(window.sessionStorage.getItem(pendingKey)!)).toMatchObject({ selectPage: true });
  });

  it('does not send a legacy browser Figma token for links or files', async () => {
    window.localStorage.setItem('figma-token', 'legacy-token');
    window.sessionStorage.setItem(
      sessionKey,
      JSON.stringify({
        accessToken: 'short-token',
        expiresAt: Date.now() + 300_000,
        project: { id: projectId, key: 'IKAOS' },
        user: { user_id: 'hyungjoo', name: 'Hyung-Joo' },
      })
    );
    const request = vi.fn<typeof fetch>(async (_input, init) => {
      const headers = new Headers(init?.headers);
      expect(headers.get('Authorization')).toBe('Bearer short-token');
      expect(headers.has('X-Figma-Token')).toBe(false);
      return jsonResponse({ success: true, data: { id: 'figma-1' } });
    });
    const session = await connectDfSheetReview({
      projectId,
      baseUrl: 'https://sheet.example',
      fetch: request,
    });

    await session?.figmaImageStore.addImage({
      target: { type: 'route', projectId, pageUrl: '/story' },
      figmaUrl: 'https://www.figma.com/design/FILE/Example?node-id=1-2',
    });
    await session?.figmaImageStore.addImage({
      target: { type: 'route', projectId, pageUrl: '/story' },
      figmaUrl: 'dropped-image.png',
      asset: {
        dataUrl: 'data:image/png;base64,aW1hZ2U=',
        imageFormat: 'png',
        mimeType: 'image/png',
      },
    });
    expect(request).toHaveBeenCalledTimes(2);
  });
});

// Public-entry regressions: no real authentication or network writes.
describe('df-sheet session and adapter boundaries', () => {
  const stored = (expiresAt = Date.now() + 300_000) => ({
    accessToken: 'mock-token', expiresAt,
    project: { id: projectId, key: 'IKAOS' },
    user: { user_id: 'reviewer', name: null },
  });
  beforeEach(() => {
    window.sessionStorage.clear();
    window.history.replaceState(null, '', '/review');
  });
  const callback = () => {
    window.sessionStorage.setItem(pendingKey, JSON.stringify({
      state: 'valid-state', verifier: 'mock-verifier',
      redirectUri: 'http://localhost/review', returnSearch: '?target=%2Fstory',
    }));
    window.history.replaceState(null, '', '/review?code=mock-code&state=valid-state#details');
  };

  it.each([30_000, 30_001])('preserves the cached-session skew boundary at %i ms', async (remaining) => {
    const now = Date.now();
    vi.spyOn(Date, 'now').mockReturnValue(now);
    callback();
    window.sessionStorage.setItem(sessionKey, JSON.stringify(stored(now + remaining)));
    const request = vi.fn<typeof fetch>(async () => jsonResponse({ success: true, data: {
      access_token: 'exchanged-token', expires_in: 600,
      project: stored().project, user: stored().user,
    } }));
    const session = await connectDfSheetReview({ projectId, fetch: request });
    if (remaining === 30_000) {
      expect(request).toHaveBeenCalledTimes(1);
      expect(session?.expiresAt).toBe(now + 600_000);
      expect(window.location.search + window.location.hash).toBe('?target=%2Fstory#details');
    } else {
      expect(request).not.toHaveBeenCalled();
      expect(session?.expiresAt).toBe(now + remaining);
    }
  });

  it('rejects mismatched state before fetching and a different token project before storing', async () => {
    callback();
    window.history.replaceState(null, '', '/review?code=mock-code&state=wrong');
    const request = vi.fn<typeof fetch>(async () => jsonResponse({ success: true, data: {
      access_token: 'wrong-project-token', expires_in: 600,
      project: { id: 'other', key: 'OTHER' }, user: stored().user,
    } }));
    await expect(connectDfSheetReview({ projectId, fetch: request })).rejects.toThrow('state is invalid');
    expect(request).not.toHaveBeenCalled();
    callback();
    await expect(connectDfSheetReview({ projectId, fetch: request })).rejects.toThrow('different review project');
    expect(window.sessionStorage.getItem(sessionKey)).toBeNull();
    expect(window.sessionStorage.getItem(pendingKey)).not.toBeNull();
    expect(window.location.search).toContain('code=');
  });

  it('derives the logout PKCE challenge from the stored verifier without disconnecting', async () => {
    window.sessionStorage.setItem(sessionKey, JSON.stringify(stored()));
    const request = vi.fn<typeof fetch>();
    const session = await connectDfSheetReview({ projectId, fetch: request });
    const logout = new URL(await session!.createLogoutUrl());
    const authorize = new URL(logout.searchParams.get('from')!, logout.origin);
    const pending = JSON.parse(window.sessionStorage.getItem(pendingKey)!);
    const digest = await window.crypto.subtle.digest('SHA-256', new TextEncoder().encode(pending.verifier));
    const challenge = btoa(String.fromCharCode(...new Uint8Array(digest)))
      .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    expect(authorize.searchParams.get('code_challenge')).toBe(challenge);
    expect(authorize.searchParams.get('state')).toBe(pending.state);
    expect(window.sessionStorage.getItem(sessionKey)).not.toBeNull();
    expect(request).not.toHaveBeenCalled();
  });

  it('keeps HTTP error precedence and the exported authenticated-401 error identity', async () => {
    window.sessionStorage.setItem(sessionKey, JSON.stringify(stored()));
    const request = vi.fn<typeof fetch>()
      .mockResolvedValueOnce(jsonResponse({ success: false, message: 'message-first', error: 'secondary' }, 400))
      .mockResolvedValueOnce(jsonResponse({ success: false, error: 'error-only' }, 403))
      .mockResolvedValueOnce(new Response('not-json', { status: 502 }))
      .mockResolvedValueOnce(jsonResponse({ success: false }, 401));
    const session = await connectDfSheetReview({ projectId, fetch: request });
    await expect(session!.listPages()).rejects.toThrow('message-first');
    await expect(session!.listPages()).rejects.toThrow('error-only');
    await expect(session!.listPages()).rejects.toThrow('df-sheet request failed (502 /api/review/pages).');
    await expect(session!.listPages()).rejects.toBeInstanceOf(DfSheetReviewSessionExpiredError);
  });

  it('preserves multipart fields without a JSON content type', async () => {
    window.sessionStorage.setItem(sessionKey, JSON.stringify(stored()));
    const request = vi.fn<typeof fetch>(async (url, init) => {
      expect(String(url)).toBe('https://sheet.example/api/review/attachments');
      const headers = new Headers(init?.headers);
      expect(headers.get('Authorization')).toBe('Bearer mock-token');
      expect(headers.get('Accept')).toBe('application/json');
      expect(headers.has('Content-Type')).toBe(false);
      const form = init!.body as FormData;
      expect(form.get('name')).toBe('capture.png');
      expect(form.get('mime')).toBe('image/png');
      expect(form.get('kind')).toBe('capture');
      expect(form.get('item_id')).toBe('item-1');
      expect(form.get('metadata')).toBe('{"origin":"mock"}');
      expect((form.get('file') as File).size).toBe(3);
      return jsonResponse({ success: true, data: { id: 'asset-1', url: '/asset.png' } });
    });
    const session = await connectDfSheetReview({ projectId, baseUrl: 'https://sheet.example///', fetch: request });
    const adapter = session!.createAdapter({ pageId: 'page-1' });
    await expect(adapter.uploadAttachment!({
      file: new File(['png'], 'capture.png', { type: 'image/png' }), kind: 'capture',
      item: { id: 'item-1' } as import('./types').ReviewItem, metadata: { origin: 'mock' },
    })).resolves.toEqual({ id: 'asset-1', url: '/asset.png' });
  });

  it('shares in-flight lists, resolves external IDs, and retries after a rejected list', async () => {
    window.sessionStorage.setItem(sessionKey, JSON.stringify(stored()));
    let resolve!: (response: Response) => void;
    const request = vi.fn<typeof fetch>()
      .mockImplementationOnce(() => new Promise<Response>((done) => { resolve = done; }))
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce(jsonResponse({ success: true, data: [] }));
    const session = await connectDfSheetReview({ projectId, fetch: request });
    const adapter = session!.createAdapter({ pageId: 'page-1' });
    const first = adapter.list({ projectId, routeKey: '/story', normalizedPath: '/ignored' });
    const second = adapter.list({ projectId, normalizedPath: '/story' });
    expect(first).toBe(second);
    const found = adapter.get!('external-1');
    resolve(jsonResponse({ success: true, data: [{ id: 'item-1', externalIssueId: 'external-1' }] }));
    await first;
    await expect(found).resolves.toMatchObject({ id: 'item-1' });
    expect(request).toHaveBeenCalledTimes(1);
    expect(String(request.mock.calls[0][0])).toContain('page_id=page-1&route_key=%2Fstory');
    await expect(adapter.list({ projectId })).rejects.toThrow('offline');
    await expect(adapter.list({ projectId })).resolves.toEqual([]);
    expect(request).toHaveBeenCalledTimes(3);
  });
});

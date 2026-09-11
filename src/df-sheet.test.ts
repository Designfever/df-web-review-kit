// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  DfSheetReviewSessionExpiredError,
  connectDfSheetReview,
} from './df-sheet';

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
      if (url.includes('/api/review/figma-images?')) {
        return jsonResponse({ success: true, data: [] });
      }
      throw new Error(`Unexpected request: ${url}`);
    });

    const session = await connectDfSheetReview({
      projectId,
      baseUrl: 'https://sheet.example/',
      fetch: request,
    });

    expect(session?.user.user_id).toBe('hyungjoo');
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
      session?.createAdapter({ pageId: 'page-1' }).list({
        projectId,
        routeKey: '/story',
      })
    ).resolves.toEqual([]);
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

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
    await expect(session?.listPages()).resolves.toEqual([
      { id: 'page-1', name: 'QA' },
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
});

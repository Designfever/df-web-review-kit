import { describe, expect, it } from 'vitest';
import type { IncomingMessage } from 'node:http';
import {
  DEFAULT_REVIEW_IMAGE_STORE_MAX_BODY_BYTES,
  ReviewImageStoreRequestError,
  assertTrustedReviewImageStoreRequest,
  isReviewImageStoreRequestError,
  readJsonRequestBody,
} from './figma-image-store.server';

// dev 서버 미들웨어 요청 검증(CSRF 방어) 테스트.
// IncomingMessage 전체 대신 검증에 필요한 필드만 채운 fake 를 쓴다.

function createRequest({
  method = 'POST',
  headers = {},
  body = '',
}: {
  method?: string;
  headers?: Record<string, string>;
  body?: string;
} = {}): IncomingMessage {
  const request = {
    method,
    headers,
    async *[Symbol.asyncIterator]() {
      if (body) yield Buffer.from(body);
    },
  };
  return request as unknown as IncomingMessage;
}

describe('assertTrustedReviewImageStoreRequest', () => {
  it('allows requests without an Origin header (curl, scripts)', () => {
    expect(() =>
      assertTrustedReviewImageStoreRequest(createRequest())
    ).not.toThrow();
  });

  it('allows same-origin requests, including LAN IP hosts', () => {
    // 폰으로 LAN IP 접속해 테스트하는 케이스: Origin.host === Host 면 통과해야 한다.
    expect(() =>
      assertTrustedReviewImageStoreRequest(
        createRequest({
          headers: {
            origin: 'http://192.168.0.10:5173',
            host: '192.168.0.10:5173',
          },
        })
      )
    ).not.toThrow();
  });

  it('allows loopback origins even when accessed via another host alias', () => {
    expect(() =>
      assertTrustedReviewImageStoreRequest(
        createRequest({
          headers: { origin: 'http://localhost:5173', host: '127.0.0.1:5173' },
        })
      )
    ).not.toThrow();
  });

  it('rejects cross-origin browser requests with 403', () => {
    // CSRF 시나리오: 악성 페이지에서 브라우저가 붙인 Origin 은 host 와 다르다.
    const attempt = () =>
      assertTrustedReviewImageStoreRequest(
        createRequest({
          headers: { origin: 'https://evil.example', host: 'localhost:5173' },
        })
      );

    expect(attempt).toThrow(ReviewImageStoreRequestError);
    try {
      attempt();
    } catch (error) {
      expect(isReviewImageStoreRequestError(error)).toBe(true);
      if (isReviewImageStoreRequestError(error)) {
        expect(error.status).toBe(403);
      }
    }
  });

  it('rejects malformed Origin headers', () => {
    expect(() =>
      assertTrustedReviewImageStoreRequest(
        createRequest({
          headers: { origin: 'not a url', host: 'localhost:5173' },
        })
      )
    ).toThrow(ReviewImageStoreRequestError);
  });
});

describe('readJsonRequestBody', () => {
  it('parses JSON bodies with a json content type', async () => {
    const body = await readJsonRequestBody(
      createRequest({
        headers: { 'content-type': 'application/json; charset=utf-8' },
        body: '{"label":"hero"}',
      })
    );
    expect(body).toEqual({ label: 'hero' });
  });

  it('returns null for GET/DELETE and empty bodies', async () => {
    expect(await readJsonRequestBody(createRequest({ method: 'GET' }))).toBe(
      null
    );
    expect(await readJsonRequestBody(createRequest({ body: '' }))).toBe(null);
  });

  it('rejects non-JSON content types with 415', async () => {
    // CSRF 시나리오: text/plain simple POST 는 preflight 없이 도달하므로 여기서 거부.
    await expect(
      readJsonRequestBody(
        createRequest({
          headers: { 'content-type': 'text/plain' },
          body: '{"label":"hero"}',
        })
      )
    ).rejects.toMatchObject({ status: 415 });
  });

  it('rejects bodies over the size limit with 413', async () => {
    await expect(
      readJsonRequestBody(
        createRequest({
          headers: { 'content-type': 'application/json' },
          body: 'x'.repeat(64),
        }),
        32
      )
    ).rejects.toMatchObject({ status: 413 });
    expect(DEFAULT_REVIEW_IMAGE_STORE_MAX_BODY_BYTES).toBeGreaterThan(0);
  });

  it('rejects invalid JSON with 400 instead of a 500', async () => {
    await expect(
      readJsonRequestBody(
        createRequest({
          headers: { 'content-type': 'application/json' },
          body: '{nope',
        })
      )
    ).rejects.toMatchObject({ status: 400 });
  });
});

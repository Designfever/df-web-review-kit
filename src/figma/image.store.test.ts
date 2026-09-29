import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  createEndpointReviewFigmaImageStore,
  createReviewFigmaClientRenderedAsset,
} from './image.store';

const FIGMA_URL =
  'https://www.figma.com/design/FILE/Example?node-id=1-2';
const IMAGE_URL = 'https://example.com/render.png';

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('createReviewFigmaClientRenderedAsset', () => {
  it('aborts a timed out Figma API request', async () => {
    let requestSignal: AbortSignal | undefined;
    const request = ((_input: RequestInfo | URL, init?: RequestInit) =>
      new Promise<Response>((_resolve, reject) => {
        requestSignal = init?.signal ?? undefined;
        requestSignal?.addEventListener('abort', () => {
          reject(new DOMException('Aborted', 'AbortError'));
        });
      })) as typeof fetch;

    await expect(
      createReviewFigmaClientRenderedAsset({
        fetch: request,
        figmaUrl: FIGMA_URL,
        timeoutMs: 5,
        token: 'token',
      })
    ).rejects.toThrow('Figma API request timed out.');
    expect(requestSignal?.aborted).toBe(true);
  });

  it('aborts a timed out image download', async () => {
    let requestCount = 0;
    let downloadSignal: AbortSignal | undefined;
    const request = ((_input: RequestInfo | URL, init?: RequestInit) => {
      requestCount += 1;
      if (requestCount === 1) {
        return Promise.resolve(createFigmaApiResponse());
      }

      return new Promise<Response>((_resolve, reject) => {
        downloadSignal = init?.signal ?? undefined;
        downloadSignal?.addEventListener('abort', () => {
          reject(new DOMException('Aborted', 'AbortError'));
        });
      });
    }) as typeof fetch;

    await expect(
      createReviewFigmaClientRenderedAsset({
        fetch: request,
        figmaUrl: FIGMA_URL,
        timeoutMs: 5,
        token: 'token',
      })
    ).rejects.toThrow('Figma image download timed out.');
    expect(downloadSignal?.aborted).toBe(true);
  });

  it('stops image decoding when processing times out', async () => {
    vi.stubGlobal('Image', class {
      naturalWidth = 0;
      naturalHeight = 0;
      width = 0;
      height = 0;
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;
      set src(_value: string) {}
    });
    await expect(
      createReviewFigmaClientRenderedAsset({
        fetch: createSuccessfulFetch(),
        figmaUrl: FIGMA_URL,
        timeoutMs: 5,
        token: 'token',
      })
    ).rejects.toThrow('Figma image processing timed out.');
  });

  it('decodes the downloaded image only once', async () => {
    let imageCount = 0;
    vi.stubGlobal('Image', class {
      naturalWidth = 1920;
      naturalHeight = 11094;
      width = 1920;
      height = 11094;
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;

      constructor() {
        imageCount += 1;
      }

      set src(value: string) {
        if (value) queueMicrotask(() => this.onload?.());
      }
    });
    const createElement = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation((tagName) => {
      if (tagName !== 'canvas') return createElement(tagName);
      return {
        getContext: () => ({ drawImage: vi.fn() }),
        toBlob: (callback: BlobCallback) => {
          callback(new Blob(['webp'], { type: 'image/webp' }));
        },
      } as unknown as HTMLCanvasElement;
    });
    vi.stubGlobal('FileReader', class {
      result: string | ArrayBuffer | null = null;
      error: DOMException | null = null;
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;

      abort() {}

      readAsDataURL() {
        this.result = 'data:image/webp;base64,d2VicA==';
        queueMicrotask(() => this.onload?.());
      }
    });

    await expect(
      createReviewFigmaClientRenderedAsset({
        fetch: createSuccessfulFetch(),
        figmaUrl: FIGMA_URL,
        timeoutMs: 100,
        token: 'token',
      })
    ).resolves.toMatchObject({
      dataUrl: 'data:image/webp;base64,d2VicA==',
      height: 11094,
      imageFormat: 'webp',
      width: 1920,
    });
    expect(imageCount).toBe(1);
  });
});

describe('createEndpointReviewFigmaImageStore', () => {
  it('unwraps a df-sheet success envelope', async () => {
    const request = vi.fn(async () => ({
      ok: true,
      status: 200,
      text: async () => JSON.stringify({ success: true, data: [] }),
    } as Response));
    const store = createEndpointReviewFigmaImageStore({
      endpoint: 'https://df-sheet.example/api/review/figma-images',
      fetch: request as typeof fetch,
      headers: { Authorization: 'Bearer session' },
    });

    await expect(
      store.listImages({ type: 'route', projectId: 'project', pageUrl: '/' })
    ).resolves.toEqual([]);
    expect(request).toHaveBeenCalledWith(
      expect.stringContaining('?target='),
      expect.objectContaining({
        headers: expect.any(Headers),
      })
    );
  });

  it('keeps a small image on the JSON upload path', async () => {
    const request = vi.fn(async (_url: string, _init?: RequestInit) =>
      new Response(JSON.stringify({ success: true, data: { id: 'small' } }))
    );
    const store = createEndpointReviewFigmaImageStore({
      endpoint: 'https://df-sheet.example/api/review/figma-images',
      fetch: request as typeof fetch,
      directUpload: { maxInlineRequestBytes: 10_000 },
    });

    await store.addImage({
      target: { type: 'route', projectId: 'project', pageUrl: '/' },
      figmaUrl: 'small.png',
      asset: {
        dataUrl: 'data:image/png;base64,aW1hZ2U=',
        imageFormat: 'png',
        mimeType: 'image/png',
      },
    });

    expect(request).toHaveBeenCalledOnce();
    expect(JSON.parse(String(request.mock.calls[0]?.[1]?.body)).asset.dataUrl)
      .toBe('data:image/png;base64,aW1hZ2U=');
  });

  it('uploads a large image directly to R2 before registering it', async () => {
    const endpoint = 'https://df-sheet.example/api/review/figma-images';
    const request = vi.fn(async (url: string, init?: RequestInit) => {
      if (url === `${endpoint}/presign`) {
        expect(JSON.parse(String(init?.body))).toEqual({
          mimeType: 'image/png',
          byteSize: 5,
        });
        return new Response(JSON.stringify({
          success: true,
          data: {
            uploadId: 'upload-id',
            uploadUrl: 'https://r2.example/signed',
            uploadToken: 'upload-token',
          },
        }));
      }
      return new Response(JSON.stringify({
        success: true,
        data: { id: 'figma_upload-id' },
      }));
    });
    const upload = vi.fn(async () => new Response(null, { status: 200 }));
    const store = createEndpointReviewFigmaImageStore({
      endpoint,
      fetch: request as typeof fetch,
      headers: { Authorization: 'Bearer session' },
      directUpload: {
        maxInlineRequestBytes: 100,
        fetch: upload as typeof fetch,
      },
    });

    await expect(store.addImage({
      target: { type: 'route', projectId: 'project', pageUrl: '/' },
      figmaUrl: 'large.png',
      asset: {
        dataUrl: 'data:image/png;base64,aW1hZ2U=',
        imageFormat: 'png',
        mimeType: 'image/png',
      },
    })).resolves.toMatchObject({ id: 'figma_upload-id' });

    expect(upload).toHaveBeenCalledOnce();
    expect(upload).toHaveBeenCalledWith('https://r2.example/signed', {
      method: 'PUT',
      headers: { 'Content-Type': 'image/png' },
      body: expect.any(Blob),
    });
    expect(request).toHaveBeenCalledTimes(2);
    const finalRequest = request.mock.calls[1]?.[1];
    expect(JSON.parse(String(finalRequest?.body))).toMatchObject({
      directUpload: { uploadId: 'upload-id', uploadToken: 'upload-token' },
    });
    expect(String(finalRequest?.body)).not.toContain('data:image/png');
    expect(new Headers(finalRequest?.headers).get('Authorization'))
      .toBe('Bearer session');
  });
});

function createFigmaApiResponse() {
  return {
    json: () => Promise.resolve({ images: { '1:2': IMAGE_URL } }),
    ok: true,
    status: 200,
  } as Response;
}

function createSuccessfulFetch() {
  let requestCount = 0;
  return ((..._args: Parameters<typeof fetch>) => {
    requestCount += 1;
    if (requestCount === 1) {
      return Promise.resolve(createFigmaApiResponse());
    }
    return Promise.resolve({
      blob: () => Promise.resolve(new Blob(['png'], { type: 'image/png' })),
      ok: true,
      status: 200,
    } as Response);
  }) as typeof fetch;
}

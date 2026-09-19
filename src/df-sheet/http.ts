

type DfSheetEnvelope<T> = {
  success?: boolean;
  data?: T;
  message?: string;
  error?: string;
};

export class DfSheetReviewRequestError extends Error {
  readonly code?: string;
  readonly status: number;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = 'DfSheetReviewRequestError';
    this.status = status;
    this.code = code;
  }
}

export class DfSheetReviewSessionExpiredError extends Error {
  constructor() {
    super('Your df-sheet review session expired. Reload this page to sign in again.');
    this.name = 'DfSheetReviewSessionExpiredError';
  }
}

export async function requestDfSheet<T>(
  requestFetch: typeof fetch,
  baseUrl: string,
  path: string,
  accessToken?: string,
  init: RequestInit = {}
): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set('Accept', 'application/json');
  if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`);
  if (init.body && !(init.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  const response = await requestFetch(`${baseUrl}${path}`, { ...init, headers });
  const body = (await response.json().catch(() => null)) as DfSheetEnvelope<T> | null;
  if (response.status === 401 && accessToken) {
    throw new DfSheetReviewSessionExpiredError();
  }
  if (!response.ok || body?.success !== true || !('data' in body)) {
    throw new DfSheetReviewRequestError(
      body?.message || body?.error || `df-sheet request failed (${response.status} ${path}).`,
      response.status,
      normalizeErrorCode(body?.error)
    );
  }
  return body.data as T;
}

function normalizeErrorCode(value: string | undefined) {
  const normalized = value?.trim();
  return normalized && /^[a-zA-Z0-9._:-]+$/.test(normalized)
    ? normalized.slice(0, 80)
    : undefined;
}

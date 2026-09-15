

type DfSheetEnvelope<T> = {
  success?: boolean;
  data?: T;
  message?: string;
  error?: string;
};

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
    throw new Error(
      body?.message || body?.error || `df-sheet request failed (${response.status} ${path}).`
    );
  }
  return body.data as T;
}

export const DEFAULT_REVIEW_FIGMA_TOKEN_ENV_KEY = 'FIGMA_TOKEN';
export const REVIEW_FIGMA_TOKEN_MISSING_CODE = 'DFWR_FIGMA_TOKEN_MISSING';

export type ReviewFigmaTokenEnv = Record<
  string,
  string | null | undefined
>;

export type ReviewFigmaTokenOptions = {
  token?: string | null;
  env?: ReviewFigmaTokenEnv;
  envKey?: string;
  enabled?: boolean;
};

export class ReviewFigmaTokenError extends Error {
  readonly code = REVIEW_FIGMA_TOKEN_MISSING_CODE;
  readonly envKey: string;

  constructor(envKey = DEFAULT_REVIEW_FIGMA_TOKEN_ENV_KEY) {
    super(
      `Figma image rendering requires server env ${envKey}. Set ${envKey} in the dev/server environment; do not expose it as VITE_${envKey}.`
    );
    this.name = 'ReviewFigmaTokenError';
    this.envKey = envKey;
  }
}

export function readReviewFigmaToken(
  options: ReviewFigmaTokenOptions = {}
): string | null {
  if (options.enabled === false) return null;

  const envKey = options.envKey ?? DEFAULT_REVIEW_FIGMA_TOKEN_ENV_KEY;
  return normalizeReviewFigmaToken(options.token ?? options.env?.[envKey]);
}

export function requireReviewFigmaToken(
  options: ReviewFigmaTokenOptions = {}
): string {
  const envKey = options.envKey ?? DEFAULT_REVIEW_FIGMA_TOKEN_ENV_KEY;
  const token = readReviewFigmaToken(options);

  if (!token) throw new ReviewFigmaTokenError(envKey);
  return token;
}

export function isReviewFigmaTokenError(
  error: unknown
): error is ReviewFigmaTokenError {
  if (!error || typeof error !== 'object') return false;

  return (
    error instanceof ReviewFigmaTokenError ||
    ('code' in error && error.code === REVIEW_FIGMA_TOKEN_MISSING_CODE)
  );
}

function normalizeReviewFigmaToken(value: string | null | undefined) {
  if (typeof value !== 'string') return null;
  return value.trim() || null;
}

import packageJson from '../package.json';

export type ReviewAnalyticsConfig = {
  provider: 'amplitude';
  apiKey: string;
  sessionReplay?: {
    enabled?: boolean;
    maskInputs?: boolean;
    sampleRate?: number;
  };
};

type ReviewAnalyticsContext = {
  projectId: string;
  reviewerName?: string | null;
};

type ReviewAnalyticsEventProperties = {
  view: { panelId: string };
  click: { panelId: string; controlId: string; action: string };
  success: { action: string; panelId?: string };
  failure: {
    action: string;
    panelId?: string;
    errorCode?: string;
    status?: number;
  };
};

type ReviewAnalyticsClient = {
  track: (
    eventType: string,
    properties: Record<string, string | number>
  ) => unknown;
};

type ReviewAnalyticsState = {
  client: Promise<ReviewAnalyticsClient | null>;
  context: ReviewAnalyticsContext & { anonymousId: string };
  key: string;
};

const ANONYMOUS_ID_STORAGE_KEY =
  'df-web-review-kit:analytics:anonymous-id';

let state: ReviewAnalyticsState | null = null;

/** Starts analytics without delaying or blocking the review connection. */
export function configureReviewAnalytics(
  config: ReviewAnalyticsConfig | undefined,
  context: ReviewAnalyticsContext
) {
  if (
    typeof window === 'undefined' ||
    config?.provider !== 'amplitude' ||
    !config.apiKey.trim() ||
    !context.projectId.trim()
  ) {
    return;
  }

  const key = `${config.provider}:${config.apiKey.trim()}`;
  const analyticsContext = {
    projectId: context.projectId.trim(),
    reviewerName: context.reviewerName?.trim() || undefined,
    anonymousId: getOrCreateAnonymousId(),
  };
  if (state?.key === key) {
    state.context = analyticsContext;
    return;
  }

  const sampleRate = config.sessionReplay?.enabled === false
    ? 0
    : normalizeSampleRate(config.sessionReplay?.sampleRate);
  const maskInputs = config.sessionReplay?.maskInputs !== false;
  const client = import('@amplitude/unified')
    .then(async (amplitude) => {
      await amplitude.initAll(config.apiKey.trim(), {
        analytics: {
          autocapture: false,
          defaultTracking: false,
          deviceId: analyticsContext.anonymousId,
        },
        sessionReplay: {
          sampleRate,
          privacyConfig: {
            defaultMaskLevel: maskInputs ? 'medium' : 'light',
            maskSelector: [
              '[data-amplitude-mask]',
              '[data-sensitive]',
              '[data-secret]',
            ],
          },
          useWebWorker: true,
        },
      });
      return { track: amplitude.track } satisfies ReviewAnalyticsClient;
    })
    .catch(() => null);

  state = { client, context: analyticsContext, key };
}

/** Sends only the documented allowlisted properties and never throws. */
export function trackReviewEvent<T extends keyof ReviewAnalyticsEventProperties>(
  eventType: T,
  properties: ReviewAnalyticsEventProperties[T]
) {
  const current = state;
  if (!current) return;

  void current.client.then((client) => {
    if (!client || state?.key !== current.key) return;
    const common = {
      source: 'review-kit',
      project_id: current.context.projectId,
      package_version: packageJson.version,
      anonymous_id: current.context.anonymousId,
      ...(current.context.reviewerName
        ? { reviewer_name: current.context.reviewerName }
        : {}),
    };
    client.track(eventType, {
      ...common,
      ...toEventProperties(eventType, properties),
    });
  }).catch(() => {});
}

export function getReviewAnalyticsFailureProperties(error: unknown) {
  if (!error || typeof error !== 'object') return {};
  const source = error as {
    code?: unknown;
    name?: unknown;
    reason?: unknown;
    status?: unknown;
  };
  const errorCode = [source.code, source.reason, source.name]
    .find((value) => typeof value === 'string' && value.trim()) as
    | string
    | undefined;
  const status =
    typeof source.status === 'number' && Number.isFinite(source.status)
      ? source.status
      : undefined;
  return {
    ...(errorCode ? { errorCode: sanitizeIdentifier(errorCode) } : {}),
    ...(status !== undefined ? { status } : {}),
  };
}

function toEventProperties<T extends keyof ReviewAnalyticsEventProperties>(
  eventType: T,
  properties: ReviewAnalyticsEventProperties[T]
): Record<string, string | number> {
  switch (eventType) {
    case 'view': {
      const view = properties as ReviewAnalyticsEventProperties['view'];
      return { panel_id: sanitizeIdentifier(view.panelId) };
    }
    case 'click': {
      const click = properties as ReviewAnalyticsEventProperties['click'];
      return {
        panel_id: sanitizeIdentifier(click.panelId),
        control_id: sanitizeIdentifier(click.controlId),
        action: sanitizeIdentifier(click.action),
      };
    }
    case 'success': {
      const success = properties as ReviewAnalyticsEventProperties['success'];
      return {
        action: sanitizeIdentifier(success.action),
        ...(success.panelId
          ? { panel_id: sanitizeIdentifier(success.panelId) }
          : {}),
      };
    }
    case 'failure': {
      const failure = properties as ReviewAnalyticsEventProperties['failure'];
      return {
        action: sanitizeIdentifier(failure.action),
        ...(failure.panelId
          ? { panel_id: sanitizeIdentifier(failure.panelId) }
          : {}),
        ...(failure.errorCode
          ? { error_code: sanitizeIdentifier(failure.errorCode) }
          : {}),
        ...(failure.status !== undefined ? { status: failure.status } : {}),
      };
    }
  }
}

function getOrCreateAnonymousId() {
  try {
    const stored = window.localStorage.getItem(ANONYMOUS_ID_STORAGE_KEY)?.trim();
    if (stored) return stored;
    const created = createAnonymousId();
    window.localStorage.setItem(ANONYMOUS_ID_STORAGE_KEY, created);
    return created;
  } catch {
    return createAnonymousId();
  }
}

function createAnonymousId() {
  return globalThis.crypto?.randomUUID?.() ??
    `anonymous-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function normalizeSampleRate(value: number | undefined) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return 1;
  return Math.min(1, Math.max(0, value));
}

function sanitizeIdentifier(value: string) {
  return value.trim().replace(/[^a-zA-Z0-9._:-]+/g, '_').slice(0, 80);
}

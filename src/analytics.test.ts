// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from 'vitest';

const amplitude = vi.hoisted(() => ({
  initAll: vi.fn(async () => undefined),
  track: vi.fn(),
}));

vi.mock('@amplitude/unified', () => amplitude);

describe('review analytics', () => {
  beforeEach(() => {
    vi.resetModules();
    amplitude.initAll.mockReset().mockResolvedValue(undefined);
    amplitude.track.mockReset();
    window.localStorage.clear();
  });

  it('initializes Amplitude lazily and sends only allowlisted event properties', async () => {
    const { configureReviewAnalytics, trackReviewEvent } =
      await import('./analytics');

    configureReviewAnalytics(
      {
        provider: 'amplitude',
        apiKey: 'browser-project-key',
        sessionReplay: { enabled: true, maskInputs: true, sampleRate: 1 },
      },
      { projectId: 'project-1', pageName: 'Release test', creatorId: 'hyungjoo' }
    );
    trackReviewEvent('click', {
      panelId: 'qa panel',
      controlId: 'save button',
      action: 'save',
    });

    await vi.waitFor(() => expect(amplitude.track).toHaveBeenCalledOnce());
    expect(amplitude.initAll).toHaveBeenCalledWith(
      'browser-project-key',
      expect.objectContaining({
        analytics: expect.objectContaining({ autocapture: false }),
        sessionReplay: expect.objectContaining({
          sampleRate: 1,
          privacyConfig: expect.objectContaining({
            defaultMaskLevel: 'medium',
          }),
        }),
      })
    );
    expect(amplitude.track).toHaveBeenCalledWith('click', {
      source: 'review-kit',
      page_name: 'Release test',
      package_version: expect.any(String),
      anonymous_id: expect.any(String),
      creator_id: 'hyungjoo',
      panel_id: 'qa_panel',
      control_id: 'save_button',
      action: 'save',
    });
    expect(window.localStorage.getItem(
      'df-web-review-kit:analytics:anonymous-id'
    )).toEqual(expect.any(String));
  });

  it('keeps queued events on their original page and user when context changes', async () => {
    const { configureReviewAnalytics, trackReviewEvent } = await import('./analytics');
    const config = { provider: 'amplitude' as const, apiKey: 'browser-project-key' };
    configureReviewAnalytics(config, {
      projectId: 'project-1', pageName: 'First page', creatorId: 'first-user',
    });
    trackReviewEvent('view', { panelId: 'qa' });
    configureReviewAnalytics(config, {
      projectId: 'project-1', pageName: 'Second page', creatorId: 'second-user',
    });
    trackReviewEvent('view', { panelId: 'qa' });
    await vi.waitFor(() => expect(amplitude.track).toHaveBeenCalledTimes(2));
    expect(amplitude.track).toHaveBeenNthCalledWith(1, 'view', expect.objectContaining({
      page_name: 'First page', creator_id: 'first-user',
    }));
    expect(amplitude.track).toHaveBeenNthCalledWith(2, 'view', expect.objectContaining({
      page_name: 'Second page', creator_id: 'second-user',
    }));
    expect(amplitude.initAll).toHaveBeenCalledOnce();
  });

  it('stays disabled without config and fails safely when initialization rejects', async () => {
    const { configureReviewAnalytics, trackReviewEvent } =
      await import('./analytics');

    trackReviewEvent('view', { panelId: 'qa' });
    expect(amplitude.track).not.toHaveBeenCalled();

    amplitude.initAll.mockRejectedValueOnce(new Error('blocked'));
    configureReviewAnalytics(
      { provider: 'amplitude', apiKey: 'rejected-key' },
      { projectId: 'project-1', creatorId: 'hyungjoo' }
    );
    trackReviewEvent('success', { action: 'save' });
    await new Promise((resolve) => window.setTimeout(resolve, 0));
    expect(amplitude.track).not.toHaveBeenCalled();
  });

  it('extracts non-sensitive failure identifiers without error messages', async () => {
    const { getReviewAnalyticsFailureProperties } =
      await import('./analytics');

    expect(
      getReviewAnalyticsFailureProperties({
        code: 'HTTP 503 / private/path',
        message: 'contains a token',
        status: 503,
      })
    ).toEqual({ errorCode: 'HTTP_503_private_path', status: 503 });
    expect(getReviewAnalyticsFailureProperties('raw failure')).toEqual({});
  });
});
